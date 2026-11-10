import { NextResponse } from 'next/server';
import { webhooks } from '@polar-sh/sdk/2026-10';

export async function POST(request: Request) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Polar Webhook Error]: POLAR_WEBHOOK_SECRET is not configured');
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
    event = webhooks.validateEvent(rawBody, headers, webhookSecret);
  } catch (error) {
    if (error instanceof webhooks.PolarWebhookVerificationError) {
      console.warn('[Polar Webhook Verification Failed]:', error.message);
      return NextResponse.json({ received: false }, { status: 403 });
    }
    if (error instanceof webhooks.PolarWebhookUnknownTypeError) {
      // Signed, but an event type this SDK version doesn't recognize. Acknowledge so Polar doesn't retry.
      return NextResponse.json({ received: true }, { status: 202 });
    }
    if (error instanceof webhooks.PolarWebhookError) {
      return NextResponse.json({ received: false }, { status: 400 });
    }
    throw error;
  }

  switch (event.type) {
    case 'order.paid':
      // TODO: Handle order.paid event (event.data is the Order)
      break;

    case 'customer.state_changed':
      // TODO: Handle customer.state_changed event (event.data is the CustomerState)
      break;

    default:
      // Other unhandled events
      break;
  }

  return NextResponse.json({ received: true }, { status: 202 });
}
