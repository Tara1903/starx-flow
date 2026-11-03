/**
 * StarX-Flow Central Usage Metering & Billing Entitlement Service
 * Tracks billable usage events, enforces plan quotas, and provides idempotent accounting.
 */

import {
  UsageMetricType,
  UsageEvent,
  UsageRecordResult,
  PlanConfig,
  EntitlementCheckResult,
  MonthlyUsageSummary,
} from './types';
import { supabaseAdmin } from '../supabaseAdmin';

export const CONFIGURABLE_PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    priceEur: 0,
    status: 'active',
    limits: {
      ai_requests: 50,
      ai_tokens: 100000,
      whatsapp_messages: 20,
      email_messages: 50,
      instagram_messages: 50,
      messenger_messages: 50,
      web_chat_messages: 100,
      receptionist_jobs: 20,
      voice_minutes: 5,
      knowledge_ingestion_mb: 5,
      workflow_executions: 20,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    priceEur: 49,
    status: 'proposed', // Pending explicit owner activation
    limits: {
      ai_requests: 1000,
      ai_tokens: 2000000,
      whatsapp_messages: 500,
      email_messages: 1000,
      instagram_messages: 1000,
      messenger_messages: 1000,
      web_chat_messages: 2000,
      receptionist_jobs: 500,
      voice_minutes: 0, // Voice available in Growth & Enterprise
      knowledge_ingestion_mb: 25,
      workflow_executions: 200,
    },
  },
  pro: {
    id: 'pro',
    name: 'Growth Plan',
    priceEur: 97,
    status: 'proposed',
    limits: {
      ai_requests: 5000,
      ai_tokens: 10000000,
      whatsapp_messages: 2500,
      email_messages: 5000,
      instagram_messages: 5000,
      messenger_messages: 5000,
      web_chat_messages: 10000,
      receptionist_jobs: 2500,
      voice_minutes: 120,
      knowledge_ingestion_mb: 100,
      workflow_executions: 1000,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    priceEur: 297,
    status: 'proposed',
    limits: {
      ai_requests: 25000,
      ai_tokens: 50000000,
      whatsapp_messages: 15000,
      email_messages: 25000,
      instagram_messages: 25000,
      messenger_messages: 25000,
      web_chat_messages: 50000,
      receptionist_jobs: 15000,
      voice_minutes: 600,
      knowledge_ingestion_mb: 500,
      workflow_executions: 10000,
    },
  },
};

export class UsageService {
  private static recordedKeys = new Map<string, number>();
  private static inMemoryTotals = new Map<string, number>();

  /**
   * Builds an in-memory aggregation key for rapid lookup.
   */
  private static getAggregateKey(userId: string, metric: UsageMetricType, period: string): string {
    return `${userId}:${metric}:${period}`;
  }

  /**
   * Current billing period string: YYYY-MM
   */
  static getCurrentPeriod(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  /**
   * Records a usage event with strict idempotency and dual attribution.
   */
  static async recordUsage(event: UsageEvent): Promise<UsageRecordResult> {
    const { userId, organizationId, metricType, quantity, idempotencyKey } = event;

    // 1. Idempotency Check: prevent duplicate billing on retried requests
    if (idempotencyKey) {
      if (this.recordedKeys.has(idempotencyKey)) {
        const period = this.getCurrentPeriod();
        const currentTotal = this.inMemoryTotals.get(this.getAggregateKey(userId, metricType, period)) || 0;
        return {
          success: true,
          recorded: false,
          duplicate: true,
          metricType,
          quantity,
          newMonthlyTotal: currentTotal,
        };
      }
      this.recordedKeys.set(idempotencyKey, Date.now());
      // Evict old keys if map exceeds 5000 entries
      if (this.recordedKeys.size > 5000) {
        const oldest = this.recordedKeys.keys().next().value;
        if (oldest) this.recordedKeys.delete(oldest);
      }
    }

    const period = this.getCurrentPeriod();
    const aggKey = this.getAggregateKey(userId, metricType, period);
    const prev = this.inMemoryTotals.get(aggKey) || 0;
    const newTotal = prev + quantity;
    this.inMemoryTotals.set(aggKey, newTotal);

    // 2. Persist to database (failure-safe: DB downtime will not crash customer requests)
    try {
      await supabaseAdmin.from('usage_records').insert({
        user_id: userId,
        metric_type: metricType,
        quantity,
      });

      // Update organization usage counter if organizationId is passed
      if (organizationId && (metricType === 'ai_requests' || metricType === 'voice_minutes')) {
        const col = metricType === 'ai_requests' ? 'monthly_ai_messages_used' : 'monthly_voice_minutes_used';
        // Non-blocking counter update
        Promise.resolve(
          supabaseAdmin.rpc('increment_org_usage', { org_id: organizationId, col_name: col, delta: quantity })
        ).catch(() => {});
      }
    } catch (err: any) {
      console.warn('[UsageService] Async database record warning (fallback in-memory preserved):', err.message);
    }

    return {
      success: true,
      recorded: true,
      duplicate: false,
      metricType,
      quantity,
      newMonthlyTotal: newTotal,
    };
  }

  static async recordUsageEvent(event: UsageEvent): Promise<UsageRecordResult> {
    return this.recordUsage(event);
  }

  /**
   * Resolves the active plan for a user or organization.
   */
  static async resolveUserPlan(
    userId: string,
    organizationId?: string | null,
    planOverride?: string
  ): Promise<PlanConfig> {
    if (planOverride && CONFIGURABLE_PLANS[planOverride.toLowerCase()]) {
      return CONFIGURABLE_PLANS[planOverride.toLowerCase()];
    }

    try {
      // Check organization plan first if available
      if (organizationId) {
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('plan')
          .eq('id', organizationId)
          .maybeSingle();

        if (org?.plan && CONFIGURABLE_PLANS[org.plan.toLowerCase()]) {
          return CONFIGURABLE_PLANS[org.plan.toLowerCase()];
        }
      }

      // Check user profile plan
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .maybeSingle();

      const planKey = (profile?.plan || 'pro').toLowerCase();
      return CONFIGURABLE_PLANS[planKey] || CONFIGURABLE_PLANS.pro;
    } catch {
      return CONFIGURABLE_PLANS.pro;
    }
  }

  /**
   * Checks whether the user is entitled to perform an operation according to their plan limits.
   */
  static async checkEntitlement(
    userId: string,
    metricType: UsageMetricType,
    requiredQuantity = 1,
    organizationId?: string | null,
    planOverride?: string
  ): Promise<EntitlementCheckResult> {
    const plan = await this.resolveUserPlan(userId, organizationId, planOverride);
    const limit = plan.limits[metricType] ?? -1;

    // -1 represents unlimited allowance
    if (limit === -1) {
      return {
        allowed: true,
        planId: plan.id,
        planName: plan.name,
        metricType,
        currentUsage: 0,
        limit: -1,
        remaining: Infinity,
        percentUsed: 0,
        quotaExceeded: false,
      };
    }

    const period = this.getCurrentPeriod();
    const aggKey = this.getAggregateKey(userId, metricType, period);
    const currentUsage = this.inMemoryTotals.get(aggKey) || 0;

    const remaining = Math.max(0, limit - currentUsage);
    const quotaExceeded = currentUsage + requiredQuantity > limit;
    const percentUsed = Math.min(100, Math.round((currentUsage / limit) * 100));

    return {
      allowed: !quotaExceeded,
      planId: plan.id,
      planName: plan.name,
      metricType,
      currentUsage,
      limit,
      remaining,
      percentUsed,
      quotaExceeded,
      reason: quotaExceeded
        ? `Monthly quota for ${metricType} exceeded on ${plan.name} (${currentUsage}/${limit} used). Upgrade plan to continue.`
        : undefined,
    };
  }

  /**
   * Returns a complete monthly usage breakdown across all metrics for a tenant.
   */
  static async getMonthlySummary(userId: string, organizationId?: string | null): Promise<MonthlyUsageSummary> {
    const plan = await this.resolveUserPlan(userId, organizationId);
    const period = this.getCurrentPeriod();

    const metricsList: UsageMetricType[] = [
      'ai_requests',
      'ai_tokens',
      'whatsapp_messages',
      'email_messages',
      'instagram_messages',
      'messenger_messages',
      'web_chat_messages',
      'receptionist_jobs',
      'voice_minutes',
      'knowledge_ingestion_mb',
      'workflow_executions',
    ];

    const metricsSummary: Record<UsageMetricType, { currentUsage: number; limit: number; percentUsed: number }> = {} as any;

    for (const m of metricsList) {
      const aggKey = this.getAggregateKey(userId, m, period);
      const currentUsage = this.inMemoryTotals.get(aggKey) || 0;
      const limit = plan.limits[m] ?? -1;
      const percentUsed = limit === -1 ? 0 : Math.min(100, Math.round((currentUsage / limit) * 100));

      metricsSummary[m] = {
        currentUsage,
        limit,
        percentUsed,
      };
    }

    return {
      periodMonth: period,
      userId,
      organizationId,
      metrics: metricsSummary,
    };
  }
}
