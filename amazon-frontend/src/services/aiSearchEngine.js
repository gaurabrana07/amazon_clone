// AI-Powered Search Engine with Natural Language Processing
// Implements intelligent search with query understanding, suggestions, and semantic matching

class AISearchEngine {
  constructor() {
    this.searchHistory = new Map();
    this.popularSearches = new Map();
    this.synonyms = new Map();
    this.categoryKeywords = new Map();
    this.brandKeywords = new Map();
    this.initializeSearchData();
  }

  // Initialize search data and mappings
  initializeSearchData() {
    // Category keywords mapping
    this.categoryKeywords.set('electronics', [
      'phone', 'laptop', 'computer', 'tablet', 'headphone', 'speaker', 'camera', 
      'tv', 'monitor', 'keyboard', 'mouse', 'charger', 'cable', 'gaming', 'tech'
    ]);
    this.categoryKeywords.set('fashion', [
      'shirt', 'dress', 'pants', 'shoes', 'jacket', 'bag', 'watch', 'jewelry', 
      'clothing', 'apparel', 'fashion', 'style', 'outfit', 'wear'
    ]);
    this.categoryKeywords.set('home', [
      'furniture', 'kitchen', 'bedroom', 'living room', 'decor', 'lamp', 'table', 
      'chair', 'sofa', 'bed', 'storage', 'organization', 'home improvement'
    ]);
    this.categoryKeywords.set('sports', [
      'fitness', 'gym', 'workout', 'exercise', 'sports', 'running', 'yoga', 
      'swimming', 'bicycle', 'outdoor', 'athletic', 'health'
    ]);
    this.categoryKeywords.set('books', [
      'book', 'novel', 'textbook', 'magazine', 'reading', 'literature', 
      'fiction', 'non-fiction', 'educational', 'study'
    ]);

    // Common synonyms for better search
    this.synonyms.set('phone', ['mobile', 'smartphone', 'cell phone', 'iphone', 'android']);
    this.synonyms.set('laptop', ['computer', 'notebook', 'pc', 'macbook']);
    this.synonyms.set('shoes', ['sneakers', 'boots', 'sandals', 'footwear']);
    this.synonyms.set('bag', ['purse', 'backpack', 'handbag', 'tote']);
    this.synonyms.set('watch', ['timepiece', 'smartwatch', 'wristwatch']);
    this.synonyms.set('cheap', ['affordable', 'budget', 'inexpensive', 'low cost']);
    this.synonyms.set('expensive', ['premium', 'luxury', 'high-end', 'costly']);
    this.synonyms.set('good', ['quality', 'excellent', 'great', 'best', 'top rated']);

    // Brand keywords
    this.brandKeywords.set('apple', ['iphone', 'ipad', 'macbook', 'airpods', 'apple watch']);
    this.brandKeywords.set('samsung', ['galaxy', 'samsung phone', 'samsung tv']);
    this.brandKeywords.set('nike', ['nike shoes', 'nike sneakers', 'swoosh']);
    this.brandKeywords.set('sony', ['playstation', 'sony camera', 'sony headphones']);
  }

  // Natural language query processing
  processNaturalLanguageQuery(query) {
    const processedQuery = {
      originalQuery: query,
      cleanQuery: this.cleanQuery(query),
      intent: this.detectIntent(query),
      categories: this.extractCategories(query),
      brands: this.extractBrands(query),
      priceRange: this.extractPriceRange(query),
      attributes: this.extractAttributes(query),
      suggestions: []
    };

    return processedQuery;
  }

  // Clean and normalize query
  cleanQuery(query) {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .trim();
  }

  // Detect search intent
  detectIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    // Price-focused intent
    if (lowerQuery.match(/\b(cheap|affordable|budget|under|below|less than)\b/)) {
      return 'price_conscious';
    }
    if (lowerQuery.match(/\b(premium|luxury|expensive|high.?end|best quality)\b/)) {
      return 'premium_focused';
    }

    // Comparison intent
    if (lowerQuery.match(/\b(vs|versus|compare|better|best)\b/)) {
      return 'comparison';
    }

    // Specific product intent
    if (lowerQuery.match(/\b(buy|purchase|order|get)\b/)) {
      return 'purchase_intent';
    }

    // Information seeking
    if (lowerQuery.match(/\b(review|rating|feedback|opinion)\b/)) {
      return 'information_seeking';
    }

    // Gift intent
    if (lowerQuery.match(/\b(gift|present|for him|for her|birthday|anniversary)\b/)) {
      return 'gift_seeking';
    }

    return 'general_search';
  }

  // Extract categories from query
  extractCategories(query) {
    const categories = [];
    const lowerQuery = query.toLowerCase();

    this.categoryKeywords.forEach((keywords, category) => {
      const hasMatch = keywords.some(keyword => 
        lowerQuery.includes(keyword) || 
        this.findSynonymMatch(lowerQuery, keyword)
      );
      if (hasMatch) {
        categories.push(category);
      }
    });

    return categories;
  }

  // Extract brands from query
  extractBrands(query) {
    const brands = [];
    const lowerQuery = query.toLowerCase();

    this.brandKeywords.forEach((keywords, brand) => {
      const hasMatch = keywords.some(keyword => lowerQuery.includes(keyword)) ||
                      lowerQuery.includes(brand);
      if (hasMatch) {
        brands.push(brand);
      }
    });

    return brands;
  }

  // Extract price range from query
  extractPriceRange(query) {
    const priceRange = { min: null, max: null };
    
    // Extract price patterns like "$100-200", "under $50", "below 100"
    const pricePatterns = [
      /\$?(\d+)[\s]*[-to]+[\s]*\$?(\d+)/g, // $100-200 or 100 to 200
      /under[\s]*\$?(\d+)/gi, // under $50
      /below[\s]*\$?(\d+)/gi, // below 100
      /less[\s]*than[\s]*\$?(\d+)/gi, // less than $75
      /above[\s]*\$?(\d+)/gi, // above $100
      /over[\s]*\$?(\d+)/gi, // over $200
    ];

    pricePatterns.forEach((pattern, index) => {
      const matches = [...query.matchAll(pattern)];
      matches.forEach(match => {
        if (index === 0) { // Range pattern
          priceRange.min = parseInt(match[1]);
          priceRange.max = parseInt(match[2]);
        } else if (index <= 3) { // Under/below/less than
          priceRange.max = parseInt(match[1]);
        } else { // Above/over
          priceRange.min = parseInt(match[1]);
        }
      });
    });

    return priceRange;
  }

  // Extract product attributes from query
  extractAttributes(query) {
    const attributes = {};
    const lowerQuery = query.toLowerCase();

    // Colors
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink', 'brown', 'gray', 'orange'];
    colors.forEach(color => {
      if (lowerQuery.includes(color)) {
        attributes.color = color;
      }
    });

    // Sizes
    const sizes = ['small', 'medium', 'large', 'xl', 'xxl', 's', 'm', 'l'];
    sizes.forEach(size => {
      if (lowerQuery.includes(size)) {
        attributes.size = size;
      }
    });

    // Materials
    const materials = ['cotton', 'leather', 'plastic', 'metal', 'wood', 'glass', 'ceramic'];
    materials.forEach(material => {
      if (lowerQuery.includes(material)) {
        attributes.material = material;
      }
    });

    return attributes;
  }

  // Find synonym matches
  findSynonymMatch(query, keyword) {
    const synonyms = this.synonyms.get(keyword) || [];
    return synonyms.some(synonym => query.includes(synonym));
  }

  // Intelligent product search with AI scoring
  searchProducts(query, products, options = {}) {
    const processedQuery = this.processNaturalLanguageQuery(query);
    const results = [];

    // Track search for analytics
    this.trackSearch(processedQuery.originalQuery);

    products.forEach(product => {
      const score = this.calculateRelevanceScore(product, processedQuery);
      if (score > 0) {
        results.push({
          product,
          score,
          matchReasons: this.getMatchReasons(product, processedQuery)
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Apply filters based on intent and extracted data
    let filteredResults = this.applyIntelligentFilters(results, processedQuery, options);

    return {
      results: filteredResults,
      totalFound: filteredResults.length,
      processedQuery,
      suggestions: this.generateSearchSuggestions(query, products),
      alternativeQueries: this.generateAlternativeQueries(processedQuery)
    };
  }

  // Calculate relevance score for a product
  calculateRelevanceScore(product, processedQuery) {
    let score = 0;
    const query = processedQuery.cleanQuery;
    const words = query.split(' ');

    // Exact name match (highest priority)
    if (product.name.toLowerCase().includes(query)) {
      score += 100;
    }

    // Word matches in name
    words.forEach(word => {
      if (product.name.toLowerCase().includes(word)) {
        score += 20;
      }
    });

    // Category match
    if (processedQuery.categories.includes(product.category?.toLowerCase())) {
      score += 30;
    }

    // Brand match
    if (processedQuery.brands.includes(product.brand?.toLowerCase())) {
      score += 25;
    }

    // Description match
    if (product.description) {
      words.forEach(word => {
        if (product.description.toLowerCase().includes(word)) {
          score += 5;
        }
      });
    }

    // Price range match
    if (processedQuery.priceRange.min !== null || processedQuery.priceRange.max !== null) {
      const { min, max } = processedQuery.priceRange;
      if ((min === null || product.price >= min) && (max === null || product.price <= max)) {
        score += 15;
      }
    }

    // Attributes match
    Object.entries(processedQuery.attributes).forEach(([attr, value]) => {
      if (product[attr]?.toLowerCase() === value) {
        score += 10;
      }
    });

    // Tags match
    if (product.tags) {
      words.forEach(word => {
        if (product.tags.some(tag => tag.toLowerCase().includes(word))) {
          score += 8;
        }
      });
    }

    // Rating boost for high-rated products
    if (product.rating && product.rating >= 4.5) {
      score += 5;
    }

    // Popularity boost
    if (product.isBestseller) {
      score += 10;
    }

    return score;
  }

  // Get match reasons for explaining results
  getMatchReasons(product, processedQuery) {
    const reasons = [];
    const query = processedQuery.cleanQuery;

    if (product.name.toLowerCase().includes(query)) {
      reasons.push('Exact name match');
    }

    if (processedQuery.categories.includes(product.category?.toLowerCase())) {
      reasons.push(`Category: ${product.category}`);
    }

    if (processedQuery.brands.includes(product.brand?.toLowerCase())) {
      reasons.push(`Brand: ${product.brand}`);
    }

    if (product.rating >= 4.5) {
      reasons.push('Highly rated');
    }

    if (product.isBestseller) {
      reasons.push('Bestseller');
    }

    return reasons;
  }

  // Apply intelligent filters based on intent
  applyIntelligentFilters(results, processedQuery, options) {
    let filteredResults = [...results];

    // Apply intent-based filtering
    switch (processedQuery.intent) {
      case 'price_conscious':
        filteredResults = filteredResults.filter(r => r.product.price <= 100);
        break;
      case 'premium_focused':
        filteredResults = filteredResults.filter(r => r.product.price >= 200);
        break;
      case 'information_seeking':
        filteredResults = filteredResults.filter(r => r.product.rating >= 4.0);
        break;
    }

    // Apply pagination
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    return filteredResults.slice(offset, offset + limit);
  }

  // Generate smart search suggestions
  generateSearchSuggestions(query, products) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Auto-complete suggestions
    const uniqueNames = [...new Set(products.map(p => p.name))];
    uniqueNames.forEach(name => {
      if (name.toLowerCase().includes(lowerQuery) && name.toLowerCase() !== lowerQuery) {
        suggestions.push({
          type: 'autocomplete',
          text: name,
          reason: 'Product name'
        });
      }
    });

    // Category suggestions
    this.categoryKeywords.forEach((keywords, category) => {
      if (keywords.some(keyword => keyword.includes(lowerQuery))) {
        suggestions.push({
          type: 'category',
          text: `${query} in ${category}`,
          reason: 'Category suggestion'
        });
      }
    });

    // Popular search suggestions
    this.popularSearches.forEach((count, search) => {
      if (search.includes(lowerQuery) && search !== lowerQuery) {
        suggestions.push({
          type: 'popular',
          text: search,
          reason: 'Popular search'
        });
      }
    });

    return suggestions.slice(0, 8);
  }

  // Generate alternative query suggestions
  generateAlternativeQueries(processedQuery) {
    const alternatives = [];
    const { categories, brands, attributes } = processedQuery;

    // Suggest broader searches
    if (categories.length > 0) {
      alternatives.push(`All ${categories[0]} products`);
    }

    // Suggest brand-specific searches
    if (brands.length > 0) {
      alternatives.push(`${brands[0]} products`);
    }

    // Suggest attribute-based searches
    if (attributes.color) {
      alternatives.push(`${attributes.color} products`);
    }

    return alternatives;
  }

  // Track search for analytics
  trackSearch(query) {
    const cleanQuery = this.cleanQuery(query);
    
    // Update search history
    if (!this.searchHistory.has(cleanQuery)) {
      this.searchHistory.set(cleanQuery, []);
    }
    this.searchHistory.get(cleanQuery).push(Date.now());

    // Update popular searches
    const count = this.popularSearches.get(cleanQuery) || 0;
    this.popularSearches.set(cleanQuery, count + 1);
  }

  // Get search analytics
  getSearchAnalytics() {
    const topSearches = [...this.popularSearches.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const recentSearches = [...this.searchHistory.entries()]
      .map(([query, timestamps]) => ({
        query,
        lastSearched: Math.max(...timestamps),
        frequency: timestamps.length
      }))
      .sort((a, b) => b.lastSearched - a.lastSearched)
      .slice(0, 10);

    return {
      topSearches,
      recentSearches,
      totalSearches: [...this.popularSearches.values()].reduce((a, b) => a + b, 0)
    };
  }

  // Get trending searches
  getTrendingSearches() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const trending = [];

    this.searchHistory.forEach((timestamps, query) => {
      const recentCount = timestamps.filter(t => t > oneWeekAgo).length;
      if (recentCount > 0) {
        trending.push({ query, count: recentCount });
      }
    });

    return trending
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(t => t.query);
  }
}

// Create singleton instance
const aiSearchEngine = new AISearchEngine();

export default aiSearchEngine;