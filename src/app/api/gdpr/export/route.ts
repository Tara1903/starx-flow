import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GDPR Article 20: Right to Data Portability (Export)
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Export all records belonging to user across all tables
    const [profile, leads, convos, appointments, tasks, workflows, logs] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabaseAdmin.from('leads').select('*').eq('user_id', user.id),
      supabaseAdmin.from('conversations').select('*, messages(*)').eq('user_id', user.id),
      supabaseAdmin.from('appointments').select('*').eq('user_id', user.id),
      supabaseAdmin.from('tasks').select('*').eq('user_id', user.id),
      supabaseAdmin.from('workflows').select('*').eq('user_id', user.id),
      supabaseAdmin.from('execution_logs').select('*').eq('user_id', user.id),
    ]);

    // Sanitize conversations to strictly exclude staff-only internal commentary (GDPR privacy isolation)
    const sanitizedConvos = (convos.data || []).map((c: any) => ({
      ...c,
      messages: Array.isArray(c.messages)
        ? c.messages.filter((m: any) => !m.is_internal)
        : [],
    }));

    const exportData = {
      gdpr_compliance: 'EU General Data Protection Regulation (GDPR) Art. 20',
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profile.data,
      leads: leads.data,
      conversations: sanitizedConvos,
      appointments: appointments.data,
      tasks: tasks.data,
      workflows: workflows.data,
      execution_logs: logs.data,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="starx_gdpr_export_${user.id}.json"`,
      },
    });
  } catch (err: any) {
    console.error('[GDPR Export error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
