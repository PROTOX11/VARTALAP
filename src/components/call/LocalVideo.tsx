import React, { useEffect, useRef } from 'react';
import { VideoOff } from 'lucide-react';

interface LocalVideoProps {
  stream: MediaStream | null;
  isVideoOff: boolean;
  username?: string;
  className?: string;
}

export const LocalVideo: React.FC<LocalVideoProps> = ({ stream, isVideoOff, username, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative overflow-hidden bg-gray-900 rounded-2xl shadow-xl border border-white/20 ${className}`}>
      {!isVideoOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Always mute local video element to avoid audio feedback
          className="w-full h-full object-cover transform -scale-x-100" // Mirrored video
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400 p-4">
          <VideoOff size={32} className="mb-2 text-gray-500 animate-pulse" />
          <span className="text-xs font-medium">{username || 'You'}</span>
          <span className="text-[10px] text-gray-500 mt-0.5">Camera Off</span>
        </div>
      )}
    </div>
  );
};
