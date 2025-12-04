import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';

const HomeLivingPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'kitchen', name: 'Kitchen & Dining' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'living', name: 'Living Room' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'outdoor', name: 'Outdoor & Patio' },
    { id: 'storage', name: 'Storage & Organization' },
    { id: 'decor', name: 'Home Décor' },
    { id: 'lighting', name: 'Lighting' }
  ];

  const homeLivingProducts = [
    {
      id: 'hl1',
      title: 'Ninja Foodi Personal Blender for Shakes, Smoothies, Food Prep',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.6,
      reviews: 15420,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71VvOOOvJ5L._AC_SL1500_.jpg',
      category: 'kitchen',
      badge: 'Best Seller',
      features: ['700 Watts', 'BPA Free', '18 oz Cup']
    },
    {
      id: 'hl2',
      title: 'Egyptian Cotton Sheets Set - 1000 Thread Count, Deep Pocket',
      price: 89.99,
      originalPrice: 149.99,
      rating: 4.8,
      reviews: 8930,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71B6fH4aAfL._AC_SL1500_.jpg',
      category: 'bedroom',
      badge: "Amazon's Choice",
      features: ['1000 TC', 'Deep Pocket', 'Wrinkle Free']
    },
    {
      id: 'hl3',
      title: 'Modern 3-Piece Coffee Table Set with Storage Shelves',
      price: 199.99,
      originalPrice: 299.99,
      rating: 4.5,
      reviews: 2340,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71A1XoOHJQL._AC_SL1500_.jpg',
      category: 'living',
      badge: 'Limited Deal',
      features: ['Oak Finish', 'Storage Shelves', 'Easy Assembly']
    },
    {
      id: 'hl4',
      title: 'Bamboo Shower Caddy with 4 Tiers - Rust Proof',
      price: 45.99,
      originalPrice: 65.99,
      rating: 4.7,
      reviews: 5670,
      image: 'https://images-na.ssl-images-amazon.com/images/I/61vPGQcx7UL._AC_SL1500_.jpg',
      category: 'bathroom',
      badge: 'Eco-Friendly',
      features: ['Bamboo Wood', '4 Tiers', 'Rust Proof']
    },
    {
      id: 'hl5',
      title: 'Solar String Lights Outdoor, 200 LED Fairy Lights',
      price: 29.99,
      originalPrice: 49.99,
      rating: 4.4,
      reviews: 12890,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81qQxQOJOvL._AC_SL1500_.jpg',
      category: 'outdoor',
      badge: 'Weather Proof',
      features: ['Solar Powered', '200 LEDs', 'Waterproof']
    },
    {
      id: 'hl6',
      title: 'Clear Storage Bins with Lids, Set of 6 Stackable Containers',
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.6,
      reviews: 7450,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71OmHWQJm3L._AC_SL1500_.jpg',
      category: 'storage',
      badge: 'Space Saver',
      features: ['Clear Plastic', 'Stackable', 'Secure Lids']
    },
    {
      id: 'hl7',
      title: 'Boho Macrame Wall Hanging - Handwoven Tapestry Decor',
      price: 34.99,
      originalPrice: 54.99,
      rating: 4.3,
      reviews: 3210,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71RQdJzJ6ZL._AC_SL1500_.jpg',
      category: 'decor',
      badge: 'Handmade',
      features: ['Handwoven', 'Cotton Cord', '36" x 24"']
    },
    {
      id: 'hl8',
      title: 'Smart LED Strip Lights, WiFi RGB Color Changing 16.4ft',
      price: 24.99,
      originalPrice: 39.99,
      rating: 4.5,
      reviews: 18750,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71ZqF8+uKfL._AC_SL1500_.jpg',
      category: 'lighting',
      badge: 'Smart Home',
      features: ['WiFi Control', 'RGB Colors', '16.4ft Length']
    }
  ];

  const filteredProducts = homeLivingProducts.filter(product => 
    activeCategory === 'all' || product.category === activeCategory
  );

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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Home & Living Essentials
            </h1>
            <p className="text-xl mb-8 text-green-100">
              Transform your space with our curated collection of home essentials
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🏠 Every Room</h3>
                <p className="text-green-100">From kitchen to bedroom, find everything you need</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">✨ Quality First</h3>
                <p className="text-green-100">Premium materials and craftsmanship</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🚚 Fast Delivery</h3>
                <p className="text-green-100">Get your home essentials delivered quickly</p>
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeCategory === 'all' ? 'All Home & Living Products' : 
             categories.find(c => c.id === activeCategory)?.name}
          </h2>
          <span className="text-gray-600">
            {sortedProducts.length} results
          </span>
        </div>

        {/* Room Inspiration Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🍳</span>
              </div>
              <h4 className="font-semibold text-gray-900">Kitchen</h4>
              <p className="text-sm text-gray-600">Cooking essentials</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛏️</span>
              </div>
              <h4 className="font-semibold text-gray-900">Bedroom</h4>
              <p className="text-sm text-gray-600">Comfort & style</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛋️</span>
              </div>
              <h4 className="font-semibold text-gray-900">Living Room</h4>
              <p className="text-sm text-gray-600">Relax & entertain</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚿</span>
              </div>
              <h4 className="font-semibold text-gray-900">Bathroom</h4>
              <p className="text-sm text-gray-600">Spa-like retreat</p>
            </div>
          </div>
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
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or browse all categories
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Home Styling Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-semibold mb-2">Color Coordination</h4>
              <p className="text-gray-600 text-sm">
                Choose a cohesive color palette throughout your home for a unified look
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📏</span>
              </div>
              <h4 className="font-semibold mb-2">Scale & Proportion</h4>
              <p className="text-gray-600 text-sm">
                Mix different sizes and heights to create visual interest and balance
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h4 className="font-semibold mb-2">Lighting Layers</h4>
              <p className="text-gray-600 text-sm">
                Combine ambient, task, and accent lighting for a warm, inviting atmosphere
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLivingPage;