class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.checkPermission();
  }

  async checkPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      this.hasPermission = true;
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === "granted";
    }
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.hasPermission = permission === "granted";
    return this.hasPermission;
  }

  async scheduleNotification(task) {
    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const startTime = new Date(task.startTime);
    const now = new Date();
    const timeUntilStart = startTime - now;

    if (timeUntilStart <= 0) return;

    // Schedule notification 15 minutes before
    const notificationTime = timeUntilStart - (15 * 60 * 1000);
    if (notificationTime > 0) {
      setTimeout(() => {
        this.showNotification(task);
      }, notificationTime);
    }
  }

  showNotification(task) {
    if (!this.hasPermission) return;

    const notification = new Notification("Task Reminder", {
      body: `${task.title} starts in 15 minutes!`,
      icon: "/favicon.ico", // Add your app icon
      tag: task._id,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // In-app notification
  showInAppNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

export const notificationService = new NotificationService(); 