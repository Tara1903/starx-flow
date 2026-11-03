export interface Profile {
  id: string;
  business_name: string;
  business_type: string;
  owner_name: string;
  email: string | null;
  phone: string | null;
  plan: string;
  status: string;
  role: string;
  onboarding_complete?: boolean;
  created_at: string;
  last_active?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: {
    currency: string;
    timezone: string;
    locale: string;
  };
  monthly_ai_messages_used?: number;
  monthly_voice_minutes_used?: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  organization_id?: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'whatsapp' | 'instagram' | 'sms' | 'web_chat' | 'manual' | 'csv_import';
  score: number;
  tags: string[];
  notes?: string | null;
  custom_fields?: Record<string, any>;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  organization_id?: string | null;
  lead_id: string | null;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  channel: 'WhatsApp' | 'Instagram' | 'SMS' | 'Web' | 'Email' | 'Messenger';
  status: 'active' | 'needs_attention' | 'resolved' | 'snoozed';
  control_mode?: 'ai' | 'human';
  handoff_reason?: string | null;
  unread_count: number;
  assigned_to?: string | null;
  metadata?: Record<string, any>;
  last_message?: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  role: 'user' | 'ai' | 'human' | 'system';
  content: string;
  attachments?: any[];
  status: 'sent' | 'delivered' | 'read' | 'failed';
  is_internal?: boolean;
  email_message_id?: string | null;
  in_reply_to?: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  organization_id?: string | null;
  lead_id?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  service_name: string;
  start_time: string;
  end_time: string;
  timezone: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  organization_id?: string | null;
  lead_id?: string | null;
  order_number: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  total_amount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  invoice_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  user_id: string;
  organization_id?: string | null;
  title: string;
  document_type: 'pdf' | 'docx' | 'url' | 'text' | 'faq';
  source_url?: string | null;
  content: string;
  chunks_count: number;
  status: 'processing' | 'indexed' | 'failed';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  chunk_content: string;
  token_count: number;
  embedding?: number[] | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  channel: 'WhatsApp' | 'Instagram' | 'SMS' | 'Email';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  target_segment: string;
  message_template: string;
  sent_count: number;
  delivered_count: number;
  response_count: number;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  lead_id: string;
  status: 'pending' | 'sent' | 'failed' | 'replied' | 'opted_out';
  error_message?: string | null;
  sent_at?: string | null;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  metric_type: string;
  quantity: number;
  recorded_at: string;
}

// ── Migration 003: Commercial Infrastructure Interfaces ───────────────────

export interface ChannelIdentity {
  id: string;
  organization_id: string;
  lead_id: string;
  channel: 'whatsapp' | 'web' | 'email' | 'instagram' | 'phone' | 'sms';
  external_user_id: string;
  profile_data?: Record<string, any>;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadScoringRule {
  id: string;
  organization_id: string;
  name: string;
  event_type: string;
  score_delta: number;
  conditions?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsDailyRollup {
  id: string;
  organization_id: string;
  date: string;
  metric_name: string;
  metric_value: number;
  dimensions?: Record<string, any>;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  organization_id: string;
  phone_number: string;
  provider: 'twilio' | 'telnyx' | 'sip';
  provider_sid?: string | null;
  friendly_name?: string | null;
  capabilities: {
    voice?: boolean;
    sms?: boolean;
  };
  assigned_agent?: string;
  status: 'active' | 'suspended' | 'released';
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  organization_id: string;
  workflow_id: string;
  trigger_event: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  context?: Record<string, any>;
  error_message?: string | null;
  started_at: string;
  completed_at?: string | null;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id?: string | null;
  actor_type: 'user' | 'system' | 'api_key' | 'cron';
  action: string;
  target_type: string;
  target_id?: string | null;
  changes?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}
