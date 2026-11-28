import type { Appointment, ChannelIdentity, Conversation, Lead, Order, Task } from './database';
import type { DuplicateMatch } from '@/lib/crm/identityResolver';

export type CrmPipelineType = 'sales' | 'service' | 'dual';
export type CrmDealStatus = 'open' | 'won' | 'lost';
export type CrmActivityType =
  | 'note'
  | 'stage_change'
  | 'call'
  | 'email'
  | 'whatsapp'
  | 'instagram'
  | 'booking'
  | 'order'
  | 'task'
  | 'enrichment'
  | 'sequence';

export type CrmSequenceChannel = 'whatsapp' | 'email' | 'instagram' | 'multi';
export type CrmSequenceTriggerType = 'manual' | 'new_lead' | 'stage_qualified' | 'finder_import';
export type CrmSequenceEnrollmentStatus = 'active' | 'paused' | 'completed' | 'stopped' | 'replied';

export interface CrmPipeline {
  id: string;
  organization_id: string;
  name: string;
  pipeline_type: CrmPipelineType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  stages?: CrmStage[];
}

export interface CrmStage {
  id: string;
  pipeline_id: string;
  organization_id: string;
  name: string;
  slug: string;
  position: number;
  probability: number;
  color_token: string;
  is_won: boolean;
  is_lost: boolean;
  created_at: string;
}

export interface CrmDeal {
  id: string;
  organization_id: string;
  user_id: string;
  pipeline_id: string;
  stage_id: string;
  lead_id: string;
  owner_id: string | null;
  title: string;
  value: number;
  currency: string;
  probability: number;
  expected_close_at: string | null;
  status: CrmDealStatus;
  lost_reason: string | null;
  idempotency_key?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  lead?: Partial<Lead> | null;
}

export interface CrmActivity {
  id: string;
  organization_id: string;
  lead_id: string;
  deal_id: string | null;
  actor_id: string | null;
  activity_type: CrmActivityType;
  title: string;
  body: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CrmSequenceStep {
  dayOffset: number;
  channel: 'whatsapp' | 'email' | 'instagram';
  subject?: string;
  messageTemplate: string;
}

export interface CrmSequence {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  trigger_type: CrmSequenceTriggerType;
  channel: CrmSequenceChannel;
  is_active: boolean;
  steps: CrmSequenceStep[];
  created_at: string;
  updated_at: string;
  activeEnrollmentsCount?: number;
}

export interface CrmSequenceEnrollment {
  id: string;
  organization_id: string;
  sequence_id: string;
  lead_id: string;
  current_step: number;
  status: CrmSequenceEnrollmentStatus;
  next_run_at: string | null;
  idempotency_key?: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  sequence?: Pick<CrmSequence, 'id' | 'name' | 'channel' | 'steps'>;
  lead?: Pick<Lead, 'id' | 'name' | 'email' | 'phone' | 'company_name'>;
}

export interface CrmTeamMember {
  userId: string;
  name: string;
  email: string | null;
  role: string;
}

export interface LeadWorkspace360 {
  lead: Lead;
  deals: CrmDeal[];
  activities: CrmActivity[];
  conversations: Conversation[];
  appointments: Appointment[];
  orders: Order[];
  tasks: (Task & { lead_id?: string | null; deal_id?: string | null })[];
  enrollments: CrmSequenceEnrollment[];
  identities: ChannelIdentity[];
  duplicates: DuplicateMatch[];
  teamMembers: CrmTeamMember[];
  pipelines: CrmPipeline[];
}

export interface LeadFinderCandidate {
  externalId: string;
  name: string;
  industry: string;
  city: string;
  country: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  aiSummary: string | null;
  fitScore: number;
  enrichmentStatus: 'raw' | 'enriched' | 'failed';
  lat: number | null;
  lon: number | null;
  alreadyInCrm: boolean;
}

export interface CrmAnalyticsSummary {
  totalLeads: number;
  openDealsCount: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  wonRevenue: number;
  wonDealsCount: number;
  lostDealsCount: number;
  winRatePercent: number;
  averageLeadScore: number;
  stageBreakdown: Array<{
    stageId: string;
    stageName: string;
    slug: string;
    count: number;
    value: number;
    weightedValue: number;
    probability: number;
  }>;
  sourceBreakdown: Array<{
    source: string;
    count: number;
    totalValue: number;
    convertedCount: number;
  }>;
  ownerBreakdown: Array<{
    ownerId: string | null;
    ownerName: string;
    dealsCount: number;
    pipelineValue: number;
    wonRevenue: number;
  }>;
}
