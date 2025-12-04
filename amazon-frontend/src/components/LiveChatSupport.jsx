import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import {
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PhotoIcon,
  DocumentIcon,
  MinusIcon,
  StarIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const LiveChatSupport = () => {
  const {
    activeChatId,
    getActiveChat,
    startNewChat,
    sendMessage,
    endChat,
    getChatHistory,
    getUnreadCount,
    isLoading,
    queuePosition
  } = useChat();
  const { isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSatisfactionSurvey, setShowSatisfactionSurvey] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [satisfaction, setSatisfaction] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeChat = getActiveChat();
  const chatHistory = getChatHistory();
  const unreadCount = getUnreadCount();

  const topics = [
    "Order Status Inquiry",
    "Returns & Refunds",
    "Product Questions",
    "Technical Support",
    "Payment Issues",
    "Account Help",
    "Prime Benefits",
    "Shipping Information",
    "Product Recommendations",
    "General Inquiry"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartChat = async () => {
    if (!selectedTopic) {
      alert('Please select a topic for your inquiry');
      return;
    }

    const chat = await startNewChat(selectedTopic);
    if (chat) {
      setShowHistory(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId) return;

    sendMessage(activeChatId, message.trim());
    setMessage('');
  };

  const handleEndChat = () => {
    if (activeChatId) {
      setShowSatisfactionSurvey(true);
    }
  };

  const handleSatisfactionSubmit = () => {
    endChat(activeChatId, satisfaction);
    setShowSatisfactionSurvey(false);
    setSatisfaction(0);
    setShowHistory(true);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="p-6 text-center">
              <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-4">Please login to start a chat with our support team.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-200 ${
          isMinimized ? 'h-14' : 'h-[500px]'
        }`}>
          {/* Header */}
          <div className="bg-orange-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-8 w-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold">Amazon Support</h3>
                {activeChat ? (
                  <p className="text-sm text-orange-100">
                    {activeChat.agent.name} • {activeChat.agent.responseTime}
                  </p>
                ) : (
                  <p className="text-sm text-orange-100">How can we help you?</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-orange-400 rounded"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-orange-400 rounded"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col h-[436px]">
              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {showSatisfactionSurvey ? (
                  // Satisfaction Survey
                  <div className="p-6 text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      How was your experience?
                    </h4>
                    <div className="flex justify-center space-x-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setSatisfaction(star)}
                          className="transition-colors"
                        >
                          {star <= satisfaction ? (
                            <StarSolidIcon className="h-8 w-8 text-yellow-400" />
                          ) : (
                            <StarIcon className="h-8 w-8 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={handleSatisfactionSubmit}
                        disabled={satisfaction === 0}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => setShowSatisfactionSurvey(false)}
                        className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                ) : showHistory ? (
                  // Chat History
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Chat History</h4>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        Start New Chat
                      </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {chatHistory.length > 0 ? (
                        chatHistory.map((chat) => (
                          <div
                            key={chat.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setShowHistory(false);
                              // In a real app, you might reopen the chat
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-gray-900">
                                {chat.topic}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                chat.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {chat.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{chat.agent.name}</span>
                              <span>•</span>
                              <span>{formatDate(chat.startTime)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No previous chats</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : !activeChat ? (
                  // Start Chat Form
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">How can we help you today?</h4>
                    
                    {queuePosition && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-5 w-5 text-blue-500" />
                          <span className="text-sm text-blue-700">
                            You're #{queuePosition} in queue. Estimated wait: {queuePosition * 2} minutes
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select a topic:
                        </label>
                        <select
                          value={selectedTopic}
                          onChange={(e) => setSelectedTopic(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">Choose a topic...</option>
                          {topics.map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleStartChat}
                        disabled={!selectedTopic || isLoading}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Connecting...' : 'Start Chat'}
                      </button>

                      <button
                        onClick={() => setShowHistory(true)}
                        className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                      >
                        View Chat History
                      </button>
                    </div>
                  </div>
                ) : (
                  // Active Chat
                  <div className="flex flex-col h-full">
                    {/* Agent Info */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <img
                          src={activeChat.agent.avatar}
                          alt={activeChat.agent.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {activeChat.agent.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>⭐ {activeChat.agent.rating}</span>
                            <span>•</span>
                            <span>{activeChat.agent.specialties[0]}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleEndChat}
                          className="ml-auto text-red-500 hover:text-red-600 text-sm"
                        >
                          End Chat
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {activeChat.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.senderType === 'customer' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.senderType === 'customer'
                                ? 'bg-orange-500 text-white'
                                : msg.type === 'tip'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.senderType === 'customer' ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <button
                          type="submit"
                          disabled={!message.trim()}
                          className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveChatSupport;