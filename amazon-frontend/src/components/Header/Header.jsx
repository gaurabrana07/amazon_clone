import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import SmartSearchBar from '../AI/SmartSearchBar';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemCount } = useCart();
  const { getWishlistItemCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleLocationClick = () => {
    alert('In a real application, this would open a location selector to choose your delivery address.');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const openLoginModal = () => {
    setShowLoginModal(true);
  };
  
  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };
  
  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };
  
  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };
  
  const handleLanguageChange = () => {
    alert('Language selection would be implemented here.');
  };
  
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-amazon-blue text-white sticky top-0 z-50 shadow-lg">
      {/* Main Navigation Bar */}
      <div className="bg-amazon-blue">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 hover:bg-amazon-blue-light p-2 rounded transition-colors">
              <div className="text-white font-bold text-xl">
                <span className="text-amazon-orange">amazon</span>
                <span className="text-xs">.in</span>
              </div>
            </Link>
            
            {/* Delivery Location */}
            <button 
              onClick={handleLocationClick}
              className="hidden lg:flex items-center space-x-1 hover:bg-amazon-blue-light p-2 rounded transition-colors"
            >
              <div>
                <i className="fas fa-map-marker-alt text-sm"></i>
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-300">Deliver to</div>
                <div className="text-sm font-medium">India</div>
              </div>
            </button>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <SmartSearchBar 
                className="flex-1 max-w-2xl"
                placeholder="Search Amazon with AI..."
                showSuggestions={true}
                showTrending={true}
              />
            </div>
            
            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <button 
                onClick={handleLanguageChange}
                className="hidden md:flex items-center space-x-1 hover:bg-amazon-blue-light p-2 rounded transition-colors"
              >
                <i className="fas fa-globe text-sm"></i>
                <span className="text-sm">EN</span>
                <i className="fas fa-caret-down text-xs"></i>
              </button>
              
              {/* User Account Section */}
              {isAuthenticated ? (
                <Menu as="div" className="relative hidden md:block">
                  <Menu.Button className="flex items-center space-x-2 hover:bg-amazon-blue-light p-2 rounded transition-colors">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-left">
                      <div className="text-xs">Hello, {user.name.split(' ')[0]}</div>
                      <div className="text-sm font-medium flex items-center">
                        Account & Lists
                        <ChevronDownIcon className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </Menu.Button>
                  
                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/orders"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Your Orders
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/recommendations"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              AI Recommendations
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/analytics"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Analytics Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/advanced-analytics"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              📊 Advanced Analytics
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/advanced-search"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Advanced Search
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/addresses"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Your Addresses
                            </Link>
                          )}
                        </Menu.Item>
                        <hr className="my-1" />
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <button 
                  onClick={openLoginModal}
                  className="hidden md:flex items-center space-x-1 hover:bg-amazon-blue-light p-2 rounded transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs">Hello, sign in</div>
                    <div className="text-sm font-medium">Account & Lists</div>
                  </div>
                </button>
              )}
              
              {/* Returns & Orders */}
              <Link 
                to="/orders" 
                className="hidden md:block hover:bg-amazon-blue-light p-2 rounded transition-colors"
              >
                <div className="text-left">
                  <div className="text-xs">Returns</div>
                  <div className="text-sm font-medium">& Orders</div>
                </div>
              </Link>
              
              {/* Wishlist */}
              <Link 
                to="/wishlist" 
                className="hidden md:flex items-center space-x-1 hover:bg-amazon-blue-light p-2 rounded transition-colors relative"
              >
                <div className="relative">
                  <i className="far fa-heart text-xl"></i>
                  {getWishlistItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amazon-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getWishlistItemCount()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">Wishlist</span>
              </Link>
              
              {/* Cart */}
              <Link 
                to="/cart" 
                className="flex items-center space-x-1 hover:bg-amazon-blue-light p-2 rounded transition-colors relative"
              >
                <div className="relative">
                  <i className="fas fa-shopping-cart text-xl"></i>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amazon-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getCartItemCount()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">Cart</span>
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-amazon-blue-light rounded transition-colors"
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary Navigation */}
      <div className="bg-amazon-blue-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-6 h-10 overflow-x-auto scrollbar-hide">
            <Link 
              to="/" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-bars mr-2"></i>
              All
            </Link>
            <Link 
              to="/deals" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/deals') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-fire mr-2 text-orange-400"></i>
              Today's Deals
            </Link>
            <Link 
              to="/bestsellers" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/bestsellers') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-trophy mr-2 text-yellow-400"></i>
              Best Sellers
            </Link>
            <Link 
              to="/gaming" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/gaming') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-gamepad mr-2 text-purple-400"></i>
              Gaming & Tech
            </Link>
            <Link 
              to="/home-living" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/home-living') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-home mr-2 text-green-400"></i>
              Home & Living
            </Link>
            <Link 
              to="/fashion" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/fashion') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-tshirt mr-2 text-pink-400"></i>
              Fashion
            </Link>
            <Link 
              to="/health-sports" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/health-sports') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-dumbbell mr-2 text-red-400"></i>
              Health & Sports
            </Link>
            <Link 
              to="/kids-baby" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/kids-baby') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-baby mr-2 text-blue-400"></i>
              Kids & Baby
            </Link>
            <Link 
              to="/automotive-tools" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/automotive-tools') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-car mr-2 text-gray-400"></i>
              Auto & Tools
            </Link>
            <Link 
              to="/all-products" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/all-products') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-th-large mr-2 text-indigo-400"></i>
              All Products
            </Link>
            <Link 
              to="/customer-service" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/customer-service') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-headset mr-2 text-cyan-400"></i>
              Customer Service
            </Link>
            <Link 
              to="/sell" 
              className={`whitespace-nowrap nav-link flex items-center ${isActiveRoute('/sell') ? 'text-amazon-yellow' : ''}`}
            >
              <i className="fas fa-store mr-2 text-amber-400"></i>
              Sell
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-amazon-blue-light border-t border-amazon-blue">
          <div className="px-4 py-2 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 py-2 border-b border-amazon-blue">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium">Hello, {user.name.split(' ')[0]}</span>
                </div>
                <Link to="/profile" className="block py-2 text-sm hover:bg-amazon-blue rounded">
                  Your Profile
                </Link>
                <Link to="/orders" className="block py-2 text-sm hover:bg-amazon-blue rounded">
                  Your Orders
                </Link>
                <Link to="/recommendations" className="block py-2 text-sm hover:bg-amazon-blue rounded">
                  AI Recommendations
                </Link>
                <Link to="/analytics" className="block py-2 text-sm hover:bg-amazon-blue rounded">
                  Analytics Dashboard
                </Link>
                <Link to="/advanced-analytics" className="block py-2 text-sm hover:bg-amazon-blue rounded">
                  📊 Advanced Analytics
                </Link>
                <Link to="/advanced-search" className="block py-2 text-sm hover:bg-amazon-blue rounded">
                  Advanced Search
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-sm hover:bg-amazon-blue rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={openLoginModal} 
                className="block w-full text-left py-2 text-sm hover:bg-amazon-blue rounded"
              >
                Sign In / Create Account
              </button>
            )}
            <button onClick={handleLocationClick} className="block w-full text-left py-2 text-sm hover:bg-amazon-blue rounded">
              Delivery Location
            </button>
            <Link to="/customer-service" className="block py-2 text-sm hover:bg-amazon-blue rounded">
              Customer Service
            </Link>
            <Link to="/sell" className="block py-2 text-sm hover:bg-amazon-blue rounded">
              Sell on Amazon
            </Link>
          </div>
        </div>
      )}
      
      {/* Authentication Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={switchToRegister}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </header>
  );
};

export default Header;