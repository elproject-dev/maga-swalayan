import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { token, email, deviceInfo } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // 1. Subscribe the device token to the 'all_users' topic
    const response = await adminMessaging.subscribeToTopic([token], 'all_users');
    
    if (response.failureCount > 0) {
      console.error('Failed to subscribe to topic:', response.errors);
      return NextResponse.json({ error: 'Failed to subscribe to topic' }, { status: 500 });
    }

    // 2. Simpan token ke database user_fcm_tokens jika ada email pengguna
    if (email) {
      const cleanEmail = String(email).toLowerCase().trim();
      const { error: dbError } = await supabase
        .from('user_fcm_tokens')
        .upsert(
          {
            email: cleanEmail,
            token,
            device_info: deviceInfo || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'token' }
        );

      if (dbError) {
        console.error('Error saving user_fcm_tokens to database:', dbError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in topic subscription:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
