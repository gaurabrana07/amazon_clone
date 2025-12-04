import React, { useState, useEffect } from 'react';
import { usePWA } from '../../context/PWAContext';
import {
  WifiIcon,
  SignalSlashIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const OfflineIndicator = () => {
  const { isOnline, addOfflineAction } = usePWA();
  const [showDetails, setShowDetails] = useState(false);
  const [offlineActions, setOfflineActions] = useState(0);

  useEffect(() => {
    // Count pending offline actions
    const countOfflineActions = () => {
      try {
        const cartActions = JSON.parse(localStorage.getItem('offline-actions-cart') || '[]');
        const wishlistActions = JSON.parse(localStorage.getItem('offline-actions-wishlist') || '[]');
        const orderActions = JSON.parse(localStorage.getItem('offline-actions-orders') || '[]');
        
        setOfflineActions(cartActions.length + wishlistActions.length + orderActions.length);
      } catch (error) {
        console.error('Failed to count offline actions:', error);
      }
    };

    countOfflineActions();
    
    // Update count when storage changes
    const handleStorageChange = (e) => {
      if (e.key?.startsWith('offline-actions-')) {
        countOfflineActions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically
    const interval = setInterval(countOfflineActions, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && offlineActions === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <SignalSlashIcon className="h-4 w-4" />
            <span>You're offline</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-yellow-100 hover:text-white underline"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
          </div>
        </div>
      )}

      {/* Sync Banner */}
      {isOnline && offlineActions > 0 && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />
            <span>Syncing {offlineActions} pending action{offlineActions !== 1 ? 's' : ''}...</span>
          </div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && !isOnline && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Offline Mode
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>✓ Browse products and categories</p>
              <p>✓ View your cart and wishlist</p>
              <p>✓ Access your order history</p>
              <p>⚠️ New orders will be synced when you're back online</p>
              {offlineActions > 0 && (
                <p className="text-amber-600 font-medium">
                  📤 {offlineActions} action{offlineActions !== 1 ? 's' : ''} waiting to sync
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;