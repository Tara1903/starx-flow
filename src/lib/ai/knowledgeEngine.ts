import { MultiTenantRAG } from '../rag/multiTenantRAG';

export interface KnowledgeMatch {
  chunkId: string;
  documentTitle: string;
  content: string;
  score: number;
  sourceUrl?: string | null;
}

export class KnowledgeEngine {
  static chunkText(
    text: string
  ): Array<{ chunkIndex: number; content: string; tokenCount: number }> {
    return MultiTenantRAG.splitText(text);
  }

  static async ingestDocument(
    userId: string,
    title: string,
    documentType: 'pdf' | 'docx' | 'url' | 'text' | 'faq',
    content: string,
    sourceUrl?: string,
    organizationId?: string | null
  ): Promise<{ documentId: string | null; error: string | null }> {
    try {
      const result = await MultiTenantRAG.ingestDocument({
        userId,
        organizationId,
        title,
        documentType,
        content,
        sourceUrl,
      });

      return { documentId: result.documentId, error: null };
    } catch (err: any) {
      return { documentId: null, error: err.message || 'Ingestion error' };
    }
  }

  static async retrieveRelevantContext(
    userId: string,
    query: string,
    limit = 5,
    organizationId?: string | null
  ): Promise<KnowledgeMatch[]> {
    try {
      const result = await MultiTenantRAG.retrieveContext({
        userId,
        organizationId,
        query,
        limit,
      });

      return result.matches.map((m) => ({
        chunkId: m.chunkId,
        documentTitle: m.documentTitle,
        content: m.content,
        score: m.score,
        sourceUrl: m.sourceUrl,
      }));
    } catch (err) {
      console.warn('[KnowledgeEngine] Retrieval failed:', err);
      return [];
    }
  }

  static async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    return MultiTenantRAG.deleteDocument(userId, documentId);
  }
}
