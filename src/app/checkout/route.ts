import { NextResponse } from 'next/server';
import { polar } from '@/lib/polar';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const products = url.searchParams.getAll('products');

  if (products.length === 0) {
    return NextResponse.json({ error: 'Missing products in query params' }, { status: 400 });
  }

  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    undefined;

  try {
    const checkout = await polar.checkouts.create({
      products,
      // Do not set a success URL and do not create a confirmation page — Polar shows its own hosted confirmation
      customer_email: url.searchParams.get('customer_email') ?? undefined,
      customer_ip_address: ipAddress,
      discount_id: url.searchParams.get('discount_id') ?? undefined,
    });

    return NextResponse.redirect(checkout.url, 302);
  } catch (error: any) {
    console.error('[Polar Checkout Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
