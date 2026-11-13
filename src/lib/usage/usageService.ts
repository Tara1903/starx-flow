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
import { CANONICAL_PLANS, normalizePlanId } from '../plans';

export const CONFIGURABLE_PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: CANONICAL_PLANS.free.name,
    priceEur: CANONICAL_PLANS.free.price,
    status: 'active',
    limits: {
      ai_requests: CANONICAL_PLANS.free.limits.ai_requests,
      ai_tokens: CANONICAL_PLANS.free.limits.ai_tokens,
      whatsapp_messages: CANONICAL_PLANS.free.limits.whatsapp_messages,
      email_messages: CANONICAL_PLANS.free.limits.email_messages,
      instagram_messages: CANONICAL_PLANS.free.limits.instagram_messages,
      messenger_messages: CANONICAL_PLANS.free.limits.messenger_messages,
      web_chat_messages: CANONICAL_PLANS.free.limits.web_chat_messages,
      receptionist_jobs: CANONICAL_PLANS.free.limits.receptionist_jobs,
      voice_minutes: CANONICAL_PLANS.free.limits.voice_minutes,
      knowledge_ingestion_mb: CANONICAL_PLANS.free.limits.knowledge_ingestion_mb,
      workflow_executions: CANONICAL_PLANS.free.limits.workflow_executions,
    },
  },
  starter: {
    id: 'starter',
    name: CANONICAL_PLANS.starter.name,
    priceEur: CANONICAL_PLANS.starter.price,
    status: 'active',
    limits: {
      ai_requests: CANONICAL_PLANS.starter.limits.ai_requests,
      ai_tokens: CANONICAL_PLANS.starter.limits.ai_tokens,
      whatsapp_messages: CANONICAL_PLANS.starter.limits.whatsapp_messages,
      email_messages: CANONICAL_PLANS.starter.limits.email_messages,
      instagram_messages: CANONICAL_PLANS.starter.limits.instagram_messages,
      messenger_messages: CANONICAL_PLANS.starter.limits.messenger_messages,
      web_chat_messages: CANONICAL_PLANS.starter.limits.web_chat_messages,
      receptionist_jobs: CANONICAL_PLANS.starter.limits.receptionist_jobs,
      voice_minutes: CANONICAL_PLANS.starter.limits.voice_minutes,
      knowledge_ingestion_mb: CANONICAL_PLANS.starter.limits.knowledge_ingestion_mb,
      workflow_executions: CANONICAL_PLANS.starter.limits.workflow_executions,
    },
  },
  growth: {
    id: 'growth',
    name: CANONICAL_PLANS.growth.name,
    priceEur: CANONICAL_PLANS.growth.price,
    status: 'active',
    limits: {
      ai_requests: CANONICAL_PLANS.growth.limits.ai_requests,
      ai_tokens: CANONICAL_PLANS.growth.limits.ai_tokens,
      whatsapp_messages: CANONICAL_PLANS.growth.limits.whatsapp_messages,
      email_messages: CANONICAL_PLANS.growth.limits.email_messages,
      instagram_messages: CANONICAL_PLANS.growth.limits.instagram_messages,
      messenger_messages: CANONICAL_PLANS.growth.limits.messenger_messages,
      web_chat_messages: CANONICAL_PLANS.growth.limits.web_chat_messages,
      receptionist_jobs: CANONICAL_PLANS.growth.limits.receptionist_jobs,
      voice_minutes: CANONICAL_PLANS.growth.limits.voice_minutes,
      knowledge_ingestion_mb: CANONICAL_PLANS.growth.limits.knowledge_ingestion_mb,
      workflow_executions: CANONICAL_PLANS.growth.limits.workflow_executions,
    },
  },
  pro: {
    id: 'pro',
    name: CANONICAL_PLANS.pro.name,
    priceEur: CANONICAL_PLANS.pro.price,
    status: 'active',
    limits: {
      ai_requests: CANONICAL_PLANS.pro.limits.ai_requests,
      ai_tokens: CANONICAL_PLANS.pro.limits.ai_tokens,
      whatsapp_messages: CANONICAL_PLANS.pro.limits.whatsapp_messages,
      email_messages: CANONICAL_PLANS.pro.limits.email_messages,
      instagram_messages: CANONICAL_PLANS.pro.limits.instagram_messages,
      messenger_messages: CANONICAL_PLANS.pro.limits.messenger_messages,
      web_chat_messages: CANONICAL_PLANS.pro.limits.web_chat_messages,
      receptionist_jobs: CANONICAL_PLANS.pro.limits.receptionist_jobs,
      voice_minutes: CANONICAL_PLANS.pro.limits.voice_minutes,
      knowledge_ingestion_mb: CANONICAL_PLANS.pro.limits.knowledge_ingestion_mb,
      workflow_executions: CANONICAL_PLANS.pro.limits.workflow_executions,
    },
  },
  enterprise: {
    id: 'pro',
    name: CANONICAL_PLANS.pro.name,
    priceEur: CANONICAL_PLANS.pro.price,
    status: 'active',
    limits: {
      ai_requests: CANONICAL_PLANS.pro.limits.ai_requests,
      ai_tokens: CANONICAL_PLANS.pro.limits.ai_tokens,
      whatsapp_messages: CANONICAL_PLANS.pro.limits.whatsapp_messages,
      email_messages: CANONICAL_PLANS.pro.limits.email_messages,
      instagram_messages: CANONICAL_PLANS.pro.limits.instagram_messages,
      messenger_messages: CANONICAL_PLANS.pro.limits.messenger_messages,
      web_chat_messages: CANONICAL_PLANS.pro.limits.web_chat_messages,
      receptionist_jobs: CANONICAL_PLANS.pro.limits.receptionist_jobs,
      voice_minutes: CANONICAL_PLANS.pro.limits.voice_minutes,
      knowledge_ingestion_mb: CANONICAL_PLANS.pro.limits.knowledge_ingestion_mb,
      workflow_executions: CANONICAL_PLANS.pro.limits.workflow_executions,
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
