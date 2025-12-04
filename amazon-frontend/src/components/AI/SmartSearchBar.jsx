import React, { useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline';

const SmartSearchBar = memo(({ 
  placeholder = "Search for products...", 
  className = "",
  onSearch = null,
  autoFocus = false 
}) => {
  const navigate = useNavigate();
  const { performSearch } = useSearch();
  
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Handle search submission
  const handleSearch = useCallback(async (query = inputValue) => {
    if (!query.trim()) return;
    
    if (onSearch) {
      onSearch(query);
    } else {
      await performSearch(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [inputValue, onSearch, performSearch, navigate]);

  // Handle form submit
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  // Handle clear input
  const handleClear = useCallback(() => {
    setInputValue('');
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-12 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-4 bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-r-lg transition-colors"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
});

SmartSearchBar.displayName = 'SmartSearchBar';

export default SmartSearchBar;