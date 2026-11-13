import { NextResponse } from 'next/server';
import { webhooks } from '@polar-sh/sdk/2026-10';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { POLAR_PRODUCT_TO_PLAN } from '@/lib/polar';
import { normalizePlanId } from '@/lib/plans';

export async function processPolarWebhook(request: Request): Promise<Response> {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Polar Webhook] Critical: POLAR_WEBHOOK_SECRET is not configured');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  const rawBody = await request.text();
  const headers = {
    'webhook-id': request.headers.get('webhook-id') ?? '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': request.headers.get('webhook-signature') ?? '',
  };

  let event: any;
  try {
    event = await webhooks.validateEvent(rawBody, headers, webhookSecret);
  } catch (error: any) {
    const isVerificationError =
      error instanceof webhooks.PolarWebhookVerificationError ||
      error?.name === 'PolarWebhookVerificationError' ||
      error?.constructor?.name === 'PolarWebhookVerificationError' ||
      error?.message?.includes('timestamp') ||
      error?.message?.includes('signature');

    if (isVerificationError) {
      console.warn('[Polar Webhook] Verification Failed:', error.message);
      return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 403 });
    }

    const isUnknownTypeError =
      error instanceof webhooks.PolarWebhookUnknownTypeError ||
      error?.name === 'PolarWebhookUnknownTypeError';

    if (isUnknownTypeError) {
      // Signed, but an event type this SDK version doesn't recognize. Acknowledge so Polar doesn't retry.
      return NextResponse.json({ received: true, note: 'Unknown event type acknowledged' }, { status: 202 });
    }

    const isPolarError =
      error instanceof webhooks.PolarWebhookError ||
      error?.name === 'PolarWebhookError';

    if (isPolarError) {
      return NextResponse.json({ received: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ received: false, error: error.message || 'Webhook verification error' }, { status: 403 });
  }

  const eventId = headers['webhook-id'] || event.id || `evt_${Date.now()}`;
  const eventType = event.type;

  // 1. Idempotency Check: prevent duplicate event processing
  try {
    const { data: existingEvent } = await supabaseAdmin
      .from('polar_webhook_events')
      .select('id, status')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent && existingEvent.status === 'processed') {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    if (!existingEvent) {
      await supabaseAdmin.from('polar_webhook_events').insert({
        event_id: eventId,
        event_type: eventType,
        status: 'processing',
        received_at: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.warn('[Polar Webhook] Idempotency record warning:', err.message);
  }

  try {
    const dataObj = event.data;

    switch (eventType) {
      case 'order.paid': {
        const userId =
          dataObj.metadata?.user_id ||
          dataObj.customer?.external_id ||
          dataObj.external_customer_id;

        const customerEmail = dataObj.customer?.email || dataObj.customer_email;
        const resolvedUserId = userId || (await resolveUserByEmail(customerEmail));

        const rawPlanId =
          POLAR_PRODUCT_TO_PLAN[dataObj.product_id] ||
          dataObj.metadata?.plan_id;
        const planId = rawPlanId ? normalizePlanId(rawPlanId) : 'starter';

        const customerId = dataObj.customer_id || dataObj.customer?.id;
        const subscriptionId = dataObj.subscription_id;
        const amount = dataObj.amount ? dataObj.amount / 100 : 29;
        const currency = dataObj.currency ? dataObj.currency.toUpperCase() : 'USD';

        if (resolvedUserId) {
          await supabaseAdmin.from('subscriptions').upsert(
            {
              user_id: resolvedUserId,
              billing_provider: 'polar',
              polar_customer_id: customerId,
              polar_subscription_id: subscriptionId || null,
              polar_product_id: dataObj.product_id,
              plan_id: planId,
              status: 'active',
              billing_cycle: dataObj.billing_cycle || 'monthly',
              amount,
              currency,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

          await supabaseAdmin.from('profiles').update({ plan: planId }).eq('id', resolvedUserId);

          await supabaseAdmin.from('invoices').insert({
            user_id: resolvedUserId,
            billing_provider: 'polar',
            polar_order_id: dataObj.id,
            polar_invoice_id: dataObj.invoice_id || null,
            amount,
            currency,
            status: 'paid',
            paid_at: new Date().toISOString(),
            hosted_invoice_url: dataObj.hosted_invoice_url || null,
          });
        }
        break;
      }

      case 'subscription.created':
      case 'subscription.active':
      case 'subscription.updated': {
        const userId =
          dataObj.metadata?.user_id ||
          dataObj.customer?.external_id ||
          dataObj.external_customer_id;

        const customerEmail = dataObj.customer?.email;
        const resolvedUserId = userId || (await resolveUserByEmail(customerEmail));

        const rawPlanId =
          POLAR_PRODUCT_TO_PLAN[dataObj.product_id] ||
          dataObj.metadata?.plan_id;
        const planId = rawPlanId ? normalizePlanId(rawPlanId) : 'starter';

        if (resolvedUserId) {
          const status = dataObj.status === 'active' ? 'active' : dataObj.status;

          await supabaseAdmin.from('subscriptions').upsert(
            {
              user_id: resolvedUserId,
              billing_provider: 'polar',
              polar_customer_id: dataObj.customer_id,
              polar_subscription_id: dataObj.id,
              polar_product_id: dataObj.product_id,
              polar_price_id: dataObj.price_id || null,
              plan_id: planId,
              status,
              amount: dataObj.amount ? dataObj.amount / 100 : 29,
              currency: dataObj.currency ? dataObj.currency.toUpperCase() : 'USD',
              current_period_start: dataObj.current_period_start || new Date().toISOString(),
              current_period_end: dataObj.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancel_at: dataObj.cancel_at_period_end ? dataObj.current_period_end : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

          if (status === 'active') {
            await supabaseAdmin.from('profiles').update({ plan: planId }).eq('id', resolvedUserId);
          }
        }
        break;
      }

      case 'subscription.canceled': {
        const subscriptionId = dataObj.id;
        const cancelAtPeriodEnd = Boolean(dataObj.cancel_at_period_end);

        if (cancelAtPeriodEnd) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              cancel_at: dataObj.current_period_end || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('polar_subscription_id', subscriptionId);
        } else {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('polar_subscription_id', subscriptionId);
        }
        break;
      }

      case 'subscription.revoked': {
        const subscriptionId = dataObj.id;
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('polar_subscription_id', subscriptionId)
          .maybeSingle();

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('polar_subscription_id', subscriptionId);

        if (sub?.user_id) {
          await supabaseAdmin.from('profiles').update({ plan: 'free' }).eq('id', sub.user_id);
        }
        break;
      }

      default:
        // Acknowledge unhandled events
        break;
    }

    // Mark event as processed
    try {
      await supabaseAdmin
        .from('polar_webhook_events')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('event_id', eventId);
    } catch {
      // Ignore non-fatal db update
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Polar Webhook] Processing error:', err);

    try {
      await supabaseAdmin
        .from('polar_webhook_events')
        .update({
          status: 'failed',
          error_message: err.message,
        })
        .eq('event_id', eventId);
    } catch {
      // Ignore
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function resolveUserByEmail(email?: string | null): Promise<string | null> {
  if (!email) return null;
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    return profile?.id || null;
  } catch {
    return null;
  }
}
