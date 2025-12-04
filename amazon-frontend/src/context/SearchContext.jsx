import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProducts } from './ProductContext';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 300000 },
    rating: 0,
    brand: '',
    sortBy: 'relevance'
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load search history from localStorage once
  useEffect(() => {
    const savedHistory = localStorage.getItem('amazon_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing search history:', error);
      }
    }
  }, []);

  const performSearch = useCallback(async (query, customFilters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const searchTerm = query.toLowerCase();
    const activeFilters = { ...filters, ...customFilters };

    try {
      let results = products.filter(product => {
        // Text search
        const matchesQuery = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          (product.description && product.description.toLowerCase().includes(searchTerm));

        // Category filter
        const matchesCategory = !activeFilters.category || 
          product.category.toLowerCase() === activeFilters.category.toLowerCase();

        // Price range filter
        const matchesPrice = 
          product.price >= activeFilters.priceRange.min && 
          product.price <= activeFilters.priceRange.max;

        // Rating filter
        const matchesRating = !activeFilters.rating || 
          (product.rating >= activeFilters.rating);

        return matchesQuery && matchesCategory && matchesPrice && matchesRating;
      });

      // Sort results
      switch (activeFilters.sortBy) {
        case 'price_low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          break;
      }

      setSearchResults(results);
      
      // Add to search history
      if (query.trim() && !searchHistory.includes(query.trim())) {
        const updatedHistory = [query.trim(), ...searchHistory.slice(0, 9)];
        setSearchHistory(updatedHistory);
        localStorage.setItem('amazon_search_history', JSON.stringify(updatedHistory));
      }

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [products, filters, searchHistory]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('amazon_search_history');
  }, []);

  const removeFromHistory = useCallback((query) => {
    const updatedHistory = searchHistory.filter(item => item !== query);
    setSearchHistory(updatedHistory);
    localStorage.setItem('amazon_search_history', JSON.stringify(updatedHistory));
  }, [searchHistory]);

  const getCategories = useCallback(() => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.sort();
  }, [products]);

  const getSuggestions = useCallback((query) => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const suggestions = [];

    products.forEach(product => {
      if (product.name.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          type: 'product',
          value: product.name,
          product: product
        });
      }
    });

    return suggestions.slice(0, 8);
  }, [products]);

  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    searchResults,
    filters,
    updateFilters,
    searchHistory,
    isSearching,
    performSearch,
    clearSearch,
    clearSearchHistory,
    removeFromHistory,
    getCategories,
    getSuggestions
  }), [
    searchQuery, searchResults, filters, searchHistory, isSearching,
    performSearch, updateFilters, clearSearch, clearSearchHistory,
    removeFromHistory, getCategories, getSuggestions
  ]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;