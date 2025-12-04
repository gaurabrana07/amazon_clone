import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useRecommendation } from '../context/RecommendationContext';
import { useRecommendations } from '../hooks/useRecommendations';
import {
  HeartIcon,
  ShareIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  PencilIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import ProductCard from '../components/ProductCard/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ImageGallery from '../components/ImageGallery/ImageGallery';
import ReviewsList from '../components/Reviews/ReviewsList';
import WriteReview from '../components/Reviews/WriteReview';
import ProductQA from '../components/QA/ProductQA';
import PriceAlertModal from '../components/PriceAlert/PriceAlertModal';
import SmartRecommendations from '../components/AI/SmartRecommendations';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getProductById, 
    getRelatedProducts, 
    getFrequentlyBoughtTogether,
    getProductVariant,
    checkStockAvailability,
    getVariantPrice 
  } = useProducts();
  const { addToCart, openCartSidebar } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const { addToRecentlyViewed, getSimilarProducts, getFrequentlyBoughtTogether: getRecommendedBundles } = useRecommendation();
  const { trackBehavior } = useRecommendations();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [stockInfo, setStockInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showPriceAlert, setShowPriceAlert] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const productData = getProductById(parseInt(id));
      if (productData) {
        setProduct(productData);
        setRelatedProducts(getRelatedProducts(productData.id));
        setFrequentlyBought(getFrequentlyBoughtTogether(productData.id));
        
        // Add to recently viewed for recommendations
        addToRecentlyViewed(productData);
        
        // Track AI behavior - product view
        trackBehavior('view', productData.id.toString(), {
          category: productData.category,
          price: productData.price,
          source: 'product_detail_page'
        });
        
        // Set default variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        
        // Check stock
        const stock = checkStockAvailability(productData.id, quantity);
        setStockInfo(stock);
      }
      setLoading(false);
    }
  }, [id, quantity]);

  // Update stock info when variant changes
  useEffect(() => {
    if (product) {
      const stock = checkStockAvailability(
        product.id, 
        quantity, 
        selectedVariant?.id
      );
      setStockInfo(stock);
    }
  }, [selectedVariant, quantity, product]);

  const handleAddToCart = () => {
    if (!stockInfo?.available) {
      showNotification(stockInfo?.message || 'Product not available', 'error');
      return;
    }

    const currentPrice = selectedVariant ? 
      getVariantPrice(product.id, selectedVariant.id) : 
      product.price;

    const cartItem = {
      ...product,
      selectedVariant,
      quantity,
      price: currentPrice
    };

    addToCart(cartItem, quantity);
    openCartSidebar();
    showNotification(`Added ${product.name} to cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (!stockInfo?.available) {
      showNotification(stockInfo?.message || 'Product not available', 'error');
      return;
    }

    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      showNotification('info', 'Please login to add to wishlist');
      navigate('/auth');
      return;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showNotification('info', 'Removed from wishlist');
    } else {
      addToWishlist(product);
      showNotification('success', 'Added to wishlist!');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({product?.reviews} reviews)</span>
      </div>
    );
  };

  const getStockStatusClass = () => {
    if (!stockInfo?.available) return 'text-red-600';
    if (stockInfo?.isLowStock) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? 
    getVariantPrice(product.id, selectedVariant.id) : 
    product.price;

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="text-gray-500">/</span>
            <Link to="/products" className="text-blue-600 hover:text-blue-800">Products</Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 capitalize">{product.category}</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-500 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <ImageGallery 
              images={images} 
              productName={product.name}
              className="sticky top-4"
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-3">{product.description}</p>
              {renderStarRating(product.rating)}
            </div>

            {/* Brand */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Brand:</span>
              <span className="text-sm font-medium text-blue-600">{product.brand}</span>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {product.originalPrice && product.originalPrice > currentPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Select Variant:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{variant.name}</span>
                        <span className="text-sm text-gray-600">
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="space-y-2">
              <p className={`text-sm font-medium ${getStockStatusClass()}`}>
                {stockInfo?.message}
              </p>
              {product.isPrime && (
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                    prime
                  </div>
                  <span className="text-sm text-gray-600">Free delivery</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Quantity:
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!stockInfo?.available}
              >
                {[...Array(Math.min(10, stockInfo?.available ? 10 : 0))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!stockInfo?.available}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Add to Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!stockInfo?.available}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Buy Now
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleWishlistToggle}
                  className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-lg transition-colors"
                >
                  {isInWishlist(product.id) ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span className="text-sm">
                    {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                  </span>
                </button>
                
                <button
                  onClick={() => setShowPriceAlert(true)}
                  className="flex items-center justify-center space-x-2 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-lg transition-colors"
                >
                  <BellIcon className="h-5 w-5" />
                  <span className="text-sm">Price Alert</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-lg transition-colors">
                  <ShareIcon className="h-5 w-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery & Service Info */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Free Delivery</p>
                  <p className="text-xs text-gray-500">Orders above ₹499</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{product.warranty}</p>
                  <p className="text-xs text-gray-500">{product.returnPolicy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="border-t">
          <div className="flex space-x-8 border-b">
            {['description', 'specifications', 'reviews', 'qa'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'qa' ? 'Q&A' : tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Description</h3>
                <p className="text-gray-700">{product.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">Product Details</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li><strong>Weight:</strong> {product.weight}</li>
                      <li><strong>Dimensions:</strong> {product.dimensions}</li>
                      <li><strong>Warranty:</strong> {product.warranty}</li>
                      <li><strong>Return Policy:</strong> {product.returnPolicy}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key Features</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {product.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && product.specifications && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Customer Reviews</h3>
                  <button 
                    onClick={() => setShowWriteReview(true)}
                    className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Write a Review</span>
                  </button>
                </div>
                
                <ReviewsList productId={parseInt(id)} />
              </div>
            )}

            {activeTab === 'qa' && (
              <ProductQA productId={parseInt(id)} />
            )}
          </div>
        </div>

        {/* AI-Powered Frequently Bought Together */}
        <div className="mt-12">
          <SmartRecommendations 
            type="crossSell"
            title="Frequently Bought Together"
            cartItems={product ? [product] : []}
            limit={6}
            showReason={true}
          />
        </div>

        {/* AI-Powered Related Products */}
        <div className="mt-12">
          <SmartRecommendations 
            type="related"
            title="You might also like"
            productId={product?.id}
            limit={8}
            showReason={true}
          />
        </div>

        {/* Traditional Related Products (Fallback) */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More from this category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <WriteReview 
          productId={id}
          productName={product.name}
          onClose={() => setShowWriteReview(false)}
          onSuccess={() => {
            // Optionally refresh reviews or show success message
            setActiveTab('reviews');
          }}
        />
      )}

      {/* Price Alert Modal */}
      {showPriceAlert && (
        <PriceAlertModal 
          product={product}
          isOpen={showPriceAlert}
          onClose={() => setShowPriceAlert(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;