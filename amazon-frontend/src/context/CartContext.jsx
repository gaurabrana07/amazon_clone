import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';

const CartContext = createContext();

const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  TOGGLE_CART_SIDEBAR: 'TOGGLE_CART_SIDEBAR',
  OPEN_CART_SIDEBAR: 'OPEN_CART_SIDEBAR',
  CLOSE_CART_SIDEBAR: 'CLOSE_CART_SIDEBAR'
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...product, quantity }]
      };
    }
    
    case CART_ACTIONS.REMOVE_FROM_CART:
      return { ...state, items: state.items.filter(item => item.id !== action.payload.productId) };
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter(item => item.id !== productId) };
      }
      return {
        ...state,
        items: state.items.map(item => item.id === productId ? { ...item, quantity } : item)
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return { ...state, items: [] };
    
    case CART_ACTIONS.LOAD_CART:
      return { ...state, items: action.payload.items || [] };
    
    case CART_ACTIONS.TOGGLE_CART_SIDEBAR:
      return { ...state, isCartSidebarOpen: !state.isCartSidebarOpen };
    
    case CART_ACTIONS.OPEN_CART_SIDEBAR:
      return { ...state, isCartSidebarOpen: true };
    
    case CART_ACTIONS.CLOSE_CART_SIDEBAR:
      return { ...state, isCartSidebarOpen: false };
    
    default:
      return state;
  }
};

const initialCartState = { items: [], isCartSidebarOpen: false };

export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);
  const isInitialized = useRef(false);
  
  // Load cart from localStorage only once on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    try {
      const savedCart = localStorage.getItem('amazon-clone-cart');
      if (savedCart) {
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { items: JSON.parse(savedCart) } });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);
  
  // Debounced save to localStorage
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('amazon-clone-cart', JSON.stringify(cartState.items));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [cartState.items]);
  
  const addToCart = useCallback((product, quantity = 1) => {
    dispatch({ type: CART_ACTIONS.ADD_TO_CART, payload: { product, quantity } });
  }, []);
  
  const removeFromCart = useCallback((productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART, payload: { productId } });
  }, []);
  
  const updateQuantity = useCallback((productId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
  }, []);
  
  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  }, []);
  
  // Memoized computed values
  const cartTotal = useMemo(() => {
    return cartState.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartState.items]);
  
  const cartItemCount = useMemo(() => {
    return cartState.items.reduce((count, item) => count + item.quantity, 0);
  }, [cartState.items]);
  
  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);
  const getCartItemCount = useCallback(() => cartItemCount, [cartItemCount]);
  
  const isInCart = useCallback((productId) => {
    return cartState.items.some(item => item.id === productId);
  }, [cartState.items]);
  
  const getCartItem = useCallback((productId) => {
    return cartState.items.find(item => item.id === productId);
  }, [cartState.items]);
  
  const toggleCartSidebar = useCallback(() => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART_SIDEBAR });
  }, []);
  
  const openCartSidebar = useCallback(() => {
    dispatch({ type: CART_ACTIONS.OPEN_CART_SIDEBAR });
  }, []);
  
  const closeCartSidebar = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLOSE_CART_SIDEBAR });
  }, []);
  
  const value = useMemo(() => ({
    cartItems: cartState.items,
    cart: cartState.items,
    isCartSidebarOpen: cartState.isCartSidebarOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem,
    toggleCartSidebar,
    openCartSidebar,
    closeCartSidebar
  }), [
    cartState.items, cartState.isCartSidebarOpen,
    addToCart, removeFromCart, updateQuantity, clearCart,
    getCartTotal, getCartItemCount, isInCart, getCartItem,
    toggleCartSidebar, openCartSidebar, closeCartSidebar
  ]);
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;