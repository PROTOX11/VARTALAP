/**
 * Friend Request Real-Time Socket Handlers
 * @param {import('socket.io').Server} io 
 * @param {import('socket.io').Socket} socket 
 * @param {Map<string, string>} connectedUsers 
 */
function registerFriendHandlers(io, socket, connectedUsers) {
  // Emit friend request received
  socket.on('sendFriendRequest', ({ recipientId, request, notification }) => {
    const targetSocketId = connectedUsers.get(recipientId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('friendRequestReceived', { request, notification });
      io.to(targetSocketId).emit('notificationCreated', notification);
    }
  });

  // Emit friend request accepted
  socket.on('friendRequestAccepted', ({ senderId, friendInfo, notification }) => {
    const targetSocketId = connectedUsers.get(senderId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('friendRequestAccepted', { friendInfo, notification });
      io.to(targetSocketId).emit('notificationCreated', notification);
    }
  });

  // Emit friend request rejected
  socket.on('friendRequestRejected', ({ senderId, requestId }) => {
    const targetSocketId = connectedUsers.get(senderId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('friendRequestRejected', { requestId });
    }
  });

  // Emit friend request cancelled
  socket.on('friendRequestCancelled', ({ recipientId, requestId }) => {
    const targetSocketId = connectedUsers.get(recipientId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('friendRequestCancelled', { requestId });
    }
  });

  // Emit friend removed
  socket.on('friendRemoved', ({ friendId }) => {
    const targetSocketId = connectedUsers.get(friendId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('friendRemoved', { byUserId: socket.userId });
    }
  });
}

module.exports = registerFriendHandlers;
