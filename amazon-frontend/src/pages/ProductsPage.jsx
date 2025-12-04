import React, { useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { useProducts } from '../context/ProductContext';

const ProductsPage = () => {
  const { 
    products, 
    filteredProducts, 
    searchQuery, 
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPriceRange,
    setSelectedPriceRange,
    selectedRating,
    setSelectedRating,
    sortBy,
    setSortBy
  } = useProducts();
  
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = [
    'All',
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Books',
    'Sports',
    'Toys'
  ];
  
  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,000 - ₹5,000', value: '1000-5000' },
    { label: '₹5,000 - ₹10,000', value: '5000-10000' },
    { label: '₹10,000 - ₹25,000', value: '10000-25000' },
    { label: 'Over ₹25,000', value: '25000+' }
  ];
  
  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Customer Reviews', value: 'rating' },
    { label: 'Newest Arrivals', value: 'newest' }
  ];
  
  const ratings = [4, 3, 2, 1];
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header with search and filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Results Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} results
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </p>
            </div>
            
            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-amazon-blue text-white px-4 py-2 rounded-md hover:bg-amazon-blue-light transition-colors"
              >
                <i className="fas fa-filter mr-2"></i>
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-amazon-orange focus:ring-amazon-orange"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range.value}
                        checked={selectedPriceRange === range.value}
                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                        className="text-amazon-orange focus:ring-amazon-orange"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value="all"
                      checked={selectedRating === 'all'}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="text-amazon-orange focus:ring-amazon-orange"
                    />
                    <span className="text-sm text-gray-700">All Ratings</span>
                  </label>
                  {ratings.map((rating) => (
                    <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating.toString()}
                        checked={selectedRating === rating.toString()}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="text-amazon-orange focus:ring-amazon-orange"
                      />
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-sm ${
                                i < rating ? 'text-amazon-yellow' : 'text-gray-300'
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-sm text-gray-700">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedPriceRange('all');
                  setSelectedRating('all');
                  setSortBy('featured');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <i className="fas fa-search text-6xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedPriceRange('all');
                    setSelectedRating('all');
                  }}
                  className="bg-amazon-orange hover:bg-amazon-orange-dark text-white py-2 px-6 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Load More Button */}
      {filteredProducts.length > 0 && (
        <div className="text-center py-8">
          <button className="bg-amazon-blue hover:bg-amazon-blue-light text-white py-3 px-8 rounded-md transition-colors">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;