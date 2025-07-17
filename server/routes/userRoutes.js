const express = require('express');
const { register, login, updateProfile, changePassword } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

// Debug route to test authentication
router.get('/me', auth, (req, res) => {
  res.json({ 
    message: 'Authentication working!', 
    user: { 
      id: req.user._id, 
      name: req.user.name, 
      email: req.user.email, 
      role: req.user.role 
    } 
  });
});

module.exports = router;
