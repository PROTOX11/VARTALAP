import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, UserPlus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: {
    username: string;
    profilePicture: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  postImage?: string;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      user: {
        username: 'alice_wonder',
        profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'liked your photo',
      timestamp: '2 minutes ago',
      isRead: false,
      postImage: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '2',
      type: 'comment',
      user: {
        username: 'john_doe',
        profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'commented: "Amazing shot! 📸"',
      timestamp: '5 minutes ago',
      isRead: false,
      postImage: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '3',
      type: 'follow',
      user: {
        username: 'sarah_smith',
        profilePicture: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'started following you',
      timestamp: '1 hour ago',
      isRead: true
    },
    {
      id: '4',
      type: 'like',
      user: {
        username: 'mike_wilson',
        profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'liked your post',
      timestamp: '2 hours ago',
      isRead: true
    },
    {
      id: '5',
      type: 'mention',
      user: {
        username: 'emma_jones',
        profilePicture: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'mentioned you in a comment',
      timestamp: '3 hours ago',
      isRead: true
    }
  ]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={20} className="text-red-500" />;
      case 'comment':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'follow':
        return <UserPlus size={20} className="text-green-500" />;
      case 'mention':
        return <Zap size={20} className="text-yellow-500" />;
      default:
        return <Heart size={20} className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1 text-gray-600 dark:text-gray-400"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {unreadCount > 0 && (
            <div className="md:hidden mb-4">
              <button
                onClick={markAllAsRead}
                className="w-full py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}

          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  notification.isRead
                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={notification.user.profilePicture}
                      alt={notification.user.username}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm md:text-base text-gray-900 dark:text-white">
                          <span className="font-semibold">{notification.user.username}</span>
                          {' '}
                          <span className="text-gray-600 dark:text-gray-400">
                            {notification.content}
                          </span>
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notification.timestamp}
                        </p>
                      </div>

                      {notification.postImage && (
                        <img
                          src={notification.postImage}
                          alt="Post"
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover ml-3 flex-shrink-0"
                        />
                      )}
                    </div>

                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                When someone likes or comments on your posts, you'll see it here.
              </p>
            </div>
          )}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Notifications;