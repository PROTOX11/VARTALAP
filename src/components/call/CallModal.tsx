import React from 'react';
import { useCall } from '../../hooks/useCall';
import { LocalVideo } from './LocalVideo';
import { RemoteVideo } from './RemoteVideo';
import { CallControls } from './CallControls';
import { CallStatus } from './CallStatus';
import { ShieldCheck } from 'lucide-react';

export const CallModal: React.FC = () => {
  const {
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
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  if (callState === 'idle' || callState === 'incoming') {
    return null;
  }

  const remoteUser = receiver || caller;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col justify-between overflow-hidden animate-fadeIn">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 backdrop-blur-md rounded-xl border border-purple-500/30 text-purple-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg tracking-wide">
              {remoteUser?.username || 'VARTALAP Call'}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <span>{callType === 'video' ? 'Video Call' : 'Audio Call'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        {/* Live Call Duration & Connection Status */}
        <CallStatus state={callState} duration={duration} quality={connectionQuality} />
      </div>

      {/* Main Remote Video / Media Workspace */}
      <div className="relative flex-1 w-full h-full">
        <RemoteVideo
          stream={remoteStream}
          username={remoteUser?.username || 'User'}
          profilePicture={remoteUser?.profilePicture}
          isVideoCall={callType === 'video'}
          className="w-full h-full"
        />

        {/* Floating Local Video Preview (Picture-in-Picture) */}
        {callType === 'video' && (
          <div className="absolute bottom-28 right-4 sm:bottom-28 sm:right-8 z-30 w-28 h-40 sm:w-44 sm:h-60 shadow-2xl transition-all hover:scale-105">
            <LocalVideo stream={localStream} isVideoOff={isVideoOff} className="w-full h-full" />
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex justify-center bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isAudioOnly={callType === 'audio'}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={endCall}
        />
      </div>
    </div>
  );
};
