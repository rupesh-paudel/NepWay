const Ride = require('../models/RideModel');

// Utility function to remove expired rides
const removeExpiredRides = async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Find rides that are past their date and time
    const expiredRides = await Ride.find({
      status: 'active',
      $or: [
        { date: { $lt: currentDate } }, // Past date
        { 
          date: currentDate,
          time: { $lt: currentTime } // Today but past time
        }
      ]
    });
    
    if (expiredRides.length > 0) {
      console.log(`Found ${expiredRides.length} expired rides, removing them...`);
      
      // Update status to 'expired' instead of deleting (for record keeping)
      await Ride.updateMany(
        {
          _id: { $in: expiredRides.map(ride => ride._id) }
        },
        { status: 'expired' }
      );
      
      console.log(`Successfully marked ${expiredRides.length} rides as expired`);
    }
  } catch (error) {
    console.error('Error removing expired rides:', error);
  }
};

// Run expired ride cleanup every 5 minutes
setInterval(removeExpiredRides, 5 * 60 * 1000);

// Also run once when server starts
removeExpiredRides();

// Get all available rides
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'active' })
      .populate('driver', 'name email')
      .sort({ date: 1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
};

// Create a new ride (drivers only)
exports.createRide = async (req, res) => {
  try {
    const { 
      from, 
      to, 
      fromCoordinates, 
      toCoordinates, 
      date, 
      time, 
      availableSeats, 
      pricePerSeat,
      description,
      vehicleInfo
    } = req.body;
    
    // Validate required fields
    if (!from || !to || !date || !time || !availableSeats || !pricePerSeat) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate user is a driver
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can create rides' });
    }
    
    console.log('Creating ride with data:', req.body);
    
    const rideData = {
      driver: req.user.id,
      from,
      to,
      date,
      time,
      availableSeats: parseInt(availableSeats),
      pricePerSeat: parseFloat(pricePerSeat),
      description
    };

    // Add coordinates if provided
    if (fromCoordinates) {
      rideData.fromCoordinates = fromCoordinates;
    }
    if (toCoordinates) {
      rideData.toCoordinates = toCoordinates;
    }
    if (vehicleInfo) {
      rideData.vehicleInfo = vehicleInfo;
    }
    
    const ride = new Ride(rideData);
    
    await ride.save();
    await ride.populate('driver', 'name email');
    
    console.log('Ride created successfully:', ride);
    res.status(201).json(ride);
  } catch (err) {
    console.error('Error creating ride:', err);
    res.status(400).json({ error: `Failed to create ride: ${err.message}` });
  }
};

// Book a ride (general users only)
exports.bookRide = async (req, res) => {
  try {
    // First check if user is trying to book their own ride
    const existingRide = await Ride.findById(req.params.id);
    
    if (!existingRide) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (existingRide.driver.toString() === req.user.id) {
      return res.status(403).json({ 
        error: 'You cannot book your own ride. Passengers can book seats in rides offered by other drivers.' 
      });
    }
    
    // Use atomic operation to prevent race conditions when booking seats
    const ride = await Ride.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'active',
        driver: { $ne: req.user.id }, // Additional check: not the driver
        passengers: { $nin: [req.user.id] }, // User hasn't already booked
        $expr: { $lt: [{ $size: '$passengers' }, '$availableSeats'] } // Seats available
      },
      {
        $push: { passengers: req.user.id }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('driver', 'name email');
    
    if (!ride) {
      // Check specific reasons why booking failed
      const checkRide = await Ride.findById(req.params.id);
      
      if (!checkRide) {
        return res.status(404).json({ error: 'Ride not found' });
      }
      
      if (checkRide.driver.toString() === req.user.id) {
        return res.status(403).json({ error: 'You cannot book your own ride' });
      }
      
      if (checkRide.status !== 'active') {
        return res.status(400).json({ error: 'This ride is no longer active' });
      }
      
      if (checkRide.passengers.includes(req.user.id)) {
        return res.status(400).json({ error: 'You have already booked this ride' });
      }
      
      if (checkRide.passengers.length >= checkRide.availableSeats) {
        return res.status(400).json({ error: 'No seats available - this ride is now full' });
      }
      
      return res.status(400).json({ error: 'Unable to book ride. Please try again.' });
    }
    
    console.log(`User ${req.user.id} successfully booked ride ${req.params.id}`);
    
    // Start virtual ride progression for testing only if this is the first passenger
    if (ride.passengers.length === 1) {
      console.log(`Starting virtual progression for ride ${ride._id} with first passenger`);
      setTimeout(() => startVirtualRideProgression(ride._id), 10000); // Start after 10 seconds
    } else {
      console.log(`Ride ${ride._id} already has passengers, not starting new progression`);
    }
    
    res.json({ 
      message: 'Ride booked successfully! Check your bookings to see ride details.',
      ride 
    });
  } catch (err) {
    console.error('Error booking ride:', err);
    res.status(500).json({ error: 'Failed to book ride. Please try again.' });
  }
};

// Get user's rides (both as driver and passenger)
exports.getUserRides = async (req, res) => {
  try {
    const driverRides = await Ride.find({ driver: req.user.id })
      .populate('passengers', 'name email');
    
    const passengerRides = await Ride.find({ passengers: req.user.id })
      .populate('driver', 'name email');
    
    res.json({
      asDriver: driverRides,
      asPassenger: passengerRides
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user rides' });
  }
};

// Cancel a ride (drivers only)
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this ride' });
    }
    
    ride.status = 'cancelled';
    await ride.save();
    
    res.json({ message: 'Ride cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel ride' });
  }
};

// Get ride status
exports.getRideStatus = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name email phone')
      .populate('passengers', 'name email phone');

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json(ride);
  } catch (err) {
    console.error('Error fetching ride status:', err);
    res.status(500).json({ error: 'Failed to fetch ride status' });
  }
};

// Update ride status (drivers only)
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rideId = req.params.id;

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the driver can update ride status' });
    }

    const validStatuses = ['active', 'driver_assigned', 'driver_arrived', 'ride_started', 'ride_completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update status and timestamp
    const updateData = { status };
    const now = new Date();

    switch (status) {
      case 'driver_assigned':
        updateData.driverAssignedAt = now;
        break;
      case 'driver_arrived':
        updateData.driverArrivedAt = now;
        break;
      case 'ride_started':
        updateData.rideStartedAt = now;
        break;
      case 'ride_completed':
        updateData.rideCompletedAt = now;
        updateData.paymentStatus = 'completed'; // Auto-complete payment for cash
        break;
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      rideId,
      updateData,
      { new: true }
    ).populate('driver', 'name email phone')
     .populate('passengers', 'name email phone');

    // Create notifications for passengers about status changes
    const { createNotification } = require('../routes/notificationRoutes');
    const statusMessages = {
      'driver_assigned': 'Your driver has been assigned and is on the way!',
      'driver_arrived': 'Your driver has arrived at the pickup location.',
      'ride_started': 'Your ride has started. Enjoy your journey!',
      'ride_completed': 'Your ride has been completed. Please rate your experience.',
      'cancelled': 'Your ride has been cancelled.'
    };

    if (statusMessages[status]) {
      ride.passengers.forEach(passengerId => {
        createNotification(
          passengerId,
          'Ride Status Update',
          statusMessages[status],
          'ride_request',
          { relatedRide: rideId }
        );
      });
    }

    res.json(updatedRide);
  } catch (err) {
    console.error('Error updating ride status:', err);
    res.status(500).json({ error: 'Failed to update ride status' });
  }
};

// Enhanced fare calculation utility
const calculateTieredFare = (distance) => {
  if (distance <= 0) return 30; // Basic fare
  
  const basicFare = 30;
  let totalFare = basicFare;
  
  // Tiered pricing structure
  if (distance <= 5) {
    // First 5 km: Rs. 15 each
    totalFare += distance * 15;
  } else if (distance <= 15) {
    // First 5 km: Rs. 15 each + Next 10 km: Rs. 10 each
    totalFare += (5 * 15) + ((distance - 5) * 10);
  } else {
    // First 5 km: Rs. 15 each + Next 10 km: Rs. 10 each + Remaining: Rs. 5 each
    totalFare += (5 * 15) + (10 * 10) + ((distance - 15) * 5);
  }
  
  return Math.round(totalFare);
};

// Virtual ride progression for testing
const startVirtualRideProgression = async (rideId) => {
  try {
    const Ride = require('../models/RideModel');
    
    console.log(`🚗 Starting virtual ride progression for ride ${rideId}`);
    
    // Get the ride and validate it exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      console.log('❌ Ride not found, stopping progression');
      return;
    }
    
    // Check if progression already started
    if (ride.status !== 'active') {
      console.log(`❌ Ride status is ${ride.status}, not starting progression`);
      return;
    }
    
    // Calculate distance for timing (assuming 1km/s as requested)
    let distance = 5; // Default 5km if coordinates missing
    if (ride.fromCoordinates && ride.toCoordinates) {
      const lat1 = ride.fromCoordinates.lat;
      const lon1 = ride.fromCoordinates.lng;
      const lat2 = ride.toCoordinates.lat;
      const lon2 = ride.toCoordinates.lng;
      
      const R = 6371; // Radius of earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c; // Distance in km
    }
    
    console.log(`📏 Virtual ride distance: ${distance.toFixed(2)} km`);
    
    // Status progression timeline
    setTimeout(async () => {
      try {
        await Ride.findByIdAndUpdate(rideId, { status: 'driver_assigned' });
        console.log(`🚙 Ride ${rideId}: Driver assigned`);
      } catch (error) {
        console.error('Error updating to driver_assigned:', error);
      }
    }, 2000); // 2 seconds
    
    setTimeout(async () => {
      try {
        await Ride.findByIdAndUpdate(rideId, { status: 'driver_arrived' });
        console.log(`📍 Ride ${rideId}: Driver arrived`);
      } catch (error) {
        console.error('Error updating to driver_arrived:', error);
      }
    }, 5000); // 5 seconds
    
    setTimeout(async () => {
      try {
        await Ride.findByIdAndUpdate(rideId, { status: 'ride_started' });
        console.log(`🚀 Ride ${rideId}: Ride started`);
      } catch (error) {
        console.error('Error updating to ride_started:', error);
      }
    }, 8000); // 8 seconds
    
    // Complete ride after distance-based time (1km/s = 1000ms/km)
    const completionTime = 8000 + (distance * 1000); // 8 seconds + 1 second per km
    setTimeout(async () => {
      try {
        await Ride.findByIdAndUpdate(rideId, { 
          status: 'ride_completed',
          actualFare: ride.pricePerSeat,
          distanceKm: distance
        });
        console.log(`✅ Ride ${rideId}: Ride completed after ${distance.toFixed(2)} km in ${completionTime/1000}s`);
      } catch (error) {
        console.error('Error updating to ride_completed:', error);
      }
    }, completionTime);
    
  } catch (error) {
    console.error('❌ Error in virtual ride progression:', error);
  }
};
