import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { data: docs, error } = await supabaseAdmin
      .from('knowledge_documents')
      .select('id, user_id, title, document_type, source_url, chunks_count, status, created_at, updated_at')
      .eq('user_id', userId)
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
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!documentId || !userId) {
      return NextResponse.json({ error: 'Missing id or userId parameter' }, { status: 400 });
    }

    // Cascade delete chunks and master document
    await supabaseAdmin.from('knowledge_chunks').delete().eq('document_id', documentId);
    const { error } = await supabaseAdmin
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Document and vectorized chunks removed' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
