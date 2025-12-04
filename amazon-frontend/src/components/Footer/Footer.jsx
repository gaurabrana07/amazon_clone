import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleLanguageChange = () => {
    alert('Language selection would be implemented here.');
  };
  
  const handleCountryChange = () => {
    alert('Country/region selection would be implemented here.');
  };
  
  const footerLinks = {
    "Get to Know Us": [
      { name: "About Amazon", link: "/about" },
      { name: "Careers", link: "/careers" },
      { name: "Press Releases", link: "/press" },
      { name: "Amazon Science", link: "/science" }
    ],
    "Connect with Us": [
      { name: "Facebook", link: "#" },
      { name: "Twitter", link: "#" },
      { name: "Instagram", link: "#" },
      { name: "LinkedIn", link: "#" }
    ],
    "Make Money with Us": [
      { name: "Sell on Amazon", link: "/sell" },
      { name: "Sell under Amazon Accelerator", link: "/accelerator" },
      { name: "Protect and Build Your Brand", link: "/brand-protection" },
      { name: "Amazon Global Selling", link: "/global-selling" },
      { name: "Become an Affiliate", link: "/affiliate" },
      { name: "Fulfilment by Amazon", link: "/fba" },
      { name: "Advertise Your Products", link: "/advertise" }
    ],
    "Let Us Help You": [
      { name: "COVID-19 and Amazon", link: "/covid-help" },
      { name: "Your Account", link: "/account" },
      { name: "Returns Centre", link: "/returns" },
      { name: "100% Purchase Protection", link: "/protection" },
      { name: "Amazon App Download", link: "/app" },
      { name: "Help", link: "/help" }
    ]
  };
  
  return (
    <footer className="bg-amazon-blue text-white">
      {/* Back to Top */}
      <div 
        className="bg-amazon-blue-light hover:bg-gray-600 transition-colors cursor-pointer"
        onClick={handleBackToTop}
      >
        <div className="max-w-7xl mx-auto py-4 text-center">
          <span className="text-sm">Back to top</span>
        </div>
      </div>
      
      {/* Main Footer Links */}
      <div className="bg-amazon-blue">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-white font-bold text-base mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.link}
                        className="text-gray-300 hover:text-white text-sm transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Logo and Language/Country Selector */}
      <div className="border-t border-gray-600 bg-amazon-blue">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-amazon-orange font-bold text-2xl">amazon</span>
              <span className="text-white text-sm">.in</span>
            </Link>
            
            {/* Language and Country Selectors */}
            <div className="flex space-x-4">
              <button 
                onClick={handleLanguageChange}
                className="flex items-center space-x-2 border border-gray-500 px-3 py-1 rounded hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-globe"></i>
                <span className="text-sm">English</span>
              </button>
              
              <button 
                onClick={handleCountryChange}
                className="flex items-center space-x-2 border border-gray-500 px-3 py-1 rounded hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-flag"></i>
                <span className="text-sm">India</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="bg-amazon-blue-dark">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-gray-400">
            {/* Amazon Services */}
            <div>
              <div className="space-y-1">
                <Link to="/amazon-music" className="block hover:text-white">
                  <strong className="text-white">Amazon Music</strong><br />
                  Stream millions of songs
                </Link>
                <Link to="/amazon-advertising" className="block hover:text-white">
                  <strong className="text-white">Amazon Advertising</strong><br />
                  Find, attract, and engage customers
                </Link>
                <Link to="/6pm" className="block hover:text-white">
                  <strong className="text-white">6pm</strong><br />
                  Score deals on fashion brands
                </Link>
                <Link to="/abebooks" className="block hover:text-white">
                  <strong className="text-white">AbeBooks</strong><br />
                  Books, art & collectibles
                </Link>
              </div>
            </div>
            
            {/* More Amazon Services */}
            <div>
              <div className="space-y-1">
                <Link to="/acx" className="block hover:text-white">
                  <strong className="text-white">ACX</strong><br />
                  Audiobook Publishing Made Easy
                </Link>
                <Link to="/sell-on-amazon" className="block hover:text-white">
                  <strong className="text-white">Sell on Amazon</strong><br />
                  Start a Selling Account
                </Link>
                <Link to="/amazon-business" className="block hover:text-white">
                  <strong className="text-white">Amazon Business</strong><br />
                  Everything For Your Business
                </Link>
                <Link to="/prime-now" className="block hover:text-white">
                  <strong className="text-white">Prime Now</strong><br />
                  FREE 2-hour Delivery on Everyday Items
                </Link>
              </div>
            </div>
            
            {/* Additional Services */}
            <div>
              <div className="space-y-1">
                <Link to="/amazon-prime" className="block hover:text-white">
                  <strong className="text-white">Amazon Prime</strong><br />
                  Enjoy fast, FREE delivery, exclusive deals
                </Link>
                <Link to="/amazon-photos" className="block hover:text-white">
                  <strong className="text-white">Amazon Photos</strong><br />
                  Unlimited Photo Storage Free With Prime
                </Link>
                <Link to="/audible" className="block hover:text-white">
                  <strong className="text-white">Audible</strong><br />
                  Listen to Books & Original Audio Performances
                </Link>
                <Link to="/book-depository" className="block hover:text-white">
                  <strong className="text-white">Book Depository</strong><br />
                  Books With Free Delivery Worldwide
                </Link>
              </div>
            </div>
            
            {/* Tech Services */}
            <div>
              <div className="space-y-1">
                <Link to="/box-office-mojo" className="block hover:text-white">
                  <strong className="text-white">Box Office Mojo</strong><br />
                  Find Movie Box Office Data
                </Link>
                <Link to="/comixology" className="block hover:text-white">
                  <strong className="text-white">ComiXology</strong><br />
                  Thousands of Digital Comics
                </Link>
                <Link to="/dpreview" className="block hover:text-white">
                  <strong className="text-white">DPReview</strong><br />
                  Digital Photography
                </Link>
                <Link to="/fabric" className="block hover:text-white">
                  <strong className="text-white">Fabric</strong><br />
                  Sewing, Quilting & Knitting
                </Link>
              </div>
            </div>
          </div>
          
          {/* Copyright and Legal */}
          <div className="mt-8 pt-6 border-t border-gray-600 text-center">
            <div className="flex flex-wrap justify-center space-x-4 text-xs text-gray-400 mb-4">
              <Link to="/conditions-of-use" className="hover:text-white">Conditions of Use</Link>
              <span>•</span>
              <Link to="/privacy-notice" className="hover:text-white">Privacy Notice</Link>
              <span>•</span>
              <Link to="/interest-ads" className="hover:text-white">Interest-Based Ads</Link>
            </div>
            <p className="text-xs text-gray-400">
              © 1996-2024, Amazon.com, Inc. or its affiliates
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;