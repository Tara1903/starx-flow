-- ============================================================================
-- 011_demo_requests_and_lead_capture.sql
-- Phase 6: Global Market Activation & Lead Capture Infrastructure
-- ============================================================================

create table if not exists demo_requests (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  work_email text not null,
  phone text,
  business_name text not null,
  business_type text not null,
  business_size text not null,
  primary_need text not null,
  preferred_contact text default 'email' check (preferred_contact in ('email', 'whatsapp', 'phone')),
  website text,
  notes text,
  ip_address text,
  status text default 'new' check (status in ('new', 'contacted', 'scheduled', 'completed', 'disqualified', 'converted')),
  consent_given boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table demo_requests enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Service role has full access to demo requests" on demo_requests;
drop policy if exists "Admins can view demo requests" on demo_requests;
drop policy if exists "Anyone can submit a demo request" on demo_requests;

-- Service role / Admin access
create policy "Service role has full access to demo requests"
  on demo_requests
  for all
  to service_role
  using (true)
  with check (true);

-- Authenticated admins can view demo requests
create policy "Admins can view demo requests"
  on demo_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.user_id = (select auth.uid())
      and organization_members.role in ('owner', 'admin')
    )
  );

-- Public / Anonymous can insert with non-empty required fields
create policy "Anyone can submit a demo request"
  on demo_requests
  for insert
  to anon, authenticated
  with check (
    length(full_name) >= 2 and
    length(work_email) >= 5 and
    length(business_name) >= 2 and
    consent_given = true
  );

-- Indexes for performance and lead management
create index if not exists idx_demo_requests_email on demo_requests(work_email);
create index if not exists idx_demo_requests_status on demo_requests(status);
create index if not exists idx_demo_requests_created_at on demo_requests(created_at desc);
