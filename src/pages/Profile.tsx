import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Edit3, Settings, Grid, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import PostCard from '../components/PostCard';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updateUsername, deletePost } = useAuth();
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [aboutText, setAboutText] = useState(user?.about || '');
  const [usernameText, setUsernameText] = useState(user?.username || '');
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  const handleUpdateAbout = () => {
    updateProfile({ about: aboutText });
    setIsEditingAbout(false);
  };

  const handleUpdateUsername = async () => {
    const success = await updateUsername(usernameText);
    if (success) {
      setIsEditingUsername(false);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateProfile({ profilePicture: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateProfile({ coverPhoto: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const { userPosts } = useAuth();
  const savedPosts = userPosts.filter(post => user?.savedPosts.includes(post.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="relative">
        {/* Header */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300 md:size=24" />
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <ThemeToggle />
        </div>

        {/* Cover Photo */}
        <div className="relative h-48 md:h-80 bg-gradient-to-r from-purple-400 to-blue-500 overflow-hidden">
          {user?.coverPhoto && (
            <img
              src={user.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <label className="absolute bottom-2 md:bottom-4 right-2 md:right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Camera size={16} className="text-gray-700 dark:text-gray-300 md:size=20" />
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Section */}
        <div className="relative px-4 md:px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-12 md:-mt-16">
            {/* Profile Picture */}
            <div className="relative self-center md:self-auto">
              <img
                src={user?.profilePicture}
                alt={user?.username}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
              <label className="absolute bottom-1 md:bottom-2 right-1 md:right-2 p-1.5 md:p-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                <Camera size={12} className="text-white md:size=16" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0 md:pb-4">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                {isEditingUsername ? (
                  <div className="flex items-center space-x-2">
                    <input
                      value={usernameText}
                      onChange={(e) => setUsernameText(e.target.value)}
                      className="text-xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 bg-transparent border-b border-purple-600 focus:outline-none"
                    />
                    <button
                      onClick={handleUpdateUsername}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingUsername(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {user?.username}
                    </h1>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <Edit3 size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
                <button className="px-4 md:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Update profile
                </button>
                <button className="px-4 md:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Share profile
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-6">
        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">About</h2>
            <button
              onClick={() => setIsEditingAbout(!isEditingAbout)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Edit3 size={16} />
            </button>
          </div>

          {isEditingAbout ? (
            <div className="space-y-3">
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={4}
                placeholder="Tell us about yourself..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateAbout}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingAbout(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {aboutText ? (
                <p className="text-gray-700 dark:text-gray-300">{aboutText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No bio added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Posts/Saved Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 ${activeTab === 'posts'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              <Grid size={20} />
              <span>Posts ({userPosts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 ${activeTab === 'saved'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              <Bookmark size={20} />
              <span>Saved ({savedPosts.length})</span>
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'posts' ? (
              <div className="space-y-4">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        user: {
                          username: user?.username || '',
                          profilePicture: user?.profilePicture || '',
                        },
                        isOwner: true
                      }}
                      onDelete={deletePost}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {savedPosts.length > 0 ? (
                  savedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        user: {
                          username: user?.username || '',
                          profilePicture: user?.profilePicture || '',
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No saved posts</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Profile;