import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
const API_URL = import.meta.env.VITE_API_URL


interface SocketContextType {
  socket: Socket | null;
  sendMessage: (receiverId: string, chatId: string, message: string) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  sendMessage: () => {},
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && user._id && typeof user._id === 'string' && user._id.length === 24) {
      const newSocket = io(`${API_URL}`, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join', user._id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      return () => {
        newSocket.disconnect();
        setIsConnected(false);
        setSocket(null);
      };
    } else {
      console.warn('No valid user._id for socket connection:', user);
    }
  }, [user, user?._id]);

  const sendMessage = (receiverId: string, chatId: string, message: string) => {
    if (!socket || socket.disconnected) {
      console.error('Cannot send message: Socket is not connected', {
        receiverId,
        chatId,
        message,
      });
      return;
    }
    if (!receiverId || !chatId || !message) {
      console.error('Cannot send message: Missing parameters', {
        receiverId,
        chatId,
        message,
      });
      return;
    }
    socket.emit('sendMessage', { receiverId, chatId, message });
  };

  return (
    <SocketContext.Provider value={{ socket, sendMessage, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};