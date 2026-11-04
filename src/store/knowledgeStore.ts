import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabase';
import { KnowledgeDocument } from '../types/database';

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
  deleteDocument: (id: string) => Promise<{ success: boolean; error?: string }>;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Ignore error in offline mode
  }
  return {};
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  documents: [
    {
      id: 'doc-sample-1',
      user_id: 'default',
      title: 'Business Hours & Cancellation Policy',
      document_type: 'faq',
      source_url: null,
      content: 'We are open Monday to Saturday from 09:00 to 19:00 CET. Appointments can be rescheduled or cancelled free of charge up to 24 hours prior.',
      chunks_count: 2,
      status: 'indexed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'doc-sample-2',
      user_id: 'default',
      title: 'Pricing Catalog 2026',
      document_type: 'text',
      source_url: null,
      content: 'Standard Consultations: €45. Premium Styling: €85. Express Follow-up: €25. All prices include European statutory VAT.',
      chunks_count: 1,
      status: 'indexed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/knowledge?userId=${user.id}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
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
          sourceUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        set({ error: data.error, isLoading: false });
        return { success: false, error: data.error };
      }

      // Add optimistically or re-fetch
      const newDoc: KnowledgeDocument = {
        id: data.documentId || `doc-${Date.now()}`,
        user_id: user.id,
        title,
        document_type: documentType,
        source_url: sourceUrl || null,
        content,
        chunks_count: Math.ceil(content.length / 500) || 1,
        status: 'indexed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      set((state) => ({
        documents: [newDoc, ...state.documents],
        isLoading: false
      }));

      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  deleteDocument: async (id: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const authHeaders = await getAuthHeaders();
      await fetch(`/api/knowledge?id=${id}&userId=${user.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id)
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}));
