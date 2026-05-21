import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Client {
  id: string;
  businessName: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  role: string;
  signupDate: string;
  lastActive: string;
  totalWorkflows: number;
  totalExecutions: number;
}

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  clients: Client[];
  loginAdmin: () => Promise<boolean>;
  logoutAdmin: () => void;
  fetchClients: () => Promise<void>;
  updateClientStatus: (id: string, status: string) => Promise<void>;
  updateClientPlan: (id: string, plan: string) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  claimAdminRole: (secret: string) => Promise<{ success: boolean; error: string | null }>;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdmin: false,
  isLoading: false,
  clients: [],

  /* ─── LOGIN ADMIN (verify current user is admin) ─── */
  loginAdmin: async () => {
    if (!isSupabaseConfigured) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      // Enforce single admin account email limit
      if (session.user.email !== 'admin@starxflow.com') return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') {
        set({ isAdmin: true });
        await get().fetchClients();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  logoutAdmin: () => set({ isAdmin: false, clients: [] }),

  /* ─── CLAIM ADMIN ROLE (one-time setup) ─── */
  claimAdminRole: async (secret: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const { data, error } = await supabase.rpc('claim_admin_role', {
        setup_secret: secret,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data === true) {
        set({ isAdmin: true });
        return { success: true, error: null };
      }

      return { success: false, error: 'Invalid setup secret.' };
    } catch {
      return { success: false, error: 'Network error.' };
    }
  },

  /* ─── FETCH ALL CLIENTS (admin only via RPC) ─── */
  fetchClients: async () => {
    if (!isSupabaseConfigured) return;

    set({ isLoading: true });

    try {
      const { data, error } = await supabase.rpc('get_all_clients');

      if (error) {
        console.error('[Admin] Fetch clients error:', error);
        set({ isLoading: false });
        return;
      }

      if (data) {
        const clients: Client[] = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          businessName: (row.business_name as string) || 'Unknown',
          businessType: (row.business_type as string) || 'Other',
          ownerName: (row.owner_name as string) || 'Owner',
          email: (row.email as string) || '',
          phone: (row.phone as string) || '',
          plan: (row.plan as string) || 'Free Trial',
          status: (row.status as string) || 'Trial',
          role: (row.role as string) || 'user',
          signupDate: row.created_at
            ? new Date(row.created_at as string).toISOString().slice(0, 10)
            : '',
          lastActive: row.last_active
            ? formatRelativeTime(row.last_active as string)
            : 'Unknown',
          totalWorkflows: Number(row.total_workflows) || 0,
          totalExecutions: Number(row.total_executions) || 0,
        }));

        set({ clients, isLoading: false });
      }
    } catch (e) {
      console.error('[Admin] Fetch clients exception:', e);
      set({ isLoading: false });
    }
  },

  /* ─── UPDATE CLIENT STATUS ─── */
  updateClientStatus: async (id, status) => {
    // Optimistic
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);

      if (error) console.error('[Admin] Update status error:', error);
    }
  },

  /* ─── UPDATE CLIENT PLAN ─── */
  updateClientPlan: async (id, plan) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, plan } : c
      ),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({ plan })
        .eq('id', id);

      if (error) console.error('[Admin] Update plan error:', error);
    }
  },

  /* ─── DELETE CLIENT ─── */
  deleteClient: async (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));

    if (isSupabaseConfigured) {
      // Delete profile (cascades to workflows, logs, channels)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) console.error('[Admin] Delete client error:', error);
    }
  },
}));
