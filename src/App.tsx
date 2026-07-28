import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { CallProvider } from './contexts/CallContext';
import { IncomingCallModal } from './components/call/IncomingCallModal';
import { CallModal } from './components/call/CallModal';
import ScrollToTopButton from './components/ScrollToTopButton';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FriendProfile from './pages/FriendProfile';
import CreatePost from './pages/CreatePost';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Wows from './pages/Wows';
import Chat from './pages/Chat';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
};

// Inner component — needs Router context to call useLocation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // key=pathname → React unmounts/remounts this div on every navigation
    // page-enter class (defined in index.css) plays the entrance animation
    <div key={location.pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/friend/:friendId" element={<ProtectedRoute><FriendProfile /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/Wows" element={<ProtectedRoute><Wows /></ProtectedRoute>} />
        <Route path="/wow" element={<ProtectedRoute><Wows /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <CallProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 2000,
                    style: {
                      background: 'var(--toast-bg)',
                      color: 'var(--toast-color)',
                    },
                  }}
                />
                {/* Modals must be inside Router so they can access router context */}
                <IncomingCallModal />
                <CallModal />
                <ScrollToTopButton />
                <AnimatedRoutes />
              </div>
            </Router>
          </CallProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;