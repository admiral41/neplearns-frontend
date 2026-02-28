/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// This file MUST be in the public folder at the root level

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// These values will be replaced by actual config
firebase.initializeApp({
  apiKey: "AIzaSyDVcZckhUrDhgluM5g4NW0gMRFkea799mA",
  authDomain: "padhaihub-b9c90.firebaseapp.com",
  projectId: "padhaihub-b9c90",
  storageBucket: "padhaihub-b9c90.firebasestorage.app",
  messagingSenderId: "568303546472",
  appId: "1:568303546472:web:1faa43e319e98569ad8bdd"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Neplearns Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.tag || 'default',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'close') {
    return;
  }

  // Open the app or focus existing window
  const urlToOpen = data.actionUrl || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (data.actionUrl) {
            client.navigate(urlToOpen);
          }
          return;
        }
      }

      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
