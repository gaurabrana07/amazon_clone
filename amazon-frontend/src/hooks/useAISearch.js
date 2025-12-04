import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { useRecommendations } from './useRecommendations';
import aiSearchEngine from '../services/aiSearchEngine';

// Custom hook for AI-powered search functionality
export const useAISearch = () => {
  const { products } = useProducts();
  const { trackBehavior } = useRecommendations();
  
  const [searchState, setSearchState] = useState({
    query: '',
    results: [],
    loading: false,
    suggestions: [],
    alternativeQueries: [],
    processedQuery: null,
    totalFound: 0,
    error: null,
    searchHistory: [],
    trendingSearches: []
  });

  const [searchFilters, setSearchFilters] = useState({
    category: '',
    brand: '',
    priceRange: { min: null, max: null },
    rating: null,
    sortBy: 'relevance' // relevance, price_low, price_high, rating, newest
  });

  // Perform AI-powered search
  const performSearch = useCallback(async (query, options = {}) => {
    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        suggestions: [],
        alternativeQueries: [],
        totalFound: 0,
        processedQuery: null
      }));
      return;
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Track search behavior
      trackBehavior('search', 'search_query', { 
        query: query.trim(),
        timestamp: Date.now()
      });

      // Combine manual filters with options
      const searchOptions = {
        ...options,
        limit: options.limit || 20,
        offset: options.offset || 0,
        filters: { ...searchFilters, ...options.filters }
      };

      // Perform AI search
      const searchResult = aiSearchEngine.searchProducts(query, products, searchOptions);

      // Apply additional sorting if needed
      const sortedResults = applySorting(searchResult.results, searchFilters.sortBy);

      setSearchState(prev => ({
        ...prev,
        query: query.trim(),
        results: sortedResults,
        suggestions: searchResult.suggestions,
        alternativeQueries: searchResult.alternativeQueries,
        processedQuery: searchResult.processedQuery,
        totalFound: searchResult.totalFound,
        loading: false
      }));

      return searchResult;
    } catch (error) {
      console.error('Search error:', error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [products, trackBehavior, searchFilters]);

  // Get search suggestions while typing
  const getSearchSuggestions = useCallback((query) => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    return aiSearchEngine.generateSearchSuggestions(query, products);
  }, [products]);

  // Apply sorting to search results
  const applySorting = useCallback((results, sortBy) => {
    const sortedResults = [...results];

    switch (sortBy) {
      case 'price_low':
        return sortedResults.sort((a, b) => a.product.price - b.product.price);
      case 'price_high':
        return sortedResults.sort((a, b) => b.product.price - a.product.price);
      case 'rating':
        return sortedResults.sort((a, b) => (b.product.rating || 0) - (a.product.rating || 0));
      case 'newest':
        return sortedResults.sort((a, b) => new Date(b.product.createdAt || 0) - new Date(a.product.createdAt || 0));
      case 'relevance':
      default:
        return sortedResults; // Already sorted by relevance score
    }
  }, []);

  // Update search filters
  const updateFilters = useCallback((newFilters) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
    
    // Re-run search with new filters if there's an active query
    if (searchState.query) {
      performSearch(searchState.query);
    }
  }, [searchState.query, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: [],
      suggestions: [],
      alternativeQueries: [],
      processedQuery: null,
      totalFound: 0,
      error: null
    }));
  }, []);

  // Get search analytics
  const getSearchAnalytics = useCallback(() => {
    return aiSearchEngine.getSearchAnalytics();
  }, []);

  // Load trending searches and search history
  useEffect(() => {
    const loadSearchData = () => {
      const trending = aiSearchEngine.getTrendingSearches();
      const analytics = aiSearchEngine.getSearchAnalytics();
      
      setSearchState(prev => ({
        ...prev,
        trendingSearches: trending,
        searchHistory: analytics.recentSearches.map(s => s.query)
      }));
    };

    loadSearchData();
  }, []);

  // Memoized search statistics
  const searchStats = useMemo(() => {
    if (!searchState.processedQuery) return null;

    return {
      intent: searchState.processedQuery.intent,
      categories: searchState.processedQuery.categories,
      brands: searchState.processedQuery.brands,
      priceRange: searchState.processedQuery.priceRange,
      attributes: searchState.processedQuery.attributes,
      totalResults: searchState.totalFound,
      hasFilters: Object.values(searchFilters).some(v => 
        v !== '' && v !== null && (typeof v !== 'object' || Object.values(v).some(val => val !== null))
      )
    };
  }, [searchState.processedQuery, searchState.totalFound, searchFilters]);

  return {
    // Search state
    searchState,
    searchFilters,
    searchStats,
    
    // Search actions
    performSearch,
    getSearchSuggestions,
    updateFilters,
    clearSearch,
    getSearchAnalytics,
    
    // Computed values
    isSearchActive: searchState.query.length > 0,
    hasResults: searchState.results.length > 0,
    isLoading: searchState.loading,
    hasError: !!searchState.error,
    
    // Helper functions
    setSortBy: (sortBy) => updateFilters({ sortBy }),
    setCategory: (category) => updateFilters({ category }),
    setBrand: (brand) => updateFilters({ brand }),
    setPriceRange: (priceRange) => updateFilters({ priceRange }),
    setRating: (rating) => updateFilters({ rating })
  };
};

// Hook for search result analytics
export const useSearchAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    searchConversionRate: 0,
    avgSearchResults: 0,
    topSearchTerms: [],
    searchTrends: [],
    loading: true
  });

  useEffect(() => {
    const loadAnalytics = () => {
      const searchAnalytics = aiSearchEngine.getSearchAnalytics();
      const trending = aiSearchEngine.getTrendingSearches();
      
      setAnalytics({
        searchConversionRate: 0.15, // Mock data - would come from real analytics
        avgSearchResults: 12.5, // Mock data
        topSearchTerms: searchAnalytics.topSearches,
        searchTrends: trending,
        loading: false
      });
    };

    loadAnalytics();
  }, []);

  return analytics;
};