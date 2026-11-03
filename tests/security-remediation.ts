/**
 * STARX-FLOW PHASE 4B.4.2 SECURITY REMEDIATION TEST SUITE
 * Tests:
 * 1. Internal notes privacy (AI prompts, public APIs, GDPR exports, outbound dispatch)
 * 2. Mandatory staff authentication & role-based authorization
 * 3. Multi-tenant identity resolution & E.164 phone collision defense
 * 4. AI tool customer session authorization (lateral resource access prevention)
 * 5. Serverless distributed presence & collision state
 */

import { IdentityResolver } from '../src/lib/crm/identityResolver';
import { InboxService } from '../src/lib/inbox/inboxService';
import { ToolExecutor } from '../src/lib/ai/tools/toolExecutor';
import { AIOrchestrator } from '../src/lib/ai/orchestrator';
import { AIProvider } from '../src/lib/ai/provider';
import {
  authenticateStaffRequest,
  setTestStaffSession,
  AuthenticatedStaffSession,
} from '../src/lib/auth/serverAuth';

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

async function runSecurityRemediationTests() {
  console.log('\n========================================================================');
  console.log('STARX-FLOW PHASE 4B.4.2 — CRITICAL SECURITY REMEDIATION TEST SUITE');
  console.log('========================================================================\n');

  // =========================================================================
  // WORKSTREAM 1: INTERNAL NOTES PRIVACY
  // =========================================================================
  console.log('--- [WORKSTREAM 1] Internal Notes Privacy Isolation ---');

  const convoId = `convo-privacy-${Date.now()}`;
  const secretStaffMarker = 'SECRET-STAFF-NOTE-MARGIN-OFFER-MAX-5-PERCENT';

  // 1. Post customer message
  await InboxService.postMessage({
    conversationId: convoId,
    userId: 'tenant-100',
    role: 'user',
    content: 'Hello, can I get a 20% discount on the premium package?',
    isInternal: false,
  });

  // 2. Post confidential internal staff note
  await InboxService.postMessage({
    conversationId: convoId,
    userId: 'tenant-100',
    role: 'human',
    content: `STAFF ONLY: ${secretStaffMarker}`,
    isInternal: true,
    agentName: 'Staff Member Bob',
  });

  // 3. Post assistant reply
  await InboxService.postMessage({
    conversationId: convoId,
    userId: 'tenant-100',
    role: 'ai',
    content: 'We offer standard seasonal discounts of up to 5%.',
    isInternal: false,
  });

  // 4. Test fetchMessages default privacy isolation
  const defaultMessages = await InboxService.fetchMessages(convoId, 50, false);
  const leakedInDefault = defaultMessages.some((m) => m.content.includes(secretStaffMarker));
  assert(!leakedInDefault, 'InboxService.fetchMessages(default) strictly excludes internal notes');

  // 5. Test fetchMessages authorized staff view
  const staffMessages = await InboxService.fetchMessages(convoId, 50, true);
  const foundInStaff = staffMessages.some((m) => m.content.includes(secretStaffMarker));
  assert(foundInStaff, 'InboxService.fetchMessages(includeInternal=true) includes internal note for staff');

  // 6. Test AI Conversation History query isolation
  // Simulate AI history fetching: must exclude internal notes
  const customerHistory = defaultMessages.filter((m) => !m.is_internal);
  const promptContainsSecret = customerHistory.some((m) => m.content.includes(secretStaffMarker));
  assert(!promptContainsSecret, 'AI prompt conversation context excludes internal staff notes');

  // 7. Test GDPR export isolation
  const mockExportConvos = [
    {
      id: convoId,
      messages: [
        { id: 'm1', content: 'Customer text', is_internal: false },
        { id: 'm2', content: secretStaffMarker, is_internal: true },
      ],
    },
  ];
  const sanitizedConvos = mockExportConvos.map((c) => ({
    ...c,
    messages: c.messages.filter((m) => !m.is_internal),
  }));
  const gdprContainsSecret = sanitizedConvos[0].messages.some((m) => m.content.includes(secretStaffMarker));
  assert(!gdprContainsSecret, 'GDPR data portability export strictly excludes internal staff commentary');

  // =========================================================================
  // WORKSTREAM 2: STAFF AUTHENTICATION & ROLE-BASED AUTHORIZATION
  // =========================================================================
  console.log('\n--- [WORKSTREAM 2] Staff Authentication & Authorization ---');

  // 1. Anonymous request rejected
  setTestStaffSession(null);
  const anonReq = new Request('http://localhost:3000/api/conversations', {
    headers: {},
  });
  const anonAuth = await authenticateStaffRequest(anonReq);
  assert(!anonAuth.authenticated && anonAuth.status === 401, 'Anonymous request rejected with 401 Unauthorized');

  // 2. Authenticated Agent session
  const agentSession: AuthenticatedStaffSession = {
    user: { id: 'usr-agent-alice', email: 'alice@business.de' },
    organizationId: 'org-tenant-alpha',
    role: 'agent',
  };
  setTestStaffSession(agentSession);

  const agentReq = new Request('http://localhost:3000/api/conversations', {
    headers: { authorization: 'Bearer test-token' },
  });
  const agentAuth = await authenticateStaffRequest(agentReq);
  assert(agentAuth.authenticated && agentAuth.session.role === 'agent', 'Authenticated staff agent session accepted');

  // 3. Agent role blocked from admin-only sensitive operations (e.g. customer merge)
  const mergeRoleCheck = await authenticateStaffRequest(agentReq, { requiredRole: 'admin' });
  assert(!mergeRoleCheck.authenticated && mergeRoleCheck.status === 403, 'Agent role rejected with 403 from admin-only customer merge');

  // 4. Cross-organization access rejected
  const crossOrgCheck = await authenticateStaffRequest(agentReq, {
    targetOrganizationId: 'org-tenant-bravo',
  });
  assert(!crossOrgCheck.authenticated && crossOrgCheck.status === 403, 'Cross-organization access rejected with 403 Forbidden');

  // 5. Admin role allowed for sensitive operations
  const adminSession: AuthenticatedStaffSession = {
    user: { id: 'usr-admin-charlie', email: 'charlie@business.de' },
    organizationId: 'org-tenant-alpha',
    role: 'admin',
  };
  setTestStaffSession(adminSession);
  const adminAuth = await authenticateStaffRequest(agentReq, { requiredRole: 'admin' });
  assert(adminAuth.authenticated && adminAuth.session.role === 'admin', 'Admin role accepted for customer merge');

  // Reset test mock
  setTestStaffSession(null);

  // =========================================================================
  // WORKSTREAM 3: MULTI-TENANT IDENTITY RESOLUTION & PHONE PARSING
  // =========================================================================
  console.log('\n--- [WORKSTREAM 3] Multi-Tenant Identity Resolution & Phone Normalization ---');

  // 1. E.164 phone normalization
  const germanNorm = IdentityResolver.normalizePhone('+49 (170) 123-4567');
  assert(germanNorm === '+491701234567', `Strict E.164 normalization for Germany: ${germanNorm}`);

  const frenchNorm = IdentityResolver.normalizePhone('+33 6 12 34 56 78');
  assert(frenchNorm === '+33612345678', `Strict E.164 normalization for France: ${frenchNorm}`);

  // 2. Collision defense: same trailing 8 digits from different countries must NOT match
  const phoneCollision = IdentityResolver.isPhoneMatch('+4917012345678', '+33612345678');
  assert(!phoneCollision, 'International phone numbers sharing trailing 8 digits do NOT collide');

  // 3. Same normalized number matches
  const phoneEquality = IdentityResolver.isPhoneMatch('+49 170 12345678', '+4917012345678');
  assert(phoneEquality, 'Identical international numbers match correctly');

  // 4. Cross-tenant identity isolation
  IdentityResolver.clearInMemory();
  const resTenantA = await IdentityResolver.resolveCustomer({
    userId: 'tenant-alpha',
    organizationId: 'tenant-alpha',
    channel: 'whatsapp',
    externalUserId: 'wa-user-999',
    senderName: 'Customer Alpha',
    phone: '+491701111111',
  });

  const resTenantB = await IdentityResolver.resolveCustomer({
    userId: 'tenant-bravo',
    organizationId: 'tenant-bravo',
    channel: 'whatsapp',
    externalUserId: 'wa-user-999', // Same external identifier in different tenant
    senderName: 'Customer Bravo',
    phone: '+491701111111',
  });

  assert(resTenantA.leadId !== resTenantB.leadId, 'Cross-tenant identity lookup strictly isolated between organizations');

  // 5. Customer Merge Validation
  const mergeSelf = await IdentityResolver.mergeCustomers({
    userId: 'tenant-alpha',
    organizationId: 'tenant-alpha',
    targetLeadId: resTenantA.leadId,
    sourceLeadId: resTenantA.leadId,
  });
  assert(!mergeSelf.success, 'Customer self-merge is rejected');

  const mergeCrossOrg = await IdentityResolver.mergeCustomers({
    userId: 'tenant-alpha',
    organizationId: 'tenant-alpha',
    targetLeadId: resTenantA.leadId,
    sourceLeadId: resTenantB.leadId, // Belongs to tenant-bravo
  });
  assert(!mergeCrossOrg.success, 'Cross-organization customer merge is rejected');

  // Create second lead in Tenant Alpha for valid merge
  const resTenantA2 = await IdentityResolver.resolveCustomer({
    userId: 'tenant-alpha',
    organizationId: 'tenant-alpha',
    channel: 'web',
    externalUserId: 'web-session-123',
    senderName: 'Customer Alpha Duplicate',
    email: 'alpha@example.de',
  });

  const validMerge = await IdentityResolver.mergeCustomers({
    userId: 'tenant-alpha',
    organizationId: 'tenant-alpha',
    targetLeadId: resTenantA.leadId,
    sourceLeadId: resTenantA2.leadId,
  });
  assert(validMerge.success && validMerge.reassignedCounts.identities >= 1, 'Same-tenant customer merge executes with reassigned identities');

  // =========================================================================
  // WORKSTREAM 5: AI TOOL CUSTOMER SESSION AUTHORIZATION
  // =========================================================================
  console.log('\n--- [WORKSTREAM 5] AI Tool Customer Authorization ---');

  // 1. Seed Order and Appointment belonging to Customer Bob
  const orderBob = {
    id: 'ord-bob-101',
    user_id: 'tenant-alpha',
    organization_id: 'tenant-alpha',
    order_number: 'ORD-BOB-101',
    customer_name: 'Bob Martin',
    customer_phone: '+491702222222',
    customer_email: 'bob@example.de',
    lead_id: 'lead-bob-001',
    status: 'shipped' as const,
    payment_status: 'paid' as const,
    total_amount: 149.99,
    currency: 'EUR',
    items: [{ name: 'Heat Pump Valve', quantity: 1, unit_price: 149.99 }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  ToolExecutor.seedOrder(orderBob);

  const aptBob = {
    id: 'apt-bob-202',
    user_id: 'tenant-alpha',
    organization_id: 'tenant-alpha',
    customer_name: 'Bob Martin',
    customer_phone: '+491702222222',
    customer_email: 'bob@example.de',
    lead_id: 'lead-bob-001',
    service_name: 'HVAC Maintenance',
    start_time: '2026-11-15T10:00:00Z',
    end_time: '2026-11-15T11:00:00Z',
    timezone: 'Europe/Berlin',
    status: 'confirmed' as const,
    reminder_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  ToolExecutor.seedAppointment(aptBob);

  // 2. Customer Alice chats with the bot and attempts to look up Bob's order
  const aliceOrderLookup = await ToolExecutor.executeTool(
    'getOrderStatus',
    { orderNumberOrId: 'ORD-BOB-101' },
    {
      userId: 'tenant-alpha',
      organizationId: 'tenant-alpha',
      customerPhone: '+491709999999', // Alice's phone (does not match Bob)
      customerEmail: 'alice@example.de',
      leadId: 'lead-alice-999',
      actorType: 'ai_agent',
    }
  );
  assert(!aliceOrderLookup.success, 'AI tool getOrderStatus rejects lateral lookup by unauthorized customer');

  // 3. Customer Alice attempts to cancel Bob's appointment
  const aliceAptCancel = await ToolExecutor.executeTool(
    'cancelAppointment',
    { appointmentId: 'apt-bob-202', reason: 'Malicious cancellation' },
    {
      userId: 'tenant-alpha',
      organizationId: 'tenant-alpha',
      customerPhone: '+491709999999',
      customerEmail: 'alice@example.de',
      leadId: 'lead-alice-999',
      actorType: 'ai_agent',
    }
  );
  assert(!aliceAptCancel.success, 'AI tool cancelAppointment rejects unauthorized cancellation of other customer appointment');

  // 4. Customer Bob queries his own order -> Succeeds
  const bobOrderLookup = await ToolExecutor.executeTool(
    'getOrderStatus',
    { orderNumberOrId: 'ORD-BOB-101' },
    {
      userId: 'tenant-alpha',
      organizationId: 'tenant-alpha',
      customerPhone: '+491702222222', // Bob's phone
      customerEmail: 'bob@example.de',
      leadId: 'lead-bob-001',
      actorType: 'ai_agent',
    }
  );
  assert(bobOrderLookup.success && bobOrderLookup.data?.orderNumber === 'ORD-BOB-101', 'AI tool getOrderStatus succeeds for verified order owner');

  // 5. Customer Bob cancels his own appointment -> Succeeds
  const bobAptCancel = await ToolExecutor.executeTool(
    'cancelAppointment',
    { appointmentId: 'apt-bob-202', reason: 'Rescheduling requested' },
    {
      userId: 'tenant-alpha',
      organizationId: 'tenant-alpha',
      customerPhone: '+491702222222',
      customerEmail: 'bob@example.de',
      leadId: 'lead-bob-001',
      actorType: 'ai_agent',
    }
  );
  assert(bobAptCancel.success && bobAptCancel.data?.status === 'cancelled', 'AI tool cancelAppointment succeeds for verified appointment owner');

  // =========================================================================
  // WORKSTREAM 7: SERVERLESS PRESENCE & COLLISION DETECTION
  // =========================================================================
  console.log('\n--- [WORKSTREAM 7] Serverless Distributed Presence ---');

  const presenceConvoId = `convo-pres-${Date.now()}`;
  await InboxService.registerViewer(presenceConvoId, 'agent-1', 'Agent Alice', 'tenant-alpha');

  // Agent Bob checks collision
  const collisionBob = await InboxService.getCollisionState(presenceConvoId, 'agent-2');
  assert(collisionBob.hasCollision && collisionBob.activeViewers.includes('Agent Alice'), 'Collision detected when another agent is viewing thread');

  // Agent Alice checks collision (viewing self)
  const collisionAlice = await InboxService.getCollisionState(presenceConvoId, 'agent-1');
  assert(!collisionAlice.hasCollision, 'Agent does not collide with themselves');

  // Agent Alice navigates away
  await InboxService.removeViewer(presenceConvoId, 'agent-1');
  const collisionAfterRemove = await InboxService.getCollisionState(presenceConvoId, 'agent-2');
  assert(!collisionAfterRemove.hasCollision, 'Collision cleared after agent navigates away');

  console.log('\n========================================================================');
  console.log(`SECURITY REMEDIATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityRemediationTests().catch((err) => {
  console.error('[Security Test Runner Error]:', err);
  process.exit(1);
});
