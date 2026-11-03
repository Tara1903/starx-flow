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
