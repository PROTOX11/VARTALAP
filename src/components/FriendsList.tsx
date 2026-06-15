import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Friend {
  _id: string;
  username: string;
  profilePicture: string;
  isOnline: boolean;
}

interface FriendsListProps {
  friends: Friend[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
  const navigate = useNavigate();

  const handleFriendClick = (friendId: string) => {
    if (friendId) navigate(`/friend/${friendId}`);
  };

  if (friends.length === 0) return null;

  return (
    <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar pl-3 py-1">
      {friends.map((friend, index) => (
        <button
          key={friend._id || `friend-${friend.username || 'unknown'}-${index}`}
          onClick={() => handleFriendClick(friend._id)}
          disabled={!friend._id}
          className="flex-shrink-0 flex flex-col items-center gap-1 group"
          title={friend.username}
        >
          {/* Avatar */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full ${friend.isOnline ? 'ring-2 ring-green-400 ring-offset-1' : ''}`} />
            <img
              src={friend.profilePicture || '/default-profile.png'}
              alt={friend.username || 'User'}
              className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 group-hover:scale-105 transition-transform shadow-sm"
            />
            {/* Online dot */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                friend.isOnline ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          </div>

        </button>
      ))}
    </div>
  );
};

export default FriendsList;