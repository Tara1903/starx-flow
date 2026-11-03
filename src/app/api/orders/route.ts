import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, customerName, customerPhone, customerEmail, items, totalAmount, status, paymentStatus } = body;

    if (!userId || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, customerName, items' },
        { status: 400 }
      );
    }

    const orderNumber = `SX-${Date.now().toString().slice(-6)}`;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        items,
        total_amount: totalAmount || items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
        currency: 'EUR',
        status: status || 'pending',
        payment_status: paymentStatus || 'unpaid',
      })
      .select()
      .single();

    if (error) {
      // In offline mode, return synthetic order
      return NextResponse.json({
        order: {
          id: `order-${Date.now()}`,
          user_id: userId,
          order_number: orderNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          items,
          total_amount: totalAmount,
          currency: 'EUR',
          status: status || 'pending',
          payment_status: paymentStatus || 'unpaid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
