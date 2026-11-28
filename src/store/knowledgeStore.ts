import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabase';
import { crmFetch } from '../lib/crm/crmApi';
import { KnowledgeDocument } from '../types/database';

export interface RetrievedChunkMatch {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  sourceUrl?: string | null;
  content: string;
  score: number;
}

interface KnowledgeState {
  documents: KnowledgeDocument[];
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  ingestDocument: (params: {
    title: string;
    documentType: 'pdf' | 'docx' | 'url' | 'text' | 'faq';
    content: string;
    sourceUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  retrieveContext: (
    query: string,
    limit?: number
  ) => Promise<{
    matches: RetrievedChunkMatch[];
    sourcesCited: Array<{ title: string; sourceUrl?: string; score: number }>;
    hasSufficientContext: boolean;
    error: string | null;
  }>;
  deleteDocument: (id: string) => Promise<{ success: boolean; error?: string }>;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Ignore error in offline mode
  }
  return {};
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/knowledge?userId=${encodeURIComponent(user.id)}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.documents)) {
          set({ documents: data.documents });
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch knowledge documents:', err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  ingestDocument: async ({ title, documentType, content, sourceUrl }) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };

    set({ isLoading: true, error: null });
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          userId: user.id,
          title,
          documentType,
          content,
          sourceUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message || data?.error || 'Ingestion failed';
        set({ error: errMsg, isLoading: false });
        return { success: false, error: errMsg };
      }

      const newDoc: KnowledgeDocument = {
        id: data.documentId || `doc-${Date.now()}`,
        user_id: user.id,
        title,
        document_type: documentType,
        source_url: sourceUrl || null,
        content,
        chunks_count: data.chunksCount || Math.ceil(content.length / 500) || 1,
        status: 'indexed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        documents: [newDoc, ...state.documents],
        isLoading: false,
      }));

      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  retrieveContext: async (query: string, limit = 5) => {
    const res = await crmFetch<{
      matches: RetrievedChunkMatch[];
      sourcesCited: Array<{ title: string; sourceUrl?: string; score: number }>;
      hasSufficientContext: boolean;
    }>('/api/knowledge/retrieve', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });

    if (!res.ok || !res.data) {
      return {
        matches: [],
        sourcesCited: [],
        hasSufficientContext: false,
        error: res.error || 'Failed to retrieve knowledge context',
      };
    }

    return {
      matches: res.data.matches || [],
      sourcesCited: res.data.sourcesCited || [],
      hasSufficientContext: Boolean(res.data.hasSufficientContext),
      error: null,
    };
  },

  deleteDocument: async (id: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/knowledge?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        return {
          success: false,
          error: data?.error?.message || data?.error || `Delete failed (${res.status})`,
        };
      }
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
}));
