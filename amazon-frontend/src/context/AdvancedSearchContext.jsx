import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useProducts } from './ProductContext';

const AdvancedSearchContext = createContext();

export const useAdvancedSearch = () => {
  const context = useContext(AdvancedSearchContext);
  if (!context) {
    throw new Error('useAdvancedSearch must be used within an AdvancedSearchProvider');
  }
  return context;
};

// Lightweight Advanced Search Provider
export const AdvancedSearchProvider = ({ children }) => {
  const { products } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    priceRange: { min: 0, max: 100000 },
    rating: 0,
    sortBy: 'relevance'
  });

  const performAdvancedSearch = useCallback((query, customFilters = {}) => {
    const mergedFilters = { ...filters, ...customFilters };
    const searchTerm = query.toLowerCase();
    
    let results = products.filter(product => {
      // Text search
      const matchesQuery = !query || 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm);
      
      if (!matchesQuery) return false;
      
      // Category filter
      if (mergedFilters.category && product.category !== mergedFilters.category) return false;
      
      // Brand filter  
      if (mergedFilters.brand && product.brand !== mergedFilters.brand) return false;
      
      // Price filter
      if (product.price < mergedFilters.priceRange.min || product.price > mergedFilters.priceRange.max) return false;
      
      // Rating filter
      if (mergedFilters.rating && product.rating < mergedFilters.rating) return false;
      
      return true;
    });

    // Sort
    if (mergedFilters.sortBy === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (mergedFilters.sortBy === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else if (mergedFilters.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }

    return {
      products: results,
      totalResults: results.length,
      suggestions: [],
      aiInsights: null,
      appliedFilters: mergedFilters
    };
  }, [products, filters]);

  const getSearchSuggestions = useCallback((query) => {
    if (!query || query.length < 2) return [];
    const searchTerm = query.toLowerCase();
    return products
      .filter(p => p.name?.toLowerCase().includes(searchTerm))
      .slice(0, 5)
      .map(p => ({ text: p.name, type: 'product' }));
  }, [products]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: '',
      brand: '',
      priceRange: { min: 0, max: 100000 },
      rating: 0,
      sortBy: 'relevance'
    });
  }, []);

  const getFilterOptions = useCallback(() => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return {
      categories: categories.map(c => ({ value: c, label: c })),
      brands: brands.map(b => ({ value: b, label: b })),
      priceRange: { min: 0, max: 300000 },
      ratings: [1, 2, 3, 4, 5],
      sortOptions: [
        { value: 'relevance', label: 'Relevance' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Customer Rating' }
      ]
    };
  }, [products]);

  const value = useMemo(() => ({
    performAdvancedSearch,
    getSearchSuggestions,
    saveSearch: () => {},
    deleteSavedSearch: () => {},
    clearSearchHistory: () => {},
    filters,
    updateFilters,
    resetFilters,
    getFilterOptions,
    searchHistory: [],
    savedSearches: [],
    searchSuggestions: [],
    popularSearches: [],
    aiInsights: {},
    isLoading
  }), [performAdvancedSearch, getSearchSuggestions, filters, updateFilters, resetFilters, getFilterOptions, isLoading]);

  return (
    <AdvancedSearchContext.Provider value={value}>
      {children}
    </AdvancedSearchContext.Provider>
  );
};

export default AdvancedSearchContext;
