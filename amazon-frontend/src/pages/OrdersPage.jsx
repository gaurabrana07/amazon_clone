import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  CalendarIcon,
  EyeIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getUserOrders, getOrderStats, cancelOrder, reorderItems, trackOrder } = useOrders();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const allOrders = getUserOrders(user.id);
  const orderStats = getOrderStats(user.id);

  // Filter orders based on search and filters
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'last30':
          matchesDate = (now - orderDate) <= (30 * 24 * 60 * 60 * 1000);
          break;
        case 'last90':
          matchesDate = (now - orderDate) <= (90 * 24 * 60 * 60 * 1000);
          break;
        case 'lastyear':
          matchesDate = (now - orderDate) <= (365 * 24 * 60 * 60 * 1000);
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const result = await cancelOrder(orderId, 'Customer request');
      if (result.success) {
        showNotification('success', 'Order cancelled successfully');
      } else {
        showNotification('error', 'Failed to cancel order');
      }
    }
  };

  const handleReorder = (orderId) => {
    const items = reorderItems(orderId);
    if (items) {
      // Add items to cart logic would go here
      showNotification(`${items.length} items added to cart`, 'success');
      navigate('/cart');
    }
  };

  const handleTrackOrder = (orderNumber) => {
    const tracking = trackOrder(orderNumber);
    if (tracking) {
      navigate(`/track-order/${orderNumber}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelOrder = (order) => {
    return ['confirmed', 'processing'].includes(order.status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track packages, review past orders, and discover new favorites</p>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Delivered</h3>
            <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">In Transit</h3>
            <p className="text-2xl font-bold text-blue-600">{orderStats.shipped}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Spent</h3>
            <p className="text-2xl font-bold text-orange-600">
              ${(orderStats.totalSpent / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by number or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Orders</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Time</option>
                    <option value="last30">Last 30 days</option>
                    <option value="last90">Last 3 months</option>
                    <option value="lastyear">Last year</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {allOrders.length === 0 ? 'No orders yet' : 'No orders found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {allOrders.length === 0 
                  ? 'When you place orders, they will appear here.' 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              <Link
                to="/"
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                      <div>
                        <p className="text-sm text-gray-600">Order Number</p>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-medium text-gray-900">
                          ${(order.pricing.total / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      <button
                        onClick={() => handleTrackOrder(order.orderNumber)}
                        className="flex items-center space-x-1 text-orange-600 hover:text-orange-500 text-sm"
                      >
                        <TruckIcon className="h-4 w-4" />
                        <span>Track</span>
                      </button>
                      <Link
                        to={`/order/${order.id}`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-500 text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => handleReorder(order.id)}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-500 text-sm"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>Reorder</span>
                      </button>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-500 text-sm"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${((item.price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-600">
                        + {order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Delivery Info */}
                  {order.status === 'shipped' || order.status === 'delivered' ? (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-blue-800 font-medium">
                          {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}:
                        </span>
                        <span className="text-blue-700 ml-1">
                          {format(new Date(order.shipping.estimatedDelivery), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  ) : order.status === 'processing' ? (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-yellow-800">
                        Your order is being prepared for shipment.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;