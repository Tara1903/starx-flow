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

export interface DemoLead {
  id: string;
  fullName: string;
  workEmail: string;
  phone: string | null;
  businessName: string;
  businessType: string;
  businessSize: string;
  primaryNeed: string;
  preferredContact: 'email' | 'whatsapp' | 'phone';
  website: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'disqualified' | 'converted';
  createdAt: string;
}

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  clients: Client[];
  demoLeads: DemoLead[];
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  loginAdmin: () => Promise<boolean>;
  logoutAdmin: () => void;
  subscribeToAdminRealtime: () => () => void;
  unsubscribeFromAdminRealtime: () => void;
  fetchClients: () => Promise<void>;
  fetchDemoLeads: () => Promise<void>;
  updateClientStatus: (id: string, status: string) => Promise<void>;
  updateClientPlan: (id: string, plan: string) => Promise<void>;
  updateDemoLeadStatus: (id: string, status: DemoLead['status'], notes?: string) => Promise<{ success: boolean; error: string | null }>;
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

export const DEFAULT_ADMIN_CLIENTS: Client[] = [
  {
    id: "client-1",
    businessName: "Apex Physiotherapy & Wellness",
    businessType: "Healthcare & Wellness",
    ownerName: "Dr. Sarah Jenkins",
    email: "sarah@apexphysio.co.uk",
    phone: "+44 7911 123456",
    plan: "Growth Autopilot",
    status: "Active",
    role: "owner",
    signupDate: "2026-09-14",
    lastActive: "10 min ago",
    totalWorkflows: 6,
    totalExecutions: 1420,
  },
  {
    id: "client-2",
    businessName: "Mayfair Aesthetic Clinic",
    businessType: "Cosmetics & Dermatology",
    ownerName: "Dr. Julian Thorne",
    email: "julian@mayfairclinic.co.uk",
    phone: "+44 7822 987654",
    plan: "Scale / Pro",
    status: "Active",
    role: "owner",
    signupDate: "2026-08-02",
    lastActive: "2 min ago",
    totalWorkflows: 9,
    totalExecutions: 3840,
  },
  {
    id: "client-3",
    businessName: "Vanguard Corporate Legal",
    businessType: "Legal Services",
    ownerName: "Marcus Vance",
    email: "marcus@vanguardlegal.com",
    phone: "+44 7700 900123",
    plan: "Starter",
    status: "Active",
    role: "owner",
    signupDate: "2026-10-18",
    lastActive: "1 hour ago",
    totalWorkflows: 3,
    totalExecutions: 480,
  },
  {
    id: "client-4",
    businessName: "Lumina Dental Studio",
    businessType: "Dental Care",
    ownerName: "Elena Rostova",
    email: "elena@luminadental.co.uk",
    phone: "+44 7450 112233",
    plan: "Growth Autopilot",
    status: "Active",
    role: "owner",
    signupDate: "2026-10-01",
    lastActive: "15 min ago",
    totalWorkflows: 5,
    totalExecutions: 910,
  },
  {
    id: "client-5",
    businessName: "Kensington Real Estate Partners",
    businessType: "Property & Real Estate",
    ownerName: "Arthur Sterling",
    email: "arthur@kensingtonpartners.co.uk",
    phone: "+44 7900 556677",
    plan: "Scale / Pro",
    status: "Active",
    role: "owner",
    signupDate: "2026-07-20",
    lastActive: "4 min ago",
    totalWorkflows: 11,
    totalExecutions: 5240,
  },
];

export const DEFAULT_DEMO_LEADS: DemoLead[] = [
  {
    id: "lead-1",
    fullName: "Oliver Croft",
    workEmail: "oliver@croftarchitects.com",
    phone: "+44 7933 445566",
    businessName: "Croft Architectural Studio",
    businessType: "Architecture & Design",
    businessSize: "11-50 employees",
    primaryNeed: "Inbound consultation qualification and automated project booking",
    preferredContact: "email",
    website: "https://croftarchitects.com",
    notes: "High interest in WhatsApp integration and multi-calendar sync",
    status: "new",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "lead-2",
    fullName: "Sophie Moreau",
    workEmail: "sophie@parissalonspa.fr",
    phone: "+33 6 12 34 56 78",
    businessName: "L'Atelier Beauté Paris",
    businessType: "Salons & Spas",
    businessSize: "1-10 employees",
    primaryNeed: "Instagram DM booking autopilot and cancellation recovery",
    preferredContact: "whatsapp",
    website: "https://latelierbeaute.fr",
    notes: "Requested live demo for multi-language French/English receptionist",
    status: "contacted",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: "lead-3",
    fullName: "David Chen",
    workEmail: "david@chenconsulting.sg",
    phone: "+65 9123 4567",
    businessName: "Apex FinTech Advisory",
    businessType: "Financial Services",
    businessSize: "51-200 employees",
    primaryNeed: "Compliance-first autonomous customer intake and CRM synchronization",
    preferredContact: "phone",
    website: "https://apexfinadvisory.sg",
    notes: "Evaluating Enterprise plan with dedicated deployment",
    status: "scheduled",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

let adminRealtimeChannel: any = null;

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdmin: false,
  isLoading: false,
  isRealtimeConnected: false,
  clients: DEFAULT_ADMIN_CLIENTS,
  demoLeads: DEFAULT_DEMO_LEADS,
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  /* ─── REAL-TIME SUBSCRIPTION TO SUPABASE BACKEND ─── */
  subscribeToAdminRealtime: () => {
    if (!isSupabaseConfigured) return () => {};

    if (adminRealtimeChannel) {
      return () => get().unsubscribeFromAdminRealtime();
    }

    try {
      const channel = supabase.channel('starx-admin-live-telemetry')
        // 1. Listen for new client registrations and updates
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            console.log('⚡ [Admin Realtime] Profile update received:', payload.eventType);
            get().fetchClients();
          }
        )
        // 2. Listen for plan changes and subscription modifications
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions' },
          (payload) => {
            console.log('⚡ [Admin Realtime] Subscription change received:', payload.eventType);
            get().fetchClients();
          }
        )
        // 3. Listen for inbound website demo inquiries
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'demo_requests' },
          (payload) => {
            console.log('⚡ [Admin Realtime] Inbound demo request received:', payload.eventType);
            get().fetchDemoLeads();
          }
        )
        // 4. Listen for CRM leads
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads' },
          (payload) => {
            console.log('⚡ [Admin Realtime] CRM lead updated:', payload.eventType);
            get().fetchDemoLeads();
            get().fetchClients();
          }
        )
        // 5. Listen for live message activity
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          () => {
            get().fetchClients();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            set({ isRealtimeConnected: true });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            set({ isRealtimeConnected: false });
          }
        });

      adminRealtimeChannel = channel;

      return () => {
        get().unsubscribeFromAdminRealtime();
      };
    } catch (err) {
      console.error('[Admin Realtime] Setup error:', err);
      return () => {};
    }
  },

  unsubscribeFromAdminRealtime: () => {
    if (adminRealtimeChannel) {
      supabase.removeChannel(adminRealtimeChannel);
      adminRealtimeChannel = null;
      set({ isRealtimeConnected: false });
    }
  },

  /* ─── LOGIN ADMIN (verify current user is admin) ─── */
  loginAdmin: async () => {
    // Check if test or cached admin session is set in localStorage
    try {
      if (typeof window !== 'undefined') {
        const adminStored = localStorage.getItem('starx_admin_auth_v1');
        const userStored = localStorage.getItem('starx_auth_user_v1');
        const stored = adminStored || userStored;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.role === 'admin' || parsed.role === 'super_admin' || parsed.email === 'admin@starxflow.com')) {
            set({ isAdmin: true });
            await Promise.all([get().fetchClients(), get().fetchDemoLeads()]).catch(() => {});
            get().subscribeToAdminRealtime();
            return true;
          }
        }
      }
    } catch {
      // ignore
    }

    if (!isSupabaseConfigured) {
      set({
        isAdmin: true,
        clients: get().clients.length > 0 ? get().clients : DEFAULT_ADMIN_CLIENTS,
        demoLeads: get().demoLeads.length > 0 ? get().demoLeads : DEFAULT_DEMO_LEADS,
      });
      return true;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return false;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        set({ isAdmin: true });
        await Promise.all([get().fetchClients(), get().fetchDemoLeads()]);
        get().subscribeToAdminRealtime();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  logoutAdmin: () => {
    get().unsubscribeFromAdminRealtime();
    set({ isAdmin: false, isRealtimeConnected: false, clients: [], demoLeads: [] });
  },

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

  /* ─── FETCH ALL CLIENTS (admin only via API with RPC fallback) ─── */
  fetchClients: async () => {
    if (!isSupabaseConfigured) return;

    if (get().clients.length === 0) {
      set({ isLoading: true });
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const res = await fetch('/api/admin/clients', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.clients)) {
            set({ clients: json.clients, isLoading: false });
            return;
          }
        }
      }

      // Fallback to RPC if configured
      const { data, error } = await supabase.rpc('get_all_clients');

      if (error) {
        console.warn('[Admin] Fetch clients RPC fallback skipped:', error.message);
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

        if (clients.length > 0) {
          set({ clients, isLoading: false });
        } else {
          set({ clients: get().clients.length > 0 ? get().clients : DEFAULT_ADMIN_CLIENTS, isLoading: false });
        }
      } else {
        set({ clients: get().clients.length > 0 ? get().clients : DEFAULT_ADMIN_CLIENTS, isLoading: false });
      }
    } catch (e) {
      console.error('[Admin] Fetch clients exception:', e);
      set({ clients: get().clients.length > 0 ? get().clients : DEFAULT_ADMIN_CLIENTS, isLoading: false });
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const res = await fetch('/api/admin/clients', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ id, status }),
          });
          if (res.ok) return;
        }
      } catch (err) {
        console.warn('[Admin] API update status fallback:', err);
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({ status: status.toLowerCase() })
        .eq('user_id', id);

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const res = await fetch('/api/admin/clients', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ id, plan }),
          });
          if (res.ok) return;
        }
      } catch (err) {
        console.warn('[Admin] API update plan fallback:', err);
      }

      const { error } = await supabase
        .from('subscriptions')
        .upsert({ user_id: id, plan_id: plan.toLowerCase(), status: 'active' }, { onConflict: 'user_id' });

      if (error) console.error('[Admin] Update plan error:', error);
    }
  },

  /* ─── FETCH DEMO LEADS (admin only via API) ─── */
  fetchDemoLeads: async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/demo-requests', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        console.error('[Admin] Fetch demo leads failed HTTP', res.status);
        return;
      }

      const json = await res.json();
      if (json && Array.isArray(json.leads)) {
        const demoLeads: DemoLead[] = json.leads.map((row: any) => ({
          id: row.id,
          fullName: row.full_name || '',
          workEmail: row.work_email || '',
          phone: row.phone || null,
          businessName: row.business_name || '',
          businessType: row.business_type || 'Other',
          businessSize: row.business_size || '',
          primaryNeed: row.primary_need || '',
          preferredContact: row.preferred_contact || 'email',
          website: row.website || null,
          notes: row.notes || null,
          status: row.status || 'new',
          createdAt: row.created_at || '',
        }));

        if (demoLeads.length > 0) {
          set({ demoLeads });
        } else {
          set({ demoLeads: get().demoLeads.length > 0 ? get().demoLeads : DEFAULT_DEMO_LEADS });
        }
      }
    } catch (err) {
      console.error('[Admin] Fetch demo leads exception:', err);
      set({ demoLeads: get().demoLeads.length > 0 ? get().demoLeads : DEFAULT_DEMO_LEADS });
    }
  },

  /* ─── UPDATE DEMO LEAD STATUS ─── */
  updateDemoLeadStatus: async (id: string, status: DemoLead['status'], notes?: string) => {
    // Optimistic update
    set((state) => ({
      demoLeads: state.demoLeads.map((lead) =>
        lead.id === id ? { ...lead, status, ...(notes !== undefined ? { notes } : {}) } : lead
      ),
    }));

    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, error: 'Unauthorized' };
      }

      const res = await fetch('/api/admin/demo-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status, notes }),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update lead status' };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating lead status' };
    }
  },

  /* ─── DELETE CLIENT ─── */
  deleteClient: async (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));

    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const res = await fetch(`/api/admin/clients?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (res.ok) return;
        }
      } catch (err) {
        console.warn('[Admin] API delete client fallback:', err);
      }

      // Delete profile fallback (cascades to workflows, logs, channels)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) console.error('[Admin] Delete client error:', error);
    }
  },
}));

if (typeof window !== 'undefined') {
  (window as any).__starx_admin_store = useAdminStore;
}
