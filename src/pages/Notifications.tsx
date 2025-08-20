import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, User, UserPlus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
const API_URL = import.meta.env.VITE_API_URL

interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'friend_request' | 'message';
  user: {
    username: string;
    profilePicture: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
  postImage?: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    if (!user || (!user.id && !user._id)) return;

    const socket = io(`${API_URL}`);
    socket.emit('join', user.id || user._id);

    socket.on('notification', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, user?._id]);

  const fetchNotifications = async () => {
    if (!user || !user._id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  const fetchSenderId = async (username: string): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/users/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const matchedUser = data.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      return matchedUser ? matchedUser.userId || matchedUser._id || null : null;
    } catch (err) {
      console.error('Error fetching sender ID for username:', username, err);
      return null;
    }
  };

  const fetchPostId = async (notificationId: string, userId: string): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/posts/me`, { // Updated to /api/posts/me
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter posts by userId (recipient) and check if notificationId is in likes or comments
      const matchedPost = data.find((p: any) =>
        p.userId === userId && (
          p.likes?.includes(notificationId) ||
          p.comments?.some((c: any) => c.notificationId === notificationId)
        )
      );
      return matchedPost ? matchedPost._id || matchedPost.id || null : null;
    } catch (err) {
      console.error('Error fetching post ID for notification:', notificationId, err);
      return null;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    const senderId = await fetchSenderId(notification.user.username);

    if (notification.type === 'follow' || notification.type === 'friend_request') {
      if (!senderId) {
        console.warn('Cannot navigate: Missing sender ID for notification:', notification);
        return;
      }
      navigate(`/friend/${senderId}`);
    } else if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'mention') {
      if (!user?._id) {
        console.warn('Cannot navigate: Missing user ID for notification:', notification);
        if (senderId) {
          navigate(`/friend/${senderId}`);
        } else {
          console.warn('Fallback to sender profile failed: Missing sender ID');
        }
        return;
      }
      const postId = await fetchPostId(notification._id, user._id);
      if (postId) {
        navigate(`/post/${postId}`);
      } else {
        console.warn('Cannot navigate: Missing post ID for notification:', notification);
        if (senderId) {
          navigate(`/friend/${senderId}`);
        } else {
          console.warn('Fallback to sender profile failed: Missing sender ID');
        }
      }
    } else if (notification.type === 'message') {
      if (!senderId) {
        console.warn('Cannot navigate: Missing sender ID for message notification:', notification);
        navigate(`/chat`);
        return;
      }
      navigate(`/chat/${senderId}`);
    }
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
      case 'friend_request':
        return <UserPlus size={20} className="text-purple-500" />;
      case 'message':
        return <MessageCircle size={20} className="text-teal-500" />;
      default:
        return <Heart size={20} className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 pb-20 md:pb-0">
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/dashboard')} className="p-1 text-gray-600 dark:text-gray-400">
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

        <div className="hidden md:block p-6 border-b border-gray-200 dark:border-gray-700 md:pl-80">
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
              <button
                onClick={() => navigate('/chat')}
                className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
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

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-2 md:pl-60">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
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
                            <span className="font-semibold">{notification.user.username}</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{notification.content}</span>
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
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
          )}

          {!loading && notifications.length === 0 && (
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