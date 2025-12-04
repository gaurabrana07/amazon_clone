import React, { useState, useRef, useEffect } from 'react';
import { usePWA } from '../../context/PWAContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const PullToRefresh = ({ children, onRefresh, disabled = false }) => {
  const { vibrate } = usePWA();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isTracking = useRef(false);
  
  const maxPullDistance = 120;
  const triggerDistance = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        isTracking.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isTracking.current || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        
        const pullDist = Math.min(distance * 0.5, maxPullDistance);
        setPullDistance(pullDist);
        setIsPulling(pullDist > 10);
        
        const shouldRefresh = pullDist >= triggerDistance;
        if (shouldRefresh !== canRefresh) {
          setCanRefresh(shouldRefresh);
          if (shouldRefresh) {
            vibrate([50]); // Haptic feedback when trigger point is reached
          }
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isTracking.current || isRefreshing) return;

      isTracking.current = false;

      if (canRefresh && onRefresh) {
        setIsRefreshing(true);
        vibrate([100]); // Haptic feedback on refresh trigger
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      // Reset state
      setIsPulling(false);
      setPullDistance(0);
      setCanRefresh(false);
    };

    // Add event listeners with passive: false to prevent default on touchmove
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, isRefreshing, canRefresh, onRefresh, vibrate]);

  const refreshIndicatorStyle = {
    transform: `translateY(${isPulling || isRefreshing ? pullDistance : -60}px)`,
    opacity: isPulling || isRefreshing ? 1 : 0,
    transition: isTracking.current ? 'none' : 'all 0.3s ease-out'
  };

  const contentStyle = {
    transform: `translateY(${isPulling && !isRefreshing ? pullDistance * 0.3 : 0}px)`,
    transition: isTracking.current ? 'none' : 'all 0.3s ease-out'
  };

  const getRefreshText = () => {
    if (isRefreshing) return 'Refreshing...';
    if (canRefresh) return 'Release to refresh';
    return 'Pull to refresh';
  };

  const getRefreshIcon = () => {
    if (isRefreshing) {
      return (
        <ArrowPathIcon className="h-6 w-6 text-amazon-orange animate-spin" />
      );
    }
    
    const rotation = canRefresh ? 180 : (pullDistance / triggerDistance) * 180;
    return (
      <ArrowPathIcon 
        className="h-6 w-6 text-amazon-orange transition-transform duration-200" 
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    );
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center h-16 bg-gray-50 border-b border-gray-200 z-10"
        style={refreshIndicatorStyle}
      >
        <div className="flex items-center space-x-2">
          {getRefreshIcon()}
          <span className={`text-sm font-medium transition-colors ${
            canRefresh ? 'text-amazon-orange' : 'text-gray-600'
          }`}>
            {getRefreshText()}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-24 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-amazon-orange transition-all duration-200 rounded-full"
            style={{ width: `${Math.min((pullDistance / triggerDistance) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {children}
      </div>

      {/* Loading overlay for refresh */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <ArrowPathIcon className="h-6 w-6 text-amazon-orange animate-spin" />
            <span className="text-gray-700 font-medium">Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;