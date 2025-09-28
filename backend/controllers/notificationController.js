const mongoose = require('mongoose');
const webpush = require('web-push');
const NotificationSubscription = require('../models/NotificationSubscription');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO, getUserSocketId } = require('../socket');
const Group = require('../models/Group');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:esimajetuoyo71@gmail.com', // Your email address
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Store new subscription
// Store new subscription with improved endpoint conflict handling
exports.subscribe = async (req, res) => {
  try {
    const subscriptionDataFromRequest = req.body;
    const currentUserId = req.user.userId;
    const endpoint = subscriptionDataFromRequest.endpoint;

    // First, check if there's an existing subscription with this endpoint
    const existingSubscription = await NotificationSubscription.findOne({ endpoint });

    if (existingSubscription) {
      // If the existing subscription belongs to the current user, update it
      if (existingSubscription.userId.toString() === currentUserId) {
        existingSubscription.keys = subscriptionDataFromRequest.keys;
        await existingSubscription.save();
        console.log('Subscription updated for user:', currentUserId, 'with existing endpoint:', endpoint);
        return res.status(200).json({ message: 'Subscription updated successfully' });
      } else {
        // If the endpoint is used by another user, remove the old subscription
        console.log('Removing old subscription for endpoint used by another user');
        await NotificationSubscription.deleteOne({ endpoint });
      }
    }

    // Now handle the upsert for the current user
    const userSubscription = await NotificationSubscription.findOneAndUpdate(
      { userId: currentUserId },
      {
        $set: {
          endpoint: subscriptionDataFromRequest.endpoint,
          keys: subscriptionDataFromRequest.keys,
          updatedAt: new Date()
        }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    const message = userSubscription.isNew ? 'Subscription created' : 'Subscription updated';
    console.log(`${message} for user: ${currentUserId} with endpoint: ${endpoint}`);
    return res.status(userSubscription.isNew ? 201 : 200).json({ message });

  } catch (error) {
    console.error('Error in subscribe function:', error);
    
    if (error.code === 11000) {
      // If we still get a duplicate key error, it means there was a race condition
      console.warn('Race condition detected in subscription endpoint handling');
      try {
        // Let's fetch and return the existing subscription
        const existing = await NotificationSubscription.findOne({ 
          endpoint: subscriptionDataFromRequest.endpoint 
        });
        
        if (existing) {
          console.log('Resolved race condition for endpoint:', existing.endpoint);
          return res.status(200).json({ 
            message: 'Subscription processed (race condition handled)',
            subscription: existing 
          });
        }
      } catch (nestedError) {
        console.error('Error in race condition handler:', nestedError);
      }
    }
    
    res.status(500).json({ 
      error: 'Error processing subscription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new notification (generic - primarily for DB storage and push)
exports.createNotification = async (userId, title, message, type, link = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link
    });

    // Send push notification if user has subscription
    const subscription = await NotificationSubscription.findOne({ userId });
    if (subscription) {
      const notificationPayload = JSON.stringify({
        title,
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        image: '/icons/icon-512x512.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        silent: false,
        tag: `notification-${type}`,
        data: {
          url: link || '/app/dashboard',
          timestamp: Date.now(),
          type: type
        },
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/icon-192x192.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      webpush.sendNotification(subscription, notificationPayload)
        .catch(error => {
          if (error.statusCode === 410) {
            // Subscription has expired or is no longer valid
            console.warn('Expired subscription found, deleting...', subscription.endpoint);
            return NotificationSubscription.deleteOne({ endpoint: subscription.endpoint });
          }
          console.error('Error sending push notification:', error);
          // Don't re-throw here, just log, so other notifications can still be sent.
        });
    }

    // Note: WebSocket notification is handled by specific create functions (planner, group)
    // or should be explicitly called after using this generic function if needed.

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notification count for a user
exports.getNotificationCount = async (req, res) => {
  try {
    // console.log('Fetching notification count for user:', req.user.userId);
    const count = await Notification.countDocuments({
      userId: req.user.userId,
      read: false
    });

    // console.log('Notification count:', count);
    res.json({ count });
  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({ message: 'Error getting notification count' });
  }
};

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    // console.log('Fetching notifications for user:', req.user.userId);
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // console.log('Fetched', notifications.length, 'notifications.');
    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Error getting notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    // console.log(`Marking notification ${notificationId} as read for user ${req.user.userId}`);
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
        // console.warn(`Notification ${notificationId} not found or does not belong to user ${req.user.userId}`);
        return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    // Emit WebSocket event to update the count and potentially the list
    sendWebSocketNotification(req.user.userId, notification, 'notificationRead');

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    // console.log(`Marking all notifications as read for user ${req.user.userId}`);
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );

    // Emit WebSocket event to update the count and potentially the list
    sendWebSocketNotification(req.user.userId, null, 'allNotificationsRead'); // Pass null for notification as we updated many

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

// Send simple mobile-friendly test push notification
exports.sendSimplePushNotification = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user's push subscription
    const subscription = await NotificationSubscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({
        message: 'No push subscription found. Please enable notifications first.'
      });
    }

    console.log('🔔 [DEBUG] Sending simple push notification to user:', userId);
    console.log('🔔 [DEBUG] Subscription endpoint:', subscription.endpoint);

    // Ultra-simple notification payload for mobile compatibility
    const notificationPayload = JSON.stringify({
      title: 'Mobile Push Test',
      body: 'Mobile push notification test',
      icon: '/icons/icon-192x192.png',
      tag: 'mobile-test'
    });

    console.log('🔔 [DEBUG] Notification payload:', notificationPayload);

    // Send the push notification
    const result = await webpush.sendNotification(subscription, notificationPayload);
    console.log('🔔 [DEBUG] Push notification result:', result);

    console.log('Simple test push notification sent successfully to user:', userId);
    res.json({
      message: 'Simple test push notification sent successfully!',
      debug: {
        userId,
        endpoint: subscription.endpoint,
        result: result
      }
    });

  } catch (error) {
    console.error('Error sending simple test push notification:', error);

    if (error.statusCode === 410) {
      // Subscription has expired
      await NotificationSubscription.deleteOne({ userId: req.user.userId });
      return res.status(410).json({
        message: 'Push subscription has expired. Please re-enable notifications.'
      });
    }

    res.status(500).json({
      message: 'Error sending simple test push notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Send test push notification
exports.sendTestPushNotification = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user's push subscription
    const subscription = await NotificationSubscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({
        message: 'No push subscription found. Please enable notifications first.'
      });
    }

    const notificationPayload = JSON.stringify({
      title: 'Test Push Notification',
      body: 'This is a test push notification from Student Buddy!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      image: '/icons/icon-512x512.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      silent: false,
      tag: 'test-notification',
      data: {
        url: '/app/dashboard',
        timestamp: Date.now(),
        type: 'test'
      },
      actions: [
        {
          action: 'view',
          title: 'View Dashboard',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });

    // Send the push notification
    await webpush.sendNotification(subscription, notificationPayload);

    console.log('Test push notification sent successfully to user:', userId);
    res.json({ message: 'Test push notification sent successfully!' });

  } catch (error) {
    console.error('Error sending test push notification:', error);

    if (error.statusCode === 410) {
      // Subscription has expired
      await NotificationSubscription.deleteOne({ userId: req.user.userId });
      return res.status(410).json({
        message: 'Push subscription has expired. Please re-enable notifications.'
      });
    }

    res.status(500).json({
      message: 'Error sending test push notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// Send broadcast push notification to all subscribers
const sendBroadcastNotification = async (title, body, url = null) => {
  try {
    const subscriptions = await NotificationSubscription.find();
    
    const notificationPayload = JSON.stringify({
      title,
      body,
      url
    });

    // Send notifications in parallel
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, notificationPayload);
        // console.log('Push notification sent to', subscription.endpoint);
      } catch (error) {
        if (error.statusCode === 410) {
          console.warn('Expired subscription found during broadcast, deleting...', subscription.endpoint);
          await NotificationSubscription.deleteOne({ endpoint: subscription.endpoint });
        } else {
          console.error('Error sending broadcast push notification to', subscription.endpoint, ':', error);
        }
      }
    });

    await Promise.all(sendPromises); // Wait for all send operations (success or handled failure)

  } catch (error) {
    console.error('Error in sendBroadcastNotification:', error);
  }
};

// Send WebSocket notification to a specific user
const sendWebSocketNotification = (userId, notification, eventType = 'newNotification') => {
  try {
    const io = getIO(); // Corrected casing
    const userSocketId = getUserSocketId(userId); // Get the socket ID for the user

    if (userSocketId) {
      console.log(`Emitting ${eventType} event to user ${userId} (socket: ${userSocketId})`);
      io.to(userSocketId).emit(eventType, notification);
    } else {
      console.log(`User ${userId} is not currently connected via WebSocket. Cannot send ${eventType} event.`);
    }

  } catch (error) {
    console.error('Error sending WebSocket notification:', error);
  }
};


// Create group chat notification (DB, Push, WebSocket to multiple recipients)
exports.createGroupChatNotification = async (senderId, groupId, content, groupName) => {
  try {
    // Find the group and populate members
    const group = await Group.findById(groupId).populate('members', '_id'); 
    if (!group) {
        console.warn(`Group not found for ID: ${groupId}`);
        return null; 
    }

    // Find all members of the group EXCEPT the sender
    const recipientIds = group.members
      .map(member => member._id.toString())
      .filter(memberId => memberId !== senderId.toString());

    console.log(`Creating group chat notifications for recipients: ${recipientIds.join(', ')}`);

    const notifications = [];

    for (const recipientId of recipientIds) {
        // Create DB notification
        const notification = await Notification.create({
            userId: recipientId,
            title: `New message in ${groupName}`,
            message: content,
            type: 'group_chat',
            link: `/groups/${groupId}` // Link to the group chat
        });
        notifications.push(notification);

        // Send push notification
        const subscription = await NotificationSubscription.findOne({ userId: recipientId });
        if (subscription) {
            const notificationPayload = JSON.stringify({
                title: `New message in ${groupName}`,
                body: content,
                url: `/groups/${groupId}`
            });

            webpush.sendNotification(subscription, notificationPayload)
              .catch(error => {
                if (error.statusCode === 410) {
                  console.warn('Expired subscription found during group chat notification, deleting...', subscription.endpoint);
                  return NotificationSubscription.deleteOne({ endpoint: subscription.endpoint });
                }
                console.error('Error sending group chat push notification to user', recipientId, ':', error);
              });
        }

        // Send WebSocket notification
        sendWebSocketNotification(recipientId, notification, 'newNotification');
    }

    return notifications; // Return the created notifications

  } catch (error) {
    console.error('Error creating group chat notification:', error);
    throw error;
  }
};

// Create a notification for shared tasks
exports.createSharedTaskNotification = async (taskId, sharedWithUserId, sharedByUserId) => {
  try {
    const task = await Task.findById(taskId).populate('user', 'name email');
    const sharedByUser = await User.findById(sharedByUserId);

    if (!task || !sharedByUser) {
      throw new Error('Task or user not found');
    }

    const notification = new Notification({
      userId: sharedWithUserId,
      title: '🔄 New Shared Task',
      message: `${sharedByUser.name} shared a task with you: "${task.title}"`,
      type: 'sync_shared_task',
      link: '/app/planner'
    });

    await notification.save();
    await sendSyncNotification(sharedWithUserId, notification, 'shared_task');
    return notification;
  } catch (error) {
    console.error('Error creating shared task notification:', error);
    throw error;
  }
};

// Create a notification for task completion
exports.createTaskCompletionNotification = async (taskId, completedByUserId, notifyUserId) => {
  try {
    const task = await Task.findById(taskId).populate('user', 'name email');
    const completedByUser = await User.findById(completedByUserId);

    if (!task || !completedByUser) {
      throw new Error('Task or user not found');
    }

    const notification = new Notification({
      userId: notifyUserId,
      title: '✅ Task Completed',
      message: `${completedByUser.name} completed the task: "${task.title}"`,
      type: 'sync_task_completion',
      link: '/app/planner'
    });

    await notification.save();
    await sendSyncNotification(notifyUserId, notification, 'task_completion');
    return notification;
  } catch (error) {
    console.error('Error creating task completion notification:', error);
    throw error;
  }
};

// Create a notification for new messages
exports.createNewMessageNotification = async (messageId, senderId, recipientId) => {
  try {
    const sender = await User.findById(senderId);

    if (!sender) {
      throw new Error('Sender not found');
    }

    const notification = new Notification({
      userId: recipientId,
      title: '💬 New Message',
      message: `${sender.name} sent you a message`,
      type: 'sync_new_message',
      link: '/app/chatbot'
    });

    await notification.save();
    await sendSyncNotification(recipientId, notification, 'new_message');
    return notification;
  } catch (error) {
    console.error('Error creating new message notification:', error);
    throw error;
  }
};

// Enhanced sync notification sender
const sendSyncNotification = async (userId, notification, syncType) => {
  try {
    const subscription = await NotificationSubscription.findOne({ userId });

    // Enhanced notification payload for sync events
    const notificationPayload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      image: '/icons/icon-512x512.png',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      silent: false,
      tag: `sync-${syncType}`,
      data: {
        url: notification.link || '/app/dashboard',
        timestamp: Date.now(),
        type: notification.type,
        syncType: syncType,
        notificationId: notification._id
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });

    if (subscription) {
      console.log(`📱 Sending sync notification (${syncType}) to user:`, userId);

      webpush.sendNotification(subscription, notificationPayload)
        .then(sendResult => {
          console.log('✅ Sync push notification sent successfully:', sendResult);

          // Send WebSocket notification with sync metadata
          sendWebSocketNotification(userId, {
            ...notification.toObject(),
            pushSent: true,
            fallback: false,
            syncType: syncType
          }, 'syncNotification');
        })
        .catch(error => {
          console.error('❌ Error sending sync push notification:', error);

          // Send WebSocket notification as fallback
          sendWebSocketNotification(userId, {
            ...notification.toObject(),
            pushSent: false,
            fallback: true,
            fallbackReason: `Push failed: ${error.statusCode || 'Unknown error'}`,
            syncType: syncType
          }, 'syncNotification');
        });
    } else {
      console.log(`🔄 No push subscription found for user ${userId}, using WebSocket for sync notification`);

      // Send WebSocket notification as primary method
      sendWebSocketNotification(userId, {
        ...notification.toObject(),
        pushSent: false,
        fallback: true,
        fallbackReason: 'No push subscription found',
        syncType: syncType
      }, 'syncNotification');
    }
  } catch (error) {
    console.error('Error sending sync notification:', error);
    throw error;
  }
};