const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// Use auth middleware from your existing setup
const auth = require('../middleware/auth');

// Get messages by chatId
router.get('/:chatId', auth, async (req, res) => {
    try {
        const chatId = req.params.chatId;
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: 'Invalid chatId' });
        }
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized for this chat' });
        }
        const messages = await Message.find({ chatId }).populate('sender receiver', 'username profilePicture');
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message
router.post('/', auth, async (req, res) => {
    try {
        const { chatId, receiverId, content } = req.body;
        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: 'Invalid chatId' });
        }
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: 'Invalid receiverId' });
        }
        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized for this chat' });
        }
        const newMessage = await Message.create({
            chatId,
            sender: req.user._id,
            receiver: receiverId,
            content: content.trim(),
        });
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: {
                _id: newMessage._id,
                content: newMessage.content,
                sender: newMessage.sender,
                createdAt: newMessage.createdAt,
            },
            updatedAt: new Date(),
        });
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;