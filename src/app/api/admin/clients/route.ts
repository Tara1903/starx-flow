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
      .select('user_id, plan_id, status, created_at, updated_at');

    const subMap = new Map<string, { plan_id: string; status: string }>();
    if (subscriptions) {
      for (const s of subscriptions) {
        subMap.set(s.user_id, { plan_id: s.plan_id, status: s.status });
      }
    }

    // 3. Fetch real workflows per user
    const { data: workflows } = await supabaseAdmin
      .from('workflows')
      .select('user_id, is_active');

    const workflowCountMap = new Map<string, number>();
    if (workflows) {
      for (const w of workflows) {
        if (w.user_id) {
          workflowCountMap.set(w.user_id, (workflowCountMap.get(w.user_id) || 0) + 1);
        }
      }
    }

    // 4. Fetch real conversations & executions per user
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('user_id, last_message_at, status');

    const executionMap = new Map<string, { count: number; lastActive: string | null }>();
    if (conversations) {
      for (const c of conversations) {
        if (c.user_id) {
          const entry = executionMap.get(c.user_id) || { count: 0, lastActive: null };
          entry.count += 1;
          if (c.last_message_at && (!entry.lastActive || c.last_message_at > entry.lastActive)) {
            entry.lastActive = c.last_message_at;
          }
          executionMap.set(c.user_id, entry);
        }
      }
    }

    // 5. Assemble complete client objects with real metrics
    const clients = (profiles || []).map((row) => {
      const sub = subMap.get(row.id);
      const rawPlan = (sub?.plan_id || '').toLowerCase().trim();
      let planName = 'Free Trial';
      if (rawPlan === 'starter') planName = 'Starter';
      else if (rawPlan === 'growth') planName = 'Growth';
      else if (rawPlan === 'pro' || rawPlan === 'professional') planName = 'Pro';
      else if (rawPlan === 'enterprise') planName = 'Enterprise';
      else if (rawPlan === 'free' || rawPlan === 'trial' || rawPlan === 'trialing') planName = 'Free Trial';
      else if (rawPlan) planName = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);

      const rawStatus = (sub?.status || 'active').toLowerCase().trim();
      let statusName = 'Active';
      if (rawStatus === 'active') statusName = 'Active';
      else if (rawStatus === 'trial' || rawStatus === 'trialing') statusName = 'Trial';
      else if (rawStatus === 'inactive' || rawStatus === 'paused') statusName = 'Inactive';
      else if (rawStatus === 'canceled' || rawStatus === 'churned') statusName = 'Churned';

      const execInfo = executionMap.get(row.id);
      const userWorkflows = workflowCountMap.get(row.id) || 0;
      const userExecutions = execInfo?.count || 0;

      let lastActiveFormatted = 'Active recently';
      const lastActiveTime = execInfo?.lastActive || row.updated_at || row.created_at;
      if (lastActiveTime) {
        const diffMs = Date.now() - new Date(lastActiveTime).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 5) lastActiveFormatted = 'Just now';
        else if (diffMins < 60) lastActiveFormatted = `${diffMins}m ago`;
        else if (diffMins < 1440) lastActiveFormatted = `${Math.floor(diffMins / 60)}h ago`;
        else lastActiveFormatted = `${Math.floor(diffMins / 1440)}d ago`;
      }

      return {
        id: row.id,
        businessName: row.business_name || 'My Business',
        businessType: row.business_type || 'General Service',
        ownerName: row.owner_name || 'Owner',
        email: row.email || '',
        phone: row.phone || '',
        plan: planName,
        status: statusName,
        role: row.role || 'user',
        signupDate: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '',
        lastActive: lastActiveFormatted,
        totalWorkflows: userWorkflows,
        totalExecutions: userExecutions,
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
      let normalizedPlan = plan.toLowerCase().trim();
      let subStatus = 'active';
      if (normalizedPlan.includes('trial') || normalizedPlan.includes('free')) {
        normalizedPlan = 'free';
        subStatus = 'trial';
      } else if (normalizedPlan === 'starter') {
        normalizedPlan = 'starter';
      } else if (normalizedPlan === 'growth') {
        normalizedPlan = 'growth';
      } else if (normalizedPlan === 'pro' || normalizedPlan === 'professional') {
        normalizedPlan = 'pro';
      } else if (normalizedPlan === 'enterprise') {
        normalizedPlan = 'enterprise';
      }

      await supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            user_id: id,
            plan_id: normalizedPlan,
            status: subStatus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
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
