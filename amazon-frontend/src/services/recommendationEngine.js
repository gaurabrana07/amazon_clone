// AI-Powered Recommendation Engine
// Implements multiple recommendation algorithms for personalized shopping experience

class RecommendationEngine {
  constructor() {
    this.userBehaviorData = new Map();
    this.productSimilarities = new Map();
    this.categoryTrends = new Map();
    this.sessionData = new Map();
  }

  // Track user behavior for ML training
  trackUserBehavior(userId, action, productId, metadata = {}) {
    if (!this.userBehaviorData.has(userId)) {
      this.userBehaviorData.set(userId, []);
    }
    
    const behavior = {
      action, // 'view', 'cart', 'purchase', 'wishlist', 'search'
      productId,
      timestamp: Date.now(),
      metadata,
      weight: this.getActionWeight(action)
    };
    
    this.userBehaviorData.get(userId).push(behavior);
    
    // Keep only last 1000 behaviors per user for performance
    const behaviors = this.userBehaviorData.get(userId);
    if (behaviors.length > 1000) {
      this.userBehaviorData.set(userId, behaviors.slice(-1000));
    }
  }

  // Get weight for different actions (for ML scoring)
  getActionWeight(action) {
    const weights = {
      'view': 1,
      'search': 2,
      'wishlist': 3,
      'cart': 4,
      'purchase': 10,
      'review': 5,
      'share': 3
    };
    return weights[action] || 1;
  }

  // Collaborative Filtering: Users who liked this also liked
  getCollaborativeRecommendations(userId, products, limit = 10) {
    const userBehaviors = this.userBehaviorData.get(userId) || [];
    const userInteractions = new Set(userBehaviors.map(b => b.productId));
    
    // Find similar users based on overlapping interests
    const similarUsers = this.findSimilarUsers(userId, userInteractions);
    
    // Get recommendations from similar users
    const recommendations = new Map();
    
    similarUsers.forEach(similarUser => {
      const similarUserBehaviors = this.userBehaviorData.get(similarUser.userId) || [];
      
      similarUserBehaviors.forEach(behavior => {
        if (!userInteractions.has(behavior.productId)) {
          const score = (recommendations.get(behavior.productId) || 0) + 
                       (behavior.weight * similarUser.similarity);
          recommendations.set(behavior.productId, score);
        }
      });
    });

    // Convert to product objects and sort by score
    return Array.from(recommendations.entries())
      .map(([productId, score]) => ({
        product: products.find(p => p.id === parseInt(productId)),
        score,
        reason: 'Users with similar interests also liked this'
      }))
      .filter(item => item.product)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Content-Based Filtering: Based on product similarities
  getContentBasedRecommendations(userId, products, limit = 10) {
    const userBehaviors = this.userBehaviorData.get(userId) || [];
    const recentBehaviors = userBehaviors
      .filter(b => Date.now() - b.timestamp < 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Recent 20 interactions

    if (recentBehaviors.length === 0) {
      return this.getTrendingRecommendations(products, limit);
    }

    const recommendations = new Map();
    
    recentBehaviors.forEach(behavior => {
      const sourceProduct = products.find(p => p.id === parseInt(behavior.productId));
      if (!sourceProduct) return;

      // Find similar products
      const similarProducts = this.findSimilarProducts(sourceProduct, products);
      
      similarProducts.forEach(similar => {
        if (similar.product.id !== sourceProduct.id) {
          const score = (recommendations.get(similar.product.id) || 0) + 
                       (similar.similarity * behavior.weight);
          recommendations.set(similar.product.id, score);
        }
      });
    });

    return Array.from(recommendations.entries())
      .map(([productId, score]) => ({
        product: products.find(p => p.id === productId),
        score,
        reason: 'Based on your recent interests'
      }))
      .filter(item => item.product)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Trending products for new users or fallback
  getTrendingRecommendations(products, limit = 10) {
    const now = Date.now();
    const trendingScores = new Map();

    // Calculate trending scores based on recent user activity
    this.userBehaviorData.forEach(behaviors => {
      behaviors
        .filter(b => now - b.timestamp < 7 * 24 * 60 * 60 * 1000) // Last 7 days
        .forEach(behavior => {
          const score = (trendingScores.get(behavior.productId) || 0) + behavior.weight;
          trendingScores.set(behavior.productId, score);
        });
    });

    return Array.from(trendingScores.entries())
      .map(([productId, score]) => ({
        product: products.find(p => p.id === parseInt(productId)),
        score,
        reason: 'Trending now'
      }))
      .filter(item => item.product)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Hybrid recommendation combining multiple approaches
  getHybridRecommendations(userId, products, limit = 10) {
    const collaborative = this.getCollaborativeRecommendations(userId, products, limit * 2);
    const contentBased = this.getContentBasedRecommendations(userId, products, limit * 2);
    const trending = this.getTrendingRecommendations(products, limit);

    // Merge recommendations with weighted scores
    const hybridScores = new Map();

    // Weight: 40% collaborative, 40% content-based, 20% trending
    collaborative.forEach(item => {
      hybridScores.set(item.product.id, (hybridScores.get(item.product.id) || 0) + item.score * 0.4);
    });

    contentBased.forEach(item => {
      hybridScores.set(item.product.id, (hybridScores.get(item.product.id) || 0) + item.score * 0.4);
    });

    trending.forEach(item => {
      hybridScores.set(item.product.id, (hybridScores.get(item.product.id) || 0) + item.score * 0.2);
    });

    return Array.from(hybridScores.entries())
      .map(([productId, score]) => ({
        product: products.find(p => p.id === productId),
        score,
        reason: 'Personalized for you'
      }))
      .filter(item => item.product)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Find users with similar preferences
  findSimilarUsers(userId, userInteractions) {
    const similarities = [];
    
    this.userBehaviorData.forEach((behaviors, otherUserId) => {
      if (otherUserId === userId) return;
      
      const otherInteractions = new Set(behaviors.map(b => b.productId));
      const similarity = this.calculateJaccardSimilarity(userInteractions, otherInteractions);
      
      if (similarity > 0.1) { // Minimum similarity threshold
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Top 10 similar users
  }

  // Find products similar to a given product
  findSimilarProducts(sourceProduct, allProducts) {
    return allProducts
      .map(product => ({
        product,
        similarity: this.calculateProductSimilarity(sourceProduct, product)
      }))
      .filter(item => item.similarity > 0.3) // Minimum similarity threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20); // Top 20 similar products
  }

  // Calculate Jaccard similarity between two sets
  calculateJaccardSimilarity(setA, setB) {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  }

  // Calculate product similarity based on multiple factors
  calculateProductSimilarity(productA, productB) {
    let similarity = 0;
    let factors = 0;

    // Category similarity (40% weight)
    if (productA.category === productB.category) {
      similarity += 0.4;
    }
    factors++;

    // Price range similarity (20% weight)
    const priceRatio = Math.min(productA.price, productB.price) / Math.max(productA.price, productB.price);
    similarity += priceRatio * 0.2;
    factors++;

    // Brand similarity (20% weight)
    if (productA.brand === productB.brand) {
      similarity += 0.2;
    }
    factors++;

    // Rating similarity (10% weight)
    const ratingDiff = Math.abs((productA.rating || 0) - (productB.rating || 0));
    const ratingSimilarity = Math.max(0, 1 - ratingDiff / 5);
    similarity += ratingSimilarity * 0.1;
    factors++;

    // Tag/keyword similarity (10% weight)
    if (productA.tags && productB.tags) {
      const tagSimilarity = this.calculateJaccardSimilarity(
        new Set(productA.tags),
        new Set(productB.tags)
      );
      similarity += tagSimilarity * 0.1;
    }
    factors++;

    return similarity;
  }

  // Get recommendations for product detail page
  getRelatedProducts(productId, products, limit = 4) {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return [];

    return this.findSimilarProducts(product, products)
      .slice(0, limit)
      .map(item => ({
        product: item.product,
        score: item.similarity,
        reason: 'Similar products'
      }));
  }

  // Get recommendations for cart page (cross-sell)
  getCrossSellRecommendations(cartItems, products, limit = 6) {
    const recommendations = new Map();
    
    cartItems.forEach(cartItem => {
      const similarProducts = this.findSimilarProducts(cartItem, products);
      similarProducts.forEach(similar => {
        const isInCart = cartItems.some(item => item.id === similar.product.id);
        if (!isInCart) {
          const score = (recommendations.get(similar.product.id) || 0) + similar.similarity;
          recommendations.set(similar.product.id, score);
        }
      });
    });

    return Array.from(recommendations.entries())
      .map(([productId, score]) => ({
        product: products.find(p => p.id === productId),
        score,
        reason: 'Frequently bought together'
      }))
      .filter(item => item.product)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Initialize with sample data for demonstration
  initializeWithSampleData() {
    // Sample user behaviors for demo
    const sampleBehaviors = [
      { userId: 'user1', action: 'purchase', productId: '1' },
      { userId: 'user1', action: 'view', productId: '2' },
      { userId: 'user1', action: 'cart', productId: '3' },
      { userId: 'user2', action: 'purchase', productId: '1' },
      { userId: 'user2', action: 'purchase', productId: '4' },
      { userId: 'user3', action: 'view', productId: '2' },
      { userId: 'user3', action: 'cart', productId: '5' },
    ];

    sampleBehaviors.forEach(behavior => {
      this.trackUserBehavior(behavior.userId, behavior.action, behavior.productId);
    });
  }
}

// Create singleton instance
const recommendationEngine = new RecommendationEngine();

// Initialize with sample data
recommendationEngine.initializeWithSampleData();

export default recommendationEngine;