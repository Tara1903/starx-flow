-- ============================================================================
-- STARX-FLOW: COMPLETE CLEAN PRODUCTION DATABASE SETUP
-- Project: StarX (iotuxpcqewdzvqzncpad)
-- Description: Resets public schema to pristine state and sets up full
--              multi-tenant architecture, security, and 24/7 AI receptionist.
-- ============================================================================

-- 1. Cleanly reset public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2. Grant permissions to standard Supabase roles
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 3. Extensions & Search Path
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

SET search_path = public, extensions;


-- ============================================================================
-- FILE: supabase\migrations\001_initial_schema.sql
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  business_name text not null,
  business_type text,
  owner_name text not null,
  email text,
  role text default 'user',
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, business_name, owner_name, email)
  values (new.id, 'My Business', 'Owner', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Workflows
create table if not exists workflows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  trigger text,
  action text,
  is_active boolean default false,
  channel text not null,
  ai_tone text,
  custom_prompt text,
  executions_count integer default 0,
  success_rate numeric default 100,
  saved_hours numeric default 0,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table workflows enable row level security;
drop policy if exists "Users can view own workflows" on workflows;
create policy "Users can view own workflows" on workflows for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own workflows" on workflows;
create policy "Users can insert own workflows" on workflows for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own workflows" on workflows;
create policy "Users can update own workflows" on workflows for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own workflows" on workflows;
create policy "Users can delete own workflows" on workflows for delete using (auth.uid() = user_id);

-- Function to increment workflow stats
create or replace function public.increment_workflow_stats(wf_id uuid, hours numeric)
returns void as $$
begin
  update workflows
  set executions_count = executions_count + 1,
      saved_hours = saved_hours + hours
  where id = wf_id;
end;
$$ language plpgsql security definer;

-- 3. Connected Channels
create table if not exists connected_channels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  channel_key text not null,
  is_connected boolean default false,
  credentials jsonb default '{}'::jsonb,
  last_synced timestamptz,
  unique (user_id, channel_key)
);
alter table connected_channels enable row level security;
drop policy if exists "Users can view own channels" on connected_channels;
create policy "Users can view own channels" on connected_channels for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own channels" on connected_channels;
create policy "Users can insert own channels" on connected_channels for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own channels" on connected_channels;
create policy "Users can update own channels" on connected_channels for update using (auth.uid() = user_id);

-- 4. Execution Logs
create table if not exists execution_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  workflow_id uuid references workflows(id),
  type text not null,
  channel text,
  message text,
  timestamp timestamptz default now()
);
alter table execution_logs enable row level security;
drop policy if exists "Users can view own logs" on execution_logs;
create policy "Users can view own logs" on execution_logs for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own logs" on execution_logs;
create policy "Users can insert own logs" on execution_logs for insert with check (auth.uid() = user_id);

-- 5. Agents
create table if not exists agents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  role text not null,
  description text,
  is_active boolean default true,
  system_prompt text,
  permissions text[],
  created_at timestamptz default now()
);
alter table agents enable row level security;
drop policy if exists "Users can view own agents" on agents;
create policy "Users can view own agents" on agents for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own agents" on agents;
create policy "Users can insert own agents" on agents for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own agents" on agents;
create policy "Users can update own agents" on agents for update using (auth.uid() = user_id);

-- 6. Agent Memories
create table if not exists agent_memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  lead_id text,
  key text not null,
  value text,
  created_at timestamptz default now(),
  unique (user_id, lead_id, key)
);
alter table agent_memories enable row level security;
drop policy if exists "Users can view own agent memories" on agent_memories;
create policy "Users can view own agent memories" on agent_memories for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own agent memories" on agent_memories;
create policy "Users can insert own agent memories" on agent_memories for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own agent memories" on agent_memories;
create policy "Users can update own agent memories" on agent_memories for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own agent memories" on agent_memories;
create policy "Users can delete own agent memories" on agent_memories for delete using (auth.uid() = user_id);

-- 7. Business Goals
create table if not exists business_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  target_value numeric default 0,
  current_value numeric default 0,
  unit text,
  target_date timestamptz,
  status text default 'active',
  created_at timestamptz default now()
);
alter table business_goals enable row level security;
drop policy if exists "Users can view own business goals" on business_goals;
create policy "Users can view own business goals" on business_goals for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own business goals" on business_goals;
create policy "Users can insert own business goals" on business_goals for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own business goals" on business_goals;
create policy "Users can update own business goals" on business_goals for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own business goals" on business_goals;
create policy "Users can delete own business goals" on business_goals for delete using (auth.uid() = user_id);

-- 8. Business Memories
create table if not exists business_memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  key text not null,
  value text,
  category text default 'general',
  created_at timestamptz default now()
);
alter table business_memories enable row level security;
drop policy if exists "Users can view own business memories" on business_memories;
create policy "Users can view own business memories" on business_memories for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own business memories" on business_memories;
create policy "Users can insert own business memories" on business_memories for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own business memories" on business_memories;
create policy "Users can update own business memories" on business_memories for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own business memories" on business_memories;
create policy "Users can delete own business memories" on business_memories for delete using (auth.uid() = user_id);

-- 9. Calls
create table if not exists calls (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  lead_id text,
  customer_name text,
  customer_phone text,
  direction text,
  status text,
  duration_seconds integer default 0,
  recording_url text,
  transcription jsonb default '[]'::jsonb,
  summary text,
  sentiment text,
  call_memory jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
alter table calls enable row level security;
drop policy if exists "Users can view own calls" on calls;
create policy "Users can view own calls" on calls for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own calls" on calls;
create policy "Users can insert own calls" on calls for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own calls" on calls;
create policy "Users can update own calls" on calls for update using (auth.uid() = user_id);

-- 10. Subscriptions
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  plan_id text,
  amount numeric,
  currency text default 'usd',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  trial_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now()
);
alter table subscriptions enable row level security;
drop policy if exists "Users can view own subscription" on subscriptions;
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);

-- 11. Invoices
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  subscription_id uuid references subscriptions(id),
  stripe_invoice_id text,
  amount numeric,
  currency text default 'usd',
  status text,
  period_start timestamptz,
  period_end timestamptz,
  paid_at timestamptz,
  hosted_invoice_url text,
  created_at timestamptz default now()
);
alter table invoices enable row level security;
drop policy if exists "Users can view own invoices" on invoices;
create policy "Users can view own invoices" on invoices for select using (auth.uid() = user_id);

-- 12. Job Queue
create table if not exists job_queue (
  id uuid default gen_random_uuid() primary key,
  job_type text not null,
  payload jsonb not null,
  status text default 'pending',
  attempts integer default 0,
  max_attempts integer default 3,
  scheduled_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  created_at timestamptz default now()
);
alter table job_queue enable row level security;




-- ============================================================================
-- FILE: supabase\migrations\002_production_core_schema.sql
-- ============================================================================

-- =========================================================================
-- StarX-Flow Production Core Schema Migration
-- Migration: 002_production_core_schema.sql
-- Description: Multi-tenancy, CRM, Messaging, Appointments, Knowledge Base (RAG),
--              Orders, Tasks, Campaigns, and Usage Tracking with Row Level Security.
-- =========================================================================

-- Enable pgvector extension if available for RAG vector search
create extension if not exists "vector";

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Organizations & Multi-Tenant Infrastructure
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  plan text default 'starter',
  settings jsonb default '{"currency": "EUR", "timezone": "Europe/Berlin", "locale": "en"}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table organizations enable row level security;

create table if not exists organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

alter table organization_members enable row level security;

create policy "Users can view organizations they belong to"
  on organizations for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = (select auth.uid())
    )
  );

create policy "Org admins can update organization"
  on organizations for update
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = (select auth.uid())
      and organization_members.role in ('owner', 'admin')
    )
  );

create policy "Users can view members of their organizations"
  on organization_members for select
  to authenticated
  using (
    exists (
      select 1 from organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Org admins can invite/add members"
  on organization_members for insert
  to authenticated
  with check (
    exists (
      select 1 from organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'admin')
    ) or user_id = (select auth.uid())
  );

create policy "Org admins can remove members"
  on organization_members for delete
  to authenticated
  using (
    exists (
      select 1 from organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'admin')
    ) or user_id = (select auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 2. CRM & Contact Management (Leads)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete set null,
  name text not null,
  phone text,
  email text,
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source text default 'manual' check (source in ('whatsapp', 'instagram', 'sms', 'web_chat', 'manual', 'csv_import')),
  score integer default 50,
  tags text[] default '{}',
  notes text,
  custom_fields jsonb default '{}'::jsonb,
  last_contact_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table leads enable row level security;
create policy "Users can view own leads" on leads for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own leads" on leads for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own leads" on leads for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own leads" on leads for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists idx_leads_user_id on leads(user_id);
create index if not exists idx_leads_phone on leads(phone);
create index if not exists idx_leads_status on leads(status);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Unified Communications: Conversations & Messages
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  channel text not null check (channel in ('WhatsApp', 'Instagram', 'SMS', 'Web', 'Email')),
  status text default 'active' check (status in ('active', 'needs_attention', 'resolved', 'snoozed')),
  unread_count integer default 0,
  assigned_to uuid references auth.users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  last_message text,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;
create policy "Users can view own conversations" on conversations for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own conversations" on conversations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own conversations" on conversations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own conversations" on conversations for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_lead_id on conversations(lead_id);
create index if not exists idx_conversations_channel on conversations(channel);
create index if not exists idx_conversations_status on conversations(status);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  role text not null check (role in ('user', 'ai', 'human', 'system')),
  content text not null,
  attachments jsonb default '[]'::jsonb,
  status text default 'sent' check (status in ('sent', 'delivered', 'read', 'failed')),
  created_at timestamptz default now()
);

alter table messages enable row level security;
create policy "Users can view messages of their conversations"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
    )
  );

create policy "Users can insert messages into their conversations"
  on messages for insert
  to authenticated
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
    )
  );

create policy "Users can update messages in their conversations"
  on messages for update
  to authenticated
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
    )
  );

create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(created_at);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Appointments & Scheduling
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  service_name text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text default 'Europe/Berlin',
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  reminder_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table appointments enable row level security;
create policy "Users can view own appointments" on appointments for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own appointments" on appointments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own appointments" on appointments for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own appointments" on appointments for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists idx_appointments_user_id on appointments(user_id);
create index if not exists idx_appointments_start_time on appointments(start_time);
create index if not exists idx_appointments_status on appointments(status);

create table if not exists working_hours (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null default '09:00:00',
  end_time time not null default '18:00:00',
  is_active boolean default true,
  unique (user_id, day_of_week)
);

alter table working_hours enable row level security;
create policy "Users can manage own working hours" on working_hours for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Orders & Business Operations
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  order_number text not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  total_amount numeric default 0,
  currency text default 'EUR',
  items jsonb default '[]'::jsonb,
  invoice_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table orders enable row level security;
create policy "Users can view own orders" on orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own orders" on orders for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own orders" on orders for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own orders" on orders for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_order_number on orders(order_number);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Task Management (To-Dos / Kanban)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "Users can manage own tasks" on tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_status on tasks(status);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Knowledge Base & RAG Vector Store
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists knowledge_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete set null,
  title text not null,
  document_type text not null check (document_type in ('pdf', 'docx', 'url', 'text', 'faq')),
  source_url text,
  content text not null,
  chunks_count integer default 0,
  status text default 'indexed' check (status in ('processing', 'indexed', 'failed')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table knowledge_documents enable row level security;
create policy "Users can view own knowledge documents" on knowledge_documents for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own knowledge documents" on knowledge_documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own knowledge documents" on knowledge_documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own knowledge documents" on knowledge_documents for delete to authenticated using ((select auth.uid()) = user_id);

create table if not exists knowledge_chunks (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references knowledge_documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  chunk_index integer not null,
  chunk_content text not null,
  token_count integer default 0,
  embedding jsonb, -- fallback json representation if pgvector extension is absent
  created_at timestamptz default now()
);

alter table knowledge_chunks enable row level security;
create policy "Users can manage own knowledge chunks" on knowledge_chunks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists idx_knowledge_chunks_doc_id on knowledge_chunks(document_id);
create index if not exists idx_knowledge_chunks_user_id on knowledge_chunks(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 8. Marketing Campaigns & Follow-ups
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  channel text default 'WhatsApp' check (channel in ('WhatsApp', 'Instagram', 'SMS', 'Email')),
  status text default 'draft' check (status in ('draft', 'scheduled', 'running', 'completed', 'paused')),
  target_segment text default 'all',
  message_template text not null,
  sent_count integer default 0,
  delivered_count integer default 0,
  response_count integer default 0,
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table campaigns enable row level security;
create policy "Users can manage own campaigns" on campaigns for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists campaign_recipients (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'sent', 'failed', 'replied', 'opted_out')),
  error_message text,
  sent_at timestamptz,
  unique (campaign_id, lead_id)
);

alter table campaign_recipients enable row level security;
create policy "Users can view campaign recipients" on campaign_recipients for all to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_recipients.campaign_id
      and campaigns.user_id = (select auth.uid())
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 9. Analytics Events & Usage Records
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table analytics_events enable row level security;
create policy "Users can manage own analytics events" on analytics_events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists usage_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  metric_type text not null,
  quantity integer default 1,
  recorded_at timestamptz default now()
);

alter table usage_records enable row level security;
create policy "Users can view own usage records" on usage_records for select to authenticated using ((select auth.uid()) = user_id);
create policy "System can insert usage records" on usage_records for insert to authenticated with check ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 10. GDPR & Privacy Compliance: Consent & Deletion Logs
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists consent_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete cascade,
  channel text not null,
  consent_type text not null, -- 'marketing', 'transactional', 'ai_processing'
  status text not null,       -- 'opt_in', 'opt_out'
  ip_address text,
  user_agent text,
  timestamp timestamptz default now()
);

alter table consent_logs enable row level security;
create policy "Users can manage own consent logs" on consent_logs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);




-- ============================================================================
-- FILE: supabase\migrations\003_commercial_capabilities.sql
-- ============================================================================

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




-- ============================================================================
-- FILE: supabase\migrations\004_security_integrity_and_remediation.sql
-- ============================================================================

-- =========================================================================
-- STARX-FLOW MIGRATION 004: SECURITY INTEGRITY & REMEDIATION (PHASE 4B.4.2)
-- =========================================================================
-- Purpose:
-- 1. Resolve Audit Log check constraints and support 'ai_agent' actor type.
-- 2. Add database trigger enforcing immutable audit logs (prohibit UPDATE/DELETE).
-- 3. Align RLS policies with organization_members for multi-user tenant collaboration.
-- 4. Add distributed serverless presence table (conversation_presence).
-- 5. Add database exclusion constraint & atomic booking function for appointment concurrency.
-- 6. Add transactional customer merge database function (merge_customers) with automatic rollback.
-- =========================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "btree_gist";

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Audit Logs Schema & Immutability Hardening
-- ─────────────────────────────────────────────────────────────────────────
-- Drop existing check constraint if present and re-add with 'ai_agent'
alter table if exists audit_logs drop constraint if exists audit_logs_actor_type_check;

alter table if exists audit_logs
  add constraint audit_logs_actor_type_check
  check (actor_type in ('user', 'system', 'api_key', 'cron', 'ai_agent'));

-- Ensure actor_id allows NULL when actor_type is 'ai_agent' or 'system'
alter table if exists audit_logs alter column actor_id drop not null;

-- Add structured metadata column if not present
alter table if exists audit_logs
  add column if not exists metadata jsonb default '{}'::jsonb;

-- Prohibit application-level UPDATE or DELETE on audit_logs at PostgreSQL engine level
create or replace function tr_prevent_audit_log_mutation()
returns trigger as $$
begin
  raise exception 'audit_logs entries are strictly immutable: updates and deletes are prohibited';
end;
$$ language plpgsql;

drop trigger if exists tr_audit_logs_immutable on audit_logs;
create trigger tr_audit_logs_immutable
  before update or delete on audit_logs
  for each row execute function tr_prevent_audit_log_mutation();

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Multi-User Team Collaboration & RLS Alignment
-- ─────────────────────────────────────────────────────────────────────────
-- Helper function to return all organization IDs the current user belongs to
create or replace function auth_user_org_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select organization_id from organization_members where user_id = auth.uid();
$$;

-- Align conversations RLS policies
drop policy if exists "Users can view own conversations" on conversations;
create policy "Users can view team conversations" on conversations
  for select to authenticated
  using (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  );

drop policy if exists "Users can insert own conversations" on conversations;
create policy "Users can insert team conversations" on conversations
  for insert to authenticated
  with check (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  );

drop policy if exists "Users can update own conversations" on conversations;
create policy "Users can update team conversations" on conversations
  for update to authenticated
  using (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  )
  with check (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  );

-- Align messages RLS policies
drop policy if exists "Users can view messages of their conversations" on messages;
create policy "Users can view team messages" on messages
  for select to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.user_id = (select auth.uid()) or c.organization_id in (select auth_user_org_ids()))
    )
  );

drop policy if exists "Users can insert messages into their conversations" on messages;
create policy "Users can insert team messages" on messages
  for insert to authenticated
  with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.user_id = (select auth.uid()) or c.organization_id in (select auth_user_org_ids()))
    )
  );

-- Public / Anonymous access to messages: CANNOT read internal notes
drop policy if exists "Public can only read non-internal messages" on messages;
create policy "Public can only read non-internal messages" on messages
  for select to anon
  using (is_internal = false);

-- Align leads RLS policies
drop policy if exists "Users can view own leads" on leads;
create policy "Users can view team leads" on leads
  for select to authenticated
  using (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  );

drop policy if exists "Users can update own leads" on leads;
create policy "Users can update team leads" on leads
  for update to authenticated
  using (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  )
  with check (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  );

-- Align appointments RLS policies
drop policy if exists "Users can view own appointments" on appointments;
create policy "Users can view team appointments" on appointments
  for select to authenticated
  using (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  );

drop policy if exists "Users can update own appointments" on appointments;
create policy "Users can update team appointments" on appointments
  for update to authenticated
  using (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  )
  with check (
    user_id = (select auth.uid()) or
    organization_id in (select auth_user_org_ids())
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Distributed Serverless Presence Table (WS-07)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists conversation_presence (
  conversation_id uuid references conversations(id) on delete cascade not null,
  agent_id text not null,
  agent_name text not null,
  organization_id uuid references organizations(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (conversation_id, agent_id)
);

create index if not exists idx_conversation_presence_active 
  on conversation_presence (conversation_id, expires_at);

alter table conversation_presence enable row level security;

create policy "Users can view presence in team conversations" on conversation_presence
  for select to authenticated
  using (
    organization_id in (select auth_user_org_ids()) or
    exists (
      select 1 from conversations c
      where c.id = conversation_presence.conversation_id
      and (c.user_id = (select auth.uid()) or c.organization_id in (select auth_user_org_ids()))
    )
  );

create policy "Users can manage presence in team conversations" on conversation_presence
  for all to authenticated
  using (
    organization_id in (select auth_user_org_ids()) or
    exists (
      select 1 from conversations c
      where c.id = conversation_presence.conversation_id
      and (c.user_id = (select auth.uid()) or c.organization_id in (select auth_user_org_ids()))
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Appointment Double-Booking Prevention & Atomic Booking (WS-06)
-- ─────────────────────────────────────────────────────────────────────────
-- PostgreSQL exclusion constraint for scheduled / confirmed appointments
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'no_overlapping_appointments'
  ) then
    alter table appointments add constraint no_overlapping_appointments
      exclude using gist (
        user_id with =,
        tstzrange(start_time, end_time) with &&
      ) where (status in ('scheduled', 'confirmed'));
  end if;
exception when others then
  raise notice 'btree_gist exclusion constraint creation skipped if extension unavailable: %', sqlerrm;
end $$;

-- Atomic Booking Function with Explicit Row-Locking & Range Overlap Check
create or replace function book_appointment_atomic(
  p_user_id uuid,
  p_org_id uuid,
  p_lead_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_service_name text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_timezone text default 'Europe/Berlin',
  p_notes text default null
) returns jsonb
language plpgsql
as $$
declare
  v_conflict_count int;
  v_new_apt appointments;
begin
  -- Advisory transaction lock keyed by user_id to serialize slot checks
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- Check for overlapping active appointments
  select count(*) into v_conflict_count
  from appointments
  where user_id = p_user_id
    and status in ('scheduled', 'confirmed')
    and tstzrange(start_time, end_time) && tstzrange(p_start_time, p_end_time);

  if v_conflict_count > 0 then
    return jsonb_build_object(
      'success', false,
      'error', 'SLOT_CONFLICT',
      'message', 'The requested appointment slot overlaps with an existing confirmed appointment.'
    );
  end if;

  insert into appointments (
    user_id, organization_id, lead_id, customer_name,
    customer_phone, customer_email, service_name,
    start_time, end_time, timezone, status, notes
  ) values (
    p_user_id, p_org_id, p_lead_id, p_customer_name,
    p_customer_phone, p_customer_email, p_service_name,
    p_start_time, p_end_time, p_timezone, 'confirmed', p_notes
  ) returning * into v_new_apt;

  return jsonb_build_object(
    'success', true,
    'appointment_id', v_new_apt.id,
    'start_time', v_new_apt.start_time,
    'end_time', v_new_apt.end_time,
    'status', v_new_apt.status
  );
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Transactional Customer Merge Function (WS-03)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function merge_customers(
  p_org_id uuid,
  p_target_lead_id uuid,
  p_source_lead_id uuid,
  p_actor_id uuid
) returns jsonb
language plpgsql
as $$
declare
  v_target_lead leads;
  v_source_lead leads;
  v_reassigned_identities int := 0;
  v_reassigned_convos int := 0;
  v_reassigned_apts int := 0;
  v_reassigned_orders int := 0;
  v_audit_id uuid := gen_random_uuid();
begin
  if p_target_lead_id = p_source_lead_id then
    raise exception 'Cannot merge a customer into itself';
  end if;

  -- 1. Verify target lead exists
  select * into v_target_lead from leads where id = p_target_lead_id;
  if not found then
    raise exception 'Target customer % does not exist', p_target_lead_id;
  end if;

  -- 2. Verify source lead exists
  select * into v_source_lead from leads where id = p_source_lead_id;
  if not found then
    raise exception 'Source customer % does not exist', p_source_lead_id;
  end if;

  -- 3. Tenant isolation check: ensure both leads belong to the same tenant
  if (v_target_lead.organization_id is not null and v_source_lead.organization_id is not null and v_target_lead.organization_id <> v_source_lead.organization_id)
     or (v_target_lead.organization_id is null and v_target_lead.user_id <> v_source_lead.user_id) then
    raise exception 'Cross-organization merge is prohibited. Target and source belong to different tenants.';
  end if;

  -- 4. Reassign channel identities, avoiding duplicate (organization_id, channel, external_user_id) unique constraint violations
  with moved as (
    update channel_identities ci
    set lead_id = p_target_lead_id
    where ci.lead_id = p_source_lead_id
      and not exists (
        select 1 from channel_identities existing
        where existing.lead_id = p_target_lead_id
          and existing.channel = ci.channel
          and existing.external_user_id = ci.external_user_id
      )
    returning id
  )
  select count(*) into v_reassigned_identities from moved;

  -- Delete redundant duplicate identities from source
  delete from channel_identities where lead_id = p_source_lead_id;

  -- 5. Reassign conversations
  with moved_c as (
    update conversations set lead_id = p_target_lead_id
    where lead_id = p_source_lead_id
    returning id
  )
  select count(*) into v_reassigned_convos from moved_c;

  -- 6. Reassign appointments
  with moved_a as (
    update appointments set lead_id = p_target_lead_id
    where lead_id = p_source_lead_id
    returning id
  )
  select count(*) into v_reassigned_apts from moved_a;

  -- 7. Reassign orders
  with moved_o as (
    update orders set lead_id = p_target_lead_id
    where lead_id = p_source_lead_id
    returning id
  )
  select count(*) into v_reassigned_orders from moved_o;

  -- 8. Merge profile attributes into target (preserve non-empty values)
  update leads set
    phone = coalesce(v_target_lead.phone, v_source_lead.phone),
    email = coalesce(v_target_lead.email, v_source_lead.email),
    tags = array(select distinct unnest(array_cat(array_cat(v_target_lead.tags, v_source_lead.tags), array['merged']))),
    notes = trim(concat_ws(E'\n', v_target_lead.notes, concat('[Merged Profile Notes]: ', v_source_lead.notes))),
    updated_at = now()
  where id = p_target_lead_id;

  -- 9. Archive source lead
  update leads set
    status = 'lost',
    tags = array_append(tags, 'merged-archive'),
    updated_at = now()
  where id = p_source_lead_id;

  -- 10. Record immutable audit log
  insert into audit_logs (
    id, organization_id, actor_id, actor_type, action,
    target_type, target_id, changes, created_at
  ) values (
    v_audit_id,
    coalesce(p_org_id, v_target_lead.organization_id, v_target_lead.user_id),
    p_actor_id,
    'user',
    'customer.merge',
    'lead',
    p_target_lead_id::text,
    jsonb_build_object(
      'merged_source_id', p_source_lead_id,
      'identities_reassigned', v_reassigned_identities,
      'conversations_reassigned', v_reassigned_convos,
      'appointments_reassigned', v_reassigned_apts,
      'orders_reassigned', v_reassigned_orders
    ),
    now()
  );

  return jsonb_build_object(
    'success', true,
    'target_lead_id', p_target_lead_id,
    'source_lead_id', p_source_lead_id,
    'audit_log_id', v_audit_id,
    'reassigned', jsonb_build_object(
      'identities', v_reassigned_identities,
      'conversations', v_reassigned_convos,
      'appointments', v_reassigned_apts,
      'orders', v_reassigned_orders
    )
  );
end;
$$;




-- ============================================================================
-- FILE: supabase\migrations\005_external_integrations_and_sync.sql
-- ============================================================================

-- ==============================================================================
-- STARX-FLOW — MIGRATION 005: EXTERNAL INTEGRATIONS & SYNCHRONIZATION INFRASTRUCTURE
-- Enables WS-06 (Google & Outlook Calendar), WS-07 (Resend Email), and WS-08 (Meta Instagram)
-- Enforces AES-256 encrypted credential storage, provider idempotency, and strict organization RLS.
-- ==============================================================================

-- 1. CONNECTED ACCOUNTS TABLE (OAuth tokens & provider credentials encrypted at rest)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  provider VARCHAR(32) NOT NULL, -- 'google_calendar', 'microsoft_calendar', 'resend_email', 'instagram'
  status VARCHAR(32) NOT NULL DEFAULT 'connected', -- 'connected', 'expired', 'revoked', 'error'
  account_identifier VARCHAR(255), -- email, phone, or instagram username
  account_name VARCHAR(255),
  encrypted_credentials TEXT, -- AES-256-GCM encrypted tokens & refresh tokens
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_connected_accounts_org_provider UNIQUE (organization_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_org ON connected_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider ON connected_accounts(provider, status);

-- 2. EXTERNAL CALENDARS TABLE (Calendar selection and sync metadata)
CREATE TABLE IF NOT EXISTS external_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL, -- 'google_calendar', 'microsoft_calendar'
  external_calendar_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  time_zone VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  sync_enabled BOOLEAN DEFAULT true,
  sync_token TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_external_calendars_org_cal UNIQUE (organization_id, provider, external_calendar_id)
);

CREATE INDEX IF NOT EXISTS idx_external_calendars_org ON external_calendars(organization_id);

-- 3. EXTERNAL CALENDAR EVENTS (Mapping StarX appointments <-> Provider external events)
CREATE TABLE IF NOT EXISTS external_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  external_calendar_id UUID REFERENCES external_calendars(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  external_event_id VARCHAR(255) NOT NULL,
  external_event_url TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
  sync_status VARCHAR(32) NOT NULL DEFAULT 'synced', -- 'synced', 'pending', 'failed', 'conflict'
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_external_cal_events_cal_event UNIQUE (external_calendar_id, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_external_calendar_events_apt ON external_calendar_events(appointment_id);
CREATE INDEX IF NOT EXISTS idx_external_calendar_events_org ON external_calendar_events(organization_id);

-- 4. EMAIL THREADS TABLE (Message-ID, In-Reply-To, References tracking)
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id VARCHAR(255) NOT NULL,
  lead_id VARCHAR(255),
  message_id VARCHAR(255) NOT NULL, -- Standard Internet Message-ID
  in_reply_to VARCHAR(255),
  references_headers TEXT[],
  subject VARCHAR(500),
  sender_email VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_threads_message_id ON email_threads(organization_id, message_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_conversation_id ON email_threads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_sender ON email_threads(organization_id, sender_email);

-- 5. PROVIDER WEBHOOK EVENTS (Idempotency and deduplication registry)
CREATE TABLE IF NOT EXISTS provider_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  provider VARCHAR(32) NOT NULL, -- 'google', 'microsoft', 'resend', 'meta'
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  payload_hash VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'processed', -- 'received', 'processed', 'failed', 'ignored'
  raw_payload JSONB,
  error_message TEXT,
  processed_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_provider_webhook_events UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_webhooks_lookup ON provider_webhook_events(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_provider_webhooks_org ON provider_webhook_events(organization_id);

-- 6. INTEGRATION SYNC LOGS (Diagnostics and audit trail)
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  action VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL, -- 'success', 'warning', 'error'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_org ON integration_sync_logs(organization_id, created_at DESC);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE connected_accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE external_calendars FORCE ROW LEVEL SECURITY;
ALTER TABLE external_calendar_events FORCE ROW LEVEL SECURITY;
ALTER TABLE email_threads FORCE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs FORCE ROW LEVEL SECURITY;

-- connected_accounts: Only verified organization members can select/manage
DROP POLICY IF EXISTS connected_accounts_org_policy ON connected_accounts;
CREATE POLICY connected_accounts_org_policy ON connected_accounts
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- external_calendars: Only verified organization members
DROP POLICY IF EXISTS external_calendars_org_policy ON external_calendars;
CREATE POLICY external_calendars_org_policy ON external_calendars
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- external_calendar_events: Only verified organization members
DROP POLICY IF EXISTS external_calendar_events_org_policy ON external_calendar_events;
CREATE POLICY external_calendar_events_org_policy ON external_calendar_events
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- email_threads: Only verified organization members
DROP POLICY IF EXISTS email_threads_org_policy ON email_threads;
CREATE POLICY email_threads_org_policy ON email_threads
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- integration_sync_logs: Only verified organization members
DROP POLICY IF EXISTS integration_sync_logs_org_policy ON integration_sync_logs;
CREATE POLICY integration_sync_logs_org_policy ON integration_sync_logs
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- provider_webhook_events: System service-role access or organization members
DROP POLICY IF EXISTS provider_webhooks_service_policy ON provider_webhook_events;
CREATE POLICY provider_webhooks_service_policy ON provider_webhook_events
  FOR ALL
  USING (
    organization_id IS NULL 
    OR organization_id IN (SELECT auth_user_org_ids())
  )
  WITH CHECK (
    organization_id IS NULL 
    OR organization_id IN (SELECT auth_user_org_ids())
  );

-- Grant access to authenticated users (RLS filters rows)
GRANT ALL ON connected_accounts TO authenticated;
GRANT ALL ON external_calendars TO authenticated;
GRANT ALL ON external_calendar_events TO authenticated;
GRANT ALL ON email_threads TO authenticated;
GRANT ALL ON provider_webhook_events TO authenticated;
GRANT ALL ON integration_sync_logs TO authenticated;




-- ============================================================================
-- FILE: supabase\migrations\006_oauth_states_and_channel_window_persistence.sql
-- ============================================================================

-- ==============================================================================
-- STARX-FLOW — MIGRATION 006: OAUTH STATE SECURITY & SERVERLESS WINDOW PERSISTENCE
-- Remediates Phase 4B.5.1 Audit Findings: C1 (OAuth CSRF), C3 (24h Window Persistence)
-- Enables durable cross-serverless OAuth state consumption and atomic channel window updates.
-- ==============================================================================

-- 1. OAUTH STATES TABLE (Durable, serverless-safe OAuth CSRF nonce storage)
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_token VARCHAR(128) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  provider VARCHAR(32) NOT NULL, -- 'google_calendar', 'microsoft_calendar', 'instagram'
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_lookup 
  ON oauth_states(state_token) 
  WHERE consumed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_oauth_states_org 
  ON oauth_states(organization_id, provider);

-- 2. CUSTOMER CHANNEL MESSAGING WINDOWS TABLE (Durable Meta 24-hour window tracking)
CREATE TABLE IF NOT EXISTS customer_channel_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL, -- 'instagram', 'whatsapp', 'messenger'
  customer_channel_id VARCHAR(255) NOT NULL, -- IGSID or external phone/user ID
  last_inbound_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_channel_window_org_provider_customer UNIQUE (organization_id, provider, customer_channel_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_windows_lookup 
  ON customer_channel_windows(organization_id, provider, customer_channel_id);

CREATE INDEX IF NOT EXISTS idx_channel_windows_expiry 
  ON customer_channel_windows(window_expires_at);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states FORCE ROW LEVEL SECURITY;

ALTER TABLE customer_channel_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_channel_windows FORCE ROW LEVEL SECURITY;

-- oauth_states: Only members of the organization or service-role can view/manage
DROP POLICY IF EXISTS oauth_states_org_policy ON oauth_states;
CREATE POLICY oauth_states_org_policy ON oauth_states
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- customer_channel_windows: Only members of the organization can view/manage
DROP POLICY IF EXISTS customer_channel_windows_org_policy ON customer_channel_windows;
CREATE POLICY customer_channel_windows_org_policy ON customer_channel_windows
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- Grants for authenticated sessions
GRANT ALL ON oauth_states TO authenticated;
GRANT ALL ON customer_channel_windows TO authenticated;

-- ==============================================================================
-- ATOMIC SECURITY FUNCTIONS
-- ==============================================================================

-- Atomic OAuth State Consumption Function (Guarantees one-time usage and cross-tenant protection)
CREATE OR REPLACE FUNCTION consume_oauth_state(
  p_state_token TEXT,
  p_org_id UUID,
  p_provider TEXT
) RETURNS oauth_states AS $$
DECLARE
  v_state oauth_states;
BEGIN
  -- Lock row for update to prevent concurrent replay race conditions
  SELECT * INTO v_state
  FROM oauth_states
  WHERE state_token = p_state_token
    AND expires_at > now()
    AND consumed_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_OR_EXPIRED_OAUTH_STATE';
  END IF;

  -- Verify provider matching
  IF v_state.provider != p_provider THEN
    RAISE EXCEPTION 'OAUTH_PROVIDER_MISMATCH';
  END IF;

  -- Verify organization matching (prevents cross-tenant parameter tampering)
  IF v_state.organization_id != p_org_id THEN
    RAISE EXCEPTION 'OAUTH_ORGANIZATION_MISMATCH';
  END IF;

  -- Mark state as consumed atomically and capture updated row
  UPDATE oauth_states
  SET consumed_at = now()
  WHERE id = v_state.id
  RETURNING * INTO v_state;

  RETURN v_state;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic Customer Channel Interaction Recorder
CREATE OR REPLACE FUNCTION record_customer_channel_interaction(
  p_org_id UUID,
  p_provider TEXT,
  p_customer_id TEXT,
  p_timestamp TIMESTAMPTZ DEFAULT now()
) RETURNS VOID AS $$
BEGIN
  INSERT INTO customer_channel_windows (
    organization_id,
    provider,
    customer_channel_id,
    last_inbound_at,
    window_expires_at,
    updated_at
  )
  VALUES (
    p_org_id,
    p_provider,
    p_customer_id,
    p_timestamp,
    p_timestamp + interval '24 hours',
    now()
  )
  ON CONFLICT (organization_id, provider, customer_channel_id)
  DO UPDATE SET
    last_inbound_at = EXCLUDED.last_inbound_at,
    window_expires_at = EXCLUDED.window_expires_at,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. EMAIL THREADS FOREIGN KEY HARDENING (M3 Remediation)
-- Ensures email_threads.conversation_id references conversations(id)
-- and email_threads.lead_id references leads(id)
-- ==============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_threads') THEN
    -- 1. Conversation ID foreign key
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_threads' AND column_name = 'conversation_id' AND data_type != 'uuid'
      ) THEN
        ALTER TABLE email_threads ALTER COLUMN conversation_id TYPE UUID USING conversation_id::uuid;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_email_threads_conversation'
      ) THEN
        ALTER TABLE email_threads
          ADD CONSTRAINT fk_email_threads_conversation 
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    -- 2. Lead ID foreign key
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_threads' AND column_name = 'lead_id' AND data_type != 'uuid'
      ) THEN
        ALTER TABLE email_threads ALTER COLUMN lead_id TYPE UUID USING lead_id::uuid;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_email_threads_lead'
      ) THEN
        ALTER TABLE email_threads
          ADD CONSTRAINT fk_email_threads_lead 
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;





-- ============================================================================
-- FILE: supabase\migrations\007_phase_4b54_security_hardening.sql
-- ============================================================================

-- ==============================================================================
-- STARX-FLOW — MIGRATION 007: SECURITY HARDENING & ATOMIC WEBHOOK CLAIMING
-- Phase 4B.5.4 Remediation:
--   1. Enforce Cross-Tenant Uniqueness on Connected Account Identifiers
--   2. Search Path & Privilege Hardening for all SECURITY DEFINER Functions
--   3. Database-Backed Atomic Webhook Idempotency State Machine (Leases & Retries)
-- ==============================================================================

-- ==============================================================================
-- 1. ROLE PRE-CHECK FOR HERMETIC & LOCAL COMPATIBILITY
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin;
    END IF;
END $$;

-- ==============================================================================
-- 2. CONNECTED ACCOUNT IDENTIFIER UNIQUENESS & DEDUPLICATION SAFETY
-- ==============================================================================

-- 1.1 Safe Duplicate Detection Pre-Check
DO $$
DECLARE
    v_dup_count INT;
BEGIN
    SELECT COUNT(*) INTO v_dup_count
    FROM (
        SELECT provider, account_identifier, COUNT(*)
        FROM connected_accounts
        WHERE account_identifier IS NOT NULL AND status IN ('connected', 'expired', 'error')
        GROUP BY provider, account_identifier
        HAVING COUNT(*) > 1
    ) dups;

    IF v_dup_count > 0 THEN
        RAISE EXCEPTION 'CRITICAL INTEGRATION INTEGRITY ERROR: Detected % duplicate connected account identifier(s) across organizations. Manual deduplication required before applying unique constraint.', v_dup_count;
    END IF;
END $$;

-- 1.2 Enforce Uniqueness across Tenants for Active Accounts
-- Ensures no two active organizations can register or route messages for the same external account
CREATE UNIQUE INDEX IF NOT EXISTS uq_connected_accounts_provider_identifier
ON connected_accounts(provider, account_identifier)
WHERE account_identifier IS NOT NULL AND status IN ('connected', 'expired', 'error');

-- ==============================================================================
-- 2. SECURITY DEFINER SEARCH PATH HARDENING & PRIVILEGE RESTRICTION
-- Remediates PostgreSQL Schema Hijacking Vulnerabilities (CVE-style pattern)
-- ==============================================================================

-- 2.1 Hardening consume_oauth_state
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'consume_oauth_state') THEN
        ALTER FUNCTION consume_oauth_state(TEXT, UUID, TEXT) SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION consume_oauth_state(TEXT, UUID, TEXT) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION consume_oauth_state(TEXT, UUID, TEXT) FROM anon;
        GRANT EXECUTE ON FUNCTION consume_oauth_state(TEXT, UUID, TEXT) TO authenticated, service_role;
    END IF;
END $$;

-- 2.2 Hardening record_customer_channel_interaction
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_customer_channel_interaction') THEN
        ALTER FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) FROM anon;
        GRANT EXECUTE ON FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) TO authenticated, service_role;
    END IF;
END $$;

-- 2.3 Hardening auth_user_org_ids
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auth_user_org_ids') THEN
        ALTER FUNCTION auth_user_org_ids() SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION auth_user_org_ids() FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION auth_user_org_ids() FROM anon;
        GRANT EXECUTE ON FUNCTION auth_user_org_ids() TO authenticated, service_role;
    END IF;
END $$;

-- 2.4 Hardening handle_new_user (if present from migration 001)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION handle_new_user() SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
        GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres, supabase_auth_admin, service_role;
    END IF;
END $$;

-- 2.5 Hardening increment_workflow_runs (if present)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_workflow_runs') THEN
        ALTER FUNCTION increment_workflow_runs(uuid) SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION increment_workflow_runs(uuid) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION increment_workflow_runs(uuid) FROM anon;
        GRANT EXECUTE ON FUNCTION increment_workflow_runs(uuid) TO authenticated, service_role;
    END IF;
END $$;

-- ==============================================================================
-- 3. DATABASE-BACKED ATOMIC WEBHOOK CLAIMING ENGINE (Fix H2)
-- Provides zero-race-condition event claiming, lease expiration & safe retries
-- ==============================================================================

-- 3.1 Extend provider_webhook_events schema with lease and retry tracking
ALTER TABLE provider_webhook_events
ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attempt_count INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS worker_id TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_provider_webhooks_lease
ON provider_webhook_events(provider, event_id, status, claim_expires_at);

-- 3.2 Atomic Webhook Claim Function
CREATE OR REPLACE FUNCTION claim_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_payload_hash TEXT,
    p_org_id UUID DEFAULT NULL,
    p_event_type TEXT DEFAULT NULL,
    p_lease_seconds INT DEFAULT 60,
    p_worker_id TEXT DEFAULT 'worker-default'
)
RETURNS TABLE (
    claimed BOOLEAN,
    claim_status TEXT,
    organization_id UUID,
    attempt_count INT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing RECORD;
    v_now TIMESTAMPTZ := clock_timestamp();
    v_lease_expiry TIMESTAMPTZ := v_now + (p_lease_seconds || ' seconds')::interval;
BEGIN
    -- 1. Attempt atomic initial insertion via ON CONFLICT DO NOTHING
    INSERT INTO provider_webhook_events (
        organization_id,
        provider,
        event_id,
        event_type,
        payload_hash,
        status,
        claim_expires_at,
        attempt_count,
        worker_id,
        created_at
    ) VALUES (
        p_org_id,
        p_provider,
        p_event_id,
        p_event_type,
        p_payload_hash,
        'claimed',
        v_lease_expiry,
        1,
        p_worker_id,
        v_now
    )
    ON CONFLICT (provider, event_id) DO NOTHING;

    -- If successfully inserted, this worker holds the initial claim
    IF FOUND THEN
        RETURN QUERY SELECT true, 'claimed'::TEXT, p_org_id, 1, 'Event successfully claimed'::TEXT;
        RETURN;
    END IF;

    -- 2. Row exists: Inspect status with row lock FOR UPDATE
    SELECT * INTO v_existing
    FROM provider_webhook_events
    WHERE provider = p_provider AND event_id = p_event_id
    FOR UPDATE;

    -- Case A: Completed / Processed -> Idempotent skip (Do NOT process)
    IF v_existing.status IN ('completed', 'processed') THEN
        RETURN QUERY SELECT false, 'completed'::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Event already completed (idempotent duplicate)'::TEXT;
        RETURN;
    END IF;

    -- Case B: Currently Claimed or Processing
    IF v_existing.status IN ('claimed', 'processing') THEN
        IF v_existing.claim_expires_at IS NOT NULL AND v_existing.claim_expires_at > v_now THEN
            -- Active lease owned by another concurrent worker
            RETURN QUERY SELECT false, 'in_flight'::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Event currently locked by active worker'::TEXT;
            RETURN;
        ELSE
            -- Lease expired (worker crashed or timed out) -> Reclaim safely
            UPDATE provider_webhook_events
            SET status = 'claimed',
                claim_expires_at = v_lease_expiry,
                attempt_count = COALESCE(v_existing.attempt_count, 1) + 1,
                worker_id = p_worker_id,
                organization_id = COALESCE(p_org_id, v_existing.organization_id),
                error_message = 'Reclaimed after previous claim lease expired'
            WHERE provider = p_provider AND event_id = p_event_id;

            RETURN QUERY SELECT true, 'claimed_expired_lease'::TEXT, v_existing.organization_id, COALESCE(v_existing.attempt_count, 1) + 1, 'Reclaimed expired worker lease'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Case C: Failed previously -> Allow retry up to 5 attempts
    IF v_existing.status = 'failed' THEN
        IF COALESCE(v_existing.attempt_count, 1) < 5 THEN
            UPDATE provider_webhook_events
            SET status = 'claimed',
                claim_expires_at = v_lease_expiry,
                attempt_count = COALESCE(v_existing.attempt_count, 1) + 1,
                worker_id = p_worker_id,
                organization_id = COALESCE(p_org_id, v_existing.organization_id)
            WHERE provider = p_provider AND event_id = p_event_id;

            RETURN QUERY SELECT true, 'claimed_retry'::TEXT, v_existing.organization_id, COALESCE(v_existing.attempt_count, 1) + 1, 'Claimed retry for failed event'::TEXT;
            RETURN;
        ELSE
            RETURN QUERY SELECT false, 'failed_exhausted'::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Maximum retry limit exhausted'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Default fallback
    RETURN QUERY SELECT false, v_existing.status::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Event cannot be claimed'::TEXT;
END;
$$;

-- 3.3 Atomic Complete Function
CREATE OR REPLACE FUNCTION complete_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_org_id UUID DEFAULT NULL,
    p_raw_payload JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE provider_webhook_events
    SET status = 'completed',
        claim_expires_at = NULL,
        processed_at = clock_timestamp(),
        organization_id = COALESCE(p_org_id, organization_id),
        raw_payload = COALESCE(p_raw_payload, raw_payload)
    WHERE provider = p_provider AND event_id = p_event_id;
END;
$$;

-- 3.4 Atomic Fail Function
CREATE OR REPLACE FUNCTION fail_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_error_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE provider_webhook_events
    SET status = 'failed',
        claim_expires_at = NULL,
        error_message = p_error_message
    WHERE provider = p_provider AND event_id = p_event_id;
END;
$$;

-- 3.5 Permissions for Webhook Engine Functions
REVOKE EXECUTE ON FUNCTION claim_provider_webhook_event FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION claim_provider_webhook_event TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION complete_provider_webhook_event FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION complete_provider_webhook_event TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION fail_provider_webhook_event FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION fail_provider_webhook_event TO authenticated, service_role;




-- ============================================================================
-- FILE: supabase\migrations\008_workflow_stats_hardening_and_idempotency.sql
-- ============================================================================

-- ==============================================================================
-- STARX-FLOW — MIGRATION 008: WORKFLOW STATS HARDENING & OUTBOUND LEASE FENCING
-- Phase 4B.5.5 Finding A & Finding B Remediation:
--   1. Corrects Migration 007 typo: hardens public.increment_workflow_stats(uuid, numeric)
--   2. Enforces explicit search_path = public, pg_temp and role-based execution privileges
--   3. Adds database-backed lease fencing verification for distributed background workers
--   4. Adds outbound idempotency key tracking to provider_webhook_events
-- ==============================================================================

-- 1. ROLE PRE-CHECK FOR LOCAL WASM & CONTAINER TESTING
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END $$;

-- ==============================================================================
-- 2. HARDEN INCREMENT_WORKFLOW_STATS (Finding A)
-- Fails loudly if the function does not exist, resolving the Migration 007 silent skip defect
-- ==============================================================================

DO $$
DECLARE
    v_fn_exists BOOLEAN;
BEGIN
    -- Verify function existence with exact parameter signature (uuid, numeric)
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.proname = 'increment_workflow_stats'
    ) INTO v_fn_exists;

    IF NOT v_fn_exists THEN
        RAISE EXCEPTION 'CRITICAL INTEGRITY FAILURE: Expected function public.increment_workflow_stats does not exist in schema. Migration cannot proceed.';
    END IF;
END $$;

-- Recreate with explicit search path, multi-tenant caller verification, and security definer
CREATE OR REPLACE FUNCTION public.increment_workflow_stats(wf_id uuid, hours numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Authorization gate: service_role or owner of workflow
    IF coalesce(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
        IF auth.uid() IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.workflows
            WHERE id = wf_id AND user_id = auth.uid()
        ) THEN
            RAISE EXCEPTION 'UNAUTHORIZED: You do not have permission to increment stats for this workflow.';
        END IF;
    END IF;

    UPDATE public.workflows
    SET executions_count = coalesce(executions_count, 0) + 1,
        saved_hours = coalesce(saved_hours, 0) + hours
    WHERE id = wf_id;
END;
$$;

-- Explicit search path setting and privilege restriction
ALTER FUNCTION public.increment_workflow_stats(uuid, numeric) SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.increment_workflow_stats(uuid, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_workflow_stats(uuid, numeric) FROM anon;

GRANT EXECUTE ON FUNCTION public.increment_workflow_stats(uuid, numeric) TO authenticated, service_role;

-- Grant table permissions to authenticated role aligned with RLS policies
GRANT ALL ON public.workflows TO authenticated, service_role;
REVOKE ALL ON public.workflows FROM anon;

-- Clean up dead function name reference from Migration 007 if it was created
DROP FUNCTION IF EXISTS public.increment_workflow_runs(uuid);

-- ==============================================================================
-- 3. OUTBOUND LEASE FENCING & IDEMPOTENCY TRACKING (Finding B)
-- ==============================================================================

-- 3.1 Add outbound_idempotency_key column to provider_webhook_events
ALTER TABLE public.provider_webhook_events
ADD COLUMN IF NOT EXISTS outbound_idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS worker_id TEXT;

CREATE INDEX IF NOT EXISTS idx_provider_webhooks_idempotency
ON public.provider_webhook_events(provider, outbound_idempotency_key)
WHERE outbound_idempotency_key IS NOT NULL;

-- 3.2 Lease Fencing Verification Function
-- Allows background workers to verify they still hold a valid, active lease before
-- dispatching external non-reversible side-effects (e.g. sending emails via Resend).
CREATE OR REPLACE FUNCTION public.verify_provider_webhook_lease(
    p_provider TEXT,
    p_event_id TEXT,
    p_worker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_valid BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.provider_webhook_events
        WHERE provider = p_provider
          AND event_id = p_event_id
          AND worker_id = p_worker_id
          AND status IN ('claimed', 'processing')
          AND (claim_expires_at IS NULL OR claim_expires_at > clock_timestamp())
    ) INTO v_is_valid;

    RETURN COALESCE(v_is_valid, false);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) FROM anon;

GRANT EXECUTE ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 3.3 Enhanced Atomic Complete Function with Outbound Idempotency Key
CREATE OR REPLACE FUNCTION public.complete_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_org_id UUID DEFAULT NULL,
    p_raw_payload JSONB DEFAULT NULL,
    p_outbound_idempotency_key TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.provider_webhook_events
    SET status = 'completed',
        claim_expires_at = NULL,
        processed_at = clock_timestamp(),
        organization_id = COALESCE(p_org_id, organization_id),
        raw_payload = COALESCE(p_raw_payload, raw_payload),
        outbound_idempotency_key = COALESCE(p_outbound_idempotency_key, outbound_idempotency_key)
    WHERE provider = p_provider AND event_id = p_event_id;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) FROM anon;

GRANT EXECUTE ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) TO authenticated, service_role;




-- ============================================================================
-- FILE: supabase\migrations\009_receptionist_chat_operations.sql
-- ============================================================================

-- ==============================================================================
-- STARX-FLOW — MIGRATION 009: 24/7 AI RECEPTIONIST CHAT OPERATIONS & DURABLE JOBS
-- Implements:
--   1. Structured business receptionist profiles (services, prices, hours, FAQs, policies)
--   2. Durable receptionist jobs table (appointment reminders, follow-ups, delivery retries)
--   3. Atomic job claim function with FOR UPDATE SKIP LOCKED & lease fencing
--   4. Human handoff conversation control mode tracking
-- ==============================================================================

-- 1. ROLE PRE-CHECK FOR LOCAL WASM & CONTAINER TESTING
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END $$;

-- ==============================================================================
-- 2. BUSINESS RECEPTIONIST PROFILES
-- Stores verified business facts for zero-hallucination AI responses
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.business_receptionist_profiles (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    description TEXT,
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    opening_hours JSONB NOT NULL DEFAULT '{
        "monday": {"open": "09:00", "close": "18:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
        "thursday": {"open": "09:00", "close": "18:00", "closed": false},
        "friday": {"open": "09:00", "close": "18:00", "closed": false},
        "saturday": {"open": "10:00", "close": "16:00", "closed": false},
        "sunday": {"closed": true}
    }'::jsonb,
    timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
    location TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
    policies JSONB NOT NULL DEFAULT '{
        "cancellation": "24 hours advance notice required",
        "refunds": "Subject to review by management",
        "booking_rules": "Appointments must be scheduled at least 2 hours in advance"
    }'::jsonb,
    supported_languages TEXT[] NOT NULL DEFAULT ARRAY['en', 'de', 'fr', 'it'],
    custom_instructions TEXT,
    handoff_rules TEXT DEFAULT 'Transfer when customer is upset, requests a manager, or asks complex custom questions',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.business_receptionist_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_profiles_org_policy ON public.business_receptionist_profiles;
CREATE POLICY business_profiles_org_policy ON public.business_receptionist_profiles
FOR ALL TO authenticated, service_role
USING (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

GRANT ALL ON public.business_receptionist_profiles TO authenticated, service_role;
REVOKE ALL ON public.business_receptionist_profiles FROM PUBLIC, anon;

-- ==============================================================================
-- 3. CONVERSATIONS CONTROL MODE (HUMAN HANDOFF ENFORCEMENT)
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'conversations' 
          AND column_name = 'control_mode'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN control_mode TEXT NOT NULL DEFAULT 'ai' 
            CHECK (control_mode IN ('ai', 'human'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'conversations' 
          AND column_name = 'handoff_reason'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN handoff_reason TEXT;
    END IF;
END $$;

-- ==============================================================================
-- 4. DURABLE RECEPTIONIST JOBS (BACKGROUND SCHEDULING)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.receptionist_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('appointment_reminder', 'lead_followup', 'delivery_retry', 'delayed_notification')),
    target_id TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'email', 'web')),
    recipient TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    claim_expires_at TIMESTAMPTZ,
    worker_id TEXT,
    idempotency_key TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.receptionist_jobs ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS uq_receptionist_jobs_idempotency
ON public.receptionist_jobs(organization_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_receptionist_jobs_polling
ON public.receptionist_jobs(status, scheduled_for)
WHERE status IN ('pending', 'failed');

DROP POLICY IF EXISTS receptionist_jobs_org_policy ON public.receptionist_jobs;
CREATE POLICY receptionist_jobs_org_policy ON public.receptionist_jobs
FOR ALL TO authenticated, service_role
USING (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

GRANT ALL ON public.receptionist_jobs TO authenticated, service_role;
REVOKE ALL ON public.receptionist_jobs FROM PUBLIC, anon;

-- ==============================================================================
-- 5. ATOMIC JOB CLAIM FUNCTION (FOR UPDATE SKIP LOCKED)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.claim_receptionist_jobs(
    p_worker_id TEXT,
    p_batch_size INTEGER DEFAULT 1,
    p_lease_seconds INTEGER DEFAULT 60
)
RETURNS SETOF public.receptionist_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH available_jobs AS (
        SELECT id
        FROM public.receptionist_jobs
        WHERE (status = 'pending' AND scheduled_for <= clock_timestamp())
           OR (status = 'processing' AND claim_expires_at < clock_timestamp() AND attempts < max_attempts)
        ORDER BY scheduled_for ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.receptionist_jobs rj
    SET status = 'processing',
        worker_id = p_worker_id,
        attempts = rj.attempts + 1,
        claim_expires_at = clock_timestamp() + (p_lease_seconds || ' seconds')::interval,
        updated_at = clock_timestamp()
    FROM available_jobs aj
    WHERE rj.id = aj.id
    RETURNING rj.*;
END;
$$;

ALTER FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) TO authenticated, service_role;

-- ==============================================================================
-- 6. ATOMIC JOB COMPLETION & FAILURE FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.complete_receptionist_job(
    p_job_id UUID,
    p_worker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_rows_affected INTEGER;
BEGIN
    UPDATE public.receptionist_jobs
    SET status = 'completed',
        completed_at = clock_timestamp(),
        claim_expires_at = NULL,
        updated_at = clock_timestamp()
    WHERE id = p_job_id AND worker_id = p_worker_id AND status = 'processing';

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    RETURN v_rows_affected > 0;
END;
$$;

ALTER FUNCTION public.complete_receptionist_job(UUID, TEXT) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.complete_receptionist_job(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_receptionist_job(UUID, TEXT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fail_receptionist_job(
    p_job_id UUID,
    p_worker_id TEXT,
    p_error TEXT,
    p_retry_delay_seconds INTEGER DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_attempts INTEGER;
    v_max_attempts INTEGER;
BEGIN
    SELECT attempts, max_attempts INTO v_attempts, v_max_attempts
    FROM public.receptionist_jobs
    WHERE id = p_job_id;

    IF v_attempts >= v_max_attempts THEN
        -- Permanent failure
        UPDATE public.receptionist_jobs
        SET status = 'failed',
            last_error = p_error,
            claim_expires_at = NULL,
            updated_at = clock_timestamp()
        WHERE id = p_job_id AND worker_id = p_worker_id;
    ELSE
        -- Reschedule with exponential backoff
        UPDATE public.receptionist_jobs
        SET status = 'pending',
            last_error = p_error,
            claim_expires_at = NULL,
            scheduled_for = clock_timestamp() + (p_retry_delay_seconds || ' seconds')::interval,
            updated_at = clock_timestamp()
        WHERE id = p_job_id AND worker_id = p_worker_id;
    END IF;

    RETURN true;
END;
$$;

ALTER FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) TO authenticated, service_role;

-- ============================================================================
-- FINAL PRIVILEGES & POSTGREST SCHEMA CACHE REFRESH
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';




