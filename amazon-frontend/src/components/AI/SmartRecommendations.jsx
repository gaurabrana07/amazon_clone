import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecommendations, useRecommendationAnalytics } from '../../hooks/useRecommendations';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  SparklesIcon,
  FireIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const SmartRecommendations = ({ 
  type = 'personal', // 'personal', 'trending', 'related', 'crossSell'
  title = '',
  productId = null,
  cartItems = [],
  limit = 8,
  showReason = true,
  className = ''
}) => {
  const { 
    recommendations, 
    trackBehavior, 
    getPersonalRecommendations,
    getTrendingRecommendations,
    getRelatedProducts,
    getCrossSellRecommendations
  } = useRecommendations();
  
  const { trackRecommendationView, trackRecommendationClick } = useRecommendationAnalytics();
  const { addToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get appropriate title and icon based on type
  const getTypeConfig = () => {
    const configs = {
      personal: {
        title: title || 'Recommended for You',
        icon: SparklesIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      trending: {
        title: title || 'Trending Now',
        icon: FireIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      related: {
        title: title || 'Related Products',
        icon: LightBulbIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      crossSell: {
        title: title || 'Frequently Bought Together',
        icon: ShoppingCartIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    };
    return configs[type] || configs.personal;
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  // Load recommendations based on type
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        let recs = [];
        
        switch (type) {
          case 'personal':
            recs = await getPersonalRecommendations(limit);
            break;
          case 'trending':
            recs = getTrendingRecommendations(limit);
            break;
          case 'related':
            if (productId) {
              recs = getRelatedProducts(productId, limit);
            }
            break;
          case 'crossSell':
            if (cartItems.length) {
              recs = getCrossSellRecommendations(cartItems, limit);
            }
            break;
          default:
            recs = recommendations.personal.slice(0, limit);
        }
        
        setDisplayProducts(recs);
        
        // Track recommendation view
        if (recs.length > 0) {
          trackRecommendationView(type, recs.map(r => r.product.id));
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [type, productId, cartItems, limit, getPersonalRecommendations, getTrendingRecommendations, getRelatedProducts, getCrossSellRecommendations, trackRecommendationView]);

  // Handle product click
  const handleProductClick = (product) => {
    trackBehavior('view', product.id.toString());
    trackRecommendationClick(type, product.id);
  };

  // Handle add to cart
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    trackBehavior('cart', product.id.toString());
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isProductInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isProductInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
      trackBehavior('wishlist', product.id.toString());
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Render star rating
  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!displayProducts.length) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
            <IconComponent className={`h-5 w-5 ${typeConfig.color}`} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {typeConfig.title}
          </h2>
        </div>
        
        {type === 'personal' && (
          <div className="text-sm text-gray-500">
            Powered by AI
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {displayProducts.map((recommendation, index) => {
          const { product, reason } = recommendation;
          const inWishlist = isInWishlist(product.id);
          
          return (
            <Link
              key={`${product.id}-${index}`}
              to={`/product/${product.id}`}
              onClick={() => handleProductClick(product)}
              className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              {/* Product Image */}
              <div className="aspect-square relative mb-3 overflow-hidden rounded-md">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Wishlist Button */}
                <button
                  onClick={(e) => handleWishlistToggle(e, product)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
                >
                  {inWishlist ? (
                    <HeartSolidIcon className="h-4 w-4 text-red-500" />
                  ) : (
                    <HeartIcon className="h-4 w-4 text-gray-600" />
                  )}
                </button>

                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center">
                    {renderRating(product.rating)}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* AI Recommendation Reason */}
                {showReason && reason && (
                  <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    💡 {reason}
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-full mt-2 bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View More Link */}
      {displayProducts.length >= limit && (
        <div className="text-center mt-6">
          <Link
            to={`/recommendations/${type}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View More Recommendations →
          </Link>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;