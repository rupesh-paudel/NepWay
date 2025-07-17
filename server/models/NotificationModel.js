const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['ride_request', 'ride_accepted', 'ride_cancelled', 'payment', 'rating', 'system'], 
    required: true 
  },
  relatedRide: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'RideRequest' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
