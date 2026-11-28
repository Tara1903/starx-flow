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
  console.log(' FLAGSHIP FULL-STACK CRM VERIFICATION SUITE');
  console.log('================================================================');

  const { setTestStaffSession } = await import('../src/lib/auth/serverAuth');
  const { computeLeadScore, mapStageToLeadStatus } = await import('../src/lib/crm/crmService');
  const { interpolateSequenceTemplate } = await import('../src/lib/crm/sequenceService');
  const { LeadFinderService } = await import('../src/lib/crm/leadFinder');
  const { DocumentParser } = await import('../src/lib/rag/documentParser');
  const { isSupabaseAdminConfigured, supabaseAdmin } = await import('../src/lib/supabaseAdmin');

  const leadsRoute = await import('../src/app/api/crm/leads/route');
  const leadIdRoute = await import('../src/app/api/crm/leads/[id]/route');
  const workspaceRoute = await import('../src/app/api/crm/leads/[id]/workspace/route');
  const actionsRoute = await import('../src/app/api/crm/leads/[id]/actions/route');
  const dealsRoute = await import('../src/app/api/crm/deals/route');
  const dealIdRoute = await import('../src/app/api/crm/deals/[id]/route');
  const finderSearchRoute = await import('../src/app/api/crm/finder/search/route');
  const finderImportRoute = await import('../src/app/api/crm/finder/import/route');
  const sequencesRoute = await import('../src/app/api/crm/sequences/route');
  const enrollRoute = await import('../src/app/api/crm/sequences/[id]/enroll/route');

  // ------------------------------------------------------------------
  // 1. Unit & Pure Logic Verification
  // ------------------------------------------------------------------
  await check('computeLeadScore rewards contact completeness and activity signals', () => {
    const bare = computeLeadScore({ status: 'new' });
    const rich = computeLeadScore(
      {
        phone: '+49170123456',
        email: 'ceo@acme.de',
        website: 'https://acme.de',
        company_name: 'Acme GmbH',
        enriched_at: new Date().toISOString(),
        status: 'qualified',
      },
      { conversationsCount: 2, appointmentsCount: 1, ordersCount: 1 }
    );
    assert(rich > bare + 40, `Expected rich score (${rich}) >> bare (${bare})`);
    assert(rich <= 100, 'Score stays bounded at <= 100');
  });

  await check('mapStageToLeadStatus maps won/lost/slug stages deterministically', () => {
    assert.equal(mapStageToLeadStatus({ slug: 'new', is_won: false, is_lost: false }), 'new');
    assert.equal(mapStageToLeadStatus({ slug: 'proposal', is_won: false, is_lost: false }), 'qualified');
    assert.equal(mapStageToLeadStatus({ slug: 'custom', is_won: true, is_lost: false }), 'converted');
    assert.equal(mapStageToLeadStatus({ slug: 'custom', is_won: false, is_lost: true }), 'lost');
  });

  await check('interpolateSequenceTemplate injects customer tokens cleanly', () => {
    const msg = interpolateSequenceTemplate('Hi {{first_name}} at {{company}} ({{city}} / {{industry}})', {
      name: 'Klaus Schneider',
      company_name: 'Schneider Clinic',
      city: 'Berlin',
      industry: 'Dental',
    });
    assert.equal(msg, 'Hi Klaus at Schneider Clinic (Berlin / Dental)');
  });

  await check('Lead Finder SSRF guard blocks loopback and cloud metadata URLs', async () => {
    await assert.rejects(() => DocumentParser.fetchSafePublicHtml('http://127.0.0.1:8080/admin'));
    await assert.rejects(() => DocumentParser.fetchSafePublicHtml('http://169.254.169.254/latest/meta-data'));

    const failedEnrich = await LeadFinderService.enrichCandidate(
      {
        externalId: 'osm:node:99',
        name: 'Internal Probe Co',
        industry: 'Agency',
        city: 'Berlin',
        country: 'Germany',
        address: null,
        phone: null,
        website: 'http://127.0.0.1:3000/secret',
        email: null,
        instagramHandle: null,
        whatsappNumber: null,
        aiSummary: null,
        fitScore: 50,
        enrichmentStatus: 'raw',
        lat: null,
        lon: null,
        alreadyInCrm: false,
      },
      'Agency'
    );
    assert.equal(failedEnrich.enrichmentStatus, 'failed');
  });

  // ------------------------------------------------------------------
  // 2. Unauthenticated 401 & Input Validation 422 Guards Across Routes
  // ------------------------------------------------------------------
  setTestStaffSession(null);

  await check('All new CRM routes fail closed with 401 when unauthenticated', async () => {
    const uuid = '11111111-1111-4111-8111-111111111111';
    const calls = [
      leadsRoute.GET(new NextRequest('http://localhost/api/crm/leads')),
      leadsRoute.POST(new NextRequest('http://localhost/api/crm/leads', { method: 'POST', body: '{}' })),
      leadIdRoute.PATCH(new NextRequest(`http://localhost/api/crm/leads/${uuid}`, { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: uuid }) }),
      workspaceRoute.GET(new NextRequest(`http://localhost/api/crm/leads/${uuid}/workspace`), { params: Promise.resolve({ id: uuid }) }),
      actionsRoute.POST(new NextRequest(`http://localhost/api/crm/leads/${uuid}/actions`, { method: 'POST', body: '{}' }), { params: Promise.resolve({ id: uuid }) }),
      dealsRoute.GET(new NextRequest('http://localhost/api/crm/deals')),
      dealsRoute.POST(new NextRequest('http://localhost/api/crm/deals', { method: 'POST', body: '{}' })),
      dealIdRoute.PATCH(new NextRequest(`http://localhost/api/crm/deals/${uuid}`, { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: uuid }) }),
      finderSearchRoute.POST(new NextRequest('http://localhost/api/crm/finder/search', { method: 'POST', body: '{}' })),
      finderImportRoute.POST(new NextRequest('http://localhost/api/crm/finder/import', { method: 'POST', body: '{}' })),
      sequencesRoute.GET(new NextRequest('http://localhost/api/crm/sequences')),
      enrollRoute.POST(new NextRequest(`http://localhost/api/crm/sequences/${uuid}/enroll`, { method: 'POST', body: '{}' }), { params: Promise.resolve({ id: uuid }) }),
    ];

    const responses = await Promise.all(calls);
    for (const r of responses) {
      assert.equal(r.status, 401, `Expected 401, got ${r.status}`);
    }
  });

  await check('Zod schema boundary rejects malformed payloads with structured 422 error', async () => {
    setTestStaffSession({
      user: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'qa@starx.io' },
      organizationId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      role: 'owner',
    });

    try {
      const badLeadRes = await leadsRoute.POST(
        new NextRequest('http://localhost/api/crm/leads', {
          method: 'POST',
          body: JSON.stringify({ name: '' }),
        })
      );
      assert.equal(badLeadRes.status, 422);
      const errBody = await badLeadRes.json();
      assert.equal(errBody.error?.code, 'VALIDATION_ERROR');

      const badFinderRes = await finderSearchRoute.POST(
        new NextRequest('http://localhost/api/crm/finder/search', {
          method: 'POST',
          body: JSON.stringify({ niche: 'a', city: 'x' }),
        })
      );
      assert.equal(badFinderRes.status, 422);

      const badSeqRes = await sequencesRoute.POST(
        new NextRequest('http://localhost/api/crm/sequences', {
          method: 'POST',
          body: JSON.stringify({ name: 'X', steps: [] }),
        })
      );
      assert.equal(badSeqRes.status, 422);
    } finally {
      setTestStaffSession(null);
    }
  });

  // ------------------------------------------------------------------
  // 3. PGlite Postgres Migration + RLS Cross-Tenant Isolation Proof
  // ------------------------------------------------------------------
  await check('PGlite RLS enforces strict multi-tenant isolation across crm_* tables', async () => {
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
    ]) {
      const rawSql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations', mig), 'utf-8');
      const cleanSql = rawSql.replace(/create\s+extension\s+if\s+not\s+exists\s+[^;]+;/gi, '');
      await db.exec(cleanSql);
    }

    const userA = '10000000-0000-4000-8000-000000000001';
    const userB = '20000000-0000-4000-8000-000000000002';
    const orgA = '30000000-0000-4000-8000-000000000001';
    const orgB = '40000000-0000-4000-8000-000000000002';

    await db.query('INSERT INTO auth.users (id, email) VALUES ($1, $2), ($3, $4)', [
      userA,
      'alpha@test.io',
      userB,
      'beta@test.io',
    ]);
    await db.query(
      "INSERT INTO public.organizations (id, name, slug) VALUES ($1, 'Alpha', 'alpha'), ($2, 'Beta', 'beta')",
      [orgA, orgB]
    );
    await db.query(
      "INSERT INTO public.organization_members (organization_id, user_id, role) VALUES ($1, $2, 'owner'), ($3, $4, 'owner')",
      [orgA, userA, orgB, userB]
    );

    // Seed CRM entities for Org Alpha
    const pipeRes = await db.query(
      "INSERT INTO public.crm_pipelines (organization_id, name) VALUES ($1, 'Alpha Pipe') RETURNING id",
      [orgA]
    );
    const pipeId = pipeRes.rows[0].id;
    const stageRes = await db.query(
      "INSERT INTO public.crm_stages (pipeline_id, organization_id, name, slug, position, probability) VALUES ($1, $2, 'Qualified', 'qualified', 0, 50) RETURNING id",
      [pipeId, orgA]
    );
    const stageId = stageRes.rows[0].id;
    const leadRes = await db.query(
      "INSERT INTO public.leads (user_id, organization_id, name, email, status, source) VALUES ($1, $2, 'VIP Prospect', 'vip@alpha.de', 'qualified', 'outbound_finder') RETURNING id",
      [userA, orgA]
    );
    const leadId = leadRes.rows[0].id;
    await db.query(
      "INSERT INTO public.crm_deals (organization_id, user_id, pipeline_id, stage_id, lead_id, title, value) VALUES ($1, $2, $3, $4, $5, 'Secret Alpha Deal', 9900)",
      [orgA, userA, pipeId, stageId, leadId]
    );
    await db.query(
      "INSERT INTO public.crm_activities (organization_id, lead_id, actor_id, activity_type, title) VALUES ($1, $2, $3, 'note', 'Confidential call')",
      [orgA, leadId, userA]
    );
    await db.query(
      "INSERT INTO public.crm_sequences (organization_id, name, steps) VALUES ($1, 'Alpha Outbound', '[]'::jsonb)",
      [orgA]
    );

    // Grant Supabase default public schema privileges to `authenticated` so RLS policies evaluate
    await db.exec('GRANT USAGE ON SCHEMA public TO authenticated; GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;');

    // Authenticate as Org Alpha -> must see its own CRM rows
    await db.exec('BEGIN');
    await db.exec('SET LOCAL ROLE authenticated');
    await db.exec(`SELECT set_config('request.jwt.claims', '{"sub":"${userA}"}', true)`);
    const alphaLeads = await db.query('SELECT * FROM public.leads');
    const alphaDeals = await db.query('SELECT * FROM public.crm_deals');
    await db.exec('COMMIT');
    assert.equal(alphaLeads.rows.length, 1, 'Org Alpha reads its own lead');
    assert.equal(alphaDeals.rows.length, 1, 'Org Alpha reads its own deal');

    // Authenticate as Org Beta under `authenticated` role -> ZERO leakage
    await db.exec('BEGIN');
    await db.exec('SET LOCAL ROLE authenticated');
    await db.exec(`SELECT set_config('request.jwt.claims', '{"sub":"${userB}"}', true)`);
    const betaPipelines = await db.query('SELECT * FROM public.crm_pipelines');
    const betaDeals = await db.query('SELECT * FROM public.crm_deals');
    const betaLeads = await db.query('SELECT * FROM public.leads');
    const betaActivities = await db.query('SELECT * FROM public.crm_activities');
    const betaSeqs = await db.query('SELECT * FROM public.crm_sequences');
    await db.exec('COMMIT');

    assert.equal(betaPipelines.rows.length, 0, 'Org Beta cannot read Alpha pipelines');
    assert.equal(betaDeals.rows.length, 0, 'Org Beta cannot read Alpha deals');
    assert.equal(betaLeads.rows.length, 0, 'Org Beta cannot read Alpha leads');
    assert.equal(betaActivities.rows.length, 0, 'Org Beta cannot read Alpha activities');
    assert.equal(betaSeqs.rows.length, 0, 'Org Beta cannot read Alpha sequences');
  });

  // ------------------------------------------------------------------
  // 4. End-to-End Live Supabase CRUD & Cross-App Integration (if configured)
  // ------------------------------------------------------------------
  if (isSupabaseAdminConfigured) {
    await check('Live CRM full-stack lifecycle: idempotent lead -> deal -> stage sync -> booking/task -> sequence enroll -> cleanup', async () => {
      const { data: profile } = await supabaseAdmin.from('profiles').select('id, email').limit(1).maybeSingle();
      if (!profile?.id) {
        console.log('    (Skipped live Supabase DB write test: no profile row seeded)');
        return;
      }

      const testOrgSlug = `qa-crm-org-${Date.now()}`;
      const { data: org, error: orgErr } = await supabaseAdmin
        .from('organizations')
        .insert({ name: 'QA CRM Verification Org', slug: testOrgSlug })
        .select('*')
        .single();
      assert(!orgErr && org?.id, orgErr?.message || 'Failed to create test org');

      await supabaseAdmin
        .from('organization_members')
        .insert({ organization_id: org.id, user_id: profile.id, role: 'owner' });

      try {
        setTestStaffSession({
          user: { id: profile.id, email: profile.email || 'owner@starx.io' },
          organizationId: org.id,
          role: 'owner',
        });

        // 4a. Idempotent Lead + Deal Creation
        const idemKey = `qa-lead-${Date.now()}`;
        const createReq1 = new NextRequest('http://localhost/api/crm/leads', {
          method: 'POST',
          headers: { 'Idempotency-Key': idemKey },
          body: JSON.stringify({
            name: 'Clara Becker',
            companyName: 'Becker Dental Studio',
            email: 'clara@beckerdental.de',
            phone: '+491761234999',
            dealValue: 2400,
            createDeal: true,
          }),
        });
        const createRes1 = await leadsRoute.POST(createReq1);
        assert.equal(createRes1.status, 201);
        const body1 = await createRes1.json();
        assert(body1.lead?.id && body1.deal?.id, 'Created both lead and deal');

        const createReq2 = new NextRequest('http://localhost/api/crm/leads', {
          method: 'POST',
          headers: { 'Idempotency-Key': idemKey },
          body: JSON.stringify({ name: 'Clara Becker', dealValue: 2400 }),
        });
        const createRes2 = await leadsRoute.POST(createReq2);
        const body2 = await createRes2.json();
        assert.equal(body2.deduplicated, true, 'Second identical call deduplicated via Idempotency-Key');
        assert.equal(body2.lead.id, body1.lead.id);

        // 4b. Snapshot & Pipelines
        const snapRes = await leadsRoute.GET(new NextRequest('http://localhost/api/crm/leads'));
        assert.equal(snapRes.status, 200);
        const snapData = await snapRes.json();
        const stages = snapData.pipelines?.[0]?.stages || [];
        assert(stages.length >= 5, 'Default pipeline stages auto-seeded');
        const wonStage = stages.find((s: any) => s.is_won);
        assert(wonStage, 'Won stage exists');

        // 4c. Move Deal Stage -> Syncs Lead Status & Creates Activity
        const moveRes = await dealIdRoute.PATCH(
          new NextRequest(`http://localhost/api/crm/deals/${body1.deal.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ stageId: wonStage.id }),
          }),
          { params: Promise.resolve({ id: body1.deal.id }) }
        );
        assert.equal(moveRes.status, 200);

        // 4d. Cross-app Actions: Add Note, Create Task, Create Booking
        const noteRes = await actionsRoute.POST(
          new NextRequest(`http://localhost/api/crm/leads/${body1.lead.id}/actions`, {
            method: 'POST',
            body: JSON.stringify({ action: 'add_note', body: 'Signed onboarding contract.' }),
          }),
          { params: Promise.resolve({ id: body1.lead.id }) }
        );
        assert.equal(noteRes.status, 200);

        const taskRes = await actionsRoute.POST(
          new NextRequest(`http://localhost/api/crm/leads/${body1.lead.id}/actions`, {
            method: 'POST',
            body: JSON.stringify({ action: 'create_task', title: 'Provision WhatsApp number', priority: 'high' }),
          }),
          { params: Promise.resolve({ id: body1.lead.id }) }
        );
        assert.equal(taskRes.status, 201);

        const startIso = new Date(Date.now() + 86400000).toISOString();
        const endIso = new Date(Date.now() + 86400000 + 3600000).toISOString();
        const bookRes = await actionsRoute.POST(
          new NextRequest(`http://localhost/api/crm/leads/${body1.lead.id}/actions`, {
            method: 'POST',
            body: JSON.stringify({ action: 'create_booking', serviceType: 'Kickoff Call', startTime: startIso, endTime: endIso }),
          }),
          { params: Promise.resolve({ id: body1.lead.id }) }
        );
        assert.equal(bookRes.status, 201);

        // 4e. Verify 360 Workspace Aggregates Everything
        const wsRes = await workspaceRoute.GET(
          new NextRequest(`http://localhost/api/crm/leads/${body1.lead.id}/workspace`),
          { params: Promise.resolve({ id: body1.lead.id }) }
        );
        assert.equal(wsRes.status, 200);
        const wsData = await wsRes.json();
        assert.equal(wsData.workspace.lead.status, 'converted');
        assert(wsData.workspace.tasks.length >= 1, 'Task linked to 360 workspace');
        assert(wsData.workspace.appointments.length >= 1, 'Booking linked to 360 workspace');
        assert(wsData.workspace.activities.length >= 3, 'Activities timeline populated');

        // 4f. Sequence Create & Enrollment Deduplication
        const seqRes = await sequencesRoute.POST(
          new NextRequest('http://localhost/api/crm/sequences', {
            method: 'POST',
            body: JSON.stringify({
              name: 'QA Drip Cadence',
              triggerType: 'manual',
              channel: 'email',
              steps: [{ dayOffset: 1, channel: 'email', subject: 'Hi {{first_name}}', messageTemplate: 'Hello {{company}}' }],
            }),
          })
        );
        assert.equal(seqRes.status, 201);
        const seqData = await seqRes.json();

        const enr1 = await enrollRoute.POST(
          new NextRequest(`http://localhost/api/crm/sequences/${seqData.sequence.id}/enroll`, {
            method: 'POST',
            body: JSON.stringify({ leadIds: [body1.lead.id] }),
          }),
          { params: Promise.resolve({ id: seqData.sequence.id }) }
        );
        const enrData1 = await enr1.json();
        assert.equal(enrData1.enrolled, 1);

        const enr2 = await enrollRoute.POST(
          new NextRequest(`http://localhost/api/crm/sequences/${seqData.sequence.id}/enroll`, {
            method: 'POST',
            body: JSON.stringify({ leadIds: [body1.lead.id] }),
          }),
          { params: Promise.resolve({ id: seqData.sequence.id }) }
        );
        const enrData2 = await enr2.json();
        assert.equal(enrData2.skipped, 1, 'Duplicate enrollment rejected safely');

        // Clean up child rows created on shared tables (`tasks`, `appointments`, `leads`, `receptionist_jobs`)
        await supabaseAdmin.from('receptionist_jobs').delete().eq('organization_id', org.id);
        await supabaseAdmin.from('tasks').delete().eq('lead_id', body1.lead.id);
        await supabaseAdmin.from('appointments').delete().eq('lead_id', body1.lead.id);
        await supabaseAdmin.from('leads').delete().eq('organization_id', org.id);
      } finally {
        setTestStaffSession(null);
        await supabaseAdmin.from('organizations').delete().eq('id', org.id);
      }
    });
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
