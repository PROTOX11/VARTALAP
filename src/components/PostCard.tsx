import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Trash2, Globe, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomVideoPlayer from './CustomVideoPlayer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
const API_URL = import.meta.env.VITE_API_URL
interface Post {
  id?: string;
  _id?: string;
  user: {
    id?: string;
    _id?: string;
    userId?: string;
    username: string;
    profilePicture: string;
    location?: string;
  };
  content?: string;
  image?: string;
  video?: string;
  likes: number | string[];
  comments: number | string[];
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isOwner?: boolean;
  visibility?: 'public' | 'friends';
}

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onSave?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onSave }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  // const [saved, setSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(() => {
    if (typeof post.likes === 'number') return post.likes;
    if (Array.isArray(post.likes)) return post.likes.length;
    return 0;
  });
  let commentsCount = 0;
  if (typeof post.comments === 'number') commentsCount = post.comments;
  else if (Array.isArray(post.comments)) commentsCount = post.comments.length;
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  const getToken = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  const getPostId = () => {
    const postId = post.id || post._id;
    return postId;
  };

  const getUserId = () => {
    const userId = post.user.id || post.user._id || post.user.userId;
    return userId;
  };

  const handleProfileClick = () => {
    const userId = getUserId();
    if (!userId) {
      console.error('Invalid user ID:', post.user);
      alert('Cannot navigate to profile: Invalid user ID.');
      return;
    }
    navigate(`/friend/${userId}`); // Navigate to user's profile
  };

  const handleLike = async () => {
    const token = getToken();
    const postId = getPostId();
    if (!user || !token) {
      console.error('No user or token found. User:', user, 'Token:', token);
      alert('Session error: Please log in again to like a post.');
      return;
    }
    if (!postId) {
      console.error('Invalid post ID:', post);
      alert('Cannot like post: Invalid post ID.');
      return;
    }

    try {
      setLiked(!liked);
      setLikesCount(prev => (liked ? prev - 1 : prev + 1));

      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setLikesCount(response.data.likesCount);
      setLiked(response.data.isLiked);
    } catch (error: any) {
      console.error('Error liking/unliking post:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers,
        message: error.message,
      });
      if (error.response?.status === 401) {
        console.error('Unauthorized: Invalid or expired token:', token ? token.substring(0, 20) + '...' : null);
        alert('Session expired. Please log in again.');
      } else if (error.response?.status === 404) {
        console.error('Post not found for ID:', postId);
        alert('Post not found.');
      } else {
        console.error('Unexpected error:', error.message);
        alert('Failed to like/unlike post. Please try again.');
      }
      setLiked(liked);
      setLikesCount(prev => (liked ? prev + 1 : prev - 1));
    }
  };

  // const handleSave = async () => {
  //   const token = getToken();
  //   const postId = getPostId();
  //   if (!user || !token) {
  //     console.error('No user or token found. User:', user, 'Token:', token);
  //     alert('Session error: Please log in again to save a post.');
  //     return;
  //   }
  //   if (!postId) {
  //     console.error('Invalid post ID:', post);
  //     alert('Cannot save post: Invalid post ID.');
  //     return;
  //   }

  //   try {
  //     setSaved(!saved);
  //     await axios.post(
  //       `${API_URL}/api/posts/${postId}/save`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );
  //     onSave?.(postId);
  //   } catch (error: any) {
  //     console.error('Error saving/unsaving post:', error);
  //     if (error.response?.status === 401) {
  //       console.error('Unauthorized: Invalid or expired token:', token);
  //       alert('Session expired. Please log in again.');
  //     }
  //     setSaved(saved);
  //   }
  // };

  const handleDelete = async () => {
    const token = getToken();
    const postId = getPostId();
    if (!user || !token) {
      console.error('No user or token found. User:', user, 'Token:', token);
      alert('Session error: Please log in again to delete a post.');
      return;
    }
    if (!postId) {
      console.error('Invalid post ID:', post);
      alert('Cannot delete post: Invalid post ID.');
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      onDelete?.(postId);
      setShowMenu(false);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      if (error.response?.status === 401) {
        console.error('Unauthorized: Invalid or expired token:', token);
        alert('Session expired. Please log in again.');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden mb-4 md:mb-6 transition-all duration-200 hover:shadow-md">
      <div className="p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.profilePicture}
            alt={post.user.username}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={handleProfileClick}
          />
          <div>
            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white cursor-pointer hover:underline" onClick={handleProfileClick}>
              {post.user.username}
            </h3>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {post.user.location && (
                <>
                  <span>{post.user.location}</span>
                  <span>•</span>
                </>
              )}
              <span className="inline-flex items-center gap-1">
                {post.visibility === 'friends' ? (
                  <>
                    <Users size={12} className="text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400 font-medium">Friends Only</span>
                  </>
                ) : (
                  <>
                    <Globe size={12} className="text-blue-500" />
                    <span>Public</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="relative">
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-10 min-w-[120px] animate-pop-in">
              {post.isOwner && (
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {typeof post.content === 'string' && post.content && (
        <div className="px-3 md:px-4 pb-3">
          <p className="text-sm md:text-base text-gray-900 dark:text-white leading-relaxed">{post.content}</p>
        </div>
      )}
      {typeof post.image === 'string' && post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="w-full h-64 md:h-96 object-cover transition-opacity duration-300 hover:opacity-95"
        />
      )}
      {typeof post.video === 'string' && post.video && (
        <div className="w-full h-64 md:h-96 bg-black">
          <CustomVideoPlayer src={post.video} />
        </div>
      )}
      <div className="p-3 md:p-4 border-t border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 active:scale-90 transition-all duration-150 ${
                liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              } hover:text-red-500`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} className={liked ? 'animate-pop-in' : ''} />
              <span className="text-sm md:text-base font-medium">{likesCount}</span>
            </button>
          </div>
          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {typeof post.timestamp === 'string' ? post.timestamp : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;