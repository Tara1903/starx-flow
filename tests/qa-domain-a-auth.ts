/**
 * StarX-Flow QA Test Suite - Domain A: Authentication and Accounts
 * Probes auth requirements, token parsing, RBAC role enforcement, and session resolution.
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

async function runDomainATests() {
  console.log('================================================================');
  console.log(' DOMAIN A: AUTHENTICATION AND ACCOUNTS TESTING');
  console.log('================================================================');

  const { NextRequest } = await import('next/server');
  const { GET: getKnowledge, DELETE: deleteKnowledge } = await import('../src/app/api/knowledge/route');
  const { POST: ingestKnowledge } = await import('../src/app/api/knowledge/ingest/route');
  const { GET: getOrders, POST: createOrder, PATCH: updateOrder } = await import('../src/app/api/orders/route');
  const { GET: getSettings, PUT: updateSettings } = await import('../src/app/api/receptionist/settings/route');
  const { POST: mergeCustomers } = await import('../src/app/api/crm/customers/merge/route');
  const { setTestStaffSession, authenticateStaffRequest } = await import('../src/lib/auth/serverAuth');

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

  // Clear any active test session override
  setTestStaffSession(null);

  // -------------------------------------------------------------
  // Test 1: Unauthenticated access to /api/receptionist/settings -> 401
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/receptionist/settings');
    const res = await getSettings(req);
    check('Unauthenticated GET /api/receptionist/settings returns 401', res.status === 401, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 2: Unauthenticated access to /api/knowledge -> MUST BE 401
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/knowledge?userId=victim-user-123');
    const res = await getKnowledge(req);
    check('Unauthenticated GET /api/knowledge returns 401', res.status === 401, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 3: Unauthenticated DELETE /api/knowledge -> MUST BE 401
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/knowledge?id=doc-123&userId=victim-user-123', {
      method: 'DELETE',
    });
    const res = await deleteKnowledge(req);
    check('Unauthenticated DELETE /api/knowledge returns 401', res.status === 401, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 4: Unauthenticated POST /api/knowledge/ingest -> MUST BE 401
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/knowledge/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'victim-user-123',
        title: 'Malicious Document',
        documentType: 'text',
        content: 'Poisoned context injection',
      }),
    });
    const res = await ingestKnowledge(req);
    check('Unauthenticated POST /api/knowledge/ingest returns 401', res.status === 401, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 5: Unauthenticated GET /api/orders -> MUST BE 401
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/orders?userId=victim-user-123');
    const res = await getOrders(req);
    check('Unauthenticated GET /api/orders returns 401', res.status === 401, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 6: Unauthenticated POST /api/orders -> MUST BE 401
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'victim-user-123',
        customerName: 'Fraud Customer',
        items: [{ name: 'Service', quantity: 1, price: 100 }],
      }),
    });
    const res = await createOrder(req);
    check('Unauthenticated POST /api/orders returns 401', res.status === 401, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 7: Unauthenticated PATCH /api/orders -> MUST BE 401
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'ord-101',
        paymentStatus: 'paid',
      }),
    });
    const res = await updateOrder(req);
    check('Unauthenticated PATCH /api/orders returns 401', res.status === 401, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 8: RBAC - Staff "agent" role attempting sensitive actions
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: 'agent-123', email: 'agent@starx.io' },
      organizationId: 'org-test-1',
      role: 'agent',
    });

    const req = new NextRequest('http://localhost:3000/api/crm/customers/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetLeadId: 'lead-1',
        sourceLeadId: 'lead-2',
      }),
    });
    const res = await mergeCustomers(req);
    check('Agent role calling customer merge returns 403', res.status === 403, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 9: RBAC - Staff "agent" attempting to overwrite company profile/settings
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: 'agent-123', email: 'agent@starx.io' },
      organizationId: 'org-test-1',
      role: 'agent',
    });

    const req = new NextRequest('http://localhost:3000/api/receptionist/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Compromised Business Name',
      }),
    });
    const res = await updateSettings(req);
    check('Agent role calling PUT /api/receptionist/settings returns 403', res.status === 403, `Got ${res.status}`);
  }

  // -------------------------------------------------------------
  // Test 10: RBAC - Admin/Owner calling PUT /api/receptionist/settings
  // -------------------------------------------------------------
  {
    setTestStaffSession({
      user: { id: 'admin-123', email: 'admin@starx.io' },
      organizationId: 'org-test-1',
      role: 'admin',
    });

    const req = new NextRequest('http://localhost:3000/api/receptionist/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'StarX Certified Business',
      }),
    });
    const res = await updateSettings(req);
    check('Admin role calling PUT /api/receptionist/settings is authorized (200)', res.status === 200, `Got ${res.status}`);
  }

  // Reset test session
  setTestStaffSession(null);

  // -------------------------------------------------------------
  // Test 11: Case-insensitive Bearer Token Parsing
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/receptionist/settings', {
      headers: { authorization: 'bearer fake-token' },
    });
    const authRes = await authenticateStaffRequest(req);
    check(
      'Lowercase "bearer <token>" is correctly extracted',
      authRes.authenticated === false && authRes.error.includes('Invalid or expired'),
      `Got error: "${!authRes.authenticated ? authRes.error : 'authenticated'}"`
    );
  }

  console.log('----------------------------------------------------------------');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`DOMAIN A RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDomainATests().catch((err) => {
  console.error('Fatal error running Domain A tests:', err);
  process.exit(1);
});
