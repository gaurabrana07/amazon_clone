import React, { useState } from 'react';
import { usePriceTracking } from '../../context/PriceTrackingContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  BellIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const PriceAlertModal = ({ product, isOpen, onClose }) => {
  const { createPriceAlert, isLoading } = usePriceTracking();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  
  const [targetPrice, setTargetPrice] = useState('');
  const [notificationType, setNotificationType] = useState('email');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showNotification('Please login to create price alerts', 'error');
      return;
    }

    // Validation
    const newErrors = {};
    
    if (!targetPrice || isNaN(targetPrice) || parseFloat(targetPrice) <= 0) {
      newErrors.targetPrice = 'Please enter a valid price';
    } else if (parseFloat(targetPrice) >= product.price) {
      newErrors.targetPrice = 'Target price should be less than current price';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await createPriceAlert(
      product.id,
      product.name,
      product.image || product.images?.[0],
      parseFloat(targetPrice),
      notificationType
    );

    if (result.success) {
      setTargetPrice('');
      setErrors({});
      onClose();
    }
  };

  const handlePriceChange = (value) => {
    setTargetPrice(value);
    if (errors.targetPrice) {
      setErrors(prev => ({ ...prev, targetPrice: '' }));
    }
  };

  if (!isOpen) return null;

  const currentPrice = product.price || 0;
  const suggestedPrices = [
    Math.round(currentPrice * 0.9), // 10% off
    Math.round(currentPrice * 0.8), // 20% off
    Math.round(currentPrice * 0.7), // 30% off
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-6 w-6 text-white" />
                <h3 className="text-lg font-medium text-white">Set Price Alert</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Product Info */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {product.image || product.images?.[0] ? (
                <img
                  src={product.image || product.images[0]}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600">Current Price</p>
              </div>
            </div>

            {/* Alert Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Price */}
              <div>
                <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Alert me when price drops to *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    id="targetPrice"
                    value={targetPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="Enter target price"
                    className={`w-full pl-8 pr-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.targetPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    max={currentPrice - 1}
                  />
                </div>
                {errors.targetPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetPrice}</p>
                )}

                {/* Quick Price Suggestions */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
                  <div className="flex space-x-2">
                    {suggestedPrices.map((price, index) => {
                      const discount = Math.round(((currentPrice - price) / currentPrice) * 100);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setTargetPrice(price.toString())}
                          className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                            targetPrice === price.toString()
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          ₹{price.toLocaleString('en-IN')}
                          <br />
                          <span className="text-xs text-green-600">({discount}% off)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Savings Display */}
                {targetPrice && !isNaN(targetPrice) && parseFloat(targetPrice) > 0 && parseFloat(targetPrice) < currentPrice && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-800 font-medium">
                          You'll save ₹{(currentPrice - parseFloat(targetPrice)).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-green-600">
                          That's {(((currentPrice - parseFloat(targetPrice)) / currentPrice) * 100).toFixed(1)}% off!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to be notified?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notificationType"
                      value="email"
                      checked={notificationType === 'email'}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Email notification</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notificationType"
                      value="push"
                      checked={notificationType === 'push'}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Browser notification</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notificationType"
                      value="both"
                      checked={notificationType === 'both'}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Both email and browser</span>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <BellIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">How it works</h4>
                    <ul className="mt-2 text-xs text-blue-800 space-y-1">
                      <li>• We'll monitor the price 24/7</li>
                      <li>• You'll be notified instantly when the price drops</li>
                      <li>• The alert stays active until the target price is reached</li>
                      <li>• You can manage all your alerts from your profile</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !targetPrice || parseFloat(targetPrice) >= currentPrice}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Alert...' : 'Create Price Alert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceAlertModal;