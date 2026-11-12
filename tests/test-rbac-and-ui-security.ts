import fs from 'node:fs';
import { NextRequest } from 'next/server';

if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .forEach((line) => {
      const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    });
}

import { authenticateStaffRequest, setTestStaffSession } from '@/lib/auth/serverAuth';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';
import { POST as billingCheckoutPOST } from '@/app/api/billing/checkout/route';
import { POST as billingPortalPOST } from '@/app/api/billing/portal/route';
import { GET as ordersGET, POST as ordersPOST } from '@/app/api/orders/route';
import { GET as knowledgeGET, DELETE as knowledgeDELETE } from '@/app/api/knowledge/route';
import { GET as receptionistGET, PUT as receptionistPUT } from '@/app/api/receptionist/settings/route';
import { POST as crmMergePOST } from '@/app/api/crm/customers/merge/route';
import { GET as adminDemoGET } from '@/app/api/admin/demo-requests/route';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log(' SECURITY, RBAC & SECRET SANITIZATION REGRESSION SUITE');
  console.log('================================================================\n');

  try {
    // 1. Unauthenticated callers must receive 401 on every protected endpoint
    console.log('1. Unauthenticated Access Enforcement (401)');
    setTestStaffSession(null);

    const anonCheckout = await billingCheckoutPOST(
      new Request('http://localhost/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'pro' }),
      })
    );
    assert(anonCheckout.status === 401, 'POST /api/billing/checkout rejects anonymous caller (401)');

    const anonPortal = await billingPortalPOST(
      new Request('http://localhost/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    assert(anonPortal.status === 401, 'POST /api/billing/portal rejects anonymous caller (401)');

    const anonOrdersGet = await ordersGET(new NextRequest('http://localhost/api/orders'));
    assert(anonOrdersGet.status === 401, 'GET /api/orders rejects anonymous caller (401)');

    const anonOrdersPost = await ordersPOST(
      new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: 'Test', items: [{ name: 'Cut', quantity: 1, price: 30 }] }),
      })
    );
    assert(anonOrdersPost.status === 401, 'POST /api/orders rejects anonymous caller (401)');

    const anonKnowledgeGet = await knowledgeGET(new NextRequest('http://localhost/api/knowledge'));
    assert(anonKnowledgeGet.status === 401, 'GET /api/knowledge rejects anonymous caller (401)');

    const anonKnowledgeDel = await knowledgeDELETE(
      new NextRequest('http://localhost/api/knowledge?id=doc-1', { method: 'DELETE' })
    );
    assert(anonKnowledgeDel.status === 401, 'DELETE /api/knowledge rejects anonymous caller (401)');

    const anonRecGet = await receptionistGET(
      new NextRequest('http://localhost/api/receptionist/settings')
    );
    assert(anonRecGet.status === 401, 'GET /api/receptionist/settings rejects anonymous caller (401)');

    const anonRecPut = await receptionistPUT(
      new NextRequest('http://localhost/api/receptionist/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ greeting: 'Hi' }),
      })
    );
    assert(anonRecPut.status === 401, 'PUT /api/receptionist/settings rejects anonymous caller (401)');

    const anonCrmMerge = await crmMergePOST(
      new NextRequest('http://localhost/api/crm/customers/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryId: 'a', secondaryId: 'b' }),
      })
    );
    assert(anonCrmMerge.status === 401, 'POST /api/crm/customers/merge rejects anonymous caller (401)');

    const anonAdminDemo = await adminDemoGET(
      new Request('http://localhost/api/admin/demo-requests')
    );
    assert(anonAdminDemo.status === 401, 'GET /api/admin/demo-requests rejects anonymous caller (401)');

    // 2. Role-based access control: non-admin 'agent' role receives 403 on admin/billing endpoints
    console.log('\n2. Non-Admin (agent role) RBAC Restriction (403)');
    setTestStaffSession({
      user: { id: 'agent-user-1', email: 'agent@starx.test' },
      organizationId: 'org-alpha',
      role: 'agent',
    });

    const agentCheckout = await billingCheckoutPOST(
      new Request('http://localhost/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'pro' }),
      })
    );
    assert(agentCheckout.status === 403, 'POST /api/billing/checkout denies agent role with 403');

    const agentPortal = await billingPortalPOST(
      new Request('http://localhost/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    assert(agentPortal.status === 403, 'POST /api/billing/portal denies agent role with 403');

    const agentKnowledgeDel = await knowledgeDELETE(
      new NextRequest('http://localhost/api/knowledge?id=doc-1', { method: 'DELETE' })
    );
    assert(agentKnowledgeDel.status === 403, 'DELETE /api/knowledge denies agent role with 403');

    const agentRecPut = await receptionistPUT(
      new NextRequest('http://localhost/api/receptionist/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ greeting: 'Hi' }),
      })
    );
    assert(agentRecPut.status === 403, 'PUT /api/receptionist/settings denies agent role with 403');

    const agentCrmMerge = await crmMergePOST(
      new NextRequest('http://localhost/api/crm/customers/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryId: 'a', secondaryId: 'b' }),
      })
    );
    assert(agentCrmMerge.status === 403, 'POST /api/crm/customers/merge denies agent role with 403');

    // 3. Cross-tenant boundary verification
    console.log('\n3. Multi-Tenant Boundary Isolation');
    const crossTenantRes = await authenticateStaffRequest(
      new NextRequest('http://localhost/api/orders'),
      { targetOrganizationId: 'org-beta' }
    );
    assert(
      !crossTenantRes.authenticated && crossTenantRes.status === 403,
      'Cross-organization access rejected with 403'
    );

    // 4. Secret & Error Sanitization verification
    console.log('\n4. Secret & Internal Error Scrubbing Verification');
    const leakedBearer = sanitizeClientError(
      'Auth failed with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature_here'
    );
    assert(!leakedBearer.includes('eyJ') && leakedBearer.includes('[redacted]'), 'Redacts Bearer tokens & JWTs');

    const leakedKeys = sanitizeClientError(
      'Upstream error for key sk_live_1234567890abcdef and whsec_supersecret12345'
    );
    assert(
      !leakedKeys.includes('sk_live_') && !leakedKeys.includes('whsec_'),
      'Redacts Stripe/Polar/webhook secret keys'
    );

    const leakedPostgres = sanitizeClientError(
      'Failed connecting postgresql://postgres:TopSecretPw@db.xyz.supabase.co:5432/postgres'
    );
    assert(
      !leakedPostgres.includes('TopSecretPw') && !leakedPostgres.includes('supabase.co'),
      'Redacts Postgres credentials and Supabase project hostnames'
    );

    const leakedStack = sanitizeClientError(
      new Error('relation "public.orders" does not exist\n    at executeQuery (src/db.ts:44:9)'),
      'Unable to load orders'
    );
    assert(leakedStack === 'Unable to load orders', 'Collapses raw SQL schema errors and stack frames');
  } finally {
    setTestStaffSession(null);
  }

  console.log(`\nSecurity & RBAC Regression Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Unhandled security suite error:', err);
  process.exit(1);
});
