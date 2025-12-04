import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const UserProfileContext = createContext();

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  
  const [profiles, setProfiles] = useState({});
  const [userStats, setUserStats] = useState({});
  const [preferences, setPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Sample user profiles data
  const sampleProfiles = {
    1: {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=John",
      joinedDate: new Date('2023-06-15'),
      location: "New York, USA",
      bio: "Tech enthusiast and gadget reviewer. I love trying out the latest technology and sharing honest reviews to help fellow shoppers make informed decisions.",
      badges: [
        { type: 'verified', label: 'Verified Reviewer', icon: '✓', color: 'green' },
        { type: 'helpful', label: 'Helpful Contributor', icon: '👍', color: 'blue' },
        { type: 'top_reviewer', label: 'Top 1% Reviewer', icon: '⭐', color: 'gold' }
      ],
      socialMedia: {
        twitter: "@johntech",
        instagram: "@johntechreviews"
      },
      preferences: {
        emailNotifications: true,
        productRecommendations: true,
        priceAlerts: true,
        reviewNotifications: true,
        marketingEmails: false
      },
      privacy: {
        showProfile: true,
        showReviews: true,
        showPurchases: false,
        showWishlist: false
      }
    },
    2: {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=Sarah",
      joinedDate: new Date('2022-11-20'),
      location: "California, USA",
      bio: "Fashion and beauty lover. Always on the lookout for quality products at great prices!",
      badges: [
        { type: 'verified', label: 'Verified Reviewer', icon: '✓', color: 'green' },
        { type: 'fashionista', label: 'Fashion Expert', icon: '👗', color: 'pink' }
      ],
      preferences: {
        emailNotifications: true,
        productRecommendations: true,
        priceAlerts: false,
        reviewNotifications: true,
        marketingEmails: true
      }
    }
  };

  // Sample user statistics
  const sampleStats = {
    1: {
      reviewsCount: 24,
      helpfulVotes: 156,
      questionsAnswered: 8,
      averageRating: 4.3,
      reviewsThisMonth: 3,
      totalPurchases: 47,
      memberSince: "June 2023",
      reviewViews: 2840,
      topCategories: [
        { category: "Electronics", count: 12, percentage: 50 },
        { category: "Home & Garden", count: 6, percentage: 25 },
        { category: "Books", count: 4, percentage: 17 },
        { category: "Sports", count: 2, percentage: 8 }
      ],
      recentActivity: [
        {
          type: 'review',
          productName: 'iPhone 15 Pro Max',
          action: 'Wrote a review',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          rating: 5
        },
        {
          type: 'helpful',
          productName: 'Samsung Galaxy Watch',
          action: 'Received helpful vote',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'answer',
          productName: 'MacBook Pro M3',
          action: 'Answered a question',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ],
      achievements: [
        {
          title: "First Review",
          description: "Posted your first product review",
          earnedDate: new Date('2023-06-20'),
          icon: "🎉"
        },
        {
          title: "Helpful Reviewer",
          description: "Received 100+ helpful votes",
          earnedDate: new Date('2024-02-15'),
          icon: "👍"
        },
        {
          title: "Question Master",
          description: "Answered 5+ customer questions",
          earnedDate: new Date('2024-05-10'),
          icon: "🎓"
        }
      ]
    }
  };

  useEffect(() => {
    // Load user profiles and stats from localStorage
    const savedProfiles = localStorage.getItem('userProfiles');
    const savedStats = localStorage.getItem('userStats');
    const savedPreferences = localStorage.getItem('userPreferences');

    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      setProfiles(sampleProfiles);
      localStorage.setItem('userProfiles', JSON.stringify(sampleProfiles));
    }

    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    } else {
      setUserStats(sampleStats);
      localStorage.setItem('userStats', JSON.stringify(sampleStats));
    }

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const getCurrentUserProfile = () => {
    if (!isAuthenticated || !user) return null;
    
    // If user profile doesn't exist, create a default one
    if (!profiles[user.id]) {
      const defaultProfile = {
        id: user.id,
        name: user.name || "User",
        email: user.email || "",
        avatar: user.avatar || `https://api.dicebear.com/7.x/avatars/svg?seed=${user.name || 'User'}`,
        joinedDate: new Date(user.createdAt || Date.now()),
        location: "",
        bio: "Welcome to Amazon! Start exploring and reviewing products.",
        badges: [
          { type: 'new', label: 'New Member', icon: '🎉', color: 'blue' }
        ],
        socialMedia: {},
        preferences: {
          emailNotifications: true,
          productRecommendations: true,
          priceAlerts: true,
          reviewNotifications: true,
          marketingEmails: false
        },
        privacy: {
          showProfile: true,
          showReviews: true,
          showPurchases: false,
          showWishlist: false
        }
      };
      
      const updatedProfiles = {
        ...profiles,
        [user.id]: defaultProfile
      };
      
      setProfiles(updatedProfiles);
      localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
      return defaultProfile;
    }
    
    return profiles[user.id];
  };

  const getCurrentUserStats = () => {
    if (!isAuthenticated || !user) return null;
    
    // If user stats don't exist, create default ones
    if (!userStats[user.id]) {
      const defaultStats = {
        reviewsCount: 0,
        helpfulVotes: 0,
        questionsAnswered: 0,
        averageRating: 0,
        reviewsThisMonth: 0,
        totalPurchases: 0,
        memberSince: new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        reviewViews: 0,
        topCategories: [],
        recentActivity: [],
        achievements: [
          {
            title: "Welcome!",
            description: "You've joined the Amazon community",
            earnedDate: new Date(user.createdAt || Date.now()),
            icon: "🎉"
          }
        ]
      };
      
      const updatedStats = {
        ...userStats,
        [user.id]: defaultStats
      };
      
      setUserStats(updatedStats);
      localStorage.setItem('userStats', JSON.stringify(updatedStats));
      return defaultStats;
    }
    
    return userStats[user.id];
  };

  const updateUserProfile = async (profileData) => {
    if (!isAuthenticated || !user) {
      showNotification('Please login to update profile', 'error');
      return { success: false };
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProfiles = {
        ...profiles,
        [user.id]: {
          ...profiles[user.id],
          ...profileData,
          updatedAt: new Date()
        }
      };

      setProfiles(updatedProfiles);
      localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
      
      showNotification('Profile updated successfully!', 'success');
      return { success: true };
    } catch (error) {
      showNotification('Failed to update profile', 'error');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreferences = async (newPreferences) => {
    if (!isAuthenticated || !user) {
      showNotification('Please login to update preferences', 'error');
      return { success: false };
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedPreferences = {
        ...preferences,
        [user.id]: {
          ...preferences[user.id],
          ...newPreferences
        }
      };

      setPreferences(updatedPreferences);
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      
      // Also update in profiles
      const updatedProfiles = {
        ...profiles,
        [user.id]: {
          ...profiles[user.id],
          preferences: {
            ...profiles[user.id]?.preferences,
            ...newPreferences
          }
        }
      };
      
      setProfiles(updatedProfiles);
      localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
      
      showNotification('Preferences updated successfully!', 'success');
      return { success: true };
    } catch (error) {
      showNotification('Failed to update preferences', 'error');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = (userId) => {
    return profiles[userId] || null;
  };

  const getUserStats = (userId) => {
    return userStats[userId] || null;
  };

  const addUserActivity = (activity) => {
    if (!isAuthenticated || !user) return;

    const currentStats = userStats[user.id] || {};
    const updatedActivity = [activity, ...(currentStats.recentActivity || [])].slice(0, 10);

    const updatedStats = {
      ...userStats,
      [user.id]: {
        ...currentStats,
        recentActivity: updatedActivity
      }
    };

    setUserStats(updatedStats);
    localStorage.setItem('userStats', JSON.stringify(updatedStats));
  };

  const incrementUserStat = (statType, increment = 1) => {
    if (!isAuthenticated || !user) return;

    const currentStats = userStats[user.id] || {};
    const updatedStats = {
      ...userStats,
      [user.id]: {
        ...currentStats,
        [statType]: (currentStats[statType] || 0) + increment
      }
    };

    setUserStats(updatedStats);
    localStorage.setItem('userStats', JSON.stringify(updatedStats));
  };

  const getTopReviewers = () => {
    return Object.values(profiles)
      .map(profile => ({
        ...profile,
        stats: userStats[profile.id] || {}
      }))
      .sort((a, b) => (b.stats.helpfulVotes || 0) - (a.stats.helpfulVotes || 0))
      .slice(0, 10);
  };

  const calculateUserLevel = (stats) => {
    if (!stats) return { level: 1, title: 'New Reviewer', progress: 0 };

    const totalScore = (stats.reviewsCount || 0) * 10 + 
                      (stats.helpfulVotes || 0) * 2 + 
                      (stats.questionsAnswered || 0) * 5;

    let level = 1;
    let title = 'New Reviewer';
    
    if (totalScore >= 500) {
      level = 5;
      title = 'Master Reviewer';
    } else if (totalScore >= 200) {
      level = 4;
      title = 'Expert Reviewer';
    } else if (totalScore >= 100) {
      level = 3;
      title = 'Advanced Reviewer';
    } else if (totalScore >= 50) {
      level = 2;
      title = 'Regular Reviewer';
    }

    const nextLevelThresholds = [0, 50, 100, 200, 500];
    const currentThreshold = nextLevelThresholds[level - 1];
    const nextThreshold = nextLevelThresholds[level] || 1000;
    const progress = ((totalScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    return { level, title, progress: Math.min(progress, 100), totalScore };
  };

  const value = {
    profiles,
    userStats,
    preferences,
    isLoading,
    getCurrentUserProfile,
    getCurrentUserStats,
    updateUserProfile,
    updateUserPreferences,
    getUserProfile,
    getUserStats,
    addUserActivity,
    incrementUserStat,
    getTopReviewers,
    calculateUserLevel
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileContext;