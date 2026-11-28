import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
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
  console.log(' AI INTELLIGENCE PIPELINE V2 VERIFICATION SUITE');
  console.log('================================================================');

  const { setTestStaffSession } = await import('../src/lib/auth/serverAuth');
  const { BusinessProfileService } = await import('../src/lib/ai/businessProfileService');
  const { MultiTenantRAG } = await import('../src/lib/rag/multiTenantRAG');
  const { AIContextAssembler } = await import('../src/lib/ai/contextAssembler');
  const { ToolExecutor } = await import('../src/lib/ai/tools/toolExecutor');
  const { AIProvider } = await import('../src/lib/ai/provider');

  const sandboxRoute = await import('../src/app/api/ai/sandbox/route');
  const retrieveRoute = await import('../src/app/api/knowledge/retrieve/route');
  const receptionistRoute = await import('../src/app/api/receptionist/settings/route');

  const savedGeminiKey = process.env.GEMINI_API_KEY;
  const savedNvidiaKey = process.env.NVIDIA_API_KEY;
  const savedDefaultProvider = process.env.DEFAULT_AI_PROVIDER;
  const originalFetch = globalThis.fetch;

  const restoreRuntime = () => {
    globalThis.fetch = originalFetch;
    if (savedGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedGeminiKey;
    if (savedNvidiaKey === undefined) delete process.env.NVIDIA_API_KEY;
    else process.env.NVIDIA_API_KEY = savedNvidiaKey;
    if (savedDefaultProvider === undefined) delete process.env.DEFAULT_AI_PROVIDER;
    else process.env.DEFAULT_AI_PROVIDER = savedDefaultProvider;
  };

  // ------------------------------------------------------------------
  // 1. BusinessProfile & AIContextAssembler Isolation
  // ------------------------------------------------------------------
  await check('Unconfigured workspace never impersonates legacy synthetic clinic', async () => {
    BusinessProfileService.clearInMemory();
    const prof = await BusinessProfileService.getProfile('org-fresh-workspace');
    assert.ok(
      !prof.businessName.toLowerCase().includes('partner clinic'),
      `Unexpected clinic impersonation: ${prof.businessName}`
    );
    assert.equal(prof.isConfigured, false);
    assert.equal(prof.services.length, 0);
  });

  await check('MultiTenantRAG shares org docs across teammates and blocks other orgs', async () => {
    MultiTenantRAG.clearInMemory();
    await MultiTenantRAG.ingestDocument({
      userId: 'user-alpha-1',
      organizationId: 'org-alpha',
      title: 'Nordic Dental Pricing 2026',
      documentType: 'faq',
      content: 'Laser whitening costs €195 including sensitivity gel. Checkups are €60.',
    });

    const teammateRes = await MultiTenantRAG.retrieveContext({
      userId: 'user-alpha-2',
      organizationId: 'org-alpha',
      query: 'How much is laser whitening?',
      limit: 5,
    });
    assert.equal(teammateRes.hasSufficientContext, true);
    assert.ok(teammateRes.matches.some((m) => m.documentTitle.includes('Nordic Dental')));

    const outsiderRes = await MultiTenantRAG.retrieveContext({
      userId: 'user-beta-1',
      organizationId: 'org-beta',
      query: 'How much is laser whitening?',
      limit: 5,
    });
    assert.equal(outsiderRes.hasSufficientContext, false);
    assert.equal(outsiderRes.matches.length, 0);
  });

  await check('AIContextAssembler merges BusinessProfile + RAG + formats structured prompt blocks', async () => {
    await BusinessProfileService.updateProfile('org-alpha', {
      businessName: 'Nordic Dental Berlin',
      businessType: 'Dental Practice',
      customInstructions: 'Always mention complimentary post-care kit.',
      services: [{ name: 'Laser Whitening', priceEur: 195, durationMinutes: 60 }],
    });

    const assembled = await AIContextAssembler.assemble({
      userId: 'user-alpha-1',
      organizationId: 'org-alpha',
      channel: 'Web',
      query: 'laser whitening price',
    });

    assert.equal(assembled.businessProfile.businessName, 'Nordic Dental Berlin');
    assert.ok(assembled.ragMatches.length >= 1, 'Expected RAG match to be assembled');
    const promptBlock = AIContextAssembler.formatPromptBlocks(assembled);
    assert.ok(promptBlock.includes('Nordic Dental Berlin'));
    assert.ok(promptBlock.includes('Nordic Dental Pricing 2026'));
  });

  // ------------------------------------------------------------------
  // 2. ToolExecutor Security & Write-Back Handlers
  // ------------------------------------------------------------------
  await check('ToolExecutor handles saveCustomerPreference, escalateToHuman & fail-closed lookupCustomer', async () => {
    ToolExecutor.clearInMemory();

    const blocked = await ToolExecutor.executeTool(
      'lookupCustomer',
      { query: 'john@example.com' },
      { userId: 'user-alpha-1', organizationId: 'org-alpha', actorType: 'ai_agent' }
    );
    assert.equal(blocked.success, false);
    assert.ok(blocked.error?.includes('Security Notice'));

    const prefRes = await ToolExecutor.executeTool(
      'saveCustomerPreference',
      { key: 'Preferred Slot', value: 'Tuesday afternoon' },
      { userId: 'user-alpha-1', organizationId: 'org-alpha', leadId: 'lead-v2-1', actorType: 'ai_agent' }
    );
    assert.equal(prefRes.success, true);
    assert.deepEqual(ToolExecutor.getCustomerPreferences('lead-v2-1'), {
      preferred_slot: 'Tuesday afternoon',
    });

    const escRes = await ToolExecutor.executeTool(
      'escalateToHuman',
      { reason: 'Customer requested VIP invoice customization', urgency: 'high' },
      {
        userId: 'user-alpha-1',
        organizationId: 'org-alpha',
        leadId: 'lead-v2-1',
        conversationId: 'conv-v2-1',
        actorType: 'ai_agent',
      }
    );
    assert.equal(escRes.success, true);
    assert.equal(escRes.data?.escalated, true);
  });

  // ------------------------------------------------------------------
  // 3. Gemini Multi-Turn FunctionCall -> FunctionResponse Loop (Mocked)
  // ------------------------------------------------------------------
  await check('AIProvider runs Gemini multi-turn functionCall -> ToolExecutor -> functionResponse round-trip', async () => {
    ToolExecutor.clearInMemory();
    delete process.env.DEFAULT_AI_PROVIDER;
    delete process.env.NVIDIA_API_KEY;
    process.env.GEMINI_API_KEY = 'AIzaSyTestMockKeyForPipelineV2Check';

    let generateCalls = 0;
    let sawFunctionResponseTurn = false;

    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = String(url);
      if (urlStr.includes('text-embedding-004')) {
        return new Response(JSON.stringify({ embedding: { values: [0.5, 0.5, 0.5, 0.5] } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (urlStr.includes(':generateContent')) {
        generateCalls++;
        const reqBody = JSON.parse(String(init?.body || '{}'));

        if (generateCalls === 1) {
          assert.ok(Array.isArray(reqBody.contents) && reqBody.contents.length >= 3, 'Should forward prior history turns');
          return new Response(
            JSON.stringify({
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        functionCall: {
                          name: 'saveCustomerPreference',
                          args: { key: 'preferred_day', value: 'Friday mornings' },
                        },
                      },
                    ],
                  },
                },
              ],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const lastTurn = reqBody.contents[reqBody.contents.length - 1];
        sawFunctionResponseTurn = Boolean(
          lastTurn?.role === 'user' &&
            lastTurn?.parts?.[0]?.functionResponse?.name === 'saveCustomerPreference'
        );

        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: 'Noted! I saved your preference for Friday mornings. Laser Whitening at Nordic Dental Berlin is €195 (60 min).',
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return originalFetch(url, init);
    }) as typeof fetch;

    try {
      const result = await AIProvider.executeAgent({
        userId: 'user-alpha-1',
        organizationId: 'org-alpha',
        role: 'receptionist',
        channel: 'Web',
        leadId: 'lead-v2-roundtrip',
        customerMessage: 'Please remember I prefer Friday mornings, and how much is laser whitening?',
        conversationHistory: [
          { role: 'user', text: 'Hi there!' },
          { role: 'ai', text: 'Hello! Welcome to Nordic Dental Berlin. How can I help?' },
        ],
        includeTrace: true,
      });

      assert.equal(result.provider, 'gemini');
      assert.equal(generateCalls, 2);
      assert.equal(sawFunctionResponseTurn, true, 'Round 2 should pass functionResponse back to Gemini');
      assert.ok(result.replyText.includes('Friday mornings'));
      assert.ok(result.trace?.toolNamesUsed.includes('saveCustomerPreference'));
      assert.deepEqual(ToolExecutor.getCustomerPreferences('lead-v2-roundtrip'), {
        preferred_day: 'Friday mornings',
      });
    } finally {
      restoreRuntime();
    }
  });

  // ------------------------------------------------------------------
  // 4. REST API Auth, Zod 422 & Trace Serialization
  // ------------------------------------------------------------------
  await check('REST API routes enforce auth (401/403), Zod (422) & return trace/matches', async () => {
    try {
      const anonRetrieve = await retrieveRoute.POST(
        new NextRequest('http://localhost/api/knowledge/retrieve', {
          method: 'POST',
          body: JSON.stringify({ query: 'pricing' }),
        })
      );
      assert.equal(anonRetrieve.status, 401);

      setTestStaffSession({
        user: { id: 'user-alpha-1', email: 'owner@nordic.test' },
        organizationId: 'org-alpha',
        role: 'owner',
      });

      const badSandbox = await sandboxRoute.POST(
        new NextRequest('http://localhost/api/ai/sandbox', {
          method: 'POST',
          body: JSON.stringify({ message: '' }),
        })
      );
      assert.equal(badSandbox.status, 422);
      const badSandboxBody = await badSandbox.json();
      assert.equal(badSandboxBody.error?.code, 'VALIDATION_ERROR');

      const badRetrieve = await retrieveRoute.POST(
        new NextRequest('http://localhost/api/knowledge/retrieve', {
          method: 'POST',
          body: JSON.stringify({ query: 'a' }),
        })
      );
      assert.equal(badRetrieve.status, 422);

      const okRetrieve = await retrieveRoute.POST(
        new NextRequest('http://localhost/api/knowledge/retrieve', {
          method: 'POST',
          body: JSON.stringify({ query: 'laser whitening price', limit: 3 }),
        })
      );
      assert.equal(okRetrieve.status, 200);
      const retrieveData = await okRetrieve.json();
      assert.ok(Array.isArray(retrieveData.matches) && retrieveData.matches.length >= 1);

      delete process.env.GEMINI_API_KEY;
      delete process.env.NVIDIA_API_KEY;

      const okSandbox = await sandboxRoute.POST(
        new NextRequest('http://localhost/api/ai/sandbox', {
          method: 'POST',
          body: JSON.stringify({
            message: 'What are your services and hours?',
            role: 'receptionist',
          }),
        })
      );
      assert.equal(okSandbox.status, 200);
      const sandboxData = await okSandbox.json();
      assert.ok(typeof sandboxData.reply === 'string' && sandboxData.reply.length > 0);
      assert.ok(sandboxData.trace && typeof sandboxData.trace.latencyMs === 'number');

      const badRec = await receptionistRoute.PUT(
        new NextRequest('http://localhost/api/receptionist/settings', {
          method: 'PUT',
          body: JSON.stringify({
            services: [{ name: 'Bad', priceEur: -5, durationMinutes: 30 }],
          }),
        })
      );
      assert.equal(badRec.status, 422);
    } finally {
      setTestStaffSession(null);
      restoreRuntime();
    }
  });

  // ------------------------------------------------------------------
  // 5. PGlite Full Migration & RLS Cross-Tenant Isolation Proof
  // ------------------------------------------------------------------
  await check('PGlite migrations apply cleanly & RLS isolates knowledge, memories, and AI traces', async () => {
    const db = new PGlite();
    await db.exec(`
      CREATE SCHEMA IF NOT EXISTS auth;
      DO $$ BEGIN CREATE ROLE authenticated; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE ROLE anon; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE ROLE service_role; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      CREATE TABLE IF NOT EXISTS auth.users (id uuid primary key, email text);
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
        SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
      $$;
      CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
        SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->>'role', ''), current_user::text);
      $$;
      CREATE OR REPLACE FUNCTION uuid_generate_v4() RETURNS uuid LANGUAGE sql AS $$
        SELECT gen_random_uuid();
      $$;
    `);

    for (const mig of [
      '001_initial_schema.sql',
      '002_production_core_schema.sql',
      '003_commercial_capabilities.sql',
      '004_security_integrity_and_remediation.sql',
      '20261128000000_flagship_full_stack_crm.sql',
      '20261128120000_flagship_ai_intelligence.sql',
    ]) {
      const rawSql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations', mig), 'utf-8');
      const cleanSql = rawSql.replace(/create\s+extension\s+if\s+not\s+exists\s+[^;]+;/gi, '');
      await db.exec(cleanSql);
    }

    const ownerA = '10000000-0000-4000-8000-000000000011';
    const mateA = '10000000-0000-4000-8000-000000000012';
    const ownerB = '20000000-0000-4000-8000-000000000021';
    const orgA = '30000000-0000-4000-8000-000000000011';
    const orgB = '40000000-0000-4000-8000-000000000021';
    const docA = '50000000-0000-4000-8000-000000000011';

    await db.query('INSERT INTO auth.users (id, email) VALUES ($1, $2), ($3, $4), ($5, $6)', [
      ownerA,
      'ownera@test.io',
      mateA,
      'matea@test.io',
      ownerB,
      'ownerb@test.io',
    ]);
    await db.query(
      "INSERT INTO public.organizations (id, name, slug) VALUES ($1, 'Alpha', 'alpha'), ($2, 'Beta', 'beta')",
      [orgA, orgB]
    );
    await db.query(
      "INSERT INTO public.organization_members (organization_id, user_id, role) VALUES ($1, $2, 'owner'), ($1, $3, 'member'), ($4, $5, 'owner')",
      [orgA, ownerA, mateA, orgB, ownerB]
    );

    await db.query(
      `INSERT INTO public.knowledge_documents (id, user_id, organization_id, title, document_type, content, chunks_count)
       VALUES ($1, $2, $3, 'Secret Alpha SOP', 'text', 'Internal VIP refund rule', 1)`,
      [docA, ownerA, orgA]
    );
    await db.query(
      `INSERT INTO public.knowledge_chunks (document_id, user_id, organization_id, chunk_index, chunk_content, token_count)
       VALUES ($1, $2, $3, 0, 'Internal VIP refund rule chunk', 8)`,
      [docA, ownerA, orgA]
    );
    await db.query(
      `INSERT INTO public.business_memories (user_id, organization_id, key, value, category)
       VALUES ($1, $2, 'vip_discount', '20%', 'policy')`,
      [ownerA, orgA]
    );
    await db.query(
      `INSERT INTO public.agent_memories (user_id, organization_id, lead_id, key, value)
       VALUES ($1, $2, 'lead-a', 'language', 'de')`,
      [ownerA, orgA]
    );
    await db.query(
      `INSERT INTO public.ai_intelligence_traces (organization_id, channel, provider, model, intent, rag_chunks_count, memories_count, crm_linked)
       VALUES ($1, 'Web', 'gemini', 'gemini-2.0-flash', 'sales', 1, 2, true)`,
      [orgA]
    );

    // Grant Supabase default public schema privileges to `authenticated` so RLS policies evaluate
    await db.exec('GRANT USAGE ON SCHEMA public TO authenticated; GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;');

    const checkAsUser = async (uid: string, sql: string) => {
      await db.exec('BEGIN');
      await db.exec('SET LOCAL ROLE authenticated');
      await db.query("SELECT set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: uid, role: 'authenticated' }),
      ]);
      const res = await db.query<{ count: string }>(sql);
      await db.exec('COMMIT');
      return Number(res.rows[0]?.count || 0);
    };

    // Teammate in Org A shares access across all 4 tables
    assert.equal(await checkAsUser(mateA, 'SELECT count(*) FROM public.knowledge_chunks'), 1);
    assert.equal(await checkAsUser(mateA, 'SELECT count(*) FROM public.business_memories'), 1);
    assert.equal(await checkAsUser(mateA, 'SELECT count(*) FROM public.agent_memories'), 1);
    assert.equal(await checkAsUser(mateA, 'SELECT count(*) FROM public.ai_intelligence_traces'), 1);

    // Owner B in Org B sees zero rows from Org A
    assert.equal(await checkAsUser(ownerB, 'SELECT count(*) FROM public.knowledge_chunks'), 0);
    assert.equal(await checkAsUser(ownerB, 'SELECT count(*) FROM public.business_memories'), 0);
    assert.equal(await checkAsUser(ownerB, 'SELECT count(*) FROM public.agent_memories'), 0);
    assert.equal(await checkAsUser(ownerB, 'SELECT count(*) FROM public.ai_intelligence_traces'), 0);
  });

  console.log('----------------------------------------------------------------');
  console.log(`AI INTELLIGENCE V2 RESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
