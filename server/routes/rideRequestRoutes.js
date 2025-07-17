const express = require('express');
const { 
  getAllRideRequests, 
  createRideRequest, 
  acceptRideRequest, 
  getUserRideRequests, 
  cancelRideRequest 
} = require('../controllers/rideRequestController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public route to get all ride requests (for drivers to see)
router.get('/', auth, getAllRideRequests);

// Protected routes
router.post('/', auth, createRideRequest);
router.post('/:requestId/accept', auth, acceptRideRequest);
router.get('/my-requests', auth, getUserRideRequests);
router.patch('/:id/cancel', auth, cancelRideRequest);

module.exports = router;
