// Utility functions for handling browser notifications

// Convert VAPID key to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Request notification permission from the user
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Show a local notification (mobile-compatible)
export const showLocalNotification = async (title, body) => {
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  try {
    // Check if we're on mobile or if Service Worker is available
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && 'serviceWorker' in navigator) {
      // Use Service Worker for mobile browsers
      console.log('Using Service Worker for mobile notification');
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'local-notification',
        requireInteraction: false
      });
    } else {
      // Use direct Notification constructor for desktop
      console.log('Using direct Notification constructor');
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
      });
    }
  } catch (error) {
    console.error('Error showing local notification:', error);

    // Fallback: try the other method
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          tag: 'fallback-notification'
        });
      }
    } catch (fallbackError) {
      console.error('Fallback notification also failed:', fallbackError);
    }
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  try {
    // Ensure service worker is registered and ready
    const registration = await navigator.serviceWorker.ready; // Wait for SW to be ready
    console.log('Service Worker is ready:', registration); // Added log

    // Convert VAPID key
    const applicationServerKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY);
    
    // Get push subscription
    console.log('Attempting to subscribe with PushManager...'); // Added log
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    console.log('PushManager subscribed successfully:', subscription); // Added log

    // Send subscription to backend
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Sending subscription to backend...'); // Added log
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/notifications/subscribe`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Get more details from error response
      console.error('Backend subscription failed. Status:', response.status, 'Body:', errorBody); // Added log
      throw new Error(`Failed to subscribe to notifications. Status: ${response.status}`);
    }
    
    console.log('Subscription sent to backend successfully.'); // Added log
    return true;
  } catch (error) {
    console.error('Error in subscribeToPushNotifications:', error); // Changed log
    // Re-throw or handle specific errors if needed, e.g., AbortError
    if (error.name === 'AbortError') {
        console.error('Subscription aborted. This might be due to a quick navigation or SW issue.');
    }
    return false;
  }
};