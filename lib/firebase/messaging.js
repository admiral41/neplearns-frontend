import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from './config';
import apiClient from '../api/client';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null
 */
export const requestNotificationPermission = async () => {
  try {
    if (typeof window === 'undefined') return null;

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied.');
      return null;
    }

    // Get messaging instance
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('Service worker registration failed.');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      return token;
    }

    console.warn('No FCM token available.');
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Register service worker for push notifications
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export const registerServiceWorker = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported.');
      return null;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Register FCM token with backend
 * @param {string} fcmToken - FCM token
 * @param {object} deviceInfo - Optional device info
 */
export const registerTokenWithBackend = async (fcmToken, deviceInfo = {}) => {
  try {
    const response = await apiClient.post('/fcm/register', {
      fcmToken,
      deviceInfo: {
        device: navigator.userAgent,
        os: navigator.platform,
        ...deviceInfo
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to register FCM token with backend:', error);
    throw error;
  }
};

/**
 * Unregister FCM token from backend (on logout)
 * @param {string} fcmToken - FCM token
 */
export const unregisterTokenFromBackend = async (fcmToken) => {
  try {
    const response = await apiClient.delete('/fcm/unregister', {
      data: { fcmToken }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to unregister FCM token:', error);
    throw error;
  }
};

/**
 * Setup foreground message handler
 * @param {function} callback - Callback function for incoming messages
 */
export const setupForegroundHandler = async (callback) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

/**
 * Initialize push notifications
 * @param {function} onMessage - Callback for foreground messages
 * @returns {Promise<string|null>} FCM token or null
 */
export const initializePushNotifications = async (onMessageCallback) => {
  try {
    // Request permission and get token
    const token = await requestNotificationPermission();
    if (!token) return null;

    // Register token with backend
    await registerTokenWithBackend(token);

    // Setup foreground handler
    if (onMessageCallback) {
      setupForegroundHandler(onMessageCallback);
    }

    return token;
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
    return null;
  }
};
