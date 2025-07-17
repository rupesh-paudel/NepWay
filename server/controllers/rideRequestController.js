const RideRequest = require('../models/RideRequestModel');
const Ride = require('../models/RideModel');

// Utility function to remove expired ride requests
const removeExpiredRideRequests = async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Find ride requests that are past their preferred date and time
    const expiredRequests = await RideRequest.find({
      status: 'pending',
      $or: [
        { preferredDate: { $lt: currentDate } }, // Past date
        { 
          preferredDate: currentDate,
          preferredTime: { $lt: currentTime } // Today but past time
        }
      ]
    });
    
    if (expiredRequests.length > 0) {
      console.log(`Found ${expiredRequests.length} expired ride requests, removing them...`);
      
      // Update status to 'expired' instead of deleting (for record keeping)
      await RideRequest.updateMany(
        {
          _id: { $in: expiredRequests.map(request => request._id) }
        },
        { status: 'expired' }
      );
      
      console.log(`Successfully marked ${expiredRequests.length} ride requests as expired`);
    }
  } catch (error) {
    console.error('Error removing expired ride requests:', error);
  }
};

// Run expired ride request cleanup every 5 minutes
setInterval(removeExpiredRideRequests, 5 * 60 * 1000);

// Also run once when server starts
removeExpiredRideRequests();

// Get all ride requests
exports.getAllRideRequests = async (req, res) => {
  try {
    const requests = await RideRequest.find({ status: 'pending' })
      .populate('passenger', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ride requests' });
  }
};

// Create a new ride request (passengers)
exports.createRideRequest = async (req, res) => {
  try {
    const { 
      from, 
      to, 
      fromCoordinates, 
      toCoordinates, 
      preferredDate, 
      preferredTime, 
      maxPricePerSeat, 
      seatsNeeded, 
      description 
    } = req.body;
    
    // Validate required fields
    if (!from || !to || !fromCoordinates || !toCoordinates || !preferredDate || !preferredTime || !maxPricePerSeat) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    console.log('Creating ride request with data:', req.body);
    
    const rideRequest = new RideRequest({
      passenger: req.user.id,
      from,
      to,
      fromCoordinates,
      toCoordinates,
      preferredDate,
      preferredTime,
      maxPricePerSeat: parseFloat(maxPricePerSeat),
      seatsNeeded: parseInt(seatsNeeded) || 1,
      description
    });
    
    await rideRequest.save();
    await rideRequest.populate('passenger', 'name email');
    
    console.log('Ride request created successfully:', rideRequest);
    res.status(201).json(rideRequest);
  } catch (err) {
    console.error('Error creating ride request:', err);
    res.status(400).json({ error: `Failed to create ride request: ${err.message}` });
  }
};

// Accept a ride request (drivers)
exports.acceptRideRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const rideId = req.body?.rideId; // Optional: if driver wants to assign to existing ride
    
    // Check if user is a driver
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can accept ride requests' });
    }

    // First, check if the user is trying to accept their own ride request
    const checkRequest = await RideRequest.findById(requestId);
    if (!checkRequest) {
      return res.status(404).json({ error: 'Ride request not found' });
    }
    
    if (checkRequest.passenger.toString() === req.user.id) {
      return res.status(403).json({ 
        error: 'You cannot accept your own ride request. Only other drivers can accept your requests.' 
      });
    }

    // Use atomic operation to check and update the ride request status
    // This prevents race conditions when multiple drivers try to accept the same request
    const rideRequest = await RideRequest.findOneAndUpdate(
      { 
        _id: requestId, 
        status: 'pending', // Only update if still pending
        passenger: { $ne: req.user.id } // Additional check: not the same user
      },
      { 
        status: 'accepted',
        acceptedBy: req.user.id
      },
      { 
        new: false, // Return the original document to check if it was updated
        runValidators: true 
      }
    );
    
    if (!rideRequest) {
      return res.status(400).json({ 
        error: 'Ride request is no longer available or has already been accepted by another driver' 
      });
    }
    
    let ride;
    
    try {
      if (rideId) {
        // Add to existing ride
        ride = await Ride.findById(rideId);
        if (!ride || ride.driver.toString() !== req.user.id) {
          // Rollback the ride request status if ride assignment fails
          await RideRequest.findByIdAndUpdate(requestId, { 
            status: 'pending', 
            $unset: { acceptedBy: 1 }
          });
          return res.status(403).json({ error: 'You can only add passengers to your own rides' });
        }
        
        if (ride.passengers.length + rideRequest.seatsNeeded > ride.availableSeats) {
          // Rollback the ride request status if not enough seats
          await RideRequest.findByIdAndUpdate(requestId, { 
            status: 'pending', 
            $unset: { acceptedBy: 1 }
          });
          return res.status(400).json({ error: 'Not enough seats available' });
        }
        
        // Add passenger to ride
        for (let i = 0; i < rideRequest.seatsNeeded; i++) {
          ride.passengers.push(rideRequest.passenger);
        }
        await ride.save();
      } else {
        // Create new ride for this request
        ride = new Ride({
          driver: req.user.id,
          from: rideRequest.from,
          to: rideRequest.to,
          fromCoordinates: rideRequest.fromCoordinates,
          toCoordinates: rideRequest.toCoordinates,
          date: rideRequest.preferredDate,
          time: rideRequest.preferredTime,
          availableSeats: rideRequest.seatsNeeded + 3, // Add some extra seats
          pricePerSeat: rideRequest.maxPricePerSeat,
          passengers: [rideRequest.passenger]
        });
        await ride.save();
      }
      
      // Finally update the ride request with the accepted ride ID
      await RideRequest.findByIdAndUpdate(requestId, { 
        acceptedRide: ride._id 
      });
      
      console.log(`Ride request ${requestId} successfully accepted by driver ${req.user.id}`);
      
      // Start virtual ride progression for testing only if it's a new ride
      if (!rideId) {
        console.log(`Starting virtual progression for new ride ${ride._id}`);
        setTimeout(() => startVirtualRideProgression(ride._id), 10000); // Start after 10 seconds
      }
      
      res.json({ 
        message: 'Ride request accepted successfully! The passenger will be notified.',
        rideRequest: {
          ...rideRequest.toObject(),
          status: 'accepted',
          acceptedBy: req.user.id,
          acceptedRide: ride._id
        },
        ride 
      });
      
    } catch (rideError) {
      // If ride creation/update fails, rollback the ride request status
      console.error('Error creating/updating ride, rolling back ride request:', rideError);
      await RideRequest.findByIdAndUpdate(requestId, { 
        status: 'pending', 
        $unset: { acceptedBy: 1 }
      });
      throw rideError;
    }
    
  } catch (err) {
    console.error('Error accepting ride request:', err);
    res.status(500).json({ error: 'Failed to accept ride request. Please try again.' });
  }
};

// Get user's ride requests
exports.getUserRideRequests = async (req, res) => {
  try {
    const userRequests = await RideRequest.find({ passenger: req.user.id })
      .populate('acceptedBy', 'name email')
      .populate('acceptedRide')
      .sort({ createdAt: -1 });
    
    res.json(userRequests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user ride requests' });
  }
};

// Cancel a ride request
exports.cancelRideRequest = async (req, res) => {
  try {
    const rideRequest = await RideRequest.findById(req.params.id);
    
    if (!rideRequest) {
      return res.status(404).json({ error: 'Ride request not found' });
    }
    
    if (rideRequest.passenger.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this request' });
    }
    
    rideRequest.status = 'cancelled';
    await rideRequest.save();
    
    res.json({ message: 'Ride request cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel ride request' });
  }
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
