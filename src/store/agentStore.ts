import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type Agent, type AgentMemory } from './authStore';
import { resolveClientOrganizationId } from '../lib/crm/crmApi';

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

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-aria",
    name: "Aria",
    role: "receptionist",
    description: "Multi-channel front-desk receptionist managing incoming client inquiries with empathetic tone.",
    isActive: true,
    systemPrompt: "You are Aria, the primary client care concierge. Warmly greet every client, answer clinic inquiries, verify opening hours, and smoothly offer booking slots.",
    permissions: ["read_inbox", "send_message", "detect_intent", "read_schedule"],
  },
  {
    id: "agent-chronos",
    name: "Chronos",
    role: "booking",
    description: "Precision booking coordinator handling schedule queries, rescheduling, and conflict-free calendar booking.",
    isActive: true,
    systemPrompt: "You are Chronos. Detect preferred appointment dates and times, verify therapist availability against European business hours, and confirm bookings.",
    permissions: ["read_calendar", "write_calendar", "send_reminders", "manage_cancellations"],
  },
  {
    id: "agent-veritas",
    name: "Veritas",
    role: "review",
    description: "Autonomous customer sentiment sentinel and 5-star Google review harvester.",
    isActive: true,
    systemPrompt: "You are Veritas. 2 hours after a completed appointment, dispatch a personalized satisfaction inquiry. Route happy clients to Google Maps reviews.",
    permissions: ["read_reviews", "send_followups", "flag_negative_sentiment"],
  },
  {
    id: "agent-nexus",
    name: "Nexus",
    role: "sales",
    description: "High-value corporate wellness intake and bespoke quotation architect.",
    isActive: true,
    systemPrompt: "You are Nexus. Qualify enterprise inquiries, extract team headcount and timeline, and generate tailored retainer estimates.",
    permissions: ["qualify_leads", "update_crm", "escalate_to_human", "generate_quotes"],
  },
];

export const DEFAULT_AGENT_MEMORIES: AgentMemory[] = [
  {
    id: "mem-1",
    leadId: "lead-1",
    key: "preferred_therapist",
    value: "Dr. Sarah Jenkins",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "mem-2",
    leadId: "lead-1",
    key: "clinical_focus",
    value: "Right knee post-ACL reconstruction rehabilitation",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "mem-3",
    leadId: "lead-2",
    key: "communication_preference",
    value: "WhatsApp only (between 09:00 - 18:00 CET)",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: DEFAULT_AGENTS,
  agentMemories: DEFAULT_AGENT_MEMORIES,

  fetchAgents: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ agents: get().agents.length > 0 ? get().agents : DEFAULT_AGENTS });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('[StarX] Fetch agents error:', error);
        set({ agents: get().agents.length > 0 ? get().agents : DEFAULT_AGENTS });
        return;
      }

      if (data && data.length > 0) {
        set({ agents: data.map(dbRowToAgent) });
      } else {
        set({ agents: get().agents.length > 0 ? get().agents : DEFAULT_AGENTS });
      }
    } catch (e) {
      console.error('[StarX] Fetch agents exception:', e);
      set({ agents: get().agents.length > 0 ? get().agents : DEFAULT_AGENTS });
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
      const orgId = await resolveClientOrganizationId(userId);
      let query = supabase.from('agent_memories').select('*');
      if (orgId && orgId !== userId) {
        query = query.or(`organization_id.eq.${orgId},user_id.eq.${userId}`);
      } else {
        query = query.eq('user_id', userId);
      }
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
      const orgId = await resolveClientOrganizationId(userId);
      const { data, error } = await supabase
        .from('agent_memories')
        .upsert(
          {
            user_id: userId,
            ...(orgId ? { organization_id: orgId } : {}),
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
      const orgId = await resolveClientOrganizationId(userId);
      let query = supabase.from('agent_memories').delete();
      if (orgId && orgId !== userId) {
        query = query.or(`organization_id.eq.${orgId},user_id.eq.${userId}`);
      } else {
        query = query.eq('user_id', userId);
      }
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
