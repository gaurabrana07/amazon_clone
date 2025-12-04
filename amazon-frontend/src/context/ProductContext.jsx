import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const ProductContext = createContext();

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: "Sony PlayStation 5 Console",
    price: 49990,
    originalPrice: 54990,
    discount: 9,
    rating: 4.8,
    reviews: 15420,
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
    category: "gaming",
    brand: "Sony",
    description: "Experience lightning-fast loading with an ultra-high speed SSD.",
    features: ["Ultra-high speed SSD", "Haptic feedback", "Adaptive triggers"],
    inStock: true,
    freeShipping: true,
    isPrime: true,
    tags: ["gaming", "console", "4K"]
  },
  {
    id: 2,
    name: "Apple MacBook Air M2",
    price: 119900,
    originalPrice: 134900,
    discount: 11,
    rating: 4.9,
    reviews: 8750,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    category: "electronics",
    brand: "Apple",
    description: "Supercharged by M2 chip with incredible performance.",
    features: ["M2 Chip", "18-hour battery", "Liquid Retina display"],
    inStock: true,
    freeShipping: true,
    isPrime: true,
    tags: ["laptop", "apple", "m2"]
  },
  {
    id: 3,
    name: "Samsung Galaxy S24 Ultra",
    price: 124999,
    originalPrice: 129999,
    discount: 4,
    rating: 4.7,
    reviews: 12380,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    category: "electronics",
    brand: "Samsung",
    description: "Meet Galaxy S24 Ultra with S Pen and nightography camera.",
    features: ["S Pen included", "200MP camera", "5000mAh battery"],
    inStock: true,
    freeShipping: true,
    isPrime: true,
    tags: ["smartphone", "samsung", "camera"]
  },
  {
    id: 4,
    name: "Nike Air Force 1 '07",
    price: 7495,
    originalPrice: 8295,
    discount: 10,
    rating: 4.6,
    reviews: 23450,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
    category: "fashion",
    brand: "Nike",
    description: "The classic Nike Air Force 1 basketball sneakers.",
    features: ["Leather upper", "Air-Sole unit", "Rubber outsole"],
    inStock: true,
    freeShipping: true,
    isPrime: false,
    tags: ["shoes", "sneakers", "classic"]
  },
  {
    id: 5,
    name: "Levi's 501 Original Jeans",
    price: 4999,
    originalPrice: 5999,
    discount: 17,
    rating: 4.5,
    reviews: 18960,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop",
    category: "fashion",
    brand: "Levi's",
    description: "The original blue jean since 1873.",
    features: ["100% Cotton", "Button fly", "Straight fit"],
    inStock: true,
    freeShipping: false,
    tags: ["jeans", "denim"]
  },
  {
    id: 6,
    name: "Instant Pot Duo 7-in-1",
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    rating: 4.8,
    reviews: 45670,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "home-kitchen",
    brand: "Instant Pot",
    description: "7 appliances in 1: Pressure cooker, slow cooker and more.",
    features: ["7-in-1 functionality", "6-quart capacity", "10+ safety features"],
    inStock: true,
    freeShipping: true,
    tags: ["kitchen", "cooking"]
  },
  {
    id: 7,
    name: "Dyson V15 Detect Absolute",
    price: 54999,
    originalPrice: 64999,
    discount: 15,
    rating: 4.7,
    reviews: 8920,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    category: "home-kitchen",
    brand: "Dyson",
    description: "Dyson's most powerful cordless vacuum.",
    features: ["Laser dust detection", "60 minutes run time"],
    inStock: true,
    freeShipping: true,
    tags: ["vacuum", "cleaning"]
  },
  {
    id: 8,
    name: "Peloton Bike+",
    price: 245000,
    originalPrice: 269000,
    discount: 9,
    rating: 4.8,
    reviews: 12340,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    category: "sports",
    brand: "Peloton",
    description: "Premium exercise bike with immersive classes.",
    features: ["24\" HD touchscreen", "Auto-follow resistance"],
    inStock: true,
    freeShipping: true,
    tags: ["fitness", "cycling"]
  },
  {
    id: 9,
    name: "Whey Protein Powder",
    price: 2999,
    originalPrice: 3999,
    discount: 25,
    rating: 4.4,
    reviews: 34560,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop",
    category: "health",
    brand: "Optimum Nutrition",
    description: "Gold Standard 100% Whey with 24g protein.",
    features: ["24g protein per serving", "5.5g BCAAs"],
    inStock: true,
    freeShipping: false,
    tags: ["protein", "supplement"]
  },
  {
    id: 10,
    name: "LEGO Creator 3-in-1",
    price: 1299,
    originalPrice: 1599,
    discount: 19,
    rating: 4.9,
    reviews: 5670,
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop",
    category: "toys",
    brand: "LEGO",
    description: "Build a shark, squid or angler fish.",
    features: ["3 models in 1", "230 pieces", "Ages 7+"],
    inStock: true,
    freeShipping: false,
    tags: ["lego", "toys"]
  },
  {
    id: 11,
    name: "Baby Stroller Travel System",
    price: 24999,
    originalPrice: 32999,
    discount: 24,
    rating: 4.6,
    reviews: 8930,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    category: "baby",
    brand: "Chicco",
    description: "Complete travel system with stroller and car seat.",
    features: ["3-in-1 system", "Safety certified"],
    inStock: true,
    freeShipping: true,
    tags: ["baby", "stroller"]
  },
  {
    id: 12,
    name: "Bosch Professional Drill Set",
    price: 12999,
    originalPrice: 15999,
    discount: 19,
    rating: 4.7,
    reviews: 15670,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    category: "tools",
    brand: "Bosch",
    description: "Professional 18V cordless drill with 63-piece set.",
    features: ["18V lithium battery", "63-piece set"],
    inStock: true,
    freeShipping: true,
    tags: ["tools", "drill"]
  }
];

export const ProductProvider = ({ children }) => {
  const [products] = useState(sampleProducts);
  const [loading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: 300000 },
    rating: 0,
    brand: 'all',
    inStock: false,
    freeShipping: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  
  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
    );
    
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }
    
    if (filters.brand !== 'all') {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }
    
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }
    
    if (filters.freeShipping) {
      filtered = filtered.filter(product => product.freeShipping);
    }
    
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [products, searchQuery, filters, sortBy]);
  
  const getFilteredProducts = useCallback(() => filteredProducts, [filteredProducts]);
  
  const getProductsByCategory = useCallback((category) => {
    return products.filter(product => product.category === category);
  }, [products]);
  
  const getProductById = useCallback((id) => {
    return products.find(product => product.id === parseInt(id));
  }, [products]);
  
  const bestSellers = useMemo(() => {
    return [...products].sort((a, b) => b.rating - a.rating);
  }, [products]);
  
  const getBestSellers = useCallback((limit = 20) => bestSellers.slice(0, limit), [bestSellers]);
  
  const deals = useMemo(() => {
    return [...products].filter(p => p.discount > 10).sort((a, b) => b.discount - a.discount);
  }, [products]);
  
  const getDeals = useCallback((limit = 20) => deals.slice(0, limit), [deals]);
  
  const featuredProducts = useMemo(() => products.filter(p => p.rating >= 4.5), [products]);
  
  const getFeaturedProducts = useCallback((limit = 8) => featuredProducts.slice(0, limit), [featuredProducts]);
  
  const getRelatedProducts = useCallback((productId, limit = 6) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
      .slice(0, limit);
  }, [products]);
  
  const getFrequentlyBoughtTogether = useCallback((productId, limit = 3) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return [];
    return products.filter(p => p.id !== product.id && p.category === product.category).slice(0, limit);
  }, [products]);
  
  const getProductVariant = useCallback((productId, variantId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product?.variants?.find(v => v.id === variantId) || null;
  }, [products]);
  
  const checkStockAvailability = useCallback((productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return { available: false, message: 'Product not found' };
    return product.inStock ? { available: true, message: 'In stock' } : { available: false, message: 'Out of stock' };
  }, [products]);
  
  const getVariantPrice = useCallback((productId, variantId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return null;
    if (variantId && product.variants) {
      return product.variants.find(v => v.id === variantId)?.price || product.price;
    }
    return product.price;
  }, [products]);
  
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      priceRange: { min: 0, max: 300000 },
      rating: 0,
      brand: 'all',
      inStock: false,
      freeShipping: false
    });
  }, []);
  
  const value = useMemo(() => ({
    products,
    loading,
    filters,
    searchQuery,
    sortBy,
    getFilteredProducts,
    getProductsByCategory,
    getProductById,
    getBestSellers,
    getDeals,
    getFeaturedProducts,
    getRelatedProducts,
    getFrequentlyBoughtTogether,
    getProductVariant,
    checkStockAvailability,
    getVariantPrice,
    updateFilters,
    resetFilters,
    setSearchQuery,
    setSortBy
  }), [
    products, loading, filters, searchQuery, sortBy,
    getFilteredProducts, getProductsByCategory, getProductById,
    getBestSellers, getDeals, getFeaturedProducts,
    getRelatedProducts, getFrequentlyBoughtTogether,
    getProductVariant, checkStockAvailability, getVariantPrice,
    updateFilters, resetFilters
  ]);
  
  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;
