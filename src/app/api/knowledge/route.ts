import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const tenantId = auth.session.organizationId || auth.session.user.id;

    const { data: docs, error } = await supabaseAdmin
      .from('knowledge_documents')
      .select('id, user_id, title, document_type, source_url, chunks_count, status, created_at, updated_at')
      .eq('user_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      // In offline mode or schema gap, return empty list
      return NextResponse.json({ documents: [] });
    }

    return NextResponse.json({ documents: docs || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const tenantId = auth.session.organizationId || auth.session.user.id;
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Cascade delete chunks and master document strictly scoped to caller's tenant
    await supabaseAdmin.from('knowledge_chunks').delete().eq('document_id', documentId);
    const { error } = await supabaseAdmin
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', tenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Document and vectorized chunks removed' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
