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
Always keep your answers concise, helpful, and in character.
CRITICAL RULE: You MUST always reply in the exact same language and script that the customer used in their message. 
If the user speaks in an Indian language (Hindi, Tamil, Telugu, etc.) or uses "Hinglish" (Hindi written in English/Latin script), you must fluently understand it and reply in the same style, language, and script.`;

      // Helper function to fetch from Nvidia with retries
      const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          const res = await fetch(url, options);
          const data = await res.json();
          // OpenAI format returns { choices: [...] }, error is usually { error: { message: ... } }
          if (!data.error) {
            return data;
          }
          // If rate limited (429) or internal error (500), wait and retry
          if (res.status === 429 || res.status >= 500) {
            console.warn(`Nvidia API Error (Attempt ${i + 1}/${maxRetries}):`, data.error?.message || data.error);
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
            continue;
          }
          // Other errors (e.g. 400 Bad Request), don't retry
          console.error(`Nvidia API Fatal Error:`, data.error);
          return data;
        }
        return { error: { message: "Max retries reached" } };
      };

      // Using the API key provided by the user
      const nvidiaApiKey = Deno.env.get('NVIDIA_API_KEY') || "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";

      const aiData = await fetchWithRetry(`https://integrate.api.nvidia.com/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaApiKey}`
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: messageText }
          ],
          max_tokens: 1024,
          temperature: 0.7,
          stream: false
        })
      });

      if (aiData.error) {
        aiResponseText = `I'm receiving too many messages right now. Please try again in a few seconds. (Error: ${aiData.error.message || JSON.stringify(aiData.error)})`;
      } else {
        aiResponseText = aiData?.choices?.[0]?.message?.content || "Sorry, I couldn't process that right now.";
      }
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
