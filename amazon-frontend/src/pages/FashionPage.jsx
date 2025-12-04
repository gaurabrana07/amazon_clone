import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';

const FashionPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGender, setActiveGender] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const fashionProducts = [
    {
      id: 'f1',
      name: 'Cotton Casual Shirt for Men',
      brand: 'Levi\'s',
      price: 2499,
      originalPrice: 3499,
      rating: 4.3,
      reviews: 1247,
      image: '/api/placeholder/400/500',
      category: 'Shirts',
      gender: 'Men',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Blue', 'White', 'Black'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: 'Premium cotton casual shirt with modern fit'
    },
    {
      id: 'f2',
      name: 'Women\'s Summer Dress',
      brand: 'Zara',
      price: 3999,
      originalPrice: 5999,
      rating: 4.6,
      reviews: 892,
      image: '/api/placeholder/400/500',
      category: 'Dresses',
      gender: 'Women',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Floral', 'Red', 'Navy'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      isBestseller: true,
      description: 'Elegant summer dress perfect for any occasion'
    },
    {
      id: 'f3',
      name: 'Men\'s Denim Jeans',
      brand: 'Wrangler',
      price: 1899,
      originalPrice: 2899,
      rating: 4.4,
      reviews: 2156,
      image: '/api/placeholder/400/500',
      category: 'Jeans',
      gender: 'Men',
      sizes: ['30', '32', '34', '36'],
      colors: ['Blue', 'Black', 'Gray'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: 'Classic fit denim jeans with premium quality'
    },
    {
      id: 'f4',
      name: 'Women\'s Handbag',
      brand: 'Michael Kors',
      price: 8999,
      originalPrice: 12999,
      rating: 4.7,
      reviews: 634,
      image: '/api/placeholder/400/400',
      category: 'Bags',
      gender: 'Women',
      colors: ['Black', 'Brown', 'Tan'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      isChoice: true,
      description: 'Luxury leather handbag with multiple compartments'
    },
    {
      id: 'f5',
      name: 'Running Shoes',
      brand: 'Nike',
      price: 6999,
      originalPrice: 8999,
      rating: 4.5,
      reviews: 1876,
      image: '/api/placeholder/400/400',
      category: 'Shoes',
      gender: 'Unisex',
      sizes: ['6', '7', '8', '9', '10', '11'],
      colors: ['White', 'Black', 'Gray', 'Blue'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      isBestseller: true,
      description: 'Premium running shoes with advanced cushioning'
    },
    {
      id: 'f6',
      name: 'Women\'s Ethnic Kurti',
      brand: 'Fabindia',
      price: 1499,
      originalPrice: 2299,
      rating: 4.2,
      reviews: 543,
      image: '/api/placeholder/400/500',
      category: 'Ethnic Wear',
      gender: 'Women',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Pink', 'Blue', 'Green', 'Yellow'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: 'Traditional cotton kurti with modern design'
    },
    {
      id: 'f7',
      name: 'Men\'s Formal Blazer',
      brand: 'Raymond',
      price: 4999,
      originalPrice: 7999,
      rating: 4.4,
      reviews: 321,
      image: '/api/placeholder/400/500',
      category: 'Blazers',
      gender: 'Men',
      sizes: ['38', '40', '42', '44'],
      colors: ['Navy', 'Black', 'Gray'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: 'Premium formal blazer for professional occasions'
    },
    {
      id: 'f8',
      name: 'Women\'s Yoga Leggings',
      brand: 'Lululemon',
      price: 3499,
      originalPrice: 4999,
      rating: 4.8,
      reviews: 1243,
      image: '/api/placeholder/400/500',
      category: 'Activewear',
      gender: 'Women',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Black', 'Gray', 'Navy', 'Maroon'],
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      isChoice: true,
      description: 'High-performance yoga leggings with moisture-wicking fabric'
    }
  ];
  
  const categories = [
    { id: 'all', name: 'All Fashion', icon: 'fas fa-star' },
    { id: 'Shirts', name: 'Shirts', icon: 'fas fa-tshirt' },
    { id: 'Dresses', name: 'Dresses', icon: 'fas fa-female' },
    { id: 'Jeans', name: 'Jeans', icon: 'fas fa-male' },
    { id: 'Shoes', name: 'Shoes', icon: 'fas fa-shoe-prints' },
    { id: 'Bags', name: 'Bags', icon: 'fas fa-shopping-bag' },
    { id: 'Ethnic Wear', name: 'Ethnic', icon: 'fas fa-star-of-david' },
    { id: 'Activewear', name: 'Activewear', icon: 'fas fa-running' }
  ];
  
  const genderOptions = [
    { id: 'all', name: 'All' },
    { id: 'Men', name: 'Men' },
    { id: 'Women', name: 'Women' },
    { id: 'Unisex', name: 'Unisex' }
  ];
  
  const getFilteredProducts = () => {
    let filtered = fashionProducts;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    if (activeGender !== 'all') {
      filtered = filtered.filter(product => product.gender === activeGender || product.gender === 'Unisex');
    }
    
    return filtered;
  };
  
  const filteredProducts = getFilteredProducts();
  
  const trendingCategories = [
    {
      name: 'Summer Collection',
      image: '/api/placeholder/300/400',
      discount: '40% OFF',
      bgColor: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'Ethnic Wear',
      image: '/api/placeholder/300/400',
      discount: '30% OFF',
      bgColor: 'from-pink-400 to-purple-500'
    },
    {
      name: 'Athleisure',
      image: '/api/placeholder/300/400',
      discount: '25% OFF',
      bgColor: 'from-blue-400 to-teal-500'
    },
    {
      name: 'Formal Wear',
      image: '/api/placeholder/300/400',
      discount: '35% OFF',
      bgColor: 'from-gray-600 to-gray-800'
    }
  ];
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Fashion <span className="text-amazon-yellow">Forward</span>
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                Discover the latest trends in fashion. From casual wear to formal attire, find your perfect style.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  Shop Women
                </button>
                <button className="border-2 border-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                  Shop Men
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="/api/placeholder/250/350" 
                  alt="Fashion Model 1"
                  className="rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300"
                />
                <img 
                  src="/api/placeholder/250/350" 
                  alt="Fashion Model 2"
                  className="rounded-lg shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trending Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCategories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${category.bgColor} p-6 text-white transform group-hover:scale-105 transition-all duration-300`}>
                  <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold">
                    {category.discount}
                  </div>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-sm opacity-90">Explore Collection</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Filters and Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Gender Filter */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">Shop for:</span>
              <div className="flex space-x-2">
                {genderOptions.map((gender) => (
                  <button
                    key={gender.id}
                    onClick={() => setActiveGender(gender.id)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      activeGender === gender.id
                        ? 'bg-amazon-orange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {gender.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-amazon-blue text-white px-4 py-2 rounded-lg"
            >
              <i className="fas fa-filter mr-2"></i>
              Filters
            </button>
          </div>
          
          {/* Category Filters */}
          <div className={`mt-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`p-4 rounded-lg text-center transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-amazon-orange text-white transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:transform hover:scale-105'
                  }`}
                >
                  <i className={`${category.icon} text-2xl mb-2 block`}></i>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeCategory === 'all' ? 'All Fashion' : activeCategory} 
            {activeGender !== 'all' && ` for ${activeGender}`}
          </h2>
          <p className="text-gray-600">{filteredProducts.length} products</p>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Quick Action Buttons */}
                  <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                      <i className="far fa-heart text-gray-700"></i>
                    </button>
                    <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                      <i className="fas fa-eye text-gray-700"></i>
                    </button>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 space-y-2">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                    {product.isBestseller && (
                      <div className="bg-amazon-orange text-white px-2 py-1 rounded text-sm font-bold">
                        Bestseller
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star text-sm ${
                            i < Math.floor(product.rating) ? 'text-amazon-yellow' : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews})</span>
                  </div>
                  
                  {/* Sizes */}
                  {product.sizes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Sizes:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.slice(0, 4).map((size, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {size}
                          </span>
                        ))}
                        {product.sizes.length > 4 && (
                          <span className="text-xs text-gray-500">+{product.sizes.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button className="w-full bg-amazon-yellow hover:bg-amazon-yellow-dark text-black py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-tshirt text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
      
      {/* Style Guide Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Style Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Office Wear Essentials',
                description: 'Professional looks that make an impression',
                image: '/api/placeholder/400/300',
                category: 'Formal'
              },
              {
                title: 'Weekend Casual',
                description: 'Comfortable styles for your downtime',
                image: '/api/placeholder/400/300',
                category: 'Casual'
              },
              {
                title: 'Special Occasions',
                description: 'Elegant outfits for memorable moments',
                image: '/api/placeholder/400/300',
                category: 'Formal'
              }
            ].map((guide, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={guide.image} 
                    alt={guide.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amazon-orange transition-colors">
                    {guide.title}
                  </h4>
                  <p className="text-gray-600">{guide.description}</p>
                  <span className="text-amazon-blue text-sm font-medium">Read More →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FashionPage;