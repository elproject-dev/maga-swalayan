importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

const firebaseConfig = {
  // Use the actual values here because Service Workers cannot access process.env easily without a bundler like Workbox injectManifest
  apiKey: "AIzaSyAQXytrS1GWv3g53VoeE6cqOUzcLepzOZI",
  authDomain: "maga-swalayan-bf6c5.firebaseapp.com",
  projectId: "maga-swalayan-bf6c5",
  storageBucket: "maga-swalayan-bf6c5.firebasestorage.app",
  messagingSenderId: "874122742029",
  appId: "1:874122742029:web:3cb2e8b366355bf5274844"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', // Ensure you have this icon in your public folder
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
