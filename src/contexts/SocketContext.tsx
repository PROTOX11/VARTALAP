import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:6500`;

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
  // Tracks whether this socket instance has already registered with the server
  const joinedRef = useRef(false);

  useEffect(() => {
    const rawUserId = (user as any)?.id || (user as any)?._id;
    const userId = rawUserId ? String(rawUserId).trim() : '';
    if (!userId) return;

    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      // Infinite auto-reconnect with exponential backoff
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setSocket(newSocket);
    joinedRef.current = false;

    /**
     * Registers this user in the server's connectedUsers Map.
     * Must be called on EVERY connect/reconnect so the Map stays
     * accurate — otherwise callUser events silently fail with
     * "Target user offline" after a server restart.
     */
    const joinServer = () => {
      newSocket.emit('join', userId);
      joinedRef.current = true;
    };

    newSocket.on('connect', () => {
      setIsConnected(true);
      joinServer();
    });

    // Socket.IO v4 fires 'reconnect' after the transport reconnects
    newSocket.on('reconnect', () => {
      setIsConnected(true);
      joinedRef.current = false;
      joinServer();
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err?.message || err);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      joinedRef.current = false;
    });

    return () => {
      newSocket.disconnect();
      setIsConnected(false);
      setSocket(null);
      joinedRef.current = false;
    };
  }, [user]);

  const sendMessage = (receiverId: string, chatId: string, message: string) => {
    if (!socket || socket.disconnected) {
      console.error('Cannot send message: Socket is not connected', { receiverId, chatId, message });
      return;
    }
    if (!receiverId || !chatId || !message) {
      console.error('Cannot send message: Missing parameters', { receiverId, chatId, message });
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