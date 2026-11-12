import { NextResponse } from 'next/server';
import { polar, POLAR_PLANS } from '@/lib/polar';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

export async function POST(request: Request) {
  try {
    const auth = await authenticateStaffRequest(request, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, organizationId } = auth.session;

    const body = await request.json();
    const { planId } = body;

    if (!planId || !(planId in POLAR_PLANS)) {
      return NextResponse.json(
        { error: 'Invalid plan selected. Must be one of: starter, pro, enterprise' },
        { status: 400 }
      );
    }

    const planConfig = POLAR_PLANS[planId as keyof typeof POLAR_PLANS];
    const appUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://starx-flow.runs-on.dev'
    ).replace(/\/+$/, '');

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      undefined;

    const checkout = await polar.checkouts.create({
      products: [planConfig.productId],
      external_customer_id: user.id,
      customer_email: user.email || undefined,
      customer_ip_address: ipAddress,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        tenant_id: organizationId || '',
      },
      return_url: `${appUrl}/dashboard?billing=cancelled`,
      success_url: `${appUrl}/dashboard?payment=success&checkout_id={CHECKOUT_ID}`,
    });

    if (!checkout.url) {
      throw new Error('Polar checkout returned no redirect URL');
    }

    return NextResponse.json({ url: checkout.url, checkoutId: checkout.id });
  } catch (err: unknown) {
    console.error('[Polar Checkout Error]:', err);
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to initiate Polar checkout') },
      { status: 500 }
    );
  }
}
