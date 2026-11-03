/**
 * StarX-Flow Sprint 1 Automated Verification Test Suite
 * Validates:
 * 1. Database Migration 003 Schema Integrity & RLS
 * 2. WS-01 Shared Ingestion Gateway & Multi-Channel Adapters
 * 3. WS-05 Multi-Tenant RAG Pipeline & Document Parsers
 * 4. WS-13 Central Usage Metering & Plan Entitlement Checks
 * 5. Full End-to-End Integrated Ingestion -> RAG -> AI -> Usage Pipeline
 */

import fs from 'fs';
import path from 'path';

// Load environment variables if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { IngestionGateway, IdempotencyManager } from '../src/lib/ingestion';
import { DocumentParser } from '../src/lib/rag/documentParser';
import { MultiTenantRAG } from '../src/lib/rag/multiTenantRAG';
import { UsageService, CONFIGURABLE_PLANS } from '../src/lib/usage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function testMigration003Schema() {
  console.log('\n--- 1. TESTING MIGRATION 003 DDL SPECIFICATION & SCHEMA INTEGRITY ---');
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/003_commercial_capabilities.sql');
  assert(fs.existsSync(migrationPath), 'Migration 003 file must exist in supabase/migrations/');

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  // Verify all 6 required tables are defined
  const requiredTables = [
    'channel_identities',
    'lead_scoring_rules',
    'analytics_daily_rollups',
    'phone_numbers',
    'workflow_executions',
    'audit_logs',
  ];

  for (const table of requiredTables) {
    assert(sqlContent.includes(`create table if not exists ${table}`), `Must define table: ${table}`);
    assert(sqlContent.includes(`alter table ${table} enable row level security`), `RLS must be enabled on table: ${table}`);
  }
  console.log(`✓ All 6 planned tables defined with RLS: ${requiredTables.join(', ')}`);

  // Verify column additions to existing tables
  assert(sqlContent.includes('monthly_ai_messages_used'), 'Must add monthly_ai_messages_used to organizations');
  assert(sqlContent.includes('monthly_voice_minutes_used'), 'Must add monthly_voice_minutes_used to organizations');
  assert(sqlContent.includes('is_internal boolean not null default false'), 'Must add is_internal flag to messages');
  console.log('✓ Non-breaking column additions to organizations and messages verified');

  // Verify audit_logs immutability (no update/delete policies)
  assert(!sqlContent.includes('on audit_logs for update'), 'audit_logs must NOT have an update policy (immutable)');
  assert(!sqlContent.includes('on audit_logs for delete'), 'audit_logs must NOT have a delete policy (immutable)');
  console.log('✓ Immutability guarantee: audit_logs strictly prohibits UPDATE and DELETE policies');
  console.log('✓ TEST 1: MIGRATION 003 INTEGRITY PASSED');
}

async function testSharedIngestionGateway() {
  console.log('\n--- 2. TESTING WS-01: SHARED INGESTION GATEWAY & ADAPTERS ---');

  // A. WhatsApp Inbound Normalization
  const waAdapter = IngestionGateway.getAdapter('whatsapp');
  assert(Boolean(waAdapter), 'WhatsApp adapter must be registered');

  const waPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BIZ_123',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: 'PN_998877' },
              contacts: [{ profile: { name: 'Klaus Fischer' }, wa_id: '491512345678' }],
              messages: [
                {
                  from: '491512345678',
                  id: 'wamid.HBgLNDkxNTEyMzQ1Njc4FQIAEhgg...',
                  timestamp: '1740000000',
                  text: { body: 'Hello, what services do you offer in Munich?' },
                  type: 'text',
                },
              ],
            },
          },
        ],
      },
    ],
  };

  const waCanonical = await waAdapter!.normalize(waPayload, { userId: 'test-user-ingestion' });
  assert(Boolean(waCanonical), 'WhatsApp payload must normalize into CanonicalInboundEvent');
  assert(waCanonical?.channel === 'whatsapp', 'Channel must be whatsapp');
  assert(waCanonical?.sender.phone === '+491512345678', 'Phone must format to E.164 (+491512345678)');
  assert(waCanonical?.message.text.includes('Munich'), 'Message text must be extracted');
  console.log(`✓ WhatsApp payload normalized: from "${waCanonical?.sender.name}" (+491512345678)`);

  // B. Web Chat Normalization
  const webAdapter = IngestionGateway.getAdapter('web');
  const webCanonical = await webAdapter!.normalize({
    businessId: 'test-user-ingestion',
    message: 'Can I reschedule my appointment for tomorrow?',
    visitorName: 'Sophie Weber',
    visitorEmail: 'sophie@weber.de',
  });
  assert(Boolean(webCanonical), 'Web chat payload must normalize');
  assert(webCanonical?.channel === 'web', 'Channel must be web');
  assert(webCanonical?.sender.email === 'sophie@weber.de', 'Visitor email must be extracted');
  console.log(`✓ Web chat payload normalized: "${webCanonical?.message.text}"`);

  // C. Ingestion Idempotency & Duplicate Drop
  const eventId = `test-evt-dedup-${Date.now()}`;
  const testEvent = {
    eventId,
    channel: 'web' as const,
    userId: 'test-user-ingestion',
    sender: { name: 'Test User', identifier: 'test@example.de' },
    message: { messageId: eventId, text: 'Idempotency test query', timestamp: new Date().toISOString() },
    receivedAt: new Date().toISOString(),
  };

  const firstResult = await IngestionGateway.process(testEvent);
  assert(firstResult.success === true, 'First event processing must succeed');
  assert(firstResult.status === 'processed', 'First event status must be "processed"');
  console.log(`✓ First event processed in ${firstResult.processingTimeMs}ms`);

  const secondResult = await IngestionGateway.process(testEvent);
  assert(secondResult.success === true, 'Duplicate submission must return success: true (HTTP 200)');
  assert(secondResult.status === 'duplicate', 'Duplicate submission must be dropped with status "duplicate"');
  console.log('✓ Idempotency verified: identical duplicate event dropped without reprocessing');

  // D. Gateway Health Telemetry
  const health = IngestionGateway.getHealthStatus();
  assert(health.status === 'healthy', 'Gateway health status must be "healthy"');
  assert(health.eventsProcessedTotal >= 1, 'Events processed counter must be incremented');
  assert(health.duplicateEventsDropped >= 1, 'Duplicate events counter must be incremented');
  console.log(`✓ Gateway health telemetry: ${health.eventsProcessedTotal} processed, ${health.duplicateEventsDropped} duplicates dropped, avg latency ${health.averageLatencyMs}ms`);
  console.log('✓ TEST 2: SHARED INGESTION GATEWAY PASSED');
}

async function testMultiTenantRAGPipeline() {
  console.log('\n--- 3. TESTING WS-05: MULTI-TENANT RAG PIPELINE & DOCUMENT PARSERS ---');

  // A. Text & Markdown Parser with Control Character Sanitization
  const sampleText = 'Special Business FAQ\n\nWe provide bespoke consulting services across Germany, France, and Switzerland.\nOur Berlin office is open 09:00 - 18:00.\nOur package fee starts from €1,200 per month.';
  const parsedText = DocumentParser.parseText(sampleText, 'Consulting FAQ');
  assert(parsedText.wordCount > 10, 'Parsed text must have word count');
  assert(parsedText.documentType === 'text', 'Document type must be text');
  console.log(`✓ Text parser verified: ${parsedText.charCount} characters, ${parsedText.wordCount} words`);

  // B. Size Limit & Empty File Guardrails
  let rejected = false;
  try {
    DocumentParser.validateFileSize(15 * 1024 * 1024); // 15MB > 10MB limit
  } catch (err: any) {
    rejected = true;
    assert(err.message.includes('exceeds maximum allowed limit'), 'Must reject oversize file');
  }
  assert(rejected, 'Oversize files (>10MB) must be rejected');
  console.log('✓ Security: Files >10MB strictly rejected by DocumentParser');

  // C. Natural Semantic Chunking (Sentence boundary preservation)
  const paragraph = 'StarX-Flow is the first autonomous AI Operating System engineered for European local businesses. It brings together unified communications, intelligent appointment scheduling, order management, and multi-tenant security. With strict GDPR compliance, European SMEs gain access to enterprise-grade AI automation without operational friction.';
  const chunks = MultiTenantRAG.splitText(paragraph);
  assert(chunks.length > 0, 'Natural text splitter must return at least one chunk');
  assert(chunks[0].tokenCount > 0, 'Chunk must compute estimated token count');
  console.log(`✓ Natural semantic chunker created ${chunks.length} chunk(s)`);

  // D. Document Ingestion & Tenant-Isolated Retrieval
  const userA = `tenant-a-${Date.now()}`;
  const userB = `tenant-b-${Date.now()}`;

  // Ingest proprietary document for Tenant A
  await MultiTenantRAG.ingestDocument({
    userId: userA,
    title: 'Tenant A Secret Vault',
    documentType: 'text',
    content: 'Tenant A private passcode is ALPHA-9988-BERLIN. Opening hours are exclusively 06:00 to 12:00.',
  });

  // Query by Tenant A (Authorized)
  const retrievalA = await MultiTenantRAG.retrieveContext({
    userId: userA,
    query: 'What is the secret passcode and opening hours?',
  });
  assert(retrievalA.hasSufficientContext, 'Tenant A must find its own ingested knowledge');
  assert(retrievalA.contextText.includes('ALPHA-9988-BERLIN'), 'Tenant A must retrieve matching content');
  assert(retrievalA.sourcesCited.some((s) => s.title.includes('Tenant A Secret Vault')), 'Must cite source title');
  console.log(`✓ Tenant A retrieved authorized context: "${retrievalA.sourcesCited[0].title}" (score: ${retrievalA.sourcesCited[0].score})`);

  // Query by Tenant B (Cross-Tenant Penetration Check)
  const retrievalB = await MultiTenantRAG.retrieveContext({
    userId: userB,
    query: 'What is the secret passcode and opening hours?',
  });
  assert(!retrievalB.hasSufficientContext, 'Tenant B must NOT retrieve Tenant A context');
  assert(!retrievalB.contextText.includes('ALPHA-9988-BERLIN'), 'Tenant B must NEVER access Tenant A passcode');
  console.log('✓ Multi-Tenant Isolation Verified: Tenant B query returned 0 leaked chunks from Tenant A');
  console.log('✓ TEST 3: MULTI-TENANT RAG PIPELINE PASSED');
}

async function testUsageMeteringAndBilling() {
  console.log('\n--- 4. TESTING WS-13: USAGE METERING & BILLING FOUNDATION ---');

  const testUser = `metering-user-${Date.now()}`;

  // A. Configurable Plan Definitions Verification
  assert(CONFIGURABLE_PLANS.starter.priceEur === 49, 'Starter plan must be €49/mo');
  assert(CONFIGURABLE_PLANS.starter.status === 'proposed', 'Starter plan must be marked proposed (governance rule)');
  assert(CONFIGURABLE_PLANS.pro.priceEur === 97, 'Growth plan must be €97/mo');
  assert(CONFIGURABLE_PLANS.enterprise.priceEur === 297, 'Enterprise plan must be €297/mo');
  console.log('✓ Configurable plan definitions verified (€49 Starter / €97 Growth / €297 Enterprise, status: proposed)');

  // B. Idempotent Usage Recording
  const dedupKey = `idemp-usage-${Date.now()}`;
  const rec1 = await UsageService.recordUsage({
    userId: testUser,
    metricType: 'ai_requests',
    quantity: 1,
    idempotencyKey: dedupKey,
  });
  assert(rec1.success === true && rec1.recorded === true, 'First usage event must be recorded');
  assert(rec1.newMonthlyTotal === 1, 'Monthly total must be 1');

  // Retry with same idempotencyKey
  const rec2 = await UsageService.recordUsage({
    userId: testUser,
    metricType: 'ai_requests',
    quantity: 1,
    idempotencyKey: dedupKey,
  });
  assert(rec2.success === true && rec2.duplicate === true, 'Retry with same key must be marked duplicate');
  assert(rec2.recorded === false, 'Duplicate event must NOT increment usage counter');
  assert(rec2.newMonthlyTotal === 1, 'Monthly total must remain 1');
  console.log('✓ Idempotent usage recording verified: duplicate retries safely rejected');

  // C. Plan Entitlement & Quota Limit Enforcement
  const freeUser = `free-user-${Date.now()}`;
  // Manually consume all free trial AI requests
  const freeLimit = CONFIGURABLE_PLANS.free.limits.ai_requests;
  await UsageService.recordUsage({
    userId: freeUser,
    metricType: 'ai_requests',
    quantity: freeLimit,
  });

  const checkAllowed = await UsageService.checkEntitlement(freeUser, 'ai_requests', 0, null, 'free');
  assert(checkAllowed.currentUsage === freeLimit, 'Usage must match recorded limit');

  // Check next request entitlement on Free plan
  const checkOverQuota = await UsageService.checkEntitlement(freeUser, 'ai_requests', 1, null, 'free');
  assert(checkOverQuota.allowed === false, 'Over-quota request must be blocked (allowed: false)');
  assert(checkOverQuota.quotaExceeded === true, 'quotaExceeded flag must be true');
  assert(Boolean(checkOverQuota.reason), 'Must provide clear upgrade reason');
  console.log(`✓ Plan entitlement enforcement: quota exceeded blocked with message: "${checkOverQuota.reason}"`);

  // D. Monthly Summary Generation
  const summary = await UsageService.getMonthlySummary(testUser);
  assert(summary.periodMonth === UsageService.getCurrentPeriod(), 'Period must match current year-month');
  assert(summary.metrics.ai_requests.currentUsage >= 1, 'Summary must reflect recorded AI requests');
  console.log(`✓ Monthly usage summary generated for ${summary.periodMonth}: ${summary.metrics.ai_requests.currentUsage} AI requests used`);
  console.log('✓ TEST 4: USAGE METERING & BILLING PASSED');
}

async function testFullIntegratedPipeline() {
  console.log('\n--- 5. TESTING FULL INTEGRATED PIPELINE: INGESTION -> RAG -> AI -> USAGE ---');

  const businessUserId = `e2e-biz-user-${Date.now()}`;

  // 1. Ingest Business Knowledge
  await MultiTenantRAG.ingestDocument({
    userId: businessUserId,
    title: 'Boutique Pricing & Services',
    documentType: 'text',
    content: 'StarX Boutique offers standard styling for €55 and executive grooming for €95. Appointments can be scheduled online.',
  });

  // 2. Inbound Message through Shared Ingestion Gateway
  const inboundEvent = {
    eventId: `e2e-evt-${Date.now()}`,
    channel: 'web' as const,
    userId: businessUserId,
    sender: {
      name: 'Maximilian Bauer',
      identifier: 'max@bauer.de',
      email: 'max@bauer.de',
    },
    message: {
      messageId: `msg-${Date.now()}`,
      text: 'How much does executive grooming cost?',
      timestamp: new Date().toISOString(),
    },
    receivedAt: new Date().toISOString(),
  };

  const pipelineResult = await IngestionGateway.process(inboundEvent);
  assert(pipelineResult.success === true, 'End-to-End pipeline must process successfully');
  assert(Boolean(pipelineResult.conversationId), 'Must generate conversation ID');
  assert(Boolean(pipelineResult.leadId), 'Must generate or link CRM lead ID');
  assert(Boolean(pipelineResult.replyText), 'Must generate AI reply');
  console.log(`✓ Ingestion Gateway processed event in ${pipelineResult.processingTimeMs}ms`);
  console.log(`✓ Conversation ID: ${pipelineResult.conversationId}, CRM Lead ID: ${pipelineResult.leadId}`);
  console.log(`✓ AI Response: "${pipelineResult.replyText?.slice(0, 85)}..."`);

  // 3. Verify Usage Accounting Recorded for the Event
  const monthlySummary = await UsageService.getMonthlySummary(businessUserId);
  assert(monthlySummary.metrics.ai_requests.currentUsage >= 1, 'AI request must be metered in monthly summary');
  console.log(`✓ Usage attributed to business ${businessUserId}: ${monthlySummary.metrics.ai_requests.currentUsage} AI request(s) recorded`);

  console.log('✓ TEST 5: FULL INTEGRATED PIPELINE PASSED');
}

async function main() {
  console.log('================================================================');
  console.log(' STARX-FLOW SPRINT 1 IMPLEMENTATION VERIFICATION SUITE');
  console.log('================================================================');

  try {
    await testMigration003Schema();
    await testSharedIngestionGateway();
    await testMultiTenantRAGPipeline();
    await testUsageMeteringAndBilling();
    await testFullIntegratedPipeline();

    console.log('\n================================================================');
    console.log(' 🎉 ALL SPRINT 1 VERIFICATION TESTS COMPLETED & PASSED!');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ SPRINT 1 VERIFICATION TEST FAILED:', err.message);
    process.exit(1);
  }
}

main();
