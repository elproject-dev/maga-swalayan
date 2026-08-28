// @ts-nocheck


importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// We don't have process.env here, but these are safe public keys
const firebaseConfig = {
  apiKey: "AIzaSyAQXytrS1GWv3g53VoeE6cqOUzcLepzOZI",
  authDomain: "maga-swalayan-bf6c5.firebaseapp.com",
  projectId: "maga-swalayan-bf6c5",
  storageBucket: "maga-swalayan-bf6c5.firebasestorage.app",
  messagingSenderId: "874122742029",
  appId: "1:874122742029:web:3cb2e8b366355bf5274844"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Firebase SDK will automatically handle background messages that contain a 'notification' payload.
