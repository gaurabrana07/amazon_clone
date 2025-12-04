import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SmartRecommendations from '../components/AI/SmartRecommendations';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };
  
  const handleCheckout = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Please log in to proceed with checkout' 
        } 
      });
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty. Add items to proceed to checkout.');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-6">
              <i className="fas fa-shopping-cart text-8xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link
              to="/products"
              className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black py-3 px-8 rounded-lg font-medium text-lg transition-colors duration-200 inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Cart Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Clear Cart
                  </button>
                </div>
              </div>
              
              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-contain rounded-lg border"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        
                        {item.brand && (
                          <p className="text-sm text-gray-600 mb-2">
                            Brand: {item.brand}
                          </p>
                        )}
                        
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star text-sm ${
                                  i < Math.floor(item.rating) ? 'text-amazon-yellow' : 'text-gray-300'
                                }`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {item.rating} ({item.reviews} reviews)
                          </span>
                        </div>
                        
                        {/* Stock Status */}
                        <div className="mb-4">
                          {item.inStock ? (
                            <span className="text-green-600 text-sm font-medium">
                              <i className="fas fa-check-circle mr-1"></i>
                              In Stock
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm font-medium">
                              <i className="fas fa-times-circle mr-1"></i>
                              Out of Stock
                            </span>
                          )}
                        </div>
                        
                        {/* Quantity and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700">Qty:</label>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <i className="fas fa-minus text-sm"></i>
                              </button>
                              <span className="px-4 py-2 text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                              >
                                <i className="fas fa-plus text-sm"></i>
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(item.originalPrice * item.quantity)}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          {formatPrice(item.price)} each
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({getCartItemCount()} items)
                  </span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(getCartTotal() * 0.18)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-amazon-orange">
                      {formatPrice(getCartTotal() * 1.18)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-amazon-yellow hover:bg-amazon-yellow-dark text-black py-3 px-4 rounded-lg font-medium text-lg transition-colors duration-200 mb-4"
              >
                Proceed to Checkout
              </button>
              
              {/* Prime Benefits */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <i className="fab fa-amazon text-amazon-blue mr-2"></i>
                  <span className="font-bold text-amazon-blue">Prime</span>
                </div>
                <p className="text-sm text-gray-700">
                  FREE One-Day Delivery on eligible items with Prime membership
                </p>
                <Link
                  to="/prime"
                  className="text-amazon-blue hover:text-amazon-orange text-sm font-medium transition-colors"
                >
                  Learn more →
                </Link>
              </div>
              
              {/* Security Badge */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <i className="fas fa-shield-alt text-green-500"></i>
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Cross-Sell Recommendations */}
        {cartItems.length > 0 && (
          <div className="mt-12">
            <SmartRecommendations 
              type="crossSell"
              title="Complete your purchase"
              cartItems={cartItems}
              limit={8}
              showReason={true}
            />
          </div>
        )}

        {/* Additional Personalized Recommendations */}
        <div className="mt-8">
          <SmartRecommendations 
            type="personal"
            title="You might also like"
            limit={6}
            showReason={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;