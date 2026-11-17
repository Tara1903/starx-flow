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
  console.log('No Supabase credentials found.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  const { data: profiles } = await supabase.from('profiles').select('id, email, business_name, owner_name, role');
  console.log('Profiles in DB:');
  console.log(profiles);

  const { data: demos } = await supabase.from('demo_requests').select('id, business_name, full_name, work_email, status');
  console.log('Demo requests in DB:');
  console.log(demos);
}
inspect();
