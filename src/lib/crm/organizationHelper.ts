import crypto from 'crypto';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const resolvedOrgCache = new Map<string, string>();

/** Checks whether a string is a valid UUID v1-v5 identifier. */
export function isValidUuid(value?: string | null): value is string {
  return Boolean(value && UUID_REGEX.test(value.trim()));
}

/** Generates a valid UUID v4 for persistent database records. */
export function newUuid(): string {
  return crypto.randomUUID();
}

/**
 * Read-only lookup for an existing `organizations.id` associated with the user or preferredOrgId.
 * Never mutates `organizations` or `organization_members` during GET/read paths.
 */
export async function lookupExistingOrganizationId(
  userId: string,
  preferredOrgId?: string | null
): Promise<string | null> {
  if (typeof window !== 'undefined' || !isSupabaseAdminConfigured || !isValidUuid(userId)) {
    return null;
  }

  const cacheKey = `${userId}:${preferredOrgId || ''}`;
  const cached = resolvedOrgCache.get(cacheKey);
  if (cached) return cached;

  try {
    if (isValidUuid(preferredOrgId)) {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('id', preferredOrgId)
        .maybeSingle();
      if (org?.id) {
        resolvedOrgCache.set(cacheKey, org.id);
        return org.id;
      }
    }

    const { data: membership } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (membership?.organization_id) {
      resolvedOrgCache.set(cacheKey, membership.organization_id);
      return membership.organization_id;
    }
  } catch {
    // Non-blocking read-only lookup
  }

  return null;
}

/**
 * Resolves a valid `organizations.id` foreign key for a user/workspace.
 * Returns null for synthetic non-UUID test IDs so hermetic in-memory tests never hit DB FK errors.
 */
export async function resolveValidOrganizationId(
  userId: string,
  preferredOrgId?: string | null
): Promise<string | null> {
  if (typeof window !== 'undefined' || !isSupabaseAdminConfigured || !isValidUuid(userId)) {
    return null;
  }

  const cacheKey = `${userId}:${preferredOrgId || ''}`;
  const existing = await lookupExistingOrganizationId(userId, preferredOrgId);
  if (existing) {
    return existing;
  }

  try {

    // Auto-provision an organization row if the user has a real profile without membership yet
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, business_name')
      .eq('id', userId)
      .maybeSingle();

    if (!profile?.id) {
      return null;
    }

    const orgSlug = `ws-${userId.slice(0, 8)}`;
    const { data: bySlug } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .maybeSingle();

    let orgId = bySlug?.id;
    if (!orgId) {
      const createdId = newUuid();
      const { data: createdOrg, error: orgErr } = await supabaseAdmin
        .from('organizations')
        .insert({
          id: createdId,
          name: profile.business_name || 'StarX Flow Workspace',
          slug: orgSlug,
          plan: 'free',
          monthly_ai_messages_used: 0,
          monthly_voice_minutes_used: 0,
        })
        .select('id')
        .single();

      if (orgErr) {
        console.warn('[organizationHelper] Failed to provision organization:', orgErr.message);
        return null;
      }
      orgId = createdOrg?.id;
    }

    if (orgId) {
      await supabaseAdmin
        .from('organization_members')
        .upsert(
          { organization_id: orgId, user_id: userId, role: 'owner' },
          { onConflict: 'organization_id,user_id' }
        );
      resolvedOrgCache.set(cacheKey, orgId);
      return orgId;
    }
  } catch (err: any) {
    console.warn('[organizationHelper] Organization resolution error:', err?.message);
  }

  return null;
}
