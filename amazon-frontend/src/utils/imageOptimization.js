// Image optimization and replacement utility
// This function provides fallback images for any remaining placeholder references

import { IMAGE_CONFIG } from '../config/imageConfig';

// Image replacement function that intelligently assigns images based on context
export const getOptimizedImage = (originalUrl, context = {}) => {
  // If it's already a valid URL and not a placeholder, return as is
  if (originalUrl && !originalUrl.includes('/api/placeholder/') && !originalUrl.includes('placeholder')) {
    return originalUrl;
  }

  // Extract size information if available
  const sizeMatch = originalUrl?.match(/(\d+)\/(\d+)|(\d+)x(\d+)/);
  const width = sizeMatch ? (sizeMatch[1] || sizeMatch[3]) : '400';
  const height = sizeMatch ? (sizeMatch[2] || sizeMatch[4]) : '400';

  // Determine category from context
  const { category, type, productId, component } = context;

  // Component-specific image selection
  if (component === 'chatbot' || component === 'avatar') {
    return IMAGE_CONFIG.UI.avatar;
  }

  if (component === 'banner' || component === 'hero') {
    return IMAGE_CONFIG.BANNERS.hero1;
  }

  // Category-based selection
  if (category) {
    const categoryKey = category.toLowerCase();
    if (IMAGE_CONFIG.CATEGORIES[categoryKey]) {
      return IMAGE_CONFIG.CATEGORIES[categoryKey];
    }
  }

  // Product type-based selection
  if (type) {
    const typeKey = type.toLowerCase();
    if (IMAGE_CONFIG.PRODUCTS[typeKey]) {
      return IMAGE_CONFIG.PRODUCTS[typeKey];
    }
  }

  // Gaming-specific images
  if (originalUrl?.includes('gaming') || category === 'gaming') {
    const gamingImages = [
      IMAGE_CONFIG.PRODUCTS.console,
      IMAGE_CONFIG.PRODUCTS.game,
      IMAGE_CONFIG.PRODUCTS.controller,
      IMAGE_CONFIG.PRODUCTS.gamingchair
    ];
    const index = productId ? productId % gamingImages.length : 0;
    return gamingImages[index];
  }

  // Fashion-specific images
  if (originalUrl?.includes('fashion') || category === 'fashion') {
    const fashionImages = [
      IMAGE_CONFIG.PRODUCTS.dress,
      IMAGE_CONFIG.PRODUCTS.tshirt,
      IMAGE_CONFIG.PRODUCTS.jeans,
      IMAGE_CONFIG.PRODUCTS.jacket,
      IMAGE_CONFIG.PRODUCTS.shoes
    ];
    const index = productId ? productId % fashionImages.length : 0;
    return fashionImages[index];
  }

  // Electronics (default)
  const electronicsImages = [
    IMAGE_CONFIG.PRODUCTS.laptop,
    IMAGE_CONFIG.PRODUCTS.smartphone,
    IMAGE_CONFIG.PRODUCTS.headphones,
    IMAGE_CONFIG.PRODUCTS.camera,
    IMAGE_CONFIG.PRODUCTS.tablet
  ];
  const index = productId ? productId % electronicsImages.length : 0;
  return electronicsImages[index];
};

// Bulk image optimization for arrays of products
export const optimizeProductImages = (products) => {
  return products.map((product, index) => ({
    ...product,
    image: getOptimizedImage(product.image, {
      category: product.category,
      productId: product.id || index,
      type: 'product'
    })
  }));
};

// Image preloader for better performance
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    })
  );
};

// Image error handler
export const handleImageError = (event, fallbackContext = {}) => {
  const img = event.target;
  const fallbackImage = getOptimizedImage('', fallbackContext);
  
  if (img.src !== fallbackImage) {
    img.src = fallbackImage;
  }
};

// React hook for image optimization
export const useOptimizedImage = (originalUrl, context = {}) => {
  return getOptimizedImage(originalUrl, context);
};

export default {
  getOptimizedImage,
  optimizeProductImages,
  preloadImages,
  handleImageError,
  useOptimizedImage
};