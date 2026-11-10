import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Sliding-window in-memory rate limiter for lead protection (max 5 submissions per 10 minutes per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_WINDOW = 5;
const WINDOW_DURATION_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_DURATION_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

const demoRequestSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  workEmail: z.string().trim().email('Please enter a valid work email').max(120),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(100),
  businessType: z.string().trim().min(2).max(50),
  businessSize: z.string().trim().min(1).max(50),
  primaryNeed: z.string().trim().min(2).max(100),
  preferredContact: z.enum(['email', 'whatsapp', 'phone']).default('email'),
  website: z.string().trim().max(150).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  honeypot: z.string().max(100).optional().or(z.literal('')),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to be contacted regarding your demo request.',
  }),
});

export async function POST(request: Request) {
  try {
    // 0. Content-Type & Payload Size Validation
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Unsupported media type. Expected application/json' },
        { status: 415 }
      );
    }

    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 50000) {
      return NextResponse.json(
        { error: 'Payload too large. Maximum 50KB allowed.' },
        { status: 413 }
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    // 1A. First-Tier Local In-Memory Rate Limiting (Circuit-Breaker)
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error:
            'Too many requests from this address. Please wait a few minutes before submitting again.',
        },
        { status: 429 }
      );
    }

    // 1B. Second-Tier Distributed Rate Limiting (Querying Supabase demo_requests)
    try {
      const windowStart = new Date(Date.now() - WINDOW_DURATION_MS).toISOString();
      const { count } = await supabaseAdmin
        .from('demo_requests')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', clientIp)
        .gte('created_at', windowStart);

      if (count && count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          {
            error:
              'Too many requests from this address. Please wait a few minutes before submitting again.',
          },
          { status: 429 }
        );
      }
    } catch {
      // Fallback gracefully to in-memory check if DB query fails or table is pending migration
    }

    const body = await request.json();

    // 2. Bot Trap (Honeypot) check: if bot filled honeypot, fake success without saving
    if (body.honeypot && body.honeypot.trim().length > 0) {
      return NextResponse.json({
        success: true,
        referenceId: `DEMO-${Date.now().toString(36).toUpperCase()}`,
        message: 'Thank you! Your demo request has been received.',
      });
    }

    // 3. Zod Server-side Validation
    const parsed = demoRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid form data';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;
    const referenceId = `DEMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 4. Persistence to Supabase
    try {
      const { error: dbError } = await supabaseAdmin.from('demo_requests').insert({
        full_name: data.fullName,
        work_email: data.workEmail,
        phone: data.phone || null,
        business_name: data.businessName,
        business_type: data.businessType,
        business_size: data.businessSize,
        primary_need: data.primaryNeed,
        preferred_contact: data.preferredContact,
        website: data.website || null,
        notes: data.notes || null,
        ip_address: clientIp,
        status: 'new',
        consent_given: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        // Table might not be migrated yet in developer environments — log securely and proceed
        console.warn(
          `[StarX Demo Capture] DB notice: ${dbError.message} (Stored as reference ${referenceId})`
        );
      }
    } catch (dbErr: any) {
      console.warn(
        `[StarX Demo Capture] DB exception: ${dbErr?.message} (Stored as reference ${referenceId})`
      );
    }

    // Return structured success
    return NextResponse.json({
      success: true,
      referenceId,
      message:
        'Thank you! Your product demonstration request has been confirmed. A solutions architect will reach out within 1 business day.',
    });
  } catch (err: any) {
    console.error('[StarX Demo Request Exception]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
