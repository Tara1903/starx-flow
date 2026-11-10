import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const isLiveSecret = Boolean(webhookSecret && !webhookSecret.includes('your-') && webhookSecret.trim().length > 10);

    // Production guard: Fail closed if in production and secret is not configured
    if (process.env.NODE_ENV === 'production' && !isLiveSecret) {
      console.warn('[Stripe Webhook] Blocked: STRIPE_WEBHOOK_SECRET not configured in production environment.');
      return new NextResponse('Webhook endpoint not configured in production', { status: 503 });
    }

    // Cryptographic HMAC-SHA256 verification when secret is configured
    if (isLiveSecret) {
      if (!signature) {
        return new NextResponse('Missing stripe-signature header', { status: 400 });
      }

      const timestampMatch = signature.match(/t=(\d+)/);
      const sigMatch = signature.match(/v1=([a-f0-9]+)/);

      if (!timestampMatch || !sigMatch) {
        return new NextResponse('Invalid stripe-signature format', { status: 400 });
      }

      const timestamp = parseInt(timestampMatch[1], 10);
      const receivedSig = sigMatch[1];
      const now = Math.floor(Date.now() / 1000);

      // 5-minute replay attack tolerance window (300 seconds)
      if (Math.abs(now - timestamp) > 300) {
        return new NextResponse('Webhook signature timestamp expired (replay tolerance exceeded)', { status: 400 });
      }

      const signedPayload = `${timestamp}.${rawBody}`;
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret!)
        .update(signedPayload, 'utf8')
        .digest('hex');

      const receivedBuffer = Buffer.from(receivedSig, 'hex');
      const expectedBuffer = Buffer.from(expectedSig, 'hex');

      if (
        receivedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
      ) {
        return new NextResponse('Invalid webhook signature verification failed', { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const dataObj = event.data?.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = dataObj.client_reference_id || dataObj.metadata?.user_id;
        const planId = dataObj.metadata?.plan_id || 'starter';
        const customerId = dataObj.customer;
        const subscriptionId = dataObj.subscription;

        if (userId) {
          await supabaseAdmin.from('subscriptions').upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan_id: planId,
              status: 'active',
              billing_cycle: dataObj.metadata?.billing_cycle || 'monthly',
              amount: dataObj.amount_total ? dataObj.amount_total / 100 : 47,
              currency: dataObj.currency?.toUpperCase() || 'EUR',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

          await supabaseAdmin.from('profiles').update({ plan: planId }).eq('id', userId);
        }
        break;
      }

      case 'invoice.paid': {
        const customerId = dataObj.customer;
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (sub) {
          await supabaseAdmin.from('invoices').insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            stripe_invoice_id: dataObj.id,
            amount: dataObj.amount_paid ? dataObj.amount_paid / 100 : 0,
            currency: dataObj.currency?.toUpperCase() || 'EUR',
            status: 'paid',
            paid_at: new Date().toISOString(),
            hosted_invoice_url: dataObj.hosted_invoice_url || null,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const customerId = dataObj.customer;
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = dataObj.id;
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook error]:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
