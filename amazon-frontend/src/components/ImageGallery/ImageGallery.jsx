import React, { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const ImageGallery = ({ images = [], productName = '', className = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ensure we have at least one image
  const imageList = images.length > 0 ? images : ['/api/placeholder/600/600'];

  useEffect(() => {
    setSelectedImageIndex(0);
    setIsZoomed(false);
    setIsFullscreen(false);
  }, [images]);

  const handleImageChange = (index) => {
    setSelectedImageIndex(index);
    setIsZoomed(false);
  };

  const handlePrevImage = () => {
    const prevIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : imageList.length - 1;
    handleImageChange(prevIndex);
  };

  const handleNextImage = () => {
    const nextIndex = selectedImageIndex < imageList.length - 1 ? selectedImageIndex + 1 : 0;
    handleImageChange(nextIndex);
  };

  const handleImageZoom = (e) => {
    if (!isZoomed) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleKeyDown = (e) => {
    if (!isFullscreen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevImage();
        break;
      case 'ArrowRight':
        handleNextImage();
        break;
      case 'Escape':
        setIsFullscreen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, selectedImageIndex]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = (e) => {
    e.target.src = '/api/placeholder/600/600';
    setLoading(false);
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image Display */}
        <div className="relative">
          <div 
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in relative"
            onClick={toggleZoom}
            onMouseMove={handleImageZoom}
            onMouseLeave={() => setIsZoomed(false)}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            <img
              src={imageList[selectedImageIndex]}
              alt={`${productName} view ${selectedImageIndex + 1}`}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              } ${loading ? 'opacity-0' : 'opacity-100'}`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {/* Image Navigation - only show if multiple images */}
            {imageList.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md pointer-events-auto transition-all duration-200 hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md pointer-events-auto transition-all duration-200 hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            )}
            
            {/* Action Icons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
                className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-700" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                aria-label="View fullscreen"
              >
                <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Image Counter */}
            {imageList.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {imageList.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Images - only show if multiple images */}
        {imageList.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {imageList.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedImageIndex === index
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-60 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all duration-200"
            aria-label="Close fullscreen"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>

          {/* Image Navigation */}
          {imageList.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all duration-200"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all duration-200"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-8 w-8 text-white" />
              </button>
            </>
          )}

          {/* Fullscreen Image */}
          <div className="max-w-4xl max-h-[90vh] mx-4">
            <img
              src={imageList[selectedImageIndex]}
              alt={`${productName} fullscreen view ${selectedImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
            {imageList.length > 1 && (
              <span className="text-sm">
                {selectedImageIndex + 1} / {imageList.length}
              </span>
            )}
          </div>

          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
            <div>← → Navigate</div>
            <div>ESC Close</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;