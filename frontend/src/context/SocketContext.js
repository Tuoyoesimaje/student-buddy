import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides the token and authLoading
import { showLocalNotification } from '../utils/notifications';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token, userId, authLoading } = useAuth(); // Get token, userId, and authLoading from AuthContext
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const socketRef = useRef(null); // Use ref to keep socket instance stable

  console.log('SocketProvider rendering.');
  console.log('Render Deps: authLoading =', authLoading, ', token =', !!token, ', userId =', !!userId);

  useEffect(() => {
    console.log('SocketContext useEffect triggered.');
    console.log('Deps: authLoading =', authLoading, ', token =', !!token, ', userId =', !!userId, ', socketRef.current =', !!socketRef.current);

    // Prevent duplicate effect runs if socket is already being initialized
    if (socketRef.current) {
        console.log('SocketContext: Socket already exists or is being initialized. Skipping effect logic.');
        return;
    }

    // Connect only if authLoading is false, token and userId are available, and socket is not already connected
    if (!authLoading && token && userId) {
      console.log('SocketContext: Attempting to connect...');
      console.log('SocketContext: User ID:', userId);
      console.log('SocketContext: Token available:', !!token);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      console.log('🔌 Connecting to Socket.IO:', backendUrl);

      const newSocket = io(backendUrl, {
        auth: {
          token: token,
        },
        query: { // Optional: send userId as query param if needed on backend
          userId: userId
        }
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Event listeners
      newSocket.on('connect', () => {
        console.log('Socket.IO connected', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        setSocket(null); // Clear socket state on disconnect
        socketRef.current = null; // Clear ref as well
        setNotificationCount(0); // Reset count on disconnect
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
        // You might want to show a user-facing error or attempt reconnection
      });

      // --- Notification Events ---
      newSocket.on('newNotification', (notification) => {
        console.log('Received new notification:', notification);

        // Increment notification count
        setNotificationCount(prevCount => prevCount + 1);

        // Show local notification for any Socket.IO notification
        const title = notification.title || 'New Notification';
        const body = notification.message || notification.body || 'You have a new notification';

        showLocalNotification(title, body);

        // Dispatch custom event for other parts of the app
        window.dispatchEvent(new CustomEvent('socketNotification', {
          detail: notification
        }));
      });

      // --- Sync Notification Events ---
      newSocket.on('syncNotification', (notification) => {
        console.log('🔄 Received sync notification:', notification);

        // Increment notification count
        setNotificationCount(prevCount => prevCount + 1);

        // Enhanced local notification for sync events
        const title = notification.title || '🔄 Sync Update';
        const body = notification.message || 'You have a sync update';

        showLocalNotification(title, body);

        // Dispatch custom sync event
        window.dispatchEvent(new CustomEvent('syncNotification', {
          detail: {
            ...notification,
            syncType: notification.syncType,
            timestamp: Date.now()
          }
        }));

        // Also dispatch general notification event for compatibility
        window.dispatchEvent(new CustomEvent('socketNotification', {
          detail: notification
        }));
      });

      newSocket.on('notificationRead', (data) => {
        console.log('Notification marked as read:', data);
        // Decrease notification count if the marked notification was unread
        // This might require more complex state management if you track read/unread status in frontend
        // For now, just decrement if we know it was unread, or refetch count.
        // A simpler approach is to refetch the count after a delay or specific event.
        // Let's just trigger a fetch of the *actual* count from backend
        // handleFetchNotificationCount(); // Need to figure out how to trigger this from here
      });

       newSocket.on('allNotificationsRead', () => {
        console.log('All notifications marked as read.');
        // Reset notification count to 0
        setNotificationCount(0);
      });
      // --- End Notification Events ---


      // Clean up on unmount or token/userId change
      return () => {
        console.log('Disconnecting Socket.IO...');
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
        setNotificationCount(0); // Reset count on logout/unmount
      };
    }

     // If token or userId become null, ensure we disconnect
    if (!authLoading && (!token || !userId)) {
        if(socketRef.current) {
            console.log('Token or userId missing after auth loading, disconnecting socket...');
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setNotificationCount(0);
        }
    }


  }, [token, userId]); // Re-run effect if token or userId changes

  // Function to manually fetch count - can be provided by context
  // Or fetched within components using the standard API call
  // For simplicity, let's rely on polling in Settings or fetching in Topbar initially
  // but the real-time updates from socket will keep the displayed count more current.

  // Test function for Socket.IO notifications
  const sendTestNotification = () => {
    if (socket && socket.connected) {
      socket.emit('test', {
        type: 'test',
        message: 'Socket.IO test from client'
      });
      console.log('📤 Test message sent via Socket.IO');
      return true;
    } else {
      console.log('❌ Socket.IO not connected, cannot send test message');
      return false;
    }
  };

  // Provide socket instance and notification count to consuming components
  const contextValue = {
    socket,
    notificationCount,
    setNotificationCount, // Provide setter if components need to manually adjust (e.g. marking read client-side)
    sendTestNotification, // Add test function
    isConnected: socket && socket.connected, // Add connection status
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}; 