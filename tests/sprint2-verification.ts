/**
 * StarX-Flow Sprint 2 Master Verification Test Suite (WS-02, WS-03, WS-04)
 * Comprehensive automated verification for:
 * 1. Cross-Channel Customer Identity Resolution & Merging (WS-03)
 * 2. Unified Omnichannel Inbox, Internal Notes & Presence Collision (WS-02)
 * 3. Tool-Augmented AI Workforce, Conflict Detection & Audit Logging (WS-04)
 * 4. Integrated End-to-End Multi-Tenant Lifecycle
 */

import { IdentityResolver } from '../src/lib/crm/identityResolver';
import { InboxService } from '../src/lib/inbox/inboxService';
import { ToolExecutor } from '../src/lib/ai/tools/toolExecutor';
import { AIOrchestrator } from '../src/lib/ai/orchestrator';
import { UsageService } from '../src/lib/usage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function runSprint2Verification() {
  console.log('================================================================');
  console.log(' STARX-FLOW SPRINT 2 VERIFICATION: IDENTITY, INBOX & AI TOOLS');
  console.log('================================================================');

  const testTenantId = `tenant-${Date.now()}`;
  const otherTenantId = `tenant-other-${Date.now()}`;

  // ----------------------------------------------------------------
  // TEST 1: Cross-Channel Customer Identity Resolution (WS-03)
  // ----------------------------------------------------------------
  console.log('\n--- TEST 1: Cross-Channel Identity Resolution (WS-03) ---');
  
  // 1.1 Inbound WhatsApp event: provisions new customer and links WhatsApp identity
  const phone = '+33612345678';
  const res1 = await IdentityResolver.resolveCustomer({
    userId: testTenantId,
    channel: 'whatsapp',
    externalUserId: phone,
    senderName: 'Claire Dubois',
    phone,
  });

  assert(res1.isNewLead === true, 'First interaction must provision a new customer');
  assert(res1.matchedBy === 'new_lead', 'Match reason must be new_lead');
  assert(Boolean(res1.leadId), 'Must return a valid leadId');
  const claireLeadId = res1.leadId;
  console.log(`✓ Claire Dubois registered on WhatsApp: Lead ID ${claireLeadId}`);

  // 1.2 Inbound Web Chat event with same normalized phone: must resolve to Claire without creating duplicate lead
  const res2 = await IdentityResolver.resolveCustomer({
    userId: testTenantId,
    channel: 'web',
    externalUserId: 'web-session-dubois-01',
    senderName: 'Claire D.',
    phone: '06 12 34 56 78', // Unformatted French local format -> resolves to +33612345678
    email: 'claire@dubois-design.fr',
  });

  assert(res2.isNewLead === false, 'Same phone must resolve to existing customer record');
  assert(res2.leadId === claireLeadId, 'Lead ID must match Claire Dubois');
  assert(res2.matchedBy === 'phone', 'Match reason must be phone');
  console.log(`✓ Web Chat session resolved to existing customer ${claireLeadId} via normalized phone`);

  // 1.3 Verify linked identities count for Claire
  const identities = await IdentityResolver.getCustomerIdentities(testTenantId, claireLeadId);
  assert(identities.length >= 2, 'Claire must have at least 2 linked channel identities (WhatsApp and Web)');
  console.log(`✓ Verified ${identities.length} linked channel identities for customer ${claireLeadId}`);

  // 1.4 Weak identifier (Instagram display name without phone/email): must NOT auto-merge to prevent identity corruption
  const res3 = await IdentityResolver.resolveCustomer({
    userId: testTenantId,
    channel: 'instagram',
    externalUserId: 'ig_claire_paris',
    senderName: 'Claire Dubois', // Same display name, but no verified phone or email
  });

  assert(res3.isNewLead === true, 'Weak identifier without verified contact must NOT auto-merge');
  assert(res3.leadId !== claireLeadId, 'Instagram profile must have separate leadId pending verification');
  const igLeadId = res3.leadId;
  console.log(`✓ Identity safety verified: Weak Instagram identity isolated to Lead ${igLeadId}`);
  console.log('✓ TEST 1 PASSED: Identity resolution & deduplication verified.');

  // ----------------------------------------------------------------
  // TEST 2: Customer Merging with Audit Logging & Tenant Isolation (WS-03)
  // ----------------------------------------------------------------
  console.log('\n--- TEST 2: Customer Merging & Strict Multi-Tenant Isolation ---');

  // 2.1 Cross-tenant merge attempt: must be strictly rejected
  const crossTenantRes = await IdentityResolver.mergeCustomers({
    userId: testTenantId,
    targetLeadId: claireLeadId,
    sourceLeadId: 'unauthorized-cross-tenant-lead',
  });
  // Since unauthorized lead is not found or from another user, merge must be safely rejected
  assert(crossTenantRes.success === false, 'Cross-tenant or invalid merge must fail');
  console.log(`✓ Cross-tenant merge boundary enforced: ${crossTenantRes.error}`);

  // 2.2 Authorized merge of Instagram profile into Claire's main profile
  const mergeRes = await IdentityResolver.mergeCustomers({
    userId: testTenantId,
    targetLeadId: claireLeadId,
    sourceLeadId: igLeadId,
    actorId: 'admin-agent-01',
  });

  assert(mergeRes.success === true, 'Authorized merge must succeed');
  assert(mergeRes.reassignedCounts.identities >= 1, 'Instagram channel identity must be reassigned');
  assert(Boolean(mergeRes.auditLogId), 'Audit log must be emitted');
  console.log(`✓ Merge succeeded: IG Lead ${igLeadId} merged into Primary Lead ${claireLeadId} (Audit Log: ${mergeRes.auditLogId})`);
  console.log('✓ TEST 2 PASSED: Merge workflows & tenant boundaries verified.');

  // ----------------------------------------------------------------
  // TEST 3: Unified Omnichannel Inbox & Internal Staff Notes (WS-02)
  // ----------------------------------------------------------------
  console.log('\n--- TEST 3: Unified Inbox & Internal Staff Notes (WS-02) ---');

  const convoId = `convo-inbox-${Date.now()}`;
  InboxService.seedConversation({
    id: convoId,
    user_id: testTenantId,
    lead_id: claireLeadId,
    customer_name: 'Claire Dubois',
    customer_phone: phone,
    channel: 'WhatsApp',
    status: 'active',
    unread_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [],
  });

  // 3.1 Post customer-facing outbound reply
  const publicMsg = await InboxService.postMessage({
    conversationId: convoId,
    userId: testTenantId,
    role: 'human',
    content: 'Bonjour Claire, we are preparing your consultation details.',
    isInternal: false,
  });
  assert(publicMsg.isInternal === false, 'Customer message must not be marked internal');
  console.log(`✓ Customer message dispatched to channel: "${publicMsg.message.content}"`);

  // 3.2 Post private internal note for staff
  const internalNote = await InboxService.postMessage({
    conversationId: convoId,
    userId: testTenantId,
    role: 'human',
    content: 'STAFF ONLY: Customer is VIP tier 1. Offer 15% discount on skincare package.',
    isInternal: true,
  });
  assert(internalNote.isInternal === true, 'Private note must be marked internal');
  console.log(`✓ Internal note recorded: "${internalNote.message.content}" (is_internal: true)`);

  // 3.3 Verify internal note privacy and staff view
  const publicMessages = await InboxService.fetchMessages(convoId);
  assert(publicMessages.length === 1, 'Default message fetch excludes internal notes');

  const messages = await InboxService.fetchMessages(convoId, 50, true);
  assert(messages.length === 2, 'Staff conversation view must contain both messages');
  assert(messages[1].is_internal === true, 'Second message must be private staff note');
  console.log(`✓ Message history verified: 2 messages loaded with internal note privacy intact`);

  // 3.4 Update conversation priority and assignment
  await InboxService.updateConversation({
    conversationId: convoId,
    userId: testTenantId,
    priority: 'urgent',
    assignedTo: 'agent-sophie',
    status: 'needs_attention',
  });
  console.log(`✓ Conversation priority updated to URGENT, assigned to agent-sophie`);
  console.log('✓ TEST 3 PASSED: Unified Inbox & Internal notes verified.');

  // ----------------------------------------------------------------
  // TEST 4: Real-time Presence & Collision Detection (WS-02)
  // ----------------------------------------------------------------
  console.log('\n--- TEST 4: Real-time Presence & Collision Detection (WS-02) ---');

  // Agent 1 (Alice) views conversation
  InboxService.registerViewer(convoId, 'agent-alice', 'Alice Dupont');

  // Agent 2 (Bob) checks collision status
  const bobCheck = InboxService.getCollisionState(convoId, 'agent-bob');
  assert(bobCheck.hasCollision === true, 'Bob must detect that Alice is active in this thread');
  assert(bobCheck.activeViewers.includes('Alice Dupont'), 'Active viewers must include Alice Dupont');
  console.log(`✓ Collision detected for Bob: Active viewer "${bobCheck.activeViewers.join(', ')}"`);

  // Alice checks collision status (should not collide with herself)
  const aliceCheck = InboxService.getCollisionState(convoId, 'agent-alice');
  assert(aliceCheck.hasCollision === false, 'Alice should not trigger a collision with herself');
  console.log(`✓ Self-collision correctly ignored for Alice`);

  // Clean up viewer
  InboxService.removeViewer(convoId, 'agent-alice');
  const postEvictCheck = InboxService.getCollisionState(convoId, 'agent-bob');
  assert(postEvictCheck.hasCollision === false, 'After Alice departs, collision state must clear');
  console.log(`✓ Presence eviction verified: collision state cleared`);
  console.log('✓ TEST 4 PASSED: Real-time presence & collision detection verified.');

  // ----------------------------------------------------------------
  // TEST 5: Tool-Augmented AI Workforce (WS-04)
  // ----------------------------------------------------------------
  console.log('\n--- TEST 5: Tool-Augmented AI Workforce (WS-04) ---');

  // 5.1 Zod validation failure check
  const invalidDateRes = await ToolExecutor.executeTool(
    'checkCalendarAvailability',
    { date: 'invalid-date-format' },
    { userId: testTenantId }
  );
  assert(invalidDateRes.success === false, 'Invalid parameter must fail Zod validation');
  console.log(`✓ Zod schema rejected invalid date parameter: ${invalidDateRes.error}`);

  // 5.2 Server-side security check: Missing userId
  const unauthorizedRes = await ToolExecutor.executeTool(
    'checkCalendarAvailability',
    { date: '2026-11-05' },
    { userId: '' }
  );
  assert(unauthorizedRes.success === false, 'Missing userId context must be rejected');
  console.log(`✓ Unauthorized tool execution blocked: ${unauthorizedRes.error}`);

  // 5.3 checkCalendarAvailability: Check slots for 2026-11-05
  const availRes = await ToolExecutor.executeTool(
    'checkCalendarAvailability',
    { date: '2026-11-05' },
    { userId: testTenantId }
  );
  assert(availRes.success === true, 'Availability check must succeed');
  assert(availRes.data.availableSlotsCount > 0, 'Available slots must be returned');
  console.log(`✓ Available slots on 2026-11-05: ${availRes.data.availableSlotsCount} slots open`);

  // 5.4 bookAppointment: Book valid slot with audit log
  const startApt = '2026-11-05T14:00:00.000Z';
  const endApt = '2026-11-05T15:00:00.000Z';
  const bookRes = await ToolExecutor.executeTool(
    'bookAppointment',
    {
      customerName: 'Claire Dubois',
      customerPhone: phone,
      serviceName: 'Executive Facial Treatment',
      startTime: startApt,
      endTime: endApt,
      notes: 'Customer requested organic lavender oil',
    },
    { userId: testTenantId, agentRole: 'appointment', conversationId: convoId }
  );

  assert(bookRes.success === true, 'Valid appointment must be booked');
  assert(Boolean(bookRes.data.confirmationCode), 'Confirmation code must be generated');
  const bookedAptId = bookRes.data.appointmentId;
  console.log(`✓ Appointment booked: ID ${bookedAptId}, Code ${bookRes.data.confirmationCode}`);

  // 5.5 Conflict Detection: Attempt overlapping appointment
  const conflictRes = await ToolExecutor.executeTool(
    'bookAppointment',
    {
      customerName: 'Michel Blanc',
      serviceName: 'Consultation',
      startTime: '2026-11-05T14:30:00.000Z', // Overlaps with 14:00 - 15:00
      endTime: '2026-11-05T15:30:00.000Z',
    },
    { userId: testTenantId, agentRole: 'appointment' }
  );
  assert(conflictRes.success === false, 'Overlapping appointment must be rejected');
  assert(conflictRes.conflict === true, 'Conflict flag must be true');
  console.log(`✓ Conflict detection blocked double-booking: "${conflictRes.error}"`);

  // 5.6 modifyAppointment: Reschedule to non-conflicting time
  const modifyRes = await ToolExecutor.executeTool(
    'modifyAppointment',
    {
      appointmentId: bookedAptId,
      startTime: '2026-11-05T16:00:00.000Z',
      endTime: '2026-11-05T17:00:00.000Z',
      notes: 'Rescheduled upon customer request',
    },
    { userId: testTenantId, agentRole: 'appointment' }
  );
  assert(modifyRes.success === true, 'Rescheduling must succeed');
  console.log(`✓ Appointment modified: Rescheduled to 16:00 - 17:00`);

  // 5.7 getOrderStatus: Query customer order
  ToolExecutor.seedOrder({
    id: 'ord-101',
    user_id: testTenantId,
    order_number: 'ORD-90210',
    customer_name: 'Claire Dubois',
    customer_phone: phone,
    customer_email: 'claire@dubois-design.fr',
    lead_id: claireLeadId,
    status: 'completed',
    payment_status: 'paid',
    total_amount: 145.0,
    currency: 'EUR',
    items: [{ name: 'Hydrating Face Cream', quantity: 2, price: 50.0 }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const orderRes = await ToolExecutor.executeTool(
    'getOrderStatus',
    { orderNumberOrId: 'ORD-90210' },
    { userId: testTenantId }
  );
  assert(orderRes.success === true, 'Order lookup must succeed');
  assert(orderRes.data.status === 'completed', 'Order status must be completed');
  assert(orderRes.data.totalAmount === 145.0, 'Order total must match');
  console.log(`✓ Order lookup verified: ORD-90210 -> Status: ${orderRes.data.status}, Total: €${orderRes.data.totalAmount}`);

  // 5.8 updateCustomerProfile: Update customer tags and notes
  const updateRes = await ToolExecutor.executeTool(
    'updateCustomerProfile',
    { customerId: claireLeadId, tags: ['vip', 'verified'], notes: 'Prefers morning appointments' },
    { userId: testTenantId, agentRole: 'support' }
  );
  assert(updateRes.success === true, 'Profile update must succeed');
  console.log(`✓ Customer profile updated with tags and notes`);

  // 5.9 cancelAppointment: Cancel the appointment with audit log
  const cancelRes = await ToolExecutor.executeTool(
    'cancelAppointment',
    { appointmentId: bookedAptId, reason: 'Customer scheduling conflict' },
    { userId: testTenantId, agentRole: 'appointment' }
  );
  assert(cancelRes.success === true, 'Cancellation must succeed');
  console.log(`✓ Appointment cancelled: ${cancelRes.data.message}`);

  // Verify audit logs were produced
  const auditLogs = ToolExecutor.getAuditLogs();
  assert(auditLogs.length >= 4, 'All tool executions must generate immutable audit logs');
  console.log(`✓ Immutable audit logs verified: ${auditLogs.length} audit entries created`);
  console.log('✓ TEST 5 PASSED: Tool-Augmented AI Workforce verified.');

  // ----------------------------------------------------------------
  // TEST 6: Integrated End-to-End Pipeline with Tool Calling
  // ----------------------------------------------------------------
  console.log('\n--- TEST 6: Integrated End-to-End Pipeline with Tool Calling ---');

  const e2eEventId = `e2e-order-${Date.now()}`;
  const e2eResult = await AIOrchestrator.handleInboundMessage({
    userId: testTenantId,
    channel: 'WhatsApp',
    senderName: 'Claire Dubois',
    senderPhone: phone,
    messageText: 'Hello, could you please check the status of my order ORD-90210?',
    metadata: { eventId: e2eEventId },
  });

  assert(Boolean(e2eResult.conversationId), 'Must return a conversationId');
  assert(e2eResult.leadId === claireLeadId, 'Must resolve to Claire Dubois CRM Lead');
  assert(e2eResult.aiResponse.replyText.includes('ORD-90210'), 'AI reply must cite the order number');
  assert(e2eResult.aiResponse.replyText.toLowerCase().includes('completed'), 'AI reply must cite order completed status');
  console.log(`✓ End-to-End WhatsApp Response: "${e2eResult.aiResponse.replyText}"`);

  // Verify usage metering accounted for the AI request
  const summary = await UsageService.getMonthlySummary(testTenantId);
  assert(summary.metrics['ai_requests'].currentUsage >= 1, 'AI request must be recorded in usage meter');
  assert(summary.metrics['whatsapp_messages'].currentUsage >= 1, 'WhatsApp message must be metered');
  console.log(`✓ Usage metering verified: AI requests: ${summary.metrics['ai_requests'].currentUsage}, WhatsApp: ${summary.metrics['whatsapp_messages'].currentUsage}`);
  console.log('✓ TEST 6 PASSED: Integrated End-to-End tool pipeline verified.');

  console.log('\n================================================================');
  console.log(' 🎉 ALL SPRINT 2 VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runSprint2Verification().catch((err) => {
  console.error('\n❌ Sprint 2 Verification Failed:', err);
  process.exit(1);
});
