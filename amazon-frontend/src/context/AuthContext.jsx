import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('amazon_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('amazon_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('amazon_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('amazon_user');
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, this would come from API
      const mockUser = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=232f3e&color=fff`,
        addresses: [],
        orders: [],
        createdAt: new Date().toISOString()
      };

      setUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=232f3e&color=fff`,
        addresses: [],
        orders: [],
        createdAt: new Date().toISOString()
      };

      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('amazon_user');
    localStorage.removeItem('amazon_cart');
    localStorage.removeItem('amazon_wishlist');
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addAddress = useCallback((address) => {
    const newAddress = {
      id: Date.now(),
      ...address,
      createdAt: new Date().toISOString()
    };
    
    const updatedUser = {
      ...user,
      addresses: [...(user.addresses || []), newAddress]
    };
    
    setUser(updatedUser);
    return newAddress;
  }, [user]);

  const updateAddress = useCallback((addressId, updates) => {
    const updatedAddresses = user.addresses.map(addr => 
      addr.id === addressId ? { ...addr, ...updates } : addr
    );
    
    setUser({
      ...user,
      addresses: updatedAddresses
    });
  }, [user]);

  const deleteAddress = useCallback((addressId) => {
    const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
    setUser({
      ...user,
      addresses: updatedAddresses
    });
  }, [user]);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress
  }), [user, isLoading, login, register, logout, updateProfile, addAddress, updateAddress, deleteAddress]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;