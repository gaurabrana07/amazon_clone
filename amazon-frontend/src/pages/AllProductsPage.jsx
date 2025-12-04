import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';
import { IMAGE_CONFIG, PRODUCT_IMAGE_COLLECTIONS } from '../config/imageConfig';
import './AllProductsPage.css';

const AllProductsPage = () => {
  const { products } = useProducts();
  const { trackPageView, trackUserInteraction } = useAdvancedAnalytics();
  
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    rating: 'all',
    brand: 'all',
    sortBy: 'relevance'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const productsPerPage = 20;

  useEffect(() => {
    trackPageView('/products');
  }, [trackPageView]);

  // Generate comprehensive product catalog
  const generateAllProducts = () => {
    const categories = ['electronics', 'fashion', 'home', 'gaming', 'health', 'automotive'];
    const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'IKEA', 'LG', 'Dell', 'HP', 'Canon'];
    const allProducts = [];

    categories.forEach((category, catIndex) => {
      const categoryImages = PRODUCT_IMAGE_COLLECTIONS[category] || PRODUCT_IMAGE_COLLECTIONS.electronics;
      
      // Generate products for each category
      for (let i = 0; i < 50; i++) {
        const productId = `${category}-${i}`;
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const basePrice = Math.floor(Math.random() * 50000) + 500;
        const discount = Math.random() * 0.5; // Up to 50% discount
        const originalPrice = Math.floor(basePrice / (1 - discount));
        
        allProducts.push({
          id: productId,
          name: generateProductName(category, i, brand),
          brand: brand,
          category: category,
          price: basePrice,
          originalPrice: originalPrice > basePrice ? originalPrice : null,
          rating: +(3 + Math.random() * 2).toFixed(1), // 3.0 - 5.0
          reviews: Math.floor(Math.random() * 5000) + 10,
          image: categoryImages[i % categoryImages.length],
          inStock: Math.random() > 0.1, // 90% in stock
          isSponsored: Math.random() > 0.9, // 10% sponsored
          isBestseller: Math.random() > 0.8, // 20% bestseller
          freeShipping: Math.random() > 0.3, // 70% free shipping
          fastDelivery: Math.random() > 0.5, // 50% fast delivery
          description: generateProductDescription(category),
          features: generateProductFeatures(category),
          warranty: generateWarranty(category)
        });
      }
    });

    return allProducts;
  };

  const generateProductName = (category, index, brand) => {
    const names = {
      electronics: [
        `${brand} Smartphone Pro`,
        `${brand} Wireless Headphones`,
        `${brand} 4K Smart TV`,
        `${brand} Gaming Laptop`,
        `${brand} Tablet Pro`,
        `${brand} Smartwatch`,
        `${brand} Bluetooth Speaker`,
        `${brand} Digital Camera`,
        `${brand} Gaming Monitor`,
        `${brand} Wireless Earbuds`
      ],
      fashion: [
        `${brand} Premium T-Shirt`,
        `${brand} Slim Fit Jeans`,
        `${brand} Running Shoes`,
        `${brand} Casual Jacket`,
        `${brand} Summer Dress`,
        `${brand} Leather Wallet`,
        `${brand} Sports Watch`,
        `${brand} Designer Bag`,
        `${brand} Sunglasses`,
        `${brand} Winter Coat`
      ],
      home: [
        `${brand} Comfortable Sofa`,
        `${brand} Dining Table`,
        `${brand} Office Chair`,
        `${brand} LED Lamp`,
        `${brand} Cookware Set`,
        `${brand} Bedsheet Set`,
        `${brand} Storage Cabinet`,
        `${brand} Wall Art`,
        `${brand} Plant Pot`,
        `${brand} Mirror`
      ],
      gaming: [
        `${brand} Gaming Console`,
        `${brand} Mechanical Keyboard`,
        `${brand} Gaming Mouse`,
        `${brand} VR Headset`,
        `${brand} Gaming Chair`,
        `${brand} Controller`,
        `${brand} Gaming Headset`,
        `${brand} Graphics Card`,
        `${brand} Gaming Desk`,
        `${brand} Racing Wheel`
      ],
      health: [
        `${brand} Fitness Tracker`,
        `${brand} Yoga Mat`,
        `${brand} Protein Powder`,
        `${brand} Resistance Bands`,
        `${brand} Dumbbells`,
        `${brand} Vitamins`,
        `${brand} Face Cream`,
        `${brand} Shampoo`,
        `${brand} Supplements`,
        `${brand} Massage Gun`
      ],
      automotive: [
        `${brand} Car Charger`,
        `${brand} Dash Cam`,
        `${brand} Car Cover`,
        `${brand} Tire Pump`,
        `${brand} Car Vacuum`,
        `${brand} Phone Mount`,
        `${brand} Car Perfume`,
        `${brand} Jump Starter`,
        `${brand} Car Tools`,
        `${brand} Floor Mats`
      ]
    };

    const categoryNames = names[category] || names.electronics;
    return categoryNames[index % categoryNames.length];
  };

  const generateProductDescription = (category) => {
    const descriptions = {
      electronics: "High-quality electronics with latest technology and premium build quality.",
      fashion: "Stylish and comfortable fashion items made from premium materials.",
      home: "Beautiful home essentials that combine functionality with modern design.",
      gaming: "Professional gaming gear for the ultimate gaming experience.",
      health: "Health and wellness products to support your active lifestyle.",
      automotive: "Reliable automotive accessories for your vehicle needs."
    };
    return descriptions[category] || descriptions.electronics;
  };

  const generateProductFeatures = (category) => {
    const features = {
      electronics: ["High Performance", "Energy Efficient", "Latest Technology", "Premium Build"],
      fashion: ["Comfortable Fit", "Premium Material", "Trendy Design", "Durable"],
      home: ["Modern Design", "High Quality", "Easy Assembly", "Space Saving"],
      gaming: ["High Performance", "RGB Lighting", "Ergonomic Design", "Professional Grade"],
      health: ["Natural Ingredients", "FDA Approved", "Clinically Tested", "Safe to Use"],
      automotive: ["Universal Fit", "Weather Resistant", "Easy Installation", "Durable Material"]
    };
    return features[category] || features.electronics;
  };

  const generateWarranty = (category) => {
    const warranties = {
      electronics: "2 Year Warranty",
      fashion: "6 Month Warranty",
      home: "1 Year Warranty",
      gaming: "3 Year Warranty",
      health: "No Warranty",
      automotive: "1 Year Warranty"
    };
    return warranties[category] || "1 Year Warranty";
  };

  const allProducts = useMemo(() => generateAllProducts(), []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const ranges = {
        'under-1000': [0, 1000],
        '1000-5000': [1000, 5000],
        '5000-10000': [5000, 10000],
        '10000-25000': [10000, 25000],
        'above-25000': [25000, Infinity]
      };
      const [min, max] = ranges[filters.priceRange];
      filtered = filtered.filter(product => product.price >= min && product.price <= max);
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(product => product.rating >= minRating);
    }

    // Brand filter
    if (filters.brand !== 'all') {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Assume newer products have higher IDs
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popularity':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [allProducts, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filters change
    trackUserInteraction('filter_change', 'products_page', { filterType, value });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackUserInteraction('page_change', 'products_page', { page });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
  const categories = [
    { id: 'all', name: 'All Categories', icon: 'fas fa-th-large' },
    { id: 'electronics', name: 'Electronics', icon: 'fas fa-laptop' },
    { id: 'fashion', name: 'Fashion', icon: 'fas fa-tshirt' },
    { id: 'home', name: 'Home & Garden', icon: 'fas fa-home' },
    { id: 'gaming', name: 'Gaming', icon: 'fas fa-gamepad' },
    { id: 'health', name: 'Health & Beauty', icon: 'fas fa-heart' },
    { id: 'automotive', name: 'Automotive', icon: 'fas fa-car' }
  ];

  return (
    <div className="all-products-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <h1>🛍️ All Products</h1>
              <p>Discover our complete catalog of {allProducts.length.toLocaleString()}+ products</p>
            </div>
            <div className="header-controls">
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle md:hidden"
              >
                <i className="fas fa-filter"></i>
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="container">
          <div className="content-layout">
            {/* Sidebar Filters */}
            <div className={`sidebar ${showFilters ? 'show' : ''}`}>
              <div className="sidebar-header">
                <h3>Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="close-filters md:hidden"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="filter-sections">
                {/* Category Filter */}
                <div className="filter-section">
                  <h4>Category</h4>
                  <div className="filter-options">
                    {categories.map(category => (
                      <label key={category.id} className="filter-option">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={filters.category === category.id}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                        />
                        <span className="filter-label">
                          <i className={category.icon}></i>
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="filter-section">
                  <h4>Price Range</h4>
                  <div className="filter-options">
                    {[
                      { id: 'all', name: 'All Prices' },
                      { id: 'under-1000', name: 'Under ₹1,000' },
                      { id: '1000-5000', name: '₹1,000 - ₹5,000' },
                      { id: '5000-10000', name: '₹5,000 - ₹10,000' },
                      { id: '10000-25000', name: '₹10,000 - ₹25,000' },
                      { id: 'above-25000', name: 'Above ₹25,000' }
                    ].map(range => (
                      <label key={range.id} className="filter-option">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.id}
                          checked={filters.priceRange === range.id}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                        />
                        <span className="filter-label">{range.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="filter-section">
                  <h4>Customer Rating</h4>
                  <div className="filter-options">
                    {[
                      { id: 'all', name: 'All Ratings' },
                      { id: '4', name: '4★ & above' },
                      { id: '3', name: '3★ & above' },
                      { id: '2', name: '2★ & above' }
                    ].map(rating => (
                      <label key={rating.id} className="filter-option">
                        <input
                          type="radio"
                          name="rating"
                          value={rating.id}
                          checked={filters.rating === rating.id}
                          onChange={(e) => handleFilterChange('rating', e.target.value)}
                        />
                        <span className="filter-label">{rating.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="filter-section">
                  <h4>Brand</h4>
                  <div className="filter-options">
                    <label className="filter-option">
                      <input
                        type="radio"
                        name="brand"
                        value="all"
                        checked={filters.brand === 'all'}
                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                      />
                      <span className="filter-label">All Brands</span>
                    </label>
                    {uniqueBrands.slice(0, 10).map(brand => (
                      <label key={brand} className="filter-option">
                        <input
                          type="radio"
                          name="brand"
                          value={brand}
                          checked={filters.brand === brand}
                          onChange={(e) => handleFilterChange('brand', e.target.value)}
                        />
                        <span className="filter-label">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Products Area */}
            <div className="products-area">
              {/* Results Header */}
              <div className="results-header">
                <div className="results-info">
                  <span className="results-count">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length.toLocaleString()} results
                  </span>
                </div>
                <div className="sort-controls">
                  <label>Sort by:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="sort-select"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="popularity">Popularity</option>
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {currentProducts.length > 0 ? (
                <div className={`products-container ${viewMode}`}>
                  {currentProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={viewMode === 'list' ? 'list' : 'default'}
                      className="product-item"
                    />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <div className="no-products-content">
                    <i className="fas fa-search text-6xl text-gray-400 mb-4"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search criteria.</p>
                    <button
                      onClick={() => setFilters({
                        category: 'all',
                        priceRange: 'all',
                        rating: 'all',
                        brand: 'all',
                        sortBy: 'relevance'
                      })}
                      className="reset-filters-btn"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i>
                    Previous
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div
          className="filters-overlay md:hidden"
          onClick={() => setShowFilters(false)}
        ></div>
      )}
    </div>
  );
};

export default AllProductsPage;