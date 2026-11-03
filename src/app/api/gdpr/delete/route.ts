import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GDPR Article 17: Right to Erasure (Right to be Forgotten)
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    if (!body.confirmErasure) {
      return NextResponse.json(
        { error: 'Confirmation flag confirmErasure: true is required for permanent data destruction' },
        { status: 400 }
      );
    }

    // Cascade delete user data across tables
    await Promise.all([
      supabaseAdmin.from('leads').delete().eq('user_id', user.id),
      supabaseAdmin.from('conversations').delete().eq('user_id', user.id),
      supabaseAdmin.from('appointments').delete().eq('user_id', user.id),
      supabaseAdmin.from('tasks').delete().eq('user_id', user.id),
      supabaseAdmin.from('knowledge_documents').delete().eq('user_id', user.id),
      supabaseAdmin.from('workflows').delete().eq('user_id', user.id),
      supabaseAdmin.from('execution_logs').delete().eq('user_id', user.id),
      supabaseAdmin.from('consent_logs').delete().eq('user_id', user.id),
      supabaseAdmin.from('profiles').delete().eq('id', user.id),
    ]);

    // Delete auth user from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({
      success: true,
      message: 'All personal data permanently erased pursuant to GDPR Article 17.',
    });
  } catch (err: any) {
    console.error('[GDPR Delete error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
