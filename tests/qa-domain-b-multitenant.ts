/**
 * StarX-Flow QA Test Suite - Domain B: Multi-Tenant Isolation
 * Probes cross-tenant boundaries, IDOR attempts, message snooping, and data leakage.
 */

import fs from 'fs';
import path from 'path';

// 1. Load environment variables before importing app modules
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      val = val.replace(/^["'](.*)["']$/, '$1').trim();
      process.env[key] = val;
    }
  }
}

async function runDomainBTests() {
  console.log('================================================================');
  console.log(' DOMAIN B: MULTI-TENANT ISOLATION TESTING');
  console.log('================================================================');

  const { NextRequest } = await import('next/server');
  const { GET: getConvo, PATCH: patchConvo } = await import('../src/app/api/conversations/[id]/route');
  const { GET: getMessages, POST: postMessage } = await import('../src/app/api/conversations/[id]/messages/route');
  const { POST: postPresence } = await import('../src/app/api/conversations/[id]/presence/route');
  const { GET: getOrders, PATCH: updateOrder } = await import('../src/app/api/orders/route');
  const { MultiTenantRAG } = await import('../src/lib/rag/multiTenantRAG');
  const { setTestStaffSession } = await import('../src/lib/auth/serverAuth');
  const { InboxService } = await import('../src/lib/inbox/inboxService');

  interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
  }

  const results: TestResult[] = [];

  function check(name: string, condition: boolean, message?: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      results.push({ name, passed: true });
    } else {
      console.error(`  ✗ FAIL: ${name} -> ${message || 'Assertion failed'}`);
      results.push({ name, passed: false, error: message || 'Assertion failed' });
    }
  }

  const tenantAlphaOrg = 'org-alpha-111';
  const tenantAlphaUser = 'user-alpha-111';
  const tenantBetaOrg = 'org-beta-222';
  const tenantBetaUser = 'user-beta-222';

  // Seed a conversation belonging to Tenant Alpha in InboxService
  const alphaConvoId = `convo-alpha-${Date.now()}`;
  InboxService['inMemoryConversations'].set(alphaConvoId, {
    id: alphaConvoId,
    user_id: tenantAlphaUser,
    organization_id: tenantAlphaOrg,
    lead_id: 'lead-alpha-1' as any,
    channel: 'Web',
    customer_name: 'Alpha Customer',
    status: 'active',
    control_mode: 'ai',
    unread_count: 0,
    messages: [
      {
        id: 'msg-alpha-1',
        conversation_id: alphaConvoId,
        direction: 'inbound',
        role: 'user',
        content: 'Confidential trade secret of Alpha Clinic',
        is_internal: false,
        status: 'received',
        created_at: new Date().toISOString(),
      },
      {
        id: 'msg-alpha-internal-note',
        conversation_id: alphaConvoId,
        direction: 'outbound',
        role: 'human',
        content: 'STAFF ONLY NOTE: Customer has VIP credit limit of 50,000 EUR',
        is_internal: true,
        status: 'sent',
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any);

  // -------------------------------------------------------------
  // Test 1: Cross-tenant conversation read: Tenant Beta -> Alpha Conversation
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: tenantBetaUser, email: 'staff@beta.io' },
      organizationId: tenantBetaOrg,
      role: 'admin',
    });

    const req = new NextRequest(`http://localhost:3000/api/conversations/${alphaConvoId}`);
    const res = await getConvo(req, { params: Promise.resolve({ id: alphaConvoId }) });
    check('Cross-tenant GET /api/conversations/[id] returns 403', res.status === 403, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 2: Cross-tenant message history read: Tenant Beta -> Alpha Messages
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: tenantBetaUser, email: 'staff@beta.io' },
      organizationId: tenantBetaOrg,
      role: 'admin',
    });

    const req = new NextRequest(`http://localhost:3000/api/conversations/${alphaConvoId}/messages`);
    const res = await getMessages(req, { params: Promise.resolve({ id: alphaConvoId }) });
    check('Cross-tenant GET /api/conversations/[id]/messages returns 403', res.status === 403, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 3: Cross-tenant message injection: Tenant Beta posting to Alpha Conversation
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: tenantBetaUser, email: 'staff@beta.io' },
      organizationId: tenantBetaOrg,
      role: 'admin',
    });

    const req = new NextRequest(`http://localhost:3000/api/conversations/${alphaConvoId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Malicious injection from Tenant Beta',
        isInternal: false,
      }),
    });
    const res = await postMessage(req, { params: Promise.resolve({ id: alphaConvoId }) });
    check('Cross-tenant POST /api/conversations/[id]/messages returns 403', res.status === 403, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 4: Cross-tenant conversation status/priority mutation (PATCH)
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: tenantBetaUser, email: 'staff@beta.io' },
      organizationId: tenantBetaOrg,
      role: 'admin',
    });

    const req = new NextRequest(`http://localhost:3000/api/conversations/${alphaConvoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'closed',
        priority: 'urgent',
      }),
    });
    const res = await patchConvo(req, { params: Promise.resolve({ id: alphaConvoId }) });
    check('Cross-tenant PATCH /api/conversations/[id] returns 403', res.status === 403, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 5: Cross-tenant presence observation: Tenant Beta viewing Alpha thread
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: tenantBetaUser, email: 'staff@beta.io' },
      organizationId: tenantBetaOrg,
      role: 'admin',
    });

    const req = new NextRequest(`http://localhost:3000/api/conversations/${alphaConvoId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentName: 'Beta Spy' }),
    });
    const res = await postPresence(req, { params: Promise.resolve({ id: alphaConvoId }) });
    check('Cross-tenant POST /api/conversations/[id]/presence returns 403', res.status === 403, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 6: Multi-Tenant RAG Knowledge Isolation
  // -------------------------------------------------------------
  {
    // Ingest secret doc for Alpha
    await MultiTenantRAG.ingestDocument({
      userId: tenantAlphaUser,
      organizationId: tenantAlphaOrg,
      title: 'Alpha Secret Formula',
      documentType: 'text',
      content: 'The secret code to Alpha Clinic vault is ALPHA-998877. Never share this with outsiders.',
    });

    // Ingest doc for Beta
    await MultiTenantRAG.ingestDocument({
      userId: tenantBetaUser,
      organizationId: tenantBetaOrg,
      title: 'Beta Clinic Overview',
      documentType: 'text',
      content: 'Beta Clinic offers dental and cosmetic surgeries in Munich.',
    });

    // Query RAG as Beta asking about Alpha's secret
    const betaQueryResult = await MultiTenantRAG.retrieveContext({
      userId: tenantBetaUser,
      organizationId: tenantBetaOrg,
      query: 'What is the secret code to the vault ALPHA-998877?',
    });

    const containsAlphaSecret = betaQueryResult.contextText.includes('ALPHA-998877');
    check(
      'Tenant Beta RAG retrieval strictly excludes Tenant Alpha documents',
      !containsAlphaSecret && betaQueryResult.matches.length === 0,
      `Beta query returned: ${betaQueryResult.contextText}`
    );
  }

  // -------------------------------------------------------------
  // Test 7: Orders Isolation - Cross-tenant patch attempt
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: tenantBetaUser, email: 'staff@beta.io' },
      organizationId: tenantBetaOrg,
      role: 'admin',
    });

    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'ord-101', // Pre-existing order in memory or DB
        paymentStatus: 'paid',
      }),
    });
    const res = await updateOrder(req);
    // Even if in-memory order exists, tenantBetaOrg !== order's tenant
    const data = await res.json();
    check(
      'Cross-tenant order patch rejected or properly scoped',
      res.status === 403 || (data.order && data.order.user_id === tenantBetaOrg),
      `Got status ${res.status}`
    );
  }

  // Reset test session
  setTestStaffSession(null);

  console.log('----------------------------------------------------------------');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`DOMAIN B RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDomainBTests().catch((err) => {
  console.error('Fatal error running Domain B tests:', err);
  process.exit(1);
});
