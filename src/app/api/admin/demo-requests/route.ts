import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ALLOWED_STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'disqualified', 'converted'] as const;
type DemoStatus = typeof ALLOWED_STATUSES[number];

/**
 * Helper to authenticate caller and verify 'admin' role in profiles table.
 */
async function authenticateAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { error: 'Unauthorized: missing authorization header', status: 401, user: null };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);

  if (authErr || !user) {
    return { error: 'Unauthorized: invalid or expired session', status: 401, user: null };
  }

  // Verify role in profiles table
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { error: 'Forbidden: platform administrator privileges required', status: 403, user: null };
  }

  return { error: null, status: 200, user };
}

/**
 * GET /api/admin/demo-requests
 * Returns all captured demo requests ordered by created_at DESC.
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    let query = supabaseAdmin
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter && ALLOWED_STATUSES.includes(statusFilter as DemoStatus)) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Admin Demo Requests] Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to retrieve demo leads' }, { status: 500 });
    }

    return NextResponse.json({ leads: data || [] }, { status: 200 });
  } catch (err: any) {
    console.error('[Admin Demo Requests] Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/demo-requests
 * Updates the qualification status and notes of an inbound demo lead.
 */
export async function PATCH(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    if (!status || !ALLOWED_STATUSES.includes(status as DemoStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    const { data, error } = await supabaseAdmin
      .from('demo_requests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Admin Demo Requests] Error updating status:', error);
      return NextResponse.json({ error: 'Failed to update lead status' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 200 });
  } catch (err: any) {
    console.error('[Admin Demo Requests] Update exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
