import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import recommendationEngine from '../services/recommendationEngine';

// Custom hook for AI-powered recommendations - OPTIMIZED
export const useRecommendations = () => {
  const { user, isAuthenticated } = useAuth();
  const { products } = useProducts();
  const [recommendations, setRecommendations] = useState({
    personal: [],
    trending: [],
    related: [],
    crossSell: [],
    loading: false,
    error: null
  });
  
  // Prevent multiple loads
  const hasLoaded = useRef(false);

  // Track user behavior - throttled
  const trackBehavior = useCallback((action, productId, metadata = {}) => {
    const userId = isAuthenticated && user?.id ? user.id : 'anonymous';
    recommendationEngine.trackUserBehavior(userId, action, productId, metadata);
  }, [isAuthenticated, user?.id]);

  // Get personalized recommendations
  const getPersonalRecommendations = useCallback((limit = 10) => {
    if (!products.length) return [];
    const userId = isAuthenticated && user?.id ? user.id : 'anonymous';
    return recommendationEngine.getHybridRecommendations(userId, products, limit);
  }, [products, isAuthenticated, user?.id]);

  // Get trending recommendations
  const getTrendingRecommendations = useCallback((limit = 10) => {
    if (!products.length) return [];
    return recommendationEngine.getTrendingRecommendations(products, limit);
  }, [products]);

  // Get related products for a specific product
  const getRelatedProducts = useCallback((productId, limit = 4) => {
    if (!products.length) return [];
    return recommendationEngine.getRelatedProducts(productId, products, limit);
  }, [products]);

  // Get cross-sell recommendations for cart
  const getCrossSellRecommendations = useCallback((cartItems, limit = 6) => {
    if (!products.length || !cartItems.length) return [];
    return recommendationEngine.getCrossSellRecommendations(cartItems, products, limit);
  }, [products]);

  // Load initial recommendations - only once when products are available
  useEffect(() => {
    if (!products.length || hasLoaded.current) return;
    hasLoaded.current = true;

    setRecommendations(prev => ({ ...prev, loading: true }));
    
    // Defer to avoid blocking render
    const timer = setTimeout(() => {
      try {
        const personal = getPersonalRecommendations(12);
        const trending = getTrendingRecommendations(8);
        setRecommendations({
          personal,
          trending,
          related: [],
          crossSell: [],
          loading: false,
          error: null
        });
      } catch (error) {
        setRecommendations(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [products.length, getPersonalRecommendations, getTrendingRecommendations]);

  const refreshRecommendations = useCallback(() => {
    if (products.length) {
      const personal = getPersonalRecommendations(12);
      setRecommendations(prev => ({ ...prev, personal }));
    }
  }, [products.length, getPersonalRecommendations]);

  return useMemo(() => ({
    recommendations,
    trackBehavior,
    getPersonalRecommendations,
    getTrendingRecommendations,
    getRelatedProducts,
    getCrossSellRecommendations,
    refreshRecommendations
  }), [recommendations, trackBehavior, getPersonalRecommendations, getTrendingRecommendations, getRelatedProducts, getCrossSellRecommendations, refreshRecommendations]);
};

// Simplified hook for recommendation analytics
export const useRecommendationAnalytics = () => {
  // No-op analytics to avoid localStorage thrashing
  const trackRecommendationView = useCallback(() => {}, []);
  const trackRecommendationClick = useCallback(() => {}, []);
  const trackRecommendationPurchase = useCallback(() => {}, []);

  return {
    analytics: {
      clickThroughRate: 0,
      conversionRate: 0,
      recommendationViews: 0,
      recommendationClicks: 0,
      recommendationPurchases: 0
    },
    trackRecommendationView,
    trackRecommendationClick,
    trackRecommendationPurchase
  };
};