import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type Agent, type AgentMemory } from './authStore';

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-receptionist',
    name: 'Receptionist Agent',
    role: 'receptionist',
    description: 'Greets customers, handles general FAQs, and delegates tasks.',
    isActive: true,
    systemPrompt: 'You are the primary receptionist. Greet customers warmly. Answer general queries about the business, services, and location.',
    permissions: ['read_crm', 'send_messages']
  },
  {
    id: 'agent-booking',
    name: 'Booking Agent',
    role: 'booking',
    description: 'Checks appointment slots, handles bookings, and calendars.',
    isActive: true,
    systemPrompt: 'You are the booking coordinator. Assist with scheduling appointments. Check availability and confirm slots.',
    permissions: ['read_crm', 'write_calendar', 'send_messages']
  },
  {
    id: 'agent-review',
    name: 'Review Agent',
    role: 'review',
    description: 'Monitors public feedback, responds to reviews, and manages ratings.',
    isActive: true,
    systemPrompt: 'You are the reputation manager. Answer reviews left by clients. Respond politely and offer help for issues.',
    permissions: ['read_crm', 'send_messages']
  },
  {
    id: 'agent-sales',
    name: 'Sales Agent',
    role: 'sales',
    description: 'Answers product pricing questions, follows up on leads, and drives conversions.',
    isActive: true,
    systemPrompt: 'You are the sales development representative. Handle pricing queries and pitches. Offer discounts to close deals.',
    permissions: ['read_crm', 'write_tasks', 'send_messages']
  }
];

const MOCK_MEMORIES: AgentMemory[] = [
  {
    id: 'mem-1',
    leadId: 'lead-1',
    key: 'preferred_hairdresser',
    value: 'Sarah',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mem-2',
    leadId: 'lead-1',
    key: 'customer_sentiment',
    value: 'Positive (Praise)',
    createdAt: new Date().toISOString()
  }
];

interface AgentState {
  agents: Agent[];
  agentMemories: AgentMemory[];
  fetchAgents: () => Promise<void>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  fetchMemories: (leadId?: string) => Promise<void>;
  addMemory: (memory: Omit<AgentMemory, 'id' | 'createdAt'>) => Promise<void>;
  clearMemories: (leadId?: string) => Promise<void>;
  resetAgentStore: () => void;
}

function dbRowToAgent(row: Record<string, unknown>): Agent {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as Agent['role'],
    description: (row.description as string) || '',
    isActive: row.is_active as boolean,
    systemPrompt: row.system_prompt as string,
    permissions: (row.permissions as string[]) || [],
  };
}

function dbRowToMemory(row: Record<string, unknown>): AgentMemory {
  return {
    id: row.id as string,
    leadId: (row.lead_id as string) || null,
    key: row.key as string,
    value: row.value as string,
    createdAt: row.created_at as string,
  };
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  agentMemories: [],

  fetchAgents: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ agents: MOCK_AGENTS });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('[StarX] Fetch agents error:', error);
        return;
      }

      if (data && data.length > 0) {
        set({ agents: data.map(dbRowToAgent) });
      } else {
        set({ agents: MOCK_AGENTS });
      }
    } catch (e) {
      console.error('[StarX] Fetch agents exception:', e);
      set({ agents: MOCK_AGENTS });
    }
  },

  updateAgent: async (id, updates) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.systemPrompt !== undefined) dbUpdates.system_prompt = updates.systemPrompt;
    if (updates.permissions !== undefined) dbUpdates.permissions = updates.permissions;

    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('agents')
        .update(dbUpdates)
        .eq('id', id);

      if (error) console.error('[StarX] Update agent error:', error);
    }
  },

  fetchMemories: async (leadId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ agentMemories: MOCK_MEMORIES });
      return;
    }

    try {
      let query = supabase.from('agent_memories').select('*').eq('user_id', userId);
      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[StarX] Fetch memories error:', error);
        return;
      }

      if (data) {
        set({ agentMemories: data.map(dbRowToMemory) });
      }
    } catch (e) {
      console.error('[StarX] Fetch memories exception:', e);
      set({ agentMemories: MOCK_MEMORIES });
    }
  },

  addMemory: async (memory) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    const tempId = `mem-${Date.now()}`;

    const fresh: AgentMemory = {
      ...memory,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      agentMemories: [fresh, ...state.agentMemories],
    }));

    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('agent_memories')
        .upsert(
          {
            user_id: userId,
            lead_id: memory.leadId,
            key: memory.key,
            value: memory.value,
          },
          { onConflict: 'user_id, lead_id, key' }
        )
        .select()
        .single();

      if (data) {
        set((state) => ({
          agentMemories: state.agentMemories.map((m) =>
            m.id === tempId ? dbRowToMemory(data) : m
          ),
        }));
      }
      if (error) console.error('[StarX] Add memory error:', error);
    }
  },

  clearMemories: async (leadId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    set((state) => ({
      agentMemories: leadId 
        ? state.agentMemories.filter((m) => m.leadId !== leadId)
        : [],
    }));

    if (isSupabaseConfigured && userId) {
      let query = supabase.from('agent_memories').delete().eq('user_id', userId);
      if (leadId) {
        query = query.eq('lead_id', leadId);
      }
      const { error } = await query;
      if (error) console.error('[StarX] Clear memories error:', error);
    }
  },

  resetAgentStore: () => {
    set({
      agents: [],
      agentMemories: [],
    });
  }
}));
