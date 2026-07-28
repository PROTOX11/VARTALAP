import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone, Video, Search, Smile, Paperclip, CheckCheck, Circle, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useCall } from '../hooks/useCall';
import MobileNavigation from '../components/MobileNavigation';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';

interface Message {
  _id: string;
  sender: string | { _id: string; username?: string; profilePicture?: string };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export const Chat: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:6500`;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { sendMessage, isConnected, socket } = useSocket();
  const { startCall } = useCall();

  const [selectedUser, setSelectedUser] = useState<any>(location.state?.selectedFriend || null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [friendsSearch, setFriendsSearch] = useState('');

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
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          setMessages([]);
        }
      };
      fetchMessages();
    }
  }, [selectedUser, API_URL]);

  // Socket listeners for messages & typing
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

      socket.on('userTyping', ({ senderId, isTyping: typingState }) => {
        if (senderId === selectedUser._id) {
          setIsTyping(typingState);
        }
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('messageSent');
        socket.off('userTyping');
      };
    }
  }, [socket, selectedUser]);

  // Typing indicator broadcast
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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedUser?.chatId && user?._id && isConnected) {
      const tempMessage: Message = {
        _id: Date.now().toString(),
        sender: user._id,
        content: messageText.trim(),
        timestamp: new Date(),
        isRead: false,
      };
      setMessages((prev) => [...prev, tempMessage]);
      sendMessage(selectedUser._id, selectedUser.chatId, messageText.trim());
      setMessageText('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = messages
    .filter((m) => !searchQuery.trim() || m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .reduce((acc: { [key: string]: Message[] }, msg) => {
      const dateKey = formatDateHeader(msg.timestamp);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    }, {});

  const filteredFriends = user?.friends?.filter((f: any) =>
    f.username?.toLowerCase().includes(friendsSearch.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden md:pl-64">
      {/* Permanent Left Navigation Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Responsive Chat Layout Container */}
      <div className="flex-1 flex w-full h-full overflow-hidden">
        
        {/* Pane 1: Conversations List (Width: 100% mobile, 320px tablet/desktop) */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full ${
            selectedUser ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Pane 1 Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="md:hidden p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:scale-95 transition-transform"
                  title="Back to Home"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                  Messages
                </h1>
              </div>

              {/* Right: Connection status + top action icons */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                {/* Connection status pill */}
                <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs">
                  <Circle size={7} className={isConnected ? 'fill-emerald-500 text-emerald-500' : 'fill-rose-500 text-rose-500'} />
                  <span className="font-semibold text-gray-600 dark:text-gray-300 hidden xs:inline sm:inline">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Notifications */}
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-all active:scale-95"
                  title="Notifications"
                >
                  <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* Dark mode toggle */}
                <ThemeToggle />

                {/* Profile */}
                <button
                  onClick={() => navigate('/profile')}
                  className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-all active:scale-95"
                  title="My Profile"
                >
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>

            {/* Friends Search Bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={friendsSearch}
                onChange={(e) => setFriendsSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700/60 border border-transparent rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
            {filteredFriends.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                No friends found. Add friends to start chatting!
              </div>
            ) : (
              filteredFriends.map((friend: any) => {
                const isSelected = selectedUser?._id === friend._id;
                return (
                  <button
                    key={friend._id}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_URL}/api/chat/create`, {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ participantId: friend._id }),
                        });
                        if (res.ok) {
                          const chat = await res.json();
                          setSelectedUser({ ...friend, chatId: chat._id });
                        }
                      } catch (error) {
                        console.error('Error starting chat:', error);
                      }
                    }}
                    className={`w-full p-3 sm:p-3.5 flex items-center space-x-3 transition-all text-left ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-600'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/40 active:bg-gray-100 dark:active:bg-gray-700/60'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={friend.profilePicture || '/default-profile.png'}
                        alt={friend.username}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-purple-500/20"
                      />
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                          {friend.username}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {friend.isOnline ? 'Active' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {friend.about || 'Available on VARTALAP'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Pane 2: Active Conversation View */}
        <div
          key={selectedUser?._id || 'no-chat'}
          className={`flex-1 flex flex-col h-full bg-gray-100/60 dark:bg-gray-900 animate-slide-in-right ${
            selectedUser ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedUser ? (
            <>
              {/* Chat Conversation Header */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-transform active:scale-95 flex-shrink-0"
                    title="Back to Conversations"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {/* Clickable Username & Profile Picture -> Jump to Friend Profile */}
                  <div
                    onClick={() => selectedUser?._id && navigate(`/friend/${selectedUser._id}`)}
                    className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 cursor-pointer group/user flex-1"
                    title={`View ${selectedUser.username}'s profile`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={selectedUser.profilePicture || '/default-profile.png'}
                        alt={selectedUser.username}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-purple-500/30 group-hover/user:ring-purple-500 group-hover/user:scale-105 transition-all duration-200"
                      />
                      {selectedUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 animate-pulse" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-base tracking-wide truncate group-hover/user:text-purple-600 dark:group-hover/user:text-purple-400 transition-colors">
                        {selectedUser.username}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium transition-all truncate">
                        {isTyping ? <span className="animate-pulse">Typing...</span> : selectedUser.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all active:scale-95"
                    title="Search Messages"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    onClick={() => selectedUser?._id && startCall(selectedUser._id, selectedUser, 'audio')}
                    className="p-1.5 sm:p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-full transition-all active:scale-95"
                    title="Start Audio Call"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={() => selectedUser?._id && startCall(selectedUser._id, selectedUser, 'video')}
                    className="p-1.5 sm:p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-full transition-all active:scale-95"
                    title="Start Video Call"
                  >
                    <Video size={18} />
                  </button>
                </div>
              </div>

              {/* Collapsible Message Search Filter Bar */}
              {showSearch && (
                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-800/50 flex items-center gap-2 animate-slide-fade-in">
                  <Search size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search in this conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-purple-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Chat Message Scroll Workspace */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
                {Object.keys(groupedMessages).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs sm:text-sm animate-fade-in">
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([dateLabel, dateMsgs]) => (
                    <div key={dateLabel} className="space-y-3 sm:space-y-4">
                      {/* Date Separator Badge */}
                      <div className="flex items-center justify-center my-2 sm:my-3">
                        <span className="px-3 py-0.5 sm:py-1 bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] sm:text-[11px] font-semibold rounded-full shadow-sm">
                          {dateLabel}
                        </span>
                      </div>

                      {/* Messages List */}
                      {dateMsgs.map((message) => {
                        const isMe = (typeof message.sender === 'string' ? message.sender : message.sender._id) === user?._id;
                        return (
                          <div key={message._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                            <div
                              className={`max-w-[85%] sm:max-w-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-sm space-y-1 transition-all hover:shadow-md ${
                                isMe
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700/60 rounded-bl-none'
                              }`}
                            >
                              <p className="text-xs sm:text-sm leading-relaxed break-words">{message.content}</p>
                              <div className={`flex items-center justify-end space-x-1 text-[9px] sm:text-[10px] ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                <span>{formatTime(message.timestamp)}</span>
                                {isMe && <CheckCheck size={13} className="text-purple-200" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Workspace */}
              <div className="p-2.5 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-20">
                <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-100 dark:bg-gray-700/70 p-1.5 sm:p-2 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <button className="p-1 sm:p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 transition-colors">
                    <Smile size={18} className="sm:w-[20px] sm:h-[20px]" />
                  </button>
                  <button className="p-1 sm:p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 transition-colors">
                    <Paperclip size={18} className="sm:w-[20px] sm:h-[20px]" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !selectedUser?.chatId || !isConnected}
                    className="p-2 sm:p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-600/30 active:scale-95 flex-shrink-0"
                  >
                    <Send size={15} className="sm:w-[16px] sm:h-[16px]" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State when no chat selected */
            <div className="hidden md:flex flex-1 items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-purple-500/10">
                  <Send size={36} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Conversations</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Select a friend from the sidebar to start a real-time conversation or audio/video call.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Navigation — only visible when no active chat thread is open on mobile */}
      <div className={selectedUser ? 'hidden md:block' : 'block'}>
        <MobileNavigation />
      </div>
    </div>
  );
};

export default Chat;