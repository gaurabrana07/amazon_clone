import React, { useState, useEffect, useMemo } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import advancedAnalytics from '../../services/advancedAnalytics';

// Reusable Chart Components
const LineChart = ({ data, className = "" }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className={`relative h-32 ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 300 120">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="0"
            y1={i * 24 + 10}
            x2="300"
            y2={i * 24 + 10}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        <polyline
          points={data.map((point, index) => {
            const x = (index / (data.length - 1)) * 280 + 10;
            const y = 100 - ((point.value - minValue) / range) * 80 + 10;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 280 + 10;
          const y = 100 - ((point.value - minValue) / range) * 80 + 10;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
              className="hover:r-4 transition-all"
            />
          );
        })}
      </svg>
    </div>
  );
};

const BarChart = ({ data, className = "" }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-600 truncate">{item.label}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm font-medium text-gray-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ data, centerLabel, className = "" }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  return (
    <div className={`relative ${className}`}>
      <svg className="w-32 h-32" viewBox="0 0 100 100">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
          const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
          const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
          const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          const pathData = [
            "M", 50, 50,
            "L", startX, startY,
            "A", 40, 40, 0, largeArc, 1, endX, endY,
            "Z"
          ].join(" ");
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              className="hover:opacity-80 transition-opacity"
            />
          );
        })}
        
        {/* Center circle */}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900">{total}</div>
        <div className="text-xs text-gray-500">{centerLabel}</div>
      </div>
    </div>
  );
};

const AdvancedAnalyticsDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [timeRange, setTimeRange] = useState(7); // days
  const [activeTab, setActiveTab] = useState('overview');

  // Real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [revenueMetrics, setRevenueMetrics] = useState({});
  const [productPerformance, setProductPerformance] = useState([]);
  const [customerSegments, setCustomerSegments] = useState({});

  // Refresh data
  const refreshData = () => {
    setRealTimeMetrics(advancedAnalytics.getRealTimeMetrics());
    setRevenueMetrics(advancedAnalytics.calculateRevenueMetrics(timeRange));
    setProductPerformance(advancedAnalytics.analyzeProductPerformance());
    setCustomerSegments(advancedAnalytics.segmentCustomers());
    setRefreshTrigger(Date.now());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  // Computed metrics
  const kpiCards = useMemo(() => [
    {
      title: 'Active Users',
      value: realTimeMetrics.activeUsers || 0,
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'blue'
    },
    {
      title: 'Revenue (24h)',
      value: `$${(revenueMetrics.totalRevenue || 0).toLocaleString()}`,
      change: '+8.2%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      title: 'Conversion Rate',
      value: `${((revenueMetrics.conversionRate || 0) * 100).toFixed(1)}%`,
      change: '-2.1%',
      changeType: 'negative',
      icon: ArrowTrendingUpIcon,
      color: 'yellow'
    },
    {
      title: 'Avg Order Value',
      value: `$${(revenueMetrics.averageOrderValue || 0).toFixed(2)}`,
      change: '+5.7%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
      color: 'purple'
    }
  ], [realTimeMetrics, revenueMetrics]);

  const revenueChartData = useMemo(() => {
    if (!revenueMetrics.revenueByDay) return [];
    return Object.entries(revenueMetrics.revenueByDay).map(([date, revenue]) => ({
      label: date,
      value: revenue
    }));
  }, [revenueMetrics]);

  const topProductsData = useMemo(() => {
    return productPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(product => ({
        label: product.productName || 'Unknown',
        value: Math.round(product.revenue)
      }));
  }, [productPerformance]);

  const deviceData = useMemo(() => {
    const breakdown = realTimeMetrics.deviceBreakdown || {};
    return Object.entries(breakdown).map(([device, count]) => ({
      label: device,
      value: count
    }));
  }, [realTimeMetrics]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
    { id: 'products', name: 'Products', icon: ShoppingCartIcon },
    { id: 'customers', name: 'Customers', icon: UsersIcon },
    { id: 'realtime', name: 'Real-time', icon: ClockIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Advanced business intelligence and insights</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={refreshData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <div className={`flex items-center mt-2 text-sm ${
                    kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.changeType === 'positive' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    <span>{kpi.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${kpi.color}-100`}>
                  <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <LineChart data={revenueChartData} />
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
                <BarChart data={topProductsData} />
              </div>

              {/* Device Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <div className="flex items-center justify-center">
                  <DonutChart data={deviceData} centerLabel="Devices" />
                </div>
                <div className="mt-4 space-y-2">
                  {deviceData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page Views (1h)</span>
                    <span className="font-medium">{realTimeMetrics.pageViewsLastHour || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversions (1h)</span>
                    <span className="font-medium">{realTimeMetrics.conversionsLastHour || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue (1h)</span>
                    <span className="font-medium">${(realTimeMetrics.revenueLastHour || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-medium">{revenueMetrics.totalOrders || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                <LineChart data={revenueChartData} className="h-64" />
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(revenueMetrics.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Order Value</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ${(revenueMetrics.averageOrderValue || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {(revenueMetrics.totalOrders || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {((revenueMetrics.conversionRate || 0) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Add to Cart
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchases
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productPerformance.slice(0, 10).map((product, index) => (
                      <tr key={product.productId || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName || 'Unknown Product'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.addToCarts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.purchases}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.revenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(product.conversionRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
                <div className="space-y-3">
                  {Object.entries(customerSegments).map(([segment, customers]) => (
                    <div key={segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">
                        {segment.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {customers.length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Top Customer Segment</p>
                    <p className="text-lg font-bold text-blue-700">
                      {Object.entries(customerSegments).reduce((a, b) => 
                        customerSegments[a[0]]?.length > customerSegments[b[0]]?.length ? a : b, ['', []]
                      )[0] || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Total Customers</p>
                    <p className="text-lg font-bold text-green-700">
                      {Object.values(customerSegments).reduce((sum, customers) => sum + customers.length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Active Users</span>
                    </div>
                    <span className="font-bold text-green-600">{realTimeMetrics.activeUsers || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Page Views (1h)</span>
                    </div>
                    <span className="font-bold">{realTimeMetrics.pageViewsLastHour || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingCartIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Conversions (1h)</span>
                    </div>
                    <span className="font-bold">{realTimeMetrics.conversionsLastHour || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                <div className="space-y-2">
                  {(realTimeMetrics.topPages || []).map((page, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1">{page.path}</span>
                      <span className="font-medium ml-2">{page.views}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                <div className="space-y-2">
                  {Object.entries(realTimeMetrics.trafficSources || {}).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{source}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;