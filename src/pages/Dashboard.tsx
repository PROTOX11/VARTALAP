import React from 'react';
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

  const mockPosts = [
    {
      id: '1',
      user: {
        username: 'admin1234',
        profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        location: 'sector-18 chandigarh'
      },
      image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
      likes: 42,
      comments: 8,
      timestamp: '2 hours ago',
      isOwner: true
    },
    {
      id: '2',
      user: {
        username: 'john_doe',
        profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        location: 'New York'
      },
      content: 'Beautiful sunset today! Nature never fails to amaze me. 🌅',
      image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800',
      likes: 128,
      comments: 23,
      timestamp: '4 hours ago'
    }
  ];

  const mockFriends = [
    {
      id: '1',
      username: 'alice',
      profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: true
    },
    {
      id: '2',
      username: 'bob',
      profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: false
    },
    {
      id: '3',
      username: 'charlie',
      profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: true
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">VARTALAP</h1>
          <div className="flex items-center space-x-3">
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
            <FriendsList friends={mockFriends} />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            {mockPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={deletePost}
                onSave={toggleSavePost}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop Right Sidebar */}
        <div className="hidden md:block w-80 p-6">
          <div className="flex justify-end items-center space-x-3 mb-6">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            >
              <User size={20} />
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={user?.profilePicture}
                alt={user?.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.username}</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Online</span>
                </div>
              </div>
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
