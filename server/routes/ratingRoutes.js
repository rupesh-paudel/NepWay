const express = require('express');
const router = express.Router();
const Rating = require('../models/RatingModel');
const Ride = require('../models/RideModel');
const User = require('../models/UserModel');
const auth = require('../middleware/auth');

// Submit a rating
router.post('/', auth, async (req, res) => {
  try {
    const { rideId, ratedUserId, rating, comment, raterType } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if ride exists and user was part of it
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Check if user was part of the ride
    const isDriver = ride.driver.toString() === req.user.id;
    const isPassenger = ride.passengers.includes(req.user.id);
    
    if (!isDriver && !isPassenger) {
      return res.status(403).json({ error: 'You can only rate users from rides you participated in' });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      ride: rideId,
      rater: req.user.id
    });

    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this ride' });
    }

    // Create rating
    const newRating = new Rating({
      ride: rideId,
      rater: req.user.id,
      ratedUser: ratedUserId,
      rating,
      comment,
      raterType
    });

    await newRating.save();

    // Update user's average rating
    const userRatings = await Rating.find({ ratedUser: ratedUserId });
    const avgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
    
    await User.findByIdAndUpdate(ratedUserId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: userRatings.length
    });

    res.json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get ratings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUser: req.params.userId })
      .populate('rater', 'name')
      .populate('ride', 'from to date')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Get rating summary for a user
router.get('/summary/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUser: req.params.userId });
    
    const summary = {
      totalRatings: ratings.length,
      averageRating: ratings.length > 0 ? 
        Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10 : 0,
      ratingDistribution: {
        5: ratings.filter(r => r.rating === 5).length,
        4: ratings.filter(r => r.rating === 4).length,
        3: ratings.filter(r => r.rating === 3).length,
        2: ratings.filter(r => r.rating === 2).length,
        1: ratings.filter(r => r.rating === 1).length
      }
    };

    res.json(summary);
  } catch (err) {
    console.error('Error fetching rating summary:', err);
    res.status(500).json({ error: 'Failed to fetch rating summary' });
  }
});

module.exports = router;
