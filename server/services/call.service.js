/**
 * Server-Side Active Call Service
 * Manages active 1-to-1 audio and video call sessions across connected sockets.
 */

class CallService {
  constructor() {
    // Map of active calls: callId -> { callId, callerId, receiverId, callType, startTime, state }
    this.activeCalls = new Map();
    // Map of user to callId: userId -> callId
    this.userToCallMap = new Map();
  }

  createCall(callerId, receiverId, callType) {
    const callId = `call_${callerId}_${receiverId}_${Date.now()}`;
    const callSession = {
      callId,
      callerId,
      receiverId,
      callType,
      startTime: Date.now(),
      state: 'calling'
    };

    this.activeCalls.set(callId, callSession);
    this.userToCallMap.set(callerId, callId);
    this.userToCallMap.set(receiverId, callId);

    return callSession;
  }

  getCallByUserId(userId) {
    const callId = this.userToCallMap.get(userId);
    if (!callId) return null;
    return this.activeCalls.get(callId) || null;
  }

  isUserInCall(userId) {
    return this.userToCallMap.has(userId);
  }

  updateCallState(callId, state) {
    const session = this.activeCalls.get(callId);
    if (session) {
      session.state = state;
      return true;
    }
    return false;
  }

  endCall(userId) {
    const callId = this.userToCallMap.get(userId);
    if (!callId) return null;

    const session = this.activeCalls.get(callId);
    if (session) {
      this.userToCallMap.delete(session.callerId);
      this.userToCallMap.delete(session.receiverId);
      this.activeCalls.delete(callId);
      return session;
    }

    this.userToCallMap.delete(userId);
    return null;
  }
}

module.exports = new CallService();
