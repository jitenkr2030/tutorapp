'use client';

import { useEffect, useState } from 'react';

export interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInfo {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  supportsOffline: boolean;
  supportsNotifications: boolean;
  supportsBackgroundSync: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    supportsOffline: false,
    supportsNotifications: false,
    supportsBackgroundSync: false,
    installPrompt: null
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');

    // Check if PWA is installed
    const isInstalled = localStorage.getItem('pwaInstalled') === 'true';

    setPwaInfo(prev => ({
      ...prev,
      isStandalone,
      isInstalled
    }));

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check feature support
    const supportsOffline = 'serviceWorker' in navigator && 'caches' in window;
    const supportsNotifications = 'Notification' in window && 'PushManager' in window;
    const supportsBackgroundSync = 'serviceWorker' in navigator && 'SyncManager' in window;

    setPwaInfo(prev => ({
      ...prev,
      supportsOffline,
      supportsNotifications,
      supportsBackgroundSync
    }));

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          setRegistration(reg);
          console.log('Service Worker registered successfully');
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setPwaInfo(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: promptEvent
      }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setPwaInfo(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
      localStorage.setItem('pwaInstalled', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!pwaInfo.installPrompt) {
      console.error('Install prompt not available');
      return;
    }

    try {
      const prompt = pwaInfo.installPrompt;
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaInfo(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          installPrompt: null
        }));
        localStorage.setItem('pwaInstalled', 'true');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!pwaInfo.supportsNotifications) {
      console.error('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return false;
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!registration || !pwaInfo.supportsNotifications) {
      console.error('Service worker not registered or notifications not supported');
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Push notification subscription failed:', error);
      return null;
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    if (!registration) {
      console.error('Service worker not registered');
      return false;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push notification unsubscription failed:', error);
      return false;
    }
  };

  const checkForUpdates = async () => {
    if (registration) {
      try {
        await registration.update();
        console.log('Service Worker updated successfully');
      } catch (error) {
        console.error('Service Worker update failed:', error);
      }
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Cache cleared successfully');
        return true;
      } catch (error) {
        console.error('Cache clearing failed:', error);
        return false;
      }
    }
    return false;
  };

  const registerBackgroundSync = async (tag: string) => {
    if (!registration || !pwaInfo.supportsBackgroundSync) {
      console.error('Background sync not supported');
      return false;
    }

    try {
      await registration.sync.register(tag);
      console.log(`Background sync registered for tag: ${tag}`);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  };

  return {
    ...pwaInfo,
    isOnline,
    registration,
    installPWA,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    checkForUpdates,
    clearCache,
    registerBackgroundSync
  };
}