const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AllUser = require('../models/AllUser');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../cloudinary');
const { createFollowNotification } = require('../controller/notificationController');

const router = express.Router();

// Follow a user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const userId = req.user._id;

    if (userId.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Update User collection
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetUserId, friends: targetUserId }
    });
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: userId, friends: userId }
    });

    // Update AllUser collection
    await AllUser.findOneAndUpdate({ userId }, {
      $addToSet: { following: targetUserId, friends: targetUserId }
    });
    await AllUser.findOneAndUpdate({ userId: targetUserId }, {
      $addToSet: { followers: userId, friends: userId }
    });


    // Create and send notification
    const notification = await createFollowNotification(userId, targetUserId);

    if (notification) {
      try {
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');
        const recipientSocketId = connectedUsers.get(targetUserId);

        if (io && recipientSocketId) {
          const sender = await User.findById(userId).select('username profilePicture');
          const payload = {
            _id: notification._id,
            type: notification.type,
            user: { username: sender.username, profilePicture: sender.profilePicture },
            content: notification.content,
            createdAt: notification.createdAt,
            isRead: false,
            postImage: null,
          };
          io.to(recipientSocketId).emit('notification', payload);
        }
      } catch (socketError) {
        console.error('Socket notification error:', socketError);
      }
    }

    res.json({ message: 'Followed successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while following user' });
  }
});

// Unfollow a user
router.post('/unfollow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const userId = req.user._id;

    if (userId.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot unfollow yourself' });
    }

    // Update User collection
    await User.findByIdAndUpdate(userId, {
      $pull: { following: targetUserId, friends: targetUserId }
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: userId, friends: userId }
    });

    // Update AllUser collection
    await AllUser.findOneAndUpdate({ userId }, {
      $pull: { following: targetUserId, friends: targetUserId }
    });
    await AllUser.findOneAndUpdate({ userId: targetUserId }, {
      $pull: { followers: userId, friends: userId }
    });


    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while unfollowing user' });
  }
});

// @route   GET api/users/all-users
// @desc    Get all users
// @access  Private
router.get('/all-users', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'username profilePicture followers').select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update Profile
router.put('/profile', [
  auth,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  body('username').optional().isLength({ min: 3, max: 20 }).trim(),
  body('about').optional().isLength({ max: 500 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    if (req.files) {
      if (req.files.profilePicture) {
        updates.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.coverPhoto) {
        updates.coverPhoto = req.files.coverPhoto[0].path;
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // Also update the AllUser collection
    if (user) {
      await AllUser.findOneAndUpdate({ userId: req.user._id }, updates);
    }

    res.json({ message: 'Profile updated successfully', user });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// for all user
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username profilePicture isOnline followers following');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get User Profile
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('friends', 'username profilePicture isOnline lastSeen')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ user: user._id, isActive: true })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search Users
router.get('/search', auth, async (req, res) => {
  try {
    const { q, type = 'people' } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let results = [];

    if (type === 'people') {
      results = await User.find({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ],
        _id: { $ne: req.user._id }
      }).select('username profilePicture isOnline followers following').limit(20);
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send Friend Request
router.post('/friend-request/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if already friends
    if (req.user.friends.includes(targetUser._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.user._id.toString() && request.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: req.user._id,
      status: 'pending'
    });

    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
