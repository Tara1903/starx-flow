import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BusinessProfileService } from '@/lib/ai/businessProfileService';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const DayHoursSchema = z.object({
  open: z.string().trim().max(10).optional(),
  close: z.string().trim().max(10).optional(),
  closed: z.boolean(),
});

const ReceptionistSettingsUpdateSchema = z
  .object({
    businessName: z.string().trim().min(1).max(160).optional(),
    businessType: z.string().trim().max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    timezone: z.string().trim().min(1).max(80).optional(),
    location: z.string().trim().max(200).optional(),
    contactPhone: z.string().trim().max(60).optional(),
    contactEmail: z.string().trim().max(160).optional(),
    customInstructions: z.string().trim().max(4000).optional(),
    handoffRules: z.string().trim().max(1000).optional(),
    supportedLanguages: z.array(z.string().trim().max(12)).max(20).optional(),
    isActive: z.boolean().optional(),
    greeting: z.string().trim().max(500).optional(),
    services: z
      .array(
        z.object({
          id: z.string().trim().max(80).optional(),
          name: z.string().trim().min(1).max(140),
          description: z.string().trim().max(400).optional(),
          priceEur: z.number().min(0).max(1000000).optional(),
          price: z.number().min(0).max(1000000).optional(),
          currency: z.string().trim().max(8).optional(),
          durationMinutes: z.number().int().min(5).max(1440).default(30),
        })
      )
      .max(100)
      .optional(),
    openingHours: z
      .object({
        monday: DayHoursSchema,
        tuesday: DayHoursSchema,
        wednesday: DayHoursSchema,
        thursday: DayHoursSchema,
        friday: DayHoursSchema,
        saturday: DayHoursSchema,
        sunday: DayHoursSchema,
      })
      .partial()
      .optional(),
    faqs: z
      .array(
        z.object({
          question: z.string().trim().min(1).max(400),
          answer: z.string().trim().min(1).max(1500),
        })
      )
      .max(50)
      .optional(),
    policies: z
      .object({
        cancellation: z.string().trim().max(1000).optional(),
        refunds: z.string().trim().max(1000).optional(),
        booking_rules: z.string().trim().max(1000).optional(),
        payment: z.string().trim().max(1000).optional(),
      })
      .optional(),
  })
  .strict();

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const orgId = auth.session.organizationId || auth.session.user.id;
    const profile = await BusinessProfileService.getProfile(orgId, auth.session.user.id);
    const hoursStatus = BusinessProfileService.isWithinBusinessHours(profile);

    return NextResponse.json({
      profile,
      status: {
        isOpen: hoursStatus.isOpen,
        currentDay: hoursStatus.currentDay,
        hoursToday: hoursStatus.hoursToday,
      },
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to load receptionist settings');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return apiErrorResponse(400, 'BAD_JSON', 'Invalid JSON request body');
    }

    const parsed = ReceptionistSettingsUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid receptionist profile configuration');
    }

    const orgId = auth.session.organizationId || auth.session.user.id;
    const { greeting, ...rest } = parsed.data;
    const existing = await BusinessProfileService.getProfile(orgId, auth.session.user.id);
    const updates: Record<string, any> = {
      ...rest,
      ...(rest.openingHours
        ? { openingHours: { ...existing.openingHours, ...rest.openingHours } }
        : {}),
      ...(rest.policies
        ? { policies: { ...existing.policies, ...rest.policies } }
        : {}),
      ...(greeting && !rest.description ? { description: greeting } : {}),
    };

    const updated = await BusinessProfileService.updateProfile(orgId, updates);
    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to update receptionist settings');
  }
}
