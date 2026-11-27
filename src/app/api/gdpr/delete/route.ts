import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

/**
 * GDPR Article 17: Right to Erasure (Right to be Forgotten)
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.confirmErasure) {
      return NextResponse.json(
        { error: 'Confirmation flag confirmErasure: true is required for permanent data destruction' },
        { status: 400 }
      );
    }

    // Cascade delete user data across tables and fail fast on any DB error
    const userOwnedTables = [
      'calls',
      'tasks',
      'appointments',
      'execution_logs',
      'consent_logs',
      'usage_records',
      'analytics_events',
      'agent_memories',
      'business_memories',
      'business_goals',
      'campaigns',
      'knowledge_documents',
      'workflows',
      'orders',
      'invoices',
      'subscriptions',
      'connected_channels',
      'connected_accounts',
      'mobile_push_devices',
      'organization_members',
      'agents',
      'working_hours',
      'conversations',
      'leads',
    ] as const;

    const deleteResults = await Promise.all(
      userOwnedTables.map((table) =>
        supabaseAdmin.from(table).delete().eq('user_id', user.id).then((res) => ({ table, error: res.error }))
      )
    );

    const failedDelete = deleteResults.find((r) => r.error);
    if (failedDelete?.error) {
      throw new Error(`Failed deleting user data from ${failedDelete.table}: ${failedDelete.error.message}`);
    }

    const { error: profileDeleteErr } = await supabaseAdmin.from('profiles').delete().eq('id', user.id);
    if (profileDeleteErr) {
      throw new Error(`Failed deleting profile: ${profileDeleteErr.message}`);
    }

    // Delete auth user from Supabase Auth
    const { error: authDeleteErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (authDeleteErr) {
      throw new Error(`Failed deleting auth user: ${authDeleteErr.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'All personal data permanently erased pursuant to GDPR Article 17.',
    });
  } catch (err: unknown) {
    console.error('[GDPR Delete error]:', err);
    return NextResponse.json({ error: sanitizeClientError(err, 'Account erasure failed') }, { status: 500 });
  }
}
