import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lead } from '../types/database';
import { useAuthStore } from './authStore';
import { sanitizeClientError } from '../lib/security/sanitizeClientError';

interface CrmState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
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

const SAMPLE_LEADS: Lead[] = [
  {
    id: 'lead-1',
    user_id: 'demo-sarah-jenkins',
    name: 'Sarah Jenkins',
    email: 'sarah.j@gmail.com',
    phone: '+44 7700 900123',
    status: 'qualified',
    source: 'whatsapp',
    score: 92,
    tags: ['VIP', 'WhatsApp', 'Massage'],
    last_contact_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'Requested deep tissue massage for back pain. Converted from WhatsApp chat.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-2',
    user_id: 'demo-sarah-jenkins',
    name: 'Marcus Vance',
    email: 'marcus.v@outlook.com',
    phone: '+44 7700 900456',
    status: 'contacted',
    source: 'instagram',
    score: 78,
    tags: ['Instagram', 'Fitness'],
    last_contact_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    notes: 'Direct message inquiry about fitness consultation and training packages.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-3',
    user_id: 'demo-sarah-jenkins',
    name: 'Elena Rostova',
    email: 'elena.rostova@techcorp.io',
    phone: '+44 7700 900789',
    status: 'converted',
    source: 'sms',
    score: 95,
    tags: ['Regular', 'Sports Recovery'],
    last_contact_at: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Regular sports recovery client. Automated reminder confirmed.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-4',
    user_id: 'demo-sarah-jenkins',
    name: 'David Chen',
    email: 'david.chen@consulting.co',
    phone: '+44 7700 900321',
    status: 'new',
    source: 'web_chat',
    score: 65,
    tags: ['Corporate', 'Web Chat'],
    last_contact_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    notes: 'Inquired through web chat widget about weekend appointment availability.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useCrmStore = create<CrmState>((set, get) => ({
  leads: SAMPLE_LEADS,
  isLoading: false,
  error: null,
  searchQuery: '',
  statusFilter: 'all',
  sourceFilter: 'all',

  fetchLeads: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ leads: SAMPLE_LEADS, isLoading: false, error: null });
      return;
    }

    // If demo session or non-UUID, keep sample data without querying DB
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isUuid || !isSupabaseConfigured) {
      set({ leads: get().leads.length > 0 ? get().leads : SAMPLE_LEADS, isLoading: false, error: null });
      return;
    }

    // Stale-while-revalidate: only show skeleton if no data is present yet
    if (get().leads.length === 0) {
      set({ isLoading: true, error: null });
    }
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        set({ leads: (data as Lead[]), error: null });
      } else {
        set({ leads: isUuid ? [] : SAMPLE_LEADS, error: null });
      }
    } catch (err: unknown) {
      set({
        leads: isUuid ? [] : SAMPLE_LEADS,
        error: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createLead: async (leadData) => {
    const user = useAuthStore.getState().user;
    if (!user) return { lead: null, error: 'User not logged in' };

    const fallbackLead: Lead = {
      id: `lead-${Date.now()}`,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({ leads: [fallbackLead, ...state.leads] }));

    if (!isSupabaseConfigured) {
      return { lead: fallbackLead, error: null };
    }

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
      set((state) => ({
        leads: state.leads.map((l) => (l.id === fallbackLead.id ? created : l)),
      }));
      return { lead: created, error: null };
    } catch (err: any) {
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== fallbackLead.id),
      }));
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
