const express = require('express');
const { 
  getAllRides, 
  createRide, 
  bookRide, 
  getUserRides, 
  cancelRide,
  getRideStatus,
  updateRideStatus
} = require('../controllers/rideController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public route to get all rides
router.get('/', getAllRides);

// Protected routes (require authentication)
router.post('/', auth, createRide);
router.post('/:id/book', auth, bookRide);
router.get('/my-rides', auth, getUserRides);
router.patch('/:id/cancel', auth, cancelRide);
router.get('/:id/status', auth, getRideStatus);
router.patch('/:id/status', auth, updateRideStatus);

module.exports = router;
