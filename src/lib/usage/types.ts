/**
 * StarX-Flow Central Usage Metering Types
 * Canonical metrics, quotas, and event structures for billing and entitlement enforcement.
 */

export type UsageMetricType =
  | 'ai_requests'
  | 'ai_tokens'
  | 'whatsapp_messages'
  | 'email_messages'
  | 'instagram_messages'
  | 'messenger_messages'
  | 'web_chat_messages'
  | 'receptionist_jobs'
  | 'voice_minutes'
  | 'knowledge_ingestion_mb'
  | 'workflow_executions';

export interface UsageEvent {
  idempotencyKey?: string;
  userId: string;
  organizationId?: string | null;
  metricType: UsageMetricType;
  quantity: number;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface UsageRecordResult {
  success: boolean;
  recorded: boolean;
  duplicate: boolean;
  metricType: UsageMetricType;
  quantity: number;
  newMonthlyTotal: number;
  error?: string;
}

export interface PlanQuotaLimits {
  ai_requests: number; // -1 represents unlimited
  ai_tokens: number;
  whatsapp_messages: number;
  email_messages: number;
  instagram_messages: number;
  messenger_messages?: number;
  web_chat_messages?: number;
  receptionist_jobs?: number;
  voice_minutes: number;
  knowledge_ingestion_mb: number;
  workflow_executions: number;
}

export interface PlanConfig {
  id: string;
  name: string;
  priceEur: number;
  status: 'proposed' | 'active';
  limits: PlanQuotaLimits;
}

export interface EntitlementCheckResult {
  allowed: boolean;
  planId: string;
  planName: string;
  metricType: UsageMetricType;
  currentUsage: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  quotaExceeded: boolean;
  reason?: string;
}

export interface MonthlyUsageSummary {
  periodMonth: string; // YYYY-MM
  userId: string;
  organizationId?: string | null;
  metrics: Record<UsageMetricType, { currentUsage: number; limit: number; percentUsed: number }>;
}
