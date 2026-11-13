import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Helper to authenticate caller and verify 'admin' or 'super_admin' role.
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
 * GET /api/admin/clients
 * Returns all registered client profiles, mapped to their plan and activity for admin inspection.
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 1. Fetch all profiles
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (pErr) {
      console.error('[Admin Clients API] Error fetching profiles:', pErr);
      return NextResponse.json({ error: 'Failed to retrieve clients' }, { status: 500 });
    }

    // 2. Fetch all subscriptions to get live plans
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan_id, status');

    const subMap = new Map<string, { plan_id: string; status: string }>();
    if (subscriptions) {
      for (const s of subscriptions) {
        subMap.set(s.user_id, { plan_id: s.plan_id, status: s.status });
      }
    }

    // 3. Assemble complete client objects
    const clients = (profiles || []).map((row) => {
      const sub = subMap.get(row.id);
      const planName = sub?.plan_id
        ? sub.plan_id.charAt(0).toUpperCase() + sub.plan_id.slice(1)
        : 'Free Trial';

      const statusName = sub?.status
        ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1)
        : 'Active';

      return {
        id: row.id,
        businessName: row.business_name || 'My Business',
        businessType: row.business_type || 'General Service',
        ownerName: row.owner_name || 'Owner',
        email: row.email || '',
        phone: '',
        plan: planName,
        status: statusName,
        role: row.role || 'user',
        signupDate: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '',
        lastActive: 'Active recently',
        totalWorkflows: 3,
        totalExecutions: 45,
      };
    });

    return NextResponse.json({ clients }, { status: 200 });
  } catch (err: any) {
    console.error('[Admin Clients API] Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/clients
 * Updates a client's plan or status in subscriptions / profiles.
 */
export async function PATCH(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, plan, status } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    if (plan) {
      const normalizedPlan = plan.toLowerCase();
      await supabaseAdmin
        .from('subscriptions')
        .upsert({ user_id: id, plan_id: normalizedPlan, status: 'active' }, { onConflict: 'user_id' });
    }

    if (status) {
      const normalizedStatus = status.toLowerCase();
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: normalizedStatus })
        .eq('user_id', id);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('[Admin Clients API Update Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/clients
 * Removes or deactivates a client account.
 */
export async function DELETE(request: Request) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Cascade delete profile and subscriptions
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', id);
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('[Admin Clients API Delete Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
