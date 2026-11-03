-- =========================================================================
-- StarX-Flow Production Migration: 003_commercial_capabilities.sql
-- Description: Channel Identities, Lead Scoring Rules, Analytics Daily Rollups,
--              Virtual Phone Numbers, Workflow Executions, Audit Logs, and
--              usage counters with strict Row Level Security (RLS).
-- =========================================================================

-- Enable uuid extension if needed
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Channel Identities (Cross-Channel Customer Resolution)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists channel_identities (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete cascade not null,
  channel text not null check (channel in ('whatsapp', 'web', 'email', 'instagram', 'phone', 'sms')),
  external_user_id text not null,
  profile_data jsonb default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, channel, external_user_id)
);

alter table channel_identities enable row level security;

create policy "Users can view channel identities of their organizations"
  on channel_identities for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = channel_identities.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Users can insert channel identities for their organizations"
  on channel_identities for insert
  to authenticated
  with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = channel_identities.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Users can update channel identities for their organizations"
  on channel_identities for update
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = channel_identities.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Users can delete channel identities of their organizations"
  on channel_identities for delete
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = channel_identities.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create index if not exists idx_channel_identities_lookup 
  on channel_identities (organization_id, channel, external_user_id);
create index if not exists idx_channel_identities_lead 
  on channel_identities (organization_id, lead_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Lead Scoring Rules
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists lead_scoring_rules (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  event_type text not null,
  score_delta integer not null check (score_delta between -100 and 100),
  conditions jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table lead_scoring_rules enable row level security;

create policy "Users can view lead scoring rules of their organizations"
  on lead_scoring_rules for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = lead_scoring_rules.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Org admins can manage lead scoring rules"
  on lead_scoring_rules for all
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = lead_scoring_rules.organization_id
      and organization_members.user_id = (select auth.uid())
      and organization_members.role in ('owner', 'admin')
    )
  );

create index if not exists idx_lead_scoring_rules_lookup 
  on lead_scoring_rules (organization_id, event_type) where is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Analytics Daily Rollups
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists analytics_daily_rollups (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  date date not null,
  metric_name text not null,
  metric_value numeric(12, 2) not null default 0,
  dimensions jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique (organization_id, date, metric_name)
);

alter table analytics_daily_rollups enable row level security;

create policy "Users can view analytics rollups of their organizations"
  on analytics_daily_rollups for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = analytics_daily_rollups.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create index if not exists idx_analytics_daily_rollups_query 
  on analytics_daily_rollups (organization_id, metric_name, date desc);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Virtual Phone Numbers & Telephony Routing
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists phone_numbers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  phone_number text not null,
  provider text not null default 'twilio' check (provider in ('twilio', 'telnyx', 'sip')),
  provider_sid text,
  friendly_name text,
  capabilities jsonb default '{"voice": true, "sms": true}'::jsonb,
  assigned_agent text default 'receptionist',
  status text not null default 'active' check (status in ('active', 'suspended', 'released')),
  created_at timestamptz default now(),
  unique (organization_id, phone_number)
);

alter table phone_numbers enable row level security;

create policy "Users can view phone numbers of their organizations"
  on phone_numbers for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = phone_numbers.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Org admins can manage phone numbers"
  on phone_numbers for all
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = phone_numbers.organization_id
      and organization_members.user_id = (select auth.uid())
      and organization_members.role in ('owner', 'admin')
    )
  );

create index if not exists idx_phone_numbers_lookup 
  on phone_numbers (phone_number) where status = 'active';

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Workflow Executions (Deterministic State & Audit)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists workflow_executions (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  workflow_id uuid references workflows(id) on delete cascade not null,
  trigger_event text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  context jsonb default '{}'::jsonb,
  error_message text,
  started_at timestamptz default now(),
  completed_at timestamptz
);

alter table workflow_executions enable row level security;

create policy "Users can view workflow executions of their organizations"
  on workflow_executions for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = workflow_executions.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Org members can create workflow executions"
  on workflow_executions for insert
  to authenticated
  with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = workflow_executions.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create index if not exists idx_workflow_executions_lookup 
  on workflow_executions (organization_id, workflow_id, started_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Immutable Security Audit Logs (Tamper-Evident / Append-Only)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('user', 'system', 'api_key', 'cron')),
  action text not null,
  target_type text not null,
  target_id text,
  changes jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

alter table audit_logs enable row level security;

create policy "Org members can view audit logs of their organizations"
  on audit_logs for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = audit_logs.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Authenticated users can insert audit logs"
  on audit_logs for insert
  to authenticated
  with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = audit_logs.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

-- NOTICE: Explicitly NO update or delete policies created on audit_logs.
-- By PostgreSQL RLS design, omitting update and delete policies enforces immutability.

create index if not exists idx_audit_logs_org_created 
  on audit_logs (organization_id, created_at desc);
create index if not exists idx_audit_logs_actor 
  on audit_logs (organization_id, actor_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Non-Breaking Extensions to Pre-Existing Tables
-- ─────────────────────────────────────────────────────────────────────────
alter table organizations 
  add column if not exists monthly_ai_messages_used integer not null default 0,
  add column if not exists monthly_voice_minutes_used integer not null default 0;

alter table messages 
  add column if not exists is_internal boolean not null default false,
  add column if not exists email_message_id text,
  add column if not exists in_reply_to text;
