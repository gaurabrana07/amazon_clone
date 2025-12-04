import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import CartSidebar from '../Cart/CartSidebar';
import { useCart } from '../../context/CartContext';

const Layout = () => {
  const { isCartSidebarOpen, closeCartSidebar } = useCart();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar isOpen={isCartSidebarOpen} onClose={closeCartSidebar} />
    </div>
  );
};

export default Layout;