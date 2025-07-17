const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const Ride = require('../models/RideModel');
const Notification = require('../models/NotificationModel');
const auth = require('../middleware/auth');

// Get driver statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can access this endpoint' });
    }

    const driverRides = await Ride.find({ driver: req.user.id });
    const completedRides = driverRides.filter(ride => ride.status === 'ride_completed');
    
    const totalEarnings = completedRides.reduce((sum, ride) => {
      return sum + (ride.pricePerSeat * ride.passengers.length);
    }, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRides = completedRides.filter(ride => {
      const rideDate = new Date(ride.rideCompletedAt || ride.createdAt);
      return rideDate >= today;
    });
    
    const todayEarnings = todayRides.reduce((sum, ride) => {
      return sum + (ride.pricePerSeat * ride.passengers.length);
    }, 0);

    const activeRides = driverRides.filter(ride => 
      ['active', 'driver_assigned', 'driver_arrived', 'ride_started'].includes(ride.status)
    ).length;

    const user = await User.findById(req.user.id);

    const stats = {
      totalEarnings,
      totalRides: completedRides.length,
      averageRating: user.averageRating || 0,
      todayEarnings,
      activeRides
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching driver stats:', err);
    res.status(500).json({ error: 'Failed to fetch driver statistics' });
  }
});

// Get driver availability status
router.get('/availability', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can access this endpoint' });
    }

    const user = await User.findById(req.user.id);
    res.json({ isAvailable: user.isAvailable });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Failed to fetch availability status' });
  }
});

// Update driver availability
router.patch('/availability', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can update availability' });
    }

    const { isAvailable, location } = req.body;
    
    const updateData = { 
      isAvailable,
      lastActive: new Date()
    };

    if (location && location.lat && location.lng) {
      updateData.currentLocation = {
        lat: location.lat,
        lng: location.lng,
        lastUpdated: new Date()
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    res.json({ isAvailable: user.isAvailable });
  } catch (err) {
    console.error('Error updating availability:', err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Get nearby drivers (for admin or matching algorithm)
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Simple distance calculation - in production, use MongoDB geospatial queries
    const drivers = await User.find({
      role: 'driver',
      isAvailable: true,
      'currentLocation.lat': { $exists: true },
      'currentLocation.lng': { $exists: true }
    }).select('name email currentLocation averageRating totalRides');

    const nearbyDrivers = drivers.filter(driver => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        driver.currentLocation.lat,
        driver.currentLocation.lng
      );
      return distance <= radius;
    });

    res.json(nearbyDrivers);
  } catch (err) {
    console.error('Error fetching nearby drivers:', err);
    res.status(500).json({ error: 'Failed to fetch nearby drivers' });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;
