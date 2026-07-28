import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Heart, MessageCircle, User, UserPlus, Zap, Check, X, UserCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:6500`;

interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'friend_request' | 'message';
  senderId: string | null;
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
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  // Track per-notification follow states
  const [followStates, setFollowStates] = useState<Record<string, 'none' | 'following' | 'loading'>>({});
  // Track per-notification friend-request action states
  const [frStates, setFrStates] = useState<Record<string, 'pending' | 'accepted' | 'rejected' | 'loading'>>({});

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get<Notification[]>(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time: push new notification to top
  useEffect(() => {
    if (!socket) return;
    const handler = (n: Notification) => {
      setNotifications(prev => [n, ...prev]);
    };
    socket.on('notification', handler);
    socket.on('notificationCreated', handler);
    return () => {
      socket.off('notification', handler);
      socket.off('notificationCreated', handler);
    };
  }, [socket]);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  // ── Follow Back action ──────────────────────────────────────────
  const handleFollowBack = async (notifId: string, targetUserId: string) => {
    setFollowStates(s => ({ ...s, [notifId]: 'loading' }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/users/follow/${targetUserId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200 || res.status === 201) {
        setFollowStates(s => ({ ...s, [notifId]: 'following' }));
        toast.success('Following!');
        markAsRead(notifId);
      }
    } catch {
      toast.error('Failed to follow');
      setFollowStates(s => ({ ...s, [notifId]: 'none' }));
    }
  };

  // ── Friend Request inline accept/decline ────────────────────────
  const handleFriendRequestAction = async (
    notifId: string,
    senderId: string,
    action: 'accept' | 'reject'
  ) => {
    setFrStates(s => ({ ...s, [notifId]: 'loading' }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/users/friend-request/${action}/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFrStates(s => ({ ...s, [notifId]: action === 'accept' ? 'accepted' : 'rejected' }));
      if (action === 'accept') {
        toast.success('Friend request accepted!');
        setFollowStates(s => ({ ...s, [notifId]: 'following' }));
      } else {
        toast('Request deleted');
      }
      markAsRead(notifId);
    } catch {
      toast.error(`Failed to ${action} request`);
      setFrStates(s => ({ ...s, [notifId]: 'pending' }));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification._id);

    const sid = notification.senderId;

    if (notification.type === 'follow' || notification.type === 'friend_request') {
      if (sid) navigate(`/friend/${sid}`);
    } else if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'mention') {
      if (sid) navigate(`/friend/${sid}`);
    } else if (notification.type === 'message') {
      if (sid) navigate(`/chat/${sid}`);
      else navigate('/chat');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-500" />;
      case 'follow': return <UserPlus size={16} className="text-green-500" />;
      case 'mention': return <Zap size={16} className="text-yellow-500" />;
      case 'friend_request': return <UserPlus size={16} className="text-purple-500" />;
      case 'message': return <MessageCircle size={16} className="text-teal-500" />;
      default: return <Heart size={16} className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Mobile header */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/dashboard')} className="p-1 text-gray-600 dark:text-gray-400">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
              )}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Desktop header */}
        <div className="hidden md:block p-6 border-b border-gray-200 dark:border-gray-700 md:pl-80">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded-full">{unreadCount}</span>
              )}
            </h1>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => navigate('/chat')}
                className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <MessageCircle size={20} />
              </button>
              <ThemeToggle />
              <button
                onClick={() => navigate('/profile')}
                className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <User size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-3 md:p-6 md:pl-[17rem]">
          {/* Mobile mark-all */}
          {unreadCount > 0 && (
            <div className="md:hidden mb-3">
              <button
                onClick={markAllAsRead}
                className="w-full py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}

          {/* ── Skeleton loading ── */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Notification list ── */}
          {!loading && (
            <div className="space-y-1">
              {notifications.map(notification => {
                const sid = notification.senderId;
                const followState = followStates[notification._id] ?? 'none';
                const frState = frStates[notification._id] ?? 'pending';

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                      notification.isRead
                        ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                        : 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar + icon badge */}
                      <div className="relative flex-shrink-0">
                        {notification.user.profilePicture ? (
                          <img
                            src={notification.user.profilePicture}
                            alt={notification.user.username}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center">
                            <User size={20} className="text-purple-600 dark:text-purple-300" />
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border border-gray-100 dark:border-gray-700">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white leading-snug">
                              <span className="font-semibold">{notification.user.username}</span>{' '}
                              <span className="text-gray-600 dark:text-gray-400">{notification.content}</span>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>

                            {/* ── FOLLOW notification → "Follow Back" button (disappears when read/old) ── */}
                            {notification.type === 'follow' && sid && (
                              <div className="mt-2" onClick={e => e.stopPropagation()}>
                                {followState === 'following' ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-semibold cursor-default pointer-events-none select-none">
                                    <UserCheck size={13} className="text-purple-500" />
                                    Following
                                  </span>
                                ) : !notification.isRead ? (
                                  <button
                                    onClick={() => handleFollowBack(notification._id, sid)}
                                    disabled={followState === 'loading'}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-60"
                                  >
                                    {followState === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={13} />}
                                    Follow Back
                                  </button>
                                ) : null}
                              </div>
                            )}

                            {/* ── FRIEND REQUEST notification → Accept / Delete (disappears when read/old) ── */}
                            {notification.type === 'friend_request' && sid && (
                              <div className="mt-2" onClick={e => e.stopPropagation()}>
                                {frState === 'accepted' ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold cursor-default pointer-events-none select-none">
                                    <UserCheck size={12} />
                                    You are now friends
                                  </span>
                                ) : frState === 'pending' && !notification.isRead ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleFriendRequestAction(notification._id, sid, 'accept')}
                                      disabled={frState === ('loading' as any)}
                                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-60"
                                    >
                                      <Check size={13} />
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => handleFriendRequestAction(notification._id, sid, 'reject')}
                                      disabled={frState === ('loading' as any)}
                                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-60"
                                    >
                                      <X size={13} />
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* Post thumbnail */}
                          {notification.postImage && (
                            <img
                              src={notification.postImage}
                              alt="Post"
                              className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700"
                            />
                          )}
                        </div>

                        {/* Unread dot for non-actionable notifications */}
                        {!notification.isRead && notification.type !== 'friend_request' && notification.type !== 'follow' && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && notifications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={36} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                No notifications yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                When someone likes, comments, or follows you — you'll see it here.
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