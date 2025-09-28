const express = require('express');
const router = express.Router();
const path = require('path');
const notificationController = require(path.join(__dirname, '../controllers/notificationController'));
const authenticateToken = require('../middleware/auth');

// Create wrapper functions for each route handler
const handleSubscribe = (req, res) => {
  return notificationController.subscribe(req, res);
};

const handleGetNotificationCount = (req, res) => {
  return notificationController.getNotificationCount(req, res);
};

const handleGetNotifications = (req, res) => {
  return notificationController.getNotifications(req, res);
};

const handleMarkAsRead = (req, res) => {
  return notificationController.markAsRead(req, res);
};

const handleMarkAllAsRead = (req, res) => {
  return notificationController.markAllAsRead(req, res);
};

const handleSendTestPushNotification = (req, res) => {
  return notificationController.sendTestPushNotification(req, res);
};

const handleSendSimplePushNotification = (req, res) => {
  return notificationController.sendSimplePushNotification(req, res);
};

const handleDebugNotificationSystem = (req, res) => {
  return notificationController.debugNotificationSystem(req, res);
};

const handleDebugTaskReminders = (req, res) => {
  return notificationController.debugTaskReminders(req, res);
};

// Subscribe to push notifications
router.post('/subscribe', authenticateToken, handleSubscribe);

// Get notification count
router.get('/count', authenticateToken, handleGetNotificationCount);

// Get all notifications
router.get('/', authenticateToken, handleGetNotifications);

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, handleMarkAsRead);

// Mark all notifications as read
router.put('/read-all', authenticateToken, handleMarkAllAsRead);

// Send test push notification
router.post('/test-push', authenticateToken, handleSendTestPushNotification);

// Send simple test push notification
router.post('/test-simple', authenticateToken, handleSendSimplePushNotification);

// Debug notification system
router.get('/debug', authenticateToken, handleDebugNotificationSystem);

// Debug task reminders
router.get('/debug-reminders', authenticateToken, handleDebugTaskReminders);

module.exports = router;