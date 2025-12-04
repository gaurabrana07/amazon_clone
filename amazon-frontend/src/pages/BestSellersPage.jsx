import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';
import { IMAGE_CONFIG, PRODUCT_IMAGE_COLLECTIONS } from '../config/imageConfig';
import './BestSellersPage.css';

const BestSellersPage = () => {
  const { products } = useProducts();
  const { trackPageView, trackUserInteraction } = useAdvancedAnalytics();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    trackPageView('/bestsellers');
  }, [trackPageView]);

  // Generate best sellers with mock data
  const generateBestSellers = () => {
    const bestSellerCategories = {
      all: products.slice(0, 20).map((product, index) => ({
        ...product,
        id: `bs-${product.id || index}`,
        isBestseller: true,
        bestseller_rank: index + 1,
        sales_count: Math.floor(Math.random() * 10000) + 5000,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0 rating
        reviews: Math.floor(Math.random() * 5000) + 1000,
        originalPrice: product.price * (1 + Math.random() * 0.5), // Add original price for discount
        image: getProductImageByCategory(product.category || 'electronics', index),
        badge: index < 3 ? `#${index + 1} Best Seller` : 'Best Seller'
      })),
      electronics: products.slice(0, 8).map((product, index) => ({
        ...product,
        id: `bs-elec-${index}`,
        category: 'electronics',
        name: [
          'iPhone 15 Pro Max',
          'Samsung Galaxy S24 Ultra',
          'MacBook Pro 14"',
          'Dell XPS 13',
          'AirPods Pro 2',
          'Sony WH-1000XM5',
          'iPad Air 5',
          'Nintendo Switch OLED'
        ][index],
        price: [89999, 124999, 199999, 89999, 24900, 29990, 54900, 29999][index],
        image: IMAGE_CONFIG.PRODUCTS[['smartphone', 'smartphone', 'laptop', 'laptop', 'headphones', 'headphones', 'tablet', 'console'][index]],
        bestseller_rank: index + 1,
        sales_count: Math.floor(Math.random() * 8000) + 3000,
        rating: (4 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 3000) + 500
      })),
      fashion: products.slice(0, 8).map((product, index) => ({
        ...product,
        id: `bs-fashion-${index}`,
        category: 'fashion',
        name: [
          'Premium Cotton T-Shirt',
          'Slim Fit Jeans',
          'Casual Summer Dress',
          'Leather Jacket',
          'Running Shoes',
          'Designer Watch',
          'Leather Handbag',
          'Aviator Sunglasses'
        ][index],
        price: [799, 1999, 2499, 4999, 3499, 12999, 5999, 1499][index],
        image: IMAGE_CONFIG.PRODUCTS[['tshirt', 'jeans', 'dress', 'jacket', 'shoes', 'watch', 'bag', 'sunglasses'][index]],
        bestseller_rank: index + 1,
        sales_count: Math.floor(Math.random() * 5000) + 2000,
        rating: (4 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 2000) + 300
      })),
      home: products.slice(0, 8).map((product, index) => ({
        ...product,
        id: `bs-home-${index}`,
        category: 'home',
        name: [
          'Comfortable Sofa Set',
          'Queen Size Bed',
          'Ergonomic Office Chair',
          'Dining Table Set',
          'LED Table Lamp',
          'Non-stick Cookware Set',
          'Stainless Steel Cookware',
          'Modern Wall Art'
        ][index],
        price: [25999, 18999, 8999, 15999, 2499, 3999, 5999, 1999][index],
        image: IMAGE_CONFIG.PRODUCTS[['sofa', 'bed', 'chair', 'table', 'lamp', 'kitchenware', 'cookware', 'decor'][index]],
        bestseller_rank: index + 1,
        sales_count: Math.floor(Math.random() * 3000) + 1000,
        rating: (4 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 1500) + 200
      })),
      gaming: products.slice(0, 6).map((product, index) => ({
        ...product,
        id: `bs-gaming-${index}`,
        category: 'gaming',
        name: [
          'PlayStation 5 Console',
          'Xbox Series X',
          'Gaming Mechanical Keyboard',
          'Gaming Mouse',
          'Gaming Headset',
          'Gaming Chair'
        ][index],
        price: [49999, 49999, 8999, 4999, 6999, 18999][index],
        image: IMAGE_CONFIG.PRODUCTS[['console', 'console', 'controller', 'controller', 'headphones', 'gamingchair'][index]],
        bestseller_rank: index + 1,
        sales_count: Math.floor(Math.random() * 2000) + 500,
        rating: (4.2 + Math.random() * 0.8).toFixed(1),
        reviews: Math.floor(Math.random() * 1000) + 100
      }))
    };

    return bestSellerCategories[selectedCategory] || bestSellerCategories.all;
  };

  const getProductImageByCategory = (category, index) => {
    const categoryKey = category?.toLowerCase() || 'electronics';
    const categoryImages = {
      electronics: [
        IMAGE_CONFIG.PRODUCTS.laptop,
        IMAGE_CONFIG.PRODUCTS.smartphone,
        IMAGE_CONFIG.PRODUCTS.headphones,
        IMAGE_CONFIG.PRODUCTS.camera,
        IMAGE_CONFIG.PRODUCTS.tablet
      ],
      fashion: [
        IMAGE_CONFIG.PRODUCTS.tshirt,
        IMAGE_CONFIG.PRODUCTS.jeans,
        IMAGE_CONFIG.PRODUCTS.dress,
        IMAGE_CONFIG.PRODUCTS.shoes,
        IMAGE_CONFIG.PRODUCTS.jacket
      ],
      home: [
        IMAGE_CONFIG.PRODUCTS.sofa,
        IMAGE_CONFIG.PRODUCTS.bed,
        IMAGE_CONFIG.PRODUCTS.chair,
        IMAGE_CONFIG.PRODUCTS.lamp,
        IMAGE_CONFIG.PRODUCTS.kitchenware
      ]
    };

    const images = categoryImages[categoryKey] || categoryImages.electronics;
    return images[index % images.length];
  };

  useEffect(() => {
    let filtered = generateBestSellers();

    // Sort products
    switch (sortBy) {
      case 'popularity':
        filtered = filtered.sort((a, b) => a.bestseller_rank - b.bestseller_rank);
        break;
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered = filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, sortBy, products]);

  const categories = [
    { id: 'all', name: 'All Categories', icon: 'fas fa-th-large' },
    { id: 'electronics', name: 'Electronics', icon: 'fas fa-laptop' },
    { id: 'fashion', name: 'Fashion', icon: 'fas fa-tshirt' },
    { id: 'home', name: 'Home & Garden', icon: 'fas fa-home' },
    { id: 'gaming', name: 'Gaming', icon: 'fas fa-gamepad' }
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    trackUserInteraction('category_filter', 'bestsellers_page', { category });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    trackUserInteraction('sort_change', 'bestsellers_page', { sortBy: sort });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bestsellers-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>🏆 Best Sellers</h1>
            <p>Discover the most popular products loved by millions of customers</p>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10M+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Products Sold</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.8★</span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="container">
          <div className="filters-header">
            <h2>Browse Best Sellers</h2>
            <div className="results-count">
              Showing {filteredProducts.length} best-selling products
            </div>
          </div>

          <div className="filters-controls">
            {/* Category Filter */}
            <div className="filter-group">
              <label>Category:</label>
              <div className="category-tabs">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                  >
                    <i className={category.icon}></i>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="filter-group">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        <div className="container">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="product-wrapper">
                  {product.bestseller_rank <= 3 && (
                    <div className={`rank-badge rank-${product.bestseller_rank}`}>
                      #{product.bestseller_rank}
                    </div>
                  )}
                  <ProductCard 
                    product={product} 
                    variant="bestseller"
                    className="bestseller-card"
                  />
                  <div className="bestseller-info">
                    <div className="sales-info">
                      <i className="fas fa-fire text-orange-500"></i>
                      <span>{product.sales_count?.toLocaleString()} sold</span>
                    </div>
                    <div className="rank-info">
                      <i className="fas fa-trophy text-yellow-500"></i>
                      <span>#{product.bestseller_rank} in {selectedCategory === 'all' ? 'All' : selectedCategory}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <div className="no-products-content">
                <i className="fas fa-search text-6xl text-gray-400 mb-4"></i>
                <h3>No best sellers found</h3>
                <p>Try selecting a different category or check back later.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Want to see more products?</h2>
            <p>Explore our complete catalog with thousands of products across all categories.</p>
            <Link to="/products" className="cta-button">
              <i className="fas fa-th-large mr-2"></i>
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellersPage;