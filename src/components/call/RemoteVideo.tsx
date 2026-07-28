import React, { useEffect, useRef } from 'react';
import { User, Volume2 } from 'lucide-react';

interface RemoteVideoProps {
  stream: MediaStream | null;
  username: string;
  profilePicture?: string;
  isVideoCall: boolean;
  className?: string;
}

export const RemoteVideo: React.FC<RemoteVideoProps> = ({
  stream,
  username,
  profilePicture,
  isVideoCall,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideoTrack = isVideoCall && stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

  return (
    <div className={`relative overflow-hidden bg-gray-950 flex items-center justify-center ${className}`}>
      {/* Remote Video Stream Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasVideoTrack ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
        }`}
      />

      {/* Fallback Audio Call / Avatar view */}
      {!hasVideoTrack && (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="relative">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={username}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-purple-500/40 shadow-2xl animate-pulse"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center ring-4 ring-purple-500/40 shadow-2xl">
                <User size={56} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-2 bg-purple-600 text-white rounded-full shadow-lg">
              <Volume2 size={16} className="animate-bounce" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">{username}</h3>
            <p className="text-xs text-purple-300/80 mt-1 font-medium">VARTALAP Audio Stream</p>
          </div>
        </div>
      )}
    </div>
  );
};
