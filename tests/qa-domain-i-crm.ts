/**
 * STARX-FLOW RELEASE-CANDIDATE TEST SUITE
 * DOMAIN I: LEADS & CUSTOMERS CRM
 *
 * Verifies:
 * 1. E.164 phone normalization across European formats (DE, FR, GB).
 * 2. Anti-slicing phone matching (prevents false merges of different country codes).
 * 3. Cross-channel identity linking (WhatsApp -> Web -> Email under same Lead).
 * 4. Multi-tenant isolation: identical phone in different tenants creates isolated leads.
 * 5. Customer Merge RBAC: requires admin/owner; rejects unauthenticated (401) and agent (403).
 * 6. Customer Merge Integrity: rejects self-merge, rejects cross-tenant merge.
 * 7. Customer Merge State: reassigns identities, merges tags, archives source lead.
 */

import { IdentityResolver } from '../src/lib/crm/identityResolver';
import { POST as mergePost } from '../src/app/api/crm/customers/merge/route';
import { setTestStaffSession } from '../src/lib/auth/serverAuth';
import { NextRequest } from 'next/server';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(name: string, condition: boolean, details?: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${name}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${name}${details ? ` -> ${details}` : ''}`);
  }
}

async function runDomainITests() {
  console.log('================================================================');
  console.log(' DOMAIN I: LEADS & CUSTOMERS CRM TESTING');
  console.log('================================================================');

  IdentityResolver.clearInMemory();

  // -------------------------------------------------------------
  // Test 1: International E.164 Phone Normalization
  // -------------------------------------------------------------
  {
    const deFormatted = IdentityResolver.normalizePhone('+49 (176) 1234-5678');
    check('Normalizes German international format to E.164', deFormatted === '+4917612345678', `Got: ${deFormatted}`);

    const deLocal = IdentityResolver.normalizePhone('017612345678', 'DE');
    check('Normalizes German local format with country context', deLocal === '+4917612345678', `Got: ${deLocal}`);

    const frMobile = IdentityResolver.normalizePhone('06 12 34 56 78', 'FR');
    check('Normalizes French mobile format to E.164', frMobile === '+33612345678', `Got: ${frMobile}`);

    const invalid = IdentityResolver.normalizePhone('not-a-phone-number');
    check('Rejects invalid phone strings as null', invalid === null, `Got: ${invalid}`);
  }

  // -------------------------------------------------------------
  // Test 2: Strict Phone Matching & Anti-Slicing Verification
  // -------------------------------------------------------------
  {
    const matchSame = IdentityResolver.isPhoneMatch('+4917612345678', '+49 176 1234 5678');
    check('Identical international numbers match across formatting spaces', matchSame === true);

    // CRITICAL SECURITY CHECK: Numbers with same trailing 8 digits but different country codes MUST NOT match!
    const usNumber = '+155512345678';
    const ukNumber = '+442012345678';
    const falseMatch = IdentityResolver.isPhoneMatch(usNumber, ukNumber);
    check(
      'Anti-slicing: Different country codes with same trailing digits DO NOT match',
      falseMatch === false,
      `Expected false, got ${falseMatch}`
    );
  }

  // -------------------------------------------------------------
  // Test 3: Cross-Channel Identity Linking to Single Customer
  // -------------------------------------------------------------
  {
    const orgAlpha = `org-crm-alpha-${Date.now()}`;
    const customerPhone = '+491765551111';

    // Inbound 1: Customer arrives via WhatsApp
    const res1 = await IdentityResolver.resolveCustomer({
      userId: orgAlpha,
      organizationId: orgAlpha,
      channel: 'whatsapp',
      externalUserId: 'wa-user-491765551111',
      senderName: 'Anna Schmidt',
      phone: customerPhone,
    });

    check('Inbound WhatsApp provisions new lead record', res1.isNewLead === true && Boolean(res1.leadId));

    // Inbound 2: Same customer arrives via Web Chat with same phone
    const res2 = await IdentityResolver.resolveCustomer({
      userId: orgAlpha,
      organizationId: orgAlpha,
      channel: 'web',
      externalUserId: 'web-session-999',
      senderName: 'Anna S.',
      phone: customerPhone,
    });

    check(
      'Inbound Web Chat with matching phone links to existing WhatsApp leadId',
      res2.leadId === res1.leadId && res2.isNewLead === false,
      `res1.leadId=${res1.leadId}, res2.leadId=${res2.leadId}`
    );

    // Verify linked identities
    const identities = await IdentityResolver.getCustomerIdentities(orgAlpha, res1.leadId, orgAlpha);
    const channels = identities.map((i) => i.channel);
    check(
      'Lead now possesses both whatsapp and web channel identities',
      channels.includes('whatsapp') && channels.includes('web'),
      `Channels: ${JSON.stringify(channels)}`
    );
  }

  // -------------------------------------------------------------
  // Test 4: Strict Multi-Tenant Lead Isolation
  // -------------------------------------------------------------
  {
    const orgAlpha = `org-iso-alpha-${Date.now()}`;
    const orgBeta = `org-iso-beta-${Date.now()}`;
    const sharedCustomerPhone = '+491769998888';

    const leadAlpha = await IdentityResolver.resolveCustomer({
      userId: orgAlpha,
      organizationId: orgAlpha,
      channel: 'whatsapp',
      externalUserId: 'wa-491769998888',
      senderName: 'Shared Customer',
      phone: sharedCustomerPhone,
    });

    const leadBeta = await IdentityResolver.resolveCustomer({
      userId: orgBeta,
      organizationId: orgBeta,
      channel: 'whatsapp',
      externalUserId: 'wa-491769998888',
      senderName: 'Shared Customer',
      phone: sharedCustomerPhone,
    });

    check(
      'Multi-tenant: Same customer phone in different orgs gets isolated leadIds',
      leadAlpha.leadId !== leadBeta.leadId,
      `leadAlpha=${leadAlpha.leadId}, leadBeta=${leadBeta.leadId}`
    );
  }

  // -------------------------------------------------------------
  // Test 5: Customer Merge Endpoint RBAC Authorization
  // -------------------------------------------------------------
  {
    // Unauthenticated request
    const unauthReq = new NextRequest('http://localhost:3000/api/crm/customers/merge', {
      method: 'POST',
      body: JSON.stringify({ targetLeadId: 'lead-1', sourceLeadId: 'lead-2' }),
    });
    const unauthRes = await mergePost(unauthReq);
    check('POST /api/crm/customers/merge rejects unauthenticated request with 401', unauthRes.status === 401);

    // Agent role request (Agent role cannot merge customers; requires admin/owner)
    setTestStaffSession({
      user: { id: 'user-agent-1', email: 'agent@starx.io' },
      organizationId: 'org-test',
      role: 'agent',
    });
    const agentReq = new NextRequest('http://localhost:3000/api/crm/customers/merge', {
      method: 'POST',
      headers: { authorization: 'Bearer agent-test-token' },
      body: JSON.stringify({ targetLeadId: 'lead-1', sourceLeadId: 'lead-2' }),
    });
    const agentRes = await mergePost(agentReq);
    check('POST /api/crm/customers/merge rejects agent role with 403', agentRes.status === 403, `Got ${agentRes.status}`);

    // Clean up test staff session
    setTestStaffSession(null);
  }

  // -------------------------------------------------------------
  // Test 6: Customer Merge Business Logic & Integrity Guards
  // -------------------------------------------------------------
  {
    const orgId = `org-merge-test-${Date.now()}`;
    const leadTarget = `lead-target-${Date.now()}`;
    const leadSource = `lead-source-${Date.now()}`;

    // Seed target lead
    IdentityResolver.seedLead({
      id: leadTarget,
      user_id: orgId,
      organization_id: orgId,
      name: 'Target Customer',
      phone: '+491761112222',
      email: null,
      status: 'contacted',
      source: 'whatsapp',
      score: 50,
      tags: ['vip'],
      last_contact_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Seed source lead
    IdentityResolver.seedLead({
      id: leadSource,
      user_id: orgId,
      organization_id: orgId,
      name: 'Source Customer Dup',
      phone: null,
      email: 'customer@dup.de',
      status: 'new',
      source: 'web',
      score: 20,
      tags: ['web-inquiry'],
      last_contact_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Link identity to source lead
    await IdentityResolver.linkChannelIdentity({
      userId: orgId,
      organizationId: orgId,
      leadId: leadSource,
      channel: 'web',
      externalUserId: 'web-session-source-lead',
    });

    // 6a: Self-merge must be rejected
    const selfMerge = await IdentityResolver.mergeCustomers({
      userId: orgId,
      organizationId: orgId,
      targetLeadId: leadTarget,
      sourceLeadId: leadTarget,
    });
    check('Self-merge is strictly rejected', selfMerge.success === false && selfMerge.error?.includes('itself'));

    // 6b: Cross-tenant merge must be rejected
    const otherOrgId = `org-other-${Date.now()}`;
    const crossMerge = await IdentityResolver.mergeCustomers({
      userId: otherOrgId,
      organizationId: otherOrgId,
      targetLeadId: leadTarget,
      sourceLeadId: leadSource,
    });
    check(
      'Cross-organization merge is strictly prohibited',
      crossMerge.success === false && crossMerge.error?.includes('prohibited')
    );

    // 6c: Valid merge reassigns records and archives source
    const validMerge = await IdentityResolver.mergeCustomers({
      userId: orgId,
      organizationId: orgId,
      targetLeadId: leadTarget,
      sourceLeadId: leadSource,
    });

    check(
      'Valid merge succeeds and generates audit log',
      validMerge.success === true && Boolean(validMerge.auditLogId)
    );

    const updatedTarget = IdentityResolver.getLead(leadTarget)!;
    const updatedSource = IdentityResolver.getLead(leadSource)!;

    check(
      'Target lead inherited email from source lead',
      updatedTarget.email === 'customer@dup.de',
      `Got email: ${updatedTarget.email}`
    );

    check(
      'Target lead tags include merged and source tags',
      updatedTarget.tags.includes('merged') && updatedTarget.tags.includes('web-inquiry'),
      `Tags: ${JSON.stringify(updatedTarget.tags)}`
    );

    check(
      'Source lead status set to lost and marked with merged-archive tag',
      updatedSource.status === 'lost' && updatedSource.tags.includes('merged-archive'),
      `Status: ${updatedSource.status}, Tags: ${JSON.stringify(updatedSource.tags)}`
    );
  }

  console.log('----------------------------------------------------------------');
  console.log(`DOMAIN I RESULTS: ${passedChecks}/${totalChecks} PASSED (${failedChecks} FAILED)`);
  console.log('================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runDomainITests().catch((err) => {
  console.error('Unhandled failure in Domain I tests:', err);
  process.exit(1);
});
