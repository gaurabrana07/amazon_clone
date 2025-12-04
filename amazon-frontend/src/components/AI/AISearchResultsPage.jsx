import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAISearch } from '../../hooks/useAISearch';
import { useRecommendations } from '../../hooks/useRecommendations';
import ProductCard from '../ProductCard/ProductCard';
import SmartSearchBar from './SmartSearchBar';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { 
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AISearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const {
    searchState,
    searchFilters,
    searchStats,
    performSearch,
    updateFilters,
    setSortBy,
    setCategory,
    setBrand,
    setPriceRange,
    setRating,
    isLoading,
    hasResults,
    hasError
  } = useAISearch();

  const { trackBehavior } = useRecommendations();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Perform search when query changes
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // Track search result view
  useEffect(() => {
    if (hasResults) {
      trackBehavior('view', 'search_results', {
        query,
        resultCount: searchState.totalFound
      });
    }
  }, [hasResults, searchState.totalFound, query, trackBehavior]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setCategory(value);
        break;
      case 'brand':
        setBrand(value);
        break;
      case 'priceRange':
        setPriceRange(value);
        break;
      case 'rating':
        setRating(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateFilters({
      category: '',
      brand: '',
      priceRange: { min: null, max: null },
      rating: null,
      sortBy: 'relevance'
    });
  };

  // Get unique values for filter options
  const getFilterOptions = () => {
    const categories = [...new Set(searchState.results.map(r => r.product.category))];
    const brands = [...new Set(searchState.results.map(r => r.product.brand))];
    return { categories, brands };
  };

  const { categories, brands } = getFilterOptions();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <SmartSearchBar 
              className="max-w-2xl mx-auto"
              autoFocus={false}
            />
          </div>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SmartSearchBar 
            className="max-w-2xl mx-auto"
            autoFocus={false}
          />
        </div>

        {/* Search Results Header */}
        <div className="mb-6">
          {/* Query Info */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Search results for "<span className="text-blue-600">{query}</span>"
            </h1>
            <p className="text-gray-600 mt-1">
              {searchState.totalFound} products found
              {searchStats?.intent && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  {searchStats.intent.replace('_', ' ')}
                </span>
              )}
            </p>
          </div>

          {/* AI Search Insights */}
          {searchStats && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    AI Search Insights
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {searchStats.categories.length > 0 && (
                      <div>
                        <span className="text-blue-700 font-medium">Categories:</span>
                        <span className="text-blue-600 ml-1">
                          {searchStats.categories.join(', ')}
                        </span>
                      </div>
                    )}
                    {searchStats.brands.length > 0 && (
                      <div>
                        <span className="text-blue-700 font-medium">Brands:</span>
                        <span className="text-blue-600 ml-1">
                          {searchStats.brands.join(', ')}
                        </span>
                      </div>
                    )}
                    {(searchStats.priceRange.min || searchStats.priceRange.max) && (
                      <div>
                        <span className="text-blue-700 font-medium">Price:</span>
                        <span className="text-blue-600 ml-1">
                          {searchStats.priceRange.min && `$${searchStats.priceRange.min}+`}
                          {searchStats.priceRange.max && `Under $${searchStats.priceRange.max}`}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-blue-700 font-medium">Results:</span>
                      <span className="text-blue-600 ml-1">{searchStats.totalResults}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Queries */}
          {searchState.alternativeQueries.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <LightBulbIcon className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Try searching for:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchState.alternativeQueries.map((alt, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(alt)}`}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
                  >
                    {alt}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Toggle & Sort */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
                {searchStats?.hasFilters && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>

              <select
                value={searchFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* View Mode & Clear Filters */}
            <div className="flex items-center space-x-4">
              {searchStats?.hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear all filters
                </button>
              )}
              
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={searchFilters.category === category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Brand</h4>
                    <div className="space-y-2">
                      {brands.slice(0, 5).map(brand => (
                        <label key={brand} className="flex items-center">
                          <input
                            type="radio"
                            name="brand"
                            value={brand}
                            checked={searchFilters.brand === brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {brand}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Under $25', max: 25 },
                      { label: '$25 to $50', min: 25, max: 50 },
                      { label: '$50 to $100', min: 50, max: 100 },
                      { label: '$100 to $200', min: 100, max: 200 },
                      { label: 'Over $200', min: 200 }
                    ].map((range, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={JSON.stringify(range)}
                          checked={
                            searchFilters.priceRange.min === (range.min || null) &&
                            searchFilters.priceRange.max === (range.max || null)
                          }
                          onChange={(e) => {
                            const value = JSON.parse(e.target.value);
                            handleFilterChange('priceRange', {
                              min: value.min || null,
                              max: value.max || null
                            });
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={searchFilters.rating === rating}
                          onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {rating}★ & Up
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="flex-1">
            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">
                    Something went wrong with your search. Please try again.
                  </span>
                </div>
              </div>
            )}

            {hasResults ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {searchState.results.map((result, index) => (
                  <div key={`${result.product.id}-${index}`} className="relative">
                    <ProductCard 
                      product={result.product} 
                      variant={viewMode === 'list' ? 'list' : 'grid'}
                    />
                    
                    {/* AI Match Reasons */}
                    {result.matchReasons.length > 0 && (
                      <div className="absolute top-2 right-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        <div className="flex items-center space-x-1">
                          <SparklesIcon className="h-3 w-3" />
                          <span>{result.matchReasons[0]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  
                  {/* Search Suggestions */}
                  {searchState.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-700 mb-3">Try searching for:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {searchState.suggestions.slice(0, 3).map((suggestion, index) => (
                          <Link
                            key={index}
                            to={`/search?q=${encodeURIComponent(suggestion.text)}`}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                          >
                            {suggestion.text}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchResultsPage;