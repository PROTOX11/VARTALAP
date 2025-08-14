require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const notificationsRoutes = require('./routes/notification');
const User = require('./models/User'); // assuming User model exists
const Post = require('./models/Post');


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/message', require('./routes/messages'));
app.use('/api', notificationsRoutes);

// Socket.io connection handling
const connectedUsers = new Map();
app.set('io', io);
app.set('connectedUsers', connectedUsers);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins
  socket.on('join', (userId) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return socket.disconnect(); // Kick unauthenticated users
    }
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    socket.broadcast.emit('userOnline', userId);
  });

  // Send message
  socket.on('sendMessage', async ({ receiverId, message, chatId }) => {
    try {
      // Validate inputs
      if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        return socket.emit('error', { message: 'Invalid chatId' });
      }
      if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return socket.emit('error', { message: 'Invalid receiverId' });
      }
      if (!message || typeof message !== 'string' || !message.trim()) {
        return socket.emit('error', { message: 'Message content is required' });
      }
      if (!socket.userId || !mongoose.Types.ObjectId.isValid(socket.userId)) {
        return socket.emit('error', { message: 'Invalid sender' });
      }

      // Verify chat exists and user is a participant
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(socket.userId)) {
        return socket.emit('error', { message: 'Not authorized for this chat' });
      }

      const newMessage = await Message.create({
        chatId,
        sender: socket.userId,
        receiver: receiverId,
        content: message.trim(),
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

      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', {
          sender: socket.userId,
          message: newMessage,
          chatId,
        });
      }

      socket.emit('messageSent', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: `Failed to send message: ${error.message}` });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    console.log("Incoming typing event:", data);
    const { receiver, isTyping } = data;
    const receiverSocketId = connectedUsers.get(receiver); // Fixed: Use receiver instead of receiverId
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        senderId: socket.userId,
        isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      socket.broadcast.emit('userOffline', socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
