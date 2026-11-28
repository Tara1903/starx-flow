import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { MultiTenantRAG } from '@/lib/rag/multiTenantRAG';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';
import { isValidUuid } from '@/lib/crm/organizationHelper';

function buildKnowledgeTenantScope(userId: string, orgId?: string | null): string | null {
  const validUser = isValidUuid(userId);
  const validOrg = isValidUuid(orgId);
  if (validOrg && validUser && orgId !== userId) {
    return `organization_id.eq.${orgId},user_id.eq.${userId}`;
  }
  if (validOrg) {
    return `organization_id.eq.${orgId},user_id.eq.${orgId}`;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = auth.session.user.id;
    const orgId = auth.session.organizationId;
    const tenantId = orgId || userId;
    const scope = buildKnowledgeTenantScope(userId, orgId);

    const baseQuery = supabaseAdmin
      .from('knowledge_documents')
      .select('id, user_id, organization_id, title, document_type, source_url, content, chunks_count, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    const { data: docs, error } = scope
      ? await baseQuery.or(scope)
      : await baseQuery.eq('user_id', tenantId);

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

    const userId = auth.session.user.id;
    const orgId = auth.session.organizationId;
    const tenantId = orgId || userId;
    const scope = buildKnowledgeTenantScope(userId, orgId);
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id')?.trim();

    if (!documentId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Verify ownership/org access by deleting the tenant-scoped document row first
    const deleteDocQuery = supabaseAdmin.from('knowledge_documents').delete().eq('id', documentId);
    const { data: deletedDoc, error: docErr } = await (scope
      ? deleteDocQuery.or(scope)
      : deleteDocQuery.eq('user_id', tenantId)
    )
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

    const deleteChunksQuery = supabaseAdmin.from('knowledge_chunks').delete().eq('document_id', documentId);
    await (scope ? deleteChunksQuery.or(scope) : deleteChunksQuery.eq('user_id', tenantId));

    await MultiTenantRAG.deleteDocument(tenantId, documentId);
    if (userId !== tenantId) {
      await MultiTenantRAG.deleteDocument(userId, documentId);
    }

    return NextResponse.json({ success: true, message: 'Document and vectorized chunks removed' });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to delete knowledge document') },
      { status: 500 }
    );
  }
}
