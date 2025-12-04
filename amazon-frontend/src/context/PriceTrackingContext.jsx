import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const PriceTrackingContext = createContext();

export const usePriceTracking = () => {
  const context = useContext(PriceTrackingContext);
  if (!context) {
    throw new Error('usePriceTracking must be used within a PriceTrackingProvider');
  }
  return context;
};

// Lightweight Price Tracking Provider - no intervals
export const PriceTrackingProvider = ({ children }) => {
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const createPriceAlert = useCallback((productId, targetPrice) => {
    const alert = {
      id: Date.now(),
      productId,
      targetPrice,
      createdAt: new Date(),
      isActive: true
    };
    setPriceAlerts(prev => [...prev, alert]);
    return { success: true, alert };
  }, []);

  const deletePriceAlert = useCallback((alertId) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
    return { success: true };
  }, []);

  const getUserPriceAlerts = useCallback(() => priceAlerts, [priceAlerts]);
  const getActivePriceAlerts = useCallback(() => priceAlerts.filter(a => a.isActive), [priceAlerts]);

  const value = useMemo(() => ({
    priceAlerts,
    priceHistory: {},
    isLoading,
    createPriceAlert,
    updatePriceAlert: () => ({ success: true }),
    deletePriceAlert,
    getUserPriceAlerts,
    getActivePriceAlerts,
    getPriceHistory: () => null,
    getCurrentProductPrice: () => null,
    addPricePoint: () => {},
    checkPriceAlerts: () => {},
    getPriceDropDeals: () => [],
    calculatePriceTrend: () => 'stable',
    getPricePrediction: () => null
  }), [priceAlerts, isLoading, createPriceAlert, deletePriceAlert, getUserPriceAlerts, getActivePriceAlerts]);

  return (
    <PriceTrackingContext.Provider value={value}>
      {children}
    </PriceTrackingContext.Provider>
  );
};

export default PriceTrackingContext;
