// Central image configuration for the e-commerce platform
// This file manages all image URLs to ensure consistency and reliability

export const IMAGE_CONFIG = {
  // Fallback images for different scenarios
  FALLBACK: {
    product: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&q=80',
    user: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80',
    category: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=400&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80'
  },

  // Product category images
  CATEGORIES: {
    electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&q=80',
    fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&q=80',
    home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&q=80',
    books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&q=80',
    gaming: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop&q=80',
    sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80',
    automotive: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop&q=80',
    health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&q=80'
  },

  // Specific product images by category
  PRODUCTS: {
    // Electronics
    laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&q=80',
    smartphone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&q=80',
    headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80',
    camera: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop&q=80',
    tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&q=80',
    smartwatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80',
    speaker: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&q=80',
    monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop&q=80',

    // Fashion
    tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80',
    jeans: 'https://images.unsplash.com/photo-1542272454315-7ad9f8824624?w=600&h=600&fit=crop&q=80',
    dress: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop&q=80',
    jacket: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop&q=80',
    shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&q=80',
    watch: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop&q=80',
    bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=80',
    sunglasses: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&q=80',

    // Home & Kitchen
    sofa: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&q=80',
    bed: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop&q=80',
    chair: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop&q=80',
    table: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=600&h=600&fit=crop&q=80',
    lamp: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop&q=80',
    kitchenware: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&q=80',
    cookware: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=600&fit=crop&q=80',
    decor: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&h=600&fit=crop&q=80',

    // Books & Media
    book: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&q=80',
    ebook: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=80',
    magazine: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80',
    audiobook: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=600&fit=crop&q=80',

    // Gaming
    console: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop&q=80',
    game: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=600&fit=crop&q=80',
    controller: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&h=600&fit=crop&q=80',
    gamingchair: 'https://images.unsplash.com/photo-1664906225771-ad3c3c585c6e?w=600&h=600&fit=crop&q=80',

    // Sports & Outdoors
    fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&q=80',
    bicycle: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop&q=80',
    yoga: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=600&fit=crop&q=80',
    camping: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop&q=80',

    // Health & Beauty
    skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&q=80',
    makeup: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=80',
    supplements: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop&q=80',
    perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop&q=80'
  },

  // Homepage banners and promotional images
  BANNERS: {
    hero1: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop&q=80',
    hero2: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop&q=80',
    hero3: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=400&fit=crop&q=80',
    sale: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop&q=80',
    deal: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=300&fit=crop&q=80',
    newArrivals: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop&q=80'
  },

  // Homepage category showcase
  HOMEPAGE_CATEGORIES: {
    category1: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop&q=80',
    category2: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop&q=80',
    category3: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&q=80',
    category4: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&q=80'
  },

  // User interface elements
  UI: {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80',
    emptyCart: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&q=80',
    emptyWishlist: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop&q=80',
    loading: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&q=80',
    error: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop&q=80'
  }
};

// Helper function to get image URL with fallback
export const getImageUrl = (category, type, size = '400x400') => {
  const [width, height] = size.split('x');
  
  if (IMAGE_CONFIG[category] && IMAGE_CONFIG[category][type]) {
    return IMAGE_CONFIG[category][type].replace(/w=\d+&h=\d+/, `w=${width}&h=${height}`);
  }
  
  // Return fallback image with correct size
  return IMAGE_CONFIG.FALLBACK.product.replace(/w=\d+&h=\d+/, `w=${width}&h=${height}`);
};

// Helper function to replace placeholder URLs
export const replacePlaceholderUrl = (url, category = 'PRODUCTS', type = 'laptop') => {
  if (url && url.includes('/api/placeholder/')) {
    // Extract size from placeholder URL (e.g., /api/placeholder/300/300)
    const sizeMatch = url.match(/\/api\/placeholder\/(\d+)\/(\d+)/);
    const size = sizeMatch ? `${sizeMatch[1]}x${sizeMatch[2]}` : '400x400';
    return getImageUrl(category, type, size);
  }
  return url;
};

// Pre-defined product image collections for different categories
export const PRODUCT_IMAGE_COLLECTIONS = {
  electronics: [
    IMAGE_CONFIG.PRODUCTS.laptop,
    IMAGE_CONFIG.PRODUCTS.smartphone,
    IMAGE_CONFIG.PRODUCTS.headphones,
    IMAGE_CONFIG.PRODUCTS.camera,
    IMAGE_CONFIG.PRODUCTS.tablet,
    IMAGE_CONFIG.PRODUCTS.smartwatch,
    IMAGE_CONFIG.PRODUCTS.speaker,
    IMAGE_CONFIG.PRODUCTS.monitor
  ],
  fashion: [
    IMAGE_CONFIG.PRODUCTS.tshirt,
    IMAGE_CONFIG.PRODUCTS.jeans,
    IMAGE_CONFIG.PRODUCTS.dress,
    IMAGE_CONFIG.PRODUCTS.jacket,
    IMAGE_CONFIG.PRODUCTS.shoes,
    IMAGE_CONFIG.PRODUCTS.watch,
    IMAGE_CONFIG.PRODUCTS.bag,
    IMAGE_CONFIG.PRODUCTS.sunglasses
  ],
  home: [
    IMAGE_CONFIG.PRODUCTS.sofa,
    IMAGE_CONFIG.PRODUCTS.bed,
    IMAGE_CONFIG.PRODUCTS.chair,
    IMAGE_CONFIG.PRODUCTS.table,
    IMAGE_CONFIG.PRODUCTS.lamp,
    IMAGE_CONFIG.PRODUCTS.kitchenware,
    IMAGE_CONFIG.PRODUCTS.cookware,
    IMAGE_CONFIG.PRODUCTS.decor
  ],
  gaming: [
    IMAGE_CONFIG.PRODUCTS.console,
    IMAGE_CONFIG.PRODUCTS.game,
    IMAGE_CONFIG.PRODUCTS.controller,
    IMAGE_CONFIG.PRODUCTS.gamingchair
  ]
};

export default IMAGE_CONFIG;