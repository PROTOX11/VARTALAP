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

  friends.forEach((friend, index) => {
    if (!friend._id) {
      console.warn(`Friend at index ${index} has undefined _id:`, friend);
    }
    if (friend._id && friends.filter(f => f._id === friend._id).length > 1) {
      console.warn(`Duplicate _id found for friend at index ${index}:`, friend._id);
    }
  });

  const handleFriendClick = (friendId: string) => {
    if (friendId) {
      navigate(`/friend/${friendId}`);
    } else {
      console.warn('Cannot navigate: friendId is missing');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Friends</h3>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {friends.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No friends yet.</p>
        ) : (
          friends.map((friend, index) => (
            <button
              key={friend._id || `friend-fallback-${friend.username || 'unknown'}-${index}`} // Robust fallback
              onClick={() => handleFriendClick(friend._id)}
              className="flex-shrink-0 relative hover:scale-105 transition-transform"
              disabled={!friend._id} // Disable if no _id
            >
              <img
                src={friend.profilePicture || '/default-profile.png'} // Fallback image
                alt={friend.username || 'Unknown'}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendsList;