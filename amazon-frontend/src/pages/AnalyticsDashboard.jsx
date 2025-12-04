import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { usePriceTracking } from '../context/PriceTrackingContext';
import { useProducts } from '../context/ProductContext';
import { 
  ChartBarIcon,
  EyeIcon,
  ShoppingCartIcon,
  HeartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = () => {
  const { 
    getMarketTrends, 
    getProductInsights, 
    getUserSegment,
    getPersonalizedRecommendations,
    trackEvent 
  } = useAnalytics();
  const { getPriceDropDeals, calculatePriceTrend } = usePriceTracking();
  const { products } = useProducts();
  
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [marketTrends, setMarketTrends] = useState(null);
  const [priceDropDeals, setPriceDropDeals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    // Load analytics data
    const trends = getMarketTrends();
    const deals = getPriceDropDeals();
    
    setMarketTrends(trends);
    setPriceDropDeals(deals);
    
    // Get trending products
    const trending = products
      .filter(product => {
        const trend = calculatePriceTrend(product.id);
        return trend === 'falling' || Math.random() > 0.7; // Simulate trending logic
      })
      .slice(0, 6);
    
    setTrendingProducts(trending);

    // Track dashboard view
    trackEvent('dashboard_view', { period: selectedPeriod });
  }, [selectedPeriod]);

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const renderMetricCard = (title, value, change, icon, color = 'blue') => {
    const Icon = icon;
    const isPositive = change > 0;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-4 flex items-center">
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            } ml-1`}>
              {formatPercentage(Math.abs(change))}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    );
  };

  const renderTrendingProducts = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
            Trending Products
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingProducts.map((product) => {
            const trend = calculatePriceTrend(product.id);
            const insights = getProductInsights(product.id);
            
            return (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    trend === 'rising' ? 'bg-red-100 text-red-700' :
                    trend === 'falling' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {trend === 'rising' ? (
                      <ArrowTrendingUpIcon className="h-3 w-3" />
                    ) : trend === 'falling' ? (
                      <ArrowDownIcon className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3 bg-current rounded-full" />
                    )}
                    <span className="capitalize">{trend}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Performance</span>
                    <span className="font-medium">
                      {insights ? `${insights.performanceScore}/100` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="h-3 w-3" />
                      <span>1.2k views</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ShoppingCartIcon className="h-3 w-3" />
                      <span>{formatPercentage(product.conversionRate || 4.5)}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderPriceDropDeals = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
          Biggest Price Drops
        </h3>
      </div>
      
      <div className="p-6">
        {priceDropDeals.length > 0 ? (
          <div className="space-y-4">
            {priceDropDeals.slice(0, 5).map((deal) => (
              <div key={deal.productId} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <h4 className="font-medium text-gray-900">{deal.productName}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(deal.currentPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(deal.originalPrice)}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    -{formatPercentage(deal.priceDropPercentage)} OFF
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lowest price ever
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No significant price drops this period</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategoryTrends = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
          Category Performance
        </h3>
      </div>
      
      <div className="p-6">
        {marketTrends?.categoryTrends ? (
          <div className="space-y-4">
            {Object.entries(marketTrends.categoryTrends)
              .sort(([,a], [,b]) => b.totalViews - a.totalViews)
              .slice(0, 6)
              .map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-600">
                        {data.totalViews.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(data.totalViews / Math.max(...Object.values(marketTrends.categoryTrends).map(d => d.totalViews))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatPercentage(data.averageConversion * 100)}
                    </p>
                    <p className="text-xs text-gray-500">conversion</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Loading category trends...</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuickInsights = () => {
    const userSegment = getUserSegment();
    const recommendations = getPersonalizedRecommendations();
    
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <SparklesIcon className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-medium">Quick Insights</h3>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Your Shopping Profile</h4>
            <p className="text-sm text-purple-100">
              You're classified as a <span className="font-semibold capitalize">{userSegment}</span> customer.
              {userSegment === 'high_value' && " You're among our most valued customers!"}
              {userSegment === 'regular' && " You shop with us regularly."}
              {userSegment === 'browser' && " You love exploring our products."}
              {userSegment === 'new_user' && " Welcome to our community!"}
            </p>
          </div>
          
          {recommendations.topCategories?.length > 0 && (
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="font-medium mb-2">Recommended for You</h4>
              <p className="text-sm text-purple-100">
                Based on your browsing history, you might like products in{' '}
                <span className="font-semibold">
                  {recommendations.topCategories.slice(0, 2).join(' and ')}
                </span>.
              </p>
            </div>
          )}
          
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Best Shopping Time</h4>
            <p className="text-sm text-purple-100">
              You're most active during <span className="font-semibold">{recommendations.bestTimeToShow}</span> hours.
              We'll send you deals at the perfect time!
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Sample metrics - in a real app, these would come from your analytics
  const metrics = [
    {
      title: "Total Views",
      value: "12.4K",
      change: 8.2,
      icon: EyeIcon,
      color: "blue"
    },
    {
      title: "Conversion Rate",
      value: "4.8%",
      change: -1.3,
      icon: ShoppingCartIcon,
      color: "green"
    },
    {
      title: "Avg. Session",
      value: "8m 32s",
      change: 12.5,
      icon: ClockIcon,
      color: "purple"
    },
    {
      title: "Wishlist Adds",
      value: "890",
      change: 15.7,
      icon: HeartIcon,
      color: "red"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Insights into market trends, product performance, and your shopping patterns
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index}>
              {renderMetricCard(metric.title, metric.value, metric.change, metric.icon, metric.color)}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {renderTrendingProducts()}
            {renderCategoryTrends()}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {renderQuickInsights()}
            {renderPriceDropDeals()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;