/**
 * StarX-Flow Super Admin User Provisioning Script
 * Creates or promotes a user to platform Super Admin with full access
 * to the Admin Command Center, client management, and demo lead triage.
 *
 * Usage:
 *   npx tsx scripts/create-super-admin.ts [email] [password] [name]
 *
 * Or via environment variables:
 *   SUPER_ADMIN_EMAIL=admin@starxflow.com SUPER_ADMIN_PASSWORD=your_secure_password npx tsx scripts/create-super-admin.ts
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// 1. Load environment variables
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

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env / .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('================================================================');
  console.log(' STARX FLOW: SUPER ADMIN PROVISIONING UTILITY');
  console.log('================================================================\n');

  // Parse CLI arguments or environment variables
  const args = process.argv.slice(2);
  const targetEmail = (args[0] || process.env.SUPER_ADMIN_EMAIL || 'admin@starxflow.com').trim().toLowerCase();
  const targetPassword = args[1] || process.env.SUPER_ADMIN_PASSWORD || 'StarXFlowAdmin2026!Secure';
  const targetName = args[2] || process.env.SUPER_ADMIN_NAME || 'StarX Super Admin';

  console.log(`Target Email:    ${targetEmail}`);
  console.log(`Full Name:       ${targetName}`);
  console.log(`Role to assign:  super_admin`);
  console.log(`Connecting to:   ${supabaseUrl}\n`);

  try {
    // 1. Check if user already exists in auth.users
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      throw new Error(`Failed to list auth users: ${listErr.message}`);
    }

    let existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === targetEmail
    );

    let userId: string;

    if (existingUser) {
      console.log(`ℹ️ User ${targetEmail} exists in auth.users (ID: ${existingUser.id}). Updating password and metadata...`);
      userId = existingUser.id;

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: targetPassword,
        email_confirm: true,
        user_metadata: {
          name: targetName,
          role: 'super_admin',
        },
      });

      if (updateErr) {
        throw new Error(`Failed to update auth user: ${updateErr.message}`);
      }
      console.log('✓ Auth user credentials and email confirmation updated.');
    } else {
      console.log(`ℹ️ Creating new user in auth.users for ${targetEmail}...`);
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: targetEmail,
        password: targetPassword,
        email_confirm: true,
        user_metadata: {
          name: targetName,
          role: 'super_admin',
        },
      });

      if (createErr || !newUser.user) {
        throw new Error(`Failed to create auth user: ${createErr?.message}`);
      }

      userId = newUser.user.id;
      console.log(`✓ Auth user created successfully (ID: ${userId}).`);
    }

    // 2. Upsert profile record with role='super_admin'
    console.log(`\nℹ️ Provisioning profiles record with role: super_admin...`);
    const { error: profileErr } = await supabaseAdmin.from('profiles').upsert(
      {
        id: userId,
        email: targetEmail,
        owner_name: targetName,
        business_name: 'StarX Flow Command',
        business_type: 'Platform Administration',
        role: 'super_admin',
        onboarding_complete: true,
      },
      { onConflict: 'id' }
    );

    if (profileErr) {
      throw new Error(`Failed to update profile record: ${profileErr.message}`);
    }
    console.log('✓ Profile record synchronized with super_admin platform role.');

    // 3. Ensure a Pro Platform Subscription exists
    console.log(`\nℹ️ Provisioning platform Pro subscription for super admin...`);
    await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        billing_provider: 'polar',
        plan_id: 'pro',
        status: 'active',
        billing_cycle: 'monthly',
        amount: 99,
        currency: 'USD',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    console.log('✓ Platform Pro subscription granted.');

    // 4. Ensure a Platform Organization exists for this super admin
    console.log(`\nℹ️ Ensuring Organization and Member ownership records...`);
    const { data: memberRows } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .limit(1);

    let orgId: string | null = null;
    if (memberRows && memberRows.length > 0) {
      orgId = memberRows[0].organization_id;
      console.log(`✓ Existing platform organization found (ID: ${orgId}).`);
    } else {
      const orgSlug = `starx-command-${userId.slice(0, 8)}`;
      const { data: newOrg, error: orgErr } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: 'StarX Flow Command',
          slug: orgSlug,
          plan: 'pro',
        })
        .select('id')
        .single();

      if (orgErr || !newOrg) {
        console.warn(`⚠️ Organization creation note: ${orgErr?.message}`);
      } else {
        orgId = newOrg.id;
        console.log(`✓ Created platform organization (ID: ${orgId}, Slug: ${orgSlug}).`);

        await supabaseAdmin.from('organization_members').upsert(
          {
            organization_id: orgId,
            user_id: userId,
            role: 'owner',
          },
          { onConflict: 'organization_id,user_id' }
        );
        console.log('✓ Organization membership confirmed with role: owner.');
      }
    }

    console.log('\n================================================================');
    console.log(' 🎉 SUPER ADMIN USER PROVISIONING COMPLETED SUCCESSFULLY');
    console.log('================================================================');
    console.log(`User ID:      ${userId}`);
    console.log(`Email:        ${targetEmail}`);
    console.log(`Role:         super_admin`);
    console.log(`Admin Portal: /admin/login`);
    console.log(`Dashboard:    /admin\n`);
  } catch (err: any) {
    console.error('\n❌ Provisioning failed:', err.message);
    process.exit(1);
  }
}

main();
