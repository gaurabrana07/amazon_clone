import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';

const RecommendationContext = createContext();

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendation must be used within a RecommendationProvider');
  }
  return context;
};

export const RecommendationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { products } = useProducts();

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoading] = useState(false);
  const isInitialized = useRef(false);

  // Load recently viewed on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    try {
      const saved = localStorage.getItem(`recentlyViewed_${user?.id || 'guest'}`);
      if (saved) {
        setRecentlyViewed(JSON.parse(saved).slice(0, 10));
      }
    } catch (e) {
      console.warn('Error loading recently viewed:', e);
    }
  }, [user?.id]);

  // Simple trending products - memoized
  const trendingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
      .slice(0, 10);
  }, [products]);

  // Simple personalized recommendations based on recently viewed categories
  const personalizedRecommendations = useMemo(() => {
    if (recentlyViewed.length === 0) {
      return products.filter(p => p.rating >= 4.5).slice(0, 8);
    }
    
    const viewedCategories = [...new Set(recentlyViewed.map(p => p.category))];
    const viewedIds = new Set(recentlyViewed.map(p => p.id));
    
    return products
      .filter(p => viewedCategories.includes(p.category) && !viewedIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [products, recentlyViewed]);

  // Get similar products - memoized callback
  const getSimilarProducts = useCallback((productId, limit = 6) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return [];
    
    return products
      .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }, [products]);

  // Get frequently bought together - simple version
  const getFrequentlyBoughtTogether = useCallback((productId, limit = 3) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return [];
    
    return products
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, limit);
  }, [products]);

  // Add to recently viewed - with debounced save
  const addToRecentlyViewed = useCallback((product) => {
    if (!product) return;
    
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10);
      
      // Debounced save
      setTimeout(() => {
        try {
          localStorage.setItem(`recentlyViewed_${user?.id || 'guest'}`, JSON.stringify(updated));
        } catch (e) {
          console.warn('Error saving recently viewed:', e);
        }
      }, 500);
      
      return updated;
    });
  }, [user?.id]);

  const getRecommendationsForCategory = useCallback((category, limit = 10) => {
    return products
      .filter(p => p.category === category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }, [products]);

  const refreshRecommendations = useCallback(() => {
    // No-op in simplified version
  }, []);

  const value = useMemo(() => ({
    personalizedRecommendations,
    trendingProducts,
    recentlyViewed,
    userPreferences: {},
    getSimilarProducts,
    getFrequentlyBoughtTogether,
    getRecommendationsForCategory,
    getRecommendationsByType: () => personalizedRecommendations,
    addToRecentlyViewed,
    refreshRecommendations,
    isLoading
  }), [
    personalizedRecommendations, trendingProducts, recentlyViewed,
    getSimilarProducts, getFrequentlyBoughtTogether, getRecommendationsForCategory,
    addToRecentlyViewed, refreshRecommendations, isLoading
  ]);

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

export default RecommendationContext;
