import React, { useState, useEffect } from 'react';
import { usePWA } from '../../context/PWAContext';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const InstallPrompt = () => {
  const { 
    isInstallable, 
    isInstalled, 
    promptInstall, 
    installMetrics 
  } = usePWA();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    // Check if user dismissed before (stored in localStorage)
    return localStorage.getItem('pwa-install-dismissed') === 'true';
  });

  useEffect(() => {
    // Don't show if already dismissed, installed, or not installable
    if (dismissed || isInstalled || !isInstallable) {
      setShowPrompt(false);
      return;
    }

    // Check prompt limit and cooldown
    const shouldShow = 
      installMetrics.promptsShown < 3 && 
      (!installMetrics.lastPromptDate || 
       Date.now() - new Date(installMetrics.lastPromptDate).getTime() > 7 * 24 * 60 * 60 * 1000);

    if (shouldShow) {
      // Delay showing prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 15000); // Show after 15 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed, installMetrics]);

  const handleInstall = async () => {
    try {
      const success = await promptInstall();
      if (success) {
        setShowPrompt(false);
      }
    } catch (e) {
      console.warn('Install failed:', e);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't render anything if not showing
  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="bg-amazon-orange rounded-lg p-2 flex-shrink-0">
              <ArrowDownTrayIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 font-semibold text-sm">
                Install Amazon Clone
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                Get faster access and offline browsing
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex space-x-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-amazon-orange text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;