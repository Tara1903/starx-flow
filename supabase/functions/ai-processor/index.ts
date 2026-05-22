import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, channel, messageText, customerPhone, credentials } = await req.json();

    if (!userId || !channel || !messageText) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch the active workflow for this user and channel
    const { data: workflows, error: wfError } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', userId)
      .eq('channel', channel)
      .eq('is_active', true)
      .limit(1);

    if (wfError || !workflows || workflows.length === 0) {
      console.log(`No active workflow found for user ${userId} on channel ${channel}`);
      return new Response('No active workflow', { status: 200, headers: corsHeaders });
    }

    const workflow = workflows[0];

    // Log: Processing
    await supabase.from('execution_logs').insert({
      user_id: userId,
      workflow_id: workflow.id,
      type: 'ai_process',
      channel,
      message: `Analyzing message against workflow rules... Tone: ${workflow.ai_tone}`
    });

    // 2. Formulate Prompt and Call Gemini API (Simulated here for edge function constraints without SDK, standard fetch to Gemini REST API)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    let aiResponseText = '';

    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY not set. Using fallback response.");
      aiResponseText = `(Fallback) Thank you for your message! Our AI is currently offline. You said: ${messageText}`;
    } else {
      const systemPrompt = `You are an AI assistant for a business. 
Context/Instructions: ${workflow.custom_prompt}
Tone: ${workflow.ai_tone}
Always keep your answers concise, helpful, and in character.`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nCustomer says: "${messageText}"\nYour response:`
            }]
          }]
        })
      });

      const geminiData = await geminiResponse.json();
      aiResponseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that right now.";
    }

    // Log: AI Reply ready
    await supabase.from('execution_logs').insert({
      user_id: userId,
      workflow_id: workflow.id,
      type: 'ai_reply',
      channel,
      message: `AI Response: '${aiResponseText}'`
    });

    // 3. Send message back via WhatsApp (Meta API)
    if (channel === 'WhatsApp' && credentials?.access_token && credentials?.phone_number_id) {
      const metaResponse = await fetch(`https://graph.facebook.com/v18.0/${credentials.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: customerPhone,
          type: "text",
          text: {
            body: aiResponseText
          }
        })
      });

      if (!metaResponse.ok) {
        const errData = await metaResponse.json();
        console.error("Meta API Error:", errData);
        throw new Error("Failed to send Meta message");
      }
    }

    // 4. Update workflow stats
    await supabase.rpc('increment_workflow_stats', { 
      wf_id: workflow.id, 
      hours: 0.25 
    });

    // Log: Success
    await supabase.from('execution_logs').insert({
      user_id: userId,
      workflow_id: workflow.id,
      type: 'success',
      channel,
      message: `√ AI processed message for ${customerPhone}`
    });

    return new Response(JSON.stringify({ 
      success: true, 
      reply: aiResponseText 
    }), { status: 200, headers: corsHeaders });
  } catch (e: any) {
    console.error('AI Processor Error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
