import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop',
      title: 'Great Indian Festival',
      subtitle: 'Up to 80% off on Electronics',
      link: '/deals',
      gradient: 'from-purple-900/70 to-transparent'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop',
      title: 'Fashion Week Sale',
      subtitle: 'Trending styles at best prices',
      link: '/fashion',
      gradient: 'from-pink-900/70 to-transparent'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1920&h=600&fit=crop',
      title: 'Gaming Zone',
      subtitle: 'Explore the latest gaming gear',
      link: '/gaming',
      gradient: 'from-blue-900/70 to-transparent'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=600&fit=crop',
      title: 'Home Makeover',
      subtitle: 'Transform your living space',
      link: '/home-living',
      gradient: 'from-green-900/70 to-transparent'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=600&fit=crop',
      title: 'Health & Fitness',
      subtitle: 'Stay fit, stay healthy',
      link: '/health-sports',
      gradient: 'from-red-900/70 to-transparent'
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className="min-w-full h-full relative flex-shrink-0"
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="ml-8 sm:ml-16 md:ml-24 lg:ml-32 text-white max-w-lg">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base mb-2 sm:mb-4 drop-shadow-md">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.link}
                  className="inline-block bg-amazon-yellow hover:bg-amazon-yellow-dark text-black px-4 sm:px-6 py-1.5 sm:py-2 rounded font-medium text-xs sm:text-sm transition-colors duration-200 shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow - Amazon style edge arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-0 h-full w-12 sm:w-16 flex items-center justify-center hover:bg-black/5 transition-all duration-200 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-700" />
      </button>

      {/* Right Arrow - Amazon style edge arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-0 top-0 h-full w-12 sm:w-16 flex items-center justify-center hover:bg-black/5 transition-all duration-200 z-10"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-700" />
      </button>

      {/* Bottom fade gradient for seamless transition to content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HeroCarousel;
