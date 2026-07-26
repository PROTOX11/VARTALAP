const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AllUser = require('../models/AllUser');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register User
router.post('/register', [
  body('username').isLength({ min: 3, max: 20 }).trim().matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail(),
  body('phone').matches(/^[+]?[\d\s\-\(\)]{10,}$/).withMessage('Please enter a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email, username, or phone number'
      });
    }

    // Create new user
    const user = new User({ username, email, phone, password });
    await user.save();

    // Create AllUser document
    const allUser = new AllUser({
      userId: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      about: user.about,
      isOnline: user.isOnline,
      friends: user.friends,
      coverPhoto: user.coverPhoto,
      lastSeen: user.lastSeen,
      followers: user.followers,
      following: user.following
    });
    await allUser.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/login', [
  body('emailOrPhone').notEmpty().withMessage("emailOrPhone is missing"),
  body('password').notEmpty().withMessage("password is missing")
], async (req, res) => {

  console.log("LOGIN BODY:", req.body);   // ✅ DEBUG

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("VALIDATION ERRORS:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone },
        { username: emailOrPhone }
      ]
    });

    console.log("FOUND USER:", user ? user.email : "NOT FOUND");

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    user.isOnline = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username profilePicture isOnline lastSeen')
      .populate('savedPosts');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout User
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
