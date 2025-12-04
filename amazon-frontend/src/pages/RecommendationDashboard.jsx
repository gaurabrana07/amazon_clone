import React, { useState, useEffect } from 'react';
import { useRecommendation } from '../context/RecommendationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  HeartIcon,
  EyeIcon,
  StarIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const RecommendationDashboard = () => {
  const {
    personalizedRecommendations,
    trendingProducts,
    recentlyViewed,
    userPreferences,
    getRecommendationsByType,
    refreshRecommendations,
    isLoading
  } = useRecommendation();
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personalized');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tabs = [
    { id: 'personalized', name: 'For You', icon: SparklesIcon },
    { id: 'trending', name: 'Trending', icon: ArrowTrendingUpIcon },
    { id: 'recent', name: 'Recently Viewed', icon: ClockIcon },
    { id: 'preferences', name: 'Insights', icon: ChartBarIcon }
  ];

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const renderProductCard = (product, showRecommendationInfo = false) => (
    <div
      key={product.id}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
          {product.title}
        </h3>
        
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.reviewCount || 0})</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {showRecommendationInfo && product.reason && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700">{product.reason}</span>
              {product.confidence && (
                <span className={`text-xs font-medium ${getConfidenceColor(product.confidence)}`}>
                  {getConfidenceLabel(product.confidence)}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs">
          {product.prime && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              Prime
            </span>
          )}
          {product.freeShipping && (
            <span className="text-green-600">Free shipping</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderPersonalizedTab = () => (
    <div className="space-y-6">
      {/* Algorithm Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { type: 'collaborative', name: 'Similar Users', icon: '👥', color: 'blue' },
          { type: 'content', name: 'Your Style', icon: '🎯', color: 'green' },
          { type: 'trending', name: 'Popular Now', icon: '🔥', color: 'red' },
          { type: 'seasonal', name: 'Seasonal', icon: '🍂', color: 'orange' }
        ].map((algo) => {
          const recs = getRecommendationsByType(algo.type, 4);
          return (
            <div key={algo.type} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">{algo.icon}</span>
                <h3 className="font-medium text-gray-900 text-sm">{algo.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full bg-${algo.color}-100 text-${algo.color}-800`}>
                  {recs.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recs.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="aspect-square bg-gray-100 rounded cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Personalized Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
          <button
            onClick={refreshRecommendations}
            disabled={isLoading}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
        
        {personalizedRecommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {personalizedRecommendations.slice(0, 12).map((product) => 
              renderProductCard(product, true)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Building Your Recommendations
            </h3>
            <p className="text-gray-600">
              Browse and shop more products to get personalized recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrendingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Trending Products</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ArrowTrendingUpIcon className="h-4 w-4" />
          <span>Updated hourly</span>
        </div>
      </div>
      
      {trendingProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trendingProducts.map((product, index) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                #{index + 1}
              </div>
              {renderProductCard(product)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ArrowTrendingUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Trending Data Available
          </h3>
          <p className="text-gray-600">Check back later for trending products</p>
        </div>
      )}
    </div>
  );

  const renderRecentTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <EyeIcon className="h-4 w-4" />
          <span>{recentlyViewed.length} products</span>
        </div>
      </div>
      
      {recentlyViewed.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentlyViewed.map((product) => renderProductCard(product))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Recently Viewed Products
          </h3>
          <p className="text-gray-600">
            Products you view will appear here for easy access
          </p>
        </div>
      )}
    </div>
  );

  const renderPreferencesTab = () => {
    const topCategories = Object.entries(userPreferences.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    const topBrands = Object.entries(userPreferences.brands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Shopping Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Favorite Categories
            </h4>
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.map(([category, count], index) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(count / topCategories[0][1]) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Start shopping to see your preferences</p>
            )}
          </div>

          {/* Top Brands */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2" />
              Preferred Brands
            </h4>
            {topBrands.length > 0 ? (
              <div className="space-y-3">
                {topBrands.map(([brand, count], index) => (
                  <div key={brand} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{brand}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / topBrands[0][1]) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Start shopping to see your preferences</p>
            )}
          </div>
        </div>

        {/* Shopping Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <h4 className="font-medium text-gray-900 mb-4">Your Shopping Profile</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(userPreferences.categories).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-gray-600">Interactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(userPreferences.categories).length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(userPreferences.brands).length}
              </div>
              <div className="text-sm text-gray-600">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {recentlyViewed.length}
              </div>
              <div className="text-sm text-gray-600">Recently Viewed</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600">Please login to see your personalized recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
              <p className="text-gray-600">Discover products tailored just for you</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <SparklesIcon className="h-4 w-4" />
              <span>Powered by Machine Learning</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-t border-gray-200">
            <nav className="flex space-x-8 pt-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'personalized' && renderPersonalizedTab()}
          {activeTab === 'trending' && renderTrendingTab()}
          {activeTab === 'recent' && renderRecentTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
        </div>
      </div>
    </div>
  );
};

export default RecommendationDashboard;