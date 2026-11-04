/**
 * StarX-Flow QA Test Suite - Domain F: Website Chat Widget
 * Probes widget script delivery, host resolution, CORS headers, preflight OPTIONS,
 * chat session creation, rate limiting, and config security.
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

async function runDomainFTests() {
  console.log('================================================================');
  console.log(' DOMAIN F: WEBSITE CHAT WIDGET TESTING');
  console.log('================================================================');

  const { NextRequest } = await import('next/server');
  const { GET: getWidgetJs } = await import('../src/app/widget.js/route');
  const { GET: getChatConfig } = await import('../src/app/api/chat/config/route');
  const { POST: postChat, OPTIONS: optionsChat } = await import('../src/app/api/chat/route') as any;

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

  // -------------------------------------------------------------
  // Test 1: GET /widget.js script delivery and script origin resolution
  // -------------------------------------------------------------
  {
    const res = await getWidgetJs();
    const js = await res.text();
    const hasCors = res.headers.get('access-control-allow-origin') === '*';
    const usesScriptSrc = js.includes('currentScript.src') || js.includes('scriptUrl');

    check('GET /widget.js returns 200 with javascript and CORS header', res.status === 200 && hasCors);
    check(
      'widget.js derives host from currentScript.src (not window.location.origin)',
      usesScriptSrc,
      `Script snippet does not use currentScript.src for host resolution`
    );
  }

  // -------------------------------------------------------------
  // Test 2: CORS Preflight OPTIONS /api/chat
  // -------------------------------------------------------------
  {
    check('OPTIONS handler exists on /api/chat route', typeof optionsChat === 'function');
    if (typeof optionsChat === 'function') {
      const res = await optionsChat(new Request('http://localhost:3000/api/chat', { method: 'OPTIONS' }));
      const allowOrigin = res.headers.get('access-control-allow-origin');
      check('OPTIONS /api/chat returns 200 with Access-Control-Allow-Origin: *', res.status === 200 && allowOrigin === '*');
    } else {
      check('OPTIONS /api/chat returns 200 with Access-Control-Allow-Origin: *', false, 'Handler missing');
    }
  }

  // -------------------------------------------------------------
  // Test 3: POST /api/chat CORS headers
  // -------------------------------------------------------------
  {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, what services do you provide?',
        sessionId: `test-session-${Date.now()}`,
        organizationId: 'org-widget-test',
      }),
    });
    const res = await postChat(req);
    const allowOrigin = res.headers.get('access-control-allow-origin');
    check('POST /api/chat response contains Access-Control-Allow-Origin: *', allowOrigin === '*', `Got: ${allowOrigin}`);

    const data = await res.json();
    check('POST /api/chat returns conversationId and AI reply', Boolean(data.conversationId) && Boolean(data.reply));
  }

  // -------------------------------------------------------------
  // Test 4: POST /api/chat rate limiting (abuse prevention)
  // -------------------------------------------------------------
  {
    const floodSession = `flood-session-${Date.now()}`;
    let hitRateLimit = false;

    // Dispatches 35 rapid requests from the same session
    for (let i = 0; i < 35; i++) {
      const req = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.0.113.195',
        },
        body: JSON.stringify({
          message: `Rapid message ${i}`,
          sessionId: floodSession,
          organizationId: 'org-widget-test',
        }),
      });
      const res = await postChat(req);
      if (res.status === 429) {
        hitRateLimit = true;
        break;
      }
    }

    check('High frequency message flood correctly triggers HTTP 429 Rate Limit', hitRateLimit === true);
  }

  // -------------------------------------------------------------
  // Test 5: GET /api/chat/config security and privacy
  // -------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/chat/config?organizationId=org-widget-test');
    const res = await getChatConfig(req);
    const config = await res.json();

    const noPrivateSecrets = !config.apiKey && !config.supabaseKey && !config.credentials;
    const hasPublicFields = Boolean(config.businessName) && Array.isArray(config.services);

    check('GET /api/chat/config returns public fields and zero secrets', res.status === 200 && noPrivateSecrets && hasPublicFields);
  }

  console.log('----------------------------------------------------------------');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`DOMAIN F RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDomainFTests().catch((err) => {
  console.error('Fatal error running Domain F tests:', err);
  process.exit(1);
});
