import React from 'react';
import { 
  ShoppingCartIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const ChatMessage = ({ 
  message, 
  onSuggestionClick, 
  onProductAction,
  showProductCards = true 
}) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Render message content with formatting
  const renderMessageContent = (message) => {
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
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                onClick={() => onSuggestionClick(suggestion)}
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
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {message.products.slice(0, 3).map((productResult) => (
                <div
                  key={productResult.product?.id || Math.random()}
                  className="bg-white border border-gray-200 rounded-lg p-2"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={productResult.product?.image || '/api/placeholder/40/40'}
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
                      <button 
                        onClick={() => onProductAction?.(productResult.product, 'cart')}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onProductAction?.(productResult.product, 'wishlist')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
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
  );
};

export default ChatMessage;