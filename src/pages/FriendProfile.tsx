import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Grid, Heart, MessageSquare, Calendar, Sparkles, Globe, Users, Play, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import Sidebar from '../components/Sidebar';
import FriendRequestButton from '../components/FriendRequestButton';

type FriendPost = any;
type FriendUser = any;

const FriendProfile: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:6500`;
  const navigate = useNavigate();
  const { friendId } = useParams();
  const { user } = useAuth();
  const [friendData, setFriendData] = useState<FriendUser | null>(null);
  const [friendPosts, setFriendPosts] = useState<FriendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [selectedPostMedia, setSelectedPostMedia] = useState<FriendPost | null>(null);

  useEffect(() => {
    const fetchFriendData = async () => {
      if (!friendId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users/profile/${friendId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFriendData(data.user);
          setFriendPosts(data.posts || []);
        } else {
          setFriendData(null);
        }
      } catch (error) {
        console.error('Failed to fetch friend data:', error);
        setFriendData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendData();
  }, [friendId, API_URL]);

  const handleSendMessage = () => {
    navigate(`/chat?user=${friendData?._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 animate-spin" />
          <div className="mt-4 text-center font-medium text-sm text-purple-600 dark:text-purple-400">Loading Profile...</div>
        </div>
      </div>
    );
  }

  if (!friendData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User Profile Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">The user profile you are trying to view doesn't exist or is unavailable.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-purple-600/30"
          >
            Return to Feed
          </button>
        </div>
      </div>
    );
  }

  const isSelf = user?._id === friendData._id;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 overflow-y-auto md:ml-64 pb-20 md:pb-8">
        
        {/* Top Cover Banner Container */}
        <div className="relative w-full">
          {/* Cover Photo */}
          <div className="relative h-56 md:h-80 w-full overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-900">
            {friendData.coverPhoto ? (
              <img
                src={friendData.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500 via-purple-700 to-indigo-900 opacity-90">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>

          {/* Floating Top Navigation */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full shadow-lg text-gray-800 dark:text-gray-100 hover:scale-105 active:scale-95 transition-all border border-white/20"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
            </div>
          </div>

          {/* User Info Header Overlay */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
              
              {/* Avatar + Basic Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                <div className="relative group">
                  <img
                    src={friendData.profilePicture}
                    alt={friendData.username}
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-gray-900 shadow-xl object-cover ring-4 ring-purple-600/20"
                  />
                  <div
                    className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 ${
                      friendData.isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/40' : 'bg-gray-400'
                    }`}
                    title={friendData.isOnline ? 'Online now' : 'Offline'}
                  />
                </div>

                <div className="pt-2 sm:pb-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {friendData.username}
                    </h1>
                    <Sparkles size={20} className="text-amber-400 fill-amber-400/30" />
                  </div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                    @{friendData.username.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 pt-2">
                {!isSelf && friendData._id && (
                  <FriendRequestButton targetUserId={friendData._id} />
                )}

                <button
                  onClick={handleSendMessage}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
                >
                  <MessageCircle size={18} />
                  <span>Message</span>
                </button>
              </div>

            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 mb-6">
              <div className="text-center p-2 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{friendPosts.length}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Posts</div>
              </div>
              <div className="text-center p-2 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors border-x border-gray-100 dark:border-gray-700/60">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{friendData.followers?.length || 0}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Followers</div>
              </div>
              <div className="text-center p-2 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{friendData.following?.length || 0}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Following</div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center space-x-2 py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'posts'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid size={18} />
                <span>Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex items-center space-x-2 py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'about'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Info size={18} />
                <span>About</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'posts' && (
              <div>
                {friendPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {friendPosts.map((post) => (
                      <div
                        key={post._id}
                        onClick={() => (post.image || post.video) && setSelectedPostMedia(post)}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/60 transition-all group cursor-pointer"
                      >
                        {/* Media Container */}
                        {post.image ? (
                          <div className="relative h-56 overflow-hidden bg-gray-900">
                            <img
                              src={post.image}
                              alt="Post media"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-medium text-white flex items-center gap-1">
                              {post.visibility === 'friends' ? <Users size={11} className="text-purple-300" /> : <Globe size={11} className="text-blue-300" />}
                              <span>{post.visibility === 'friends' ? 'Friends' : 'Public'}</span>
                            </div>
                          </div>
                        ) : post.video ? (
                          <div className="relative h-56 bg-black flex items-center justify-center">
                            <video src={post.video} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play size={20} className="ml-1 fill-white" />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-medium text-white flex items-center gap-1">
                              {post.visibility === 'friends' ? <Users size={11} className="text-purple-300" /> : <Globe size={11} className="text-blue-300" />}
                              <span>{post.visibility === 'friends' ? 'Friends' : 'Public'}</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Content text & Stats */}
                        <div className="p-4">
                          {post.content && (
                            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 mb-3 font-normal leading-relaxed">
                              {post.content}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                <Heart size={15} className={post.isLiked ? 'fill-red-500 text-red-500' : ''} />
                                <span>{Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}</span>
                              </span>
                              <span className="flex items-center space-x-1 hover:text-purple-500 transition-colors">
                                <MessageSquare size={15} />
                                <span>{Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)}</span>
                              </span>
                            </div>
                            <span className="text-[11px] font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Grid size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Posts Shared</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This user hasn't posted anything visible yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Bio / About</h3>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                    {friendData.about || "This user hasn't added a bio yet."}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <div className={`w-3 h-3 rounded-full ${friendData.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Status</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {friendData.isOnline ? 'Active Now' : `Last seen ${friendData.lastSeen ? new Date(friendData.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}`}
                      </div>
                    </div>
                  </div>

                  {friendData.createdAt && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-medium">Joined Vartalap</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {new Date(friendData.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Media Lightbox Modal */}
      {selectedPostMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPostMedia(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPostMedia(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors z-10"
            >
              ✕
            </button>

            {selectedPostMedia.image ? (
              <img src={selectedPostMedia.image} alt="Post" className="w-full max-h-[70vh] object-contain bg-black" />
            ) : (
              <video src={selectedPostMedia.video} controls autoPlay className="w-full max-h-[70vh] bg-black" />
            )}

            <div className="p-4 bg-white dark:bg-gray-900">
              <p className="text-sm text-gray-900 dark:text-white">{selectedPostMedia.content}</p>
            </div>
          </div>
        </div>
      )}

      <MobileNavigation />
    </div>
  );
};

export default FriendProfile;