import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { RTC_CONFIG, getMediaConstraints, stopStreamTracks, CallUserPayload } from '../services/call.service';
import toast from 'react-hot-toast';

export type CallState =
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'rejected'
  | 'busy'
  | 'failed'
  | 'cancelled'
  | 'missed';

export type CallType = 'audio' | 'video';

interface CallContextType {
  callState: CallState;
  callType: CallType;
  caller: CallUserPayload | null;
  receiver: CallUserPayload | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: number;
  connectionQuality: 'excellent' | 'good' | 'poor';
  startCall: (targetUserId: string, targetUserInfo: CallUserPayload, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<CallType>('video');
  const [caller, setCaller] = useState<CallUserPayload | null>(null);
  const [receiver, setReceiver] = useState<CallUserPayload | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // Audio ringtone initializer
  useEffect(() => {
    ringtoneRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
    ringtoneRef.current.loop = true;
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, []);

  const playRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.play().catch(() => {});
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  // Cleanup helper function
  const cleanupCall = useCallback(() => {
    stopRingtone();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    stopStreamTracks(localStream);
    stopStreamTracks(remoteStream);

    setLocalStream(null);
    setRemoteStream(null);
    setCaller(null);
    setReceiver(null);
    incomingOfferRef.current = null;
    setIsMuted(false);
    setIsVideoOff(false);
    setDuration(0);
    setCallState('idle');
  }, [localStream, remoteStream, stopRingtone]);

  // Duration timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Handle WebRTC PeerConnection creation
  const createPeerConnection = useCallback((targetUserId: string) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('iceCandidate', { to: targetUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    const handleStateChange = () => {
      const connState = pc.connectionState;
      const iceState = pc.iceConnectionState;

      if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
        setCallState('connected');
        setConnectionQuality('excellent');
        stopRingtone();
      } else if (connState === 'connecting' || iceState === 'checking') {
        setCallState((prev) => (prev === 'connected' ? 'connected' : 'connecting'));
      } else if (connState === 'disconnected' || iceState === 'disconnected') {
        setCallState('reconnecting');
        setConnectionQuality('poor');
      } else if (connState === 'failed' || iceState === 'failed') {
        toast.error('Call connection failed');
        setCallState('failed');
        cleanupCall();
      }
    };

    pc.onconnectionstatechange = handleStateChange;
    pc.oniceconnectionstatechange = handleStateChange;

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, stopRingtone, cleanupCall]);

  // Socket event listeners for signaling
  useEffect(() => {
    if (!socket) return;

    // Incoming call offer
    const handleIncomingCall = ({ from, callerInfo, offer, callType: incomingType }: any) => {
      if (callState !== 'idle') {
        socket.emit('rejectCall', { to: String(from).trim() });
        return;
      }
      // Normalize caller _id to string
      const normalizedCaller = { ...callerInfo, _id: String(callerInfo?._id || from).trim() };
      setCaller(normalizedCaller);
      setCallType(incomingType);
      incomingOfferRef.current = offer;
      setCallState('incoming');
      playRingtone();
    };

    // Caller receives ringing notification
    const handleRinging = () => {
      setCallState('ringing');
    };

    // Callee accepted call -> Caller receives SDP answer
    const handleCallAccepted = async ({ answer }: any) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallState('connecting');
          stopRingtone();
        }
      } catch (err) {
        console.error('Failed to set remote description on call accept:', err);
        cleanupCall();
      }
    };

    // Callee rejected call
    const handleCallRejected = () => {
      toast.error('Call was declined');
      setCallState('rejected');
      setTimeout(() => cleanupCall(), 1500);
    };

    // Caller cancelled call before pickup
    const handleCallCancelled = () => {
      toast('Call was cancelled by caller');
      setCallState('cancelled');
      cleanupCall();
    };

    // Remote peer ended call
    const handleCallEnded = () => {
      toast('Call ended');
      setCallState('ended');
      cleanupCall();
    };

    // Remote user busy
    const handleUserBusy = () => {
      toast.error('User is currently in another call');
      setCallState('busy');
      setTimeout(() => cleanupCall(), 2000);
    };

    // Receive trickle ICE Candidate
    const handleReceiveIceCandidate = async ({ candidate }: any) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding received ICE candidate:', err);
      }
    };

    socket.on('incomingCall', handleIncomingCall);
    socket.on('ringing', handleRinging);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callCancelled', handleCallCancelled);
    socket.on('callEnded', handleCallEnded);
    socket.on('userBusy', handleUserBusy);
    socket.on('receiveIceCandidate', handleReceiveIceCandidate);

    return () => {
      socket.off('incomingCall', handleIncomingCall);
      socket.off('ringing', handleRinging);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callCancelled', handleCallCancelled);
      socket.off('callEnded', handleCallEnded);
      socket.off('userBusy', handleUserBusy);
      socket.off('receiveIceCandidate', handleReceiveIceCandidate);
    };
  }, [socket, callState, playRingtone, stopRingtone, cleanupCall]);

  // Initiate call
  const startCall = async (targetUserId: string, targetUserInfo: CallUserPayload, type: CallType) => {
    if (!socket || !isConnected) {
      toast.error('Socket disconnected. Please check internet.');
      return;
    }

    // Always normalize to plain string to avoid ObjectId map key mismatches
    const targetId = String(targetUserId).trim();

    try {
      setCallState('calling');
      setCallType(type);
      setReceiver({ ...targetUserInfo, _id: targetId });

      // Get local camera/mic stream
      const stream = await navigator.mediaDevices.getUserMedia(getMediaConstraints(type));
      setLocalStream(stream);
      if (type === 'audio') setIsVideoOff(true);

      // Create PeerConnection & add tracks
      const pc = createPeerConnection(targetId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Create SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Emit callUser to recipient over Socket.IO
      socket.emit('callUser', {
        userToCall: targetId,
        offer,
        callType: type,
      });

    } catch (err: any) {
      console.error('Error starting call:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone/Camera permission denied.');
      } else {
        toast.error('Failed to access camera/microphone.');
      }
      cleanupCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!socket || !caller || !incomingOfferRef.current) return;

    // Normalize caller ID to plain string
    const callerId = String(caller._id).trim();

    try {
      stopRingtone();
      setCallState('connecting');

      // Get local camera/mic stream
      const stream = await navigator.mediaDevices.getUserMedia(getMediaConstraints(callType));
      setLocalStream(stream);
      if (callType === 'audio') setIsVideoOff(true);

      // Create PeerConnection & add tracks
      const pc = createPeerConnection(callerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Set remote offer & create SDP Answer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send SDP Answer to caller
      socket.emit('answerCall', { to: callerId, answer });

    } catch (err: any) {
      console.error('Error accepting call:', err);
      toast.error('Failed to accept call.');
      cleanupCall();
    }
  };

  // Reject call
  const rejectCall = () => {
    if (caller && socket) {
      socket.emit('rejectCall', { to: caller._id });
    }
    cleanupCall();
  };

  // End active call or cancel before pickup
  const endCall = () => {
    const peerId = receiver?._id || caller?._id;
    if (peerId && socket) {
      if (callState === 'calling' || callState === 'ringing') {
        socket.emit('cancelCall', { to: peerId });
      } else {
        socket.emit('endCall', { to: peerId });
      }
    }
    cleanupCall();
  };

  // Mute / Unmute microphone
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Enable / Disable camera
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        caller,
        receiver,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        duration,
        connectionQuality,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within a CallProvider');
  }
  return context;
};
