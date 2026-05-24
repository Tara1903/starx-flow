import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAgentStore } from './agentStore';
import { useVoiceStore } from './voiceStore';
import { useBusinessStore } from './businessStore';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  channel: 'WhatsApp' | 'SMS' | 'Reviews' | 'Instagram' | 'Web';
  aiTone: 'Friendly' | 'Professional' | 'Casual' | 'Urgent';
  customPrompt: string;
  executionsCount: number;
  successRate: number;
  savedHours: number;
  config?: any;
}

export interface Agent {
  id: string;
  name: string;
  role: 'receptionist' | 'booking' | 'review' | 'sales' | string;
  description: string;
  isActive: boolean;
  systemPrompt: string;
  permissions: string[];
}

export interface AgentMemory {
  id: string;
  leadId: string | null;
  key: string;
  value: string;
  createdAt: string;
}

export interface Call {
  id: string;
  leadId: string | null;
  customerName: string;
  customerPhone: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'ongoing' | 'failed';
  durationSeconds: number;
  recordingUrl: string;
  transcription: { role: 'agent' | 'customer' | string; text: string; timestamp: string }[];
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | string;
  callMemory: { key: string; value: string }[];
  createdAt: string;
}

export interface BusinessMemory {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'faq' | 'policy' | 'hours' | string;
}

export interface BusinessGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'bookings' | 'hours' | 'percent' | 'usd' | 'count' | string;
  targetDate: string | null;
  status: 'active' | 'achieved' | 'failed' | string;
}

export interface ConnectedChannel {
  id: string;
  channelKey: string;
  isConnected: boolean;
  credentials: Record<string, string>;
  lastSynced: string | null;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  type: 'trigger' | 'ai_process' | 'ai_reply' | 'success' | 'system';
  channel: string;
  message: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  role: string;
  onboardingComplete: boolean;
}

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  workflows: Workflow[];
  connectedChannels: ConnectedChannel[];
  logs: SimulationLog[];
  chartData: { day: string; value: number }[];
  selectedWorkflowId: string | null;


  // Auth (Magic Link & Password)
  sendMagicLink: (email: string, metadata?: {
    business_name?: string;
    owner_name?: string;
    business_type?: string;
    shield_score?: number;
  }, redirectTo?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  initSession: () => Promise<void>;

  // Workflows
  fetchWorkflows: () => Promise<void>;
  toggleWorkflow: (id: string) => Promise<void>;
  updateWorkflowPrompt: (id: string, prompt: string, tone: Workflow['aiTone']) => Promise<void>;
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'executionsCount' | 'successRate' | 'savedHours'>) => Promise<void>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;

  // Channels
  fetchChannels: () => Promise<void>;
  updateChannelConnection: (channelKey: string, isConnected: boolean, credentials?: Record<string, string>) => Promise<{ error: string | null }>;

  // Logs
  fetchLogs: () => Promise<void>;
  fetchChartData: () => Promise<void>;
  addLog: (type: SimulationLog['type'], channel: string, message: string) => void;
  clearLogs: () => void;
  triggerMockSimulation: (id: string) => Promise<void>;


}

/* ──────────────────────────────────────────────
   DB → TS CONVERTERS
   ────────────────────────────────────────────── */

function dbRowToWorkflow(row: Record<string, unknown>): Workflow {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    trigger: row.trigger as string,
    action: row.action as string,
    isActive: row.is_active as boolean,
    channel: row.channel as Workflow['channel'],
    aiTone: row.ai_tone as Workflow['aiTone'],
    customPrompt: (row.custom_prompt as string) || '',
    executionsCount: (row.executions_count as number) || 0,
    successRate: Number(row.success_rate) || 100,
    savedHours: Number(row.saved_hours) || 0,
    config: row.config || {},
  };
}

function dbRowToChannel(row: Record<string, unknown>): ConnectedChannel {
  return {
    id: row.id as string,
    channelKey: row.channel_key as string,
    isConnected: row.is_connected as boolean,
    credentials: (row.credentials as Record<string, string>) || {},
    lastSynced: row.last_synced as string | null,
  };
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

function dbRowToCall(row: Record<string, unknown>): Call {
  return {
    id: row.id as string,
    leadId: (row.lead_id as string) || null,
    customerName: (row.customer_name as string) || '',
    customerPhone: (row.customer_phone as string) || '',
    direction: (row.direction as Call['direction']) || 'inbound',
    status: (row.status as Call['status']) || 'completed',
    durationSeconds: (row.duration_seconds as number) || 0,
    recordingUrl: (row.recording_url as string) || '',
    transcription: (row.transcription as Call['transcription']) || [],
    summary: (row.summary as string) || '',
    sentiment: (row.sentiment as Call['sentiment']) || 'neutral',
    callMemory: (row.call_memory as Call['callMemory']) || [],
    createdAt: row.created_at as string,
  };
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

/* ──────────────────────────────────────────────
   MOCK SIMULATION DATA
   ────────────────────────────────────────────── */

const channelSimMessages: Record<string, { trigger: string; thinking: string; reply: string }> = {
  WhatsApp: {
    trigger: "Customer (WhatsApp): 'Hey! Can I book a hair coloring slot for tomorrow afternoon?'",
    thinking: "Analyzing custom rules... Checking calendar schedule for tomorrow afternoon... Openings found at 2:00 PM and 4:30 PM.",
    reply: "AI Receptionist: 'Hi there! We'd love to get you scheduled. We have 2:00 PM and 4:30 PM open. Which one works best for you?'",
  },
  SMS: {
    trigger: "System Event: Missed call from +1 (555) 234-5678",
    thinking: "Instantiating SMS Missed-Call Recovery engine... Formatting customized response payload...",
    reply: "SMS Dispatch: 'Hey! Sorry we missed your call. I can help you book an appointment right here. What can we get scheduled for you?'",
  },
  Reviews: {
    trigger: "Payment Gate: Invoice #1204 marked PAID ($145.00)",
    thinking: "Review cycle activated. Reading client profile... Triggering review booster payload...",
    reply: "SMS Dispatch: 'Thank you for choosing us today! Would you mind taking 30 seconds to share your review on Google? It means the world to us!'",
  },
  Instagram: {
    trigger: "Instagram DM: User commented 'GLOW' on post #9283",
    thinking: "Keyword detected ('GLOW'). Instantiating campaign voucher engine... Validating coupon rules...",
    reply: "Instagram Auto-Reply: 'Hey! Here is your exclusive 15% OFF voucher code: GLOWUP15. Use it to book any service this week!'",
  },
  Web: {
    trigger: "Website Chat: Visitor initiated conversation on pricing page",
    thinking: "Web chat agent activated. Loading business FAQ knowledge base...",
    reply: "Chat Widget: 'Welcome! I can help you with pricing and bookings. What service are you interested in?'",
  },
};



/* ──────────────────────────────────────────────
   STORE
   ────────────────────────────────────────────── */

let isInitSessionRunning = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  workflows: [],
  connectedChannels: [],
  chartData: [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ],
  logs: [
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      channel: 'System',
      message: 'Workflow Command Center initializing...',
    },
  ],
  selectedWorkflowId: null,


  /* ─── INIT SESSION (call on app mount) ─── */
  initSession: async () => {
    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    if (isInitSessionRunning) return;
    isInitSessionRunning = true;

    try {
      // Add a 15 second timeout to getSession to prevent deadlocks
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000));
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      const session = result?.data?.session;

      if (session?.user) {
        // Fetch profile with a short retry mechanism to handle race condition with DB trigger
        let profile = null;
        for (let i = 0; i < 3; i++) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data) {
            profile = data;
            break;
          }
          // wait 500ms before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (profile) {
          let onboardingComplete = false;
          try {
            const stored = localStorage.getItem('starx_onboarding_state');
            if (stored) {
              const parsed = JSON.parse(stored);
              onboardingComplete = !!parsed.isComplete;
            }
          } catch (err) {
            console.warn('[StarX Auth] Could not fetch onboarding progress from local storage:', err);
          }

          set({
            isLoggedIn: true,
            isLoading: false,
            user: {
              id: profile.id,
              name: profile.owner_name,
              email: profile.email || session.user.email || '',
              businessName: profile.business_name,
              businessType: profile.business_type,
              role: profile.role,
              onboardingComplete,
            },
          });

          // Fetch workflows, channels, and logs asynchronously without awaiting to prevent UI blocking
          get().fetchWorkflows().catch(console.error);
          get().fetchChannels().catch(console.error);
          get().fetchLogs().catch(console.error);
          get().fetchChartData().catch(console.error);
          useAgentStore.getState().fetchAgents().catch(console.error);
          useAgentStore.getState().fetchMemories().catch(console.error);
          useVoiceStore.getState().fetchCalls().catch(console.error);
          useBusinessStore.getState().fetchBusinessMemories().catch(console.error);
          useBusinessStore.getState().fetchBusinessGoals().catch(console.error);
          return;
        } else {
          // If profile fetch completely failed but we have a valid auth session,
          // don't log the user out! Provide a fallback so they stay logged in.
          console.warn('[StarX Auth] Profile fetch failed after 3 retries, but auth session is valid. Using fallback profile.');
          set({
            isLoggedIn: true,
            isLoading: false,
            user: {
              id: session.user.id,
              name: 'User',
              email: session.user.email || '',
              businessName: 'My Business',
              businessType: 'Other',
              role: 'user',
              onboardingComplete: false,
            },
          });
          return;
        }
      }
    } catch (e) {
      console.error('[StarX Auth] Session init error:', e);
    }

    // Only set logged out if we don't already have a session active
    if (!get().user) {
      set({ isLoggedIn: false, isLoading: false });
    } else {
      set({ isLoading: false });
    }

    isInitSessionRunning = false;
  },

  /* ─── MAGIC LINK ─── */
  sendMagicLink: async (email, metadata, redirectTo) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }

    try {
      const options: Record<string, unknown> = {
        emailRedirectTo: redirectTo || `${window.location.origin}/dashboard`,
      };

      if (metadata) {
        options.data = metadata;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (e) {
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── GOOGLE LOGIN ─── */
  signInWithGoogle: async (redirectTo) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (e) {
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── SIGN IN WITH PASSWORD ─── */
  signInWithPassword: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          let onboardingComplete = false;
          try {
            const stored = localStorage.getItem('starx_onboarding_state');
            if (stored) {
              const parsed = JSON.parse(stored);
              onboardingComplete = !!parsed.isComplete;
            }
          } catch (err) {
            console.warn('[StarX Auth] Could not fetch onboarding progress from local storage:', err);
          }

          set({
            isLoggedIn: true,
            user: {
              id: profile.id,
              name: profile.owner_name,
              email: profile.email || data.user.email || '',
              businessName: profile.business_name,
              businessType: profile.business_type,
              role: profile.role,
              onboardingComplete,
            },
          });
          await get().fetchWorkflows().catch(console.error);
          await get().fetchChannels().catch(console.error);
          await get().fetchLogs().catch(console.error);
          await get().fetchChartData().catch(console.error);
        }
      }

      return { error: null };
    } catch (e) {
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── LOGOUT ─── */
  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    // Clear potentially cached onboarding state to avoid cross-account contamination
    try {
      localStorage.removeItem('starx_onboarding_state');
    } catch (e) {
      // ignore
    }
    // Clear modular store states
    useAgentStore.getState().resetAgentStore();
    useVoiceStore.getState().resetVoiceStore();
    useBusinessStore.getState().resetBusinessStore();

    set({
      isLoggedIn: false,
      user: null,
      workflows: [],
      connectedChannels: [],
      logs: [],
      selectedWorkflowId: null,
    });
  },

  /* ─── FETCH WORKFLOWS ─── */
  fetchWorkflows: async () => {
    const user = get().user;
    if (!user || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[StarX] Fetch workflows error:', error);
        return;
      }

      if (data) {
        const workflows = data.map(dbRowToWorkflow);
        set({
          workflows,
          selectedWorkflowId: workflows.length > 0 ? workflows[0].id : null,
          logs: [
            {
              id: `log-loaded-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              type: 'system',
              channel: 'System',
              message: `Loaded ${workflows.length} workflow nodes. ${workflows.filter(w => w.isActive).length} active.`,
            },
          ],
        });
      }
    } catch (e) {
      console.error('[StarX] Fetch workflows exception:', e);
    }
  },

  /* ─── FETCH CHANNELS ─── */
  fetchChannels: async () => {
    const user = get().user;
    if (!user || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('connected_channels')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('[StarX] Fetch channels error:', error);
        return;
      }

      if (data) {
        set({ connectedChannels: data.map(dbRowToChannel) });
      }
    } catch (e) {
      console.error('[StarX] Fetch channels exception:', e);
    }
  },

  /* ─── UPDATE CHANNEL CONNECTION ─── */
  updateChannelConnection: async (channelKey, isConnected, credentials) => {
    const user = get().user;
    if (!user || !isSupabaseConfigured) return { error: 'Not authenticated' };

    try {
      const updateData: any = { 
        is_connected: isConnected,
        last_synced: new Date().toISOString()
      };
      
      if (credentials) {
        updateData.credentials = credentials;
      }

      // Upsert the channel record (Supabase UNIQUE constraint on user_id + channel_key handles the conflict)
      const { data, error } = await supabase
        .from('connected_channels')
        .upsert(
          {
            user_id: user.id,
            channel_key: channelKey,
            ...updateData
          },
          { onConflict: 'user_id, channel_key' }
        )
        .select()
        .single();

      if (error) {
        console.error('[StarX] Update channel error:', error);
        return { error: error.message };
      }

      if (data) {
        // Optimistically update local state
        const updatedChannel = dbRowToChannel(data);
        set((state) => {
          const exists = state.connectedChannels.find(c => c.channelKey === channelKey);
          if (exists) {
            return {
              connectedChannels: state.connectedChannels.map(c => 
                c.channelKey === channelKey ? updatedChannel : c
              )
            };
          } else {
            return {
              connectedChannels: [...state.connectedChannels, updatedChannel]
            };
          }
        });
        
        get().addLog('system', channelKey, isConnected ? `Integration connected successfully.` : `Integration disconnected.`);
      }

      return { error: null };
    } catch (e) {
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── TOGGLE WORKFLOW ─── */
  toggleWorkflow: async (id) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (!workflow) return;

    const nextState = !workflow.isActive;

    // Optimistic update
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, isActive: nextState } : w
      ),
    }));

    get().addLog('system', workflow.channel,
      nextState ? `Activated workflow "${workflow.name}"` : `Deactivated workflow "${workflow.name}"`
    );

    // Persist to DB
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: nextState })
        .eq('id', id);

      if (error) console.error('[StarX] Toggle workflow error:', error);
    }
  },

  /* ─── UPDATE WORKFLOW PROMPT ─── */
  updateWorkflowPrompt: async (id, prompt, tone) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (!workflow) return;

    // Optimistic update
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, customPrompt: prompt, aiTone: tone } : w
      ),
    }));

    get().addLog('system', workflow.channel,
      `Updated AI prompt for "${workflow.name}". Tone: ${tone}`
    );

    // Persist
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('workflows')
        .update({ custom_prompt: prompt, ai_tone: tone })
        .eq('id', id);

      if (error) console.error('[StarX] Update prompt error:', error);
    }
  },

  /* ─── ADD WORKFLOW ─── */
  addWorkflow: async (newWf) => {
    const user = get().user;
    const tempId = `wf-${Date.now()}`;

    const fresh: Workflow = {
      ...newWf,
      id: tempId,
      executionsCount: 0,
      successRate: 100,
      savedHours: 0,
    };

    // Optimistic add
    set((state) => ({
      workflows: [...state.workflows, fresh],
    }));

    get().addLog('system', fresh.channel,
      `Deployed new workflow: "${fresh.name}"`
    );

    // Persist
    if (isSupabaseConfigured && user) {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          name: fresh.name,
          description: fresh.description,
          trigger: fresh.trigger,
          action: fresh.action,
          is_active: fresh.isActive,
          channel: fresh.channel,
          ai_tone: fresh.aiTone,
          custom_prompt: fresh.customPrompt,
          config: fresh.config || {},
        })
        .select()
        .single();

      if (data) {
        // Replace temp id with real DB id
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === tempId ? dbRowToWorkflow(data) : w
          ),
        }));
      }
      if (error) console.error('[StarX] Add workflow error:', error);
    }
  },

  /* ─── UPDATE WORKFLOW ─── */
  updateWorkflow: async (id, updates) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (!workflow) return;

    // Map TS camelCase properties to DB snake_case columns
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.trigger !== undefined) dbUpdates.trigger = updates.trigger;
    if (updates.action !== undefined) dbUpdates.action = updates.action;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.channel !== undefined) dbUpdates.channel = updates.channel;
    if (updates.aiTone !== undefined) dbUpdates.ai_tone = updates.aiTone;
    if (updates.customPrompt !== undefined) dbUpdates.custom_prompt = updates.customPrompt;
    if (updates.config !== undefined) dbUpdates.config = updates.config;

    // Optimistic update
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));

    get().addLog('system', updates.channel || workflow.channel,
      `Updated workflow configuration: "${updates.name || workflow.name}"`
    );

    // Persist
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('workflows')
        .update(dbUpdates)
        .eq('id', id);

      if (error) console.error('[StarX] Update workflow error:', error);
    }
  },

  /* ─── FETCH & SUBSCRIBE TO LOGS ─── */
  fetchLogs: async () => {
    const user = get().user;
    if (!user || !isSupabaseConfigured) return;

    try {
      // 1. Fetch recent logs
      const { data, error } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[StarX] Fetch logs error:', error);
      } else if (data) {
        const dbLogs: SimulationLog[] = data.reverse().map(row => ({
          id: row.id,
          timestamp: new Date(row.created_at).toLocaleTimeString(),
          type: row.type as SimulationLog['type'],
          channel: row.channel,
          message: row.message,
        }));
        set({ logs: dbLogs });
      }

      // 2. Subscribe to new logs via Realtime
      supabase.channel('public:execution_logs')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'execution_logs', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const row = payload.new;
            const newLog: SimulationLog = {
              id: row.id,
              timestamp: new Date(row.created_at).toLocaleTimeString(),
              type: row.type as SimulationLog['type'],
              channel: row.channel,
              message: row.message,
            };
            set((state) => ({
              logs: [...state.logs.slice(-49), newLog], // Keep last 50
            }));
          }
        )
        .subscribe();

    } catch (e) {
      console.error('[StarX] Fetch logs exception:', e);
    }
  },

  /* ─── FETCH CHART DATA ─── */
  fetchChartData: async () => {
    const user = get().user;
    if (!user || !isSupabaseConfigured) return;

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('execution_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('type', 'success')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) {
        console.error('[StarX] Fetch chart data error:', error);
        return;
      }

      if (data) {
        // Initialize an array for the last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const aggregated: { day: string; value: number }[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          aggregated.push({ day: days[d.getDay()], value: 0 });
        }

        // Count occurrences per day
        data.forEach(log => {
          const logDate = new Date(log.created_at);
          const dayName = days[logDate.getDay()];
          const bin = aggregated.find(a => a.day === dayName);
          if (bin) {
            bin.value += 1;
          }
        });

        set({ chartData: aggregated });
      }
    } catch (e) {
      console.error('[StarX] Fetch chart data exception:', e);
    }
  },

  /* ─── ADD LOG (local + optional DB) ─── */
  addLog: async (type, channel, message) => {
    const user = get().user;
    
    if (isSupabaseConfigured && user) {
      // Just write to DB. The Realtime subscription in fetchLogs will pick it up and update the UI.
      const { error } = await supabase.from('execution_logs').insert({
        user_id: user.id,
        type,
        channel,
        message,
      });
      if (error) console.error('[StarX] Log insert error:', error);
    } else {
      // Fallback if no DB
      const newLog: SimulationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toLocaleTimeString(),
        type,
        channel,
        message,
      };

      set((state) => ({
        logs: [...state.logs.slice(-49), newLog],
      }));
    }
  },

  clearLogs: () => set({ logs: [] }),

  /* ─── TRIGGER SIMULATION ─── */
  triggerMockSimulation: async (id) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (!workflow || !workflow.isActive) return;

    const config = workflow.config;
    const hasConfigSteps = config && Array.isArray(config.steps) && config.steps.length > 0;

    if (hasConfigSteps) {
      const steps = config.steps;
      const triggerStep = steps.find((s: any) => s.type === 'trigger');
      const conditionSteps = steps.filter((s: any) => s.type === 'condition');
      const actionSteps = steps.filter((s: any) => s.type === 'action');

      // 1. Simulate Trigger
      let triggerText = `Simulated trigger for "${workflow.name}"`;
      if (triggerStep) {
        if (triggerStep.nodeType === 'whatsapp_message') {
          triggerText = `Customer (WhatsApp): '${triggerStep.properties?.messageSample || "Hey! Can I book a slot for tomorrow?"}'`;
        } else if (triggerStep.nodeType === 'sms_missed_call') {
          triggerText = `System Event: Missed call from ${triggerStep.properties?.phoneSample || "+1 (555) 234-5678"}`;
        } else if (triggerStep.nodeType === 'new_review') {
          triggerText = `Reviews Gate: New ${triggerStep.properties?.stars || "5"}-star review received on Google`;
        } else if (triggerStep.nodeType === 'insta_comment') {
          triggerText = `Instagram DM: User commented '${triggerStep.properties?.commentKeyword || "INFO"}' on post`;
        } else if (triggerStep.nodeType === 'web_chat') {
          triggerText = `Website Chat: Visitor initiated conversation on ${triggerStep.properties?.pageName || "pricing"} page`;
        } else {
          triggerText = `Trigger activated: ${triggerStep.properties?.label || triggerStep.nodeType}`;
        }
      }
      get().addLog('trigger', workflow.channel, triggerText);

      // Increment stats (optimistic + DB)
      set((state) => ({
        workflows: state.workflows.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              executionsCount: w.executionsCount + 1,
              savedHours: w.savedHours + 0.25,
            };
          }
          return w;
        }),
      }));

      if (isSupabaseConfigured) {
        supabase
          .from('workflows')
          .update({
            executions_count: workflow.executionsCount + 1,
            saved_hours: workflow.savedHours + 0.25,
          })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('[StarX] Stats update error:', error);
          });
      }

      await new Promise((r) => setTimeout(r, 1000));

      // 2. Simulate Conditions
      if (conditionSteps.length > 0) {
        for (const cond of conditionSteps) {
          let condText = `Evaluating: ${cond.properties?.label || cond.nodeType}`;
          if (cond.nodeType === 'keyword_match') {
            const kw = cond.properties?.keywords || 'booking';
            condText = `Condition Check: Matching keywords [${kw}] in message... Found match.`;
          } else if (cond.nodeType === 'outside_hours') {
            condText = `Condition Check: Outside business hours? Current time is outside 9 AM - 5 PM... True.`;
          } else if (cond.nodeType === 'new_customer') {
            condText = `Condition Check: Contact is new lead? No prior history... True.`;
          } else if (cond.nodeType === 'sentiment_check') {
            condText = `Condition Check: Sentiment analyzer: Negative sentiment? Detected frustration... True.`;
          }
          get().addLog('ai_process', workflow.channel, condText);
          await new Promise((r) => setTimeout(r, 800));
        }
      } else {
        get().addLog('ai_process', workflow.channel, `Running automation flow (No conditions specified)...`);
        await new Promise((r) => setTimeout(r, 800));
      }

      // 3. Simulate Actions
      if (actionSteps.length > 0) {
        for (const act of actionSteps) {
          let actText = `Firing action: ${act.properties?.label || act.nodeType}`;
          let logType: SimulationLog['type'] = 'ai_reply';
          
          if (act.nodeType === 'send_message') {
            actText = `AI Response: "${act.properties?.message || "Thanks for reaching out! We'll get back to you shortly."}"`;
            logType = 'ai_reply';
          } else if (act.nodeType === 'create_task') {
            actText = `Action Executed: Created internal task "${act.properties?.title || "Follow up on customer request"}" (Assigned: Team)`;
            logType = 'system';
          } else if (act.nodeType === 'create_appointment') {
            actText = `Action Executed: Scheduled appointment "${act.properties?.title || "Automated Booking Slot"}" in Calendar`;
            logType = 'system';
          } else if (act.nodeType === 'notify_team') {
            actText = `Action Executed: Team notification sent to "${act.properties?.channel || "General Staff"}" channel`;
            logType = 'system';
          } else if (act.nodeType === 'update_lead') {
            actText = `Action Executed: Updated CRM Lead status to "${act.properties?.status || "qualified"}"`;
            logType = 'system';
          }
          
          get().addLog(logType, workflow.channel, actText);
          await new Promise((r) => setTimeout(r, 1200));
        }
      } else {
        get().addLog('ai_reply', workflow.channel, `AI Receptionist: Active but no actions configured.`);
        await new Promise((r) => setTimeout(r, 800));
      }

      // 4. Success Log
      get().addLog('success', workflow.channel, `√ Advanced execution successful. Saved 15 minutes of manual operations.`);
    } else {
      // Legacy basic flow simulation
      const sim = channelSimMessages[workflow.channel] || {
        trigger: `Simulated trigger for "${workflow.name}"`,
        thinking: 'Computing response...',
        reply: `AI Auto-Response for ${workflow.name}`,
      };

      // 1. Trigger log
      get().addLog('trigger', workflow.channel, sim.trigger);

      // Increment stats (optimistic + DB)
      set((state) => ({
        workflows: state.workflows.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              executionsCount: w.executionsCount + 1,
              savedHours: w.savedHours + 0.25,
            };
          }
          return w;
        }),
      }));

      if (isSupabaseConfigured) {
        supabase
          .from('workflows')
          .update({
            executions_count: workflow.executionsCount + 1,
            saved_hours: workflow.savedHours + 0.25,
          })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('[StarX] Stats update error:', error);
          });
      }

      // 2. Processing log
      await new Promise((r) => setTimeout(r, 1200));
      get().addLog('ai_process', workflow.channel, sim.thinking);

      // 3. AI reply log
      await new Promise((r) => setTimeout(r, 1500));
      get().addLog('ai_reply', workflow.channel, sim.reply);

      // 4. Success log
      await new Promise((r) => setTimeout(r, 500));
      get().addLog('success', workflow.channel, '√ Execution successful. AI booking confirmed. Saved 15 minutes of manual triage.');
    }
  },
}));

/* ──────────────────────────────────────────────
   AUTH STATE LISTENER (call once in App)
   ────────────────────────────────────────────── */

export function setupAuthListener() {
  if (!isSupabaseConfigured) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Small delay to let DB trigger finish creating profile
        await new Promise((r) => setTimeout(r, 500));
        await useAuthStore.getState().initSession();
      } else if (event === 'SIGNED_OUT') {
        // Ignore automatic SIGNED_OUT events to prevent unexpected session drops.
        // Explicit logouts are handled by the logout() function clearing the state.
        console.warn('[StarX Auth] Received SIGNED_OUT event from Supabase. Ignoring to prevent automatic logout.');
      }
    }
  );

  return () => subscription.unsubscribe();
}
