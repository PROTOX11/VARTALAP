const mongoose = require('mongoose');
const User = require('../models/User');
const callService = require('../services/call.service');

/**
 * WebRTC Signaling Socket Handlers
 * @param {import('socket.io').Server} io 
 * @param {import('socket.io').Socket} socket 
 * @param {Map<string, string>} connectedUsers 
 */
function registerCallHandlers(io, socket, connectedUsers) {
  
  // Initiate call (Client -> Server)
  socket.on('callUser', async ({ userToCall, offer, callType }) => {
    try {
      const callerId = socket.userId ? String(socket.userId).trim() : null;
      const targetUserId = userToCall ? String(userToCall).trim() : null;

      console.log(`[CallSignaling] Processing callUser: caller=${callerId}, target=${targetUserId}, type=${callType}`);

      if (!callerId || !mongoose.Types.ObjectId.isValid(callerId)) {
        console.warn(`[CallSignaling] Unauthorized caller: ${callerId}`);
        return socket.emit('callError', { message: 'Unauthorized caller' });
      }

      if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        console.warn(`[CallSignaling] Invalid target user: ${targetUserId}`);
        return socket.emit('callError', { message: 'Invalid target user' });
      }

      // Check if target user is online in connectedUsers Map
      const targetSocketId = connectedUsers.get(targetUserId);
      if (!targetSocketId) {
        console.log(`[CallSignaling] Target user ${targetUserId} is offline or not found in connectedUsers map.`);
        return socket.emit('callRejected', { reason: 'offline', message: 'User is offline' });
      }

      // Check if target user or caller is already in another call
      if (callService.isUserInCall(targetUserId)) {
        console.log(`[CallSignaling] Target user ${targetUserId} is busy.`);
        return socket.emit('userBusy', { to: targetUserId });
      }

      if (callService.isUserInCall(callerId)) {
        console.log(`[CallSignaling] Caller ${callerId} is already in another call.`);
        return socket.emit('callError', { message: 'You are already in an active call session' });
      }

      // Get caller info for notification
      const callerUser = await User.findById(callerId).select('username profilePicture');
      if (!callerUser) {
        return socket.emit('callError', { message: 'Caller profile not found' });
      }

      // Track active call in server service
      callService.createCall(callerId, targetUserId, callType || 'video');

      console.log(`[CallSignaling] Emitting incomingCall to target socket ${targetSocketId}`);

      // Emit incomingCall to recipient — stringify _id so client always gets a plain string
      io.to(targetSocketId).emit('incomingCall', {
        from: callerId,
        callerInfo: {
          _id: String(callerUser._id),
          username: callerUser.username,
          profilePicture: callerUser.profilePicture
        },
        offer,
        callType: callType || 'video'
      });

      // Acknowledge caller that ringing has started
      socket.emit('ringing', { to: targetUserId });

    } catch (err) {
      console.error('Error handling callUser:', err);
      socket.emit('callError', { message: 'Failed to initialize call' });
    }
  });

  // Answer call (Client -> Server)
  socket.on('answerCall', ({ to, answer }) => {
    const callerSocketId = connectedUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('callAccepted', { answer });
    } else {
      socket.emit('callError', { message: 'Caller is no longer connected' });
    }
  });

  // Reject call (Client -> Server)
  socket.on('rejectCall', ({ to }) => {
    callService.endCall(socket.userId);
    const callerSocketId = connectedUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('callRejected', { from: socket.userId, reason: 'declined' });
    }
  });

  // Cancel call before pickup (Client -> Server)
  socket.on('cancelCall', ({ to }) => {
    callService.endCall(socket.userId);
    const targetSocketId = connectedUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('callCancelled', { from: socket.userId });
    }
  });

  // Relay ICE Candidate (Client -> Server)
  socket.on('iceCandidate', ({ to, candidate }) => {
    const targetSocketId = connectedUsers.get(to);
    if (targetSocketId && candidate) {
      io.to(targetSocketId).emit('receiveIceCandidate', { candidate, from: socket.userId });
    }
  });

  // End Call (Client -> Server)
  socket.on('endCall', ({ to }) => {
    callService.endCall(socket.userId);
    const targetSocketId = connectedUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('callEnded', { from: socket.userId });
    }
  });
}

module.exports = registerCallHandlers;
