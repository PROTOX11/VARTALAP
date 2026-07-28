import React, { useState } from 'react';
import { ArrowLeft, Image, Type, Send, Globe, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user, createPost } = useAuth();
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type.startsWith('image/')) {
          setSelectedImage(e.target?.result as string);
          setSelectedVideo(null);
          setPostType('image');
        } else if (file.type.startsWith('video/')) {
          setSelectedVideo(e.target?.result as string);
          setSelectedImage(null);
          setPostType('video');
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage && !selectedVideo) {
      return;
    }

    setIsUploading(true);
    const success = await createPost({
      type: postType,
      content,
      image: selectedImage || undefined,
      video: selectedVideo || undefined,
      visibility,
    });
    setIsUploading(false);

    if (success) {
      navigate('/dashboard');
    }
  };


  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto md:pl-40">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Post</h1>
            </div>
            <div className='flex space-x-3'>
            <ThemeToggle />
            <button
                onClick={() => navigate('/profile')}
                className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <User size={20} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={user?.profilePicture}
                alt={user?.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.username}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share something with the world or your friends</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Audience / Visibility Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Who can see this post?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                      visibility === 'public'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-600 dark:text-purple-300 font-semibold shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${visibility === 'public' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      <Globe size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm">Public</div>
                      <div className="text-[11px] opacity-75 font-normal">Visible to everyone</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('friends')}
                    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                      visibility === 'friends'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-600 dark:text-purple-300 font-semibold shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${visibility === 'friends' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      <Users size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm">Friends Only</div>
                      <div className="text-[11px] opacity-75 font-normal">Connected friends only</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Post Type Selection */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setPostType('text')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    postType === 'text'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Type size={20} />
                  <span>Text Post</span>
                </button>
                
                <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  postType === 'image' || postType === 'video'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}>
                  <Image size={20} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

              </div>

              {/* Content Input */}
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Image Preview */}
              {selectedImage && (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setPostType('text');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Video Preview */}
              {selectedVideo && (
                <div className="relative">
                  <video
                    src={selectedVideo}
                    controls
                    className="w-full max-h-96 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVideo(null);
                      setPostType('text');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={(!content.trim() && !selectedImage && !selectedVideo) || isUploading}
                  className={`flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isUploading ? 'border-4 border-purple-400 animate-pulse' : ''
                  }`}
                >
                  <Send size={20} />
                  <span>{isUploading ? 'Uploading...' : 'Share Post'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
            <MobileNavigation />
    </div>
  );
};

export default CreatePost;
