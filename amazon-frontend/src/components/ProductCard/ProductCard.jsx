import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotification } from '../../context/NotificationContext';
import { PRODUCT_IMAGE_COLLECTIONS } from '../../config/imageConfig';

const ProductCard = memo(({ product, variant = 'default' }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { addToCart, openCartSidebar } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showNotification } = useNotification();
  
  const getProductImage = () => {
    if (product.image && !product.image.includes('/api/placeholder/')) {
      return product.image;
    }
    const category = product.category?.toLowerCase() || 'electronics';
    const categoryImages = PRODUCT_IMAGE_COLLECTIONS[category] || PRODUCT_IMAGE_COLLECTIONS.electronics;
    const imageIndex = (product.id || 0) % categoryImages.length;
    return categoryImages[imageIndex];
  };
  
  const handleAddToCart = () => {
    addToCart(product);
    showNotification('success', `${product.name} added to cart!`);
    openCartSidebar();
  };
  
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      showNotification('success', `${product.name} added to wishlist!`);
    } else {
      showNotification('info', `${product.name} removed from wishlist`);
    }
  };
  
  const handleImageLoad = () => setIsImageLoading(false);
  const handleImageError = () => { setIsImageLoading(false); setImageError(true); };
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-amazon-yellow"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-amazon-yellow"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300"></i>);
    }
    return stars;
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const calculateDiscount = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };
  
  // Compact variant for grid layouts
  if (variant === 'compact') {
    return (
      <Link to={`/product/${product.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
          <div className="relative overflow-hidden">
            {isImageLoading && (
              <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            )}
            <img
              src={imageError ? getProductImage() : product.image || getProductImage()}
              alt={product.name}
              className={`w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300 ${isImageLoading ? 'hidden' : 'block'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {calculateDiscount() > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                -{calculateDiscount()}%
              </div>
            )}
          </div>
          
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-amazon-orange transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center mb-2">
              <div className="flex items-center mr-2">{renderStars(product.rating)}</div>
              <span className="text-xs text-gray-600">({product.reviews})</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
              className="w-full bg-amazon-yellow hover:bg-amazon-yellow-dark text-black py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    );
  }
  
  // Default variant for detailed view
  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        <div className="relative overflow-hidden">
          {isImageLoading && (
            <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
          <img
            src={imageError ? getProductImage() : product.image || getProductImage()}
            alt={product.name}
            className={`w-full h-64 object-contain group-hover:scale-105 transition-transform duration-300 ${isImageLoading ? 'hidden' : 'block'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          <div className="absolute top-3 left-3 space-y-2">
            {calculateDiscount() > 0 && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                -{calculateDiscount()}% OFF
              </div>
            )}
            {product.isBestseller && (
              <div className="bg-amazon-orange text-white px-3 py-1 rounded-md text-sm font-bold">
                #1 Best Seller
              </div>
            )}
            {product.isChoice && (
              <div className="bg-amazon-blue text-white px-3 py-1 rounded-md text-sm font-bold">
                Amazon Choice
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {product.brand && (
            <div className="text-sm text-gray-600 mb-1">
              <span className="hover:text-amazon-orange transition-colors cursor-pointer">{product.brand}</span>
            </div>
          )}
          
          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 hover:text-amazon-orange transition-colors cursor-pointer">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-2">{renderStars(product.rating)}</div>
            <span className="text-sm text-amazon-blue font-medium mr-1">{product.rating}</span>
            <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          
          <div className="mb-4 space-y-1">
            {product.freeShipping && (
              <div className="flex items-center text-sm text-green-600">
                <i className="fas fa-truck mr-1"></i>
                <span>FREE delivery</span>
              </div>
            )}
            {product.primeEligible && (
              <div className="flex items-center text-sm text-amazon-blue">
                <i className="fab fa-amazon mr-1"></i>
                <span className="font-bold">Prime</span>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            {product.inStock ? (
              <span className="text-green-600 text-sm font-medium">
                <i className="fas fa-check-circle mr-1"></i>In Stock
              </span>
            ) : (
              <span className="text-red-600 text-sm font-medium">
                <i className="fas fa-times-circle mr-1"></i>Out of Stock
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
            disabled={!product.inStock}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              product.inStock
                ? 'bg-amazon-yellow hover:bg-amazon-yellow-dark text-black'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          <div className="mt-3 flex space-x-2">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlistToggle(e); }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <i className={`${isInWishlist(product.id) ? 'fas fa-heart text-red-500' : 'far fa-heart'} mr-1`}></i>
              Wishlist
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <i className="fas fa-share-alt mr-1"></i>
              Share
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default ProductCard;
