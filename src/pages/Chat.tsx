import React, { useState } from 'react';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import MobileNavigation from '../components/MobileNavigation';
import Sidebar from '../components/Sidebar';

interface ChatUser {
  id: string;
  username: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, isConnected } = useSocket();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '1',
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: true
    },
    {
      id: '2',
      senderId: user?.id || '',
      content: 'I\'m doing great! Just finished my workout 💪',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      isRead: true
    },
    {
      id: '3',
      senderId: '1',
      content: 'That\'s awesome! What kind of workout?',
      timestamp: new Date(Date.now() - 1000 * 60 * 1),
      isRead: false
    }
  ]);

  const chatUsers: ChatUser[] = [
    {
      id: '1',
      username: 'alice_wonder',
      profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: true
    },
    {
      id: '2',
      username: 'john_doe',
      profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: false,
      lastSeen: '2 hours ago'
    },
    {
      id: '3',
      username: 'sarah_smith',
      profilePicture: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: true
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim() && selectedUser) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || '',
        content: messageText.trim(),
        timestamp: new Date(),
        isRead: false
      };

      setMessages(prev => [...prev, newMessage]);
      sendMessage(selectedUser.id, messageText.trim());
      setMessageText('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-60">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col md:flex-row pb-20 md:pb-0 md:pl-4">
        {/* Chat List */}
        <div className={`w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${selectedUser ? 'hidden md:block' : 'block'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between ">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="md:hidden p-1 text-gray-600 dark:text-gray-400"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto">
            {chatUsers.map((chatUser) => (
              <button
                key={chatUser.id}
                onClick={() => setSelectedUser(chatUser)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedUser?.id === chatUser.id ? 'bg-purple-100 dark:bg-purple-900/20' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={chatUser.profilePicture}
                    alt={chatUser.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                      chatUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {chatUser.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chatUser.isOnline ? 'Online' : `Last seen ${chatUser.lastSeen}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col ${selectedUser ? 'block' : 'hidden md:flex'}`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1 text-gray-600 dark:text-gray-400"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedUser.profilePicture}
                      alt={selectedUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedUser.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedUser.isOnline ? 'Online' : `Last seen ${selectedUser.lastSeen}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm md:text-base">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === user?.id
                            ? 'text-purple-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a chat
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Chat;