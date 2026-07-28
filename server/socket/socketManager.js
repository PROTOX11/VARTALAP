const registerChatHandlers = require('./chat.socket');
const registerCallHandlers = require('./call.socket');
const registerFriendHandlers = require('./friend.socket');
const callService = require('../services/call.service');

/**
 * Main Socket Manager
 * @param {import('socket.io').Server} io 
 * @param {Map<string, string>} connectedUsers 
 */
function initSocketManager(io, connectedUsers) {
  io.on('connection', (socket) => {

    // Register Chat & Presence Handlers
    registerChatHandlers(io, socket, connectedUsers);

    // Register WebRTC Signaling Handlers
    registerCallHandlers(io, socket, connectedUsers);

    // Register Friend Request Handlers
    registerFriendHandlers(io, socket, connectedUsers);

    // Global disconnect handling
    socket.on('disconnect', () => {
      if (socket.userId) {
        // Clean up any ongoing call session if user disconnects
        const callSession = callService.endCall(socket.userId);
        if (callSession) {
          const peerId = callSession.callerId === socket.userId ? callSession.receiverId : callSession.callerId;
          const peerSocketId = connectedUsers.get(peerId);
          if (peerSocketId) {
            io.to(peerSocketId).emit('callEnded', { from: socket.userId, reason: 'disconnected' });
          }
        }

        // Only delete from connectedUsers if the disconnecting socket is the current registered socket!
        if (connectedUsers.get(socket.userId) === socket.id) {
          connectedUsers.delete(socket.userId);
          socket.broadcast.emit('userOffline', socket.userId);
        }
      }
    });

  });
}

module.exports = initSocketManager;
