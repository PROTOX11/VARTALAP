import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Users, Hash, MapPin, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import MobileNavigation from '../components/MobileNavigation';
import FriendRequestButton from '../components/FriendRequestButton';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'people' | 'hashtags' | 'places'>('people');
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== 'people') {
        setPeople([]);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setPeople([]);
          return;
        }
        const res = await fetch(`${API_URL}/api/users/all-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.error(`Fetch failed with status: ${res.status} ${res.statusText}`);
          const errorData = await res.json().catch(() => ({}));
          console.error('Error details:', errorData);
          setPeople([]);
          return;
        }
        const data = await res.json();
        setPeople(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setPeople([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, API_URL]);


  const isFollowing = (person: any) => {
    return user && person.followers && person.followers.includes(user.id);
  };

  const handleFollowToggle = async (person: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    const url = `${API_URL}/api/users/${isFollowing(person) ? 'unfollow' : 'follow'}/${person.userId || person._id}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        console.error(`Follow/unfollow failed with status: ${res.status} ${res.statusText}`);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
        return;
      }
      setPeople(people =>
        people.map(p =>
          (p.userId || p._id) === (person.userId || person._id)
            ? {
                ...p,
                followers: isFollowing(person)
                  ? p.followers.filter((id: string) => user && id !== user.id)
                  : user
                    ? [...(p.followers || []), user.id]
                    : p.followers || [],
              }
            : p
        )
      );
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };


  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto md:pl-60">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search</h1>
            <div className="flex space-x-3">
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

          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search people"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Results */}
          <div className="space-y-4">
            {activeTab === 'people' && (
              <div className="grid gap-4">
                {loading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">Loading users...</div>
                ) : people.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">No users found.</div>
                ) : (
                  people
                    .filter(person => {
                      const personIds = [person.userId, person._id, person.id].map(id => id?.toString());
                      const loggedInIds = [user?.id, user?._id].map(id => id?.toString());
                      const isSelf = loggedInIds.some(id => id && personIds.includes(id));
                      return (
                        !isSelf &&
                        person.username.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                    })
                    .map((person) => (
                      <div
                        key={person._id || person.userId}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        onClick={() => navigate(`/friend/${person.userId || person._id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={person.profilePicture || 'https://res.cloudinary.com/dyjlmweqb/image/upload/v1752616422/icon-7797704_640_an798v.png'}
                            alt={person.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{person.username}</h3>
                            <p className="text-sm text-gray-400 dark:text-gray-500">Followers: {person.followers.length}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <FriendRequestButton targetUserId={person.userId || person._id} />
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Search;
