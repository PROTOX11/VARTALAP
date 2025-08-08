const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ error: 'Invalid participantId' });
    }
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, participantId], $size: 2 },
      isGroup: false,
    });
    if (!chat) {
      chat = await Chat.create({
        participants: [req.userId, participantId],
        isGroup: false,
      });
    }
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

module.exports = router;