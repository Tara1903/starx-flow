import { MultiTenantRAG, RAGMatch } from '../rag/multiTenantRAG';
import { DocumentParser } from '../rag/documentParser';

export interface KnowledgeMatch {
  chunkId: string;
  documentTitle: string;
  content: string;
  score: number;
}

export class KnowledgeEngine {
  /**
   * Chunks arbitrary text with a semantic sliding window and overlap.
   */
  static chunkText(text: string, maxChunkLength = 600, overlap = 100): Array<{ chunkIndex: number; content: string; tokenCount: number }> {
    return MultiTenantRAG.splitText(text);
  }

  /**
   * Ingests a new document for a business user, chunks it, and indexes it with tenant isolation.
   */
  static async ingestDocument(
    userId: string,
    title: string,
    documentType: 'pdf' | 'docx' | 'url' | 'text' | 'faq',
    content: string,
    sourceUrl?: string
  ): Promise<{ documentId: string | null; error: string | null }> {
    try {
      const result = await MultiTenantRAG.ingestDocument({
        userId,
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

  /**
   * Retrieves relevant knowledge chunks for a given query, strictly isolated to the user's business.
   */
  static async retrieveRelevantContext(userId: string, query: string, limit = 4): Promise<KnowledgeMatch[]> {
    try {
      const result = await MultiTenantRAG.retrieveContext({
        userId,
        query,
        limit,
      });

      return result.matches.map((m) => ({
        chunkId: m.chunkId,
        documentTitle: m.documentTitle,
        content: m.content,
        score: m.score,
      }));
    } catch (err) {
      console.warn('[KnowledgeEngine] Retrieval failed:', err);
      return [];
    }
  }

  /**
   * Delete document and all associated chunks.
   */
  static async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    return MultiTenantRAG.deleteDocument(userId, documentId);
  }
}
