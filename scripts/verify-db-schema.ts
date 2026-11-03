import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
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
}
loadEnv();

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const REQUIRED_TABLES = [
  'organizations',
  'organization_members',
  'leads',
  'conversations',
  'messages',
  'appointments',
  'connected_accounts',
  'customer_channel_windows',
  'provider_webhook_events',
  'business_receptionist_profiles',
  'receptionist_jobs',
  'workflows',
  'profiles'
];

async function main() {
  console.log(`Connecting to Supabase: ${url}`);
  
  // 1. Fetch OpenAPI definition
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key!,
        'Authorization': `Bearer ${key}`
      }
    });
    if (!res.ok) {
      console.error(`PostgREST root returned status: ${res.status}`);
      return;
    }
    const spec = await res.json() as any;
    const definitions = spec.definitions || {};
    const detectedTables = Object.keys(definitions);
    console.log(`Total public tables exposed via PostgREST: ${detectedTables.length}`);

    console.log('\n--- StarX-Flow Core Production Tables Status ---');
    for (const table of REQUIRED_TABLES) {
      const exists = detectedTables.includes(table);
      const icon = exists ? '✅' : '❌';
      let rowInfo = '';
      if (exists) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        rowInfo = error ? `(query error: ${error.message})` : `(${count ?? 0} rows)`;
      }
      console.log(`${icon} ${table.padEnd(32)} ${exists ? 'EXISTS ' + rowInfo : 'MISSING'}`);
    }

    // Check specific columns on conversations
    if (detectedTables.includes('conversations')) {
      const convDef = definitions.conversations;
      const props = convDef?.properties ? Object.keys(convDef.properties) : [];
      console.log(`\nConversations table columns (${props.length}):`, props.join(', '));
      const hasLeadId = props.includes('lead_id');
      const hasOrgId = props.includes('organization_id');
      console.log(`- has lead_id: ${hasLeadId ? '✅' : '❌'}`);
      console.log(`- has organization_id: ${hasOrgId ? '✅' : '❌'}`);
    }

    // Check receptionist_jobs columns
    if (detectedTables.includes('receptionist_jobs')) {
      const jobDef = definitions.receptionist_jobs;
      const props = jobDef?.properties ? Object.keys(jobDef.properties) : [];
      console.log(`\nReceptionist_jobs table columns (${props.length}):`, props.join(', '));
    }
  } catch (err: any) {
    console.error('Error verifying database:', err);
  }
}

main();
