const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

/**
 * Chat & Presence Socket Handlers
 * @param {import('socket.io').Server} io 
 * @param {import('socket.io').Socket} socket 
 * @param {Map<string, string>} connectedUsers 
 */
function registerChatHandlers(io, socket, connectedUsers) {
  // User joins
  socket.on('join', (userId) => {
    if (!userId) return;
    const cleanUserId = String(userId).trim();
    if (!mongoose.Types.ObjectId.isValid(cleanUserId)) {
      console.warn(`[Socket] Invalid userId on join: ${cleanUserId}`);
      return socket.disconnect();
    }
    // If this user already has a socket registered, clear the old one
    const existingSocketId = connectedUsers.get(cleanUserId);
    if (existingSocketId && existingSocketId !== socket.id) {
      console.log(`[Socket] User ${cleanUserId} reconnected — replacing socket ${existingSocketId} → ${socket.id}`);
    }
    connectedUsers.set(cleanUserId, socket.id);
    socket.userId = cleanUserId;
    console.log(`[Socket] User joined: ${cleanUserId} (socket: ${socket.id}), total online: ${connectedUsers.size}`);
    socket.broadcast.emit('userOnline', cleanUserId);
  });

  // Send message
  socket.on('sendMessage', async ({ receiverId, message, chatId }) => {
    try {
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
    const { receiver, isTyping } = data;
    const receiverSocketId = connectedUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        senderId: socket.userId,
        isTyping
      });
    }
  });
}

module.exports = registerChatHandlers;
