import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.items.some(item => item.id === action.payload.id)) {
        return state;
      }
      return { ...state, items: [...state.items, { ...action.payload, addedAt: new Date().toISOString() }] };
      
    case 'REMOVE_FROM_WISHLIST':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
      
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] };
      
    case 'LOAD_WISHLIST':
      return { ...state, items: action.payload };
      
    default:
      return state;
  }
};

const initialState = { items: [] };

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const isInitialized = useRef(false);
  
  // Load wishlist from localStorage only once
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    try {
      const savedWishlist = localStorage.getItem('amazon-wishlist');
      if (savedWishlist) {
        dispatch({ type: 'LOAD_WISHLIST', payload: JSON.parse(savedWishlist) });
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);
  
  // Debounced save to localStorage
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('amazon-wishlist', JSON.stringify(state.items));
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [state.items]);
  
  const addToWishlist = useCallback((product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
  }, []);
  
  const removeFromWishlist = useCallback((productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  }, []);
  
  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  }, []);
  
  const isInWishlist = useCallback((productId) => {
    return state.items.some(item => item.id === productId);
  }, [state.items]);
  
  const getWishlistItemCount = useCallback(() => state.items.length, [state.items]);
  
  const toggleWishlist = useCallback((product) => {
    if (state.items.some(item => item.id === product.id)) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
      return false;
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
      return true;
    }
  }, [state.items]);
  
  const value = useMemo(() => ({
    wishlistItems: state.items,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItemCount,
    toggleWishlist
  }), [state.items, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist, getWishlistItemCount, toggleWishlist]);
  
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};