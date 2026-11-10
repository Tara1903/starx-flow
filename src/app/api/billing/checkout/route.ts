import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PLANS } from '@/store/billingStore';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingCycle = 'monthly' } = body;

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe is live-configured, initiate checkout session
    if (stripeSecretKey && !stripeSecretKey.includes('placeholder')) {
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'payment_method_types[0]': 'card',
          mode: 'subscription',
          success_url: `${appUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/dashboard?payment=cancelled`,
          'client_reference_id': user.id,
          'customer_email': user.email || '',
          'metadata[user_id]': user.id,
          'metadata[plan_id]': planId,
          'metadata[billing_cycle]': billingCycle,
          'line_items[0][price_data][currency]': 'eur',
          'line_items[0][price_data][product_data][name]': `StarX Flow ${plan.name} Plan`,
          'line_items[0][price_data][unit_amount]': String(plan.price * 100),
          'line_items[0][price_data][recurring][interval]': billingCycle === 'annual' ? 'year' : 'month',
          'line_items[0][quantity]': '1',
        }).toString(),
      });

      const session = await response.json();
      if (session.url) {
        return NextResponse.json({ url: session.url });
      }
    }

    // Production Safety Guard: Never auto-activate paid subscriptions in production if Stripe is unconfigured
    if (process.env.NODE_ENV === 'production' && (!stripeSecretKey || stripeSecretKey.includes('placeholder'))) {
      return NextResponse.json(
        { error: 'Live billing gateway is pending configuration by the platform administrator. Please contact sales to upgrade your plan.' },
        { status: 503 }
      );
    }

    // In local / developer mode or placeholder mode, activate subscription directly
    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        billing_cycle: billingCycle,
        amount: plan.price,
        currency: 'EUR',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    // Also update profile plan
    await supabaseAdmin
      .from('profiles')
      .update({ plan: plan.name })
      .eq('id', user.id);

    return NextResponse.json({
      url: `${appUrl}/dashboard?payment=success&mode=dev`,
      activatedPlan: planId,
    });
  } catch (err: any) {
    console.error('[Billing Checkout error]:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
