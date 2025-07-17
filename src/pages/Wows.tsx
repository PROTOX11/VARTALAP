import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Play, Pause, Volume2, VolumeX, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';

interface Wow {
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

const Wows: React.FC = () => {
  const navigate = useNavigate();
  const [currentWow, setCurrentWow] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [Wows, setWows] = useState<Wow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/posts/all-videos');
        if (res.ok) {
          const data = await res.json();
          setWows(
            data.map((post: any) => ({
              id: post._id,
              user: {
                username: post.user?.username || 'Unknown',
                profilePicture: post.user?.profilePicture || '',
              },
              video: post.video,
              thumbnail: '',
              caption: post.content,
              likes: post.likes?.length || 0,
              comments: post.comments?.length || 0,
              shares: post.shares?.length || 0,
              isLiked: false,
            }))
          );
        } else {
          setWows([]);
        }
      } catch (error) {
        setWows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const currentWowData = Wows[currentWow] || {};

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

  const handleLike = (WowId: string) => {
    setWows(prev =>
      prev.map(Wow =>
        Wow.id === WowId
          ? {
              ...Wow,
              isLiked: !Wow.isLiked,
              likes: Wow.isLiked ? Wow.likes - 1 : Wow.likes + 1
            }
          : Wow
      )
    );
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentWow > 0) {
      setCurrentWow(currentWow - 1);
    } else if (direction === 'down' && currentWow < Wows.length - 1) {
      setCurrentWow(currentWow + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-white">Wows</h1>
          <ThemeToggle />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Wows</h1>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            >
              <User size={20} />
            </button>
          </div>
        </div>

        {/* Wow Container */}
        <div className="relative h-screen flex items-center justify-center md:pl-60">
          {/* Video Background */}
          <div className="relative w-full max-w-md h-full bg-black rounded-lg overflow-hidden">
            {/* Video element */}
            {currentWowData.video && (
              <video
                ref={videoRef}
                src={currentWowData.video}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            )}
            {/* Video Overlay */}
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
                      src={currentWowData.user?.profilePicture}
                      alt={currentWowData.user?.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                    <span className="text-white font-semibold">
                      {currentWowData.user?.username}
                    </span>
                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                      Follow
                    </button>
                  </div>
                  <p className="text-white text-sm mb-3">
                    {currentWowData.caption}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={() => handleLike(currentWowData.id)}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                      <Heart
                        size={24}
                        className={currentWowData.isLiked ? 'text-red-500 fill-current' : 'text-white'}
                      />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {currentWowData.likes}
                    </span>
                  </button>

                  <button className="flex flex-col items-center space-y-1">
                    <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {currentWowData.comments}
                    </span>
                  </button>

                  <button className="flex flex-col items-center space-y-1">
                    <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                      <Share size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {currentWowData.shares}
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
          {currentWow > 0 && (
            <button
              onClick={() => handleScroll('up')}
              className="absolute left-1/2 top-4 transform -translate-x-1/2 p-2 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            >
              ↑
            </button>
          )}
          
          {currentWow < Wows.length - 1 && (
            <button
              onClick={() => handleScroll('down')}
              className="absolute left-1/2 bottom-20 md:bottom-4 transform -translate-x-1/2 p-2 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            >
              ↓
            </button>
          )}
        </div>

        {/* Wow Indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          {Wows.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentWow(index)}
              className={`w-2 h-8 rounded-full transition-colors ${
                index === currentWow ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Wows;