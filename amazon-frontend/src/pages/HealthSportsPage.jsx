import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';

const HealthSportsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [fitnessLevel, setFitnessLevel] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'fitness', name: 'Fitness Equipment' },
    { id: 'supplements', name: 'Supplements' },
    { id: 'outdoor', name: 'Outdoor Sports' },
    { id: 'wellness', name: 'Health & Wellness' },
    { id: 'apparel', name: 'Sports Apparel' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'nutrition', name: 'Sports Nutrition' },
    { id: 'recovery', name: 'Recovery & Therapy' }
  ];

  const fitnessLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'professional', name: 'Professional' }
  ];

  const healthSportsProducts = [
    {
      id: 'hs1',
      title: 'Adjustable Dumbbells Set - 5-50lbs Per Dumbbell',
      price: 299.99,
      originalPrice: 399.99,
      rating: 4.7,
      reviews: 8920,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71qV7Eb4FwL._AC_SL1500_.jpg',
      category: 'fitness',
      fitnessLevel: 'intermediate',
      badge: 'Best Seller',
      features: ['5-50lbs Range', 'Space Saving', 'Quick Adjust']
    },
    {
      id: 'hs2',
      title: 'Optimum Nutrition Gold Standard 100% Whey Protein Powder',
      price: 57.99,
      originalPrice: 69.99,
      rating: 4.8,
      reviews: 45230,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81OXOBDrTYL._AC_SL1500_.jpg',
      category: 'supplements',
      fitnessLevel: 'all',
      badge: "#1 Selling",
      features: ['24g Protein', '11g EAAs', '5.5g BCAAs']
    },
    {
      id: 'hs3',
      title: 'Professional Yoga Mat - Extra Thick 15mm with Carrying Strap',
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.6,
      reviews: 12450,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71B1Xm8zJuL._AC_SL1500_.jpg',
      category: 'fitness',
      fitnessLevel: 'beginner',
      badge: 'Eco-Friendly',
      features: ['15mm Thick', 'Non-Slip', 'Free Strap']
    },
    {
      id: 'hs4',
      title: 'Garmin Forerunner 245 GPS Running Smartwatch',
      price: 299.99,
      originalPrice: 349.99,
      rating: 4.5,
      reviews: 6780,
      image: 'https://images-na.ssl-images-amazon.com/images/I/61lO4F7LzNL._AC_SL1500_.jpg',
      category: 'accessories',
      fitnessLevel: 'intermediate',
      badge: 'GPS Enabled',
      features: ['GPS Tracking', '6-Day Battery', 'Heart Rate']
    },
    {
      id: 'hs5',
      title: 'Resistance Bands Set - 11 Piece Premium Exercise Bands',
      price: 29.99,
      originalPrice: 49.99,
      rating: 4.4,
      reviews: 18920,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81XBmJh5OjL._AC_SL1500_.jpg',
      category: 'fitness',
      fitnessLevel: 'all',
      badge: 'Complete Set',
      features: ['11 Pieces', '150lbs Resistance', 'Door Anchor']
    },
    {
      id: 'hs6',
      title: 'Under Armour Men\'s Tech 2.0 Short Sleeve T-Shirt',
      price: 24.99,
      originalPrice: 34.99,
      rating: 4.7,
      reviews: 23450,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71OTqCBLKjL._AC_SL1500_.jpg',
      category: 'apparel',
      fitnessLevel: 'all',
      badge: 'Moisture Wicking',
      features: ['HeatGear Tech', 'Loose Fit', 'Anti-Odor']
    },
    {
      id: 'hs7',
      title: 'Foam Roller for Deep Tissue Massage - High Density',
      price: 34.99,
      originalPrice: 49.99,
      rating: 4.6,
      reviews: 9340,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71KvhJj2OfL._AC_SL1500_.jpg',
      category: 'recovery',
      fitnessLevel: 'intermediate',
      badge: 'Therapy Grade',
      features: ['High Density', '18" Length', 'Trigger Points']
    },
    {
      id: 'hs8',
      title: 'Hydro Flask Water Bottle - Stainless Steel & Vacuum Insulated',
      price: 44.99,
      originalPrice: 54.99,
      rating: 4.8,
      reviews: 34560,
      image: 'https://images-na.ssl-images-amazon.com/images/I/61VKOHNkI8L._AC_SL1500_.jpg',
      category: 'accessories',
      fitnessLevel: 'all',
      badge: 'Insulated',
      features: ['24oz Capacity', '24hr Cold', '12hr Hot']
    }
  ];

  const filteredProducts = healthSportsProducts.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesFitnessLevel = fitnessLevel === 'all' || product.fitnessLevel === fitnessLevel;
    return matchesCategory && matchesFitnessLevel;
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Health & Sports
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Fuel your fitness journey with premium equipment and nutrition
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">💪 Fitness</h3>
                <p className="text-blue-100 text-sm">Premium equipment for every workout</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🥗 Nutrition</h3>
                <p className="text-blue-100 text-sm">Supplements and sports nutrition</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🏃 Performance</h3>
                <p className="text-blue-100 text-sm">Track and improve your progress</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🧘 Wellness</h3>
                <p className="text-blue-100 text-sm">Recovery and mindfulness</p>
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
                      ? 'bg-blue-500 text-white'
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
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fitnessLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Fitness Goals Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Find Products by Your Fitness Goals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💪</span>
              </div>
              <h4 className="font-semibold text-sm">Strength Training</h4>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🏃</span>
              </div>
              <h4 className="font-semibold text-sm">Cardio & Running</h4>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🧘</span>
              </div>
              <h4 className="font-semibold text-sm">Yoga & Flexibility</h4>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⚖️</span>
              </div>
              <h4 className="font-semibold text-sm">Weight Loss</h4>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🏋️</span>
              </div>
              <h4 className="font-semibold text-sm">Muscle Building</h4>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeCategory === 'all' ? 'All Health & Sports Products' : 
             categories.find(c => c.id === activeCategory)?.name}
            {fitnessLevel !== 'all' && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                • {fitnessLevels.find(l => l.id === fitnessLevel)?.name}
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
            <div className="text-6xl mb-4">🏃‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or browse all categories
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setFitnessLevel('all');
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Health Tips Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Health & Fitness Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h4 className="font-semibold mb-2">Consistency is Key</h4>
              <p className="text-gray-600 text-sm">
                Regular, moderate exercise is more effective than sporadic intense workouts
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🥗</span>
              </div>
              <h4 className="font-semibold mb-2">Fuel Your Body</h4>
              <p className="text-gray-600 text-sm">
                Proper nutrition supports your fitness goals and recovery process
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😴</span>
              </div>
              <h4 className="font-semibold mb-2">Rest & Recovery</h4>
              <p className="text-gray-600 text-sm">
                Quality sleep and rest days are essential for muscle growth and performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthSportsPage;