import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

for (const file of ['.env.local', '.env']) {
  const envPath = path.join(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = (match[2] || '').replace(/^["'](.*)["']$/g, '$1').trim();
      }
    }
  }
}

async function main() {
  let passed = 0;
  let failed = 0;

  async function check(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err: any) {
      failed++;
      console.error(`  ✗ ${name}: ${err?.message || err}`);
    }
  }

  console.log('================================================================');
  console.log(' FLAGSHIP 5-SECTOR UPGRADE VERIFICATION SUITE');
  console.log('================================================================');

  const { setTestStaffSession } = await import('../src/lib/auth/serverAuth');
  const { AIProvider } = await import('../src/lib/ai/provider');
  const { WorkflowExecutionEngine } = await import('../src/lib/workflows/workflowExecutionEngine');
  const { computeTwilioSignature } = await import('../src/lib/integrations/twilioSignature');

  const jobsRunRoute = await import('../src/app/api/jobs/run/route');
  const analyticsRoute = await import('../src/app/api/analytics/summary/route');
  const settingsRoute = await import('../src/app/api/settings/profile/route');
  const voiceSimRoute = await import('../src/app/api/voice/simulate/route');
  const twilioVoiceRoute = await import('../src/app/api/integrations/twilio/voice/webhook/route');

  const savedGemini = process.env.GEMINI_API_KEY;
  const savedNvidia = process.env.NVIDIA_API_KEY;
  const savedDefaultProv = process.env.DEFAULT_AI_PROVIDER;
  const savedTwilioToken = process.env.TWILIO_AUTH_TOKEN;
  const savedTwilioUrl = process.env.TWILIO_VOICE_WEBHOOK_URL;
  const originalFetch = globalThis.fetch;

  const restoreEnv = () => {
    globalThis.fetch = originalFetch;
    AIProvider.resetCircuitBreakers();
    if (savedGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedGemini;
    if (savedNvidia === undefined) delete process.env.NVIDIA_API_KEY;
    else process.env.NVIDIA_API_KEY = savedNvidia;
    if (savedDefaultProv === undefined) delete process.env.DEFAULT_AI_PROVIDER;
    else process.env.DEFAULT_AI_PROVIDER = savedDefaultProv;
    if (savedTwilioToken === undefined) delete process.env.TWILIO_AUTH_TOKEN;
    else process.env.TWILIO_AUTH_TOKEN = savedTwilioToken;
    if (savedTwilioUrl === undefined) delete process.env.TWILIO_VOICE_WEBHOOK_URL;
    else process.env.TWILIO_VOICE_WEBHOOK_URL = savedTwilioUrl;
  };

  // ------------------------------------------------------------------
  // 1. Sector #1: Vercel Cron + Jobs API RBAC/Zod + WorkflowEngine
  // ------------------------------------------------------------------
  await check('vercel.json schedules /api/cron/process-jobs cleanly', () => {
    const raw = fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    assert.ok(Array.isArray(parsed.crons), 'vercel.json missing crons array');
    assert.ok(
      parsed.crons.some((c: any) => c.path === '/api/cron/process-jobs' && typeof c.schedule === 'string'),
      'Expected cron schedule for /api/cron/process-jobs'
    );
  });

  await check('/api/jobs/run enforces 401/403 RBAC, 422 Zod & processes jobs cleanly', async () => {
    try {
      const anonRes = await jobsRunRoute.POST(new NextRequest('http://localhost/api/jobs/run', { method: 'POST' }));
      assert.equal(anonRes.status, 401);

      setTestStaffSession({
        user: { id: 'agent-1', email: 'agent@starx.test' },
        organizationId: 'org-jobs-test',
        role: 'agent',
      });
      const agentPost = await jobsRunRoute.POST(new NextRequest('http://localhost/api/jobs/run', { method: 'POST' }));
      assert.equal(agentPost.status, 403);

      const agentGet = await jobsRunRoute.GET(new NextRequest('http://localhost/api/jobs/run'));
      assert.equal(agentGet.status, 200);

      setTestStaffSession({
        user: { id: 'admin-1', email: 'admin@starx.test' },
        organizationId: 'org-jobs-test',
        role: 'admin',
      });
      const badPost = await jobsRunRoute.POST(
        new NextRequest('http://localhost/api/jobs/run', {
          method: 'POST',
          body: JSON.stringify({ batchSize: -10 }),
        })
      );
      assert.equal(badPost.status, 422);

      const okPost = await jobsRunRoute.POST(
        new NextRequest('http://localhost/api/jobs/run', {
          method: 'POST',
          body: JSON.stringify({ batchSize: 10 }),
        })
      );
      assert.equal(okPost.status, 200);
      const data = await okPost.json();
      assert.equal(data.success, true);

      const wfEmpty = await WorkflowExecutionEngine.evaluateInbound({
        userId: 'synthetic-user',
        channel: 'WhatsApp',
        messageText: 'hello',
      });
      assert.deepEqual(wfEmpty.matchedWorkflowIds, []);
    } finally {
      setTestStaffSession(null);
    }
  });

  // ------------------------------------------------------------------
  // 2. Sector #2: /api/analytics/summary Telemetry Auth & Shape
  // ------------------------------------------------------------------
  await check('/api/analytics/summary enforces auth (401) & returns structured telemetry', async () => {
    try {
      const anon = await analyticsRoute.GET(new NextRequest('http://localhost/api/analytics/summary'));
      assert.equal(anon.status, 401);

      setTestStaffSession({
        user: { id: 'owner-1', email: 'owner@starx.test' },
        organizationId: 'org-analytics-test',
        role: 'owner',
      });
      const ok = await analyticsRoute.GET(new NextRequest('http://localhost/api/analytics/summary'));
      assert.equal(ok.status, 200);
      const body = await ok.json();
      assert.equal(body.success, true);
      assert.ok(typeof body.aiTelemetry.totalRuns === 'number');
      assert.ok(typeof body.revenueAndCrm.pipelineValueEur === 'number');
      assert.ok(Array.isArray(body.recentLogs));
    } finally {
      setTestStaffSession(null);
    }
  });

  // ------------------------------------------------------------------
  // 3. Sector #3: /api/settings/profile Real Validation & Persistence
  // ------------------------------------------------------------------
  await check('/api/settings/profile validates fields (422) and persists workspace settings', async () => {
    try {
      const anonGet = await settingsRoute.GET(new NextRequest('http://localhost/api/settings/profile'));
      assert.equal(anonGet.status, 401);

      setTestStaffSession({
        user: { id: 'owner-2', email: 'owner2@starx.test' },
        organizationId: 'org-settings-test',
        role: 'owner',
      });

      const badPut = await settingsRoute.PUT(
        new NextRequest('http://localhost/api/settings/profile', {
          method: 'PUT',
          body: JSON.stringify({ name: '', autonomyMode: 'broken' }),
        })
      );
      assert.equal(badPut.status, 422);

      const okPut = await settingsRoute.PUT(
        new NextRequest('http://localhost/api/settings/profile', {
          method: 'PUT',
          body: JSON.stringify({
            name: 'Elena Weber',
            businessName: 'Weber Studio Berlin',
            businessType: 'Clinic',
            autonomyMode: 'human',
            leadEnrichment: true,
            selfTuning: true,
          }),
        })
      );
      assert.equal(okPut.status, 200);
      const saved = await okPut.json();
      assert.equal(saved.profile.businessName, 'Weber Studio Berlin');
      assert.equal(saved.profile.autonomyMode, 'human');
    } finally {
      setTestStaffSession(null);
    }
  });

  // ------------------------------------------------------------------
  // 4. Sector #4: Voice Simulator API & Twilio Signature Gate
  // ------------------------------------------------------------------
  await check('/api/voice/simulate handles live AI turn & call wrap-up serialization', async () => {
    try {
      const anon = await voiceSimRoute.POST(
        new NextRequest('http://localhost/api/voice/simulate', {
          method: 'POST',
          body: JSON.stringify({ message: 'Hi' }),
        })
      );
      assert.equal(anon.status, 401);

      setTestStaffSession({
        user: { id: 'owner-voice', email: 'voice@starx.test' },
        organizationId: 'default-org',
        role: 'owner',
      });

      const missingMsg = await voiceSimRoute.POST(
        new NextRequest('http://localhost/api/voice/simulate', {
          method: 'POST',
          body: JSON.stringify({ message: '', endCall: false }),
        })
      );
      assert.equal(missingMsg.status, 422);

      delete process.env.GEMINI_API_KEY;
      delete process.env.NVIDIA_API_KEY;

      const turnRes = await voiceSimRoute.POST(
        new NextRequest('http://localhost/api/voice/simulate', {
          method: 'POST',
          body: JSON.stringify({
            message: 'What are your plans and pricing?',
            customerName: 'Max Mustermann',
          }),
        })
      );
      assert.equal(turnRes.status, 200);
      const turnBody = await turnRes.json();
      assert.equal(turnBody.success, true);
      assert.ok(typeof turnBody.reply === 'string' && turnBody.reply.length > 0);

      const endRes = await voiceSimRoute.POST(
        new NextRequest('http://localhost/api/voice/simulate', {
          method: 'POST',
          body: JSON.stringify({
            endCall: true,
            customerName: 'Max Mustermann',
            customerPhone: '+49170123456',
            durationSeconds: 32,
            history: [
              { role: 'customer', text: 'What are your pricing plans?' },
              { role: 'agent', text: turnBody.reply },
            ],
          }),
        })
      );
      assert.equal(endRes.status, 200);
      const endBody = await endRes.json();
      assert.ok(endBody.call.summary.includes('Max Mustermann'));
    } finally {
      setTestStaffSession(null);
      restoreEnv();
    }
  });

  await check('/api/integrations/twilio/voice/webhook fails closed without token/sig and accepts signed TwiML', async () => {
    try {
      delete process.env.TWILIO_AUTH_TOKEN;
      const unconfigured = await twilioVoiceRoute.POST(
        new NextRequest('http://localhost/api/integrations/twilio/voice/webhook', {
          method: 'POST',
        })
      );
      assert.equal(unconfigured.status, 503);

      process.env.TWILIO_AUTH_TOKEN = 'test-twilio-secret-token';
      const webhookUrl = 'https://starx-flow.runs-on.dev/api/integrations/twilio/voice/webhook';
      process.env.TWILIO_VOICE_WEBHOOK_URL = webhookUrl;

      const noSig = await twilioVoiceRoute.POST(
        new NextRequest(webhookUrl, {
          method: 'POST',
        })
      );
      assert.equal(noSig.status, 401);

      const params = { CallSid: 'CA123', From: '+491701112233', SpeechResult: '' };
      const validSig = computeTwilioSignature('test-twilio-secret-token', webhookUrl, params);

      const form = new URLSearchParams(params);
      const okRes = await twilioVoiceRoute.POST(
        new NextRequest(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Twilio-Signature': validSig,
          },
          body: form.toString(),
        })
      );
      assert.equal(okRes.status, 200);
      const xml = await okRes.text();
      assert.ok(xml.includes('<Response>') && xml.includes('<Gather'));
    } finally {
      restoreEnv();
    }
  });

  // ------------------------------------------------------------------
  // 5. Sector #5: AIProvider NVIDIA Circuit Breaker Prevents Repeated 10s Stalls
  // ------------------------------------------------------------------
  await check('AIProvider trips circuit breaker after NVIDIA ConnectTimeoutError', async () => {
    AIProvider.resetCircuitBreakers();
    process.env.DEFAULT_AI_PROVIDER = 'nvidia';
    process.env.NVIDIA_API_KEY = 'nvapi-test-unreachable-key';
    delete process.env.GEMINI_API_KEY;

    let nvidiaAttempts = 0;
    globalThis.fetch = (async (url: RequestInfo | URL) => {
      if (String(url).includes('nvidia.com')) {
        nvidiaAttempts++;
        const err: any = new TypeError('fetch failed');
        err.cause = { code: 'UND_ERR_CONNECT_TIMEOUT' };
        throw err;
      }
      throw new Error('Unexpected fetch');
    }) as typeof fetch;

    try {
      const r1 = await AIProvider.executeAgent({
        userId: 'cb-user',
        organizationId: 'default-org',
        role: 'receptionist',
        channel: 'Web',
        customerMessage: 'How much are plans?',
        includeTrace: true,
      });
      assert.equal(r1.provider, 'fallback');
      assert.equal(nvidiaAttempts, 1);

      // Second call immediately within cooldown skips NVIDIA completely
      const r2 = await AIProvider.executeAgent({
        userId: 'cb-user',
        organizationId: 'default-org',
        role: 'receptionist',
        channel: 'Web',
        customerMessage: 'How much are plans?',
        includeTrace: true,
      });
      assert.equal(r2.provider, 'fallback');
      assert.equal(nvidiaAttempts, 1, 'Circuit breaker should skip unreachable NVIDIA on subsequent requests');
      assert.ok(!r2.trace?.providerAttempted.includes('nvidia'));
    } finally {
      restoreEnv();
    }
  });

  console.log('----------------------------------------------------------------');
  console.log(`FLAGSHIP 5-SECTOR RESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
