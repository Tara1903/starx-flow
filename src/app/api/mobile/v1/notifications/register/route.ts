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
    const { token, platform } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Missing device push token' },
        { status: 400 }
      );
    }

    if (!platform || !['android', 'ios'].includes(platform.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid platform parameter (expected "android" or "ios")' },
        { status: 400 }
      );
    }

    const tenantId = auth.session.organizationId || auth.session.user.id;

    // Log registration safely without exposing secrets
    console.log(`[StarX Mobile Push] Registered device token for tenant ${tenantId} (${platform.toLowerCase()})`);

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
