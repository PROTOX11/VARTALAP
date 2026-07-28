import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import FriendsList from '../components/FriendsList';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import { useAuth } from '../contexts/AuthContext';
import { Bell, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, deletePost, toggleSavePost } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setPosts([]);
          return;
        }
        const res = await fetch(`${API_URL}/api/posts/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error(`Fetch failed with status: ${res.status} ${res.statusText}`);
          const errorData = await res.json().catch(() => ({}));
          console.error('Error details:', errorData);
          setPosts([]);
          return;
        }
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };


    if (user) {
      fetchPosts();
    }
  }, [user]);



  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 w-full z-10">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">VARTALAP</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Bell size={22} />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              <MessageCircle size={22} />
            </button>
            <ThemeToggle />
            <button
              onClick={() => navigate('/profile')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              <User size={22} />
            </button>
          </div>
        </div>

        {/* Main Content Workspace — overflow-y-auto so only this area scrolls */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">

            {/* Desktop Header Card: Connected Friends + Action Buttons (Messages, Theme, Profile, Notifications) */}
            <div className="hidden md:flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-sm border border-gray-100 dark:border-gray-700/60">
              {/* Friends strip or Home title */}
              <div className="flex-1 min-w-0 mr-4">
                {user?.friends && user.friends.length > 0 ? (
                  <FriendsList friends={user.friends} />
                ) : (
                  <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Home Feed</h1>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0 pl-4 border-l border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-all active:scale-95"
                  title="Notifications"
                >
                  <Bell size={18} />
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-all active:scale-95"
                  title="Messages"
                >
                  <MessageCircle size={18} />
                </button>
                <ThemeToggle />
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-all active:scale-95"
                  title="My Profile"
                >
                  <User size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Friends Strip */}
            {user?.friends && user.friends.length > 0 && (
              <div className="md:hidden bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm">
                <FriendsList friends={user.friends} />
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-4 md:space-y-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading posts...</div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={deletePost}
                    onSave={toggleSavePost}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700/60 shadow-sm text-gray-500 dark:text-gray-400">
                  No posts in your feed yet.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Dashboard;
