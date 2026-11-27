import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const platform = typeof body?.platform === 'string' ? body.platform.toLowerCase() : '';

    if (!token || /\s/.test(token) || token.startsWith('device_token_') || Buffer.byteLength(token) > 2048) {
      return NextResponse.json(
        { error: 'A valid device push token is required' },
        { status: 400 }
      );
    }

    if (!platform || !['android', 'ios'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform parameter (expected "android" or "ios")' },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured) {
      return NextResponse.json({ error: 'Device registration is unavailable.' }, { status: 503 });
    }
    const { error } = await supabaseAdmin.from('mobile_push_devices').upsert({
      platform,
      token,
      user_id: auth.session.user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'platform,token' });
    if (error) {
      return NextResponse.json({ error: 'Could not save this device. Please try again.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      message: 'Device push notification token registered successfully'
    });
  } catch (err: unknown) {
    console.error('[API /api/mobile/v1/notifications/register error]:', err);
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to register notification token') },
      { status: 500 }
    );
  }
}
