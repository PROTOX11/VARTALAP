import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext<{
  socket: Socket | null;
  sendMessage: (receiverId: string, chatId: string, message: string) => void;
  isConnected: boolean;
}>({
  socket: null,
  sendMessage: () => {},
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && user._id && typeof user._id === 'string' && user._id.length === 24) {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', user._id);
        setIsConnected(true);
        socketRef.current?.emit('join', user._id); // Emit join event with userId
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected:', user._id);
        setIsConnected(false);
      });

      return () => {
        socketRef.current?.disconnect();
        setIsConnected(false);
      };
    } else {
      console.warn('No valid user._id for socket connection:', user);
    }
  }, [user, user?._id]);

  const sendMessage = (receiverId: string, chatId: string, message: string) => {
    if (socketRef.current && receiverId && chatId && message) {
      socketRef.current.emit('sendMessage', {
        receiverId,
        chatId,
        message,
      });
    } else {
      console.error('Cannot send message: Missing socket or parameters', { receiverId, chatId, message });
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, sendMessage, isConnected }}>
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