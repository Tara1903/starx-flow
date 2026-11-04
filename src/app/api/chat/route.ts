import { NextResponse } from 'next/server';
import { IngestionGateway } from '@/lib/ingestion';
import { UsageService } from '@/lib/usage/usageService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function OPTIONS() {
  return new NextResponse('ok', {
    status: 200,
    headers: corsHeaders,
  });
}

// Sliding window in-memory rate limiter for abuse protection (Requirement 3.D)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const body = await request.json();
    const { message, sessionId, organizationId, businessId } = body;
    const targetOrg = organizationId || businessId || 'default-org';

    // 1. Abuse Protection & Rate Limiting
    const rateLimitKey = `${clientIp}:${sessionId || 'global'}`;
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another message.' },
        { status: 429, headers: corsHeaders }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const adapter = IngestionGateway.getAdapter('web');
    const canonicalEvent = await adapter?.normalize(
      {
        ...body,
        organizationId: targetOrg,
        businessId: targetOrg,
      },
      {
        organizationId: targetOrg,
        userId: targetOrg,
      }
    );

    if (!canonicalEvent) {
      return NextResponse.json(
        { error: 'Failed to normalize message payload' },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await IngestionGateway.process(canonicalEvent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Record web chat usage
    await UsageService.recordUsage({
      userId: targetOrg,
      organizationId: targetOrg,
      metricType: 'web_chat_messages' as any,
      quantity: 1,
    });

    return NextResponse.json(
      {
        success: true,
        conversationId: result.conversationId,
        leadId: result.leadId,
        reply: result.replyText,
        requiresHandoff: result.requiresHumanHandoff,
        suggestedAction: null,
        sources: [],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err: any) {
    console.error('[API /api/chat error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
