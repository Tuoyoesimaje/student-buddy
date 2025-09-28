const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// Store connected clients
const clients = new Map();

function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    try {
      // Get token from query string
      const token = new URL(req.url, 'wss://student-buddy-backend.onrender.com').searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Store client connection
      clients.set(userId, ws);

      // Send initial notification count
      const notificationCount = await getNotificationCount(userId);
      ws.send(JSON.stringify({ type: 'notification_count', count: notificationCount }));

      ws.on('close', () => {
        clients.delete(userId);
      });

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  return wss;
}

// Function to send notification to specific user
function sendNotification(userId, notification) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'notification',
      data: notification
    }));
  }
}

// Function to broadcast notification to all connected clients
function broadcastNotification(notification) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  });
}

module.exports = {
  initializeWebSocket,
  sendNotification,
  broadcastNotification
}; 