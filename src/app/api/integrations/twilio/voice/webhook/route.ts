import { NextRequest, NextResponse } from 'next/server';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { isValidUuid } from '@/lib/crm/organizationHelper';
import { verifyTwilioSignature } from '@/lib/integrations/twilioSignature';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function twimlResponse(xmlBody: string, status = 200): NextResponse {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${xmlBody}</Response>`, {
    status,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });
}

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!authToken) {
    return NextResponse.json(
      { error: { code: 'TWILIO_NOT_CONFIGURED', message: 'TWILIO_AUTH_TOKEN is not configured' } },
      { status: 503 }
    );
  }

  const signature = req.headers.get('x-twilio-signature') || '';
  if (!signature) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Missing X-Twilio-Signature header' } },
      { status: 401 }
    );
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid form payload' } },
      { status: 400 }
    );
  }

  const params: Record<string, string> = {};
  formData.forEach((v, k) => {
    params[k] = typeof v === 'string' ? v : '';
  });

  const externalUrl = process.env.TWILIO_VOICE_WEBHOOK_URL || req.url;
  if (!verifyTwilioSignature(authToken, externalUrl, params, signature)) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid Twilio webhook signature' } },
      { status: 401 }
    );
  }

  const callerPhone = params.From || 'Unknown Caller';
  const callerName = params.CallerName || callerPhone;
  const speechResult = (params.SpeechResult || '').trim();
  const callSid = params.CallSid || `call-${Date.now()}`;

  const urlObj = new URL(req.url);
  const targetUserId = urlObj.searchParams.get('userId') || process.env.DEFAULT_RECEPTIONIST_USER_ID || '';
  const targetOrgId = urlObj.searchParams.get('organizationId') || null;

  if (!speechResult) {
    return twimlResponse(
      `<Gather input="speech" action="${escapeXml('/api/integrations/twilio/voice/webhook')}" method="POST" speechTimeout="auto"><Say voice="Polly.Joanna">Hello! Thank you for calling. How may our AI Receptionist assist you today?</Say></Gather>`
    );
  }

  if (!isValidUuid(targetUserId)) {
    return twimlResponse(
      `<Say voice="Polly.Joanna">Thank you for calling. Please leave a message or reach us online and a team member will follow up shortly.</Say><Hangup/>`
    );
  }

  const result = await AIOrchestrator.handleInboundMessage({
    userId: targetUserId,
    organizationId: targetOrgId,
    channel: 'Phone',
    senderPhone: callerPhone,
    senderName: callerName,
    messageText: speechResult,
    conversationId: callSid,
    metadata: { callSid, source: 'twilio_voice' },
  });

  const replyText =
    result.aiResponse.replyText ||
    'Thank you for calling. Our team will follow up with you shortly.';

  if (isSupabaseAdminConfigured && isValidUuid(targetUserId)) {
    try {
      await supabaseAdmin.from('calls').insert({
        user_id: targetUserId,
        lead_id: isValidUuid(result.leadId) ? result.leadId : null,
        customer_name: callerName,
        customer_phone: callerPhone,
        direction: 'inbound',
        status: 'completed',
        duration_seconds: 15,
        transcription: [
          { role: 'customer', text: speechResult, timestamp: '0:05' },
          { role: 'agent', text: replyText, timestamp: '0:12' },
        ],
        summary: `Twilio AI Voice turn: "${speechResult.slice(0, 100)}" -> "${replyText.slice(0, 100)}"`,
        sentiment: result.aiResponse.requiresHumanHandoff ? 'negative' : 'positive',
      });
    } catch {
      // Non-blocking call telemetry log
    }
  }

  if (result.aiResponse.requiresHumanHandoff) {
    return twimlResponse(`<Say voice="Polly.Joanna">${escapeXml(replyText)}</Say><Hangup/>`);
  }

  return twimlResponse(
    `<Gather input="speech" action="${escapeXml('/api/integrations/twilio/voice/webhook')}" method="POST" speechTimeout="auto"><Say voice="Polly.Joanna">${escapeXml(replyText)}</Say></Gather>`
  );
}
