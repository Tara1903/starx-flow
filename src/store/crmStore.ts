import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lead } from '../types/database';
import { useAuthStore } from './authStore';

interface CrmState {
  leads: Lead[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  sourceFilter: string;

  fetchLeads: () => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ lead: Lead | null; error: string | null }>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<{ error: string | null }>;
  deleteLead: (id: string) => Promise<{ error: string | null }>;
  importLeads: (newLeads: Array<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<{ imported: number; error: string | null }>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setSourceFilter: (source: string) => void;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  leads: [],
  isLoading: false,
  searchQuery: '',
  statusFilter: 'all',
  sourceFilter: 'all',

  fetchLeads: async () => {
    const user = useAuthStore.getState().user;
    if (!user || !isSupabaseConfigured) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ leads: (data as Lead[]) || [] });
    } catch (err: any) {
      console.warn('[CrmStore] fetchLeads failed:', err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  createLead: async (leadData) => {
    const user = useAuthStore.getState().user;
    if (!user) return { lead: null, error: 'User not logged in' };

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          name: leadData.name,
          phone: leadData.phone || null,
          email: leadData.email || null,
          status: leadData.status || 'new',
          source: leadData.source || 'manual',
          score: leadData.score ?? 50,
          tags: leadData.tags || [],
          notes: leadData.notes || null,
          last_contact_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      const created = data as Lead;
      set((state) => ({ leads: [created, ...state.leads] }));
      return { lead: created, error: null };
    } catch (err: any) {
      return { lead: null, error: err.message };
    }
  },

  updateLead: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  deleteLead: async (id) => {
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  importLeads: async (newLeads) => {
    const user = useAuthStore.getState().user;
    if (!user) return { imported: 0, error: 'User not logged in' };

    try {
      const rows = newLeads.map((l) => ({
        user_id: user.id,
        name: l.name,
        phone: l.phone || null,
        email: l.email || null,
        status: l.status || 'new',
        source: 'csv_import',
        score: l.score ?? 50,
        tags: l.tags || ['imported'],
        notes: l.notes || null,
      }));

      const { data, error } = await supabase.from('leads').insert(rows).select();
      if (error) throw error;

      const inserted = (data as Lead[]) || [];
      set((state) => ({ leads: [...inserted, ...state.leads] }));
      return { imported: inserted.length, error: null };
    } catch (err: any) {
      return { imported: 0, error: err.message };
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSourceFilter: (source) => set({ sourceFilter: source }),
}));
