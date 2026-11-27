import { NextRequest, NextResponse } from 'next/server';
import { sendEightCharOtp } from '@/lib/auth/otpService';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, purpose, metadata } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    const result = await sendEightCharOtp({
      email,
      purpose,
      metadata,
      ipAddress,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send verification code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'An 8-character verification code has been sent to your email.',
      expiresAt: result.expiresAt,
    });
  } catch (err: unknown) {
    console.error('[StarX API /api/auth/otp/send error]:', err);
    return NextResponse.json(
      { success: false, error: sanitizeClientError(err, 'An unexpected error occurred.') },
      { status: 500 }
    );
  }
}
