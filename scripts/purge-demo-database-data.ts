import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const envPath = path.join(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').replace(/^["'](.*)["']$/, '$1').trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('No Supabase credentials found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function purgeDemoData() {
  console.log('=== PURGING ALL DEMO & SEED DATA FROM SUPABASE ===');

  // 1. Purge all records from demo_requests table
  console.log('1. Clearing demo_requests table...');
  const { error: demoErr, count: demoCount } = await supabase
    .from('demo_requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (demoErr) {
    console.error('Error clearing demo_requests:', demoErr.message);
  } else {
    console.log(`✓ Cleared demo_requests`);
  }

  // 2. Identify demo client profiles
  const preservedEmails = ['admin@starxflow.com', 'owner@starxflow.com'];
  const { data: demoProfiles, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, email, business_name')
    .not('email', 'in', `(${preservedEmails.map(e => `"${e}"`).join(',')})`);

  if (fetchErr) {
    console.error('Error fetching demo profiles:', fetchErr.message);
  } else if (demoProfiles && demoProfiles.length > 0) {
    console.log(`Found ${demoProfiles.length} demo profiles to remove:`);
    for (const p of demoProfiles) {
      console.log(`  - ${p.email} (${p.business_name}, ID: ${p.id})`);

      // Delete associated subscriptions
      await supabase.from('subscriptions').delete().eq('user_id', p.id);
      // Delete associated appointments if any
      await supabase.from('appointments').delete().eq('user_id', p.id);
      // Delete associated leads if any
      await supabase.from('leads').delete().eq('user_id', p.id);
      // Delete associated orders if any
      await supabase.from('orders').delete().eq('user_id', p.id);
      // Delete associated tasks if any
      await supabase.from('tasks').delete().eq('user_id', p.id);
      // Delete profile
      await supabase.from('profiles').delete().eq('id', p.id);
    }
    console.log('✓ Purged demo profiles and related records.');
  } else {
    console.log('✓ No demo profiles found.');
  }

  // 3. Confirm remaining database state
  console.log('\n--- VERIFYING CLEAN DATABASE STATE ---');
  const { count: remDemo } = await supabase.from('demo_requests').select('*', { count: 'exact', head: true });
  const { count: remProfiles, data: remProfList } = await supabase.from('profiles').select('email, role', { count: 'exact' });
  const { count: remApts } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
  const { count: remLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true });
  const { count: remOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });

  console.log(`Remaining demo_requests: ${remDemo || 0}`);
  console.log(`Remaining profiles: ${remProfiles || 0} (${(remProfList || []).map(p => `${p.email} [${p.role}]`).join(', ')})`);
  console.log(`Remaining appointments: ${remApts || 0}`);
  console.log(`Remaining leads: ${remLeads || 0}`);
  console.log(`Remaining orders: ${remOrders || 0}`);
  console.log('=== PURGE COMPLETE: CLEAN SLATE READY ===');
}

purgeDemoData().catch(err => {
  console.error('Fatal error during purge:', err);
  process.exit(1);
});
