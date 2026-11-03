/**
 * StarX-Flow Cryptographically Secure Serverless OAuth State Manager
 * Remediates Phase 4B.5.1 Finding C1 & Phase 4B.5.3 Session Binding Hardening.
 * Enforces:
 *   1. Cryptographically random nonce (256-bit).
 *   2. Cryptographic HMAC-SHA256 signature over state and payload.
 *   3. Session binding secret hashed into state payload and stored in HttpOnly cookie.
 *   4. Verified server-side organization and user identity checking.
 *   5. Short expiration (10 min) and single-use atomic database consumption via consume_oauth_state.
 */

import crypto from 'crypto';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { supabase } from '../supabase';
import { CredentialEncryption } from './encryption';

export interface OAuthStateRecord {
  id?: string;
  stateToken: string;
  organizationId: string;
  userId: string;
  provider: string;
  redirectUri: string;
  expiresAt: string;
  consumedAt?: string | null;
  sessionBindingHash?: string;
}

export interface OAuthStateBindingResult {
  state: string;
  sessionBindingSecret: string;
  cookieName: string;
}

export class OAuthStateManager {
  // In-memory simulator registry for offline unit test sandboxes
  private static inMemoryStates = new Map<string, OAuthStateRecord>();

  /**
   * Generates standard cookie name for session binding scoped by provider and nonce prefix.
   * Prevents collisions between simultaneous OAuth flows in the same browser.
   */
  static getCookieName(provider: string, stateOrNonce: string): string {
    const raw = stateOrNonce.includes('.') ? stateOrNonce.split('.')[1] || '' : stateOrNonce;
    const prefix = raw.substring(0, 12) || 'default';
    return `starx_oauth_${provider}_${prefix}`;
  }

  /**
   * Generates a signed, single-use, serverless-safe OAuth state parameter with session binding.
   */
  static async generateStateWithBinding(options: {
    organizationId: string;
    userId: string;
    provider: string;
    redirectUri: string;
    sessionBindingSecret?: string;
    ttlMinutes?: number;
  }): Promise<OAuthStateBindingResult> {
    const { organizationId, userId, provider, redirectUri, ttlMinutes = 10 } = options;

    if (!organizationId || !userId || !provider) {
      throw new Error('OAuth state generation requires organizationId, userId, and provider');
    }

    // 1. Cryptographically random state token (256 bits)
    const nonce = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    // 2. Cryptographic session binding secret (256 bits)
    const sessionSecret = options.sessionBindingSecret || crypto.randomBytes(32).toString('hex');
    const sessionBindingHash = crypto.createHash('sha256').update(sessionSecret).digest('hex');

    const record: OAuthStateRecord = {
      stateToken: nonce,
      organizationId,
      userId,
      provider,
      redirectUri,
      expiresAt,
      consumedAt: null,
      sessionBindingHash,
    };

    // 3. Persist state in PostgreSQL database
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        await client.from('oauth_states').insert({
          state_token: nonce,
          organization_id: organizationId,
          user_id: userId,
          provider,
          redirect_uri: redirectUri,
          expires_at: expiresAt,
          metadata: {
            session_binding_hash: sessionBindingHash,
          },
        });
      } catch (err) {
        console.warn('[OAuthStateManager] Database state insert fallback to memory:', err);
      }
    }

    // Keep in offline memory registry
    this.inMemoryStates.set(nonce, record);

    // 4. Cryptographically sign state payload using HMAC-SHA256
    const payloadJson = JSON.stringify({
      tok: nonce,
      org: organizationId,
      uid: userId,
      prv: provider,
      exp: expiresAt,
      sbh: sessionBindingHash,
      rdr: redirectUri,
    });
    const encodedPayload = Buffer.from(payloadJson).toString('base64url');
    const hmac = crypto
      .createHmac('sha256', CredentialEncryption.getKey())
      .update(`${nonce}.${encodedPayload}`)
      .digest('hex');

    // Format: s1.<token>.<encodedPayload>.<hmac>
    const stateToken = `s1.${nonce}.${encodedPayload}.${hmac}`;
    const cookieName = this.getCookieName(provider, nonce);

    return {
      state: stateToken,
      sessionBindingSecret: sessionSecret,
      cookieName,
    };
  }

  /**
   * Generates a signed OAuth state parameter (returns state string).
   */
  static async generateState(options: {
    organizationId: string;
    userId: string;
    provider: string;
    redirectUri: string;
    sessionBindingSecret?: string;
    ttlMinutes?: number;
  }): Promise<string> {
    const res = await this.generateStateWithBinding(options);
    return res.state;
  }

  /**
   * Verifies the cryptographic HMAC-SHA256 signature without consuming the state.
   */
  static verifySignature(stateParam: string): boolean {
    if (!stateParam || typeof stateParam !== 'string') return false;
    const parts = stateParam.split('.');
    if (parts.length !== 4 || parts[0] !== 's1') return false;
    const [, nonce, encodedPayload, clientHmac] = parts;
    try {
      const expectedHmac = crypto
        .createHmac('sha256', CredentialEncryption.getKey())
        .update(`${nonce}.${encodedPayload}`)
        .digest('hex');
      const clientBuf = Buffer.from(clientHmac, 'hex');
      const expectedBuf = Buffer.from(expectedHmac, 'hex');
      return clientBuf.length === expectedBuf.length && crypto.timingSafeEqual(clientBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Validates cryptographic authenticity, checks expiration, session binding, and atomically consumes the OAuth state.
   * Throws on forged, replayed, expired, cross-tenant, cross-user, or cross-session state.
   */
  static async verifyAndConsumeState(options: {
    stateParam: string;
    expectedProvider: string;
    expectedOrgId?: string;
    expectedUserId?: string;
    sessionBindingSecret?: string;
    expectedRedirectUri?: string;
    allowBypassSessionBindingInTest?: boolean;
  }): Promise<OAuthStateRecord> {
    const {
      stateParam,
      expectedProvider,
      expectedOrgId,
      expectedUserId,
      sessionBindingSecret,
      expectedRedirectUri,
      allowBypassSessionBindingInTest = false,
    } = options;

    if (!stateParam || typeof stateParam !== 'string') {
      throw new Error('SECURITY VIOLATION: Missing OAuth state parameter');
    }

    const parts = stateParam.split('.');
    if (parts.length !== 4 || parts[0] !== 's1') {
      throw new Error('SECURITY VIOLATION: Forged or malformed OAuth state format');
    }

    const [, nonce, encodedPayload, clientHmac] = parts;

    // 1. Verify HMAC-SHA256 signature in constant time
    const expectedHmac = crypto
      .createHmac('sha256', CredentialEncryption.getKey())
      .update(`${nonce}.${encodedPayload}`)
      .digest('hex');

    const clientBuf = Buffer.from(clientHmac, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');

    if (clientBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(clientBuf, expectedBuf)) {
      throw new Error('SECURITY VIOLATION: Cryptographic signature mismatch on OAuth state (forged state rejected)');
    }

    // 2. Decode and validate payload content
    let parsed: { tok: string; org: string; uid: string; prv: string; exp: string; sbh?: string; rdr?: string };
    try {
      parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch {
      throw new Error('SECURITY VIOLATION: Malformed OAuth state payload');
    }

    if (parsed.tok !== nonce) {
      throw new Error('SECURITY VIOLATION: State token internal mismatch');
    }

    if (parsed.prv !== expectedProvider) {
      throw new Error(`SECURITY VIOLATION: Provider mismatch (expected ${expectedProvider}, got ${parsed.prv})`);
    }

    // 3. Expiration Check
    if (new Date(parsed.exp).getTime() <= Date.now()) {
      throw new Error('SECURITY VIOLATION: OAuth state has expired. Please initiate connection again.');
    }

    // 4. Organization Mismatch Protection
    if (expectedOrgId && parsed.org !== expectedOrgId) {
      throw new Error('SECURITY VIOLATION: Cross-organization OAuth state substitution rejected.');
    }

    // 5. User ID Mismatch Protection
    if (expectedUserId && parsed.uid !== expectedUserId) {
      throw new Error('SECURITY VIOLATION: Cross-user OAuth state consumption rejected.');
    }

    // 6. Session Binding Verification (HttpOnly Cookie Nonce Check)
    if (parsed.sbh && !allowBypassSessionBindingInTest) {
      if (!sessionBindingSecret) {
        throw new Error('SECURITY VIOLATION: Missing session binding cookie for OAuth state. Cross-session execution blocked.');
      }
      const incomingHash = crypto.createHash('sha256').update(sessionBindingSecret).digest('hex');
      const incomingBuf = Buffer.from(incomingHash, 'hex');
      const expectedSbhBuf = Buffer.from(parsed.sbh, 'hex');
      if (incomingBuf.length !== expectedSbhBuf.length || !crypto.timingSafeEqual(incomingBuf, expectedSbhBuf)) {
        throw new Error('SECURITY VIOLATION: OAuth session binding mismatch. Cross-browser execution blocked.');
      }
    }

    // 7. Database-Backed Atomic One-Time Consumption
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data: dbState, error: rpcErr } = await client.rpc('consume_oauth_state', {
          p_state_token: nonce,
          p_org_id: parsed.org,
          p_provider: expectedProvider,
        });

        if (rpcErr || !dbState) {
          throw new Error(`SECURITY VIOLATION: OAuth state already consumed or invalid (${rpcErr?.message || 'replayed'})`);
        }

        if (expectedRedirectUri && dbState.redirect_uri !== expectedRedirectUri) {
          throw new Error('SECURITY VIOLATION: Redirect URI mismatch between initiate and callback.');
        }

        return {
          stateToken: nonce,
          organizationId: dbState.organization_id,
          userId: dbState.user_id,
          provider: dbState.provider,
          redirectUri: dbState.redirect_uri,
          expiresAt: dbState.expires_at,
          consumedAt: dbState.consumed_at,
        };
      } catch (err: any) {
        if (err.message.includes('SECURITY VIOLATION')) throw err;
        // Fallback to memory in offline test sandbox
      }
    }

    // 8. Memory Registry Check & Consumption (for sandbox / unit tests)
    const memRecord = this.inMemoryStates.get(nonce);
    if (!memRecord) {
      throw new Error('SECURITY VIOLATION: Unknown or forged OAuth state token');
    }

    if (memRecord.consumedAt) {
      throw new Error('SECURITY VIOLATION: Replayed OAuth state (already consumed). Replay attack blocked.');
    }

    if (memRecord.organizationId !== parsed.org) {
      throw new Error('SECURITY VIOLATION: Organization mismatch between state and recorded tenant');
    }

    if (expectedRedirectUri && memRecord.redirectUri !== expectedRedirectUri) {
      throw new Error('SECURITY VIOLATION: Redirect URI mismatch between initiate and callback.');
    }

    // Mark as consumed
    memRecord.consumedAt = new Date().toISOString();
    this.inMemoryStates.set(nonce, memRecord);

    return memRecord;
  }

  static clearInMemory(): void {
    this.inMemoryStates.clear();
  }
}
