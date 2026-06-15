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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col md:flex-row md:ml-64">
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

        {/* Main Content — pt-16 clears the fixed mobile header */}
        <div className="flex-1 p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
          {/* Friends strip — only shows when user has friends */}
          {user?.friends && user.friends.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 mb-4 mt-2 shadow-sm">
              <FriendsList friends={user.friends} />
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400">Loading posts...</div>
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
              <div className="text-center text-gray-500 dark:text-gray-400">No posts in your feed yet.</div>
            )}
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="hidden md:block w-25 p-6">
          <div className="flex justify-end items-center space-x-3 mb-6">
            <button
              onClick={() => navigate('/chat')}
              className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
              <MessageCircle size={24} />
            </button>
            <ThemeToggle />
            <button
              onClick={() => navigate('/profile')}
              className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

    </div>
  );
};

export default Dashboard;
