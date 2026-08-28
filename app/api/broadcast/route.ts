import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';
import { supabase } from '@/lib/supabase'; // Adjust based on your actual supabase client location

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: messageBody, imageUrl } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // TODO: In a real scenario, you would fetch all FCM tokens from your Supabase database.
    // For now, if you are testing, you might want to send to a specific topic
    // like 'all_users' if everyone subscribes to it, or fetch tokens from a table.
    
    // Example: Fetch tokens from a table named "fcm_tokens"
    /*
    const { data: tokensData, error } = await supabase.from('fcm_tokens').select('token');
    if (error) throw error;
    
    const tokens = tokensData.map(t => t.token);
    if (tokens.length === 0) {
       return NextResponse.json({ error: 'No registered devices found' }, { status: 404 });
    }
    
    const message = {
      notification: {
        title,
        body: messageBody,
        ...(imageUrl && { image: imageUrl })
      },
      tokens: tokens,
    };
    
    const response = await adminMessaging.sendMulticast(message);
    */

    // FOR NOW, we'll use a Topic messaging approach because it's easier to broadcast without a DB table
    const message = {
      notification: {
        title,
        body: messageBody,
        ...(imageUrl && { image: imageUrl })
      },
      topic: 'all_users'
    };

    const response = await adminMessaging.send(message);

    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json({ error: error.message || 'Failed to send broadcast' }, { status: 500 });
  }
}
