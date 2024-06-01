// server/routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const { SECRET_KEY } = require('../config');

// User registration
router.post("/new", async (req, res) => {
    try {
        const { username, mobile_number, password } = req.body;
        const user = new User({ username, mobile_number, password });
        await user.save();
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// User login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid username or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// // Protected route example
// router.get("/profile", authMiddleware, async (req, res) => {
//     try {
//         const user = await User.findById(req.userId);
//         res.status(200).json({ success: true, user });
//     } catch (error) {
//         res.status(500).json({ success: false, error: 'Server error' });
//     }
// });

module.exports = router;
