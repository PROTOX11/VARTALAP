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
    navigate(`/profile/${friendId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Friends</h3>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {friends.map((friend) => (
          <button
            key={friend._id}
            onClick={() => handleFriendClick(friend._id)}
            className="flex-shrink-0 relative hover:scale-105 transition-transform"
          >
            <img
              src={friend.profilePicture}
              alt={friend.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            />
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
