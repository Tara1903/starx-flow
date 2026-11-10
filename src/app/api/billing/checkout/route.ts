import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { polar, POLAR_PLANS } from '@/lib/polar';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tenant / Organization ownership check
    const { data: member } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .maybeSingle();

    const organizationId = member?.organization_id || null;

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

    // Create Polar Checkout Session
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
  } catch (err: any) {
    console.error('[Polar Checkout Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initiate Polar checkout' },
      { status: 500 }
    );
  }
}
