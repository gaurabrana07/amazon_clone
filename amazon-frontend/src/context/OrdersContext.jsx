import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('amazon_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Error parsing orders:', error);
      }
    }
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('amazon_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const createOrder = async (orderData, user) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const orderNumber = `AMZ-${Date.now()}`;
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 7) + 3); // 3-10 days

      const newOrder = {
        id: uuidv4(),
        orderNumber,
        userId: user.id,
        status: 'confirmed',
        items: orderData.items.map(item => ({
          ...item,
          orderedAt: new Date().toISOString()
        })),
        shipping: {
          address: orderData.shippingAddress,
          method: orderData.shippingMethod,
          cost: orderData.shippingCost,
          estimatedDelivery: estimatedDelivery.toISOString()
        },
        payment: {
          method: orderData.paymentMethod,
          last4: orderData.paymentDetails?.last4 || '****',
          amount: orderData.total
        },
        pricing: {
          subtotal: orderData.subtotal,
          shipping: orderData.shippingCost,
          tax: orderData.tax,
          total: orderData.total
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setOrders(prev => [newOrder, ...prev]);
      return { success: true, order: newOrder };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId, reason) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setOrders(prev => prev.map(order => {
        if (order.id === orderId && ['confirmed', 'processing'].includes(order.status)) {
          return {
            ...order,
            status: 'cancelled',
            cancellation: {
              reason,
              cancelledAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const trackOrder = (orderNumber) => {
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (!order) return null;

    const statusUpdates = [];
    const createdDate = new Date(order.createdAt);
    
    statusUpdates.push({
      status: 'confirmed',
      message: 'Order confirmed',
      timestamp: order.createdAt,
      completed: true
    });

    if (['processing', 'shipped', 'delivered'].includes(order.status)) {
      const processingDate = new Date(createdDate);
      processingDate.setHours(processingDate.getHours() + 2);
      statusUpdates.push({
        status: 'processing',
        message: 'Order is being prepared',
        timestamp: processingDate.toISOString(),
        completed: true
      });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      const shippedDate = new Date(createdDate);
      shippedDate.setDate(shippedDate.getDate() + 1);
      statusUpdates.push({
        status: 'shipped',
        message: 'Order has been shipped',
        timestamp: shippedDate.toISOString(),
        completed: true
      });
    }

    if (order.status === 'delivered') {
      const deliveredDate = new Date(order.shipping.estimatedDelivery);
      statusUpdates.push({
        status: 'delivered',
        message: 'Order has been delivered',
        timestamp: deliveredDate.toISOString(),
        completed: true
      });
    } else {
      statusUpdates.push({
        status: 'delivered',
        message: `Estimated delivery: ${format(new Date(order.shipping.estimatedDelivery), 'MMM dd, yyyy')}`,
        timestamp: order.shipping.estimatedDelivery,
        completed: false
      });
    }

    return {
      order,
      tracking: statusUpdates
    };
  };

  const getUserOrders = (userId, status = null) => {
    let userOrders = orders.filter(order => order.userId === userId);
    
    if (status) {
      userOrders = userOrders.filter(order => order.status === status);
    }
    
    return userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  const getOrderByNumber = (orderNumber) => {
    return orders.find(order => order.orderNumber === orderNumber);
  };

  const getOrderStats = (userId) => {
    const userOrders = getUserOrders(userId);
    
    const stats = {
      total: userOrders.length,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: 0
    };

    userOrders.forEach(order => {
      stats[order.status] = (stats[order.status] || 0) + 1;
      if (order.status !== 'cancelled') {
        stats.totalSpent += order.pricing.total;
      }
    });

    return stats;
  };

  const reorderItems = (orderId) => {
    const order = getOrderById(orderId);
    if (!order) return null;

    return order.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity
    }));
  };

  const value = {
    orders,
    isLoading,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    trackOrder,
    getUserOrders,
    getOrderById,
    getOrderByNumber,
    getOrderStats,
    reorderItems
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

export default OrdersContext;