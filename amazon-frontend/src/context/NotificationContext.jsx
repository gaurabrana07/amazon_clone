import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NotificationContext = createContext();

// Notification Item Component
const NotificationItem = ({ notification, onClose }) => {
  const { message, type } = notification;
  
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };
  
  return (
    <div className={`${getTypeStyles()} px-4 py-3 rounded-lg shadow-lg max-w-sm flex items-center space-x-3`}>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors"
      >
        ×
      </button>
    </div>
  );
};

// Notification Container Component
const NotificationContainer = ({ notifications, removeNotification }) => {
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  const addNotification = useCallback(({ message, type = 'info', duration = 3000 }) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, [removeNotification]);
  
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Convenience methods for different types
  const showSuccess = useCallback((message, duration) => {
    return addNotification({ message, type: 'success', duration });
  }, [addNotification]);
  
  const showError = useCallback((message, duration) => {
    return addNotification({ message, type: 'error', duration });
  }, [addNotification]);
  
  const showWarning = useCallback((message, duration) => {
    return addNotification({ message, type: 'warning', duration });
  }, [addNotification]);
  
  const showInfo = useCallback((message, duration) => {
    return addNotification({ message, type: 'info', duration });
  }, [addNotification]);
  
  // Generic showNotification function for backward compatibility
  const showNotification = useCallback((type, message, duration) => {
    return addNotification({ message, type, duration });
  }, [addNotification]);
  
  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification
  }), [notifications, addNotification, removeNotification, clearAllNotifications, showSuccess, showError, showWarning, showInfo, showNotification]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};