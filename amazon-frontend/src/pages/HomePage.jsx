import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import HeroCarousel from '../components/HeroCarousel/HeroCarousel';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { IMAGE_CONFIG } from '../config/imageConfig';

const HomePage = () => {
  const { products } = useProducts();
  const { isAuthenticated } = useAuth();
  
  // Get featured products for different sections
  const featuredProducts = products.slice(0, 4);
  const dealProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 6);
  const bestSellers = products.filter(p => p.rating >= 4.5).slice(0, 4);
  
  const categories = [
    {
      title: "Gaming accessories",
      image: IMAGE_CONFIG.CATEGORIES.gaming,
      link: "/gaming",
      items: ["Headsets", "Keyboards", "Computer mice", "Chairs"]
    },
    {
      title: "Shop for your home",
      image: IMAGE_CONFIG.CATEGORIES.home, 
      link: "/home-living",
      items: ["Kitchen", "Home decor", "Dining", "Bed & bath"]
    },
    {
      title: "Health & Personal Care",
      image: IMAGE_CONFIG.CATEGORIES.health,
      link: "/health-sports", 
      items: ["Supplements", "Personal care", "Medical supplies", "Wellness"]
    },
    {
      title: "Fashion trends you like",
      image: IMAGE_CONFIG.CATEGORIES.fashion,
      link: "/fashion",
      items: ["Dresses", "Knits", "Jackets", "Jewelry"]
    }
  ];
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />
      
      {/* Category Grid - overlapping the carousel bottom */}
      <section className="w-full px-4 -mt-16 sm:-mt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-4">
                <h3 className="text-lg font-bold mb-3">{category.title}</h3>
                <div className="space-y-1 mb-3">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-600 hover:text-amazon-orange transition-colors cursor-pointer">
                      {item}
                    </div>
                  ))}
                </div>
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-28 object-cover rounded-md mb-3"
                />
                <Link 
                  to={category.link}
                  className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium text-sm"
                >
                  Shop now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Today's Deals - Full width with proper spacing */}
      <section className="bg-white py-8 mt-8">
        <div className="w-full px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Deals</h2>
            <Link 
              to="/deals" 
              className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium"
            >
              See all deals →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {dealProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variant="compact"
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products - Full width */}
      <section className="w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link 
            to="/products" 
            className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium"
          >
            See all products →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      {/* Best Sellers - Full width */}
      <section className="bg-white py-8">
        <div className="w-full px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
            <Link 
              to="/bestsellers" 
              className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium"
            >
              See all bestsellers →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="bg-gray-50 py-8">
        <div className="w-full px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Shop with Amazon?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-amazon-orange p-3 rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                <i className="fas fa-shipping-fast text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Get your orders delivered quickly with our extensive logistics network</p>
            </div>
            
            <div className="text-center">
              <div className="bg-amazon-blue p-3 rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Shopping</h3>
              <p className="text-gray-600 text-sm">Shop with confidence knowing your data and transactions are protected</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500 p-3 rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                <i className="fas fa-undo text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">Not satisfied? Return your purchase hassle-free within 30 days</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="bg-amazon-blue text-white py-8">
        <div className="w-full px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Stay Updated</h2>
          <p className="text-lg mb-6">Get the latest deals and offers delivered to your inbox</p>
          
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-l-lg text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amazon-orange hover:bg-amazon-orange-dark px-5 py-2 rounded-r-lg font-medium transition-colors duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;