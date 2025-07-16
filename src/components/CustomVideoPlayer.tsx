import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateProgress = () => {
        setProgress((video.currentTime / video.duration) * 100);
      };
      video.addEventListener('timeupdate', updateProgress);
      return () => {
        video.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, []);

  return (
    <div className="relative w-full h-full" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        loop
        autoPlay
        muted={isMuted}
        className="w-full h-full object-contain"
      />
      <div className="absolute top-2 right-2">
        <button
          onClick={toggleMute}
          className="p-2 bg-black bg-opacity-50 rounded-full text-white"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-500 bg-opacity-50">
        <div
          className="h-full bg-red-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
