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
  body('username').isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters').trim(),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).matches(/^[+]?[\d\s\-\(\)]{7,}$/).withMessage('Please enter a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array().map(e => e.msg).join(', ');
      return res.status(400).json({ message: errorMsg, errors: errors.array() });
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
    console.error('REGISTER ROUTE ERROR:', error);
    res.status(500).json({ message: error.message || 'Server error' });
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

    // Sync mutual followers
    const followingSet = new Set((user.following || []).map(id => id.toString()));
    const mutualFollowUserIds = (user.followers || []).filter(id => followingSet.has(id.toString()));

    if (mutualFollowUserIds.length > 0) {
      await User.findByIdAndUpdate(user._id, { $addToSet: { friends: { $each: mutualFollowUserIds } } });
      await AllUser.findOneAndUpdate({ userId: user._id }, { $addToSet: { friends: { $each: mutualFollowUserIds } } });
      for (const friendId of mutualFollowUserIds) {
        await User.findByIdAndUpdate(friendId, { $addToSet: { friends: user._id } });
        await AllUser.findOneAndUpdate({ userId: friendId }, { $addToSet: { friends: user._id } });
      }
    }

    const populatedUser = await User.findById(user._id)
      .populate('friends', 'username profilePicture isOnline lastSeen about')
      .populate('savedPosts');

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: populatedUser || user
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
router.get('/me', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (currentUser) {
      const followingSet = new Set((currentUser.following || []).map(id => id.toString()));
      const mutualFollowUserIds = (currentUser.followers || []).filter(id => followingSet.has(id.toString()));

      if (mutualFollowUserIds.length > 0) {
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: { $each: mutualFollowUserIds } } });
        await AllUser.findOneAndUpdate({ userId: req.user._id }, { $addToSet: { friends: { $each: mutualFollowUserIds } } });
        for (const friendId of mutualFollowUserIds) {
          await User.findByIdAndUpdate(friendId, { $addToSet: { friends: req.user._id } });
          await AllUser.findOneAndUpdate({ userId: friendId }, { $addToSet: { friends: req.user._id } });
        }
      }
    }

    const user = await User.findById(req.user._id)
      .populate('friends', 'username profilePicture isOnline lastSeen about')
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

// Google Auth Endpoint
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken, email: bodyEmail, name: bodyName, picture: bodyPicture, googleId: bodyGoogleId } = req.body;
    let email = bodyEmail;
    let name = bodyName;
    let picture = bodyPicture;
    let googleId = bodyGoogleId;

    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      } catch (verifyErr) {
        console.warn('Google token verify notice:', verifyErr.message);
        try {
          const base64Url = credential.split('.')[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
            const payload = JSON.parse(jsonPayload);
            email = payload.email || email;
            name = payload.name || name;
            picture = payload.picture || picture;
            googleId = payload.sub || googleId;
          }
        } catch (e) {
          console.error('Payload decode error:', e);
        }
      }
    } else if (accessToken && (!email || !googleId)) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (userInfoRes.ok) {
          const info = await userInfoRes.json();
          email = info.email || email;
          name = info.name || name;
          picture = info.picture || picture;
          googleId = info.sub || googleId;
        }
      } catch (infoErr) {
        console.error('Failed to fetch Google UserInfo:', infoErr);
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Google authentication failed: Email required.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      let baseUsername = (name || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 15);
      if (baseUsername.length < 3) baseUsername = 'user_' + Math.floor(1000 + Math.random() * 9000);

      let username = baseUsername;
      let count = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}_${count++}`;
      }

      const randomPassword = 'G_' + Math.random().toString(36).slice(-10) + 'A1!';

      user = new User({
        username,
        email,
        phone: '',
        password: randomPassword,
        googleId: googleId || '',
        profilePicture: picture || 'https://res.cloudinary.com/dyjlmweqb/image/upload/v1752616422/icon-7797704_640_an798v.png'
      });
      await user.save();

      const allUser = new AllUser({
        userId: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        about: user.about,
        isOnline: true,
        friends: user.friends,
        coverPhoto: user.coverPhoto,
        lastSeen: new Date(),
        followers: user.followers,
        following: user.following
      });
      await allUser.save();
    } else {
      user.isOnline = true;
      if (googleId && !user.googleId) user.googleId = googleId;
      if (picture && (!user.profilePicture || user.profilePicture.includes('icon-7797704'))) user.profilePicture = picture;
      await user.save();
    }

    const token = generateToken(user._id);

    return res.json({
      message: 'Google login successful',
      token,
      user
    });
  } catch (error) {
    console.error('GOOGLE AUTH ROUTE ERROR:', error);
    return res.status(500).json({ message: 'Google login failed on server' });
  }
});

module.exports = router;