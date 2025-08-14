const Notification = require('../models/Notification');





const createLikeNotification = async (userIdWhoLiked, postId, postOwnerId) => {
    if (userIdWhoLiked.toString() === postOwnerId.toString()) return; // No self-notify

    const notification = new Notification({
        recipient: postOwnerId,
        sender: userIdWhoLiked,
        type: 'like',
        content: 'liked your post',
        post: postId,
        isRead: false,
    });

    await notification.save();
    return notification;
};

const createFollowNotification = async (followerId, followedUserId) => {
    if (followerId.toString() === followedUserId.toString()) return; // No self-notify

    const notification = new Notification({
        recipient: followedUserId,
        sender: followerId,
        type: 'follow',
        content: 'started following you',
        isRead: false,
    });

    await notification.save();
    return notification;
};

// GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'username profilePicture')
            .populate('post', 'image')
            .sort({ createdAt: -1 });

        // Format to match your frontend interface
        const formatted = notifications.map(n => ({
            _id: n._id,
            type: n.type,
            user: {
                username: n.sender.username,
                profilePicture: n.sender.profilePicture
            },
            content: n.content,
            createdAt: n.createdAt,
            isRead: n.isRead,
            postImage: n.post?.image || null
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createLikeNotification,
    createFollowNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
};
