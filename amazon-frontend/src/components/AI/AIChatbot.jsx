import React, { useState, useRef, useEffect } from 'react';
import { useShoppingAssistant } from '../../hooks/useShoppingAssistant';
import { IMAGE_CONFIG } from '../../config/imageConfig';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ShoppingCartIcon,
  HeartIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatSolidIcon } from '@heroicons/react/24/solid';
import ProductCard from '../ProductCard/ProductCard';

const AIChatbot = ({ className = "" }) => {
  const {
    chatState,
    assistantStatus,
    sendMessage,
    sendSuggestion,
    toggleChat,
    closeChat,
    clearConversation,
    hasUnreadMessages,
    isTyping,
    isOpen
  } = useShoppingAssistant();

  const [inputMessage, setInputMessage] = useState('');
  const [showProductCards, setShowProductCards] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatState.messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    sendSuggestion(suggestion);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Render message content
  const renderMessageContent = (message) => {
    // Split message text by newlines and format
    const lines = message.text.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, index) => {
          if (line.trim() === '') return <br key={index} />;
          
          // Handle markdown-style formatting
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <div key={index} className="font-semibold text-gray-900">
                {line.slice(2, -2)}
              </div>
            );
          }
          
          if (line.startsWith('• ')) {
            return (
              <div key={index} className="ml-4 text-gray-700">
                {line}
              </div>
            );
          }
          
          if (line.startsWith('💡') || line.startsWith('🔥') || line.startsWith('📊')) {
            return (
              <div key={index} className="bg-blue-50 text-blue-800 p-2 rounded text-sm">
                {line}
              </div>
            );
          }
          
          return (
            <div key={index} className="text-gray-700">
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50 ${className}`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <ChatSolidIcon className="h-6 w-6" />
          )}
          
          {/* Unread indicator */}
          {hasUnreadMessages && !isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {chatState.unreadCount > 9 ? '9+' : chatState.unreadCount}
              </span>
            </div>
          )}
          
          {/* AI indicator */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-3 w-3 text-white" />
          </div>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Shopping Assistant</h3>
                  <div className="flex items-center space-x-1 text-sm text-blue-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{assistantStatus.responseTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearConversation}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Clear conversation"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={closeChat}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {/* Message content */}
                  <div className="text-sm">
                    {renderMessageContent(message)}
                  </div>

                  {/* Timestamp */}
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>

                  {/* Quick suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product recommendations */}
                  {message.products && message.products.length > 0 && showProductCards && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Recommended Products
                        </span>
                        <button
                          onClick={() => setShowProductCards(!showProductCards)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {showProductCards ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                        {message.products.slice(0, 3).map((productResult) => (
                          <div
                            key={productResult.product?.id || Math.random()}
                            className="bg-white border border-gray-200 rounded-lg p-2"
                          >
                            <div className="flex items-center space-x-2">
                              <img
                                src={productResult.product?.image || IMAGE_CONFIG.UI.avatar}
                                alt={productResult.product?.name || 'Product'}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {productResult.product?.name || 'Product Name'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ${productResult.product?.price || '0.00'}
                                </p>
                                {productResult.reason && (
                                  <p className="text-xs text-blue-600">
                                    {productResult.reason}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <button className="p-1 text-gray-400 hover:text-blue-600">
                                  <ShoppingCartIcon className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-500">
                                  <HeartIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl max-w-xs">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Assistant is typing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about products..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Quick action buttons */}
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={() => handleSuggestionClick("Show me deals")}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                💰 Deals
              </button>
              <button
                type="button"
                onClick={() => handleSuggestionClick("Recommend products")}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                ⭐ Recommend
              </button>
              <button
                type="button"
                onClick={() => handleSuggestionClick("Help me choose")}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                🤔 Help
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;