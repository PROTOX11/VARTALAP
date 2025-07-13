import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  chats: Chat[];
  sendMessage: (receiverId: string, content: string) => void;
  markAsRead: (chatId: string) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // In a real app, you would connect to your actual socket server
      // For demo purposes, we'll simulate socket connection
      const mockSocket = {
        emit: () => {},
        on: () => {},
        disconnect: () => {},
      } as any;

      setSocket(mockSocket);
      setIsConnected(true);

      // Mock chat data
      setChats([
        {
          id: '1',
          participants: [user.id, '1'],
          lastMessage: {
            id: '1',
            senderId: '1',
            receiverId: user.id,
            content: 'Hey! How are you doing?',
            timestamp: new Date(),
            isRead: false
          },
          unreadCount: 1
        }
      ]);

      return () => {
        mockSocket.disconnect();
        setIsConnected(false);
      };
    }
  }, [user]);

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && user) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        receiverId,
        content,
        timestamp: new Date(),
        isRead: false
      };

      setMessages(prev => [...prev, message]);
      // In real app: socket.emit('sendMessage', message);
    }
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  };

  return (
    <SocketContext.Provider value={{
      socket,
      messages,
      chats,
      sendMessage,
      markAsRead,
      isConnected
    }}>
      {children}
    </SocketContext.Provider>
  );
};