import React, { useState, useEffect } from 'react';
import { useAdvancedSearch } from '../context/AdvancedSearchContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  XMarkIcon,
  FunnelIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const AdvancedSearchPage = () => {
  const {
    performAdvancedSearch,
    getSearchSuggestions,
    saveSearch,
    deleteSavedSearch,
    clearSearchHistory,
    filters,
    updateFilters,
    resetFilters,
    getFilterOptions,
    searchHistory,
    savedSearches,
    popularSearches,
    aiInsights,
    isLoading
  } = useAdvancedSearch();

  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentAiInsights, setCurrentAiInsights] = useState(null);

  const filterOptions = getFilterOptions();

  // Get initial query from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const initialQuery = urlParams.get('q') || '';
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [location.search]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    const searchResults = await performAdvancedSearch(searchQuery, filters);
    setResults(searchResults.products || []);
    setTotalResults(searchResults.totalResults || 0);
    setCurrentAiInsights(searchResults.aiInsights);
    setSearchPerformed(true);
    setShowSuggestions(false);

    // Update URL
    navigate(`/advanced-search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 2) {
      const autoSuggestions = getSearchSuggestions(value);
      setSuggestions(autoSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
  };

  const handleFilterChange = (filterType, value) => {
    updateFilters({ [filterType]: value });
    if (searchPerformed) {
      handleSearch();
    }
  };

  const handleSaveSearch = () => {
    saveSearch(query, filters);
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const renderFilters = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetFilters}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Reset
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">All Categories</option>
          {filterOptions.categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">All Brands</option>
          {filterOptions.brands.map((brand) => (
            <option key={brand.value} value={brand.value}>
              {brand.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range: {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={filterOptions.priceRange.max}
            step="1000"
            value={filters.priceRange.min}
            onChange={(e) => handleFilterChange('priceRange', {
              ...filters.priceRange,
              min: parseInt(e.target.value)
            })}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max={filterOptions.priceRange.max}
            step="1000"
            value={filters.priceRange.max}
            onChange={(e) => handleFilterChange('priceRange', {
              ...filters.priceRange,
              max: parseInt(e.target.value)
            })}
            className="w-full"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleFilterChange('rating', rating === filters.rating ? 0 : rating)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                rating <= filters.rating
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <StarIcon className="h-4 w-4" />
              <span>{rating}+</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Products' },
            { value: 'in-stock', label: 'In Stock Only' },
            { value: 'out-of-stock', label: 'Out of Stock' }
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="availability"
                value={option.value}
                checked={filters.availability === option.value}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="mr-2 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Shipping Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping</label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Shipping Options' },
            { value: 'free-shipping', label: 'Free Shipping' },
            { value: 'prime', label: 'Prime Delivery' },
            { value: 'same-day', label: 'Same Day Delivery' }
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="shipping"
                value={option.value}
                checked={filters.shipping === option.value}
                onChange={(e) => handleFilterChange('shipping', e.target.value)}
                className="mr-2 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Discount Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Discount: {filters.discountPercentage}%
        </label>
        <input
          type="range"
          min="0"
          max="80"
          step="5"
          value={filters.discountPercentage}
          onChange={(e) => handleFilterChange('discountPercentage', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );

  const renderProductCard = (product) => (
    <div
      key={product.id}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 line-clamp-2">{product.title}</h3>
        
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviewCount || 0})</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          {product.originalPrice && (
            <span className="text-sm text-green-600 font-medium">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          {product.prime && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              Prime
            </span>
          )}
          {product.freeShipping && (
            <span className="text-green-600">Free shipping</span>
          )}
          {!product.inStock && (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search with AI-powered suggestions..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.type === 'popular' ? 'bg-red-100 text-red-800' :
                          suggestion.type === 'history' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {suggestion.type === 'popular' ? 'Popular' :
                           suggestion.type === 'history' ? 'History' : 'Product'}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: suggestion.highlight }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleSearch()}
                disabled={!query.trim() || isLoading}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5" />
                )}
                <span>Search</span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex items-center space-x-4">
              {searchPerformed && (
                <button
                  onClick={handleSaveSearch}
                  className="flex items-center space-x-2 text-sm text-orange-600 hover:text-orange-700"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  <span>Save Search</span>
                </button>
              )}
              
              {searchHistory.length > 0 && (
                <button
                  onClick={clearSearchHistory}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {renderFilters()}

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Searches</h3>
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setQuery(search.query);
                          updateFilters(search.filters);
                          handleSearch(search.query);
                        }}
                        className="flex-1 text-left text-sm text-gray-700 hover:text-orange-600"
                      >
                        {search.name}
                      </button>
                      <button
                        onClick={() => deleteSavedSearch(search.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Searches</h3>
              <div className="space-y-3">
                {popularSearches.slice(0, 6).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search.query)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm text-gray-700 hover:text-orange-600">
                      {search.query}
                    </span>
                    <div className="flex items-center space-x-1">
                      <ArrowTrendingUpIcon className={`h-3 w-3 ${
                        search.trend === 'up' ? 'text-green-500' :
                        search.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                      }`} />
                      <span className="text-xs text-gray-500">{search.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* AI Insights */}
            {currentAiInsights && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <SparklesIcon className="h-6 w-6 text-purple-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">AI Insights</h3>
                    <div className="space-y-2">
                      {currentAiInsights.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-sm text-purple-800">
                          💡 {suggestion}
                        </p>
                      ))}
                    </div>
                    {currentAiInsights.trends && (
                      <div className="mt-3 flex items-center space-x-4 text-xs text-purple-700">
                        {currentAiInsights.trends.priceDropExpected && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Price drop expected
                          </span>
                        )}
                        <span>Peak season: {currentAiInsights.trends.peakDemandSeason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchPerformed && (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {totalResults > 0 ? (
                        `${totalResults.toLocaleString()} results for "${query}"`
                      ) : (
                        `No results found for "${query}"`
                      )}
                    </h2>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="text-sm text-gray-600">Sort by:</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {filterOptions.sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.map(renderProductCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or filters
                    </p>
                    <button
                      onClick={resetFilters}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Default State */}
            {!searchPerformed && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Advanced Search with AI
                </h3>
                <p className="text-gray-600 mb-6">
                  Use our AI-powered search to find exactly what you're looking for
                </p>
                
                {/* Popular Searches for Quick Start */}
                <div className="max-w-md mx-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Try searching for:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularSearches.slice(0, 4).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search.query)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        {search.query}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;