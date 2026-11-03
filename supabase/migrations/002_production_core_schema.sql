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
