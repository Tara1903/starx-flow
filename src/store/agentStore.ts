import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type Agent, type AgentMemory } from './authStore';

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
      set({ agents: [] });
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
        set({ agents: [] });
      }
    } catch (e) {
      console.error('[StarX] Fetch agents exception:', e);
      set({ agents: [] });
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
      set({ agentMemories: [] });
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
      set({ agentMemories: [] });
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
