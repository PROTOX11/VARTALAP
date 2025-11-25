import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import MobileNavigation from '../components/MobileNavigation';
import Sidebar from '../components/Sidebar';

interface Message {
  _id: string;
  sender: string | { _id: string; username?: string; profilePicture?: string };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const Chat: React.FC = () => {
  // Runtime API URL fallback when VITE_API_URL isn't provided at build time
  const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:6500`;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { sendMessage, isConnected, socket } = useSocket();
  const [selectedUser, setSelectedUser] = useState<any>(location.state?.selectedFriend || null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser && selectedUser.chatId) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/api/message/${selectedUser.chatId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setMessages(
              data.map((msg: any) => ({
                _id: msg._id,
                sender: typeof msg.sender === 'string' ? msg.sender : msg.sender,
                content: msg.content,
                timestamp: new Date(msg.createdAt),
                isRead: msg.isRead || false,
              }))
            );
          } else {
            setMessages([]);
            console.error('Failed to fetch messages:', res.statusText);
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          setMessages([]);
        }
      };
      fetchMessages();
    }
  }, [selectedUser]);

  // Listen for incoming messages, errors, and typing events
  useEffect(() => {
    if (socket && selectedUser?.chatId) {
      socket.on('receiveMessage', ({ sender, message, chatId }) => {
        if (chatId === selectedUser.chatId) {
          setMessages((prev) => [
            ...prev,
            {
              _id: message._id,
              sender: typeof sender === 'string' ? sender : sender,
              content: message.content,
              timestamp: new Date(message.createdAt),
              isRead: message.isRead || false,
            },
          ]);
        }
      });

      socket.on('messageSent', (message) => {
        if (message.chatId === selectedUser.chatId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === message._id || (msg.timestamp.toISOString() === new Date(message.createdAt).toISOString() && msg.content === message.content)
                ? { ...msg, _id: message._id, timestamp: new Date(message.createdAt), isRead: message.isRead || false }
                : msg
            )
          );
        }
      });

      socket.on('userTyping', ({ senderId, isTyping }) => {
        if (senderId === selectedUser._id) {
          setIsTyping(isTyping);
        }
      });

      socket.on('error', ({ message }) => {
        console.error('Socket error:', message);
        alert(`Error: ${message}`);
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('messageSent');
        socket.off('userTyping');
        socket.off('error');
      };
    }
  }, [socket, selectedUser]);

  // Emit typing events
  useEffect(() => {
    if (socket && selectedUser) {
      const isTypingNow = messageText.trim().length > 0;
      socket.emit('typing', { receiver: selectedUser._id, isTyping: isTypingNow });
      let timeout: NodeJS.Timeout;
      if (isTypingNow) {
        timeout = setTimeout(() => {
          socket.emit('typing', { receiver: selectedUser._id, isTyping: false });
        }, 2000);
      }
      return () => clearTimeout(timeout);
    }
  }, [messageText, socket, selectedUser]);

  // Scroll to bottom when typing or new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageText, messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedUser?.chatId && user?._id && isConnected) {
      // Optimistically add message to UI
      const tempMessage: Message = {
        _id: Date.now().toString(), // Temporary ID
        sender: user._id,
        content: messageText.trim(),
        timestamp: new Date(),
        isRead: false,
      };
      setMessages((prev) => [...prev, tempMessage]);
      sendMessage(selectedUser._id, selectedUser.chatId, messageText.trim());
      setMessageText('');
    } else {
      console.error('Cannot send message: Missing requirements', {
        messageText: messageText.trim(),
        chatId: selectedUser?.chatId,
        userId: user?._id,
        isConnected,
      });
      alert('Please enter a message and ensure you are connected');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-60">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col md:flex-row pb-[-56px] md:pb-0 md:pl-4">
        <div
          className={`w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${selectedUser ? 'hidden md:block' : 'block'
            }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
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

          <div className="overflow-y-auto">
            {user?.friends?.map((friend: any, index: number) => (
              <button
                key={friend._id || index}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/api/chat/create`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ participantId: friend._id }),
                    });
                    if (res.ok) {
                      const chat = await res.json();
                      setSelectedUser({ ...friend, chatId: chat._id });
                    } else {
                      console.error('Failed to create/fetch chat:', res.statusText);
                      alert('Failed to load chat');
                    }
                  } catch (error) {
                    console.error('Error creating/fetching chat:', error);
                    alert('Error loading chat');
                  }
                }}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedUser?._id === friend._id ? 'bg-purple-100 dark:bg-purple-900/20' : ''
                  }`}
              >
                <div className="relative">
                  <img
                    src={friend.profilePicture || '/default-profile.png'}
                    alt={friend.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{friend.username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {friend.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${selectedUser ? 'block' : 'hidden md:flex'}`}>
          {selectedUser ? (
            <>
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1 text-gray-600 dark:text-gray-400"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedUser.profilePicture || '/default-profile.png'}
                      alt={selectedUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedUser.username}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isTyping ? 'Typing...' : selectedUser.isOnline ? 'Online' : 'Offline'}
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

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${(typeof message.sender === 'string' ? message.sender : message.sender._id) === user?._id
                      ? 'justify-end'
                      : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${(typeof message.sender === 'string' ? message.sender : message.sender._id) === user?._id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                    >
                      <p className="text-sm md:text-base">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${(typeof message.sender === 'string' ? message.sender : message.sender._id) === user?._id
                          ? 'text-purple-200'
                          : 'text-gray-500 dark:text-gray-400'
                          }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 pb-24 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-10">
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
                    disabled={!messageText.trim() || !selectedUser?.chatId || !isConnected}
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a chat</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose a conversation to start messaging</p>
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