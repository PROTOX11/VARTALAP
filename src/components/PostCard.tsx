import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomVideoPlayer from './CustomVideoPlayer';

interface Post {
  id: string;
  user: {
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
}

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onSave?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onSave }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [saved, setSaved] = useState(post.isSaved || false);
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

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(post.id);
  };

  const handleDelete = () => {
    onDelete?.(post.id);
    setShowMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4 md:mb-6">
      <div className="p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.profilePicture}
            alt={post.user.username}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">
              {post.user.username}
            </h3>
            {post.user.location && (
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {post.user.location}
              </p>
            )}
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10 min-w-[120px]">
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <Bookmark size={16} />
                <span>{saved ? 'Unsave' : 'Save'}</span>
              </button>
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
          <p className="text-sm md:text-base text-gray-900 dark:text-white">{post.content}</p>
        </div>
      )}

      {typeof post.image === 'string' && post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="w-full h-64 md:h-96 object-cover"
        />
      )}

      {typeof post.video === 'string' && post.video && (
        <div className="w-full h-64 md:h-96 bg-black">
          <CustomVideoPlayer src={post.video} />
        </div>
      )}

      <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              } hover:text-red-500 transition-colors`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              <span className="text-sm md:text-base">{likesCount}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
              <MessageCircle size={20} />
        <span className="text-sm md:text-base">{commentsCount}</span>
            </button>
            
            <button className="text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
              <Share size={20} />
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
