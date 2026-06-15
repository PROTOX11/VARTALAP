import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import { useAuth } from '../contexts/AuthContext';
import WowVideoPlayer from './../components/WowVideoPlayer';

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
  const [currentWow, setCurrentWow] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [wows, setWows] = useState<Wow[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }
        const res = await fetch(`${API_URL}/api/users/all-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        } else {
          console.error(`Fetch failed with status: ${res.status} ${res.statusText}`);
          const errorData = await res.json().catch(() => ({}));
          console.error('Error details:', errorData);
        }
      } catch (err) {
        console.error('Error fetching all users:', err);
      }
    };
    fetchAllUsers();
  }, [API_URL]);


  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setWows([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_URL}/api/posts/all-videos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
                profilePicture:
                  post.user?.profilePicture ||
                  'https://res.cloudinary.com/dyjlmweqb/image/upload/v1752616422/icon-7797704_640_an798v.png',
                followers: post.user?.followers || [],
              },
              video: post.video,
              thumbnail: '',
              caption: post.content,
              likes: post.likes?.length || 0,
              comments: post.comments?.length || 0,
              shares: post.shares?.length || 0,
              isLiked: post.likes?.includes(user?.id || user?._id),
            })),
          );
        } else {
          console.error(`Fetch failed with status: ${res.status} ${res.statusText}`);
          const errorData = await res.json().catch(() => ({}));
          console.error('Error details:', errorData);
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
  }, [user, API_URL]);


  const isFollowing = (person: any) => {
    const upToDatePerson = allUsers.find(
      p => (p.userId || p._id) === (person.userId || person._id || person.id),
    );
    return user && upToDatePerson && upToDatePerson.followers && upToDatePerson.followers.includes(user.id);
  };

  const handleFollowToggle = async (personToFollow: any) => {
    const personId = personToFollow._id || personToFollow.userId || personToFollow.id;
    if (!personId) {
      console.error('Cannot follow/unfollow: Person ID is undefined.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    const currentlyFollowing = isFollowing(personToFollow);
    const url = `${API_URL}/api/users/${currentlyFollowing ? 'unfollow' : 'follow'}/${personId}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
                    : p.followers || [],
              };
            }
            return p;
          }),
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
                      : wow.user.followers || [],
                },
              };
            }
            return wow;
          }),
        );
      } else {
        console.error(`Fetch failed with status: ${res.status} ${res.statusText}`);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (err) {
      console.error('Fetch error during follow toggle:', err);
    }
  };


  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowPlayIcon(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = async (wowId: string) => {
    const wowIndex = wows.findIndex(wow => wow.id === wowId);
    if (wowIndex === -1) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    const currentLikes = wows[wowIndex].likes;
    const currentIsLiked = wows[wowIndex].isLiked;

    setWows(prev =>
      prev.map((wow, index) =>
        index === wowIndex
          ? {
            ...wow,
            isLiked: !currentIsLiked,
            likes: currentIsLiked ? currentLikes - 1 : currentLikes + 1,
          }
          : wow,
      ),
    );

    try {
      const url = `${API_URL}/api/posts/${wowId}/like`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // Revert optimistic update
        setWows(prev =>
          prev.map((wow, index) =>
            index === wowIndex
              ? {
                ...wow,
                isLiked: currentIsLiked,
                likes: currentLikes,
              }
              : wow,
          ),
        );
        console.error(`Fetch failed with status: ${res.status} ${res.statusText}`);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      // Revert optimistic update
      setWows(prev =>
        prev.map((wow, index) =>
          index === wowIndex
            ? {
                ...wow,
                isLiked: currentIsLiked,
                likes: currentLikes,
              }
            : wow,
        ),
      );
      console.error('Error toggling like status:', error);
    }
  };


  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const videoElements = Array.from(container.querySelectorAll('div.snap-start'));

    const observerOptions = {
      root: container,
      rootMargin: '0px',
      threshold: 0.75,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = videoElements.indexOf(entry.target as HTMLElement);
          if (index !== -1) {
            setCurrentWow(index);
            setIsPlaying(true);
            setIsMuted(false);
            setShowPlayIcon(false);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    videoElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [wows.length]);

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
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Wows</h1>
          <ThemeToggle />
        </div>

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

        <div
          ref={scrollContainerRef}
          className="relative h-[calc(100svh-56px)] md:h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth md:pl-60"
        >
          {wows.map((wowItem, index) => (
            <div
              key={wowItem.id}
              className="relative h-full flex items-center justify-center snap-start"
            >
              <WowVideoPlayer
                wow={wowItem}
                isPlaying={index === currentWow && isPlaying}
                isMuted={isMuted}
                togglePlayPause={togglePlayPause}
                toggleMute={toggleMute}
                handleLike={handleLike}
              />

            </div>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Wows;
