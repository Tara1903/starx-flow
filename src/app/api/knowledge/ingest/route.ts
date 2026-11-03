import { NextRequest, NextResponse } from 'next/server';
import { MultiTenantRAG } from '@/lib/rag/multiTenantRAG';
import { DocumentParser } from '@/lib/rag/documentParser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, organizationId, title, documentType, content, sourceUrl, fileBase64 } = body;

    if (!userId || !title || !documentType) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, title, documentType' },
        { status: 400 }
      );
    }

    let parsedContent = content || '';
    let extractedMetadata: Record<string, any> = {};

    // 1. Process based on documentType
    if (documentType === 'url') {
      if (!sourceUrl) {
        return NextResponse.json({ error: 'sourceUrl is required for URL document ingestion.' }, { status: 400 });
      }
      try {
        const parsed = await DocumentParser.parseUrl(sourceUrl, title);
        parsedContent = parsed.content;
        extractedMetadata = parsed.metadata || {};
      } catch (urlErr: any) {
        return NextResponse.json({ error: `URL Ingestion Error: ${urlErr.message}` }, { status: 422 });
      }
    } else if (documentType === 'pdf') {
      if (fileBase64) {
        try {
          const buffer = Buffer.from(fileBase64, 'base64');
          const parsed = await DocumentParser.parsePdf(buffer, title);
          parsedContent = parsed.content;
        } catch (pdfErr: any) {
          return NextResponse.json({ error: `PDF Ingestion Error: ${pdfErr.message}` }, { status: 422 });
        }
      }
    } else if (documentType === 'docx') {
      if (fileBase64) {
        try {
          const buffer = Buffer.from(fileBase64, 'base64');
          const parsed = await DocumentParser.parseDocx(buffer, title);
          parsedContent = parsed.content;
        } catch (docxErr: any) {
          return NextResponse.json({ error: `DOCX Ingestion Error: ${docxErr.message}` }, { status: 422 });
        }
      }
    } else {
      // Text or FAQ
      if (parsedContent) {
        const parsed = DocumentParser.parseText(parsedContent, title);
        parsedContent = parsed.content;
      }
    }

    if (!parsedContent || parsedContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document contains no readable text content to index.' },
        { status: 400 }
      );
    }

    // 2. Ingest into Multi-Tenant RAG
    const { documentId, chunkCount } = await MultiTenantRAG.ingestDocument({
      userId,
      organizationId: organizationId || null,
      title,
      documentType,
      content: parsedContent,
      sourceUrl,
      metadata: extractedMetadata,
    });

    return NextResponse.json({
      success: true,
      documentId,
      chunkCount,
      message: `Document "${title}" successfully ingested and indexed into ${chunkCount} chunks.`,
    });
  } catch (err: any) {
    console.error('[API /api/knowledge/ingest error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
