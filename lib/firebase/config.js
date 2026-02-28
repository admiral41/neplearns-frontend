import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

/**
 * Firebase Configuration
 *
 * Setup Instructions:
 * 1. Go to Firebase Console (https://console.firebase.google.com)
 * 2. Create a project or select existing one
 * 3. Go to Project Settings > General > Your apps
 * 4. Click "Add app" and select Web (</>)
 * 5. Register app and copy the firebaseConfig
 * 6. Add these values to your .env.local file
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (only once)
let firebaseApp = null;

export const initializeFirebase = () => {
  if (typeof window === 'undefined') return null;

  if (!firebaseConfig.apiKey) {
    console.warn('Firebase config not found. Push notifications will be disabled.');
    return null;
  }

  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }

  return firebaseApp;
};

// Get Firebase Messaging instance
export const getFirebaseMessaging = async () => {
  if (typeof window === 'undefined') return null;

  const app = initializeFirebase();
  if (!app) return null;

  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser.');
    return null;
  }

  return getMessaging(app);
};

export { firebaseConfig };
