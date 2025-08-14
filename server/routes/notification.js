// routes/notifications.js
const express = require('express');
const router = express.Router();
const notificationsController = require('../controller/notificationController');
const authMiddleware = require('../middleware/auth');

// GET /api/notifications
router.get('/notifications', authMiddleware, notificationsController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authMiddleware, notificationsController.markAsRead);

// PATCH /api/notifications/read-all
router.patch('/notifications/read-all', authMiddleware, notificationsController.markAllAsRead);

module.exports = router;
