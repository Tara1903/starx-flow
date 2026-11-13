/**
 * StarX-Flow Canonical Billing Plans & Entitlements Registry
 * Single authoritative source of truth for all StarX-Flow subscription plans,
 * public pricing, Polar product mappings, feature flags, and quota limits.
 */

export type PlanTier = 'free' | 'starter' | 'growth' | 'pro';

export interface PlanLimits {
  // Application / CRM quotas
  ai_conversations: number;
  contacts: number;
  team_members: number;
  calendars: number;
  workflows: number; // -1 for unlimited
  sms_messages: number;
  voice_minutes: number;

  // Ingestion & Event bus quotas
  ai_requests: number;
  ai_tokens: number;
  whatsapp_messages: number;
  email_messages: number;
  instagram_messages: number;
  messenger_messages: number;
  web_chat_messages: number;
  receptionist_jobs: number;
  knowledge_ingestion_mb: number;
  workflow_executions: number;
}

export interface CanonicalPlan {
  id: PlanTier;
  name: string;
  price: number; // Monthly price in USD dollars (integer)
  priceInCents: number; // Integer minor units for safe financial accounting
  interval: 'month';
  currency: 'USD';
  description: string;
  popular?: boolean;
  polarProductId: string;
  features: string[];
  limits: PlanLimits;
}

/**
 * Production & Sandbox Polar Product Identifiers
 * Read from environment variables with verified fallback UUIDs.
 */
export const POLAR_PRODUCT_IDS = {
  starter: process.env.POLAR_PRODUCT_STARTER || 'e5050fd1-5a76-4bd4-ab60-b5706f6dd11f',
  growth: process.env.POLAR_PRODUCT_GROWTH || process.env.POLAR_PRODUCT_PRO || '350dca5f-0c97-45b8-8a75-e1aa506a8d14',
  pro: process.env.POLAR_PRODUCT_PRO_TIER || process.env.POLAR_PRODUCT_ENTERPRISE || 'b2cf5d17-2199-4c33-a1f6-a0b7e4d608e4',
} as const;

export const CANONICAL_PLANS: Record<PlanTier, CanonicalPlan> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    priceInCents: 0,
    interval: 'month',
    currency: 'USD',
    description: '14-day evaluation with essential receptionist and booking features.',
    polarProductId: '',
    features: [
      '1 WhatsApp AI Receptionist (Trial)',
      'Up to 50 bookings/month',
      'Google Calendar Sync',
      'Basic CRM contact capture',
      'Standard email support',
    ],
    limits: {
      ai_conversations: 50,
      contacts: 100,
      team_members: 1,
      calendars: 1,
      workflows: 2,
      sms_messages: 10,
      voice_minutes: 5,
      ai_requests: 50,
      ai_tokens: 100000,
      whatsapp_messages: 20,
      email_messages: 50,
      instagram_messages: 50,
      messenger_messages: 50,
      web_chat_messages: 100,
      receptionist_jobs: 20,
      knowledge_ingestion_mb: 5,
      workflow_executions: 20,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceInCents: 2900,
    interval: 'month',
    currency: 'USD',
    description: 'Ideal for solo wellness, coaching, or beauty practitioners.',
    polarProductId: POLAR_PRODUCT_IDS.starter,
    features: [
      '1 WhatsApp AI Receptionist',
      'Up to 150 bookings/month',
      'Google Calendar & Outlook Sync',
      'Standard WhatsApp intake forms',
      'Basic CRM dashboards',
      'Email support',
    ],
    limits: {
      ai_conversations: 500,
      contacts: 1000,
      team_members: 3,
      calendars: 3,
      workflows: 10,
      sms_messages: 200,
      voice_minutes: 60,
      ai_requests: 1000,
      ai_tokens: 2000000,
      whatsapp_messages: 500,
      email_messages: 1000,
      instagram_messages: 1000,
      messenger_messages: 1000,
      web_chat_messages: 2000,
      receptionist_jobs: 500,
      knowledge_ingestion_mb: 25,
      workflow_executions: 200,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 59,
    priceInCents: 5900,
    interval: 'month',
    currency: 'USD',
    popular: true,
    description: 'Best for established gyms, clinics, and multi-staff salons/spas.',
    polarProductId: POLAR_PRODUCT_IDS.growth,
    features: [
      '3 WhatsApp AI Receptionists',
      'Unlimited bookings/month',
      'Square & Clover POS syncs',
      'Google Review Booster automation',
      'Staff calendar utilization logs',
      'Priority email support',
    ],
    limits: {
      ai_conversations: 5000,
      contacts: 5000,
      team_members: 10,
      calendars: 10,
      workflows: 50,
      sms_messages: 1000,
      voice_minutes: 120,
      ai_requests: 5000,
      ai_tokens: 10000000,
      whatsapp_messages: 2500,
      email_messages: 5000,
      instagram_messages: 5000,
      messenger_messages: 5000,
      web_chat_messages: 10000,
      receptionist_jobs: 2500,
      knowledge_ingestion_mb: 100,
      workflow_executions: 1000,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    priceInCents: 9900,
    interval: 'month',
    currency: 'USD',
    description: 'Best for local franchises and multi-location service groups.',
    polarProductId: POLAR_PRODUCT_IDS.pro,
    features: [
      'Unlimited AI Receptionists',
      'Multi-location routing rules',
      'Dedicated WhatsApp numbers',
      'Custom database CRM integrations',
      'White-label calendar widgets',
      '24/7 dedicated manager support',
    ],
    limits: {
      ai_conversations: 25000,
      contacts: 25000,
      team_members: 25,
      calendars: 25,
      workflows: -1, // Unlimited
      sms_messages: 5000,
      voice_minutes: 600,
      ai_requests: 25000,
      ai_tokens: 50000000,
      whatsapp_messages: 15000,
      email_messages: 25000,
      instagram_messages: 25000,
      messenger_messages: 25000,
      web_chat_messages: 50000,
      receptionist_jobs: 15000,
      knowledge_ingestion_mb: 500,
      workflow_executions: 10000,
    },
  },
};

/**
 * Normalizes any plan key or legacy alias into a validated PlanTier.
 * Gracefully handles legacy 'enterprise' and case differences.
 */
export function normalizePlanId(rawPlanId?: string | null): PlanTier {
  if (!rawPlanId) return 'free';
  const cleaned = rawPlanId.trim().toLowerCase();
  if (cleaned === 'starter') return 'starter';
  if (cleaned === 'growth') return 'growth';
  if (cleaned === 'pro') return 'pro';
  if (cleaned === 'enterprise') return 'pro'; // Legacy alias mapped to Pro tier ($99)
  if (cleaned === 'free' || cleaned === 'trial' || cleaned === 'trialing') return 'free';
  return 'free';
}

/**
 * Resolves a CanonicalPlan by its internal PlanTier.
 */
export function getPlanById(planId?: string | null): CanonicalPlan {
  const normalized = normalizePlanId(planId);
  return CANONICAL_PLANS[normalized];
}

/**
 * Reverse-lookup from a Polar Product ID to the canonical plan.
 */
export function getPlanByPolarProductId(productId?: string | null): CanonicalPlan | undefined {
  if (!productId) return undefined;
  for (const plan of Object.values(CANONICAL_PLANS)) {
    if (plan.polarProductId && plan.polarProductId === productId) {
      return plan;
    }
  }
  return undefined;
}

/**
 * Determines whether a given plan ID represents an active paid subscription.
 */
export function isPaidPlan(planId?: string | null): boolean {
  const normalized = normalizePlanId(planId);
  return normalized !== 'free';
}

/**
 * Formats a plan's price for display (e.g. "$29/month").
 */
export function formatPlanPrice(planId?: string | null): string {
  const plan = getPlanById(planId);
  return `$${plan.price}/month`;
}
