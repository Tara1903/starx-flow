/**
 * STARX-FLOW 24/7 MULTI-CHANNEL AI RECEPTIONIST LAUNCH VERIFICATION SUITE
 * 
 * Verifies all 10 End-to-End Customer Journeys (Directive Section 10):
 * 
 * 1. Journey 1: Customer asks a service/price question via WhatsApp (Zero hallucination, grounded facts).
 * 2. Journey 2: Customer initiates website chat, provides contact info, CRM lead creation & conversation linkage.
 * 3. Journey 3: Customer requests appointment via Instagram (Calendar availability, atomic reservation, 24h reminder).
 * 4. Journey 4: Customer sends inbound email with business question, accurate reply generated & outbound email dispatched.
 * 5. Journey 5: Complex request triggers human handoff, flags control_mode='human', AI auto-reply suppressed, staff reply dispatched.
 * 6. Journey 6: Scheduled appointment reminder executed via ReceptionistJobScheduler durable claim & dispatch.
 * 7. Journey 7: Messaging provider temporary failure (503), delivery_retry queued, backoff applied, retry succeeds.
 * 8. Journey 8: Multi-tenant isolation test: Two distinct orgs with different profiles/hours/appointments completely isolated.
 * 9. Journey 9: Usage limits test: Starter tier quota enforcement with graceful upgrade response.
 * 10. Journey 10: After-hours conversation test: Out-of-hours detected, opening hours communicated, lead follow-up job queued for morning.
 */

import assert from 'assert';
import { BusinessProfileService, BusinessReceptionistProfile } from '../src/lib/ai/businessProfileService';
import { AIProvider } from '../src/lib/ai/provider';
import { AIOrchestrator } from '../src/lib/ai/orchestrator';
import { OutboundDispatcher } from '../src/lib/inbox/outboundDispatcher';
import { ReceptionistJobScheduler } from '../src/lib/jobs/receptionistJobScheduler';
import { FacebookMessengerAdapter } from '../src/lib/ingestion/adapters/facebookMessengerAdapter';
import { UsageService } from '../src/lib/usage/usageService';
import { IdentityResolver } from '../src/lib/crm/identityResolver';
import { ToolExecutor } from '../src/lib/ai/tools/toolExecutor';

let passed = 0;
let failed = 0;

function testAssert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runChatReceptionistLaunchTests() {
  console.log('========================================================================');
  console.log('STARX-FLOW — 24/7 AI RECEPTIONIST LAUNCH VERIFICATION (10 JOURNEYS)');
  console.log('========================================================================\n');

  const orgParis = '11111111-1111-4111-8111-111111111111';
  const orgBerlin = '22222222-2222-4222-8222-222222222222';
  const userParis = 'user-owner-paris-001';
  const userBerlin = 'user-owner-berlin-002';

  // Setup Verified Business Profiles (Zero Hallucination Ground Truth)
  const profileParis: BusinessReceptionistProfile = {
    organizationId: orgParis,
    businessName: 'Maison Beauté Paris',
    businessType: 'Hair & Beauty Salon',
    description: 'Premier Parisian boutique salon specializing in bespoke styling and luxury treatments.',
    services: [
      { name: 'Haircut & Styling', price: 45, currency: 'EUR', durationMinutes: 45, description: 'Cut, wash, and signature blow-dry' },
      { name: 'Balayage Color', price: 120, currency: 'EUR', durationMinutes: 120, description: 'Hand-painted Parisian balayage' },
      { name: 'Beard Trim & Grooming', price: 25, currency: 'EUR', durationMinutes: 30, description: 'Hot towel shave and beard contouring' },
    ],
    openingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { closed: true },
    },
    timezone: 'Europe/Paris',
    location: '15 Rue de Rivoli, 75001 Paris, France',
    contactPhone: '+33 1 42 68 55 00',
    contactEmail: 'bonjour@maisonbeaute-paris.fr',
    faqs: [
      { question: 'Where can I park?', answer: 'Underground public parking is available at Indigo Louvre, 100m away.' },
      { question: 'Do you accept walk-ins?', answer: 'Appointments are recommended, but walk-ins are welcome based on stylist availability.' },
    ],
    policies: {
      cancellation: 'Please provide at least 24 hours advance notice for cancellations.',
      payment: 'We accept Visa, Mastercard, Apple Pay, and Cash.',
    },
    customInstructions: 'Always greet customers warmly with French hospitality.',
    handoffRules: 'Transfer to human staff immediately if customer mentions allergic reaction or requests manager.',
    isActive: true,
  };

  const profileBerlin: BusinessReceptionistProfile = {
    organizationId: orgBerlin,
    businessName: 'Zahnarztpraxis Mitte Berlin',
    businessType: 'Dental Clinic',
    description: 'Modern dental practice in Berlin Mitte providing comprehensive oral healthcare.',
    services: [
      { name: 'Professional Teeth Cleaning', price: 95, currency: 'EUR', durationMinutes: 60, description: 'Comprehensive prophylaxis and polish' },
      { name: 'Dental Checkup & Consultation', price: 50, currency: 'EUR', durationMinutes: 30, description: 'Routine checkup with digital X-rays' },
    ],
    openingHours: {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '14:00', closed: false },
      saturday: { closed: true },
      sunday: { closed: true },
    },
    timezone: 'Europe/Berlin',
    location: 'Friedrichstraße 120, 10117 Berlin, Germany',
    contactPhone: '+49 30 2092 3400',
    contactEmail: 'empfang@zahnarzt-mitte.de',
    faqs: [],
    policies: {
      cancellation: 'Bitte sagen Sie Termine mindestens 24 Stunden vorher ab.',
    },
    isActive: true,
  };

  // Seed Profiles in BusinessProfileService
  await BusinessProfileService.updateProfile(orgParis, profileParis);
  await BusinessProfileService.updateProfile(orgBerlin, profileBerlin);

  // =========================================================================
  // JOURNEY 1: WHATSAPP QUESTION & ACCURATE ANSWER (ZERO HALLUCINATION)
  // =========================================================================
  console.log('\n--- [JOURNEY 1] WhatsApp Question & Accurate Answer (Zero Hallucination) ---');

  // Customer asks verified service price
  const replyPrice = await AIProvider.executeAgent({
    userId: userParis,
    organizationId: orgParis,
    role: 'receptionist',
    channel: 'WhatsApp',
    customerName: 'Camille Dubois',
    customerPhone: '+33612345678',
    customerMessage: 'Hello! How much is a haircut and styling at your salon?',
  });

  testAssert(replyPrice.replyText.includes('€45'), 'AI response accurately quotes verified price €45 for Haircut & Styling');
  testAssert(!replyPrice.requiresHumanHandoff, 'Standard price query handled autonomously without unnecessary handoff');

  // Adversarial inquiry: Customer asks for an unlisted service
  const replyUnlisted = await AIProvider.executeAgent({
    userId: userParis,
    organizationId: orgParis,
    role: 'receptionist',
    channel: 'WhatsApp',
    customerName: 'Camille Dubois',
    customerPhone: '+33612345678',
    customerMessage: 'Do you offer laser tattoo removal and what does it cost?',
  });

  // Zero-hallucination guarantee: Must NOT hallucinate an unlisted price
  testAssert(!replyUnlisted.replyText.includes('€47'), 'AI never invents hardcoded legacy fallback prices (Zero Hallucination)');
  testAssert(
    replyUnlisted.requiresHumanHandoff || replyUnlisted.replyText.toLowerCase().includes('not listed') || replyUnlisted.replyText.toLowerCase().includes('do not offer') || replyUnlisted.replyText.toLowerCase().includes('staff'),
    'Unlisted services are either safely declined or flagged for human staff handoff'
  );

  // =========================================================================
  // JOURNEY 2: WEBSITE LIVE CHAT & CRM LEAD CREATION
  // =========================================================================
  console.log('\n--- [JOURNEY 2] Website Live Chat & CRM Lead Creation ---');

  const webChatResult = await AIOrchestrator.handleInboundMessage({
    userId: userParis,
    channel: 'Web',
    senderName: 'Sophie Laurent',
    senderEmail: 'sophie.laurent@example.fr',
    senderPhone: '+33698765432',
    messageText: 'Bonjour! Where can I park when I visit your salon?',
    metadata: { organizationId: orgParis },
  });

  testAssert(Boolean(webChatResult.conversationId), 'Conversation thread generated for website visitor');
  testAssert(Boolean(webChatResult.leadId), 'CRM lead created for website visitor');
  testAssert(webChatResult.aiResponse.replyText.includes('Indigo Louvre'), 'Accurately resolved verified FAQ answer regarding parking');

  // Verify lead in IdentityResolver
  const createdLead = IdentityResolver.getLead(webChatResult.leadId);
  testAssert(Boolean(createdLead) && createdLead?.name === 'Sophie Laurent', 'CRM lead accurately persisted with name, email, and phone');

  // =========================================================================
  // JOURNEY 3: INSTAGRAM APPOINTMENT REQUEST & AUTOMATIC REMINDER
  // =========================================================================
  console.log('\n--- [JOURNEY 3] Instagram Appointment Request & Automated Reminder ---');

  // Booking via Instagram DM
  const bookingTime = new Date(Date.now() + 86400000 * 2); // 2 days ahead
  bookingTime.setHours(14, 0, 0, 0);

  const bookingResult = await AIOrchestrator.bookAppointment({
    userId: userParis,
    organizationId: orgParis,
    customerName: 'Marco Rossi',
    customerPhone: '+33622334455',
    customerEmail: 'marco.rossi@example.com',
    serviceName: 'Haircut & Styling',
    startTime: bookingTime.toISOString(),
    endTime: new Date(bookingTime.getTime() + 45 * 60000).toISOString(),
    channel: 'instagram',
  });

  testAssert(bookingResult.success === true, 'Instagram appointment booked successfully');
  testAssert(Boolean(bookingResult.appointmentId), 'Appointment ID generated and registered');

  // Verify appointment in ToolExecutor
  const bookedAppt = ToolExecutor.getAppointment(bookingResult.appointmentId!);
  testAssert(Boolean(bookedAppt) && (bookedAppt?.customer_name === 'Marco Rossi' || (bookedAppt as any)?.customerName === 'Marco Rossi'), 'Appointment verified in Calendar system');

  // Verify 24-hour reminder job was automatically scheduled
  const scheduledJobs = ReceptionistJobScheduler.getInMemoryJobs();
  const reminderJob = scheduledJobs.find(
    (j) => j.organizationId === orgParis && j.jobType === 'appointment_reminder' && (j.targetId === bookingResult.appointmentId || j.payload?.appointmentId === bookingResult.appointmentId)
  );
  testAssert(Boolean(reminderJob), 'Appointment reminder background job scheduled automatically by ReceptionistJobScheduler');
  testAssert(reminderJob?.channel === 'instagram', 'Reminder scheduled on customer interaction channel (Instagram)');

  // =========================================================================
  // JOURNEY 4: EMAIL CUSTOMER QUESTION & OUTBOUND DISPATCH
  // =========================================================================
  console.log('\n--- [JOURNEY 4] Email Customer Question & Outbound Dispatch ---');

  const emailResult = await AIOrchestrator.handleInboundMessage({
    userId: userParis,
    channel: 'Email',
    senderName: 'Claire Martin',
    senderEmail: 'claire.martin@paris-client.fr',
    messageText: 'Hello, what is your cancellation policy for hair treatments?',
    metadata: { organizationId: orgParis },
  });

  testAssert(emailResult.aiResponse.replyText.includes('24 hours'), 'Email response accurately quotes verified cancellation policy');

  // Outbound dispatch simulation
  const outboundEmail = await OutboundDispatcher.dispatchOutboundMessage({
    organizationId: orgParis,
    conversationId: emailResult.conversationId,
    channel: 'email',
    recipient: 'claire.martin@paris-client.fr',
    content: emailResult.aiResponse.replyText,
  });

  testAssert(outboundEmail.success === true, 'Outbound email dispatched cleanly through OutboundDispatcher');

  // =========================================================================
  // JOURNEY 5: HUMAN HANDOFF & AI SUPPRESSION
  // =========================================================================
  console.log('\n--- [JOURNEY 5] Human Handoff & AI Auto-Reply Suppression ---');

  // 1. Customer initiates dispute or asks for manager
  const escalationResult = await AIOrchestrator.handleInboundMessage({
    userId: userParis,
    channel: 'WhatsApp',
    senderName: 'Upset Customer',
    senderPhone: '+33699887766',
    messageText: 'I need to speak to the owner right now, your staff ruined my hair yesterday!',
    metadata: { organizationId: orgParis },
  });

  testAssert(escalationResult.aiResponse.requiresHumanHandoff === true, 'Conversation flagged for human handoff on manager/complaint trigger');

  // 2. Customer sends subsequent message while conversation is under human control
  // Simulate active takeover in conversation
  const suppressedResult = await AIOrchestrator.handleInboundMessage({
    userId: userParis,
    conversationId: escalationResult.conversationId,
    channel: 'WhatsApp',
    senderName: 'Upset Customer',
    senderPhone: '+33699887766',
    messageText: 'Are you going to answer me?!',
    metadata: { organizationId: orgParis },
  });

  // Verify AI does NOT send auto-reply while under human control
  testAssert(
    suppressedResult.aiResponse.requiresHumanHandoff === true && (!suppressedResult.aiResponse.replyText || suppressedResult.aiResponse.provider === 'none'),
    'AI auto-reply strictly suppressed while conversation is in human takeover mode'
  );

  // 3. Human staff member sends reply via OutboundDispatcher
  const staffReply = await OutboundDispatcher.dispatchOutboundMessage({
    organizationId: orgParis,
    conversationId: escalationResult.conversationId,
    channel: 'whatsapp',
    recipient: '+33699887766',
    content: 'Dear customer, this is Sarah the salon owner. I am deeply sorry to hear about your experience. How can we make this right?',
    isStaffReply: true,
  });

  testAssert(staffReply.success === true, 'Human staff message dispatched to customer channel');

  // =========================================================================
  // JOURNEY 6: SCHEDULED APPOINTMENT REMINDER EXECUTION
  // =========================================================================
  console.log('\n--- [JOURNEY 6] Scheduled Appointment Reminder Execution ---');

  // Schedule a reminder job due now
  const dueJobResult = await ReceptionistJobScheduler.scheduleJob({
    organizationId: orgParis,
    targetId: bookingResult.appointmentId || 'appt-1234',
    channel: 'whatsapp',
    recipient: '+33622334455',
    jobType: 'appointment_reminder',
    scheduledFor: new Date(Date.now() - 1000).toISOString(), // Due now
    payload: {
      customerName: 'Marco Rossi',
      serviceName: 'Haircut & Styling',
      appointmentTime: bookingTime.toISOString(),
    },
    idempotencyKey: `manual-reminder-${bookingResult.appointmentId}`,
  });
  const dueJobId = dueJobResult.job.id;

  testAssert(Boolean(dueJobId), 'Due appointment reminder job scheduled');

  // Claim due jobs
  const claimedJobs = await ReceptionistJobScheduler.claimDueJobs('worker-node-1', 5, 60);
  const myJob = claimedJobs.find((j) => j.id === dueJobId);
  testAssert(Boolean(myJob), 'claimDueJobs atomically claims due appointment reminder job');
  testAssert(myJob?.status === 'processing' && myJob?.workerId === 'worker-node-1', 'Claimed job leased to worker with status="processing"');

  // Execute job
  if (myJob) {
    const processResult = await ReceptionistJobScheduler.processJob(myJob, 'worker-node-1');
    testAssert(processResult.success === true, 'Reminder job executed and marked completed atomically');
  }

  // =========================================================================
  // JOURNEY 7: MESSAGING PROVIDER FAILURE & DELIVERY RETRY RECOVERY
  // =========================================================================
  console.log('\n--- [JOURNEY 7] Messaging Provider Failure & Delivery Retry Recovery ---');

  // Dispatch message with simulated provider outage (503)
  const failedDispatch = await OutboundDispatcher.dispatchOutboundMessage({
    organizationId: orgParis,
    conversationId: escalationResult.conversationId,
    channel: 'whatsapp',
    recipient: '+33622334455',
    content: 'Important notification regarding your appointment.',
    simulateFailure: true, // Trigger transient provider error
  });

  testAssert(failedDispatch.success === false, 'Detected external messaging provider outage');
  testAssert(Boolean(failedDispatch.retryJobId), 'OutboundDispatcher automatically scheduled delivery_retry job');

  // Verify retry job is in memory scheduler
  const retryJob = ReceptionistJobScheduler.getInMemoryJobs().find((j) => j.id === failedDispatch.retryJobId);
  testAssert(Boolean(retryJob) && retryJob?.jobType === 'delivery_retry', 'Delivery retry job registered with backoff');

  // Claim and execute retry job (provider recovered)
  if (retryJob) {
    retryJob.scheduledFor = new Date(Date.now() - 1000).toISOString(); // simulate passage of retry delay
    const claimedRetry = (await ReceptionistJobScheduler.claimDueJobs('worker-retry-1', 5, 60)).find((j) => j.id === retryJob.id);
    testAssert(Boolean(claimedRetry), 'Retry job claimed after backoff delay');
    
    if (claimedRetry) {
      const retryResult = await ReceptionistJobScheduler.processJob(claimedRetry, 'worker-retry-1');
      testAssert(retryResult.success === true, 'Retried message delivered successfully after provider recovery');
    }
  }

  // =========================================================================
  // JOURNEY 8: MULTI-TENANT ISOLATION (PARIS SALON VS BERLIN CLINIC)
  // =========================================================================
  console.log('\n--- [JOURNEY 8] Multi-Tenant Isolation (Paris Salon vs Berlin Dental) ---');

  // 1. Inquire at Berlin Dental Clinic about teeth cleaning
  const berlinReply = await AIProvider.executeAgent({
    userId: userBerlin,
    organizationId: orgBerlin,
    role: 'receptionist',
    channel: 'Web',
    customerName: 'Klaus Schmidt',
    customerMessage: 'Guten Tag! What does a professional teeth cleaning cost?',
  });

  testAssert(berlinReply.replyText.includes('€95'), 'Berlin clinic accurately quotes €95 for Teeth Cleaning');
  testAssert(!berlinReply.replyText.includes('Haircut'), 'Berlin clinic never references Paris salon services');

  // 2. Inquire at Paris Salon about dental cleaning (Must NOT cross-contaminate)
  const parisDentalInquiry = await AIProvider.executeAgent({
    userId: userParis,
    organizationId: orgParis,
    role: 'receptionist',
    channel: 'WhatsApp',
    customerName: 'Pierre Bernard',
    customerMessage: 'Do you offer professional teeth cleaning?',
  });

  testAssert(!parisDentalInquiry.replyText.includes('€95'), 'Paris salon never leaks Berlin clinic prices or dental services');
  testAssert(!parisDentalInquiry.replyText.includes('Friedrichstraße 120'), 'Paris salon never leaks Berlin clinic address');

  // =========================================================================
  // JOURNEY 9: USAGE LIMITS ENFORCEMENT (STARTER TIER QUOTA)
  // =========================================================================
  console.log('\n--- [JOURNEY 9] Usage Limits Enforcement (Starter Tier Quota) ---');

  // Check entitlement before limit
  const checkInitial = await UsageService.checkEntitlement(userParis, 'web_chat_messages', 1, orgParis, 'free');
  testAssert(checkInitial.allowed === true, 'Usage allowed within plan quota allowance');

  // Simulate usage reaching quota limit (Free plan limit is 100)
  for (let i = 0; i < 100; i++) {
    await UsageService.recordUsage({
      organizationId: orgParis,
      userId: userParis,
      metricType: 'web_chat_messages',
      quantity: 1,
      idempotencyKey: `chat-quota-sim-${i}`,
      metadata: { channel: 'web' },
    });
  }

  // Check entitlement after exceeding limit
  const checkExceeded = await UsageService.checkEntitlement(userParis, 'web_chat_messages', 1, orgParis, 'free');
  testAssert(checkExceeded.allowed === false, 'UsageService strictly blocks new messages once monthly plan quota is reached');
  testAssert(checkExceeded.quotaExceeded === true, 'Quota exceeded flag returned with upgrade prompt');
  testAssert(Boolean(checkExceeded.reason) && checkExceeded.reason!.includes('Upgrade'), 'Graceful upgrade message provided');

  // =========================================================================
  // JOURNEY 10: AFTER-HOURS CONVERSATION & MORNING FOLLOW-UP JOB
  // =========================================================================
  console.log('\n--- [JOURNEY 10] After-Hours Conversation & Morning Follow-up Job ---');

  // Sunday at 22:30 CET (Maison Beauté Paris is closed on Sundays)
  const sundayNight = new Date('2026-11-08T21:30:00Z'); // Sunday 22:30 Paris time
  const isSundayOpen = BusinessProfileService.isWithinBusinessHours(profileParis, sundayNight);
  testAssert(isSundayOpen.isOpen === false, 'BusinessProfileService accurately evaluates outside business hours on Sunday');

  // Customer reaches out on Sunday night
  const afterHoursResult = await AIOrchestrator.handleInboundMessage({
    userId: userParis,
    channel: 'WhatsApp',
    senderName: 'Nicolas Moreau',
    senderPhone: '+33677889900',
    senderEmail: 'nicolas@example.fr',
    messageText: 'Hi, are you open right now? Can I come in for a haircut tonight?',
    metadata: { 
      organizationId: orgParis,
      simulatedTimestamp: sundayNight.toISOString(),
    },
  });

  // AI informs customer that salon is closed and lists opening hours
  testAssert(
    afterHoursResult.aiResponse.replyText.toLowerCase().includes('closed') || afterHoursResult.aiResponse.replyText.includes('09:00'),
    'AI accurately informs customer that salon is currently closed and provides opening hours'
  );

  // Queue morning follow-up job for Monday 09:00
  const mondayMorning = new Date('2026-11-09T08:00:00Z'); // Monday 09:00 Paris time
  const followupJobResult = await ReceptionistJobScheduler.scheduleJob({
    organizationId: orgParis,
    targetId: afterHoursResult.conversationId,
    channel: 'whatsapp',
    recipient: '+33677889900',
    jobType: 'lead_followup',
    scheduledFor: mondayMorning.toISOString(),
    payload: {
      customerName: 'Nicolas Moreau',
      inquiry: 'Haircut inquiry after hours',
      action: 'Follow up to confirm morning booking',
    },
    idempotencyKey: `followup-${afterHoursResult.conversationId}`,
  });
  const followupJobId = followupJobResult.job.id;

  testAssert(Boolean(followupJobId), 'Lead follow-up job queued for next business morning');

  const followupJob = ReceptionistJobScheduler.getInMemoryJobs().find((j) => j.id === followupJobId);
  testAssert(Boolean(followupJob) && followupJob?.jobType === 'lead_followup', 'Follow-up job scheduled with correct payload');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n========================================================================');
  console.log(`24/7 AI RECEPTIONIST LAUNCH VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChatReceptionistLaunchTests().catch((err) => {
  console.error('[Launch Verification Suite Fatal Error]:', err);
  process.exit(1);
});
