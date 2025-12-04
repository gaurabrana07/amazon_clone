import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const SearchComponent = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  const {
    searchQuery,
    setSearchQuery,
    performSearch,
    searchHistory,
    removeFromHistory,
    clearSearchHistory,
    getSuggestions,
    isSearching
  } = useSearch();

  const suggestions = getSuggestions(localQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query = localQuery) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    performSearch(query);
    setIsOpen(false);
    navigate('/search');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      setLocalQuery(suggestion.value);
      handleSearch(suggestion.value);
    } else if (suggestion.type === 'category') {
      navigate(`/category/${suggestion.value.toLowerCase()}`);
      setIsOpen(false);
    }
  };

  const handleHistoryClick = (query) => {
    setLocalQuery(query);
    handleSearch(query);
  };

  const clearInput = () => {
    setLocalQuery('');
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Amazon Clone..."
          className="flex-1 px-4 py-2 text-gray-900 placeholder-gray-500 bg-transparent border-none rounded-l-md focus:outline-none"
        />
        
        {localQuery && (
          <button
            onClick={clearInput}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
        
        <button
          onClick={() => handleSearch()}
          className="px-4 py-2 bg-orange-400 text-white rounded-r-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && !localQuery && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Recent Searches</h4>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-orange-600 hover:text-orange-500"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <button
                      onClick={() => handleHistoryClick(query)}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 flex-1 text-left"
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span>{query}</span>
                    </button>
                    <button
                      onClick={() => removeFromHistory(query)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {localQuery && suggestions.length > 0 && (
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                      <span>{suggestion.value}</span>
                    </div>
                    {suggestion.type === 'category' && (
                      <span className="text-xs text-gray-400">
                        {suggestion.count} items
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {localQuery && suggestions.length === 0 && !isSearching && (
            <div className="p-3 text-center text-gray-500">
              <p className="text-sm">No suggestions found</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-sm text-orange-600 hover:text-orange-500"
              >
                Search for "{localQuery}"
              </button>
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="p-3 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span>Searching...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;