import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, UserPlus, UserCheck, Grid, Heart, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';

interface FriendData {
  id: string;
  username: string;
  profilePicture: string;
  coverPhoto?: string;
  about: string;
  isOnline: boolean;
  lastSeen?: string;
  posts: Array<{
    id: string;
    type: 'text' | 'image';
    content?: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: string;
  }>;
  followers: number;
  following: number;
  isFriend: boolean;
  friendRequestSent: boolean;
}

const FriendProfile: React.FC = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const { user } = useAuth();
  const [friendData, setFriendData] = useState<FriendData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock friend data - replace with API call
  useEffect(() => {
    const mockFriendData: FriendData = {
      id: friendId || '1',
      username: 'alice_wonder',
      profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
      coverPhoto: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=1200',
      about: 'Travel enthusiast 🌍 | Photography lover 📸 | Coffee addict ☕',
      isOnline: true,
      posts: [
        {
          id: '1',
          type: 'image',
          content: 'Beautiful sunset at the beach! 🌅',
          image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400',
          likes: 45,
          comments: 12,
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          type: 'text',
          content: 'Just finished reading an amazing book! Highly recommend "The Alchemist" by Paulo Coelho. Such an inspiring story about following your dreams. 📚✨',
          likes: 23,
          comments: 8,
          timestamp: '1 day ago'
        },
        {
          id: '3',
          type: 'image',
          content: 'Morning coffee and planning my next adventure ☕🗺️',
          image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
          likes: 67,
          comments: 15,
          timestamp: '3 days ago'
        },
        {
          id: '4',
          type: 'image',
          content: 'Hiking with friends! Nature therapy at its best 🥾🌲',
          image: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
          likes: 89,
          comments: 24,
          timestamp: '1 week ago'
        },
        {
          id: '5',
          type: 'text',
          content: 'Grateful for all the amazing people in my life. Sometimes it\'s the simple moments that bring the most joy. 💕',
          likes: 156,
          comments: 32,
          timestamp: '1 week ago'
        },
        {
          id: '6',
          type: 'image',
          content: 'Trying out a new recipe today! Homemade pasta 🍝',
          image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
          likes: 34,
          comments: 9,
          timestamp: '2 weeks ago'
        }
      ],
      followers: 1234,
      following: 567,
      isFriend: false,
      friendRequestSent: false
    };

    setTimeout(() => {
      setFriendData(mockFriendData);
      setLoading(false);
    }, 1000);
  }, [friendId]);

  const handleSendMessage = () => {
    navigate(`/chat?user=${friendData?.id}`);
  };

  const handleFollowToggle = () => {
    if (friendData) {
      setFriendData(prev => prev ? {
        ...prev,
        isFriend: !prev.isFriend,
        friendRequestSent: !prev.isFriend ? true : false,
        followers: prev.isFriend ? prev.followers - 1 : prev.followers + 1
      } : null);
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
                  <div className="font-bold text-gray-900 dark:text-white">{friendData.posts.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{friendData.followers}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">{friendData.following}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-2 md:gap-4">
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-2 rounded-full font-medium transition-colors ${
                    friendData.isFriend
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {friendData.isFriend ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  <span className="text-sm md:text-base">
                    {friendData.isFriend ? 'Following' : friendData.friendRequestSent ? 'Requested' : 'Follow'}
                  </span>
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
              className={`w-2 h-2 rounded-full ${
                friendData.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
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
                Posts ({friendData.posts.length})
              </h2>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {friendData.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendData.posts.map((post) => (
                  <div key={post.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
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
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare size={14} />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                        <span>{post.timestamp}</span>
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