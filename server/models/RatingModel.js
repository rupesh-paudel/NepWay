const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who gave the rating
  ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who received the rating
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  raterType: { type: String, enum: ['driver', 'passenger'], required: true }, // Who gave this rating
  createdAt: { type: Date, default: Date.now }
});

// Ensure one rating per user per ride
ratingSchema.index({ ride: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
