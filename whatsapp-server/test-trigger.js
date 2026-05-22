require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("=== Testing SignUp Trigger ===");

  const testEmail = `test-trigger-${Date.now()}@example.com`;
  console.log(`Creating dummy auth user: ${testEmail}...`);

  // 1. Create dummy auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    email_confirm: true,
    user_metadata: {
      business_name: 'Test Trigger Business',
      owner_name: 'Test Trigger Owner',
      business_type: 'Fitness'
    }
  });

  if (authErr) {
    console.error("Error creating test auth user:", authErr.message);
    process.exit(1);
  }

  const dummyUser = authData.user;
  console.log(`Dummy auth user created with ID: ${dummyUser.id}`);

  // Wait 2 seconds for triggers to finish execution
  console.log("Waiting for trigger execution...");
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 2. Check profiles table
  console.log("Checking profiles table for the dummy user ID...");
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', dummyUser.id)
    .maybeSingle();

  let triggerSuccess = false;
  if (profileErr) {
    console.error("Error checking profile:", profileErr.message);
  } else if (!profile) {
    console.error("FAIL: No profile row was automatically created by the trigger!");
  } else {
    console.log("SUCCESS: Profile row was automatically created by the trigger!");
    console.log("Profile Detail:", profile);
    triggerSuccess = true;
  }

  // 3. Clean up (delete dummy auth user - cascades to profiles if RLS/foreign key holds,
  // or we delete profile then auth user)
  console.log("Cleaning up dummy user...");
  
  if (profile) {
    const { error: delProfileErr } = await supabase.from('profiles').delete().eq('id', dummyUser.id);
    if (delProfileErr) console.error("Error deleting profile:", delProfileErr.message);
    else console.log("Test profile deleted successfully.");
  }

  const { error: delAuthErr } = await supabase.auth.admin.deleteUser(dummyUser.id);
  if (delAuthErr) console.error("Error deleting auth user:", delAuthErr.message);
  else console.log("Test auth user deleted successfully.");

  if (triggerSuccess) {
    console.log("\n*** TRIGGER TEST PASSED ***");
  } else {
    console.log("\n*** TRIGGER TEST FAILED ***");
  }
}

main().catch(console.error);
