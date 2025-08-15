import React, { useRef, useEffect } from 'react';
import { Heart, MessageCircle, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Wow {
  id: string;
  user: {
    _id?: string;
    userId?: string;
    username: string;
    profilePicture: string;
    followers: string[];
  };
  video: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

interface WowVideoPlayerProps {
  wow: Wow;
  isPlaying: boolean;
  isMuted: boolean;
  togglePlayPause: () => void;
  toggleMute: () => void;
  handleLike: (wowId: string) => void;
}

const WowVideoPlayer: React.FC<WowVideoPlayerProps> = ({
  wow,
  isPlaying,
  isMuted,
  togglePlayPause,
  toggleMute,
  handleLike,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(error => {
          console.warn("Video autoplay prevented:", error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleProfileClick = () => {
    const userId = wow.user._id || wow.user.userId;
    if (!userId) {
      console.error('Invalid user ID:', wow.user);
      alert('Cannot navigate to profile: Invalid user ID.');
      return;
    }
    navigate(`/friend/${userId}`);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={wow.video}
        className="w-full h-full object-contain"
        loop
        onClick={togglePlayPause}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isPlaying && (
          <div className="p-4 bg-black/50 rounded-full backdrop-blur-sm">
            <Play size={40} className="text-white" />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center space-x-3 mb-2">
              <img
                src={wow.user?.profilePicture}
                alt={wow.user?.username}
                className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                onClick={handleProfileClick}
              />
              <span className="text-white font-semibold">
                {wow.user?.username}
              </span>
            </div>
            <p className="text-white text-sm mb-3">
              {wow.caption}
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={toggleMute}
              className="flex flex-col items-center"
            >
              <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                {isMuted ? (
                  <VolumeX size={24} className="text-white" />
                ) : (
                  <Volume2 size={24} className="text-white" />
                )}
              </div>
            </button>
            <button
              onClick={() => handleLike(wow.id)}
              className="flex flex-col items-center space-y-1"
            >
              <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                <Heart
                  size={24}
                  className={wow.isLiked ? 'text-red-500 fill-current' : 'text-white'}
                />
              </div>
              <span className="text-white text-xs font-medium">
                {wow.likes}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WowVideoPlayer;
