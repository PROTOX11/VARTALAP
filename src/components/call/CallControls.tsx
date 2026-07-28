import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isAudioOnly: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isVideoOff,
  isAudioOnly,
  onToggleMute,
  onToggleVideo,
  onEndCall,
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 sm:space-x-6 px-6 py-3.5 bg-gray-900/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
      {/* Microphone Mute Toggle */}
      <button
        onClick={onToggleMute}
        className={`p-3 sm:p-4 rounded-full transition-all duration-200 active:scale-95 shadow-lg ${
          isMuted
            ? 'bg-red-500/90 text-white hover:bg-red-600 ring-2 ring-red-500/50'
            : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
        }`}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Video Toggle (Hidden for Audio-Only calls) */}
      {!isAudioOnly && (
        <button
          onClick={onToggleVideo}
          className={`p-3 sm:p-4 rounded-full transition-all duration-200 active:scale-95 shadow-lg ${
            isVideoOff
              ? 'bg-red-500/90 text-white hover:bg-red-600 ring-2 ring-red-500/50'
              : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
          }`}
          title={isVideoOff ? 'Enable Camera' : 'Disable Camera'}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
      )}

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="p-3.5 sm:p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 active:scale-95 shadow-xl shadow-red-600/40 ring-4 ring-red-600/30"
        title="End Call"
      >
        <PhoneOff size={22} />
      </button>
    </div>
  );
};
