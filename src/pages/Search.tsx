import React, { useState } from 'react';
import { Search as SearchIcon, Users, Hash, MapPin } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'people' | 'hashtags' | 'places'>('people');

  const mockPeople = [
    {
      id: '1',
      username: 'john_doe',
      name: 'John Doe',
      profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      followers: '2.5k',
      isFollowing: false
    },
    {
      id: '2',
      username: 'jane_smith',
      name: 'Jane Smith',
      profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      followers: '1.8k',
      isFollowing: true
    },
    {
      id: '3',
      username: 'mike_wilson',
      name: 'Mike Wilson',
      profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      followers: '892',
      isFollowing: false
    }
  ];

  const mockHashtags = [
    { tag: 'photography', posts: '1.2M' },
    { tag: 'travel', posts: '890K' },
    { tag: 'food', posts: '2.1M' },
    { tag: 'nature', posts: '756K' }
  ];

  const mockPlaces = [
    { name: 'New York City', posts: '5.2M' },
    { name: 'Paris, France', posts: '3.8M' },
    { name: 'Tokyo, Japan', posts: '2.9M' },
    { name: 'London, UK', posts: '4.1M' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search</h1>
            <ThemeToggle />
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for people, hashtags, or places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('people')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'people'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users size={18} />
              <span>People</span>
            </button>
            <button
              onClick={() => setActiveTab('hashtags')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'hashtags'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Hash size={18} />
              <span>Hashtags</span>
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'places'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MapPin size={18} />
              <span>Places</span>
            </button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {activeTab === 'people' && (
              <div className="grid gap-4">
                {mockPeople.map((person) => (
                  <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={person.profilePicture}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{person.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">@{person.username}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">{person.followers} followers</p>
                      </div>
                    </div>
                    <button
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        person.isFollowing
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {person.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'hashtags' && (
              <div className="grid gap-4">
                {mockHashtags.map((hashtag) => (
                  <div key={hashtag.tag} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">#{hashtag.tag}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{hashtag.posts} posts</p>
                    </div>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'places' && (
              <div className="grid gap-4">
                {mockPlaces.map((place) => (
                  <div key={place.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{place.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{place.posts} posts</p>
                    </div>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Explore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;