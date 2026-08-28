import { getApps, getApp, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin App if not already initialized
const app = getApps().length > 0 
  ? getApp() 
  : initializeApp({
      // If GOOGLE_APPLICATION_CREDENTIALS is set in .env, applicationDefault() will automatically pick it up
      credential: applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

export const adminMessaging = getMessaging(app);
