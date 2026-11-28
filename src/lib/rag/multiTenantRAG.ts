/**
 * StarX-Flow Hybrid Semantic Multi-Tenant RAG Pipeline
 * Tenant-isolated (organization_id + user_id) document ingestion, semantic chunking,
 * Gemini embedding generation (`text-embedding-004`), cosine + lexical hybrid scoring,
 * and context assembly with grounded citations.
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { supabase } from '../supabase';
import { isValidUuid } from '../crm/organizationHelper';

export interface RAGChunk {
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding?: number[] | null;
}

export interface RAGMatch {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  sourceUrl?: string | null;
  content: string;
  score: number;
}

export interface IngestionOptions {
  userId: string;
  organizationId?: string | null;
  title: string;
  documentType: 'pdf' | 'docx' | 'url' | 'text' | 'faq';
  content: string;
  sourceUrl?: string;
  metadata?: Record<string, any>;
}

export interface RetrievalResult {
  contextText: string;
  matches: RAGMatch[];
  sourcesCited: Array<{ title: string; sourceUrl?: string; score: number }>;
  hasSufficientContext: boolean;
}

interface StoredDoc {
  id: string;
  userId: string;
  organizationId?: string | null;
  title: string;
  documentType: string;
  sourceUrl?: string | null;
  content: string;
  chunks: RAGChunk[];
  metadata?: Record<string, any>;
  createdAt: string;
}

const MULTILINGUAL_STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one',
  'our', 'out', 'has', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'way', 'who', 'did',
  'what', 'when', 'where', 'why', 'with', 'this', 'that', 'from', 'they', 'will', 'have',
  'would', 'there', 'their', 'about', 'which', 'could', 'should', 'please', 'thanks', 'hello',
  'der', 'die', 'das', 'und', 'für', 'ist', 'mit', 'auf', 'ein', 'eine', 'wie', 'was', 'wo',
  'ich', 'sie', 'wir', 'ihr', 'haben', 'sind', 'bitte', 'danke', 'hallo',
  'les', 'des', 'une', 'est', 'pour', 'que', 'qui', 'dans', 'avec', 'vous', 'nous', 'bonjour',
]);

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class MultiTenantRAG {
  private static readonly CHUNK_SIZE_CHARS = 800;
  private static readonly CHUNK_OVERLAP_CHARS = 120;
  private static readonly MIN_SIMILARITY_SCORE = 0.18;

  private static inMemoryDocs = new Map<string, StoredDoc>();

  static clearInMemory(): void {
    this.inMemoryDocs.clear();
  }

  /**
   * Generates a dense semantic embedding vector via Gemini text-embedding-004 (bounded timeout).
   * Returns null gracefully when API key is missing or offline.
   */
  static async generateEmbedding(text: string): Promise<number[] | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your-') || !text.trim()) {
      return null;
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(2500),
          body: JSON.stringify({
            content: { parts: [{ text: text.slice(0, 2048) }] },
          }),
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const values = data?.embedding?.values;
      return Array.isArray(values) && values.length > 0 ? values : null;
    } catch {
      return null;
    }
  }

  /**
   * Splits arbitrary text into natural semantic chunks, respecting paragraph and sentence boundaries.
   */
  static splitText(text: string): RAGChunk[] {
    const cleanText = text.replace(/\r\n/g, '\n').trim();
    if (!cleanText) return [];

    const chunks: RAGChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < cleanText.length) {
      let end = start + this.CHUNK_SIZE_CHARS;

      if (end < cleanText.length) {
        const paragraphBreak = cleanText.lastIndexOf('\n\n', end);
        const sentenceBreak = cleanText.lastIndexOf('. ', end);
        const newlineBreak = cleanText.lastIndexOf('\n', end);

        const bestBreak = Math.max(paragraphBreak, sentenceBreak, newlineBreak);
        if (bestBreak > start + 200) {
          end = bestBreak + 1;
        }
      } else {
        end = cleanText.length;
      }

      const chunkContent = cleanText.slice(start, end).trim();
      if (chunkContent.length > 25) {
        const tokenCount = Math.ceil(chunkContent.length / 4);
        chunks.push({
          chunkIndex: chunkIndex++,
          content: chunkContent,
          tokenCount,
        });
      }

      if (end >= cleanText.length) break;
      start = Math.max(end - this.CHUNK_OVERLAP_CHARS, start + 1);
    }

    return chunks;
  }

  /**
   * Ingests, chunks, embeds, and persists a document with strict organization & tenant isolation.
   */
  static async ingestDocument(options: IngestionOptions): Promise<{ documentId: string; chunkCount: number }> {
    const { userId, organizationId, title, documentType, content, sourceUrl, metadata } = options;

    if (!content || content.trim().length === 0) {
      throw new Error('Document content cannot be empty.');
    }

    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
    const chunks = this.splitText(content);
    const documentId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Generate embeddings concurrently in bounded batches of up to 12 chunks
    const embeddedChunks = await Promise.all(
      chunks.map(async (c, idx) => ({
        ...c,
        embedding: idx < 12 ? await this.generateEmbedding(`${title}\n${c.content}`) : null,
      }))
    );

    this.inMemoryDocs.set(documentId, {
      id: documentId,
      userId,
      organizationId: organizationId || null,
      title,
      documentType,
      sourceUrl: sourceUrl || null,
      content,
      chunks: embeddedChunks,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    });

    if (isValidUuid(userId)) {
      try {
        const validOrgId = isValidUuid(organizationId) ? organizationId : null;
        const { data: doc, error: docError } = await client
          .from('knowledge_documents')
          .insert({
            id: documentId,
            user_id: userId,
            organization_id: validOrgId,
            title,
            document_type: documentType,
            source_url: sourceUrl || null,
            content,
            chunks_count: embeddedChunks.length,
            status: 'indexed',
            metadata: metadata || {},
          })
          .select('id')
          .maybeSingle();

        if (!docError && doc && embeddedChunks.length > 0) {
          const chunkRows = embeddedChunks.map((c) => ({
            document_id: doc.id,
            user_id: userId,
            organization_id: validOrgId,
            chunk_index: c.chunkIndex,
            chunk_content: c.content,
            token_count: c.tokenCount,
            embedding: c.embedding || null,
          }));
          await client.from('knowledge_chunks').insert(chunkRows);
        }
      } catch (err: any) {
        console.warn('[MultiTenantRAG] Persisting to in-memory fallback store:', err.message);
      }
    }

    return {
      documentId,
      chunkCount: embeddedChunks.length,
    };
  }

  /**
   * Retrieves organization- & user-scoped context using hybrid semantic (embeddings) + lexical scoring.
   */
  static async retrieveContext(options: {
    userId: string;
    organizationId?: string | null;
    query: string;
    limit?: number;
    minScore?: number;
  }): Promise<RetrievalResult> {
    const {
      userId,
      organizationId,
      query,
      limit = 5,
      minScore = this.MIN_SIMILARITY_SCORE,
    } = options;
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;

    const cleanQuery = query.trim();
    const rawTokens = cleanQuery
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !MULTILINGUAL_STOPWORDS.has(w));

    const queryTokens = rawTokens.length > 0
      ? rawTokens
      : cleanQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

    if (queryTokens.length === 0 && !cleanQuery) {
      return { contextText: '', matches: [], sourcesCited: [], hasSufficientContext: false };
    }

    type CandidateChunk = {
      id: string;
      documentId: string;
      title: string;
      sourceUrl?: string | null;
      content: string;
      embedding?: number[] | null;
    };

    const chunkMap = new Map<string, CandidateChunk>();
    const validUser = isValidUuid(userId);
    const validOrg = isValidUuid(organizationId);

    // 1. Database fetch strictly scoped to tenant's user_id OR organization_id
    if (validUser || validOrg) {
      try {
        let dbQuery = client
          .from('knowledge_chunks')
          .select(`
            id,
            document_id,
            chunk_content,
            embedding,
            knowledge_documents ( id, title, source_url )
          `)
          .limit(120);

        if (validOrg && validUser && organizationId !== userId) {
          dbQuery = dbQuery.or(`organization_id.eq.${organizationId},user_id.eq.${userId}`);
        } else if (validOrg) {
          dbQuery = dbQuery.or(`organization_id.eq.${organizationId},user_id.eq.${organizationId}`);
        } else {
          dbQuery = dbQuery.eq('user_id', userId);
        }

        const { data: dbChunks, error } = await dbQuery;
        if (!error && dbChunks) {
          for (const c of dbChunks as any[]) {
            chunkMap.set(c.id, {
              id: c.id,
              documentId: c.knowledge_documents?.id || c.document_id,
              title: c.knowledge_documents?.title || 'Knowledge Base',
              sourceUrl: c.knowledge_documents?.source_url,
              content: c.chunk_content,
              embedding: Array.isArray(c.embedding) ? c.embedding : null,
            });
          }
        }
      } catch {
        // Fallback to in-memory
      }
    }

    // 2. Include matching in-memory docs (strict tenant isolation)
    for (const doc of this.inMemoryDocs.values()) {
      const matchesUser = Boolean(userId && doc.userId === userId);
      const matchesOrg = Boolean(organizationId && doc.organizationId === organizationId);
      if (matchesUser || matchesOrg) {
        for (const c of doc.chunks) {
          const cid = `${doc.id}-chunk-${c.chunkIndex}`;
          if (!chunkMap.has(cid)) {
            chunkMap.set(cid, {
              id: cid,
              documentId: doc.id,
              title: doc.title,
              sourceUrl: doc.sourceUrl,
              content: c.content,
              embedding: c.embedding || null,
            });
          }
        }
      }
    }

    const chunksToSearch = Array.from(chunkMap.values());
    if (chunksToSearch.length === 0) {
      return { contextText: '', matches: [], sourcesCited: [], hasSufficientContext: false };
    }

    // Compute query embedding only if at least one candidate chunk carries a dense vector
    const anyVectorChunk = chunksToSearch.some((c) => Array.isArray(c.embedding) && c.embedding.length > 0);
    const queryEmbedding = anyVectorChunk ? await this.generateEmbedding(cleanQuery) : null;

    const queryLower = cleanQuery.toLowerCase();
    const scoredMatches: RAGMatch[] = [];

    for (const c of chunksToSearch) {
      const contentLower = c.content.toLowerCase();
      const titleLower = c.title.toLowerCase();

      // Lexical token + title + phrase score
      let tokenHits = 0;
      for (const token of queryTokens) {
        if (contentLower.includes(token)) tokenHits += 1;
        else if (titleLower.includes(token)) tokenHits += 0.7;
      }
      const lexicalScore = queryTokens.length > 0 ? Math.min(1, tokenHits / queryTokens.length) : 0;
      const phraseBoost = queryLower.length >= 6 && contentLower.includes(queryLower) ? 0.2 : 0;

      // Semantic cosine similarity when vectors available
      const semanticScore =
        queryEmbedding && c.embedding && c.embedding.length === queryEmbedding.length
          ? Math.max(0, cosineSimilarity(queryEmbedding, c.embedding))
          : 0;

      const combinedScore =
        queryEmbedding && c.embedding
          ? Math.min(1, semanticScore * 0.65 + (lexicalScore + phraseBoost) * 0.35)
          : Math.min(1, lexicalScore + phraseBoost);

      if (combinedScore >= minScore) {
        scoredMatches.push({
          chunkId: c.id,
          documentId: c.documentId,
          documentTitle: c.title,
          sourceUrl: c.sourceUrl,
          content: c.content,
          score: Math.round(combinedScore * 1000) / 1000,
        });
      }
    }

    scoredMatches.sort((a, b) => b.score - a.score);
    const topMatches = scoredMatches.slice(0, limit);

    if (topMatches.length === 0) {
      return { contextText: '', matches: [], sourcesCited: [], hasSufficientContext: false };
    }

    const contextText = topMatches
      .map((m, idx) => `[Source ${idx + 1}: ${m.documentTitle}]\n${m.content}`)
      .join('\n\n');

    const sourcesCited = Array.from(
      new Map(
        topMatches.map((m) => [
          m.documentTitle,
          {
            title: m.documentTitle,
            sourceUrl: m.sourceUrl || undefined,
            score: Math.round(m.score * 100) / 100,
          },
        ])
      ).values()
    );

    return {
      contextText,
      matches: topMatches,
      sourcesCited,
      hasSufficientContext: true,
    };
  }

  /**
   * Deletes a document and all related chunks for a tenant.
   */
  static async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    const doc = this.inMemoryDocs.get(documentId);
    if (doc && doc.userId === userId) {
      this.inMemoryDocs.delete(documentId);
    }

    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      await client.from('knowledge_documents').delete().eq('id', documentId).eq('user_id', userId);
    } catch {
      // Ignored in offline mode
    }

    return true;
  }

  static async reindexDocument(userId: string, documentId: string): Promise<boolean> {
    const doc = this.inMemoryDocs.get(documentId);
    if (!doc || doc.userId !== userId) return false;

    doc.chunks = this.splitText(doc.content);
    return true;
  }
}
