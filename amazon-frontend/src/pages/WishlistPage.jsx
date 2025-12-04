import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard/ProductCard';

const WishlistPage = () => {
  const { wishlistItems, clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const handleAddAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart(item);
    });
    // Optional: Clear wishlist after adding all to cart
    // clearWishlist();
  };
  
  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };
  
  if (wishlistItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-6">
              <i className="far fa-heart text-8xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Save items you love by clicking the heart icon on any product
            </p>
            <Link
              to="/products"
              className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black py-3 px-8 rounded-lg font-medium text-lg transition-colors duration-200 inline-block"
            >
              Start Shopping
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
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        
        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddAllToCart}
                className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Add All to Cart
              </button>
              <button
                onClick={clearWishlist}
                className="border border-red-300 text-red-600 hover:bg-red-50 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-trash mr-2"></i>
                Clear Wishlist
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-share-alt"></i>
              <span>Share your wishlist with friends</span>
            </div>
          </div>
        </div>
        
        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="group relative">
              {/* Date Added */}
              <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
                Added {new Date(product.addedAt).toLocaleDateString()}
              </div>
              
              {/* Move to Cart Button */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black p-2 rounded-full shadow-lg transition-colors"
                  title="Move to Cart"
                >
                  <i className="fas fa-shopping-cart text-sm"></i>
                </button>
              </div>
              
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {/* Recommendations */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-center py-8">
              <i className="fas fa-lightbulb text-3xl text-gray-400 mb-4 block"></i>
              Recommendations will appear here based on your wishlist items
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WishlistPage;