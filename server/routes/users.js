const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AllUser = require('../models/AllUser');
const Post = require('../models/Post');
const FriendRequest = require('../models/FriendRequest');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../cloudinary');
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

    // Check if targetUser already follows userId (making this a mutual follow)
    const targetUser = await User.findById(targetUserId).select('following username profilePicture about isOnline lastSeen');
    const isMutual = targetUser && targetUser.following && targetUser.following.some(id => id.toString() === userId.toString());

    // Update User collection
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetUserId }
    });
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: userId }
    });

    // Update AllUser collection
    await AllUser.findOneAndUpdate({ userId }, {
      $addToSet: { following: targetUserId }
    });
    await AllUser.findOneAndUpdate({ userId: targetUserId }, {
      $addToSet: { followers: userId }
    });

    if (isMutual) {
      // Add each other to friends array
      await User.findByIdAndUpdate(userId, { $addToSet: { friends: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { friends: userId } });
      await AllUser.findOneAndUpdate({ userId }, { $addToSet: { friends: targetUserId } });
      await AllUser.findOneAndUpdate({ userId: targetUserId }, { $addToSet: { friends: userId } });
    }

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

    res.json({ message: 'Followed successfully', isMutual });

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

    const updates = { ...req.body };

    // Upload images to Cloudinary from memory buffer
    if (req.files) {
      try {
        if (req.files.profilePicture?.[0]) {
          const f = req.files.profilePicture[0];
          updates.profilePicture = await uploadToCloudinary(f.buffer, f.mimetype, 'vartalap-profiles');
        }
        if (req.files.coverPhoto?.[0]) {
          const f = req.files.coverPhoto[0];
          updates.coverPhoto = await uploadToCloudinary(f.buffer, f.mimetype, 'vartalap-covers');
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ message: 'Image upload failed. Please try again.' });
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

    const isSelf = req.user._id.toString() === user._id.toString();
    const isFriend = req.user.friends && req.user.friends.some(fId => fId.toString() === user._id.toString());

    let postQuery = { user: user._id, isActive: true };
    if (!isSelf && !isFriend) {
      // Non-friends only see public posts
      postQuery.$or = [
        { visibility: 'public' },
        { visibility: { $exists: false } }
      ];
    }

    // Get user's posts
    const posts = await Post.find(postQuery)
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
      }).select('username profilePicture isOnline followers following about').limit(20);
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =====================================
// FRIEND REQUEST SYSTEM ENDPOINTS
// =====================================

// POST /api/users/friend-request/send/:userId
router.post('/friend-request/send/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const userId = req.user._id;

    if (userId.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(userId);
    if (currentUser.friends && currentUser.friends.some(id => id.toString() === targetUserId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    const existingReq = await FriendRequest.findOne({
      $or: [
        { sender: userId, receiver: targetUserId, status: 'pending' },
        { sender: targetUserId, receiver: userId, status: 'pending' }
      ]
    });

    if (existingReq) {
      return res.status(400).json({ message: 'A pending friend request already exists' });
    }

    const request = new FriendRequest({
      sender: userId,
      receiver: targetUserId,
      status: 'pending'
    });
    await request.save();

    const notification = new Notification({
      recipient: targetUserId,
      sender: userId,
      type: 'friend_request',
      content: 'sent you a friend request'
    });
    await notification.save();
    await notification.populate('sender', 'username profilePicture');

    try {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      const recipientSocketId = connectedUsers?.get(targetUserId);
      if (io && recipientSocketId) {
        io.to(recipientSocketId).emit('friendRequestReceived', { request, notification });
        io.to(recipientSocketId).emit('notificationCreated', notification);
      }
    } catch (socketErr) {
      console.error('Socket emit error:', socketErr);
    }

    res.status(201).json({ message: 'Friend request sent successfully', request, notification });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/friend-request/accept/:requestId
router.post('/friend-request/accept/:requestId', auth, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user._id;

    let request = await FriendRequest.findById(requestId);
    if (!request) {
      request = await FriendRequest.findOne({
        sender: requestId,
        receiver: userId,
        status: 'pending'
      });
    }

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    request.status = 'accepted';
    await request.save();

    const senderId = request.sender;

    await User.findByIdAndUpdate(userId, { $addToSet: { friends: senderId } });
    await User.findByIdAndUpdate(senderId, { $addToSet: { friends: userId } });

    await AllUser.findOneAndUpdate({ userId }, { $addToSet: { friends: senderId } });
    await AllUser.findOneAndUpdate({ userId: senderId }, { $addToSet: { friends: userId } });

    // Instagram-style: auto-follow each other when friend request is accepted
    await User.findByIdAndUpdate(userId, { $addToSet: { following: senderId, followers: senderId } });
    await User.findByIdAndUpdate(senderId, { $addToSet: { following: userId, followers: userId } });
    await AllUser.findOneAndUpdate({ userId }, { $addToSet: { following: senderId } });
    await AllUser.findOneAndUpdate({ userId: senderId }, { $addToSet: { following: userId } });

    await Notification.updateMany(
      { recipient: userId, sender: senderId, type: 'friend_request' },
      { isRead: true }
    );

    const notification = new Notification({
      recipient: senderId,
      sender: userId,
      type: 'friend_request',
      content: 'accepted your friend request'
    });
    await notification.save();
    await notification.populate('sender', 'username profilePicture');

    try {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      const senderSocketId = connectedUsers?.get(senderId.toString());
      if (io && senderSocketId) {
        const accepter = await User.findById(userId).select('username profilePicture isOnline');
        io.to(senderSocketId).emit('friendRequestAccepted', { friendInfo: accepter, notification });
        io.to(senderSocketId).emit('notificationCreated', notification);
      }
    } catch (socketErr) {
      console.error('Socket emit error:', socketErr);
    }

    res.json({ message: 'Friend request accepted', request });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/friend-request/reject/:requestId
router.post('/friend-request/reject/:requestId', auth, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user._id;

    let request = await FriendRequest.findById(requestId);
    if (!request) {
      request = await FriendRequest.findOne({
        sender: requestId,
        receiver: userId,
        status: 'pending'
      });
    }

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    request.status = 'rejected';
    await request.save();

    await Notification.updateMany(
      { recipient: userId, sender: request.sender, type: 'friend_request' },
      { isRead: true }
    );

    res.json({ message: 'Friend request rejected', request });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/friend-request/cancel/:targetUserId
router.post('/friend-request/cancel/:targetUserId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.targetUserId;
    const userId = req.user._id;

    const request = await FriendRequest.findOneAndUpdate(
      { sender: userId, receiver: targetUserId, status: 'pending' },
      { status: 'cancelled' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Pending friend request not found' });
    }

    res.json({ message: 'Friend request cancelled', request });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/friend-request/remove/:friendId
router.delete('/friend-request/remove/:friendId', auth, async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    await AllUser.findOneAndUpdate({ userId }, { $pull: { friends: friendId } });
    await AllUser.findOneAndUpdate({ userId: friendId }, { $pull: { friends: userId } });

    await FriendRequest.updateMany(
      {
        $or: [
          { sender: userId, receiver: friendId },
          { sender: friendId, receiver: userId }
        ]
      },
      { status: 'cancelled' }
    );

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/friend-request/pending
router.get('/friend-request/pending', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ receiver: req.user._id, status: 'pending' })
      .populate('sender', 'username profilePicture about isOnline')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/friend-request/sent
router.get('/friend-request/sent', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ sender: req.user._id, status: 'pending' })
      .populate('receiver', 'username profilePicture about isOnline')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/friends
router.get('/friends', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (currentUser) {
      // Find mutual followers (users who follow me AND whom I follow)
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

    const updatedUser = await User.findById(req.user._id).populate('friends', 'username profilePicture about isOnline lastSeen');
    res.json(updatedUser?.friends || []);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/relationship/:targetUserId
router.get('/relationship/:targetUserId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.targetUserId;
    const userId = req.user._id;

    if (userId.toString() === targetUserId) {
      return res.json({ relationship: 'self', isFollowing: false, isFollowedBy: false });
    }

    const [userDoc, targetDoc] = await Promise.all([
      User.findById(userId).select('friends following followers'),
      User.findById(targetUserId).select('following followers'),
    ]);

    const isFriend = userDoc.friends?.some(id => id.toString() === targetUserId);
    const isFollowing = userDoc.following?.some(id => id.toString() === targetUserId) || false;
    const isFollowedBy = targetDoc?.following?.some(id => id.toString() === userId.toString()) || false;

    if (isFriend) {
      return res.json({ relationship: 'friends', isFollowing, isFollowedBy });
    }

    const sentReq = await FriendRequest.findOne({ sender: userId, receiver: targetUserId, status: 'pending' });
    if (sentReq) {
      return res.json({ relationship: 'sent', requestId: sentReq._id, isFollowing, isFollowedBy });
    }

    const receivedReq = await FriendRequest.findOne({ sender: targetUserId, receiver: userId, status: 'pending' });
    if (receivedReq) {
      return res.json({ relationship: 'received', requestId: receivedReq._id, isFollowing, isFollowedBy });
    }

    res.json({ relationship: 'none', isFollowing, isFollowedBy });
  } catch (error) {
    console.error('Error fetching relationship status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
