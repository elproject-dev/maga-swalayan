import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: messageBody, imageUrl, targetType = 'all', targetEmail, targetEmails } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // 1. Pengiriman Personal ke 1 Akun atau Daftar Email Tertentu (Misal: Ulang Tahun)
    if (targetType === 'personal' || targetType === 'birthday') {
      const rawEmails = targetEmails && Array.isArray(targetEmails) ? targetEmails : (targetEmail ? [targetEmail] : []);
      const emails = rawEmails.map((e: string) => String(e).toLowerCase().trim()).filter(Boolean);

      if (emails.length === 0) {
        return NextResponse.json({ error: 'Email target wajib dipilih untuk pengiriman personal' }, { status: 400 });
      }

      // Ambil FCM token dari tabel user_fcm_tokens
      const { data: tokenRows, error: tokenError } = await supabase
        .from('user_fcm_tokens')
        .select('token, email')
        .in('email', emails);

      if (tokenError) {
        console.error('Error fetching FCM tokens:', tokenError);
        return NextResponse.json({ error: tokenError.message || 'Gagal mengambil token perangkat pengguna' }, { status: 500 });
      }

      if (!tokenRows || tokenRows.length === 0) {
        return NextResponse.json({
          error: `Member (${emails.join(', ')}) belum mengaktifkan notifikasi / belum ada perangkat terdaftar.`
        }, { status: 404 });
      }

      const tokens = Array.from(new Set(tokenRows.map(r => r.token)));

      const multicastMessage = {
        tokens,
        notification: {
          title,
          body: messageBody,
          ...(imageUrl && { image: imageUrl })
        },
        webpush: {
          notification: {
            title,
            body: messageBody,
            icon: '/icon-notification.png',
            badge: '/icon-notification.png',
            ...(imageUrl && { image: imageUrl }),
          },
          fcmOptions: {
            link: '/'
          }
        }
      };

      const response = await adminMessaging.sendEachForMulticast(multicastMessage);

      // Bersihkan token yang sudah expired / tidak terdaftar
      if (response.failureCount > 0) {
        const deadTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
            deadTokens.push(tokens[idx]);
          }
        });
        if (deadTokens.length > 0) {
          await supabase.from('user_fcm_tokens').delete().in('token', deadTokens);
        }
      }

      return NextResponse.json({
        success: true,
        targetType,
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length
      });
    }

    // 2. Pengiriman Global (Broadcast ke semua pengguna / topic: all_users)
    const message = {
      notification: {
        title,
        body: messageBody,
        ...(imageUrl && { image: imageUrl })
      },
      webpush: {
        notification: {
          title,
          body: messageBody,
          icon: '/icon-notification.png',
          badge: '/icon-notification.png',
          ...(imageUrl && { image: imageUrl }),
        },
        fcmOptions: {
          link: '/'
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
