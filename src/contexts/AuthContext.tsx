import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  profilePicture?: string;
  coverPhoto?: string;
  about?: string;
  isOnline: boolean;
  posts: Post[];
  savedPosts: string[];
  friends: Friend[];
}

interface Post {
  id: string;
  type: 'text' | 'image' | 'reel';
  content?: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
  isSaved: boolean;
}

interface Friend {
  id: string;
  username: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  deletePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  updateUsername: (newUsername: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call with validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        username: 'admin1234',
        email: 'admin@example.com',
        phone: '+1234567890',
        profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        coverPhoto: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=1200',
        about: 'I am a student of India',
        isOnline: true,
        posts: [
          {
            id: '1',
            type: 'image',
            content: 'Beautiful day at the temple!',
            image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
            likes: 42,
            comments: 8,
            timestamp: '2 hours ago',
            isLiked: false,
            isSaved: false
          },
          {
            id: '2',
            type: 'text',
            content: 'Just finished an amazing workout session! 💪',
            likes: 23,
            comments: 5,
            timestamp: '1 day ago',
            isLiked: true,
            isSaved: false
          }
        ],
        savedPosts: [],
        friends: [
          {
            id: '1',
            username: 'alice',
            profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
            isOnline: true
          },
          {
            id: '2',
            username: 'bob',
            profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
            isOnline: false,
            lastSeen: '2 hours ago'
          }
        ]
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Signup failed. Please try again.');
        return false;
      }
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
    }
  };

  const deletePost = (postId: string) => {
    if (user) {
      const updatedPosts = user.posts.filter(post => post.id !== postId);
      const updatedUser = { ...user, posts: updatedPosts };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Post deleted successfully!');
    }
  };

  const toggleSavePost = (postId: string) => {
    if (user) {
      const savedPosts = user.savedPosts.includes(postId)
        ? user.savedPosts.filter(id => id !== postId)
        : [...user.savedPosts, postId];
      
      const updatedUser = { ...user, savedPosts };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success(savedPosts.includes(postId) ? 'Post saved!' : 'Post unsaved!');
    }
  };

  const updateUsername = async (newUsername: string): Promise<boolean> => {
    try {
      // Simulate API call to check username availability
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, username: newUsername };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Username updated successfully!');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to update username. Please try again.');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      deletePost, 
      toggleSavePost,
      updateUsername 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
