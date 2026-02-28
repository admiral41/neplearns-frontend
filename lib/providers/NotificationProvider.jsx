'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';
import { useSocket } from '../hooks/useSocket';
import { initializePushNotifications, unregisterTokenFromBackend } from '../firebase/messaging';

const NotificationContext = createContext(null);

/**
 * Notification Provider Component
 * Manages FCM push notification setup
 * Socket.IO notifications are handled by useNotifications hook
 */
export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const { isConnected } = useSocket();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');

  // Check notification permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Initialize push notifications when user logs in
  useEffect(() => {
    if (!user || !token) {
      setPushEnabled(false);
      return;
    }

    const initPush = async () => {
      try {
        const fcmTokenResult = await initializePushNotifications((payload) => {
          // Handle foreground push notifications
          const { notification } = payload;
          if (notification) {
            toast(notification.title, {
              description: notification.body,
              action: payload.data?.actionUrl
                ? {
                    label: 'View',
                    onClick: () => {
                      window.location.href = payload.data.actionUrl;
                    }
                  }
                : undefined
            });
          }
        });

        if (fcmTokenResult) {
          setFcmToken(fcmTokenResult);
          setPushEnabled(true);
          setPermissionStatus('granted');
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    // Only initialize if permission was previously granted or not yet asked
    if (permissionStatus !== 'denied') {
      initPush();
    }
  }, [user, token, permissionStatus]);

  // Note: Socket.IO notifications are handled by useNotifications hook
  // This provider only handles FCM push notifications setup

  // Request push notification permission
  const requestPermission = useCallback(async () => {
    try {
      const fcmTokenResult = await initializePushNotifications((payload) => {
        const { notification } = payload;
        if (notification) {
          toast(notification.title, {
            description: notification.body
          });
        }
      });

      if (fcmTokenResult) {
        setFcmToken(fcmTokenResult);
        setPushEnabled(true);
        setPermissionStatus('granted');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to request push permission:', error);
      return false;
    }
  }, []);

  // Disable push notifications
  const disablePush = useCallback(async () => {
    try {
      if (fcmToken) {
        await unregisterTokenFromBackend(fcmToken);
      }
      setFcmToken(null);
      setPushEnabled(false);
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
    }
  }, [fcmToken]);

  const value = {
    pushEnabled,
    permissionStatus,
    fcmToken,
    requestPermission,
    disablePush,
    isConnected
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
