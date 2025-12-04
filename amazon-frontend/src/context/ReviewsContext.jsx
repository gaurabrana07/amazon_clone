import React, { createContext, useContext, useState, useEffect } from 'react';

const ReviewsContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

// Sample enhanced reviews data
const sampleReviews = [
  {
    id: 'rev_001',
    productId: 1,
    userId: 'user_001',
    userName: 'Rajesh Kumar',
    userAvatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=rajesh',
    rating: 5,
    title: 'Amazing Gaming Experience!',
    content: 'The PlayStation 5 exceeded all my expectations. The graphics are incredible, loading times are virtually non-existent, and the DualSense controller with haptic feedback is revolutionary. Worth every penny!',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518521214971-1509e4c40141?w=400&h=300&fit=crop'
    ],
    videos: [],
    isVerifiedPurchase: true,
    isVineReview: false,
    helpfulCount: 247,
    notHelpfulCount: 8,
    createdAt: new Date('2024-10-01T10:30:00Z'),
    updatedAt: new Date('2024-10-01T10:30:00Z'),
    variant: 'Standard Edition',
    pros: ['Lightning fast loading', 'Amazing graphics', 'Great exclusive games'],
    cons: ['Expensive', 'Large size'],
    tags: ['performance', 'graphics', 'gaming']
  },
  {
    id: 'rev_002',
    productId: 1,
    userId: 'user_002',
    userName: 'Priya Sharma',
    userAvatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=priya',
    rating: 4,
    title: 'Great console but has issues',
    content: 'The PS5 is definitely a step up from PS4. The games look stunning and the new controller features are impressive. However, I had some initial setup issues and the console is quite large.',
    images: [],
    videos: [],
    isVerifiedPurchase: true,
    isVineReview: false,
    helpfulCount: 89,
    notHelpfulCount: 12,
    createdAt: new Date('2024-09-28T14:15:00Z'),
    updatedAt: new Date('2024-09-28T14:15:00Z'),
    variant: 'Digital Edition',
    pros: ['Great performance', 'Improved controller'],
    cons: ['Setup complexity', 'Size'],
    tags: ['performance', 'setup']
  },
  {
    id: 'rev_003',
    productId: 2,
    userId: 'user_003',
    userName: 'Amit Patel',
    userAvatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=amit',
    rating: 5,
    title: 'Perfect for developers!',
    content: 'The M2 MacBook Air is a beast for development work. Compilation times are incredibly fast, battery life is amazing, and the display is gorgeous. The silent operation is a huge plus.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'
    ],
    videos: [],
    isVerifiedPurchase: true,
    isVineReview: false,
    helpfulCount: 156,
    notHelpfulCount: 3,
    createdAt: new Date('2024-09-25T09:20:00Z'),
    updatedAt: new Date('2024-09-25T09:20:00Z'),
    variant: '512GB Storage',
    pros: ['Excellent performance', 'Great battery life', 'Silent operation'],
    cons: ['Expensive', 'Limited ports'],
    tags: ['development', 'performance', 'battery']
  },
  {
    id: 'rev_004',
    productId: 3,
    userId: 'user_004',
    userName: 'Sarah Johnson',
    userAvatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=sarah',
    rating: 5,
    title: 'Best phone camera ever!',
    content: 'The S24 Ultra camera is phenomenal. The 200MP sensor captures incredible detail, and the S Pen integration is seamless. Battery life easily lasts a full day of heavy usage.',
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop'
    ],
    videos: [],
    isVerifiedPurchase: true,
    isVineReview: false,
    helpfulCount: 134,
    notHelpfulCount: 5,
    createdAt: new Date('2024-09-20T16:45:00Z'),
    updatedAt: new Date('2024-09-20T16:45:00Z'),
    variant: '512GB Storage',
    pros: ['Amazing camera', 'S Pen functionality', 'Great battery life'],
    cons: ['Expensive', 'Heavy'],
    tags: ['camera', 'photography', 'battery']
  },
  {
    id: 'rev_005',
    productId: 4,
    userId: 'user_005',
    userName: 'Mike Wilson',
    userAvatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=mike',
    rating: 4,
    title: 'Classic sneaker, great quality',
    content: 'The Air Force 1 is a timeless classic. Quality is excellent, very comfortable for daily wear. The leather upper ages beautifully. Only downside is they can be a bit narrow for wide feet.',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=300&fit=crop'
    ],
    videos: [],
    isVerifiedPurchase: true,
    isVineReview: false,
    helpfulCount: 67,
    notHelpfulCount: 4,
    createdAt: new Date('2024-09-15T11:20:00Z'),
    updatedAt: new Date('2024-09-15T11:20:00Z'),
    variant: 'White/White',
    pros: ['Comfortable', 'Durable', 'Classic style'],
    cons: ['Narrow fit', 'Shows dirt easily'],
    tags: ['comfort', 'style', 'durability']
  }
];

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState(sampleReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewFilters, setReviewFilters] = useState({
    rating: 0,
    verified: false,
    withMedia: false,
    sortBy: 'helpful'
  });

  // Load additional reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('amazon_user_reviews');
    if (savedReviews) {
      try {
        const parsed = JSON.parse(savedReviews);
        setReviews(prev => [...prev, ...parsed]);
      } catch (error) {
        console.error('Error parsing saved reviews:', error);
      }
    }
  }, []);

  // Save user reviews to localStorage
  useEffect(() => {
    const userReviews = reviews.filter(review => !sampleReviews.find(sample => sample.id === review.id));
    if (userReviews.length > 0) {
      localStorage.setItem('amazon_user_reviews', JSON.stringify(userReviews));
    }
  }, [reviews]);

  // Get reviews for a specific product
  const getProductReviews = (productId, filters = {}) => {
    let productReviews = reviews.filter(review => review.productId === parseInt(productId));
    
    // Apply filters
    if (filters.rating && filters.rating > 0) {
      productReviews = productReviews.filter(review => review.rating === filters.rating);
    }
    
    if (filters.verified) {
      productReviews = productReviews.filter(review => review.isVerifiedPurchase);
    }
    
    if (filters.withMedia) {
      productReviews = productReviews.filter(review => 
        (review.images && review.images.length > 0) || 
        (review.videos && review.videos.length > 0)
      );
    }
    
    // Apply sorting
    switch (filters.sortBy || 'helpful') {
      case 'newest':
        productReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        productReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rating_high':
        productReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        productReviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
      default:
        productReviews.sort((a, b) => 
          (b.helpfulCount - b.notHelpfulCount) - (a.helpfulCount - a.notHelpfulCount)
        );
        break;
    }
    
    return productReviews;
  };

  // Get review statistics for a product
  const getReviewStats = (productId) => {
    const productReviews = reviews.filter(review => review.productId === parseInt(productId));
    
    if (productReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verifiedPurchasePercentage: 0
      };
    }
    
    const totalReviews = productReviews.length;
    const averageRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(review => {
      ratingBreakdown[review.rating]++;
    });
    
    const verifiedCount = productReviews.filter(review => review.isVerifiedPurchase).length;
    const verifiedPurchasePercentage = (verifiedCount / totalReviews) * 100;
    
    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingBreakdown,
      verifiedPurchasePercentage: Math.round(verifiedPurchasePercentage)
    };
  };

  // Add a new review
  const addReview = async (reviewData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newReview = {
        id: `rev_${Date.now()}`,
        ...reviewData,
        helpfulCount: 0,
        notHelpfulCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerifiedPurchase: true // In real app, check purchase history
      };
      
      setReviews(prev => [newReview, ...prev]);
      return { success: true, review: newReview };
    } catch (error) {
      console.error('Error adding review:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Mark review as helpful/not helpful
  const markReviewHelpful = (reviewId, isHelpful) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        if (isHelpful) {
          return { ...review, helpfulCount: review.helpfulCount + 1 };
        } else {
          return { ...review, notHelpfulCount: review.notHelpfulCount + 1 };
        }
      }
      return review;
    }));
  };

  // Get user's reviews
  const getUserReviews = (userId) => {
    return reviews.filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Update review
  const updateReview = async (reviewId, updateData) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            ...updateData,
            updatedAt: new Date()
          };
        }
        return review;
      }));
      return { success: true };
    } catch (error) {
      console.error('Error updating review:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Get featured reviews (high rating + helpful)
  const getFeaturedReviews = (productId, limit = 3) => {
    return getProductReviews(productId)
      .filter(review => review.rating >= 4)
      .sort((a, b) => (b.helpfulCount - b.notHelpfulCount) - (a.helpfulCount - a.notHelpfulCount))
      .slice(0, limit);
  };

  const value = {
    reviews,
    reviewFilters,
    isLoading,
    getProductReviews,
    getReviewStats,
    addReview,
    updateReview,
    deleteReview,
    markReviewHelpful,
    getUserReviews,
    getFeaturedReviews,
    setReviewFilters
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};

export default ReviewsContext;