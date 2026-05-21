import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
}

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  workflows: Workflow[];
  logs: SimulationLog[];
  selectedWorkflowId: string | null;

  // Auth (Magic Link & Password)
  sendMagicLink: (email: string, metadata?: {
    business_name: string;
    owner_name: string;
    business_type: string;
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

  // Logs
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

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  workflows: [],
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

    try {
      // Add a 5 second timeout to getSession to prevent deadlocks
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      const session = result?.data?.session;

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
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
            },
          });

          // Fetch workflows asynchronously without awaiting to prevent UI blocking
          get().fetchWorkflows().catch(console.error);
          return;
        }
      }
    } catch (e) {
      console.error('[StarX Auth] Session init error:', e);
    }

    set({ isLoggedIn: false, isLoading: false });
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
          set({
            isLoggedIn: true,
            user: {
              id: profile.id,
              name: profile.owner_name,
              email: profile.email || data.user.email || '',
              businessName: profile.business_name,
              businessType: profile.business_type,
              role: profile.role,
            },
          });
          await get().fetchWorkflows().catch(console.error);
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
    set({
      isLoggedIn: false,
      user: null,
      workflows: [],
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

  /* ─── ADD LOG (local + optional DB) ─── */
  addLog: (type, channel, message) => {
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

    // Fire-and-forget DB write
    const user = get().user;
    if (isSupabaseConfigured && user) {
      supabase.from('execution_logs').insert({
        user_id: user.id,
        type,
        channel,
        message,
      }).then(({ error }) => {
        if (error) console.error('[StarX] Log insert error:', error);
      });
    }
  },

  clearLogs: () => set({ logs: [] }),

  /* ─── TRIGGER SIMULATION ─── */
  triggerMockSimulation: async (id) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (!workflow || !workflow.isActive) return;

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
        useAuthStore.setState({
          isLoggedIn: false,
          user: null,
          workflows: [],
          logs: [],
        });
      }
    }
  );

  return () => subscription.unsubscribe();
}
