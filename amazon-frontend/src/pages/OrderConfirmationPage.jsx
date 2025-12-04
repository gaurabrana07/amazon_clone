import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  CalendarIcon, 
  MapPinIcon,
  CreditCardIcon,
  PrinterIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const foundOrder = getOrderById(orderId);
    if (!foundOrder || foundOrder.userId !== user?.id) {
      navigate('/orders');
      return;
    }

    setOrder(foundOrder);
  }, [orderId, isAuthenticated, user, getOrderById, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would generate and download a PDF invoice
    alert('Invoice download functionality would be implemented here with PDF generation.');
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.shipping.estimatedDelivery);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your order. We've received your payment and will begin processing your order shortly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-green-800 font-medium">Order Number: {order.orderNumber}</p>
            <p className="text-green-700 text-sm">
              Confirmation sent to your email
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <PrinterIcon className="h-5 w-5" />
              <span>Print Order</span>
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download Invoice</span>
            </button>
            <Link
              to="/orders"
              className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
            >
              <span>View All Orders</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TruckIcon className="h-6 w-6 mr-2 text-orange-600" />
                Delivery Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-1 text-gray-400" />
                    Estimated Delivery
                  </h3>
                  <p className="text-lg font-medium text-green-600">
                    {format(estimatedDelivery, 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shipping.method === 'overnight' ? 'Next business day' :
                     order.shipping.method === 'express' ? '2-3 business days' :
                     '5-7 business days'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-1 text-gray-400" />
                    Shipping Address
                  </h3>
                  <div className="text-gray-600">
                    <p>{order.shipping.address.fullName}</p>
                    <p>{order.shipping.address.streetAddress}</p>
                    <p>
                      {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zipCode}
                    </p>
                    <p>{order.shipping.address.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">
                        Price: ${(item.price / 100).toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-6 w-6 mr-2 text-orange-600" />
                Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-gray-600">
                    {order.payment.method.toUpperCase()} ending in {order.payment.last4}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
                  <p className="text-gray-600">Same as shipping address</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({order.items.length} items)</span>
                  <span>${(order.pricing.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {order.pricing.shipping === 0 ? 'FREE' : `$${(order.pricing.shipping / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(order.pricing.tax / 100).toFixed(2)}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(order.pricing.total / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Order Status */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Order Status</h4>
                <p className="text-blue-800 capitalize">{order.status}</p>
                <p className="text-blue-700 text-sm mt-1">
                  Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>

              {/* What's Next */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• We'll email you when your order ships</li>
                  <li>• Track your package with the provided tracking number</li>
                  <li>• Rate and review your items after delivery</li>
                </ul>
              </div>

              {/* Help */}
              <div className="mt-6 text-center">
                <Link
                  to="/customer-service"
                  className="text-orange-600 hover:text-orange-500 text-sm font-medium"
                >
                  Need help with your order?
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="bg-orange-600 text-white px-8 py-3 rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;