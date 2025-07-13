import React, { useState, useRef } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';

interface Reel {
  id: string;
  user: {
    username: string;
    profilePicture: string;
  };
  video: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

const Reels: React.FC = () => {
  const navigate = useNavigate();
  const [currentReel, setCurrentReel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mockReels: Reel[] = [
    {
      id: '1',
      user: {
        username: 'travel_enthusiast',
        profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: 'Beautiful sunset at the temple 🌅 #travel #sunset #temple',
      likes: 1234,
      comments: 89,
      shares: 45,
      isLiked: false
    },
    {
      id: '2',
      user: {
        username: 'foodie_adventures',
        profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: 'Making the perfect pasta 🍝 #cooking #food #recipe',
      likes: 892,
      comments: 67,
      shares: 23,
      isLiked: true
    },
    {
      id: '3',
      user: {
        username: 'fitness_guru',
        profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: 'Morning workout routine 💪 #fitness #workout #motivation',
      likes: 2156,
      comments: 134,
      shares: 78,
      isLiked: false
    }
  ];

  const [reels, setReels] = useState(mockReels);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = (reelId: string) => {
    setReels(prev =>
      prev.map(reel =>
        reel.id === reelId
          ? {
              ...reel,
              isLiked: !reel.isLiked,
              likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
            }
          : reel
      )
    );
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentReel > 0) {
      setCurrentReel(currentReel - 1);
    } else if (direction === 'down' && currentReel < reels.length - 1) {
      setCurrentReel(currentReel + 1);
    }
  };

  const currentReelData = reels[currentReel];

  return (
    <div className="flex min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Reels</h1>
          <ThemeToggle />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Reels</h1>
            <ThemeToggle />
          </div>
        </div>

        {/* Reel Container */}
        <div className="relative h-screen flex items-center justify-center">
          {/* Video Background */}
          <div className="relative w-full max-w-md h-full bg-black rounded-lg overflow-hidden">
            <img
              src={currentReelData.thumbnail}
              alt="Reel thumbnail"
              className="w-full h-full object-cover"
            />
            
            {/* Video Overlay (In a real app, this would be an actual video) */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button
                onClick={togglePlayPause}
                className="p-4 bg-white/20 rounded-full backdrop-blur-sm"
              >
                {isPlaying ? (
                  <Pause size={32} className="text-white" />
                ) : (
                  <Play size={32} className="text-white ml-1" />
                )}
              </button>
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                onClick={toggleMute}
                className="p-2 bg-black/50 rounded-full backdrop-blur-sm"
              >
                {isMuted ? (
                  <VolumeX size={20} className="text-white" />
                ) : (
                  <Volume2 size={20} className="text-white" />
                )}
              </button>
            </div>

            {/* User Info and Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-end justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={currentReelData.user.profilePicture}
                      alt={currentReelData.user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                    <span className="text-white font-semibold">
                      {currentReelData.user.username}
                    </span>
                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                      Follow
                    </button>
                  </div>
                  <p className="text-white text-sm mb-3">
                    {currentReelData.caption}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={() => handleLike(currentReelData.id)}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                      <Heart
                        size={24}
                        className={currentReelData.isLiked ? 'text-red-500 fill-current' : 'text-white'}
                      />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {currentReelData.likes}
                    </span>
                  </button>

                  <button className="flex flex-col items-center space-y-1">
                    <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {currentReelData.comments}
                    </span>
                  </button>

                  <button className="flex flex-col items-center space-y-1">
                    <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                      <Share size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {currentReelData.shares}
                    </span>
                  </button>

                  <button className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                    <MoreHorizontal size={24} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentReel > 0 && (
            <button
              onClick={() => handleScroll('up')}
              className="absolute left-1/2 top-4 transform -translate-x-1/2 p-2 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            >
              ↑
            </button>
          )}
          
          {currentReel < reels.length - 1 && (
            <button
              onClick={() => handleScroll('down')}
              className="absolute left-1/2 bottom-20 md:bottom-4 transform -translate-x-1/2 p-2 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            >
              ↓
            </button>
          )}
        </div>

        {/* Reel Indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          {reels.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReel(index)}
              className={`w-2 h-8 rounded-full transition-colors ${
                index === currentReel ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Reels;