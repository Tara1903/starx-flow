-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create table profiles (
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
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, business_name, owner_name, email)
  values (new.id, 'My Business', 'Owner', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Workflows
create table workflows (
  id uuid default uuid_generate_v4() primary key,
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
create policy "Users can view own workflows" on workflows for select using (auth.uid() = user_id);
create policy "Users can insert own workflows" on workflows for insert with check (auth.uid() = user_id);
create policy "Users can update own workflows" on workflows for update using (auth.uid() = user_id);
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
create table connected_channels (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  channel_key text not null,
  is_connected boolean default false,
  credentials jsonb default '{}'::jsonb,
  last_synced timestamptz,
  unique (user_id, channel_key)
);
alter table connected_channels enable row level security;
create policy "Users can view own channels" on connected_channels for select using (auth.uid() = user_id);
create policy "Users can insert own channels" on connected_channels for insert with check (auth.uid() = user_id);
create policy "Users can update own channels" on connected_channels for update using (auth.uid() = user_id);

-- 4. Execution Logs
create table execution_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  workflow_id uuid references workflows(id),
  type text not null,
  channel text,
  message text,
  timestamp timestamptz default now()
);
alter table execution_logs enable row level security;
create policy "Users can view own logs" on execution_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on execution_logs for insert with check (auth.uid() = user_id);

-- 5. Agents
create table agents (
  id uuid default uuid_generate_v4() primary key,
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
create policy "Users can view own agents" on agents for select using (auth.uid() = user_id);
create policy "Users can insert own agents" on agents for insert with check (auth.uid() = user_id);
create policy "Users can update own agents" on agents for update using (auth.uid() = user_id);

-- 6. Agent Memories
create table agent_memories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  lead_id text,
  key text not null,
  value text,
  created_at timestamptz default now(),
  unique (user_id, lead_id, key)
);
alter table agent_memories enable row level security;
create policy "Users can view own agent memories" on agent_memories for select using (auth.uid() = user_id);
create policy "Users can insert own agent memories" on agent_memories for insert with check (auth.uid() = user_id);
create policy "Users can update own agent memories" on agent_memories for update using (auth.uid() = user_id);
create policy "Users can delete own agent memories" on agent_memories for delete using (auth.uid() = user_id);

-- 7. Business Goals
create table business_goals (
  id uuid default uuid_generate_v4() primary key,
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
create policy "Users can view own business goals" on business_goals for select using (auth.uid() = user_id);
create policy "Users can insert own business goals" on business_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own business goals" on business_goals for update using (auth.uid() = user_id);
create policy "Users can delete own business goals" on business_goals for delete using (auth.uid() = user_id);

-- 8. Business Memories
create table business_memories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  key text not null,
  value text,
  category text default 'general',
  created_at timestamptz default now()
);
alter table business_memories enable row level security;
create policy "Users can view own business memories" on business_memories for select using (auth.uid() = user_id);
create policy "Users can insert own business memories" on business_memories for insert with check (auth.uid() = user_id);
create policy "Users can update own business memories" on business_memories for update using (auth.uid() = user_id);
create policy "Users can delete own business memories" on business_memories for delete using (auth.uid() = user_id);

-- 9. Calls
create table calls (
  id uuid default uuid_generate_v4() primary key,
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
create policy "Users can view own calls" on calls for select using (auth.uid() = user_id);
create policy "Users can insert own calls" on calls for insert with check (auth.uid() = user_id);
create policy "Users can update own calls" on calls for update using (auth.uid() = user_id);

-- 10. Subscriptions
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
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
-- Using Service Role to bypass RLS, but we can allow users to read their own
alter table subscriptions enable row level security;
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);

-- 11. Invoices
create table invoices (
  id uuid default uuid_generate_v4() primary key,
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
create policy "Users can view own invoices" on invoices for select using (auth.uid() = user_id);

-- 12. Job Queue
create table job_queue (
  id uuid default uuid_generate_v4() primary key,
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
-- No user policies since job queue is processed by service role

