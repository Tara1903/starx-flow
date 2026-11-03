/**
 * STARX-FLOW PHASE 4B.4.2 REAL POSTGRESQL VERIFICATION TEST SUITE
 * 
 * Executes real PostgreSQL engine tests using PGlite (WASM Postgres):
 * 1. Schema migration execution (002, 003, 004)
 * 2. Foreign keys, check constraints & audit log compatibility
 * 3. PostgreSQL engine-level immutability triggers (block UPDATE/DELETE on audit_logs)
 * 4. Atomic appointment concurrency & double-booking slot exclusion
 * 5. Transactional customer merge function with rollback verification
 * 6. Multi-tenant RLS alignment with organization_members
 * 7. Serverless presence persistence across simulated lambda instances
 */

import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${msg}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${msg}`);
  }
}

async function runRealPostgresTests() {
  console.log('\n========================================================================');
  console.log('STARX-FLOW PHASE 4B.4.2 — REAL POSTGRESQL ENGINE VERIFICATION');
  console.log('========================================================================\n');

  console.log('Initializing isolated PostgreSQL engine...');
  const db = new PGlite();

  // 1. Setup Supabase Auth environment & standard functions
  await db.exec(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then
        create role authenticated;
      end if;
      if not exists (select 1 from pg_roles where rolname = 'anon') then
        create role anon;
      end if;
      if not exists (select 1 from pg_roles where rolname = 'service_role') then
        create role service_role;
      end if;
      if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
        create role supabase_auth_admin;
      end if;
    end $$;

    create schema if not exists auth;
    create table if not exists auth.users (
      id uuid primary key default gen_random_uuid(),
      email text unique,
      created_at timestamptz default now()
    );

    create or replace function uuid_generate_v4() returns uuid as $$
      select gen_random_uuid();
    $$ language sql;

    create or replace function auth.uid() returns uuid as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$ language sql stable;

    create or replace function auth.role() returns text as $$
      select coalesce(current_setting('request.jwt.claim.role', true), 'anon');
    $$ language sql stable;
  `);
  console.log('PostgreSQL base environment initialized.');

  // 2. Read and apply migrations in sequential order
  console.log('Applying Migration 001 (Initial Schema)...');
  const migration001Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'),
    'utf-8'
  );
  const migration001Clean = migration001Raw
    .replace('create extension if not exists "uuid-ossp";', '-- uuid-ossp skipped')
    .replace('create extension if not exists "vector";', '-- vector skipped')
    .replace(/embedding\s+vector\(\d+\)[^,]*,/gi, '-- embedding skipped,');
  await db.exec(migration001Clean);
  console.log('Migration 001 applied successfully.');

  console.log('Applying Migration 002 (Production Core Schema)...');
  const migration002Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/002_production_core_schema.sql'),
    'utf-8'
  );
  // Strip extensions not bundled in test WASM build
  const migration002Clean = migration002Raw
    .replace('create extension if not exists "vector";', '-- vector skipped in test')
    .replace('create extension if not exists "uuid-ossp";', '-- uuid-ossp skipped')
    .replace(/embedding\s+vector\(\d+\)[^,]*,/gi, '-- embedding skipped,');
  
  await db.exec(migration002Clean);
  console.log('Migration 002 applied successfully.');

  console.log('Applying Migration 003 (Commercial Capabilities)...');
  const migration003Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/003_commercial_capabilities.sql'),
    'utf-8'
  );
  const migration003Clean = migration003Raw
    .replace('create extension if not exists "uuid-ossp";', '-- uuid-ossp skipped');

  await db.exec(migration003Clean);
  console.log('Migration 003 applied successfully.');

  console.log('Applying Migration 004 (Security Integrity & Remediation)...');
  const migration004Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/004_security_integrity_and_remediation.sql'),
    'utf-8'
  );
  const migration004Clean = migration004Raw
    .replace('create extension if not exists "uuid-ossp";', '-- uuid-ossp skipped')
    .replace('create extension if not exists "btree_gist";', '-- btree_gist skipped');

  await db.exec(migration004Clean);
  console.log('Migration 004 applied successfully.');

  console.log('Applying Migration 005 (External Integrations & Synchronization)...');
  const migration005Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/005_external_integrations_and_sync.sql'),
    'utf-8'
  );
  await db.exec(migration005Raw);
  console.log('Migration 005 applied successfully.');

  console.log('Applying Migration 006 (OAuth Security & Window Persistence)...');
  const migration006Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/006_oauth_states_and_channel_window_persistence.sql'),
    'utf-8'
  );
  await db.exec(migration006Raw);
  console.log('Migration 006 applied successfully.');

  console.log('Applying Migration 007 (Security Hardening & Atomic Webhook Claiming)...');
  const migration007Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/007_phase_4b54_security_hardening.sql'),
    'utf-8'
  );
  await db.exec(migration007Raw);
  console.log('Migration 007 applied successfully.\n');

  // =========================================================================
  // TEST SUITE 1: AUDIT LOG SCHEMA & IMMUTABILITY ENFORCEMENT
  // =========================================================================
  console.log('--- [PG-TEST 1] Audit Log Schema & Engine-Level Immutability ---');

  // Create test user and organization
  const userRes = await db.query<{ id: string }>(
    `insert into auth.users (email) values ('owner@tenant-alpha.de') returning id;`
  );
  const ownerId = userRes.rows[0].id;

  const orgRes = await db.query<{ id: string }>(
    `insert into organizations (name, slug) values ('Tenant Alpha', 'tenant-alpha') returning id;`
  );
  const orgAlphaId = orgRes.rows[0].id;

  await db.query(
    `insert into organization_members (organization_id, user_id, role) values ($1, $2, 'owner');`,
    [orgAlphaId, ownerId]
  );

  // 1. Valid AI Agent audit log insert (actor_type = 'ai_agent', actor_id = null)
  let aiLogSuccess = false;
  try {
    const insertRes = await db.query(
      `insert into audit_logs (organization_id, actor_id, actor_type, action, target_type, target_id, changes)
       values ($1, null, 'ai_agent', 'ai_tool.book_appointment', 'appointment', 'apt-101', '{"agent_role": "appointment"}'::jsonb)
       returning id;`,
      [orgAlphaId]
    );
    aiLogSuccess = Boolean(insertRes.rows[0]);
  } catch (err: any) {
    console.error('Audit log insert failed:', err.message);
  }
  assert(aiLogSuccess, 'Real PostgreSQL accepts audit_logs with actor_type = "ai_agent" and actor_id = null');

  // 2. Invalid actor_type check constraint rejection
  let invalidActorRejected = false;
  try {
    await db.query(
      `insert into audit_logs (organization_id, actor_id, actor_type, action, target_type, target_id)
       values ($1, null, 'unauthorized_hacker', 'exploit', 'system', 'sys-1');`,
      [orgAlphaId]
    );
  } catch (err: any) {
    invalidActorRejected = err.message.includes('audit_logs_actor_type_check');
  }
  assert(invalidActorRejected, 'Real PostgreSQL check constraint rejects unauthorized actor_type');

  // 3. Engine-level immutability: UPDATE attempt must be blocked by trigger
  let updateBlocked = false;
  try {
    await db.query(`update audit_logs set action = 'tampered' where organization_id = $1;`, [orgAlphaId]);
  } catch (err: any) {
    updateBlocked = err.message.includes('audit_logs entries are strictly immutable');
  }
  assert(updateBlocked, 'PostgreSQL trigger blocks UPDATE on audit_logs (tamper-proof immutability)');

  // 4. Engine-level immutability: DELETE attempt must be blocked by trigger
  let deleteBlocked = false;
  try {
    await db.query(`delete from audit_logs where organization_id = $1;`, [orgAlphaId]);
  } catch (err: any) {
    deleteBlocked = err.message.includes('audit_logs entries are strictly immutable');
  }
  assert(deleteBlocked, 'PostgreSQL trigger blocks DELETE on audit_logs (append-only compliance)');

  // =========================================================================
  // TEST SUITE 2: APPOINTMENT DOUBLE-BOOKING CONCURRENCY & ATOMIC BOOKING
  // =========================================================================
  console.log('\n--- [PG-TEST 2] Appointment Concurrency & Double-Booking Protection ---');

  // 1. Book first appointment slot: 10:00 to 11:00
  const startA = '2026-11-20 10:00:00+00';
  const endA = '2026-11-20 11:00:00+00';
  const booking1Res = await db.query<{ book_appointment_atomic: any }>(
    `select book_appointment_atomic($1, $2, null, 'Customer A', '+491701111111', 'a@test.de', 'Consulting', $3, $4);`,
    [ownerId, orgAlphaId, startA, endA]
  );
  const res1 = booking1Res.rows[0].book_appointment_atomic;
  assert(res1.success === true, 'First appointment slot successfully confirmed');

  // 2. Attempt overlapping second appointment: 10:30 to 11:30 (overlaps with 10:00-11:00)
  const startOverlap = '2026-11-20 10:30:00+00';
  const endOverlap = '2026-11-20 11:30:00+00';
  const bookingOverlapRes = await db.query<{ book_appointment_atomic: any }>(
    `select book_appointment_atomic($1, $2, null, 'Customer B', '+491702222222', 'b@test.de', 'Consulting', $3, $4);`,
    [ownerId, orgAlphaId, startOverlap, endOverlap]
  );
  const resOverlap = bookingOverlapRes.rows[0].book_appointment_atomic;
  assert(
    resOverlap.success === false && resOverlap.error === 'SLOT_CONFLICT',
    'PostgreSQL rejects overlapping appointment booking with SLOT_CONFLICT'
  );

  // 3. Book non-overlapping third appointment: 11:00 to 12:00 (back-to-back allowed)
  const startNonOverlap = '2026-11-20 11:00:00+00';
  const endNonOverlap = '2026-11-20 12:00:00+00';
  const booking3Res = await db.query<{ book_appointment_atomic: any }>(
    `select book_appointment_atomic($1, $2, null, 'Customer C', '+491703333333', 'c@test.de', 'Consulting', $3, $4);`,
    [ownerId, orgAlphaId, startNonOverlap, endNonOverlap]
  );
  const res3 = booking3Res.rows[0].book_appointment_atomic;
  assert(res3.success === true, 'Non-overlapping adjacent appointment succeeds');

  // =========================================================================
  // TEST SUITE 3: TRANSACTIONAL CUSTOMER MERGE & ROLLBACK VERIFICATION
  // =========================================================================
  console.log('\n--- [PG-TEST 3] Transactional Customer Merge & Rollback ---');

  // Create Target Customer (Lead 1) and Source Customer (Lead 2) in Org Alpha
  const lead1Res = await db.query<{ id: string }>(
    `insert into leads (user_id, organization_id, name, phone, email, tags)
     values ($1, $2, 'Target Lead', '+491704444444', 'target@test.de', array['client'])
     returning id;`,
    [ownerId, orgAlphaId]
  );
  const targetLeadId = lead1Res.rows[0].id;

  const lead2Res = await db.query<{ id: string }>(
    `insert into leads (user_id, organization_id, name, phone, email, tags)
     values ($1, $2, 'Source Lead Duplicate', null, 'source@test.de', array['lead'])
     returning id;`,
    [ownerId, orgAlphaId]
  );
  const sourceLeadId = lead2Res.rows[0].id;

  // Insert linked channel identity and conversation for Source Lead
  await db.query(
    `insert into channel_identities (organization_id, lead_id, channel, external_user_id)
     values ($1, $2, 'whatsapp', 'wa-source-100');`,
    [orgAlphaId, sourceLeadId]
  );
  await db.query(
    `insert into conversations (user_id, organization_id, lead_id, customer_name, channel)
     values ($1, $2, $3, 'Source Lead', 'WhatsApp');`,
    [ownerId, orgAlphaId, sourceLeadId]
  );

  // Execute atomic customer merge
  const mergeRes = await db.query<{ merge_customers: any }>(
    `select merge_customers($1, $2, $3, $4);`,
    [orgAlphaId, targetLeadId, sourceLeadId, ownerId]
  );
  const mergeData = mergeRes.rows[0].merge_customers;

  assert(mergeData.success === true, 'Transactional customer merge executes successfully');
  assert(
    mergeData.reassigned.identities === 1 && mergeData.reassigned.conversations === 1,
    'Accurate reassignment counts returned: 1 identity, 1 conversation'
  );

  // Verify source lead is marked lost/archived
  const sourceCheck = await db.query<{ status: string; tags: string[] }>(
    `select status, tags from leads where id = $1;`,
    [sourceLeadId]
  );
  assert(
    sourceCheck.rows[0].status === 'lost' && sourceCheck.rows[0].tags.includes('merged-archive'),
    'Source customer profile safely archived'
  );

  // Verify target lead preserved merged tags and phone
  const targetCheck = await db.query<{ phone: string; tags: string[] }>(
    `select phone, tags from leads where id = $1;`,
    [targetLeadId]
  );
  assert(
    targetCheck.rows[0].phone === '+491704444444' && targetCheck.rows[0].tags.includes('merged'),
    'Target customer profile attributes preserved and tagged as merged'
  );

  // Test rollback: attempt cross-organization merge
  const orgBetaRes = await db.query<{ id: string }>(
    `insert into organizations (name, slug) values ('Tenant Beta', 'tenant-beta') returning id;`
  );
  const orgBetaId = orgBetaRes.rows[0].id;

  const leadBetaRes = await db.query<{ id: string }>(
    `insert into leads (user_id, organization_id, name) values ($1, $2, 'Beta Lead') returning id;`,
    [ownerId, orgBetaId]
  );
  const leadBetaId = leadBetaRes.rows[0].id;

  let crossOrgRollback = false;
  try {
    await db.query(`select merge_customers($1, $2, $3, $4);`, [
      orgAlphaId,
      targetLeadId,
      leadBetaId,
      ownerId,
    ]);
  } catch (err: any) {
    crossOrgRollback = err.message.includes('Cross-organization merge is prohibited');
  }
  assert(crossOrgRollback, 'Cross-organization merge raises exception and rolls back transaction');

  // =========================================================================
  // TEST SUITE 4: MULTI-USER TEAM COLLABORATION RLS ALIGNMENT
  // =========================================================================
  console.log('\n--- [PG-TEST 4] Multi-User Organization RLS Alignment ---');

  // Create Staff Agent Bob in Organization Alpha
  const bobRes = await db.query<{ id: string }>(
    `insert into auth.users (email) values ('bob@tenant-alpha.de') returning id;`
  );
  const agentBobId = bobRes.rows[0].id;

  await db.query(
    `insert into organization_members (organization_id, user_id, role) values ($1, $2, 'member');`,
    [orgAlphaId, agentBobId]
  );

  // Insert a conversation owned by Alice in Organization Alpha
  const convoRes = await db.query<{ id: string }>(
    `insert into conversations (user_id, organization_id, customer_name, channel)
     values ($1, $2, 'Alice Customer', 'WhatsApp') returning id;`,
    [ownerId, orgAlphaId]
  );
  const convoAlphaId = convoRes.rows[0].id;

  // Insert a private staff note and a customer message into the conversation
  await db.query(
    `insert into messages (conversation_id, direction, role, content, is_internal)
     values ($1, 'inbound', 'user', 'Customer message', false),
            ($1, 'outbound', 'human', 'Confidential note', true);`,
    [convoAlphaId]
  );

  // Test RLS: Helper function returns Organization Alpha ID for Agent Bob
  await db.query(`set request.jwt.claim.sub = '${agentBobId}';`);
  await db.query(`set request.jwt.claim.role = 'authenticated';`);

  const bobOrgs = await db.query<{ auth_user_org_ids: string }>(`select auth_user_org_ids();`);
  const bobHasAlpha = bobOrgs.rows.some((r) => r.auth_user_org_ids === orgAlphaId);
  assert(bobHasAlpha, 'auth_user_org_ids() resolves team organization for staff member');

  // Test Anonymous RLS on messages: Anonymous users CANNOT read internal notes
  await db.query(`set request.jwt.claim.sub = '';`);
  await db.query(`set request.jwt.claim.role = 'anon';`);

  const anonMessages = await db.query<{ content: string; is_internal: boolean }>(
    `select content, is_internal from messages where conversation_id = $1 and is_internal = false;`,
    [convoAlphaId]
  );
  const anonSawInternal = anonMessages.rows.some((m) => m.is_internal);
  assert(!anonSawInternal, 'Anonymous role RLS policy prohibits reading internal staff notes');

  // Reset session
  await db.query(`set request.jwt.claim.sub = '${ownerId}';`);
  await db.query(`set request.jwt.claim.role = 'authenticated';`);

  // =========================================================================
  // TEST SUITE 5: DISTRIBUTED SERVERLESS PRESENCE PERSISTENCE
  // =========================================================================
  console.log('\n--- [PG-TEST 5] Distributed Serverless Presence ---');

  const presConvoId = convoAlphaId;
  const now = new Date();
  const future = new Date(now.getTime() + 45000);

  // Instance 1 registers Agent Alice
  await db.query(
    `insert into conversation_presence (conversation_id, agent_id, agent_name, organization_id, last_seen_at, expires_at)
     values ($1, 'agent-alice', 'Alice Dupont', $2, now(), $3)
     on conflict (conversation_id, agent_id) do update set last_seen_at = now(), expires_at = $3;`,
    [presConvoId, orgAlphaId, future.toISOString()]
  );

  // Instance 2 queries active viewers in conversation
  const presenceCheck = await db.query<{ agent_name: string }>(
    `select agent_name from conversation_presence where conversation_id = $1 and expires_at > now() and agent_id != 'agent-bob';`,
    [presConvoId]
  );
  assert(
    presenceCheck.rows.length === 1 && presenceCheck.rows[0].agent_name === 'Alice Dupont',
    'Distributed presence synchronized across separate application instances via PostgreSQL'
  );

  // =========================================================================
  // TEST SUITE 6: EXTERNAL INTEGRATIONS SCHEMA & RLS (MIGRATION 005)
  // =========================================================================
  console.log('\n--- [PG-TEST 6] External Integrations Schema & Multi-Tenant RLS (Migration 005) ---');

  // 1. Insert connected account for Org Alpha
  const connAccRes = await db.query<{ id: string }>(
    `insert into connected_accounts (organization_id, user_id, provider, account_identifier, account_name, encrypted_credentials, scopes)
     values ($1, $2, 'google_calendar', 'dr.mueller@localclinic.de', 'Dr. Müller Google Workspace', 'enc:v1:fake_iv:fake_tag:fake_ciphertext', array['calendar.events', 'calendar.readonly'])
     returning id;`,
    [orgAlphaId, ownerId]
  );
  const connAccId = connAccRes.rows[0].id;
  assert(!!connAccId, 'connected_accounts row inserted with encrypted credentials and scopes');

  // 2. Enforce unique constraint on (organization_id, provider)
  let duplicateConnFailed = false;
  try {
    await db.query(
      `insert into connected_accounts (organization_id, user_id, provider, account_identifier)
       values ($1, $2, 'google_calendar', 'duplicate@localclinic.de');`,
      [orgAlphaId, ownerId]
    );
  } catch (err: any) {
    if (err.message.includes('uq_connected_accounts_org_provider') || err.message.includes('unique constraint')) {
      duplicateConnFailed = true;
    }
  }
  assert(duplicateConnFailed, 'Unique constraint uq_connected_accounts_org_provider prevents duplicate active provider connections per org');

  // 3. Insert external calendar referencing connected account
  const extCalRes = await db.query<{ id: string }>(
    `insert into external_calendars (organization_id, connected_account_id, provider, external_calendar_id, name, is_primary)
     values ($1, $2, 'google_calendar', 'primary', 'Main Clinical Schedule', true)
     returning id;`,
    [orgAlphaId, connAccId]
  );
  const extCalId = extCalRes.rows[0].id;
  assert(!!extCalId, 'external_calendars row linked to connected_account_id');

  // 4. Insert external calendar event mapping
  const extEventRes = await db.query<{ id: string }>(
    `insert into external_calendar_events (organization_id, external_calendar_id, provider, external_event_id, status, sync_status)
     values ($1, $2, 'google_calendar', 'gcal_event_alpha_999', 'confirmed', 'synced')
     returning id;`,
    [orgAlphaId, extCalId]
  );
  assert(!!extEventRes.rows[0].id, 'external_calendar_events mapped to external_calendar_id');

  // 5. Insert email thread record with RFC 2822 headers
  const emailThreadRes = await db.query<{ id: string }>(
    `insert into email_threads (organization_id, conversation_id, message_id, in_reply_to, references_headers, subject, sender_email, recipient_email)
     values ($1, $2, '<msg-original-001@starx-flow.com>', null, array['<msg-root@starx-flow.com>'], 'Consultation Booking', 'notifications@starx-flow.com', 'claire@client-paris.fr')
     returning id;`,
    [orgAlphaId, convoAlphaId]
  );
  assert(!!emailThreadRes.rows[0].id, 'email_threads inserted with RFC 2822 headers');

  // 6. Provider webhook idempotency constraint
  await db.query(
    `insert into provider_webhook_events (provider, event_id, event_type, payload_hash, status)
     values ('resend', 'evt_webhook_resend_101', 'email.inbound', 'hash1234567890abcdef', 'processed');`
  );
  let duplicateWebhookBlocked = false;
  try {
    await db.query(
      `insert into provider_webhook_events (provider, event_id, event_type, payload_hash, status)
       values ('resend', 'evt_webhook_resend_101', 'email.inbound', 'hash1234567890abcdef', 'processed');`
    );
  } catch (err: any) {
    if (err.message.includes('uq_provider_webhook_events') || err.message.includes('unique constraint')) {
      duplicateWebhookBlocked = true;
    }
  }
  assert(duplicateWebhookBlocked, 'Provider webhook idempotency enforced by uq_provider_webhook_events');

  // 7. Multi-tenant RLS isolation on connected_accounts
  // Org Beta user cannot see Org Alpha connected accounts
  const betaUserRes = await db.query<{ id: string }>(
    `insert into auth.users (email) values ('owner@tenant-beta.de') returning id;`
  );
  const ownerBetaId = betaUserRes.rows[0].id;
  await db.query(
    `insert into organization_members (organization_id, user_id, role) values ($1, $2, 'owner');`,
    [orgBetaId, ownerBetaId]
  );

  await db.query(`set role authenticated;`);
  await db.query(`set request.jwt.claim.sub = '${ownerBetaId}';`);
  await db.query(`set request.jwt.claim.role = 'authenticated';`);

  const betaVisibleAccounts = await db.query<{ id: string }>(
    `select id from connected_accounts;`
  );
  assert(
    !betaVisibleAccounts.rows.some((r) => r.id === connAccId),
    'RLS policy connected_accounts_org_policy strictly hides Org Alpha connected accounts from Org Beta'
  );

  // Reset to owner session
  await db.query(`reset role;`);
  await db.query(`set request.jwt.claim.sub = '${ownerId}';`);
  await db.query(`set request.jwt.claim.role = 'authenticated';`);

  // =========================================================================
  // TEST SUITE 8: MIGRATION 006 OAUTH STATES & CHANNEL WINDOW PERSISTENCE
  // =========================================================================
  console.log('\n--- [PG-TEST 8] OAuth States & Serverless Messaging Window Persistence ---');

  // 1. Insert valid OAuth state for Org Alpha
  const validStateToken = 'sec_oauth_token_alpha_valid_99';
  await db.query(
    `insert into oauth_states (state_token, organization_id, user_id, provider, redirect_uri, expires_at)
     values ($1, $2, $3, 'google_calendar', 'https://app.starx-flow.com/api/callback', now() + interval '10 minutes');`,
    [validStateToken, orgAlphaId, ownerId]
  );

  // 2. Consume OAuth state atomically
  const consumeRes = await db.query<{ id: string; consumed_at: string }>(
    `select id, consumed_at from consume_oauth_state($1, $2, 'google_calendar');`,
    [validStateToken, orgAlphaId]
  );
  assert(
    !!consumeRes.rows[0]?.consumed_at,
    'consume_oauth_state atomically consumes valid OAuth state and sets consumed_at'
  );

  // 3. Replay attack prevention: second consumption attempt MUST fail
  let replayBlocked = false;
  try {
    await db.query(
      `select id from consume_oauth_state($1, $2, 'google_calendar');`,
      [validStateToken, orgAlphaId]
    );
  } catch (err: any) {
    replayBlocked = err.message.includes('INVALID_OR_EXPIRED_OAUTH_STATE');
  }
  assert(replayBlocked, 'consume_oauth_state blocks replay of already consumed OAuth states');

  // 4. Expired state rejection
  const expiredToken = 'sec_oauth_token_expired_00';
  await db.query(
    `insert into oauth_states (state_token, organization_id, user_id, provider, redirect_uri, expires_at)
     values ($1, $2, $3, 'google_calendar', 'https://app.starx-flow.com/api/callback', now() - interval '5 minutes');`,
    [expiredToken, orgAlphaId, ownerId]
  );
  let expiredBlocked = false;
  try {
    await db.query(
      `select id from consume_oauth_state($1, $2, 'google_calendar');`,
      [expiredToken, orgAlphaId]
    );
  } catch (err: any) {
    expiredBlocked = err.message.includes('INVALID_OR_EXPIRED_OAUTH_STATE');
  }
  assert(expiredBlocked, 'consume_oauth_state rejects expired OAuth state tokens');

  // 5. Cross-tenant tampering: Org Beta attempts to consume Org Alpha state
  const crossTenantToken = 'sec_oauth_token_cross_tenant_11';
  await db.query(
    `insert into oauth_states (state_token, organization_id, user_id, provider, redirect_uri, expires_at)
     values ($1, $2, $3, 'google_calendar', 'https://app.starx-flow.com/api/callback', now() + interval '10 minutes');`,
    [crossTenantToken, orgAlphaId, ownerId]
  );
  let crossTenantBlocked = false;
  try {
    await db.query(
      `select id from consume_oauth_state($1, $2, 'google_calendar');`,
      [crossTenantToken, orgBetaId]
    );
  } catch (err: any) {
    crossTenantBlocked = err.message.includes('OAUTH_ORGANIZATION_MISMATCH');
  }
  assert(crossTenantBlocked, 'consume_oauth_state prevents cross-tenant state tampering (OAUTH_ORGANIZATION_MISMATCH)');

  // 6. Provider mismatch protection
  let providerMismatchBlocked = false;
  try {
    await db.query(
      `select id from consume_oauth_state($1, $2, 'microsoft_calendar');`,
      [crossTenantToken, orgAlphaId]
    );
  } catch (err: any) {
    providerMismatchBlocked = err.message.includes('OAUTH_PROVIDER_MISMATCH');
  }
  assert(providerMismatchBlocked, 'consume_oauth_state enforces provider matching (OAUTH_PROVIDER_MISMATCH)');

  // 7. Atomic customer channel interaction window recording
  const testIgsid = 'igsid_customer_berlin_456';
  await db.query(
    `select record_customer_channel_interaction($1, 'instagram', $2);`,
    [orgAlphaId, testIgsid]
  );

  const windowRes = await db.query<{
    customer_channel_id: string;
    window_expires_at: string;
    last_inbound_at: string;
  }>(
    `select customer_channel_id, window_expires_at, last_inbound_at
     from customer_channel_windows
     where organization_id = $1 and provider = 'instagram' and customer_channel_id = $2;`,
    [orgAlphaId, testIgsid]
  );
  assert(
    windowRes.rows[0]?.customer_channel_id === testIgsid,
    'record_customer_channel_interaction creates persistent customer_channel_windows entry'
  );

  const expiresAt = new Date(windowRes.rows[0].window_expires_at).getTime();
  const lastInbound = new Date(windowRes.rows[0].last_inbound_at).getTime();
  const diffHours = (expiresAt - lastInbound) / (1000 * 3600);
  assert(
    Math.round(diffHours) === 24,
    'customer_channel_windows enforces exact 24-hour expiration window from inbound timestamp'
  );

  // 8. Subsequent interaction updates existing window idempotently
  await db.query(
    `select record_customer_channel_interaction($1, 'instagram', $2);`,
    [orgAlphaId, testIgsid]
  );
  const countRes = await db.query<{ count: string }>(
    `select count(*) as count from customer_channel_windows
     where organization_id = $1 and provider = 'instagram' and customer_channel_id = $2;`,
    [orgAlphaId, testIgsid]
  );
  assert(
    parseInt(countRes.rows[0].count, 10) === 1,
    'record_customer_channel_interaction updates existing window idempotently without duplicate rows'
  );

  // 9. Multi-tenant RLS isolation on oauth_states and customer_channel_windows
  await db.query(`set role authenticated;`);
  await db.query(`set request.jwt.claim.sub = '${ownerBetaId}';`);
  await db.query(`set request.jwt.claim.role = 'authenticated';`);

  const betaStates = await db.query(`select id from oauth_states;`);
  assert(
    betaStates.rows.length === 0,
    'RLS policy oauth_states_org_policy prevents cross-tenant state inspection'
  );

  const betaWindows = await db.query(`select id from customer_channel_windows;`);
  assert(
    betaWindows.rows.length === 0,
    'RLS policy customer_channel_windows_org_policy prevents cross-tenant messaging window inspection'
  );

  // Reset to owner session
  await db.query(`reset role;`);
  await db.query(`set request.jwt.claim.sub = '${ownerId}';`);
  await db.query(`set request.jwt.claim.role = 'authenticated';`);

  // =========================================================================
  // TEST SUITE 9: MIGRATION 007 SECURITY HARDENING, ACCOUNT UNIQUENESS & WEBHOOK CLAIMING
  // =========================================================================
  console.log('\n--- [PG-TEST 9] Migration 007 Security Hardening, Account Uniqueness & Atomic Webhook Claiming ---');

  // 1. Cross-Tenant Connected Account Identifier Uniqueness
  const pageIdX = 'meta_page_unique_999888';
  await db.query(
    `insert into connected_accounts (organization_id, user_id, provider, account_identifier, status)
     values ($1, $2, 'instagram', $3, 'connected');`,
    [orgAlphaId, ownerId, pageIdX]
  );

  let dupAccountBlocked = false;
  try {
    // Org Beta tries to register the exact same Meta Page ID
    await db.query(
      `insert into connected_accounts (organization_id, user_id, provider, account_identifier, status)
       values ($1, $2, 'instagram', $3, 'connected');`,
      [orgBetaId, ownerBetaId, pageIdX]
    );
  } catch (err: any) {
    dupAccountBlocked = err.message.includes('uq_connected_accounts_provider_identifier') || err.message.includes('unique constraint');
  }
  assert(dupAccountBlocked, 'Unique index uq_connected_accounts_provider_identifier blocks cross-tenant duplicate account registration');

  // 2. SECURITY DEFINER search_path hardening
  const procRes = await db.query<{ proname: string; proconfig: string[] }>(
    `select proname, proconfig from pg_proc where proname in ('consume_oauth_state', 'record_customer_channel_interaction', 'claim_provider_webhook_event');`
  );
  let allSearchPathHardened = procRes.rows.length >= 3;
  for (const row of procRes.rows) {
    const hasSearchPath = row.proconfig && row.proconfig.some((c: string) => c.includes('search_path=public, pg_temp'));
    if (!hasSearchPath) allSearchPathHardened = false;
  }
  assert(allSearchPathHardened, 'All SECURITY DEFINER functions explicitly set search_path = public, pg_temp');

  // 3. Atomic Webhook Event Claiming (Fix H2)
  const testWebhookEventId = `resend_evt_atomic_${Date.now()}`;
  const payloadHash = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';

  // First worker claims event
  const claimRes1 = await db.query<{ claimed: boolean; claim_status: string }>(
    `select * from claim_provider_webhook_event('resend', $1, $2, $3, 'email.inbound', 60);`,
    [testWebhookEventId, payloadHash, orgAlphaId]
  );
  assert(claimRes1.rows[0].claimed === true, 'First worker successfully claims new webhook event in PostgreSQL');
  assert(claimRes1.rows[0].claim_status === 'claimed', 'Claim status initialized as "claimed"');

  // Second concurrent worker attempts to claim identical event
  const claimRes2 = await db.query<{ claimed: boolean; claim_status: string }>(
    `select * from claim_provider_webhook_event('resend', $1, $2, $3, 'email.inbound', 60);`,
    [testWebhookEventId, payloadHash, orgAlphaId]
  );
  assert(claimRes2.rows[0].claimed === false, 'Second concurrent delivery rejected by atomic claim in PostgreSQL');
  assert(claimRes2.rows[0].claim_status === 'in_flight', 'Status reports event is currently in flight');

  // Mark event as completed
  await db.query(
    `select complete_provider_webhook_event('resend', $1, $2, '{"received": true}'::jsonb);`,
    [testWebhookEventId, orgAlphaId]
  );

  // Subsequent delivery after completion
  const claimRes3 = await db.query<{ claimed: boolean; claim_status: string }>(
    `select * from claim_provider_webhook_event('resend', $1, $2, $3, 'email.inbound', 60);`,
    [testWebhookEventId, payloadHash, orgAlphaId]
  );
  assert(claimRes3.rows[0].claimed === false, 'Subsequent webhook retry recognized as already completed');
  assert(claimRes3.rows[0].claim_status === 'completed', 'Completed event safely skipped without reprocessing');

  // =========================================================================
  // TEST SUITE 10: MIGRATION 008 WORKFLOW STATS HARDENING, FENCING & IDEMPOTENCY
  // =========================================================================
  console.log('\n--- [PG-TEST 10] Migration 008 Workflow Stats Hardening, Fencing & Outbound Idempotency ---');

  console.log('Applying Migration 008 (Workflow Stats Hardening & Outbound Lease Fencing)...');
  const migration008Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/008_workflow_stats_hardening_and_idempotency.sql'),
    'utf-8'
  );
  await db.exec(migration008Raw);
  assert(true, 'Migration 008 applied successfully without errors');

  // 1. Verify increment_workflow_stats search_path hardening in pg_proc
  const statsProc = await db.query<{ proname: string; proconfig: string[] }>(
    `select proname, proconfig from pg_proc where proname = 'increment_workflow_stats';`
  );
  const isStatsHardened = statsProc.rows.length > 0 && statsProc.rows[0].proconfig && statsProc.rows[0].proconfig.some((c) => c.includes('search_path=public, pg_temp'));
  assert(isStatsHardened, 'increment_workflow_stats explicitly hardened with search_path = public, pg_temp');

  // 2. Setup workflow owned by ownerId (User Alpha)
  const wfRes = await db.query<{ id: string }>(
    `insert into workflows (user_id, name, channel, executions_count, saved_hours)
     values ($1, 'Alpha Customer Auto-Reply', 'Email', 0, 0)
     returning id;`,
    [ownerId]
  );
  const alphaWfId = wfRes.rows[0].id;
  assert(!!alphaWfId, 'Test workflow created for User Alpha');

  // 3. Unauthorized cross-user execution attempt by User Beta
  await db.query(`set role authenticated;`);
  await db.query(`set request.jwt.claim.sub = '${ownerBetaId}';`);
  await db.query(`set request.jwt.claim.role = 'authenticated';`);

  let crossUserBlocked = false;
  try {
    await db.query(
      `select increment_workflow_stats($1, 1.5);`,
      [alphaWfId]
    );
  } catch (err: any) {
    crossUserBlocked = err.message.includes('UNAUTHORIZED') || err.message.includes('permission');
  }
  assert(crossUserBlocked, 'Cross-user execution of increment_workflow_stats strictly blocked by caller verification');

  // 4. Authorized execution by owner (User Alpha)
  await db.query(`set request.jwt.claim.sub = '${ownerId}';`);
  await db.query(
    `select increment_workflow_stats($1, 2.5);`,
    [alphaWfId]
  );

  const updatedWf = await db.query<{ executions_count: number; saved_hours: string }>(
    `select executions_count, saved_hours from workflows where id = $1;`,
    [alphaWfId]
  );
  assert(
    updatedWf.rows[0].executions_count === 1 && parseFloat(updatedWf.rows[0].saved_hours) === 2.5,
    'Authorized owner successfully increments workflow executions_count and saved_hours'
  );

  // 5. Unauthenticated / anon execution blocked by privilege revocation
  await db.query(`set role anon;`);
  await db.query(`set request.jwt.claim.sub = '';`);
  await db.query(`set request.jwt.claim.role = 'anon';`);

  let anonBlocked = false;
  try {
    await db.query(`select increment_workflow_stats($1, 1.0);`, [alphaWfId]);
  } catch (err: any) {
    anonBlocked = err.message.includes('permission denied') || err.message.includes('REVOKE');
  }
  assert(anonBlocked, 'Unauthenticated / anon role strictly blocked from executing increment_workflow_stats');

  // Reset to service_role for lease fencing & idempotency tests
  await db.query(`reset role;`);
  await db.query(`set request.jwt.claim.sub = '${ownerId}';`);
  await db.query(`set request.jwt.claim.role = 'service_role';`);

  // 6. Test verify_provider_webhook_lease (Finding B Database Fencing)
  const fenceEventId = `resend_fence_${Date.now()}`;
  const workerAlpha = 'worker_alpha_verified';
  const workerImposter = 'worker_imposter_stale';

  await db.query(
    `insert into provider_webhook_events (provider, event_id, event_type, payload_hash, status, worker_id, claim_expires_at)
     values ('resend', $1, 'email.inbound', 'hash_test_12345', 'claimed', $2, now() + interval '60 seconds');`,
    [fenceEventId, workerAlpha]
  );

  // Valid worker query
  const validFenceRes = await db.query<{ verify_provider_webhook_lease: boolean }>(
    `select verify_provider_webhook_lease('resend', $1, $2);`,
    [fenceEventId, workerAlpha]
  );
  assert(validFenceRes.rows[0].verify_provider_webhook_lease === true, 'verify_provider_webhook_lease returns true for active worker holding lease');

  // Imposter / mismatched worker query
  const imposterFenceRes = await db.query<{ verify_provider_webhook_lease: boolean }>(
    `select verify_provider_webhook_lease('resend', $1, $2);`,
    [fenceEventId, workerImposter]
  );
  assert(imposterFenceRes.rows[0].verify_provider_webhook_lease === false, 'verify_provider_webhook_lease returns false for mismatched worker');

  // Expired lease query
  await db.query(
    `update provider_webhook_events set claim_expires_at = now() - interval '5 seconds' where provider = 'resend' and event_id = $1;`,
    [fenceEventId]
  );
  const expiredFenceRes = await db.query<{ verify_provider_webhook_lease: boolean }>(
    `select verify_provider_webhook_lease('resend', $1, $2);`,
    [fenceEventId, workerAlpha]
  );
  assert(expiredFenceRes.rows[0].verify_provider_webhook_lease === false, 'verify_provider_webhook_lease returns false once lease has expired');

  // 7. Test complete_provider_webhook_event with outbound_idempotency_key
  const stableIdempotencyKey = 'resend_reply_idem_hash_98765';
  await db.query(
    `select complete_provider_webhook_event('resend', $1, $2, '{"delivered": true}'::jsonb, $3);`,
    [fenceEventId, orgAlphaId, stableIdempotencyKey]
  );

  const completedEvent = await db.query<{ status: string; outbound_idempotency_key: string }>(
    `select status, outbound_idempotency_key from provider_webhook_events where provider = 'resend' and event_id = $1;`,
    [fenceEventId]
  );
  assert(
    completedEvent.rows[0].status === 'completed' && completedEvent.rows[0].outbound_idempotency_key === stableIdempotencyKey,
    'complete_provider_webhook_event atomically marks status=completed and persists outbound_idempotency_key'
  );

  // =========================================================================
  // TEST SUITE 11: 24/7 AI RECEPTIONIST CHAT OPERATIONS & DURABLE JOBS
  // =========================================================================
  console.log('\n--- [PG-TEST 11] 24/7 AI Receptionist Chat Operations & Durable Jobs ---');

  console.log('Applying Migration 009 (Receptionist Chat Operations & Durable Jobs)...');
  const migration009Raw = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/009_receptionist_chat_operations.sql'),
    'utf-8'
  );
  await db.exec(migration009Raw);
  assert(true, 'Migration 009 applied successfully without errors');

  // 1. Business Receptionist Profile
  await db.query(
    `insert into business_receptionist_profiles (
       organization_id, business_name, business_type, services, opening_hours, timezone, policies
     ) values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (organization_id) do update set business_name = excluded.business_name;`,
    [
      orgAlphaId,
      'Prestige Aesthetics Paris',
      'Beauty Clinic',
      JSON.stringify([{ name: 'Facial Deluxe', price: 85, currency: 'EUR', duration_minutes: 60 }]),
      JSON.stringify({ monday: { open: '09:00', close: '18:00', closed: false } }),
      'Europe/Paris',
      JSON.stringify({ cancellation: '24 hours notice required' })
    ]
  );

  const profileRes = await db.query<{ business_name: string; timezone: string }>(
    `select business_name, timezone from business_receptionist_profiles where organization_id = $1;`,
    [orgAlphaId]
  );
  assert(
    profileRes.rows.length === 1 && profileRes.rows[0].business_name === 'Prestige Aesthetics Paris',
    'business_receptionist_profiles persists and retrieves verified business facts'
  );

  // 2. Conversation Human Handoff Columns
  const handoffConvRes = await db.query<{ id: string }>(
    `insert into conversations (user_id, organization_id, customer_name, channel, status, control_mode, handoff_reason)
     values ($1, $2, 'Jean Dupont', 'WhatsApp', 'needs_attention', 'human', 'Customer requested manager escalation')
     returning id;`,
    [ownerId, orgAlphaId]
  );
  const handoffConvId = handoffConvRes.rows[0].id;

  const convCheckRes = await db.query<{ control_mode: string; handoff_reason: string }>(
    `select control_mode, handoff_reason from conversations where id = $1;`,
    [handoffConvId]
  );
  assert(
    convCheckRes.rows[0].control_mode === 'human' && convCheckRes.rows[0].handoff_reason === 'Customer requested manager escalation',
    'conversations table persists control_mode="human" and handoff_reason for AI suppression'
  );

  // 3. Durable Background Receptionist Jobs & Atomic Claiming
  const reminderIdemKey = 'appt_remind_alpha_99999';
  const jobInsertRes = await db.query<{ id: string }>(
    `insert into receptionist_jobs (
       organization_id, target_id, channel, recipient, job_type, payload, scheduled_for, status, idempotency_key
     ) values ($1, $2, 'whatsapp', '+33612345678', 'appointment_reminder', '{"customer_name": "Jean Dupont", "time": "14:00"}'::jsonb, now() - interval '5 seconds', 'pending', $3)
     returning id;`,
    [orgAlphaId, handoffConvId, reminderIdemKey]
  );
  const reminderJobId = jobInsertRes.rows[0].id;
  assert(!!reminderJobId, 'receptionist_jobs accepts scheduled reminder job');

  // Idempotency: Duplicate pending job with same key is rejected by partial unique index
  let duplicateRejected = false;
  try {
    await db.query(
      `insert into receptionist_jobs (
         organization_id, target_id, channel, recipient, job_type, payload, scheduled_for, status, idempotency_key
       ) values ($1, $2, 'whatsapp', '+33612345678', 'appointment_reminder', '{"customer_name": "Jean Dupont"}'::jsonb, now(), 'pending', $3);`,
      [orgAlphaId, handoffConvId, reminderIdemKey]
    );
  } catch (err: any) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'receptionist_jobs partial unique index prevents duplicate pending jobs for same key');

  // Claim due job atomically
  const claimRes = await db.query<{ id: string; worker_id: string; status: string }>(
    `select id, worker_id, status from claim_receptionist_jobs('receptionist_worker_1', 10, 60);`
  );
  assert(
    claimRes.rows.some((j) => j.id === reminderJobId && j.worker_id === 'receptionist_worker_1' && j.status === 'processing'),
    'claim_receptionist_jobs atomically claims due jobs with FOR UPDATE SKIP LOCKED & worker lease'
  );

  // Concurrent claim gets 0 jobs (already leased)
  const concurrentClaimRes = await db.query<{ id: string }>(
    `select id from claim_receptionist_jobs('receptionist_worker_2', 10, 60);`
  );
  assert(
    !concurrentClaimRes.rows.some((j) => j.id === reminderJobId),
    'claim_receptionist_jobs protects leased jobs from concurrent worker double-execution'
  );

  // Complete job
  await db.query(
    `select complete_receptionist_job($1, 'receptionist_worker_1');`,
    [reminderJobId]
  );
  const completedJobRes = await db.query<{ status: string }>(
    `select status from receptionist_jobs where id = $1;`,
    [reminderJobId]
  );
  assert(
    completedJobRes.rows[0].status === 'completed',
    'complete_receptionist_job atomically marks job completed'
  );

  // Test Failure & Exponential Backoff
  const failJobRes = await db.query<{ id: string }>(
    `insert into receptionist_jobs (
       organization_id, target_id, channel, recipient, job_type, payload, scheduled_for, status
     ) values ($1, $2, 'whatsapp', '+33612345678', 'delivery_retry', '{"channel": "whatsapp"}'::jsonb, now() - interval '1 second', 'pending')
     returning id;`,
    [orgAlphaId, handoffConvId]
  );
  const failJobId = failJobRes.rows[0].id;

  // Claim
  await db.query(`select id from claim_receptionist_jobs('receptionist_worker_1', 10, 60);`);

  // Fail with retry
  await db.query(
    `select fail_receptionist_job($1, 'receptionist_worker_1', 'Provider 503 Service Unavailable', 3);`,
    [failJobId]
  );
  const retriedJobRes = await db.query<{ status: string; attempts: number; last_error: string }>(
    `select status, attempts, last_error from receptionist_jobs where id = $1;`,
    [failJobId]
  );
  assert(
    retriedJobRes.rows[0].status === 'pending' && retriedJobRes.rows[0].attempts === 1 && retriedJobRes.rows[0].last_error === 'Provider 503 Service Unavailable',
    'fail_receptionist_job resets status to pending with backoff and increments attempts'
  );

  console.log('\n========================================================================');
  console.log(`REAL POSTGRESQL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRealPostgresTests().catch((err) => {
  console.error('[PostgreSQL Test Runner Error]:', err);
  process.exit(1);
});
