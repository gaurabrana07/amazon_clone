import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { SearchProvider } from './context/SearchContext';
import { PaymentProvider } from './context/PaymentContext';
import { OrdersProvider } from './context/OrdersContext';
import ErrorBoundary from './components/ErrorBoundary';

// Core Components - loaded immediately
import Layout from './components/Layout/Layout';

// Pages - loaded immediately for fast initial render
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AuthPage from './pages/AuthPage';

// Lazy loaded pages - loaded on demand
const GamingPage = lazy(() => import('./pages/GamingPage'));
const FashionPage = lazy(() => import('./pages/FashionPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const HomeLivingPage = lazy(() => import('./pages/HomeLivingPage'));
const HealthSportsPage = lazy(() => import('./pages/HealthSportsPage'));
const KidsBabyPage = lazy(() => import('./pages/KidsBabyPage'));
const AutomotiveToolsPage = lazy(() => import('./pages/AutomotiveToolsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const BestSellersPage = lazy(() => import('./pages/BestSellersPage'));
const AllProductsPage = lazy(() => import('./pages/AllProductsPage'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);

// Placeholder components
const CustomerServicePage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Customer Service</h1>
    <p>Customer service content coming soon...</p>
  </div>
);

const SellPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Sell on Amazon</h1>
    <p>Selling information coming soon...</p>
  </div>
);

const SearchResultsPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Search Results</h1>
    <p>Search functionality coming soon...</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <ProductProvider>
            <SearchProvider>
              <CartProvider>
                <WishlistProvider>
                  <PaymentProvider>
                    <OrdersProvider>
                      <Router>
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<Layout />}>
                              <Route index element={<HomePage />} />
                              <Route path="gaming" element={<GamingPage />} />
                              <Route path="home-living" element={<HomeLivingPage />} />
                              <Route path="fashion" element={<FashionPage />} />
                              <Route path="health-sports" element={<HealthSportsPage />} />
                              <Route path="kids-baby" element={<KidsBabyPage />} />
                              <Route path="automotive-tools" element={<AutomotiveToolsPage />} />
                              <Route path="products" element={<ProductsPage />} />
                              <Route path="all-products" element={<AllProductsPage />} />
                              <Route path="product/:id" element={<ProductDetailPage />} />
                              <Route path="deals" element={<DealsPage />} />
                              <Route path="bestsellers" element={<BestSellersPage />} />
                              <Route path="cart" element={<CartPage />} />
                              <Route path="wishlist" element={<WishlistPage />} />
                              <Route path="search" element={<SearchResultsPage />} />
                              <Route path="login" element={<AuthPage />} />
                              <Route path="register" element={<AuthPage />} />
                              <Route path="checkout" element={<CheckoutPage />} />
                              <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                              <Route path="profile" element={<UserProfilePage />} />
                              <Route path="orders" element={<OrdersPage />} />
                              <Route path="addresses" element={<AddressesPage />} />
                              <Route path="customer-service" element={<CustomerServicePage />} />
                              <Route path="sell" element={<SellPage />} />
                              <Route path="*" element={<HomePage />} />
                            </Route>
                          </Routes>
                        </Suspense>
                      </Router>
                    </OrdersProvider>
                  </PaymentProvider>
                </WishlistProvider>
              </CartProvider>
            </SearchProvider>
          </ProductProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;