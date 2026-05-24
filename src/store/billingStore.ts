import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/* ──────────────────────────────────────────────
   PLAN DEFINITIONS
   ────────────────────────────────────────────── */

export interface PlanLimits {
  ai_conversations: number;
  contacts: number;
  team_members: number;
  calendars: number;
  workflows: number;
  sms_messages: number;
  voice_minutes: number;
}

export interface PlanDefinition {
  name: string;
  price: number;
  limits: PlanLimits;
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      ai_conversations: 50,
      contacts: 100,
      team_members: 1,
      calendars: 1,
      workflows: 2,
      sms_messages: 10,
      voice_minutes: 5,
    },
  },
  starter: {
    name: 'Starter',
    price: 47,
    limits: {
      ai_conversations: 500,
      contacts: 1000,
      team_members: 3,
      calendars: 3,
      workflows: 10,
      sms_messages: 200,
      voice_minutes: 60,
    },
  },
  pro: {
    name: 'Pro',
    price: 97,
    limits: {
      ai_conversations: 5000,
      contacts: 10000,
      team_members: 10,
      calendars: 10,
      workflows: 50,
      sms_messages: 1000,
      voice_minutes: 300,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 297,
    limits: {
      ai_conversations: -1,   // unlimited
      contacts: -1,
      team_members: -1,
      calendars: -1,
      workflows: -1,
      sms_messages: 5000,
      voice_minutes: 1000,
    },
  },
} as const;

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'paused';
  billingCycle: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string | null;
  stripeInvoiceId: string | null;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  hostedInvoiceUrl: string | null;
  createdAt: string;
}

export interface UsageSummary {
  ai_conversations: number;
  contacts: number;
  team_members: number;
  calendars: number;
  workflows: number;
  sms_messages: number;
  voice_minutes: number;
}

interface BillingState {
  subscription: Subscription | null;
  invoices: Invoice[];
  usageSummary: UsageSummary;
  isLoading: boolean;

  fetchSubscription: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  startTrial: (planId: string) => Promise<{ error: string | null }>;
  upgradePlan: (planId: string) => Promise<{ error: string | null }>;
  downgradePlan: (planId: string) => Promise<{ error: string | null }>;
  cancelSubscription: (reason?: string) => Promise<{ error: string | null }>;
  resumeSubscription: () => Promise<{ error: string | null }>;
  resetBillingStore: () => void;
}

/* ──────────────────────────────────────────────
   DB → TS CONVERTERS
   ────────────────────────────────────────────── */

function dbRowToSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    stripeCustomerId: (row.stripe_customer_id as string) || null,
    stripeSubscriptionId: (row.stripe_subscription_id as string) || null,
    planId: (row.plan_id as string) || 'free',
    status: (row.status as Subscription['status']) || 'trialing',
    billingCycle: (row.billing_cycle as string) || 'monthly',
    currentPeriodStart: (row.current_period_start as string) || null,
    currentPeriodEnd: (row.current_period_end as string) || null,
    trialEnd: (row.trial_end as string) || null,
    cancelAt: (row.cancel_at as string) || null,
    cancelledAt: (row.cancelled_at as string) || null,
    cancellationReason: (row.cancellation_reason as string) || null,
    amount: Number(row.amount) || 0,
    currency: (row.currency as string) || 'usd',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function dbRowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    subscriptionId: (row.subscription_id as string) || null,
    stripeInvoiceId: (row.stripe_invoice_id as string) || null,
    amount: Number(row.amount) || 0,
    currency: (row.currency as string) || 'usd',
    status: (row.status as Invoice['status']) || 'draft',
    periodStart: (row.period_start as string) || null,
    periodEnd: (row.period_end as string) || null,
    paidAt: (row.paid_at as string) || null,
    hostedInvoiceUrl: (row.hosted_invoice_url as string) || null,
    createdAt: row.created_at as string,
  };
}

/* ──────────────────────────────────────────────
   DEFAULT STATE
   ────────────────────────────────────────────── */

const DEFAULT_USAGE: UsageSummary = {
  ai_conversations: 0,
  contacts: 0,
  team_members: 0,
  calendars: 0,
  workflows: 0,
  sms_messages: 0,
  voice_minutes: 0,
};

/* ──────────────────────────────────────────────
   STORE
   ────────────────────────────────────────────── */

export const useBillingStore = create<BillingState>((set, get) => ({
  subscription: null,
  invoices: [],
  usageSummary: { ...DEFAULT_USAGE },
  isLoading: false,

  /* ─── FETCH SUBSCRIPTION ─── */
  fetchSubscription: async () => {
    if (!isSupabaseConfigured) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['trialing', 'active', 'past_due', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[StarX Billing] Fetch subscription error:', error);
        set({ isLoading: false });
        return;
      }

      set({
        subscription: data ? dbRowToSubscription(data) : null,
        isLoading: false,
      });
    } catch (e) {
      console.error('[StarX Billing] Fetch subscription exception:', e);
      set({ isLoading: false });
    }
  },

  /* ─── FETCH INVOICES ─── */
  fetchInvoices: async () => {
    if (!isSupabaseConfigured) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[StarX Billing] Fetch invoices error:', error);
        return;
      }

      if (data) {
        set({ invoices: data.map(dbRowToInvoice) });
      }
    } catch (e) {
      console.error('[StarX Billing] Fetch invoices exception:', e);
    }
  },

  /* ─── FETCH USAGE ─── */
  fetchUsage: async () => {
    if (!isSupabaseConfigured) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      // Get usage records for the current billing period
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('usage_records')
        .select('resource_type, quantity')
        .eq('user_id', userId)
        .lte('period_start', now)
        .gte('period_end', now);

      if (error) {
        console.error('[StarX Billing] Fetch usage error:', error);
        return;
      }

      if (data) {
        const summary: UsageSummary = { ...DEFAULT_USAGE };
        for (const row of data) {
          const key = row.resource_type as keyof UsageSummary;
          if (key in summary) {
            summary[key] += row.quantity || 0;
          }
        }
        set({ usageSummary: summary });
      }
    } catch (e) {
      console.error('[StarX Billing] Fetch usage exception:', e);
    }
  },

  /* ─── START TRIAL ─── */
  startTrial: async (planId: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase is not configured.' };
    if (!PLANS[planId]) return { error: `Invalid plan: ${planId}` };

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return { error: 'Not authenticated.' };

    const plan = PLANS[planId];
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day trial
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day period

    // Optimistic update
    const optimisticSub: Subscription = {
      id: `sub-temp-${Date.now()}`,
      userId,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      planId,
      status: 'trialing',
      billingCycle: 'monthly',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      trialEnd: trialEnd.toISOString(),
      cancelAt: null,
      cancelledAt: null,
      cancellationReason: null,
      amount: plan.price,
      currency: 'usd',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    set({ subscription: optimisticSub });

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'trialing',
          billing_cycle: 'monthly',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          trial_end: trialEnd.toISOString(),
          amount: plan.price,
          currency: 'usd',
        })
        .select()
        .single();

      if (error) {
        console.error('[StarX Billing] Start trial error:', error);
        set({ subscription: null });
        return { error: error.message };
      }

      if (data) {
        set({ subscription: dbRowToSubscription(data) });
      }

      return { error: null };
    } catch (e) {
      console.error('[StarX Billing] Start trial exception:', e);
      set({ subscription: null });
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── UPGRADE PLAN ─── */
  upgradePlan: async (planId: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase is not configured.' };
    if (!PLANS[planId]) return { error: `Invalid plan: ${planId}` };

    const currentSub = get().subscription;
    if (!currentSub) return { error: 'No active subscription to upgrade.' };

    const plan = PLANS[planId];

    // Optimistic update
    const previousSub = { ...currentSub };
    set({
      subscription: {
        ...currentSub,
        planId,
        amount: plan.price,
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          amount: plan.price,
        })
        .eq('id', currentSub.id)
        .select()
        .single();

      if (error) {
        console.error('[StarX Billing] Upgrade plan error:', error);
        set({ subscription: previousSub }); // rollback
        return { error: error.message };
      }

      if (data) {
        set({ subscription: dbRowToSubscription(data) });
      }

      return { error: null };
    } catch (e) {
      console.error('[StarX Billing] Upgrade plan exception:', e);
      set({ subscription: previousSub });
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── DOWNGRADE PLAN ─── */
  downgradePlan: async (planId: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase is not configured.' };
    if (!PLANS[planId]) return { error: `Invalid plan: ${planId}` };

    const currentSub = get().subscription;
    if (!currentSub) return { error: 'No active subscription to downgrade.' };

    const plan = PLANS[planId];

    // Optimistic update
    const previousSub = { ...currentSub };
    set({
      subscription: {
        ...currentSub,
        planId,
        amount: plan.price,
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      // Downgrade takes effect at end of current period
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          amount: plan.price,
        })
        .eq('id', currentSub.id)
        .select()
        .single();

      if (error) {
        console.error('[StarX Billing] Downgrade plan error:', error);
        set({ subscription: previousSub }); // rollback
        return { error: error.message };
      }

      if (data) {
        set({ subscription: dbRowToSubscription(data) });
      }

      return { error: null };
    } catch (e) {
      console.error('[StarX Billing] Downgrade plan exception:', e);
      set({ subscription: previousSub });
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── CANCEL SUBSCRIPTION ─── */
  cancelSubscription: async (reason?: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase is not configured.' };

    const currentSub = get().subscription;
    if (!currentSub) return { error: 'No active subscription to cancel.' };

    const now = new Date().toISOString();

    // Optimistic update
    const previousSub = { ...currentSub };
    set({
      subscription: {
        ...currentSub,
        status: 'cancelled',
        cancelledAt: now,
        cancelAt: currentSub.currentPeriodEnd, // cancel at end of period
        cancellationReason: reason || null,
        updatedAt: now,
      },
    });

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: now,
          cancel_at: currentSub.currentPeriodEnd,
          cancellation_reason: reason || null,
        })
        .eq('id', currentSub.id)
        .select()
        .single();

      if (error) {
        console.error('[StarX Billing] Cancel subscription error:', error);
        set({ subscription: previousSub }); // rollback
        return { error: error.message };
      }

      if (data) {
        set({ subscription: dbRowToSubscription(data) });
      }

      return { error: null };
    } catch (e) {
      console.error('[StarX Billing] Cancel subscription exception:', e);
      set({ subscription: previousSub });
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── RESUME SUBSCRIPTION ─── */
  resumeSubscription: async () => {
    if (!isSupabaseConfigured) return { error: 'Supabase is not configured.' };

    const currentSub = get().subscription;
    if (!currentSub) return { error: 'No subscription to resume.' };
    if (currentSub.status !== 'cancelled' && currentSub.status !== 'paused') {
      return { error: 'Subscription is not in a resumable state.' };
    }

    // Optimistic update
    const previousSub = { ...currentSub };
    set({
      subscription: {
        ...currentSub,
        status: 'active',
        cancelAt: null,
        cancelledAt: null,
        cancellationReason: null,
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          cancel_at: null,
          cancelled_at: null,
          cancellation_reason: null,
        })
        .eq('id', currentSub.id)
        .select()
        .single();

      if (error) {
        console.error('[StarX Billing] Resume subscription error:', error);
        set({ subscription: previousSub }); // rollback
        return { error: error.message };
      }

      if (data) {
        set({ subscription: dbRowToSubscription(data) });
      }

      return { error: null };
    } catch (e) {
      console.error('[StarX Billing] Resume subscription exception:', e);
      set({ subscription: previousSub });
      return { error: 'Network error. Please try again.' };
    }
  },

  /* ─── RESET ─── */
  resetBillingStore: () => {
    set({
      subscription: null,
      invoices: [],
      usageSummary: { ...DEFAULT_USAGE },
      isLoading: false,
    });
  },
}));
