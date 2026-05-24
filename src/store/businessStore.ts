import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type BusinessMemory, type BusinessGoal } from './authStore';

const MOCK_BUSINESS_MEMORIES: BusinessMemory[] = [
  { id: 'bm-1', key: 'business_hours', value: 'Monday - Friday: 9:00 AM - 7:00 PM, Saturday: 9:00 AM - 5:00 PM, Sunday: Closed', category: 'hours' },
  { id: 'bm-2', key: 'cancellation_policy', value: 'Clients can cancel or reschedule up to 24 hours in advance without fee. Cancellations under 24 hours incur a 50% charge.', category: 'policy' },
  { id: 'bm-3', key: 'first_visit_discount', value: 'New clients receive a 15% discount code (WELCOME15) automatically applied to their first scheduled slot.', category: 'general' },
  { id: 'bm-4', key: 'address_faq', value: 'We are located at 120 Brand Ave, Suite 300, near the downtown city park. Free customer parking is available in the back.', category: 'faq' }
];

const MOCK_BUSINESS_GOALS: BusinessGoal[] = [
  { id: 'bg-1', title: 'Triage Inbound Leads', description: 'Triage WhatsApp/SMS leads automatically with AI and schedule booking slots.', targetValue: 50, currentValue: 32, unit: 'bookings', targetDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString(), status: 'active' },
  { id: 'bg-2', title: 'Save Staff Support Hours', description: 'Reduce manual phone/text customer support time via automated agents.', targetValue: 30, currentValue: 18, unit: 'hours', targetDate: new Date(Date.now() + 3600000 * 24 * 14).toISOString(), status: 'active' },
  { id: 'bg-3', title: 'AI Assistant Match Rate', description: 'Maintain high AI auto-resolution rate without human support agent takeover.', targetValue: 95, currentValue: 92, unit: 'percent', targetDate: new Date(Date.now() + 3600000 * 24 * 30).toISOString(), status: 'active' },
  { id: 'bg-4', title: 'Collect Reviews Boost', description: 'Automate checkout text reminders to collect public Google reviews.', targetValue: 20, currentValue: 15, unit: 'count', targetDate: new Date(Date.now() + 3600000 * 24 * 10).toISOString(), status: 'active' }
];

interface BusinessState {
  businessMemories: BusinessMemory[];
  businessGoals: BusinessGoal[];
  fetchBusinessMemories: () => Promise<void>;
  addBusinessMemory: (memory: Omit<BusinessMemory, 'id'>) => Promise<void>;
  updateBusinessMemory: (id: string, updates: Partial<BusinessMemory>) => Promise<void>;
  deleteBusinessMemory: (id: string) => Promise<void>;
  fetchBusinessGoals: () => Promise<void>;
  addBusinessGoal: (goal: Omit<BusinessGoal, 'id' | 'status'>) => Promise<void>;
  updateBusinessGoal: (id: string, updates: Partial<BusinessGoal>) => Promise<void>;
  deleteBusinessGoal: (id: string) => Promise<void>;
  resetBusinessStore: () => void;
}

function dbRowToBusinessMemory(row: Record<string, unknown>): BusinessMemory {
  return {
    id: row.id as string,
    key: row.key as string,
    value: row.value as string,
    category: (row.category as string) || 'general',
  };
}

function dbRowToBusinessGoal(row: Record<string, unknown>): BusinessGoal {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    targetValue: Number(row.target_value) || 0,
    currentValue: Number(row.current_value) || 0,
    unit: (row.unit as string) || 'count',
    targetDate: row.target_date as string | null,
    status: (row.status as string) || 'active',
  };
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businessMemories: [],
  businessGoals: [],

  fetchBusinessMemories: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ businessMemories: MOCK_BUSINESS_MEMORIES });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('business_memories')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('[StarX] Fetch business memories error:', error);
        return;
      }

      if (data && data.length > 0) {
        set({ businessMemories: data.map(dbRowToBusinessMemory) });
      } else {
        set({ businessMemories: MOCK_BUSINESS_MEMORIES });
      }
    } catch (e) {
      console.error('[StarX] Fetch business memories exception:', e);
      set({ businessMemories: MOCK_BUSINESS_MEMORIES });
    }
  },

  addBusinessMemory: async (memory) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    const tempId = `bm-${Date.now()}`;

    const fresh: BusinessMemory = {
      ...memory,
      id: tempId,
    };

    set((state) => ({
      businessMemories: [...state.businessMemories, fresh],
    }));

    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('business_memories')
        .insert({
          user_id: userId,
          key: memory.key,
          value: memory.value,
          category: memory.category,
        })
        .select()
        .single();

      if (data) {
        set((state) => ({
          businessMemories: state.businessMemories.map((m) =>
            m.id === tempId ? dbRowToBusinessMemory(data) : m
          ),
        }));
      }
      if (error) console.error('[StarX] Add business memory error:', error);
    }
  },

  updateBusinessMemory: async (id, updates) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.key !== undefined) dbUpdates.key = updates.key;
    if (updates.value !== undefined) dbUpdates.value = updates.value;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    set((state) => ({
      businessMemories: state.businessMemories.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('business_memories')
        .update(dbUpdates)
        .eq('id', id);

      if (error) console.error('[StarX] Update business memory error:', error);
    }
  },

  deleteBusinessMemory: async (id) => {
    set((state) => ({
      businessMemories: state.businessMemories.filter((m) => m.id !== id),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('business_memories')
        .delete()
        .eq('id', id);

      if (error) console.error('[StarX] Delete business memory error:', error);
    }
  },

  fetchBusinessGoals: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ businessGoals: MOCK_BUSINESS_GOALS });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('business_goals')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('[StarX] Fetch business goals error:', error);
        return;
      }

      if (data && data.length > 0) {
        set({ businessGoals: data.map(dbRowToBusinessGoal) });
      } else {
        set({ businessGoals: MOCK_BUSINESS_GOALS });
      }
    } catch (e) {
      console.error('[StarX] Fetch business goals exception:', e);
      set({ businessGoals: MOCK_BUSINESS_GOALS });
    }
  },

  addBusinessGoal: async (goal) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    const tempId = `bg-${Date.now()}`;

    const fresh: BusinessGoal = {
      ...goal,
      id: tempId,
      status: 'active',
    };

    set((state) => ({
      businessGoals: [...state.businessGoals, fresh],
    }));

    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('business_goals')
        .insert({
          user_id: userId,
          title: goal.title,
          description: goal.description,
          target_value: goal.targetValue,
          current_value: goal.currentValue,
          unit: goal.unit,
          target_date: goal.targetDate,
          status: 'active',
        })
        .select()
        .single();

      if (data) {
        set((state) => ({
          businessGoals: state.businessGoals.map((g) =>
            g.id === tempId ? dbRowToBusinessGoal(data) : g
          ),
        }));
      }
      if (error) console.error('[StarX] Add business goal error:', error);
    }
  },

  updateBusinessGoal: async (id, updates) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
    if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    set((state) => ({
      businessGoals: state.businessGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('business_goals')
        .update(dbUpdates)
        .eq('id', id);

      if (error) console.error('[StarX] Update business goal error:', error);
    }
  },

  deleteBusinessGoal: async (id) => {
    set((state) => ({
      businessGoals: state.businessGoals.filter((g) => g.id !== id),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('business_goals')
        .delete()
        .eq('id', id);

      if (error) console.error('[StarX] Delete business goal error:', error);
    }
  },

  resetBusinessStore: () => {
    set({
      businessMemories: [],
      businessGoals: [],
    });
  }
}));
