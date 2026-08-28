"use client"

import { useEffect } from 'react'
import { requestForToken, onMessageListener } from '@/lib/firebase'
import { toast } from 'sonner'

export function PushNotificationManager() {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      
      const setupPushNotifications = async () => {
        try {
          const token = await requestForToken();
          
          if (token) {
            // Send token to backend to subscribe to 'all_users' topic
            await fetch('/api/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
            });
            console.log("Successfully subscribed to notifications");
          }
        } catch (error) {
          console.error("Error setting up push notifications:", error);
        }
      };

      setupPushNotifications();

      // Listen for foreground messages continuously
      onMessageListener((payload: any) => {
        console.log("Received foreground message:", payload);
        const title = payload?.notification?.title || 'Notifikasi Baru';
        const options = {
          body: payload?.notification?.body,
          icon: '/icon-192x192.png'
        };
        
        if (Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, options);
          });
        }
      });
    }
  }, [])

  return null // This component doesn't render anything
}
