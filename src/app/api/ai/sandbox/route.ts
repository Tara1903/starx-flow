import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { AIProvider } from '@/lib/ai/provider';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const SandboxRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(4000),
  role: z
    .enum(['receptionist', 'sales', 'support', 'appointment', 'order', 'followup', 'marketing', 'analyst'])
    .optional()
    .default('receptionist'),
  agentName: z.string().trim().max(80).optional(),
  channel: z
    .enum(['WhatsApp', 'Instagram', 'SMS', 'Web', 'Email', 'Messenger', 'Sandbox'])
    .optional()
    .default('Sandbox'),
  tone: z.enum(['Friendly', 'Professional', 'Casual', 'Urgent']).optional().default('Professional'),
  customPrompt: z.string().max(4000).optional(),
  customInstructions: z.string().max(2000).optional(),
  leadId: z.string().uuid().optional().nullable(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'ai', 'human', 'system']),
        text: z.string().max(4000),
      })
    )
    .max(20)
    .optional()
    .default([]),
  simulateProfile: z.record(z.string(), z.unknown()).optional(),
  enableTools: z.boolean().optional().default(true),
});

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

    const parsed = SandboxRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid sandbox simulation payload');
    }

    const {
      message,
      role,
      agentName,
      channel,
      tone,
      customPrompt,
      customInstructions,
      leadId,
      history,
      simulateProfile,
      enableTools,
    } = parsed.data;

    const result = await AIProvider.executeAgent({
      userId: auth.session.user.id,
      organizationId: auth.session.organizationId,
      role,
      channel,
      customerMessage: message,
      leadId: leadId || undefined,
      conversationHistory: history,
      customSystemPrompt:
        customPrompt?.trim() || (agentName ? `You are acting as "${agentName}".` : undefined),
      customInstructions: customInstructions?.trim() || undefined,
      tone,
      simulateProfile: simulateProfile as any,
      enableTools,
      includeTrace: true,
      actorType: 'staff',
    });

    const configured =
      Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-')) ||
      Boolean(process.env.NVIDIA_API_KEY && !process.env.NVIDIA_API_KEY.includes('your-'));

    return NextResponse.json({
      success: true,
      configured,
      reply: result.replyText,
      model: result.model,
      provider: result.provider,
      confidence: result.confidence,
      requiresHumanHandoff: result.requiresHumanHandoff,
      handoffReason: result.handoffReason,
      sources: result.sources || [],
      suggestedAction: result.suggestedAction ?? null,
      toolExecutions: result.toolExecutions || [],
      trace: result.trace || null,
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to run AI sandbox simulation');
  }
}
