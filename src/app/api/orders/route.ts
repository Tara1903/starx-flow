import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { extractIdempotencyKey, runWithIdempotency } from '@/lib/idempotency';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const tenantId = auth.session.organizationId || auth.session.user.id;

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: sanitizeClientError(error, 'Failed to load workspace orders') },
        { status: 503 }
      );
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Unable to load orders right now') },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const tenantId = auth.session.organizationId || auth.session.user.id;
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      totalAmount,
      status,
      paymentStatus,
    } = body;

    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters: customerName, items' },
        { status: 400 }
      );
    }

    const rawIdempotencyKey = extractIdempotencyKey(req, body);
    const scopedKey = rawIdempotencyKey ? `order:${tenantId}:${rawIdempotencyKey}` : null;

    const { result, deduplicated } = await runWithIdempotency(scopedKey, async () => {
      const orderNumber = `SX-${Date.now().toString().slice(-6)}`;
      const computedTotal =
        totalAmount ??
        items.reduce(
          (acc: number, item: { price: number; quantity: number }) =>
            acc + Number(item.price || 0) * Number(item.quantity || 1),
          0
        );

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: tenantId,
          order_number: orderNumber,
          customer_name: customerName,
          customer_phone: customerPhone || null,
          customer_email: customerEmail || null,
          items,
          total_amount: computedTotal,
          currency: 'EUR',
          status: status || 'pending',
          payment_status: paymentStatus || 'unpaid',
        })
        .select()
        .single();

      if (error || !order) {
        throw new Error(sanitizeClientError(error, 'Database failed to persist order'));
      }

      return order;
    });

    return NextResponse.json({ order: result, deduplicated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to create order. Please retry.') },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const tenantId = auth.session.organizationId || auth.session.user.id;
    const body = await req.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (isSupabaseAdminConfigured) {
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id, user_id')
        .eq('id', orderId)
        .maybeSingle();

      if (existingOrder && existingOrder.user_id !== tenantId) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to modify orders in this tenant' },
          { status: 403 }
        );
      }
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .eq('user_id', tenantId)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: sanitizeClientError(error, 'Failed to update order status') },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to update order') },
      { status: 500 }
    );
  }
}
