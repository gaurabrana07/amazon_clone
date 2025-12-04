import React, { useState, useRef, useEffect } from 'react';
import { usePWA } from '../../context/PWAContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  MagnifyingGlassPlusIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const MobileProductGallery = ({ 
  images = [], 
  productName = '', 
  onImageChange = () => {},
  enableZoom = true,
  enableShare = true 
}) => {
  const { vibrate, shareContent } = usePWA();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  
  const galleryRef = useRef(null);
  const imageRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const translateX = useRef(0);
  const lastTap = useRef(0);

  useEffect(() => {
    onImageChange(currentIndex);
  }, [currentIndex, onImageChange]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = touch.clientX;
    currentY.current = touch.clientY;
    setIsDragging(true);

    // Double tap detection
    const now = Date.now();
    const timeSince = now - lastTap.current;
    if (timeSince < 600 && timeSince > 0) {
      handleDoubleTab(e);
    }
    lastTap.current = now;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    currentX.current = touch.clientX;
    currentY.current = touch.clientY;

    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;

    // If zoomed, handle pan
    if (isZoomed) {
      e.preventDefault();
      setZoomStyle(prev => ({
        ...prev,
        transform: `${prev.transform} translate(${deltaX}px, ${deltaY}px)`
      }));
      return;
    }

    // Horizontal swipe for image navigation
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
      translateX.current = deltaX;
      
      if (galleryRef.current) {
        galleryRef.current.style.transform = `translateX(${deltaX}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (isZoomed) {
      return;
    }

    const deltaX = translateX.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - previous image
        setCurrentIndex(prev => prev - 1);
        vibrate([25]);
      } else if (deltaX < 0 && currentIndex < images.length - 1) {
        // Swipe left - next image
        setCurrentIndex(prev => prev + 1);
        vibrate([25]);
      }
    }

    // Reset position
    if (galleryRef.current) {
      galleryRef.current.style.transform = 'translateX(0)';
      galleryRef.current.style.transition = 'transform 0.3s ease-out';
      setTimeout(() => {
        if (galleryRef.current) {
          galleryRef.current.style.transition = '';
        }
      }, 300);
    }

    translateX.current = 0;
  };

  const handleDoubleTab = (e) => {
    e.preventDefault();
    
    if (!enableZoom) return;

    if (isZoomed) {
      // Zoom out
      setIsZoomed(false);
      setZoomStyle({});
    } else {
      // Zoom in
      const rect = imageRef.current.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const offsetX = (centerX - x) * 1.5;
      const offsetY = (centerY - y) * 1.5;
      
      setIsZoomed(true);
      setZoomStyle({
        transform: `scale(2.5) translate(${offsetX}px, ${offsetY}px)`,
        transformOrigin: `${x}px ${y}px`
      });
    }
    
    vibrate([50]);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      vibrate([25]);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      vibrate([25]);
    }
  };

  const handleShare = async () => {
    if (!enableShare) return;

    const currentImage = images[currentIndex];
    try {
      const success = await shareContent({
        title: productName,
        text: `Check out this ${productName}`,
        url: window.location.href,
        files: currentImage ? [new File([currentImage], 'product-image.jpg')] : undefined
      });
      
      if (success) {
        vibrate([100]);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const exitZoom = () => {
    setIsZoomed(false);
    setZoomStyle({});
  };

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <PhotoIcon className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-black overflow-hidden">
      {/* Main Image */}
      <div
        ref={galleryRef}
        className="w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
      >
        <img
          ref={imageRef}
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out"
          style={isZoomed ? zoomStyle : {}}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      {!isZoomed && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full transition-opacity ${
              currentIndex === 0 ? 'opacity-30' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === images.length - 1}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full transition-opacity ${
              currentIndex === images.length - 1 ? 'opacity-30' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {!isZoomed && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {enableZoom && (
          <button
            onClick={() => !isZoomed && handleDoubleTab({ touches: [{ clientX: 0, clientY: 0 }], preventDefault: () => {} })}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>
        )}
        
        {enableShare && (
          <button
            onClick={handleShare}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Zoom Exit Button */}
      {isZoomed && (
        <button
          onClick={exitZoom}
          className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full font-medium"
        >
          Exit Zoom
        </button>
      )}

      {/* Swipe Indicators */}
      {!isZoomed && images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Zoom Instructions (first time) */}
      {!isZoomed && enableZoom && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full">
          Double tap to zoom
        </div>
      )}
    </div>
  );
};

export default MobileProductGallery;