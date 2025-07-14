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
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:flex-row md:ml-64">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-50">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">VARTALAP</h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full"
            >
              <Bell size={24} />
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full"
            >
              <MessageCircle size={24} />
            </button>
            <ThemeToggle />
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full"
            >
              <User size={24} />
            </button>
          </div>
        </div>
      {/* Mobile Navigation */}
      <div className="pt-16">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default Dashboard;
  );
};

export default Dashboard;
