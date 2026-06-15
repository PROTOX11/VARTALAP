import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
// Use Vite-provided API URL when available; otherwise fall back at runtime to
// the same host but backend port 6500. This helps when the frontend is served
// separately (e.g. Vite dev server on :5173) and VITE_API_URL wasn't set.
const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:6500`;
export interface User {
  token: any;
  id: string;
  _id?: string;
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
  followers: string[];
  following: string[];
}

interface Post {
  id: string;
  type: 'text' | 'image' | 'video';
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
  _id: string;
  username: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  userPosts: Post[];
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  deletePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  updateUsername: (newUsername: string) => Promise<boolean>;
  createPost: (postData: { type: 'text' | 'image' | 'video', content?: string, image?: string, video?: string }) => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const fetchUserPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/my-posts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const posts = Array.isArray(data) ? data : data.posts;
        const mappedPosts = posts.map((post: { _id: any; id: any; }) => ({
          ...post,
          id: post._id || post.id // Map _id to id
        }));
        setUserPosts(mappedPosts || []);
      }
    } catch (err) {
      console.error('Failed to load user posts:', err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            if (userData?._id) {
              userData.id = userData._id;
            }
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            fetchUserPosts();
          } else {
            logout();
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          logout();
        }
      }
    };

    fetchUser();
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.messages || 'Login failed. Please try again.');
        return false;
      }

      if (data.user?._id) {
        data.user.id = data.user._id;
      }
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setUserPosts(data.user.posts || []);
      toast.success('Login successful!');
      fetchUserPosts();
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const signupUrl = `${API_URL}/api/auth/register`;
      console.log('Signup URL:', signupUrl);
      console.log('Signup payload:', userData);

      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Try to parse JSON body, but handle non-JSON (e.g. 500 HTML) gracefully
      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        const text = await response.text().catch(() => null);
        data = { messages: text || `HTTP ${response.status}` };
      }

      if (!response.ok) {
        console.error('Signup failed', response.status, data);
        toast.error(data.messages || 'Signup failed. Please try again.');
        return false;
      }

      if (data.user?._id) {
        data.user.id = data.user._id;
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

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token not found.");
        return false;
      }
      const formData = new FormData();

      const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      // Always append text fields if present
      if (updates.username !== undefined) formData.append('username', updates.username);
      if (updates.about !== undefined) formData.append('about', updates.about ?? '');

      // Convert data-URL images → Blob for multipart upload
      if (updates.profilePicture && typeof updates.profilePicture === 'string' && updates.profilePicture.startsWith('data:')) {
        const blob = dataURLtoBlob(updates.profilePicture);
        if (blob) formData.append('profilePicture', blob, 'profile.jpg');
        else toast.error('Could not process profile picture.');
      }

      if (updates.coverPhoto && typeof updates.coverPhoto === 'string' && updates.coverPhoto.startsWith('data:')) {
        const blob = dataURLtoBlob(updates.coverPhoto);
        if (blob) formData.append('coverPhoto', blob, 'cover.jpg');
      }

      // Guard: nothing to send
      if ([...formData.entries()].length === 0) return true;

      const toastId = toast.loading('Saving changes…');

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type — browser sets it with boundary for multipart
        },
        body: formData,
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (!response.ok) {
        toast.error(data.message || data.messages || 'Profile update failed.');
        return false;
      }

      if (data.user?._id) {
        data.user.id = data.user._id;
      }
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Profile update failed.');
      return false;
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

  const createPost = async (postData: { type: 'text' | 'image' | 'video', content?: string, image?: string, video?: string }): Promise<boolean> => {
    if (!user) return false;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token not found.");
        return false;
      }

      const formData = new FormData();

      const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      }

      formData.append('type', postData.type);
      if (postData.content) {
        formData.append('content', postData.content);
      }

      if (postData.image && postData.image.startsWith('data:')) {
        const blob = dataURLtoBlob(postData.image);
        if (blob) formData.append('media', blob, 'post.jpg');
      } else if (postData.video && postData.video.startsWith('data:')) {
        const blob = dataURLtoBlob(postData.video);
        if (blob) formData.append('media', blob, 'post.mp4');
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.messages || 'Failed to create post.');
        return false;
      }

      if (user) {
        const updatedPosts = [data.post, ...(user.posts || [])];
        const updatedUser = { ...user, posts: updatedPosts };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success('Post created successfully!');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to create post.');
      return false;
    }
  };

  const updateUsername = async (newUsername: string): Promise<boolean> => {
    return updateProfile({ username: newUsername });
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      userPosts,
      login,
      signup,
      logout,
      updateProfile,
      deletePost,
      toggleSavePost,
      updateUsername,
      createPost
    }}>
      {children}
    </AuthContext.Provider>
  );
};