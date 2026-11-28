import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { AIProvider } from '@/lib/ai/provider';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { isValidUuid, lookupExistingOrganizationId, newUuid } from '@/lib/crm/organizationHelper';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const VoiceSimulatorSchema = z.object({
  message: z.string().trim().max(4000).optional().default(''),
  customerName: z.string().trim().max(120).optional().default('Inbound Caller'),
  customerPhone: z.string().trim().max(40).optional().default('+49 30 000000'),
  leadId: z.string().uuid().optional().nullable(),
  role: z
    .enum(['receptionist', 'sales', 'support', 'appointment', 'order', 'followup', 'marketing', 'analyst'])
    .optional()
    .default('receptionist'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'ai', 'agent', 'customer', 'human', 'system']),
        text: z.string().max(4000),
        timestamp: z.string().max(40).optional(),
      })
    )
    .max(30)
    .optional()
    .default([]),
  endCall: z.boolean().optional().default(false),
  durationSeconds: z.number().int().min(0).max(7200).optional().default(0),
  extractedMemory: z
    .array(z.object({ key: z.string().max(80), value: z.string().max(300) }))
    .max(20)
    .optional()
    .default([]),
});

function inferCallSentiment(transcriptText: string): 'positive' | 'negative' | 'neutral' {
  const lower = transcriptText.toLowerCase();
  if (/\b(complaint|angry|refund|terrible|lawsuit|worst|ruined|cancel|manager|dispute)\b/.test(lower)) {
    return 'negative';
  }
  if (/\b(thank|thanks|perfect|great|book|confirmed|booked|scheduled|wonderful)\b/.test(lower)) {
    return 'positive';
  }
  return 'neutral';
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return apiErrorResponse(400, 'BAD_JSON', 'Invalid JSON request body');
    }

    const parsed = VoiceSimulatorSchema.safeParse(rawBody);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid voice simulation parameters');
    }

    const data = parsed.data;
    const userId = auth.session.user.id;
    const orgId = auth.session.organizationId;

    if (data.endCall) {
      const normalizedTranscript = data.history.map((h, i) => ({
        role: h.role === 'ai' || h.role === 'agent' ? 'agent' : 'customer',
        text: h.text,
        timestamp: h.timestamp || `0:${String((i + 1) * 6).padStart(2, '0')}`,
      }));

      const fullText = normalizedTranscript.map((t) => t.text).join(' ');
      const sentiment = inferCallSentiment(fullText);
      const lastAgentMsg = [...normalizedTranscript].reverse().find((t) => t.role === 'agent')?.text || '';
      const lastCustomerMsg = [...normalizedTranscript].reverse().find((t) => t.role === 'customer')?.text || '';
      const summary =
        normalizedTranscript.length > 0
          ? `Live AI Voice call with ${data.customerName}. Topic: "${lastCustomerMsg.slice(0, 110)}". Outcome: "${lastAgentMsg.slice(0, 120)}".`
          : `Inbound call with ${data.customerName} completed.`;

      const callRecord = {
        id: newUuid(),
        user_id: isValidUuid(userId) ? userId : undefined,
        lead_id: data.leadId || null,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        direction: 'inbound',
        status: 'completed',
        duration_seconds: Math.max(1, data.durationSeconds || normalizedTranscript.length * 8),
        recording_url: '',
        transcription: normalizedTranscript,
        summary,
        sentiment,
        call_memory: data.extractedMemory,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseAdminConfigured && isValidUuid(userId)) {
        const { data: inserted } = await supabaseAdmin
          .from('calls')
          .insert({
            id: callRecord.id,
            user_id: userId,
            lead_id: callRecord.lead_id,
            customer_name: callRecord.customer_name,
            customer_phone: callRecord.customer_phone,
            direction: callRecord.direction,
            status: callRecord.status,
            duration_seconds: callRecord.duration_seconds,
            recording_url: '',
            transcription: callRecord.transcription,
            summary: callRecord.summary,
            sentiment: callRecord.sentiment,
            call_memory: callRecord.call_memory,
          })
          .select()
          .maybeSingle();

        const validOrg = await lookupExistingOrganizationId(userId, orgId);
        if (data.leadId && isValidUuid(data.leadId) && isValidUuid(validOrg)) {
          await supabaseAdmin.from('crm_activities').insert({
            organization_id: validOrg,
            lead_id: data.leadId,
            activity_type: 'call',
            title: `AI Voice Call (${Math.max(1, callRecord.duration_seconds)}s · ${sentiment})`,
            body: summary,
            metadata: { source: 'voice_simulator', call_id: (inserted as any)?.id || callRecord.id },
          });
        }
      }

      return NextResponse.json({
        success: true,
        call: callRecord,
      });
    }

    if (!data.message || data.message.length === 0) {
      return apiErrorResponse(422, 'VALIDATION_ERROR', 'Message is required for a live voice turn');
    }

    const mappedHistory = data.history.map((h) => ({
      role: (h.role === 'ai' || h.role === 'agent' ? 'ai' : 'user') as 'user' | 'ai',
      text: h.text,
    }));

    const aiResult = await AIProvider.executeAgent({
      userId,
      organizationId: orgId,
      role: data.role,
      channel: 'Phone',
      customerMessage: data.message,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      leadId: data.leadId || undefined,
      conversationHistory: mappedHistory,
      customInstructions:
        'This conversation is happening over a live spoken phone call. Keep replies crisp, warm, natural for spoken audio, and concise (2-3 short sentences max).',
      enableTools: true,
      includeTrace: true,
      actorType: 'staff',
    });

    const extractedFromTools: Array<{ key: string; value: string }> = [];
    for (const exec of aiResult.toolExecutions || []) {
      if (exec.tool === 'saveCustomerPreference' && exec.result?.success && exec.result.data?.key) {
        extractedFromTools.push({
          key: String(exec.result.data.key),
          value: String(exec.result.data.value || ''),
        });
      } else if (exec.tool === 'bookAppointment' && exec.result?.success && exec.result.data?.startTime) {
        extractedFromTools.push({
          key: 'appointment_booked',
          value: `${exec.result.data.serviceName || 'Slot'} @ ${exec.result.data.startTime}`,
        });
      } else if (exec.tool === 'escalateToHuman' && exec.result?.success) {
        extractedFromTools.push({
          key: 'human_handoff',
          value: String(exec.result.data?.reason || 'Requested human team'),
        });
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiResult.replyText,
      provider: aiResult.provider,
      model: aiResult.model,
      requiresHumanHandoff: aiResult.requiresHumanHandoff,
      handoffReason: aiResult.handoffReason,
      sources: aiResult.sources || [],
      toolExecutions: aiResult.toolExecutions || [],
      extractedMemory: extractedFromTools,
      trace: aiResult.trace || null,
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to process voice AI request');
  }
}
