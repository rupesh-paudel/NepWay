const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['general', 'rider', 'driver'], default: 'general' },
  isAvailable: { type: Boolean, default: false },
  
  // Enhanced user profile
  phone: { type: String },
  profileImage: { type: String },
  
  // Driver-specific fields
  licenseNumber: { type: String },
  vehicleDetails: {
    make: String,
    model: String,
    year: Number,
    color: String,
    plateNumber: String,
    capacity: { type: Number, default: 4 }
  },
  
  // Location tracking
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date }
  },
  
  // Ratings and stats
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 }, // For drivers
  totalSpent: { type: Number, default: 0 }, // For general users
  
  // Account status
  isVerified: { type: Boolean, default: false },
  verificationDocuments: [{
    type: { type: String, enum: ['license', 'vehicle_registration', 'insurance'] },
    url: String,
    verified: { type: Boolean, default: false }
  }],
  
  // Preferences
  preferences: {
    paymentMethod: { type: String, enum: ['cash', 'esewa', 'khalti', 'card'], default: 'cash' },
    notifications: { type: Boolean, default: true },
    shareLocation: { type: Boolean, default: true }
  },
  
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

// Index for efficient queries
userSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ isAvailable: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
