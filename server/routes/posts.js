const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../cloudinary');
const Notification = require('../models/Notification');
const router = express.Router();
const { createLikeNotification } = require('../controller/notificationController');

// Create Post
router.post('/',
  [
    auth,
    upload.single('media'),
    body('type').isIn(['text', 'image', 'Wow', 'video']),
    body('content').optional().trim(),
    body('visibility').optional().isIn(['public', 'friends'])
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, content, location, visibility } = req.body;

    const postData = {
      user: req.user._id,
      type,
      content,
      location,
      visibility: ['public', 'friends'].includes(visibility) ? visibility : 'public',
    };

    // If a file was uploaded, stream it to Cloudinary from memory buffer
    if (req.file) {
      try {
        const url = await uploadToCloudinary(
          req.file.buffer,
          req.file.mimetype,
          'vartalap-posts'
        );
        if (type === 'video') {
          postData.video = url;
        } else {
          postData.image = url;
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ message: 'Image/video upload failed. Please try again.' });
      }
    }

    const post = new Post(postData);
    await post.save();
    await post.populate('user', 'username profilePicture');

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Posts by Logged-in User
router.get('/my-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
});


// Get Feed Posts
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUserId = req.user._id;
    const currentUserIdStr = currentUserId.toString();
    const userFriends = req.user.friends || [];

    // Query rules:
    // 1) Current user's own posts (public or friends)
    // 2) Public posts from ANY user (whether connected/followed or not)
    // 3) Friends-only posts from user's connected friends
    const posts = await Post.find({
      isActive: true,
      $or: [
        { user: currentUserId },
        { visibility: 'public' },
        { visibility: { $exists: false } },
        { visibility: 'friends', user: { $in: userFriends } }
      ]
    })
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Build isLiked BEFORE toJSON() so Mongoose ObjectId methods are available
    const postsWithIsLiked = posts.map(post => {
      const plain = post.toJSON();
      plain.isLiked = post.likes.some(likeId => likeId.toString() === currentUserIdStr);
      return plain;
    });

    res.json(postsWithIsLiked);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Like/Unlike Post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!postId || postId === 'undefined') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, update, {
      new: true,
    });

    if (!isLiked && updatedPost && post.user.toString() !== userId.toString()) {
      const notification = await createLikeNotification(userId, post._id, post.user);
      try {
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');
        const recipientSocketId = connectedUsers.get(post.user.toString());
        if (io && recipientSocketId) {
          const sender = await User.findById(userId).select('username profilePicture');
          const payload = {
            _id: notification._id,
            type: notification.type,
            user: { username: sender.username, profilePicture: sender.profilePicture },
            content: notification.content,
            createdAt: notification.createdAt,
            isRead: false,
            postImage: post.image || null,
          };
          io.to(recipientSocketId).emit('notification', payload);
        }
      } catch (socketError) {
        console.error('Socket notification error:', socketError);
      }
    }

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found or could not be updated.' });
    }

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: updatedPost.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error('Error in like/unlike route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add Comment
router.post('/:postId/comment', auth, [
  body('content').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.user', 'username profilePicture');

    res.json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.isActive = false;
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save/Unsave Post
router.post('/:postId/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(req.user._id);
    const savedIndex = user.savedPosts.findIndex(
      savedPost => savedPost.toString() === post._id.toString()
    );

    if (savedIndex > -1) {
      // Unsave
      user.savedPosts.splice(savedIndex, 1);
    } else {
      // Save
      user.savedPosts.push(post._id);
    }

    await user.save();

    res.json({
      message: savedIndex > -1 ? 'Post unsaved' : 'Post saved',
      isSaved: savedIndex === -1
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all videos
router.get('/all-videos', async (req, res) => {
  try {
    const posts = await Post.find({ video: { $exists: true, $ne: '' } })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
