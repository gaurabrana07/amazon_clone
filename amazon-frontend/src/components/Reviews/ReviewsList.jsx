import React, { useState } from 'react';
import { useReviews } from '../../context/ReviewsContext';
import { 
  StarIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  CheckBadgeIcon,
  PhotoIcon,
  PlayIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const ReviewsList = ({ productId, className = '' }) => {
  const { getProductReviews, getReviewStats, markReviewHelpful, reviewFilters, setReviewFilters } = useReviews();
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [selectedImageReview, setSelectedImageReview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const reviews = getProductReviews(productId, reviewFilters);
  const stats = getReviewStats(productId);

  const handleFilterChange = (filterType, value) => {
    setReviewFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleReviewExpansion = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const handleImageClick = (review, imageIndex) => {
    setSelectedImageReview(review);
    setSelectedImage(imageIndex);
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500">
          <StarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
          <p>Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Review Statistics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.averageRating}
            </div>
            <div className="flex justify-center mb-2">
              {renderStarRating(Math.round(stats.averageRating))}
            </div>
            <p className="text-sm text-gray-600">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.verifiedPurchasePercentage}% verified purchases
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingBreakdown[rating];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="w-8 text-right">{rating}</span>
                  <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter by:</label>
          <select
            value={reviewFilters.rating}
            onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>All ratings</option>
            <option value={5}>5 stars</option>
            <option value={4}>4 stars</option>
            <option value={3}>3 stars</option>
            <option value={2}>2 stars</option>
            <option value={1}>1 star</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="verified-filter"
            checked={reviewFilters.verified}
            onChange={(e) => handleFilterChange('verified', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="verified-filter" className="text-sm text-gray-700">
            Verified purchases only
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="media-filter"
            checked={reviewFilters.withMedia}
            onChange={(e) => handleFilterChange('withMedia', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="media-filter" className="text-sm text-gray-700">
            With photos/videos
          </label>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={reviewFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="helpful">Most helpful</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="rating_high">Highest rating</option>
            <option value="rating_low">Lowest rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const contentToShow = isExpanded ? review.content : truncateContent(review.content);
          const shouldShowExpandButton = review.content.length > 300;

          return (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              {/* Review Header */}
              <div className="flex items-start space-x-4 mb-3">
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{review.userName}</h4>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <CheckBadgeIcon className="h-4 w-4" />
                        <span>Verified Purchase</span>
                      </div>
                    )}
                    {review.isVineReview && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        Vine Customer Review
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStarRating(review.rating)}
                    <span className="text-sm font-medium text-gray-900">{review.title}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Reviewed on {formatDate(review.createdAt)}</span>
                    {review.variant && (
                      <span>Variant: {review.variant}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="ml-14">
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {contentToShow}
                </p>

                {shouldShowExpandButton && (
                  <button
                    onClick={() => toggleReviewExpansion(review.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-3"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}

                {/* Pros and Cons */}
                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {review.pros?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-2">Pros:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {review.pros.map((pro, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-2">Cons:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {review.cons.map((con, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-500 mr-2">-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {review.images?.length > 0 && (
                  <div className="flex space-x-2 mb-4 overflow-x-auto">
                    {review.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(review, index)}
                        className="flex-shrink-0 relative group"
                      >
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Review Videos */}
                {review.videos?.length > 0 && (
                  <div className="flex space-x-2 mb-4">
                    {review.videos.map((video, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                          <PlayIcon className="h-8 w-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Tags */}
                {review.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Helpful Actions */}
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">Was this review helpful?</span>
                  <button
                    onClick={() => markReviewHelpful(review.id, true)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <HandThumbUpIcon className="h-4 w-4" />
                    <span>Yes ({review.helpfulCount})</span>
                  </button>
                  <button
                    onClick={() => markReviewHelpful(review.id, false)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <HandThumbDownIcon className="h-4 w-4" />
                    <span>No ({review.notHelpfulCount})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Modal */}
      {selectedImageReview && selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="max-w-4xl max-h-full relative">
            <button
              onClick={() => {
                setSelectedImageReview(null);
                setSelectedImage(null);
              }}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl"
            >
              ✕ Close
            </button>
            <img
              src={selectedImageReview.images[selectedImage]}
              alt="Review image"
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
              <p className="text-sm">
                Review by {selectedImageReview.userName} • {formatDate(selectedImageReview.createdAt)}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Image {selectedImage + 1} of {selectedImageReview.images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;