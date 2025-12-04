import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { useProducts } from '../context/ProductContext';

const DealsPage = () => {
  const { products } = useProducts();
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15
  });
  const [activeTab, setActiveTab] = useState('lightning');
  
  // Timer effect for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const dealProducts = [
    {
      id: 'd1',
      name: 'Wireless Bluetooth Headphones',
      brand: 'Sony',
      price: 3999,
      originalPrice: 7999,
      rating: 4.5,
      reviews: 1847,
      image: '/api/placeholder/400/400',
      category: 'Electronics',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      dealType: 'lightning',
      dealEndTime: '2024-12-16T18:00:00',
      quantityLeft: 23,
      description: 'Premium wireless headphones with noise cancellation'
    },
    {
      id: 'd2',
      name: 'Smart Fitness Watch',
      brand: 'Apple',
      price: 24999,
      originalPrice: 29999,
      rating: 4.7,
      reviews: 892,
      image: '/api/placeholder/400/400',
      category: 'Electronics',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      dealType: 'daily',
      quantityLeft: 156,
      description: 'Advanced fitness tracking with heart rate monitor'
    },
    {
      id: 'd3',
      name: 'Instant Pot Electric Pressure Cooker',
      brand: 'Instant Pot',
      price: 6999,
      originalPrice: 12999,
      rating: 4.6,
      reviews: 2341,
      image: '/api/placeholder/400/400',
      category: 'Home & Kitchen',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      dealType: 'lightning',
      dealEndTime: '2024-12-16T18:00:00',
      quantityLeft: 8,
      description: '7-in-1 electric pressure cooker for quick meals'
    },
    {
      id: 'd4',
      name: 'Running Shoes for Men',
      brand: 'Adidas',
      price: 4999,
      originalPrice: 8999,
      rating: 4.4,
      reviews: 1234,
      image: '/api/placeholder/400/400',
      category: 'Fashion',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      dealType: 'weekly',
      quantityLeft: 89,
      description: 'Comfortable running shoes with superior cushioning'
    },
    {
      id: 'd5',
      name: '4K LED Smart TV 55 inch',
      brand: 'Samsung',
      price: 45999,
      originalPrice: 69999,
      rating: 4.8,
      reviews: 634,
      image: '/api/placeholder/400/400',
      category: 'Electronics',
      inStock: true,
      freeShipping: true,
      primeEligible: false,
      dealType: 'lightning',
      dealEndTime: '2024-12-16T18:00:00',
      quantityLeft: 3,
      description: 'Crystal clear 4K display with smart features'
    },
    {
      id: 'd6',
      name: 'Coffee Maker Machine',
      brand: 'Nespresso',
      price: 8999,
      originalPrice: 14999,
      rating: 4.3,
      reviews: 756,
      image: '/api/placeholder/400/400',
      category: 'Home & Kitchen',
      inStock: true,
      freeShipping: true,
      primeEligible: true,
      dealType: 'daily',
      quantityLeft: 45,
      description: 'Premium coffee maker with multiple brewing options'
    }
  ];
  
  const dealTabs = [
    { id: 'lightning', name: 'Lightning Deals', icon: 'fas fa-bolt', color: 'text-yellow-500' },
    { id: 'daily', name: 'Deal of the Day', icon: 'fas fa-sun', color: 'text-orange-500' },
    { id: 'weekly', name: 'Weekly Deals', icon: 'fas fa-calendar-week', color: 'text-blue-500' }
  ];
  
  const getFilteredDeals = () => {
    return dealProducts.filter(product => product.dealType === activeTab);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const calculateSavings = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };
  
  const getUrgencyColor = (quantity) => {
    if (quantity <= 5) return 'text-red-600 bg-red-100';
    if (quantity <= 20) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };
  
  const filteredDeals = getFilteredDeals();
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section with Countdown */}
      <section className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              <i className="fas fa-fire mr-4 animate-pulse"></i>
              Today's Deals
              <i className="fas fa-fire ml-4 animate-pulse"></i>
            </h1>
            <p className="text-xl mb-8">Limited time offers - Up to 70% off on selected items</p>
            
            {/* Lightning Deal Countdown */}
            <div className="bg-black bg-opacity-30 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Lightning Deals End In:</h3>
              <div className="flex justify-center space-x-4">
                <div className="bg-white text-black rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs">Hours</div>
                </div>
                <div className="bg-white text-black rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs">Minutes</div>
                </div>
                <div className="bg-white text-black rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Deal Categories Navigation */}
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {dealTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-white text-amazon-orange shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className={`${tab.icon} ${activeTab === tab.id ? 'text-amazon-orange' : tab.color}`}></i>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Deal Banner */}
      {activeTab === 'lightning' && (
        <section className="bg-yellow-50 border-l-4 border-yellow-400 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center space-x-4 text-center">
              <i className="fas fa-exclamation-triangle text-yellow-600 text-2xl"></i>
              <span className="text-lg font-semibold text-yellow-800">
                Lightning Deals are time-sensitive and quantities are limited!
              </span>
              <i className="fas fa-clock text-yellow-600 text-2xl"></i>
            </div>
          </div>
        </section>
      )}
      
      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {dealTabs.find(tab => tab.id === activeTab)?.name}
          </h2>
          <p className="text-gray-600">
            {filteredDeals.length} amazing deals available
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDeals.map((product) => (
            <div key={product.id} className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform group-hover:scale-105">
                {/* Deal Badge */}
                <div className="absolute top-4 left-4 z-10 space-y-2">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {calculateSavings(product.originalPrice, product.price)}% OFF
                  </div>
                  {product.dealType === 'lightning' && (
                    <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <i className="fas fa-bolt mr-1"></i>
                      Lightning
                    </div>
                  )}
                </div>
                
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-contain group-hover:scale-110 transition-transform duration-500 bg-gray-50"
                  />
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                      <i className="far fa-heart text-gray-700"></i>
                    </button>
                    <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                      <i className="fas fa-share-alt text-gray-700"></i>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Brand */}
                  <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                  
                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
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
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      You save: {formatPrice(product.originalPrice - product.price)}
                    </div>
                  </div>
                  
                  {/* Stock Status */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(product.quantityLeft)}`}>
                      <i className="fas fa-box mr-1"></i>
                      {product.quantityLeft <= 10 
                        ? `Only ${product.quantityLeft} left!` 
                        : `${product.quantityLeft} available`
                      }
                    </div>
                  </div>
                  
                  {/* Progress Bar for Lightning Deals */}
                  {product.dealType === 'lightning' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Claimed</span>
                        <span>{Math.round((100 - product.quantityLeft) * 1.2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((100 - product.quantityLeft) * 1.2, 95)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Shipping Info */}
                  <div className="mb-4 space-y-1">
                    {product.freeShipping && (
                      <div className="flex items-center text-sm text-green-600">
                        <i className="fas fa-truck mr-2"></i>
                        <span>FREE delivery</span>
                      </div>
                    )}
                    {product.primeEligible && (
                      <div className="flex items-center text-sm text-amazon-blue">
                        <i className="fab fa-amazon mr-2"></i>
                        <span className="font-bold">Prime eligible</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button className="w-full bg-amazon-yellow hover:bg-amazon-yellow-dark text-black py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredDeals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-tags text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals available</h3>
            <p className="text-gray-500">Check back later for more amazing deals!</p>
          </div>
        )}
      </div>
      
      {/* Deal Alert Signup */}
      <section className="bg-amazon-blue text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Never Miss a Deal!</h3>
          <p className="text-xl mb-8">Get instant notifications for lightning deals and exclusive offers</p>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-amazon-yellow"
              />
              <button className="bg-amazon-orange hover:bg-amazon-orange-dark px-6 py-3 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-3">
              Get deals alerts, price drop notifications, and exclusive offers
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DealsPage;