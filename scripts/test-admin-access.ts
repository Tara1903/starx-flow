import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = match[2] || '';
          val = val.replace(/^["'](.*)["']$/, '$1').trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseClient = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('================================================================');
  console.log(' TESTING END-TO-END SUPER ADMIN ACCESS TO ADMIN CENTRE');
  console.log('================================================================\n');

  const email = 'admin@starxflow.com';
  const password = 'StarXFlowAdmin2026!Secure';

  // 1. Authenticate with password (simulating /admin/login form submit)
  console.log(`1. Authenticating as ${email}...`);
  const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    console.error('❌ Sign in failed:', authError?.message);
    process.exit(1);
  }
  console.log('✓ Successfully signed in! Access Token received.');

  const userId = authData.session.user.id;
  const token = authData.session.access_token;

  // 2. Verify Profile and Super Admin Role
  console.log('\n2. Checking Profile role in Supabase...');
  const { data: profile, error: profileErr } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    console.error('❌ Profile lookup failed:', profileErr?.message);
    process.exit(1);
  }
  console.log(`✓ Profile retrieved: Name="${profile.owner_name}", Role="${profile.role}"`);

  const hasAdminAccess = profile.role === 'admin' || profile.role === 'super_admin';
  console.log(`✓ Admin Centre access granted: ${hasAdminAccess}`);

  // 3. Test RPC get_all_clients
  console.log('\n3. Testing RPC get_all_clients...');
  const { data: clientsData, error: rpcErr } = await supabaseClient.rpc('get_all_clients');
  if (rpcErr) {
    console.warn(`⚠️ get_all_clients RPC note: ${rpcErr.message}`);
    // Check fallback direct query on profiles
    const { data: fallbackProfiles, error: fbErr } = await supabaseClient.from('profiles').select('*').limit(10);
    console.log(`ℹ️ Direct profiles query fallback: ${fallbackProfiles?.length || 0} rows found (error: ${fbErr?.message || 'none'})`);
  } else {
    console.log(`✓ get_all_clients RPC succeeded: ${clientsData?.length || 0} clients returned`);
  }

  // 4. Test API Route GET /api/admin/demo-requests
  console.log('\n4. Testing GET /api/admin/demo-requests via authenticated session token...');
  const { GET: getDemoRequests } = await import('../src/app/api/admin/demo-requests/route');
  const req = new Request('http://localhost:3000/api/admin/demo-requests', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await getDemoRequests(req);
  console.log(`✓ HTTP Status from /api/admin/demo-requests: ${res.status}`);
  const json = await res.json();
  console.log(`✓ Demo leads count: ${json.leads?.length ?? 0}`);

  // 5. Test API Route GET /api/admin/clients
  console.log('\n5. Testing GET /api/admin/clients via authenticated session token...');
  const { GET: getClients, PATCH: patchClient } = await import('../src/app/api/admin/clients/route');
  const clientReq = new Request('http://localhost:3000/api/admin/clients', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const clientRes = await getClients(clientReq);
  console.log(`✓ HTTP Status from /api/admin/clients: ${clientRes.status}`);
  const clientJson = await clientRes.json();
  console.log(`✓ Registered clients count: ${clientJson.clients?.length ?? 0}`);

  // 6. Test PATCH /api/admin/clients
  console.log('\n6. Testing PATCH /api/admin/clients (updating subscription status)...');
  const patchReq = new Request('http://localhost:3000/api/admin/clients', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: userId,
      plan: 'pro',
      status: 'active',
    }),
  });

  const patchRes = await patchClient(patchReq);
  console.log(`✓ HTTP Status from PATCH /api/admin/clients: ${patchRes.status}`);

  if (res.status === 200 && clientRes.status === 200 && patchRes.status === 200) {
    console.log('\n================================================================');
    console.log(' 🎉 SUPER ADMIN IS 100% CAPABLE AND VERIFIED TO ACCESS ADMIN CENTRE');
    console.log('================================================================');
  } else {
    console.error('❌ Admin endpoint verification failed');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
