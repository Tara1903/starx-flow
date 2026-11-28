import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { isValidUuid, lookupExistingOrganizationId, resolveValidOrganizationId } from '@/lib/crm/organizationHelper';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const SettingsProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(1, 'Contact name is required').max(140).optional(),
    businessName: z.string().trim().min(1, 'Business name is required').max(160).optional(),
    businessType: z.string().trim().max(100).optional(),
    autonomyMode: z.enum(['max', 'human']).optional(),
    leadEnrichment: z.boolean().optional(),
    selfTuning: z.boolean().optional(),
  })
  .strict();

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const userId = auth.session.user.id;
    const rawOrg = auth.session.organizationId || userId;
    const defaults = {
      name: '',
      businessName: '',
      businessType: 'Salon',
      autonomyMode: 'max' as 'max' | 'human',
      leadEnrichment: true,
      selfTuning: false,
      email: auth.session.user.email || '',
      organizationId: rawOrg,
    };

    if (!isSupabaseAdminConfigured || !isValidUuid(userId)) {
      return NextResponse.json({ success: true, profile: defaults });
    }

    const orgId = await lookupExistingOrganizationId(userId, rawOrg);
    const [profRes, orgRes] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('owner_name, business_name, business_type, email')
        .eq('id', userId)
        .maybeSingle(),
      orgId
        ? supabaseAdmin.from('organizations').select('id, name, settings').eq('id', orgId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const prof = profRes.data as any;
    const org = orgRes.data as any;
    const orgSettings = (org?.settings || {}) as Record<string, any>;

    return NextResponse.json({
      success: true,
      profile: {
        name: prof?.owner_name || '',
        businessName: prof?.business_name || org?.name || '',
        businessType: prof?.business_type || 'Salon',
        autonomyMode: orgSettings.autonomyMode === 'human' ? 'human' : 'max',
        leadEnrichment: orgSettings.leadEnrichment !== false,
        selfTuning: Boolean(orgSettings.selfTuning),
        email: prof?.email || auth.session.user.email || '',
        organizationId: org?.id || rawOrg,
      },
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to load settings profile');
  }
}

export async function PUT(req: NextRequest) {
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

    const parsed = SettingsProfileUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid workspace profile fields');
    }

    const data = parsed.data;
    const userId = auth.session.user.id;
    const rawOrg = auth.session.organizationId || userId;

    if (isSupabaseAdminConfigured && isValidUuid(userId)) {
      const profileUpdate: Record<string, any> = {};
      if (data.name !== undefined) profileUpdate.owner_name = data.name;
      if (data.businessName !== undefined) profileUpdate.business_name = data.businessName;
      if (data.businessType !== undefined) profileUpdate.business_type = data.businessType;

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profErr } = await supabaseAdmin
          .from('profiles')
          .update(profileUpdate)
          .eq('id', userId);
        if (profErr) {
          return apiErrorResponse(500, 'PROFILE_UPDATE_FAILED', 'Unable to persist workspace profile');
        }
      }

      if (auth.session.role !== 'agent') {
        const orgId = await resolveValidOrganizationId(userId, rawOrg);
        if (orgId) {
          const { data: orgRow } = await supabaseAdmin
            .from('organizations')
            .select('settings')
            .eq('id', orgId)
            .maybeSingle();

          const currentSettings = ((orgRow as any)?.settings || {}) as Record<string, any>;
          const nextSettings = {
            ...currentSettings,
            ...(data.autonomyMode !== undefined ? { autonomyMode: data.autonomyMode } : {}),
            ...(data.leadEnrichment !== undefined ? { leadEnrichment: data.leadEnrichment } : {}),
            ...(data.selfTuning !== undefined ? { selfTuning: data.selfTuning } : {}),
          };

          await supabaseAdmin
            .from('organizations')
            .update({
              ...(data.businessName !== undefined ? { name: data.businessName } : {}),
              settings: nextSettings,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orgId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: data.name,
        businessName: data.businessName,
        businessType: data.businessType,
        autonomyMode: data.autonomyMode,
        leadEnrichment: data.leadEnrichment,
        selfTuning: data.selfTuning,
      },
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to save workspace settings');
  }
}
