import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import SmartRecommendations from './SmartRecommendations';
import { 
  UserIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const PersonalizedHomepage = () => {
  const { user, isAuthenticated } = useAuth();
  const { recommendations, trackBehavior } = useRecommendations();
  const [timeOfDay, setTimeOfDay] = useState('');
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');

  // Determine time of day for personalized greeting
  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = '';
    let timePhase = '';

    if (hour < 12) {
      greeting = 'Good morning';
      timePhase = 'morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
      timePhase = 'afternoon';
    } else {
      greeting = 'Good evening';
      timePhase = 'evening';
    }

    setTimeOfDay(timePhase);
    setPersonalizedGreeting(
      isAuthenticated && user?.name 
        ? `${greeting}, ${user.name.split(' ')[0]}!`
        : `${greeting}!`
    );
  }, [isAuthenticated, user]);

  // Track homepage view
  useEffect(() => {
    trackBehavior('view', 'homepage', { section: 'personalized_homepage' });
  }, [trackBehavior]);

  // Get personalized sections based on user behavior and time
  const getPersonalizedSections = () => {
    const sections = [];

    // Always show personalized recommendations if user is authenticated
    if (isAuthenticated) {
      sections.push({
        type: 'personal',
        title: 'Recommended for You',
        subtitle: 'Based on your shopping history and preferences',
        icon: SparklesIcon,
        priority: 1
      });
    }

    // Show trending products
    sections.push({
      type: 'trending',
      title: 'Trending Now',
      subtitle: 'Popular products others are buying',
      icon: ArrowTrendingUpIcon,
      priority: 2
    });

    // Time-based recommendations
    if (timeOfDay === 'morning') {
      sections.push({
        type: 'personal',
        title: 'Start Your Day Right',
        subtitle: 'Morning essentials and productivity boosters',
        filter: ['Electronics', 'Health', 'Books'],
        icon: ClockIcon,
        priority: 3
      });
    } else if (timeOfDay === 'evening') {
      sections.push({
        type: 'personal',
        title: 'Unwind & Relax',
        subtitle: 'Perfect for your evening routine',
        filter: ['Home', 'Entertainment', 'Beauty'],
        icon: ClockIcon,
        priority: 3
      });
    }

    // Special occasions (you can enhance this with calendar integration)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    if (dayOfWeek === 5) { // Friday
      sections.push({
        type: 'trending',
        title: 'Weekend Ready',
        subtitle: 'Get ready for the weekend',
        filter: ['Fashion', 'Entertainment', 'Sports'],
        icon: GiftIcon,
        priority: 4
      });
    }

    return sections.sort((a, b) => a.priority - b.priority);
  };

  const personalizedSections = getPersonalizedSections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Personalized Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {personalizedGreeting}
              </h1>
              <p className="text-blue-100 text-lg">
                {isAuthenticated 
                  ? "Discover products tailored just for you"
                  : "Welcome to your personalized shopping experience"
                }
              </p>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 rounded-lg p-4">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              {isAuthenticated && (
                <div className="text-right">
                  <p className="text-sm text-blue-100">Welcome back!</p>
                  <p className="font-semibold">Let's find something amazing</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats for authenticated users */}
          {isAuthenticated && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {recommendations.personal.length}
                </div>
                <div className="text-sm text-blue-100">New Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15%</div>
                <div className="text-sm text-blue-100">Average Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2-3</div>
                <div className="text-sm text-blue-100">Days Delivery</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personalized Recommendation Sections */}
      <div className="space-y-8">
        {personalizedSections.map((section, index) => (
          <SmartRecommendations
            key={`${section.type}-${index}`}
            type={section.type}
            title={section.title}
            limit={8}
            showReason={section.type === 'personal'}
            className="transform hover:scale-[1.01] transition-transform duration-200"
          />
        ))}
      </div>

      {/* AI Insights Section */}
      {isAuthenticated && recommendations.personal.length > 0 && (
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI Shopping Insights
            </h2>
            <p className="text-gray-600">
              Personalized insights based on your shopping behavior
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Picks</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Products perfectly matched to your style and preferences
                </p>
                <div className="text-2xl font-bold text-blue-600">
                  {recommendations.personal.length}
                </div>
                <div className="text-xs text-gray-500">new recommendations</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <GiftIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Best Deals</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Exclusive discounts on products you'll love
                </p>
                <div className="text-2xl font-bold text-green-600">25%</div>
                <div className="text-xs text-gray-500">average savings</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Style</h3>
                <p className="text-sm text-gray-600 mb-3">
                  AI-analyzed shopping preferences and patterns
                </p>
                <div className="text-2xl font-bold text-purple-600">High</div>
                <div className="text-xs text-gray-500">match accuracy</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action for Non-authenticated Users */}
      {!isAuthenticated && (
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <SparklesIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Get Personalized Recommendations
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Sign in to unlock AI-powered product recommendations tailored specifically to your preferences, 
            shopping history, and style. Our smart algorithm learns what you love and suggests products you'll actually want to buy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In for Smart Recommendations
            </a>
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Create Account
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedHomepage;