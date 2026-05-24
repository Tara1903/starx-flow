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
  created_at: string;
  last_active: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'whatsapp' | 'instagram' | 'sms' | 'manual';
  created_at: string;
  updated_at: string;
  last_contact_at: string | null;
}

export interface Conversation {
  id: string;
  user_id: string;
  lead_id: string | null;
  channel: 'whatsapp' | 'instagram' | 'sms';
  status: 'open' | 'resolved' | 'snoozed' | 'needs_attention';
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  role: 'user' | 'ai' | 'human';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

export interface IntegrationHealth {
  id: string;
  user_id: string;
  channel: string;
  status: 'healthy' | 'degraded' | 'offline';
  last_error: string | null;
  last_check_at: string;
}

export interface UsageMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface BillingSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface InternalNote {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'member' | 'read_only';
  status: 'active' | 'invited' | 'suspended';
  created_at: string;
  updated_at: string;
}
