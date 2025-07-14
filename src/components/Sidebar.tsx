import React from 'react';
import { Home, Search, Compass, Zap, Bell, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Zap, label: 'Wow', path: '/wow' },
    { icon: Bell, label: 'Notification', path: '/notifications' },
    { icon: Plus, label: 'Create', path: '/create' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-purple-100 dark:bg-gray-800 p-6 z-40 hidden md:flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400">VARTALAP</h1>
      </div>

      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-full text-left transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;