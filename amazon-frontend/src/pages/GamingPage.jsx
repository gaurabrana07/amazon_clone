import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { useProducts } from '../context/ProductContext';
import { IMAGE_CONFIG } from '../config/imageConfig';

const GamingPage = () => {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Gaming-specific products (we'll filter from existing or add gaming-specific data)
  const gamingProducts = [
    {
      id: 'g1',
      name: 'PlayStation 5 Console',
      brand: 'Sony',
      price: 49999,
      originalPrice: 54999,
      rating: 4.8,
      reviews: 2847,
      image: IMAGE_CONFIG.PRODUCTS.console,
      category: 'Gaming Console',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      isBestseller: true,
      isChoice: true,
      description: 'Experience lightning-fast loading with an ultra-high speed SSD'
    },
    {
      id: 'g2',
      name: 'Xbox Series X Console',
      brand: 'Microsoft',
      price: 47999,
      originalPrice: 52999,
      rating: 4.7,
      reviews: 1892,
      image: 'IMAGE_CONFIG.PRODUCTS.console',
      category: 'Gaming Console',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      isBestseller: true,
      description: 'Most powerful Xbox ever with 12 teraflops of processing power'
    },
    {
      id: 'g3',
      name: 'Gaming Mechanical Keyboard RGB',
      brand: 'Razer',
      price: 8999,
      originalPrice: 12999,
      rating: 4.6,
      reviews: 3421,
      image: 'IMAGE_CONFIG.PRODUCTS.console',
      category: 'Gaming Accessories',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: 'Mechanical switches with customizable RGB lighting'
    },
    {
      id: 'g4',
      name: 'Wireless Gaming Mouse',
      brand: 'Logitech',
      price: 5499,
      originalPrice: 7999,
      rating: 4.5,
      reviews: 2156,
      image: 'IMAGE_CONFIG.PRODUCTS.console',
      category: 'Gaming Accessories',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: 'High precision wireless gaming mouse with 25,600 DPI'
    },
    {
      id: 'g5',
      name: 'Gaming Headset 7.1 Surround',
      brand: 'SteelSeries',
      price: 12999,
      originalPrice: 16999,
      rating: 4.7,
      reviews: 1876,
      image: 'IMAGE_CONFIG.PRODUCTS.console',
      category: 'Gaming Accessories',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: 'Premium gaming headset with 7.1 surround sound'
    },
    {
      id: 'g6',
      name: 'Gaming Chair Ergonomic',
      brand: 'DXRacer',
      price: 24999,
      originalPrice: 32999,
      rating: 4.4,
      reviews: 987,
      image: 'IMAGE_CONFIG.PRODUCTS.console',
      category: 'Gaming Furniture',
      inStock: true,
      freeShipping: true,
      primeEligible: false,
      description: 'Ergonomic gaming chair with lumbar support'
    },
    {
      id: 'g7',
      name: '27" Gaming Monitor 144Hz',
      brand: 'ASUS',
      price: 32999,
      originalPrice: 39999,
      rating: 4.6,
      reviews: 1456,
      image: 'IMAGE_CONFIG.PRODUCTS.console',
      category: 'Gaming Monitor',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      description: '27-inch QHD gaming monitor with 144Hz refresh rate'
    },
    {
      id: 'g8',
      name: 'Graphics Card RTX 4070',
      brand: 'NVIDIA',
      price: 89999,
      originalPrice: 99999,
      rating: 4.8,
      reviews: 743,
      image: 'IMAGE_CONFIG.PRODUCTS.console',
      category: 'PC Components',
      inStock: false,
      freeShipping: true,
      primeEligible: true,
      isBestseller: true,
      description: 'High-performance graphics card for 4K gaming'
    }
  ];
  
  const categories = [
    { id: 'all', name: 'All Gaming', count: gamingProducts.length },
    { id: 'console', name: 'Consoles', count: gamingProducts.filter(p => p.category === 'Gaming Console').length },
    { id: 'accessories', name: 'Accessories', count: gamingProducts.filter(p => p.category === 'Gaming Accessories').length },
    { id: 'pc', name: 'PC Gaming', count: gamingProducts.filter(p => p.category === 'PC Components').length },
    { id: 'furniture', name: 'Gaming Furniture', count: gamingProducts.filter(p => p.category === 'Gaming Furniture').length }
  ];
  
  const getFilteredProducts = () => {
    if (activeTab === 'all') return gamingProducts;
    
    const categoryMap = {
      'console': 'Gaming Console',
      'accessories': 'Gaming Accessories',
      'pc': 'PC Components',
      'furniture': 'Gaming Furniture'
    };
    
    return gamingProducts.filter(product => product.category === categoryMap[activeTab]);
  };
  
  const filteredProducts = getFilteredProducts();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Level Up Your <span className="text-amazon-yellow">Gaming</span>
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Discover the latest gaming gear, consoles, and accessories. From professional esports equipment to casual gaming setups.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black px-8 py-3 rounded-lg font-semibold transition-colors">
                  Shop Consoles
                </button>
                <button className="border-2 border-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-colors">
                  PC Gaming
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <img 
                  src="IMAGE_CONFIG.BANNERS.hero1" 
                  alt="Gaming Setup"
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Deals Banner */}
      <section className="bg-red-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 text-center">
            <i className="fas fa-fire text-2xl animate-pulse"></i>
            <span className="text-lg font-bold">LIMITED TIME: Up to 40% off Gaming Gear</span>
            <i className="fas fa-fire text-2xl animate-pulse"></i>
          </div>
        </div>
      </section>
      
      {/* Navigation Tabs */}
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                    activeTab === category.id
                      ? 'bg-amazon-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden bg-amazon-blue text-white px-4 py-2 rounded-lg"
            >
              <i className="fas fa-filter"></i>
            </button>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {categories.find(c => c.id === activeTab)?.name || 'All Gaming'}
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length} products available
          </p>
        </div>
        
        {/* Featured Categories Grid */}
        {activeTab === 'all' && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  name: 'Gaming Consoles', 
                  image: 'IMAGE_CONFIG.PRODUCTS.game', 
                  category: 'console',
                  color: 'from-blue-500 to-purple-600'
                },
                { 
                  name: 'PC Gaming', 
                  image: 'IMAGE_CONFIG.PRODUCTS.game', 
                  category: 'pc',
                  color: 'from-green-500 to-teal-600'
                },
                { 
                  name: 'Gaming Accessories', 
                  image: 'IMAGE_CONFIG.PRODUCTS.game', 
                  category: 'accessories',
                  color: 'from-orange-500 to-red-600'
                },
                { 
                  name: 'Gaming Setup', 
                  image: 'IMAGE_CONFIG.PRODUCTS.game', 
                  category: 'furniture',
                  color: 'from-purple-500 to-pink-600'
                }
              ].map((cat, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveTab(cat.category)}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80`}></div>
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h4 className="text-white text-xl font-bold text-center">{cat.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Products Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-gamepad text-6xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try selecting a different category</p>
            </div>
          )}
        </section>
        
        {/* Gaming Guides Section */}
        <section className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Gaming Guides & Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Best Gaming Setup 2025',
                description: 'Complete guide to building the ultimate gaming setup',
                image: 'IMAGE_CONFIG.PRODUCTS.game',
                readTime: '5 min read'
              },
              {
                title: 'Console vs PC Gaming',
                description: 'Which platform is right for you? Complete comparison',
                image: 'IMAGE_CONFIG.PRODUCTS.game',
                readTime: '8 min read'
              },
              {
                title: 'Gaming Accessories Guide',
                description: 'Essential accessories every gamer needs in 2025',
                image: 'IMAGE_CONFIG.PRODUCTS.game',
                readTime: '6 min read'
              }
            ].map((guide, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="overflow-hidden rounded-lg mb-4">
                  <img 
                    src={guide.image} 
                    alt={guide.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amazon-orange transition-colors">
                  {guide.title}
                </h4>
                <p className="text-gray-600 mb-2">{guide.description}</p>
                <span className="text-sm text-amazon-blue">{guide.readTime}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Stay Updated with Gaming Deals</h3>
          <p className="text-xl mb-8">Get notified about new products, exclusive deals, and gaming news</p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-amazon-yellow"
            />
            <button className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black px-6 py-3 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GamingPage;
