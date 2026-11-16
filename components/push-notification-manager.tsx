"use client"

import { useEffect, useRef } from 'react'
import { requestForToken, onMessageListener } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function PushNotificationManager() {
  const currentTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      
      const sendSubscription = async (token: string, email?: string | null) => {
        try {
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              email: email || null,
              deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : null
            }),
          });
          console.log("Successfully subscribed to notifications");
        } catch (err) {
          console.error("Error subscribing to notifications:", err);
        }
      };

      const setupPushNotifications = async () => {
        try {
          const token = await requestForToken();
          
          if (token) {
            currentTokenRef.current = token;
            const { data: { session } } = await supabase.auth.getSession();
            await sendSubscription(token, session?.user?.email);
          }
        } catch (error) {
          console.error("Error setting up push notifications:", error);
        }
      };

      setupPushNotifications();

      // Listen to auth state changes to update token binding when user logs in
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email && currentTokenRef.current) {
          await sendSubscription(currentTokenRef.current, session.user.email);
        }
      });

      // Listen for foreground messages continuously
      onMessageListener((payload: any) => {
        console.log("Received foreground message:", payload);
        const title = payload?.notification?.title || 'Notifikasi Baru';
        const options = {
          body: payload?.notification?.body,
          icon: '/icon-192x192.png'
        };

        // Mainkan suara custom saat aplikasi sedang terbuka
        try {
          const audio = new Audio('/notif.wav');
          // Browser kadang memblokir autoplay jika user belum berinteraksi dengan web
          audio.play().catch(e => console.log('Audio di-blokir oleh browser: ', e));
        } catch (error) {
          console.error("Gagal memutar suara:", error);
        }
        
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
