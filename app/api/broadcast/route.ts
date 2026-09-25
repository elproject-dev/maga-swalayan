import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: messageBody, imageUrl } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const message = {
      notification: {
        title,
        body: messageBody,
        ...(imageUrl && { image: imageUrl })
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png'
        },
        fcmOptions: {
          link: '/' // Memaksa browser membuka/fokus ke aplikasi PWA saat notifikasi diklik
        }
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
