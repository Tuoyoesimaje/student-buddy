// Polling-based notification system for mobile browsers
import api from './axios';
import { showLocalNotification } from './notifications';

class NotificationPoller {
  constructor() {
    this.isPolling = false;
    this.pollInterval = null;
    this.lastNotificationId = null;
    this.pollIntervalMs = 30000; // Poll every 30 seconds
    this.userId = null;
  }

  start(userId) {
    if (this.isPolling) {
      console.log('📊 Notification polling already active');
      return;
    }

    this.userId = userId;
    this.isPolling = true;
    
    console.log('📊 Starting notification polling for user:', userId);
    
    // Initial poll
    this.pollForNotifications();
    
    // Set up interval polling
    this.pollInterval = setInterval(() => {
      this.pollForNotifications();
    }, this.pollIntervalMs);
  }

  stop() {
    if (!this.isPolling) {
      return;
    }

    console.log('📊 Stopping notification polling');
    
    this.isPolling = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.lastNotificationId = null;
    this.userId = null;
  }

  async pollForNotifications() {
    if (!this.userId) {
      return;
    }

    try {
      console.log('📊 Polling for new notifications...');
      
      // Get recent notifications from backend
      const response = await api.get('/api/notifications', {
        params: {
          limit: 5,
          since: this.lastNotificationId
        }
      });

      const notifications = response.data.notifications || [];
      
      if (notifications.length > 0) {
        console.log('📊 Found', notifications.length, 'new notifications');
        
        // Process new notifications
        notifications.forEach(notification => {
          this.handleNewNotification(notification);
        });
        
        // Update last notification ID
        this.lastNotificationId = notifications[0]._id;
      } else {
        console.log('📊 No new notifications found');
      }

    } catch (error) {
      console.error('📊 Error polling for notifications:', error);
      
      // If we get a 401, the user is probably logged out
      if (error.response?.status === 401) {
        console.log('📊 Authentication error, stopping polling');
        this.stop();
      }
    }
  }

  handleNewNotification(notification) {
    console.log('📊 Processing polled notification:', notification);
    
    // Check if this is a recent notification (within last 5 minutes)
    const notificationTime = new Date(notification.createdAt);
    const now = new Date();
    const timeDiff = now - notificationTime;
    const fiveMinutes = 5 * 60 * 1000;
    
    if (timeDiff > fiveMinutes) {
      console.log('📊 Notification is too old, skipping');
      return;
    }

    // Show local notification
    const title = notification.title || 'New Notification';
    const body = notification.message || 'You have a new notification';
    
    // Add polling indicator
    const displayTitle = `📊 ${title}`;
    const displayBody = `${body} (via polling)`;
    
    showLocalNotification(displayTitle, displayBody);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('polledNotification', {
      detail: notification
    }));
  }

  // Test function
  sendTest() {
    console.log('📊 Testing notification polling...');
    
    if (this.isPolling) {
      // Force a poll
      this.pollForNotifications();
      return true;
    } else {
      console.log('📊 Polling not active');
      return false;
    }
  }

  // Check if polling is active
  isActive() {
    return this.isPolling;
  }
}

// Create singleton instance
const notificationPoller = new NotificationPoller();

// Export functions
export const startNotificationPolling = (userId) => {
  notificationPoller.start(userId);
};

export const stopNotificationPolling = () => {
  notificationPoller.stop();
};

export const testNotificationPolling = () => {
  return notificationPoller.sendTest();
};

export const isPollingActive = () => {
  return notificationPoller.isActive();
};

export default notificationPoller;
