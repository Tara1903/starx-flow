import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type BusinessMemory, type BusinessGoal } from './authStore';
import { resolveClientOrganizationId } from '../lib/crm/crmApi';

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

export const DEFAULT_BUSINESS_MEMORIES: BusinessMemory[] = [
  {
    id: "bmem-1",
    key: "Opening Hours (CET)",
    value: "Monday to Friday: 08:30 - 19:30, Saturday: 09:00 - 16:00, Sunday: Closed",
    category: "hours",
  },
  {
    id: "bmem-2",
    key: "Cancellation & Reschedule Policy",
    value: "Clients may modify or cancel without penalty up to 24 hours prior to appointment time.",
    category: "policy",
  },
  {
    id: "bmem-3",
    key: "Emergency Contact Escalation",
    value: "For urgent clinical inquiries, immediate WhatsApp transfer to Dr. Sarah Jenkins on-call phone.",
    category: "faq",
  },
  {
    id: "bmem-4",
    key: "Accepted Payment Methods",
    value: "All major credit cards, Apple Pay, Google Pay, SEPA Direct Debit, and BACS transfer.",
    category: "general",
  },
];

export const DEFAULT_BUSINESS_GOALS: BusinessGoal[] = [
  {
    id: "bgoal-1",
    title: "Monthly Inbound Booking Volume",
    description: "Target automated appointments booked via WhatsApp and Instagram channels.",
    targetValue: 120,
    currentValue: 84,
    unit: "bookings",
    targetDate: "2026-11-30",
    status: "active",
  },
  {
    id: "bgoal-2",
    title: "Front-Desk Hours Saved via AI",
    description: "Eliminate repetitive manual scheduling and reception phone triage.",
    targetValue: 80,
    currentValue: 56,
    unit: "hours",
    targetDate: "2026-11-30",
    status: "active",
  },
  {
    id: "bgoal-3",
    title: "Google Review Sentiment Rating",
    description: "Maintain 5-star verified European customer satisfaction index.",
    targetValue: 98,
    currentValue: 96,
    unit: "percent",
    targetDate: "2026-12-31",
    status: "active",
  },
];

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businessMemories: DEFAULT_BUSINESS_MEMORIES,
  businessGoals: DEFAULT_BUSINESS_GOALS,

  fetchBusinessMemories: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ businessMemories: get().businessMemories.length > 0 ? get().businessMemories : DEFAULT_BUSINESS_MEMORIES });
      return;
    }

    try {
      const orgId = await resolveClientOrganizationId(userId);
      const baseQuery = supabase.from('business_memories').select('*');
      const { data, error } =
        orgId && orgId !== userId
          ? await baseQuery.or(`organization_id.eq.${orgId},user_id.eq.${userId}`)
          : await baseQuery.eq('user_id', userId);

      if (error) {
        console.error('[StarX] Fetch business memories error:', error);
        set({ businessMemories: get().businessMemories.length > 0 ? get().businessMemories : DEFAULT_BUSINESS_MEMORIES });
        return;
      }

      if (data && data.length > 0) {
        set({ businessMemories: data.map(dbRowToBusinessMemory) });
      } else {
        set({ businessMemories: get().businessMemories.length > 0 ? get().businessMemories : DEFAULT_BUSINESS_MEMORIES });
      }
    } catch (e) {
      console.error('[StarX] Fetch business memories exception:', e);
      set({ businessMemories: get().businessMemories.length > 0 ? get().businessMemories : DEFAULT_BUSINESS_MEMORIES });
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
      const orgId = await resolveClientOrganizationId(userId);
      const { data, error } = await supabase
        .from('business_memories')
        .insert({
          user_id: userId,
          ...(orgId ? { organization_id: orgId } : {}),
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
      set({ businessGoals: get().businessGoals.length > 0 ? get().businessGoals : DEFAULT_BUSINESS_GOALS });
      return;
    }

    try {
      const orgId = await resolveClientOrganizationId(userId);
      const baseQuery = supabase.from('business_goals').select('*');
      const { data, error } =
        orgId && orgId !== userId
          ? await baseQuery.or(`organization_id.eq.${orgId},user_id.eq.${userId}`)
          : await baseQuery.eq('user_id', userId);

      if (error) {
        console.error('[StarX] Fetch business goals error:', error);
        set({ businessGoals: get().businessGoals.length > 0 ? get().businessGoals : DEFAULT_BUSINESS_GOALS });
        return;
      }

      if (data && data.length > 0) {
        set({ businessGoals: data.map(dbRowToBusinessGoal) });
      } else {
        set({ businessGoals: get().businessGoals.length > 0 ? get().businessGoals : DEFAULT_BUSINESS_GOALS });
      }
    } catch (e) {
      console.error('[StarX] Fetch business goals exception:', e);
      set({ businessGoals: get().businessGoals.length > 0 ? get().businessGoals : DEFAULT_BUSINESS_GOALS });
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
      const orgId = await resolveClientOrganizationId(userId);
      const { data, error } = await supabase
        .from('business_goals')
        .insert({
          user_id: userId,
          ...(orgId ? { organization_id: orgId } : {}),
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
