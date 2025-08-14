import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, UserPlus, UserCheck, Grid, Heart, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';

type FriendPost = any;
type FriendUser = any;

const FriendProfile: React.FC = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const { user, setUser } = useAuth();
  const [friendData, setFriendData] = useState<FriendUser | null>(null);
  const [friendPosts, setFriendPosts] = useState<FriendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false); // Local state for follow status

  useEffect(() => {
    const fetchFriendData = async () => {
      if (!friendId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/profile/${friendId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFriendData(data.user);
          setFriendPosts(data.posts);
          // Initialize isFollowing based on user.following or friendData.followers
          setIsFollowing(user?.following?.includes(data.user._id) || data.user.followers?.includes(user?._id) || false);
        } else {
          setFriendData(null);
        }
      } catch (error) {
        console.error('Failed to fetch friend data:', error);
        setFriendData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendData();
  }, [friendId, user?.following]);

  const handleSendMessage = () => {
    navigate(`/chat?user=${friendData?._id}`);
  };

  const handleFollowToggle = async () => {
    if (!friendData?._id || !user?._id) return;

    // Optimistically update isFollowing for immediate UI feedback
    setIsFollowing(!isFollowing);

    try {
      const url = `/api/users/${isFollowing ? 'unfollow' : 'follow'}/${friendData._id}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        // Update friendData.followers
        setFriendData((prev: FriendUser) => {
          if (!prev) return null;
          const newFollowers = isFollowing
            ? prev.followers.filter((id: string) => id !== user._id)
            : [...(prev.followers || []), user._id];
          return { ...prev, followers: newFollowers };
        });

        // Update user.following in AuthContext (if setUser is available)
        setUser((prev: any) => {
          if (!prev) return prev;
          const newFollowing = isFollowing
            ? prev.following.filter((id: string) => id !== friendData._id)
            : [...(prev.following || []), friendData._id];
          return { ...prev, following: newFollowing };
        });
      } else {
        // Revert optimistic update on failure
        setIsFollowing(!isFollowing);
        console.error('Failed to toggle follow:', await res.text());
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowing(!isFollowing);
      console.error('Failed to toggle follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!friendData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Prevent self-follow
  const isSelf = user?._id === friendData._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="relative">
        {/* Header */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        {/* Cover Photo */}
        <div className="relative h-48 md:h-80 bg-gradient-to-r from-purple-400 to-blue-500 overflow-hidden">
          {friendData.coverPhoto && (
            <img
              src={friendData.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Section */}
        <div className="relative px-4 md:px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-12 md:-mt-16">
            {/* Profile Picture */}
            <div className="relative self-center md:self-auto">
              <img
                src={friendData.profilePicture}
                alt={friendData.username}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
              <div
                className={`absolute bottom-2 right-2 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white dark:border-gray-800 ${
                  friendData.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0 md:pb-4">
              <h1 className="text-xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {friendData.username}
              </h1>

              <div className="flex justify-center md:justify-start space-x-6 mb-4">
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{friendPosts.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{friendData.followers?.length || 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{friendData.following?.length || 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-2 md:gap-4">
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  disabled={isSelf}
                >
                  {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  <span className="text-sm md:text-base">{isFollowing ? 'Unfollow' : 'Follow'}</span>
                </button>

                <button
                  onClick={handleSendMessage}
                  className="flex items-center justify-center space-x-2 px-4 md:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm md:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-6">
        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          <p className="text-gray-700 dark:text-gray-300">{friendData.about}</p>
          <div className="mt-3 flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${friendData.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {friendData.isOnline ? 'Online' : `Last seen ${friendData.lastSeen || '2 hours ago'}`}
            </span>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Grid size={20} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Posts ({friendPosts.length})
              </h2>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {friendPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendPosts.map((post) => (
                  <div key={post._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-3">
                      {post.content && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">
                          {post.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart size={14} />
                            <span>{post.likes.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare size={14} />
                            <span>{post.comments.length}</span>
                          </div>
                        </div>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default FriendProfile;