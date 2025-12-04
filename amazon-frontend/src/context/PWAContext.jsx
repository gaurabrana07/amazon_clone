import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

// Lightweight PWA Provider - minimal overhead
export const PWAProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const value = useMemo(() => ({
    isInstallable,
    isInstalled: false,
    isOnline,
    updateAvailable: false,
    capabilities: {
      share: typeof navigator !== 'undefined' && 'share' in navigator,
      notification: typeof window !== 'undefined' && 'Notification' in window
    },
    installMetrics: { promptsShown: 0, installsSuccessful: 0 },
    promptInstall,
    updateApp: () => {},
    requestNotificationPermission: async () => 'default',
    shareContent: async () => false,
    vibrate: () => false,
    getCurrentPosition: () => Promise.reject(new Error('Not implemented')),
    requestCameraAccess: () => Promise.reject(new Error('Not implemented')),
    enterFullscreen: async () => false,
    exitFullscreen: async () => false,
    copyToClipboard: async () => false,
    addOfflineAction: () => {}
  }), [isInstallable, isOnline, promptInstall]);

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

export default PWAContext;
