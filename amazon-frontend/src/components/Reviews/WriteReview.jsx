import React, { useState } from 'react';
import { useReviews } from '../../context/ReviewsContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  StarIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  XMarkIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const WriteReview = ({ productId, productName, onClose, onSuccess }) => {
  const { addReview, isLoading } = useReviews();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
    pros: [''],
    cons: [''],
    images: [],
    variant: ''
  });
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
    
    if (errors.rating) {
      setErrors(prev => ({
        ...prev,
        rating: ''
      }));
    }
  };

  const handleArrayInput = (type, index, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const removeArrayItem = (type, index) => {
    if (formData[type].length > 1) {
      setFormData(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  const handleImageFiles = (files) => {
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length + formData.images.length > 10) {
      showNotification('Maximum 10 images allowed', 'error');
      return;
    }

    validImages.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rating) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a review title';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title should be at least 10 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Please write your review';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Review should be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showNotification('Please login to write a review', 'error');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const reviewData = {
      productId: parseInt(productId),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || `https://api.dicebear.com/7.x/avatars/svg?seed=${user.name}`,
      rating: formData.rating,
      title: formData.title.trim(),
      content: formData.content.trim(),
      images: formData.images,
      variant: formData.variant.trim(),
      pros: formData.pros.filter(pro => pro.trim()).map(pro => pro.trim()),
      cons: formData.cons.filter(con => con.trim()).map(con => con.trim()),
      tags: [] // Could be auto-generated based on content analysis
    };

    const result = await addReview(reviewData);
    
    if (result.success) {
      showNotification('Review submitted successfully!', 'success');
      onSuccess && onSuccess();
      onClose && onClose();
    } else {
      showNotification('Failed to submit review. Please try again.', 'error');
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {star <= formData.rating ? (
              <StarSolidIcon className="h-8 w-8 text-yellow-400 hover:text-yellow-500 transition-colors" />
            ) : (
              <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400 transition-colors" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating > 0 && (
            <span>
              {formData.rating} star{formData.rating !== 1 ? 's' : ''}
            </span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Write a Review for {productName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating *
                </label>
                {renderStarRating()}
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Summarize your experience..."
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={100}
                />
                <div className="flex justify-between mt-1">
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.title.length}/100
                  </p>
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Share details about your experience with this product..."
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={2000}
                />
                <div className="flex justify-between mt-1">
                  {errors.content && (
                    <p className="text-sm text-red-600">{errors.content}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.content.length}/2000
                  </p>
                </div>
              </div>

              {/* Variant */}
              <div>
                <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Variant (Optional)
                </label>
                <input
                  type="text"
                  id="variant"
                  value={formData.variant}
                  onChange={(e) => handleInputChange('variant', e.target.value)}
                  placeholder="e.g., 512GB Storage, White Color, Size Large..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pros (Optional)
                  </label>
                  {formData.pros.map((pro, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={pro}
                        onChange={(e) => handleArrayInput('pros', index, e.target.value)}
                        placeholder="What did you like?"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.pros.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('pros', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('pros')}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Pro</span>
                  </button>
                </div>

                {/* Cons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cons (Optional)
                  </label>
                  {formData.cons.map((con, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={con}
                        onChange={(e) => handleArrayInput('cons', index, e.target.value)}
                        placeholder="What could be better?"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.cons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('cons', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('cons')}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Con</span>
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional)
                </label>
                
                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-sm text-gray-600">
                    <label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Click to upload
                    </label>
                    <span> or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB (max 10 images)
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;