import React, { createContext, useContext, useCallback, useMemo } from 'react';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  // Simple lightweight analytics - just track events without heavy processing
  const trackEvent = useCallback((eventType, eventData) => {
    // Minimal tracking - just console in dev, could send to backend in prod
    if (process.env.NODE_ENV === 'development') {
      console.debug('Analytics:', eventType, eventData);
    }
  }, []);

  const getPersonalizedRecommendations = useCallback(() => {
    return [];
  }, []);

  const getUserSegment = useCallback(() => {
    return 'general';
  }, []);

  const getProductInsights = useCallback(() => {
    return null;
  }, []);

  const getMarketTrends = useCallback(() => {
    return { trendingProducts: [], categoryTrends: {} };
  }, []);

  const value = useMemo(() => ({
    userBehavior: {},
    productAnalytics: {},
    personalizedData: {},
    isLoading: false,
    trackEvent,
    getPersonalizedRecommendations,
    getUserSegment,
    getProductInsights,
    getMarketTrends
  }), [trackEvent, getPersonalizedRecommendations, getUserSegment, getProductInsights, getMarketTrends]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContext;
