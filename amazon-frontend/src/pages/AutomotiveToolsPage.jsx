import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';

const AutomotiveToolsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [toolType, setToolType] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'automotive', name: 'Automotive' },
    { id: 'hand-tools', name: 'Hand Tools' },
    { id: 'power-tools', name: 'Power Tools' },
    { id: 'garden', name: 'Garden & Outdoor' },
    { id: 'hardware', name: 'Hardware' },
    { id: 'safety', name: 'Safety Equipment' },
    { id: 'storage', name: 'Tool Storage' }
  ];

  const toolTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'professional', name: 'Professional Grade' },
    { id: 'diy', name: 'DIY / Home Use' },
    { id: 'heavy-duty', name: 'Heavy Duty' },
    { id: 'cordless', name: 'Cordless' }
  ];

  const automotiveToolsProducts = [
    {
      id: 'at1',
      title: 'CRAFTSMAN V20 Cordless Drill Driver Kit with Battery and Charger',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.5,
      reviews: 8920,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81VrJH8ZCQL._AC_SL1500_.jpg',
      category: 'power-tools',
      toolType: 'cordless',
      badge: 'Best Seller',
      features: ['20V Battery', '2-Speed Gearbox', 'LED Work Light']
    },
    {
      id: 'at2',
      title: 'Mobil 1 Advanced Fuel Economy Full Synthetic Motor Oil 0W-20, 5 Quart',
      price: 24.99,
      originalPrice: 29.99,
      rating: 4.8,
      reviews: 15670,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81J7H8XMJQL._AC_SL1500_.jpg',
      category: 'automotive',
      toolType: 'professional',
      badge: 'Advanced Formula',
      features: ['Full Synthetic', '10,000 Miles', 'Fuel Economy']
    },
    {
      id: 'at3',
      title: 'STANLEY 65-Piece Homeowner\'s DIY Tool Kit with Plastic Toolbox',
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.4,
      reviews: 12340,
      image: 'https://images-na.ssl-images-amazon.com/images/I/91QmF4L2mfL._AC_SL1500_.jpg',
      category: 'hand-tools',
      toolType: 'diy',
      badge: 'Complete Kit',
      features: ['65 Pieces', 'Plastic Toolbox', 'Essential Tools']
    },
    {
      id: 'at4',
      title: 'Greenworks 40V 16" Cordless Chainsaw, 4.0 AH Battery Included',
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.3,
      reviews: 6780,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71VQdBHJ5vL._AC_SL1500_.jpg',
      category: 'garden',
      toolType: 'cordless',
      badge: 'Eco-Friendly',
      features: ['40V Battery', '16" Bar', 'Tool-Free Chain']
    },
    {
      id: 'at5',
      title: 'DEWALT 20V MAX Circular Saw, 7-1/4-Inch, Tool Only (DCS570B)',
      price: 159.99,
      originalPrice: 189.99,
      rating: 4.7,
      reviews: 9340,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81XbVwKmNsL._AC_SL1500_.jpg',
      category: 'power-tools',
      toolType: 'professional',
      badge: 'Professional Grade',
      features: ['20V MAX', '7-1/4" Blade', 'Electric Brake']
    },
    {
      id: 'at6',
      title: 'Husky 42-Piece 1/4 in. and 3/8 in. Drive Socket Set',
      price: 29.99,
      originalPrice: 39.99,
      rating: 4.6,
      reviews: 7850,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81PGvV+H5tL._AC_SL1500_.jpg',
      category: 'hand-tools',
      toolType: 'professional',
      badge: 'Chrome Finish',
      features: ['42 Pieces', 'Chrome Vanadium', 'Carrying Case']
    },
    {
      id: 'at7',
      title: 'Safety Glasses with Side Shields, Anti-Fog & Anti-Scratch (12 Pack)',
      price: 19.99,
      originalPrice: 29.99,
      rating: 4.5,
      reviews: 5240,
      image: 'https://images-na.ssl-images-amazon.com/images/I/71B2QHyDOpL._AC_SL1500_.jpg',
      category: 'safety',
      toolType: 'professional',
      badge: 'ANSI Z87.1',
      features: ['Anti-Fog', 'Anti-Scratch', '12 Pack']
    },
    {
      id: 'at8',
      title: 'CRAFTSMAN 3 Drawer Portable Tool Box, 26 inch Wide',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.4,
      reviews: 4920,
      image: 'https://images-na.ssl-images-amazon.com/images/I/81hF+LnTEeL._AC_SL1500_.jpg',
      category: 'storage',
      toolType: 'heavy-duty',
      badge: 'Ball-Bearing Slides',
      features: ['3 Drawers', '26" Wide', 'Ball-Bearing Slides']
    }
  ];

  const filteredProducts = automotiveToolsProducts.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesToolType = toolType === 'all' || product.toolType === toolType;
    return matchesCategory && matchesToolType;
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
      <div className="bg-gradient-to-r from-gray-800 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Automotive & Tools
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Professional-grade tools and automotive supplies for every job
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🔧 Hand Tools</h3>
                <p className="text-gray-100 text-sm">Quality hand tools for precision work</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">⚡ Power Tools</h3>
                <p className="text-gray-100 text-sm">Cordless and electric power tools</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🚗 Automotive</h3>
                <p className="text-gray-100 text-sm">Car care and maintenance supplies</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">🛡️ Safety</h3>
                <p className="text-gray-100 text-sm">Professional safety equipment</p>
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
                      ? 'bg-red-500 text-white'
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
                value={toolType}
                onChange={(e) => setToolType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {toolTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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

      {/* Results and Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeCategory === 'all' ? 'All Automotive & Tools' : 
             categories.find(c => c.id === activeCategory)?.name}
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
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or browse all categories
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setToolType('all');
              }}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomotiveToolsPage;