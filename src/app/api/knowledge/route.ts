import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { MultiTenantRAG } from '@/lib/rag/multiTenantRAG';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

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
      return NextResponse.json({ documents: [] });
    }

    return NextResponse.json({ documents: docs || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to load knowledge documents') },
      { status: 500 }
    );
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
    const documentId = searchParams.get('id')?.trim();

    if (!documentId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Verify ownership by deleting the tenant-scoped document row first
    const { data: deletedDoc, error: docErr } = await supabaseAdmin
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', tenantId)
      .select('id')
      .maybeSingle();

    if (docErr) {
      return NextResponse.json(
        { error: sanitizeClientError(docErr, 'Failed to remove knowledge document') },
        { status: 500 }
      );
    }

    if (!deletedDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await supabaseAdmin
      .from('knowledge_chunks')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', tenantId);

    await MultiTenantRAG.deleteDocument(tenantId, documentId);

    return NextResponse.json({ success: true, message: 'Document and vectorized chunks removed' });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to delete knowledge document') },
      { status: 500 }
    );
  }
}
