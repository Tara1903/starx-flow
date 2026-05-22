require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const usersToInsert = [
  {
    id: 'ea5a4da9-8dcd-4104-a74d-55eac2b8dd0a',
    email: 'business.starxapp@gmail.com',
    owner_name: 'Starx App',
    business_name: 'Starx App Business',
    business_type: 'Other'
  },
  {
    id: 'f2f6e9f5-edcc-4999-aa4c-def3d3395355',
    email: 'tarasingh1903@gmail.com',
    owner_name: 'TARA SINGH',
    business_name: 'TARA SINGH Business',
    business_type: 'Other'
  },
  {
    id: '85b006dc-00d3-44e6-af37-1e52dfea3b00',
    email: 'tarasinghsikh1903@gmail.com',
    owner_name: 'Tara Singh',
    business_name: 'Tara Singh Business',
    business_type: 'Other'
  }
];

async function main() {
  console.log("=== Restoring Missing Profiles ===");

  for (const user of usersToInsert) {
    console.log(`Checking profile for user: ${user.email} (${user.id})...`);
    
    // 1. Check if profile already exists
    const { data: existingProfile, error: checkErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (checkErr) {
      console.error(`Error checking profile for ${user.email}:`, checkErr.message);
      continue;
    }

    if (existingProfile) {
      console.log(`Profile already exists for ${user.email}.`);
    } else {
      console.log(`Profile missing for ${user.email}. Inserting profile...`);
      const { data: insertedProfile, error: insertErr } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          owner_name: user.owner_name,
          business_name: user.business_name,
          business_type: user.business_type,
          role: 'user',
          plan: 'Free Trial',
          status: 'Trial'
        })
        .select();

      if (insertErr) {
        console.error(`Error inserting profile for ${user.email}:`, insertErr.message);
      } else {
        console.log(`Successfully inserted profile for ${user.email}:`, insertedProfile);
      }
    }

    // 2. Verify triggered relations for this user
    console.log(`Verifying triggered relations for ${user.email}...`);

    // Check connected_channels
    const { data: channels, error: channelsErr } = await supabase
      .from('connected_channels')
      .select('channel_key, is_connected')
      .eq('user_id', user.id);

    if (channelsErr) {
      console.error(`Error fetching channels for ${user.email}:`, channelsErr.message);
    } else {
      console.log(`- Connected channels found: ${channels.length}`);
      if (channels.length === 0) {
        console.log(`  Manual seed needed for connected_channels. Inserting...`);
        const { error: seedChannelsErr } = await supabase
          .from('connected_channels')
          .insert([
            { user_id: user.id, channel_key: 'WhatsApp', is_connected: false },
            { user_id: user.id, channel_key: 'SMS', is_connected: false },
            { user_id: user.id, channel_key: 'Reviews', is_connected: false },
            { user_id: user.id, channel_key: 'Instagram', is_connected: false },
            { user_id: user.id, channel_key: 'Web', is_connected: false }
          ]);
        if (seedChannelsErr) {
          console.error(`  Error manual seeding channels:`, seedChannelsErr.message);
        } else {
          console.log(`  Successfully seeded connected_channels manually.`);
        }
      } else {
        console.log(`  Channels:`, channels.map(c => `${c.channel_key}: ${c.is_connected}`).join(', '));
      }
    }

    // Check onboarding_progress
    const { data: onboarding, error: onboardingErr } = await supabase
      .from('onboarding_progress')
      .select('current_step, is_complete')
      .eq('user_id', user.id)
      .maybeSingle();

    if (onboardingErr) {
      console.error(`Error fetching onboarding_progress for ${user.email}:`, onboardingErr.message);
    } else {
      if (!onboarding) {
        console.log(`  Manual seed needed for onboarding_progress. Inserting...`);
        const { error: seedOnboardingErr } = await supabase
          .from('onboarding_progress')
          .insert({
            user_id: user.id,
            is_complete: false,
            current_step: 'account'
          });
        if (seedOnboardingErr) {
          console.error(`  Error manual seeding onboarding:`, seedOnboardingErr.message);
        } else {
          console.log(`  Successfully seeded onboarding_progress manually.`);
        }
      } else {
        console.log(`  Onboarding: current_step=${onboarding.current_step}, is_complete=${onboarding.is_complete}`);
      }
    }

    // Check workflows
    const { data: workflows, error: workflowsErr } = await supabase
      .from('workflows')
      .select('name')
      .eq('user_id', user.id);

    if (workflowsErr) {
      console.error(`Error fetching workflows for ${user.email}:`, workflowsErr.message);
    } else {
      console.log(`- Workflows found: ${workflows.length}`);
      if (workflows.length === 0) {
        console.log(`  Manual seed needed for workflows. Inserting...`);
        const { error: seedWorkflowsErr } = await supabase
          .from('workflows')
          .insert([
            {
              user_id: user.id,
              name: 'WhatsApp Booking Agent',
              description: 'Automatically responds to WhatsApp messages, captures intent, and books appointments into your calendar.',
              trigger: 'WhatsApp Message Received',
              action: 'Generate AI Response',
              channel: 'WhatsApp',
              ai_tone: 'Friendly',
              custom_prompt: 'You are a warm, friendly receptionist. Greet customers, answer FAQs about services and pricing, and help them book appointments. Always confirm the date, time, and service.'
            },
            {
              user_id: user.id,
              name: 'Missed Call SMS Recovery',
              description: 'Sends an instant SMS follow-up when a call is missed, recovering potential lost bookings.',
              trigger: 'Missed Phone Call',
              action: 'Dispatch SMS Message',
              channel: 'SMS',
              ai_tone: 'Professional',
              custom_prompt: 'You are a professional assistant. A customer just called but the call was missed. Send a polite SMS apologizing and offering to help via text or schedule a callback.'
            },
            {
              user_id: user.id,
              name: 'Google Reviews Booster',
              description: 'Sends automated review requests via SMS after appointments to grow your online reputation.',
              trigger: 'Invoice Marked Paid',
              action: 'Send Review Invitation',
              channel: 'Reviews',
              ai_tone: 'Casual',
              custom_prompt: 'Send a friendly message thanking the customer for their visit and asking them to leave a quick Google review. Include the review link.'
            },
            {
              user_id: user.id,
              name: 'Instagram Lead Magnet',
              description: 'Detects engagement keywords in Instagram DMs and auto-replies with booking links and promotions.',
              trigger: 'Instagram Keyword Detected',
              action: 'Generate AI Response',
              channel: 'Instagram',
              ai_tone: 'Casual',
              custom_prompt: 'You are a social media assistant. When someone DMs with interest keywords like "book", "price", "available", respond enthusiastically with info and a booking link.'
            }
          ]);
        if (seedWorkflowsErr) {
          console.error(`  Error manual seeding workflows:`, seedWorkflowsErr.message);
        } else {
          console.log(`  Successfully seeded workflows manually.`);
        }
      }
    }

    console.log("-------------------------------------------------");
  }

  console.log("=== Verification Phase ===");
  // Fetch profiles again
  const { data: finalProfiles } = await supabase.from('profiles').select('email, id');
  console.log("Final Profiles in DB:", finalProfiles);
}

main().catch(console.error);
