import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import { useOrders } from '../context/OrdersContext';
import { useNotification } from '../context/NotificationContext';
import { 
  CreditCardIcon, 
  MapPinIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Enhanced payment method states
  const [activePaymentTab, setActivePaymentTab] = useState('cards');
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedUPI, setSelectedUPI] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const navigate = useNavigate();
  const { cart, getCartTotal, getCartItemCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { processPayment, getUserPaymentMethods } = usePayment();
  const { createOrder } = useOrders();
  const { showNotification } = useNotification();

  const paymentMethods = getUserPaymentMethods(user?.id);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      showNotification('error', 'Please sign in to proceed with checkout');
      return;
    }

    if (getCartItemCount() === 0) {
      navigate('/cart');
      showNotification('error', 'Your cart is empty');
      return;
    }

    // Set default address and payment method
    if (user?.addresses?.length > 0) {
      setSelectedAddress(user.addresses[0]);
    }
    if (paymentMethods.length > 0) {
      setSelectedPayment(paymentMethods.find(method => method.isDefault) || paymentMethods[0]);
      setActivePaymentTab('cards');
    } else {
      // If no saved cards, default to UPI or cards
      setActivePaymentTab('cards');
      setShowAddCard(true);
    }
  }, [isAuthenticated, user, paymentMethods, getCartItemCount, navigate, showNotification]);

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const shippingOptions = {
    standard: { cost: 0, days: '5-7', label: 'Standard Shipping (FREE)' },
    express: { cost: 999, days: '2-3', label: 'Express Shipping' },
    overnight: { cost: 1999, days: '1', label: 'Overnight Shipping' }
  };
  const shippingCost = shippingOptions[selectedShipping].cost;
  const total = subtotal + tax + shippingCost;

  const steps = [
    { id: 1, title: 'Shipping Address', icon: MapPinIcon },
    { id: 2, title: 'Payment Method', icon: CreditCardIcon },
    { id: 3, title: 'Review Order', icon: CheckCircleIcon }
  ];

  const handlePlaceOrder = async () => {
    // Validate based on selected payment method
    let paymentMethodData = null;
    
    if (activePaymentTab === 'cards') {
      if (!selectedPayment && !showAddCard) {
        showNotification('error', 'Please select a payment method');
        return;
      }
      paymentMethodData = selectedPayment || { type: 'card' };
    } else if (activePaymentTab === 'upi') {
      if (!selectedUPI) {
        showNotification('error', 'Please select a UPI payment method');
        return;
      }
      paymentMethodData = { type: 'upi', provider: selectedUPI };
    } else if (activePaymentTab === 'netbanking') {
      if (!selectedBank) {
        showNotification('error', 'Please select a bank for net banking');
        return;
      }
      paymentMethodData = { type: 'netbanking', bank: selectedBank };
    } else if (activePaymentTab === 'wallets') {
      if (!selectedWallet) {
        showNotification('error', 'Please select a wallet');
        return;
      }
      paymentMethodData = { type: 'wallet', provider: selectedWallet };
    } else if (activePaymentTab === 'cod') {
      if (selectedPaymentMethod !== 'cod') {
        showNotification('error', 'Please confirm Cash on Delivery');
        return;
      }
      paymentMethodData = { type: 'cod' };
    }

    if (!selectedAddress) {
      showNotification('error', 'Please select a shipping address');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Process payment (skip for COD)
      let paymentResult = { success: true };
      
      if (paymentMethodData.type !== 'cod') {
        paymentResult = await processPayment({
          amount: total,
          paymentMethod: paymentMethodData,
          currency: 'INR'
        });

        if (!paymentResult.success) {
          showNotification('error', paymentResult.error?.message || 'Payment failed');
          setIsPlacingOrder(false);
          return;
        }
      }

      // Create order
      const orderData = {
        items: cart,
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethodData.type,
        paymentDetails: {
          transactionId: paymentResult.transaction?.id || `${paymentMethodData.type}_${Date.now()}`,
          method: paymentMethodData.type,
          provider: paymentMethodData.provider || paymentMethodData.bank || 'N/A',
          last4: paymentMethodData.type === 'card' ? (selectedPayment?.cardNumber?.slice(-4) || '****') : null
        },
        shippingMethod: selectedShipping,
        shippingCost,
        subtotal,
        tax,
        total,
        notes: orderNotes
      };

      const orderResult = await createOrder(orderData, user);

      if (orderResult.success) {
        clearCart();
        showNotification('success', 'Order placed successfully!');
        navigate(`/order-confirmation/${orderResult.order.id}`);
      } else {
        showNotification('error', 'Failed to create order');
      }
    } catch (error) {
      showNotification('error', 'An error occurred during checkout');
      console.error('Checkout error:', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isAuthenticated || getCartItemCount() === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-orange-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
                
                {user?.addresses?.length > 0 ? (
                  <div className="space-y-3">
                    {user.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddress?.id === address.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{address.fullName}</h3>
                            <p className="text-gray-600">{address.streetAddress}</p>
                            <p className="text-gray-600">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-gray-600">{address.country}</p>
                            {address.phone && (
                              <p className="text-gray-600">Phone: {address.phone}</p>
                            )}
                          </div>
                          <input
                            type="radio"
                            checked={selectedAddress?.id === address.id}
                            onChange={() => setSelectedAddress(address)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {/* Add new address button */}
                    <button
                      onClick={() => navigate('/addresses')}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MapPinIcon className="h-5 w-5" />
                      <span>Add a new address</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
                    <p className="text-gray-600 mb-4">Add a shipping address to continue</p>
                    <button 
                      onClick={() => navigate('/addresses')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                    >
                      Add Address
                    </button>
                  </div>
                )}

                {selectedAddress && (
                  <div className="mt-6">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 font-medium"
                    >
                      Continue to Payment Method
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Payment Method</h2>
                
                <div className="space-y-6">
                  {/* Payment Options Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {[
                        { id: 'cards', name: 'Credit/Debit Cards', icon: 'fas fa-credit-card' },
                        { id: 'upi', name: 'UPI', icon: 'fas fa-mobile-alt' },
                        { id: 'netbanking', name: 'Net Banking', icon: 'fas fa-university' },
                        { id: 'wallets', name: 'Digital Wallets', icon: 'fas fa-wallet' },
                        { id: 'cod', name: 'Cash on Delivery', icon: 'fas fa-money-bill-wave' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActivePaymentTab(tab.id)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                            activePaymentTab === tab.id
                              ? 'border-orange-500 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <i className={`${tab.icon} mr-2`}></i>
                          {tab.name}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Credit/Debit Cards */}
                  {activePaymentTab === 'cards' && (
                    <div className="space-y-4">
                      {/* Saved Cards */}
                      {paymentMethods.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Saved Cards</h3>
                          <div className="space-y-3">
                            {paymentMethods.map((method) => (
                              <div
                                key={method.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedPayment?.id === method.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setSelectedPayment(method)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <i className={`fab fa-cc-${method.cardType?.toLowerCase()} text-2xl text-gray-600`}></i>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {method.cardType?.toUpperCase()} ending in {method.cardNumber?.slice(-4)}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        Expires {method.expiryMonth}/{method.expiryYear}
                                      </p>
                                      {method.isDefault && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <input
                                    type="radio"
                                    checked={selectedPayment?.id === method.id}
                                    onChange={() => setSelectedPayment(method)}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => setShowAddCard(true)}
                              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                              + Add a new card
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Add New Card Form */}
                      {(paymentMethods.length === 0 || showAddCard) && (
                        <div className="border rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {paymentMethods.length > 0 ? 'Add New Card' : 'Enter Card Details'}
                          </h3>
                          <form className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Expiry Month
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                                  <option value="">MM</option>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                      {String(i + 1).padStart(2, '0')}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Expiry Year
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                                  <option value="">YYYY</option>
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i} value={new Date().getFullYear() + i}>
                                      {new Date().getFullYear() + i}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  CVV
                                </label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  maxLength="4"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name on Card
                              </label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="saveCard"
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              />
                              <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                                Save this card for future purchases
                              </label>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-md">
                              <div className="flex">
                                <i className="fas fa-shield-alt text-blue-600 mr-2 mt-0.5"></i>
                                <div className="text-sm text-blue-800">
                                  <p className="font-medium">Your payment information is secure</p>
                                  <p>We use SSL encryption to protect your financial data.</p>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                  {/* UPI Payment */}
                  {activePaymentTab === 'upi' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Google Pay', icon: 'fab fa-google-pay', id: 'gpay' },
                          { name: 'PhonePe', icon: 'fas fa-mobile-alt', id: 'phonepe' },
                          { name: 'Paytm', icon: 'fas fa-wallet', id: 'paytm' },
                          { name: 'Other UPI Apps', icon: 'fas fa-qrcode', id: 'other' }
                        ].map((upi) => (
                          <div
                            key={upi.id}
                            className={`p-4 border rounded-lg cursor-pointer text-center transition-colors ${
                              selectedUPI === upi.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedUPI(upi.id)}
                          >
                            <i className={`${upi.icon} text-2xl text-gray-600 mb-2`}></i>
                            <p className="text-sm font-medium text-gray-900">{upi.name}</p>
                          </div>
                        ))}
                      </div>
                      
                      {selectedUPI && (
                        <div className="border rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter UPI ID
                          </label>
                          <input
                            type="text"
                            placeholder="example@upi"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You will be redirected to your UPI app to complete the payment
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Net Banking */}
                  {activePaymentTab === 'netbanking' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Choose Your Bank</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          'State Bank of India', 'HDFC Bank', 'ICICI Bank', 
                          'Axis Bank', 'Punjab National Bank', 'Bank of Baroda',
                          'Canara Bank', 'Union Bank', 'Other Banks'
                        ].map((bank) => (
                          <div
                            key={bank}
                            className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                              selectedBank === bank
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedBank(bank)}
                          >
                            <p className="text-sm font-medium text-gray-900">{bank}</p>
                          </div>
                        ))}
                      </div>
                      {selectedBank && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-sm text-blue-800">
                            <i className="fas fa-info-circle mr-2"></i>
                            You will be redirected to {selectedBank} to complete your payment securely.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Digital Wallets */}
                  {activePaymentTab === 'wallets' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Paytm Wallet', icon: 'fas fa-wallet', id: 'paytm' },
                          { name: 'PhonePe Wallet', icon: 'fas fa-mobile-alt', id: 'phonepe' },
                          { name: 'Amazon Pay', icon: 'fab fa-amazon-pay', id: 'amazonpay' },
                          { name: 'Mobikwik', icon: 'fas fa-wallet', id: 'mobikwik' }
                        ].map((wallet) => (
                          <div
                            key={wallet.id}
                            className={`p-4 border rounded-lg cursor-pointer text-center transition-colors ${
                              selectedWallet === wallet.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedWallet(wallet.id)}
                          >
                            <i className={`${wallet.icon} text-2xl text-gray-600 mb-2`}></i>
                            <p className="text-sm font-medium text-gray-900">{wallet.name}</p>
                          </div>
                        ))}
                      </div>
                      {selectedWallet && (
                        <div className="bg-green-50 p-3 rounded-md">
                          <p className="text-sm text-green-800">
                            <i className="fas fa-check-circle mr-2"></i>
                            Pay securely using your {selectedWallet} wallet balance.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cash on Delivery */}
                  {activePaymentTab === 'cod' && (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-6 text-center">
                        <i className="fas fa-money-bill-wave text-4xl text-green-600 mb-4"></i>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Cash on Delivery</h3>
                        <p className="text-gray-600 mb-4">
                          Pay with cash when your order is delivered to your doorstep.
                        </p>
                        <div className="bg-yellow-50 p-3 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            COD charges may apply. Please keep exact change ready.
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedPaymentMethod('cod')}
                          className={`mt-4 px-6 py-2 rounded-md font-medium transition-colors ${
                            selectedPaymentMethod === 'cod'
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {selectedPaymentMethod === 'cod' ? 'Selected' : 'Select COD'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Address
                  </button>
                  <button
                    onClick={() => {
                      if (activePaymentTab === 'cod' && selectedPaymentMethod === 'cod') {
                        setCurrentStep(3);
                      } else if (activePaymentTab === 'cards' && (selectedPayment || showAddCard)) {
                        setCurrentStep(3);
                      } else if (activePaymentTab === 'upi' && selectedUPI) {
                        setCurrentStep(3);
                      } else if (activePaymentTab === 'netbanking' && selectedBank) {
                        setCurrentStep(3);
                      } else if (activePaymentTab === 'wallets' && selectedWallet) {
                        setCurrentStep(3);
                      } else {
                        alert('Please select a payment method to continue');
                      }
                    }}
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 font-medium"
                  >
                    Review Order
                    <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-3 border-b">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Options */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Options</h3>
                  <div className="space-y-2">
                    {Object.entries(shippingOptions).map(([key, option]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="radio"
                          name="shipping"
                          value={key}
                          checked={selectedShipping === key}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {option.label} - {option.days} business days
                          {option.cost > 0 && ` (+$${(option.cost / 100).toFixed(2)})`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Any special instructions for your order..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isPlacingOrder ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({getCartItemCount()} items)</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? 'FREE' : `$${(shippingCost / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(tax / 100).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;