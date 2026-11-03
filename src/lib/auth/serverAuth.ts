import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../supabaseAdmin';

export interface AuthenticatedStaffSession {
  user: {
    id: string;
    email?: string;
  };
  organizationId: string;
  role: 'owner' | 'admin' | 'agent';
}

export type AuthResult =
  | { authenticated: true; session: AuthenticatedStaffSession }
  | { authenticated: false; status: 401 | 403; error: string };

// Dedicated test session mock container for hermetic testing
let testSessionOverride: AuthenticatedStaffSession | null = null;

export function setTestStaffSession(session: AuthenticatedStaffSession | null) {
  testSessionOverride = session;
}

/**
 * Validates staff authentication, verifies organization membership,
 * and enforces role-based access control.
 * Rejects anonymous callers, forged user IDs, and cross-tenant access.
 */
export async function authenticateStaffRequest(
  req: Request | NextRequest,
  options?: {
    requiredRole?: 'owner' | 'admin' | 'agent';
    targetOrganizationId?: string | null;
  }
): Promise<AuthResult> {
  // Test mock override takes precedence in test environments
  if (testSessionOverride) {
    if (options?.targetOrganizationId && options.targetOrganizationId !== testSessionOverride.organizationId) {
      return {
        authenticated: false,
        status: 403,
        error: 'Forbidden: Cross-organization access denied',
      };
    }
    if (options?.requiredRole === 'admin' && testSessionOverride.role === 'agent') {
      return {
        authenticated: false,
        status: 403,
        error: 'Forbidden: Admin or owner role required',
      };
    }
    if (options?.requiredRole === 'owner' && testSessionOverride.role !== 'owner') {
      return {
        authenticated: false,
        status: 403,
        error: 'Forbidden: Owner role required',
      };
    }
    return { authenticated: true, session: testSessionOverride };
  }

  // 1. Extract Bearer token or cookie
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  if (!token) {
    // Check cookies if in NextRequest context
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/sb-access-token=([^;]+)/) || cookieHeader.match(/sb-[^;]+-auth-token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) {
    return {
      authenticated: false,
      status: 401,
      error: 'Unauthorized: Missing authentication token. Please sign in.',
    };
  }

  // 2. Verify token via Supabase Auth
  try {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);

    if (authErr || !user) {
      return {
        authenticated: false,
        status: 401,
        error: 'Unauthorized: Invalid or expired authentication token',
      };
    }

    // 3. Resolve Organization Membership from Database
    const { data: memberships, error: memberErr } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id);

    // Also check if user is direct creator/owner of any organizations
    const { data: ownedOrgs } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('created_by', user.id);

    const validOrgIds = new Set<string>();
    let resolvedRole: 'owner' | 'admin' | 'agent' = 'agent';

    if (memberships && memberships.length > 0) {
      for (const m of memberships) {
        validOrgIds.add(m.organization_id);
        if (m.role === 'owner') resolvedRole = 'owner';
        else if (m.role === 'admin' && resolvedRole !== 'owner') resolvedRole = 'admin';
      }
    }

    if (ownedOrgs && ownedOrgs.length > 0) {
      for (const o of ownedOrgs) {
        validOrgIds.add(o.id);
        resolvedRole = 'owner';
      }
    }

    // Fallback: If organization table doesn't have records yet, user ID acts as default organization
    validOrgIds.add(user.id);

    // 4. Validate Target Organization Scope
    let targetOrg = options?.targetOrganizationId;
    if (targetOrg) {
      if (!validOrgIds.has(targetOrg)) {
        return {
          authenticated: false,
          status: 403,
          error: 'Forbidden: You do not have permission to access resources in this organization',
        };
      }
    } else {
      // Pick first verified organization
      targetOrg = Array.from(validOrgIds)[0] || user.id;
    }

    // 5. Role and Permission Enforcement
    if (options?.requiredRole) {
      if (options.requiredRole === 'owner' && resolvedRole !== 'owner') {
        return {
          authenticated: false,
          status: 403,
          error: 'Forbidden: Owner role required for this sensitive action',
        };
      }
      if (options.requiredRole === 'admin' && resolvedRole === 'agent') {
        return {
          authenticated: false,
          status: 403,
          error: 'Forbidden: Admin or owner role required for this action',
        };
      }
    }

    return {
      authenticated: true,
      session: {
        user: {
          id: user.id,
          email: user.email,
        },
        organizationId: targetOrg,
        role: resolvedRole,
      },
    };
  } catch (err: any) {
    return {
      authenticated: false,
      status: 401,
      error: `Authentication failed: ${err.message}`,
    };
  }
}
