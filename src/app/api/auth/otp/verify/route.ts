import { NextRequest, NextResponse } from 'next/server';
import { verifyEightCharOtp } from '@/lib/auth/otpService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: '8-character verification code is required.' },
        { status: 400 }
      );
    }

    const result = await verifyEightCharOtp({
      email,
      code,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Verification failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      tokenHash: result.tokenHash,
      emailOtp: result.emailOtp,
      isNewUser: result.isNewUser,
    });
  } catch (err: any) {
    console.error('[StarX API /api/auth/otp/verify error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
