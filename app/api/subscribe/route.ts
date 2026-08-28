import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Subscribe the device token to the 'all_users' topic
    const response = await adminMessaging.subscribeToTopic([token], 'all_users');
    
    if (response.failureCount > 0) {
      console.error('Failed to subscribe to topic:', response.errors);
      return NextResponse.json({ error: 'Failed to subscribe to topic' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in topic subscription:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
