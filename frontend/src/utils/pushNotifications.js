// Convert a base64 string to a Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Get browser compatibility information
export const getBrowserCompatibility = () => {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);

  return {
    isIOS,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    supportsPush: 'PushManager' in window,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsNotifications: 'Notification' in window,
    // iOS Safari doesn't support push notifications for PWAs
    canUsePushNotifications: !isIOS || !isSafari,
    // Firefox has limited push support
    hasLimitedPushSupport: isFirefox,
    // Safari on macOS supports push notifications
    isSafariDesktop: isSafari && !isIOS
  };
};

// Request permission for notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('Notification permission already granted');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Subscribe to push notifications with validation
export const subscribeToPushNotifications = async () => {
  // Check browser compatibility first
  const compatibility = getBrowserCompatibility();

  if (!compatibility.supportsServiceWorker) {
    console.log('Service Worker not supported');
    throw new Error('Service Worker not supported');
  }

  if (!compatibility.canUsePushNotifications) {
    console.log('Push notifications not supported on this browser/device');
    throw new Error('Push notifications not supported on this browser/device');
  }

  try {
    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check if push manager is available
    if (!('pushManager' in registration)) {
      console.log('Push messaging is not supported');
      throw new Error('Push messaging is not supported');
    }

    // Get the VAPID public key from environment variables
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID public key is not configured');
      throw new Error('Push notifications are not properly configured');
    }

    // Convert VAPID key to Uint8Array
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Check for existing subscription and validate it
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Validate existing subscription by attempting a test push
      console.log('Validating existing push subscription...');
      try {
        const testPayload = JSON.stringify({
          title: 'Subscription Test',
          body: 'Validating subscription',
          tag: 'subscription-test',
          silent: true
        });

        // Try to send a test notification to validate the subscription
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const testResponse = await fetch(`${backendUrl}/api/notifications/test-simple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ test: true })
        });

        if (testResponse.ok) {
          console.log('Existing subscription is valid');
        } else {
          console.log('Existing subscription validation failed, creating new one');
          subscription = null;
        }
      } catch (validationError) {
        console.log('Subscription validation failed, creating new one:', validationError);
        subscription = null;
      }
    }

    // If no valid subscription exists, create a new one
    if (!subscription) {
      console.log('Creating new push subscription...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      console.log('New push subscription created:', subscription);
    } else {
      console.log('Using validated existing push subscription');
    }

    // Send the subscription to the server
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to save subscription:', error);
      throw new Error('Failed to save subscription');
    }

    console.log('Push subscription successful and saved to server');
    return subscription;
  } catch (error) {
    console.error('Error in subscribeToPushNotifications:', error);
    throw error;
  }
};

// Send a test notification
export const sendTestNotification = (title = 'Test Notification', options = {}) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return;
  }

  const defaultOptions = {
    body: 'This is a test notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    ...options
  };

  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(title, defaultOptions);
  });
};


