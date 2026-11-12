import { NextResponse } from 'next/server';
import { polar } from '@/lib/polar';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

export async function POST(request: Request) {
  try {
    const auth = await authenticateStaffRequest(request, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user } = auth.session;

    const appUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://starx-flow.runs-on.dev'
    ).replace(/\/+$/, '');

    try {
      const session = await polar.customerSessions.create({
        external_customer_id: user.id,
        return_url: `${appUrl}/dashboard`,
      });

      return NextResponse.json({ url: session.customer_portal_url });
    } catch (portalErr: any) {
      console.warn('[Polar Customer Portal] Session creation notice:', portalErr?.message);

      if (
        portalErr?.message?.includes('not found') ||
        portalErr?.message?.includes('does not exist') ||
        portalErr?.status === 404 ||
        portalErr?.status === 422
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
  } catch (err: unknown) {
    console.error('[Polar Customer Portal Error]:', err);
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to open customer billing portal') },
      { status: 500 }
    );
  }
}
