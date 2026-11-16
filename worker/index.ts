// @ts-nocheck


importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// We don't have process.env here, but these are safe public keys
const firebaseConfig = {
  apiKey: "AIzaSyAZyKorgwy5WqBBD2dHvex76q19DjzbjPI",
  authDomain: "maga-swalayan-fb2df.firebaseapp.com",
  projectId: "maga-swalayan-fb2df",
  storageBucket: "maga-swalayan-fb2df.firebasestorage.app",
  messagingSenderId: "816000143761",
  appId: "1:816000143761:web:52c925a7b2dfd0b3f8ca30"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Firebase SDK will automatically handle background messages that contain a 'notification' payload.
