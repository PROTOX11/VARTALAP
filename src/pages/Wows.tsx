import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Heart, MessageCircle, Volume2, VolumeX, User, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import { useAuth } from '../contexts/AuthContext';

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

const Wows: React.FC = () => {
  const navigate = useNavigate();
  // We'll manage currentWow visually by scroll position, not directly by state for scroll snapping
  const [currentWow, setCurrentWow] = useState(0); // Still useful for indicators and data fetching
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]); // Array of refs for each video
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for the main scrollable container

  const [wows, setWows] = useState<Wow[]>([]);
  const [loading, setLoading] = useState(true);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const { user } = useAuth();

  // Fetch all users to get their follower information
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch('/api/users/all-users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        } else {
          console.error('Failed to fetch all users for follow data.');
        }
      } catch (err) {
        console.error('Error fetching all users:', err);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/posts/all-videos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setWows(
            data.map((post: any) => ({
              id: post._id,
              user: {
                _id: post.user?._id,
                userId: post.user?.userId,
                username: post.user?.username || 'Unknown',
                profilePicture: post.user?.profilePicture || 'https://res.cloudinary.com/dyjlmweqb/image/upload/v1752616422/icon-7797704_640_an798v.png',
                followers: post.user?.followers || [],
              },
              video: post.video,
              thumbnail: '',
              caption: post.content,
              likes: post.likes?.length || 0,
              comments: post.comments?.length || 0,
              shares: post.shares?.length || 0,
              isLiked: post.likes?.includes(user?.id || user?._id),
            }))
          );
        } else {
          const errorText = await res.text();
          console.error('Failed to fetch videos:', res.status, errorText);
          setWows([]);
        }
      } catch (error) {
        console.error('Fetch videos error:', error);
        setWows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [user]);

  const isFollowing = (person: any) => {
    const upToDatePerson = allUsers.find(p => (p.userId || p._id) === (person.userId || person._id || person.id));
    return user && upToDatePerson && upToDatePerson.followers && upToDatePerson.followers.includes(user.id);
  };

  const handleFollowToggle = async (personToFollow: any) => {
    const personId = personToFollow._id || personToFollow.userId || personToFollow.id;
    if (!personId) {
      console.error("Cannot follow/unfollow: Person ID is undefined.");
      return;
    }

    const currentlyFollowing = isFollowing(personToFollow);
    const url = `/api/users/${currentlyFollowing ? 'unfollow' : 'follow'}/${personId}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setAllUsers(prevUsers =>
          prevUsers.map(p => {
            if ((p.userId || p._id || p.id) === personId) {
              return {
                ...p,
                followers: currentlyFollowing
                  ? p.followers.filter((id: string) => user && id !== user.id)
                  : user
                    ? [...(p.followers || []), user.id]
                    : p.followers || []
              };
            }
            return p;
          })
        );
        setWows(prevWows =>
          prevWows.map(wow => {
            if ((wow.user.userId || wow.user._id) === personId) {
              return {
                ...wow,
                user: {
                  ...wow.user,
                  followers: currentlyFollowing
                    ? wow.user.followers.filter((id: string) => user && id !== user.id)
                    : user
                      ? [...(wow.user.followers || []), user.id]
                      : wow.user.followers || []
                }
              };
            }
            return wow;
          })
        );
      } else {
        const errorText = await res.text();
        console.error('Failed to toggle follow status:', res.status, errorText);
      }
    } catch (err) {
      console.error('Fetch error during follow toggle:', err);
    }
  };

  // Get the current video ref dynamically
  const currentVideoRef = videoRefs.current[currentWow];

  const togglePlayPause = () => {
    console.log("Video tapped! Toggling play/pause...");
    if (currentVideoRef) {
      if (isPlaying) {
        currentVideoRef.pause();
        console.log("Video paused.");
      } else {
        currentVideoRef.play().catch(error => {
          console.warn("Video autoplay prevented:", error);
          setIsPlaying(false);
        });
        console.log("Video playing.");
      }
      setIsPlaying(!isPlaying);
    } else {
      console.log("Current Video ref is null, cannot play/pause.");
    }
  };

  const toggleMute = () => {
    console.log("Mute button tapped! Toggling mute...");
    if (currentVideoRef) {
      const newMutedState = !currentVideoRef.muted;
      currentVideoRef.muted = newMutedState;
      setIsMuted(newMutedState);
      console.log(`Video muted state changed to: ${newMutedState}`);
    } else {
      console.log("Current Video ref is null, cannot mute.");
    }
  };

  const handleLike = async (wowId: string) => {
    const wowIndex = wows.findIndex(wow => wow.id === wowId);
    if (wowIndex === -1) return;

    const currentLikes = wows[wowIndex].likes;
    const currentIsLiked = wows[wowIndex].isLiked;

    setWows(prev =>
      prev.map((wow, index) =>
        index === wowIndex
          ? {
            ...wow,
            isLiked: !currentIsLiked,
            likes: currentIsLiked ? currentLikes - 1 : currentLikes + 1
          }
          : wow
      )
    );

    try {
      const url = `/api/posts/${currentIsLiked ? 'unlike' : 'like'}/${wowId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        setWows(prev =>
          prev.map((wow, index) =>
            index === wowIndex
              ? {
                ...wow,
                isLiked: currentIsLiked,
                likes: currentLikes
              }
              : wow
          )
        );
        console.error('Failed to toggle like status:', res.status, await res.text());
      }
    } catch (error) {
      setWows(prev =>
        prev.map((wow, index) =>
          index === wowIndex
            ? {
              ...wow,
              isLiked: currentIsLiked,
              likes: currentLikes
            }
            : wow
        )
      );
      console.error('Error toggling like status:', error);
    }
  };

  // Instead of explicitly controlling scroll, we'll let native scroll with snap handle it
  // This function will now update `currentWow` based on scroll position
  const handleScrollEvent = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, clientHeight } = scrollContainerRef.current;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentWow) {
        // Pause and mute all videos except the new one
        videoRefs.current.forEach((video, idx) => {
          if (video) {
            video.pause();
            video.currentTime = 0;
            video.muted = true;
          }
        });
        // Play and unmute the new video if available
        const newVideo = videoRefs.current[newIndex];
        if (newVideo) {
          newVideo.muted = false;
          newVideo.play().catch(() => { });
        }
        setCurrentWow(newIndex);
        setIsPlaying(true); // Set playing state for the new video
        setIsMuted(false); // Unmute the new video by default
      }
    }
  }, [currentWow]);

  // Effect for video playback and mute state synchronization
  useEffect(() => {
    // Pause all videos first
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentWow) {
        video.pause();
      }
    });

    // Play/manage current video
    if (currentVideoRef) {
      console.log(`useEffect: Current video wow changed to index ${currentWow}`);
      console.log(`useEffect: Initializing mute state from videoRef.current.muted (${currentVideoRef.muted})`);
      setIsMuted(currentVideoRef.muted);

      if (isPlaying) {
        console.log("useEffect: Attempting to play video.");
        currentVideoRef.play().catch(error => {
          console.warn("useEffect: Video autoplay prevented for new wow:", error);
          setIsPlaying(false);
          setIsMuted(currentVideoRef.muted);
        });
      } else {
        console.log("useEffect: Pausing video.");
        currentVideoRef.pause();
      }
    }
  }, [currentWow, isPlaying, wows.length, currentVideoRef]); // Added wows.length to ensure re-run on data load

  // Dedicated useEffect for mute state synchronization
  useEffect(() => {
    if (currentVideoRef) {
      console.log(`useEffect: isMuted state changed to ${isMuted}. Setting video muted property.`);
      currentVideoRef.muted = isMuted;
    }
  }, [isMuted, currentVideoRef]); // Added currentVideoRef to ensure it applies to the active video

  // Keyboard Navigation (Up/Down Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (scrollContainerRef.current) {
        const { scrollTop, clientHeight } = scrollContainerRef.current;
        if (event.key === 'ArrowUp') {
          event.preventDefault(); // Prevent default browser scroll
          scrollContainerRef.current.scrollTo({
            top: scrollTop - clientHeight,
            behavior: 'smooth'
          });
        } else if (event.key === 'ArrowDown') {
          event.preventDefault(); // Prevent default browser scroll
          scrollContainerRef.current.scrollTo({
            top: scrollTop + clientHeight,
            behavior: 'smooth'
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // No dependencies needed as it directly controls scroll ref

  // Attaches scroll listener to the container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollEvent);
      return () => {
        container.removeEventListener('scroll', handleScrollEvent);
      };
    }
  }, [handleScrollEvent]);


  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (wows.length === 0) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-white">No wows available.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 relative overflow-hidden"> {/* Changed to overflow-hidden here */}
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

        {/* Main Scrollable Wow Container */}
        {/* The 'snap-y' and 'snap-mandatory' classes are for smooth scrolling/snapping */}
        <div
          ref={scrollContainerRef}
          className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth md:pl-60"
        >
          {wows.map((wowItem, index) => (
            <div
              key={wowItem.id}
              className="relative h-screen flex items-center justify-center snap-start" // snap-start makes it snap to top
            >
              <div className="relative w-full max-w-md h-full bg-black rounded-lg overflow-hidden">
                {wowItem.video && (
                  <video
                    ref={el => videoRefs.current[index] = el} // Assign ref dynamically
                    src={wowItem.video}
                    className="w-full h-full object-cover"
                    autoPlay={index === currentWow && isPlaying} // Only autoPlay if it's the current active video
                    loop
                    onClick={togglePlayPause}
                    onPlay={() => {
                      if (index === currentWow) setIsPlaying(true);
                    }}
                    onPause={() => {
                      if (index === currentWow) setIsPlaying(false);
                    }}
                  />
                )}

                {/* Play/Pause overlay icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {index === currentWow && !isPlaying && ( // Only show for current wow
                    <div className="p-4 bg-black/50 rounded-full backdrop-blur-sm">
                      <Play size={40} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Controls (Mute button) */}
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
                          src={wowItem.user?.profilePicture}
                          alt={wowItem.user?.username}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        />
                        <span className="text-white font-semibold">
                          {wowItem.user?.username}
                        </span>
                        {user && wowItem.user && (user.id !== (wowItem.user.userId || wowItem.user._id)) && (
                          <button
                            className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${isFollowing(wowItem.user)
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(wowItem.user);
                            }}
                          >
                            {isFollowing(wowItem.user) ? 'Unfollow' : 'Follow'}
                          </button>
                        )}
                      </div>
                      <p className="text-white text-sm mb-3">
                        {wowItem.caption}
                      </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                      <button
                        onClick={() => handleLike(wowItem.id)}
                        className="flex flex-col items-center space-y-1"
                      >
                        <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                          <Heart
                            size={24}
                            className={wowItem.isLiked ? 'text-red-500 fill-current' : 'text-white'}
                          />
                        </div>
                        <span className="text-white text-xs font-medium">
                          {wowItem.likes}
                        </span>
                      </button>

                      <button className="flex flex-col items-center space-y-1">
                        <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                          <MessageCircle size={24} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-medium">
                          {wowItem.comments}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Wows;