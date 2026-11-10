import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { polar } from '@/lib/polar';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://starx-flow.runs-on.dev'
    ).replace(/\/+$/, '');

    try {
      // Create authenticated Polar Customer Portal Session
      const session = await polar.customerSessions.create({
        external_customer_id: user.id,
        return_url: `${appUrl}/dashboard`,
      });

      return NextResponse.json({ url: session.customer_portal_url });
    } catch (portalErr: any) {
      console.warn('[Polar Customer Portal] Session creation notice:', portalErr.message);

      // If customer does not exist yet on Polar, inform user to select a plan first
      if (
        portalErr.message?.includes('not found') ||
        portalErr.message?.includes('does not exist') ||
        portalErr.status === 404 ||
        portalErr.status === 422
      ) {
        return NextResponse.json(
          {
            error:
              'No active billing record found in Polar yet. Please subscribe to a plan first to access the billing portal.',
          },
          { status: 404 }
        );
      }

      throw portalErr;
    }
  } catch (err: any) {
    console.error('[Polar Customer Portal Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to open customer billing portal' },
      { status: 500 }
    );
  }
}
