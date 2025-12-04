import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { useProducts } from '../context/ProductContext';
// Temporarily comment out AI components to debug
// import PersonalizedHomepage from '../components/AI/PersonalizedHomepage';
// import SmartRecommendations from '../components/AI/SmartRecommendations';
import { useAuth } from '../context/AuthContext';
import { IMAGE_CONFIG } from '../config/imageConfig';

const HomePage = () => {
  console.log('HomePage: Rendering');
  const { products } = useProducts();
  console.log('HomePage: Got products', products.length);
  const { isAuthenticated } = useAuth();
  console.log('HomePage: Got auth state');
  
  // Get featured products for different sections
  const featuredProducts = products.slice(0, 4);
  const dealProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 6);
  const bestSellers = products.filter(p => p.isBestseller).slice(0, 4);
  
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
      {/* Temporarily disable AI components */}
      {/* <PersonalizedHomepage /> */}
      
      {/* Hero Banner */}
      <section className="relative">
        <div className="bg-gradient-to-r from-amazon-blue to-amazon-blue-light h-96 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-amazon-orange">Amazon</span>
            </h1>
            <p className="text-xl mb-8">Discover millions of products at great prices</p>
            <Link 
              to="/products" 
              className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-black px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200"
            >
              Shop Now
            </Link>
          </div>
        </div>
        
        {/* Floating notification */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <i className="fas fa-truck text-green-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium">Free shipping</p>
              <p className="text-xs text-gray-600">On orders over ₹499</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">{category.title}</h3>
                <div className="space-y-2 mb-4">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-600 hover:text-amazon-orange transition-colors cursor-pointer">
                      {item}
                    </div>
                  ))}
                </div>
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
                <Link 
                  to={category.link}
                  className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium"
                >
                  Shop now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Today's Deals - simplified */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Temporarily disable AI SmartRecommendations */}
          {/* <SmartRecommendations ... /> */}
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">More Great Deals</h2>
            <Link 
              to="/deals" 
              className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium"
            >
              See all deals →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
      
      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      {/* Best Sellers */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
            <Link 
              to="/bestsellers" 
              className="text-amazon-blue hover:text-amazon-orange transition-colors font-medium"
            >
              See all bestsellers →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Shop with Amazon?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-amazon-orange p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-shipping-fast text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your orders delivered quickly with our extensive logistics network</p>
            </div>
            
            <div className="text-center">
              <div className="bg-amazon-blue p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Shopping</h3>
              <p className="text-gray-600">Shop with confidence knowing your data and transactions are protected</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-undo text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
              <p className="text-gray-600">Not satisfied? Return your purchase hassle-free within 30 days</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="bg-amazon-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8">Get the latest deals and offers delivered to your inbox</p>
          
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amazon-orange hover:bg-amazon-orange-dark px-6 py-3 rounded-r-lg font-medium transition-colors duration-200"
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