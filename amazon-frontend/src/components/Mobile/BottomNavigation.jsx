import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../context/PWAContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  MagnifyingGlassIcon as SearchSolidIcon,
  ShoppingCartIcon as CartSolidIcon,
  HeartIcon as HeartSolidIcon,
  UserIcon as UserSolidIcon
} from '@heroicons/react/24/solid';

const BottomNavigation = () => {
  const location = useLocation();
  const { cart } = useCart();
  const { wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { vibrate } = usePWA();
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleTabPress = (tabName) => {
    // Provide haptic feedback on supported devices
    vibrate([50]);
    
    // Track tab usage
    if (window.gtag) {
      window.gtag('event', 'bottom_nav_click', {
        'tab_name': tabName
      });
    }
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeSolidIcon,
      badge: null
    },
    {
      name: 'Search',
      path: '/advanced-search',
      icon: MagnifyingGlassIcon,
      activeIcon: SearchSolidIcon,
      badge: null
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: ShoppingCartIcon,
      activeIcon: CartSolidIcon,
      badge: cart?.length || 0
    },
    {
      name: 'Wishlist',
      path: '/wishlist',
      icon: HeartIcon,
      activeIcon: HeartSolidIcon,
      badge: wishlistItems?.length || 0
    },
    {
      name: isAuthenticated ? 'Profile' : 'Login',
      path: isAuthenticated ? '/profile' : '/login',
      icon: UserIcon,
      activeIcon: UserSolidIcon,
      badge: null
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 transition-transform duration-300 md:hidden ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,1) 20%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const IconComponent = active ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => handleTabPress(item.name)}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors duration-200 ${
                  active 
                    ? 'text-amazon-orange' 
                    : 'text-gray-600 hover:text-amazon-orange'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="relative">
                  <IconComponent 
                    className={`h-6 w-6 transition-all duration-200 ${
                      active ? 'scale-110' : 'scale-100'
                    }`} 
                  />
                  
                  {/* Badge */}
                  {item.badge !== null && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-bold border-2 border-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                
                <span 
                  className={`text-xs mt-1 font-medium transition-all duration-200 ${
                    active ? 'scale-105' : 'scale-100'
                  }`}
                  style={{ 
                    fontSize: '10px',
                    lineHeight: '12px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* Home indicator for iOS */}
        <div 
          className="w-full h-1"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        />
      </nav>

      {/* Spacer for bottom navigation */}
      <div className="h-20 md:hidden" />
    </>
  );
};

export default BottomNavigation;