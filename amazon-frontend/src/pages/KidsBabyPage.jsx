import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';

const KidsBabyPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [ageGroup, setAgeGroup] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'toys', name: 'Toys & Games' },
    { id: 'clothing', name: 'Kids Clothing' },
    { id: 'baby-care', name: 'Baby Care' },
    { id: 'feeding', name: 'Feeding' },
    { id: 'nursery', name: 'Nursery' },
    { id: 'strollers', name: 'Strollers & Car Seats' },
    { id: 'books', name: 'Books & Learning' },
    { id: 'outdoor', name: 'Outdoor Play' }
  ];

  const ageGroups = [
    { id: 'all', name: 'All Ages' },
    { id: 'newborn', name: 'Newborn (0-3 months)' },
    { id: 'infant', name: 'Infant (3-12 months)' },
    { id: 'toddler', name: 'Toddler (1-3 years)' },
    { id: 'preschool', name: 'Preschool (3-5 years)' },
    { id: 'school', name: 'School Age (5+ years)' }
  ];

  const kidsBabyProducts = [
    {
      id: 'kb1',
      title: 'LEGO Classic Creative Bricks Building Set - 10696',
      price: 49.99,
      originalPrice: 59.99,
      rating: 4.8,
      reviews: 12450,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81xOBH3h5vL._AC_SL1500_.jpg',
      category: 'toys',
      ageGroup: 'school',
      badge: 'Best Seller',
      features: ['484 Pieces', 'Ages 4-99', 'Creative Building']
    },
    {
      id: 'kb2',
      title: 'Carter\'s Baby Boys\' 3-Pack Short-Sleeve Bodysuits',
      price: 14.99,
      originalPrice: 19.99,
      rating: 4.7,
      reviews: 8920,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81XbVwKmNsL._AC_SL1500_.jpg',
      category: 'clothing',
      ageGroup: 'infant',
      badge: 'Organic Cotton',
      features: ['100% Cotton', '3-Pack', 'Machine Washable']
    },
    {
      id: 'kb3',
      title: 'Pampers Baby Dry Overnight Diapers - Size 3 (164 Count)',
      price: 47.99,
      originalPrice: 54.99,
      rating: 4.6,
      reviews: 23400,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81PGvV+H5tL._AC_SL1500_.jpg',
      category: 'baby-care',
      ageGroup: 'infant',
      badge: '12-Hour Protection',
      features: ['12hr Protection', 'Size 3', '164 Count']
    },
    {
      id: 'kb4',
      title: 'Dr. Brown\'s Natural Flow Anti-Colic Baby Bottle Set',
      price: 39.99,
      originalPrice: 49.99,
      rating: 4.5,
      reviews: 15670,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71B2QHyDOpL._AC_SL1500_.jpg',
      category: 'feeding',
      ageGroup: 'newborn',
      badge: 'Anti-Colic',
      features: ['Anti-Colic Vent', 'BPA Free', '8oz Bottles']
    },
    {
      id: 'kb5',
      title: 'Graco Pack \'n Play On the Go Playard - Stratus',
      price: 89.99,
      originalPrice: 119.99,
      rating: 4.4,
      reviews: 6780,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71v8QBGmzRL._AC_SL1500_.jpg',
      category: 'nursery',
      ageGroup: 'infant',
      badge: 'Portable',
      features: ['Compact Fold', 'Automatic Legs', 'Carry Bag']
    },
    {
      id: 'kb6',
      title: 'Baby Trend Expedition Jogger Stroller - Millennium',
      price: 109.99,
      originalPrice: 139.99,
      rating: 4.3,
      reviews: 4920,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71yQWqV6Q3L._AC_SL1500_.jpg',
      category: 'strollers',
      ageGroup: 'infant',
      badge: 'All-Terrain',
      features: ['Pneumatic Tires', '50lb Capacity', 'Parent Tray']
    },
    {
      id: 'kb7',
      title: 'VTech Touch and Learn Activity Desk Deluxe',
      price: 74.99,
      originalPrice: 94.99,
      rating: 4.6,
      reviews: 9340,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81hF+LnTEeL._AC_SL1500_.jpg',
      category: 'books',
      ageGroup: 'toddler',
      badge: 'Educational',
      features: ['Interactive Desk', '5 Pages', '160+ Vocabulary']
    },
    {
      id: 'kb8',
      title: 'Little Tikes First Slide - Red/Blue Toddler Slide',
      price: 59.99,
      originalPrice: 79.99,
      rating: 4.7,
      reviews: 7850,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71QwRZMF3kL._AC_SL1500_.jpg',
      category: 'outdoor',
      ageGroup: 'toddler',
      badge: 'Weather Resistant',
      features: ['Easy Climb Steps', 'Sturdy Handrails', 'Ages 18m-4y']
    }
  ];

  const filteredProducts = kidsBabyProducts.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesAgeGroup = ageGroup === 'all' || product.ageGroup === ageGroup;
    return matchesCategory && matchesAgeGroup;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kids & Baby
            </h1>
            <p className="text-xl mb-8 text-pink-100">
              Everything your little ones need to grow, learn, and play
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🧸 Toys</h3>
                <p className="text-pink-100 text-sm">Educational and fun toys for all ages</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">👶 Baby Care</h3>
                <p className="text-pink-100 text-sm">Essential items for your baby's comfort</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">👕 Clothing</h3>
                <p className="text-pink-100 text-sm">Comfortable and stylish kids' wear</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">📚 Learning</h3>
                <p className="text-pink-100 text-sm">Books and educational materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and Filters */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Secondary Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {ageGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Age Groups Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Shop by Age & Development Stage
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">👶</span>
              </div>
              <h4 className="font-semibold text-sm">0-3 Months</h4>
              <p className="text-xs text-gray-600">Newborn</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🍼</span>
              </div>
              <h4 className="font-semibold text-sm">3-12 Months</h4>
              <p className="text-xs text-gray-600">Infant</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🚼</span>
              </div>
              <h4 className="font-semibold text-sm">1-3 Years</h4>
              <p className="text-xs text-gray-600">Toddler</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-semibold text-sm">3-5 Years</h4>
              <p className="text-xs text-gray-600">Preschool</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📚</span>
              </div>
              <h4 className="font-semibold text-sm">5+ Years</h4>
              <p className="text-xs text-gray-600">School Age</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h4 className="font-semibold text-sm">All Ages</h4>
              <p className="text-xs text-gray-600">Family</p>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeCategory === 'all' ? 'All Kids & Baby Products' : 
             categories.find(c => c.id === activeCategory)?.name}
            {ageGroup !== 'all' && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                • {ageGroups.find(g => g.id === ageGroup)?.name}
              </span>
            )}
          </h2>
          <span className="text-gray-600">
            {sortedProducts.length} results
          </span>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showAddToCart={true}
              showQuickView={true}
            />
          ))}
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👶</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or browse all categories
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setAgeGroup('all');
              }}
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Parenting Tips Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Parenting Tips & Safety
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="font-semibold mb-2">Safety First</h4>
              <p className="text-gray-600 text-sm">
                Always check age recommendations and safety certifications on toys and products
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold mb-2">Age-Appropriate</h4>
              <p className="text-gray-600 text-sm">
                Choose toys and activities that match your child's developmental stage
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h4 className="font-semibold mb-2">Quality Time</h4>
              <p className="text-gray-600 text-sm">
                The best toy is engaged, attentive parents who play and read with their children
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidsBabyPage;