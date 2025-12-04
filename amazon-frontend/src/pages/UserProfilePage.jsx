import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../context/UserProfileContext';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewsContext';
import { usePriceTracking } from '../context/PriceTrackingContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  UserIcon,
  StarIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  HeartIcon,
  ShoppingBagIcon,
  TrophyIcon,
  PhotoIcon,
  PencilIcon,
  CheckCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const UserProfilePage = () => {
  const { 
    getCurrentUserProfile, 
    getCurrentUserStats, 
    updateUserProfile,
    calculateUserLevel,
    isLoading 
  } = useUserProfile();
  const { user, isAuthenticated } = useAuth();
  const { getUserReviews } = useReviews();
  const { getUserPriceAlerts } = usePriceTracking();
  const { getUserSegment, getPersonalizedRecommendations } = useAnalytics();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const profile = getCurrentUserProfile();
  const stats = getCurrentUserStats();
  const userReviews = getUserReviews();
  const priceAlerts = getUserPriceAlerts();
  const userSegment = getUserSegment();
  const recommendations = getPersonalizedRecommendations();

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        socialMedia: profile.socialMedia || {}
      });
    }
  }, [profile]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const userLevel = calculateUserLevel(stats);

  const handleSaveProfile = async () => {
    const result = await updateUserProfile(editForm);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* User Level & Progress */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">{userLevel.title}</h3>
            <p className="text-orange-100">Level {userLevel.level}</p>
          </div>
          <TrophyIcon className="h-12 w-12 text-orange-200" />
        </div>
        <div className="w-full bg-orange-400 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${userLevel.progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-orange-100 mt-2">
          {userLevel.progress.toFixed(1)}% to next level
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats?.reviewsCount || 0}</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats?.helpfulVotes || 0}</p>
              <p className="text-sm text-gray-600">Helpful Votes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats?.questionsAnswered || 0}</p>
              <p className="text-sm text-gray-600">Q&A Answers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <ShoppingBagIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPurchases || 0}</p>
              <p className="text-sm text-gray-600">Purchases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {stats?.recentActivity?.length ? (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'review' ? 'bg-yellow-100' :
                    activity.type === 'helpful' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    {activity.type === 'review' && <StarIcon className="h-4 w-4 text-yellow-600" />}
                    {activity.type === 'helpful' && <HeartIcon className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'answer' && <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.productName}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* Achievements */}
      {stats?.achievements?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Achievements</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500">
                      Earned on {formatDate(achievement.earnedDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>
      
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="City, Country"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">{profile.email}</p>
                {profile.location && (
                  <p className="text-sm text-gray-500">{profile.location}</p>
                )}
              </div>
            </div>

            {profile.bio && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {profile.badges?.map((badge, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      badge.color === 'green' ? 'bg-green-100 text-green-800' :
                      badge.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      badge.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Member Since</h4>
              <p className="text-gray-600">{formatDate(profile.joinedDate)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">My Reviews</h3>
      </div>
      <div className="p-6">
        {userReviews?.length ? (
          <div className="space-y-6">
            {userReviews.slice(0, 5).map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{review.title}</h4>
                    <p className="text-sm text-gray-600">{review.productName}</p>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.content.slice(0, 200)}...</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatDate(review.createdAt)}</span>
                  <span className="flex items-center space-x-1">
                    <HeartIcon className="h-4 w-4" />
                    <span>{review.helpful} helpful</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">You haven't written any reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPriceAlertsTab = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Price Alerts</h3>
      </div>
      <div className="p-6">
        {priceAlerts?.length ? (
          <div className="space-y-4">
            {priceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={alert.productImage}
                    alt={alert.productName}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.productName}</h4>
                    <p className="text-sm text-gray-600">
                      Target: ₹{alert.targetPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ₹{alert.currentPrice.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-sm ${
                    alert.currentPrice <= alert.targetPrice ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {alert.currentPrice <= alert.targetPrice ? 'Target reached!' : 'Monitoring...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No price alerts set up yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'reviews', name: 'Reviews', icon: StarIcon },
    { id: 'alerts', name: 'Price Alerts', icon: BellIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{userLevel.title} • {userSegment} customer</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    Member since {formatDate(profile.joinedDate)}
                  </span>
                  {profile.badges?.slice(0, 2).map((badge, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        badge.color === 'green' ? 'bg-green-100 text-green-800' :
                        badge.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        badge.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
          {activeTab === 'alerts' && renderPriceAlertsTab()}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;