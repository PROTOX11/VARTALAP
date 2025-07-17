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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/posts/feed', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        } else {
          setPosts([]);
        }
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
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between fixed z-10">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">VARTALAP</h1>
          <div className="flex items-center space-x-4 pl-12">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Bell size={24} />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <MessageCircle size={24} />
            </button>
            <ThemeToggle />
            <button
              onClick={() => navigate('/profile')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <User size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <div className="mb-4 md:mb-6">
            <FriendsList friends={user?.friends || []} />
          </div>

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
