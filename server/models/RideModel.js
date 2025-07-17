const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  date: { type: Date, required: true },
  time: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['active', 'driver_assigned', 'driver_arrived', 'ride_started', 'ride_completed', 'cancelled', 'expired'], 
    default: 'active' 
  },
  description: { type: String },
  vehicleInfo: {
    make: String,
    model: String,
    color: String,
    plateNumber: String
  },
  // Enhanced fare calculation
  baseFare: { type: Number, default: 30 },
  distanceKm: { type: Number },
  estimatedDuration: { type: Number }, // in minutes
  actualFare: { type: Number }, // Final fare after surge pricing
  surgePricing: { type: Number, default: 1.0 }, // 1.0 = normal, 1.5 = 50% surge
  
  // Payment details
  paymentMethod: { type: String, enum: ['cash', 'esewa', 'khalti', 'card'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  
  // Ride timeline
  driverAssignedAt: { type: Date },
  driverArrivedAt: { type: Date },
  rideStartedAt: { type: Date },
  rideCompletedAt: { type: Date },
  
  // Driver availability during ride
  driverAvailable: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
rideSchema.index({ status: 1, date: 1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ passengers: 1 });

module.exports = mongoose.model('Ride', rideSchema);
