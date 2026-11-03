import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Optional cryptographic verification if webhookSecret configured
    if (webhookSecret && !webhookSecret.includes('your-') && signature) {
      // Signature verification stub for Deno/Node WebCrypto
      const timestampMatch = signature.match(/t=(\d+)/);
      const sigMatch = signature.match(/v1=([a-f0-9]+)/);
      if (!timestampMatch || !sigMatch) {
        return new NextResponse('Invalid signature format', { status: 400 });
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
