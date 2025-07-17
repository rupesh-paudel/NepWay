const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  fromCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  toCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  maxPricePerSeat: { type: Number, required: true },
  seatsNeeded: { type: Number, required: true, default: 1 },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'expired'], 
    default: 'pending' 
  },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedRide: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RideRequest', rideRequestSchema);
