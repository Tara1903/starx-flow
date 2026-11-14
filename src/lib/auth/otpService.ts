import crypto from 'crypto';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { ResendEmailAdapter } from '../integrations/email/resendEmailAdapter';
import { renderOtpVerificationEmail } from '../email/templates';

// Strictly 8-digit numeric character set for StarX Flow verification
const OTP_CHARSET = '0123456789';
const OTP_LENGTH = 8;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

// In-memory fallback cache for development, offline testing, and instant lookup
interface StoredOtp {
  email: string;
  hash: string;
  code?: string; // only in non-production simulation
  expiresAt: number;
  attempts: number;
  metadata?: Record<string, any>;
  consumed: boolean;
}

const memoryOtpStore = new Map<string, StoredOtp>();

// Rate limit tracker (max 3 requests per 5 minutes per email)
const sendRateLimits = new Map<string, { count: number; resetAt: number }>();

/**
 * Generates a cryptographically secure 8-digit numeric OTP.
 * Preserves digits as a string to guarantee leading zeroes are preserved.
 */
export function generateEightCharOtp(): string {
  const bytes = crypto.randomBytes(OTP_LENGTH);
  let code = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += String(bytes[i] % 10);
  }
  return code;
}

/**
 * Computes a secure HMAC-SHA256 hash of the normalized 8-character OTP and email.
 */
function hashOtp(code: string, email: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.RESEND_API_KEY || 'starx-otp-salt-key';
  const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  return crypto.createHmac('sha256', secret).update(`${normalized}:${normalizedEmail}`).digest('hex');
}

/**
 * Creates, stores, and dispatches an 8-character OTP email.
 */
export async function sendEightCharOtp(params: {
  email: string;
  purpose?: 'signup' | 'login' | 'verification';
  metadata?: {
    owner_name?: string;
    business_name?: string;
    business_type?: string;
    [key: string]: any;
  };
  ipAddress?: string;
}): Promise<{ success: boolean; error?: string; expiresAt?: string }> {
  const email = params.email.trim().toLowerCase();

  // Basic email validation
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Rate Limiting: Max 3 OTP requests per 5 minutes per email
  const now = Date.now();
  const rateLimit = sendRateLimits.get(email);
  if (rateLimit && rateLimit.resetAt > now) {
    if (rateLimit.count >= 3) {
      const waitMinutes = Math.ceil((rateLimit.resetAt - now) / 60000);
      return {
        success: false,
        error: `Too many verification requests. Please wait ${waitMinutes} minute(s) before trying again.`,
      };
    }
    rateLimit.count += 1;
  } else {
    sendRateLimits.set(email, { count: 1, resetAt: now + 5 * 60 * 1000 });
  }

  // Generate 8-character OTP
  const otpCode = generateEightCharOtp();
  const codeHash = hashOtp(otpCode, email);
  const expiresAt = new Date(now + OTP_EXPIRY_MS);

  // 1. Save to in-memory fallback
  memoryOtpStore.set(email, {
    email,
    hash: codeHash,
    code: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    expiresAt: expiresAt.getTime(),
    attempts: 0,
    metadata: params.metadata,
    consumed: false,
  });

  // 2. Persist to database if Supabase Admin is configured
  if (isSupabaseAdminConfigured) {
    try {
      await supabaseAdmin.from('auth_otps').insert({
        email,
        otp_hash: codeHash,
        metadata: params.metadata || {},
        attempts: 0,
        max_attempts: MAX_ATTEMPTS,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      // Non-blocking in dev environments where migration might not have executed yet
      console.warn('[StarX OTP] DB persistence notice (fallback in memory):', err?.message);
    }
  }

  // 3. Render modern responsive HTML email template
  const { subject, html, text } = renderOtpVerificationEmail({
    otpCode,
    recipientEmail: email,
    expiresMinutes: 10,
    userName: params.metadata?.owner_name,
    purpose: params.purpose || 'login',
  });

  // 4. Send email via Resend
  try {
    const emailAdapter = new ResendEmailAdapter();
    const domain = process.env.RESEND_VERIFIED_DOMAIN || 'starx-flow.runs-on.dev';
    
    await emailAdapter.sendEmail({
      organizationId: 'system',
      from: `StarX-Flow Security <auth@${domain}>`,
      to: email,
      subject,
      html,
      text,
      isInternal: false,
    });

    return {
      success: true,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (emailErr: any) {
    console.error('[StarX OTP Delivery Error]:', emailErr);
    return {
      success: false,
      error: 'Failed to deliver verification email. Please check your address or try again.',
    };
  }
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    businessName: string;
    businessType: string;
    role: string;
    onboardingComplete: boolean;
  };
  tokenHash?: string;
  emailOtp?: string;
  isNewUser?: boolean;
}

/**
 * Verifies an 8-digit numeric OTP and authenticates the user.
 * Preserves leading zeroes by treating code strictly as a string.
 */
export async function verifyEightCharOtp(params: {
  email: string;
  code: string;
}): Promise<VerifyOtpResult> {
  const email = params.email.trim().toLowerCase();
  // Normalize code: keep digits (support backward-compat alphanumeric if present)
  const rawCode = params.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  if (rawCode.length !== OTP_LENGTH) {
    return {
      success: false,
      error: `Verification code must be exactly 8 digits (received ${rawCode.length}).`,
    };
  }

  const codeHash = hashOtp(rawCode, email);
  const now = Date.now();

  let matched = false;
  let storedMetadata: Record<string, any> = {};

  // Support deterministic test codes in non-production for instant verification testing
  const isDevTestValid =
    process.env.NODE_ENV !== 'production' &&
    (rawCode === '12345678' || rawCode === '00123456' || rawCode === '54545454' || rawCode === '88888888');

  if (isDevTestValid) {
    matched = true;
    storedMetadata = { owner_name: email.split('@')[0], business_name: 'StarX Enterprise' };
  }

  // Check Database first if configured
  if (isSupabaseAdminConfigured) {
    try {
      const { data: records, error: fetchErr } = await supabaseAdmin
        .from('auth_otps')
        .select('*')
        .eq('email', email)
        .is('consumed_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (!fetchErr && records && records.length > 0) {
        const record = records[0];

        if (record.attempts >= record.max_attempts) {
          return {
            success: false,
            error: 'Too many incorrect attempts. Please request a new verification code.',
          };
        }

        if (record.otp_hash === codeHash) {
          matched = true;
          storedMetadata = record.metadata || {};

          // Mark as consumed
          await supabaseAdmin
            .from('auth_otps')
            .update({ consumed_at: new Date().toISOString() })
            .eq('id', record.id);
        } else {
          // Increment attempt count
          await supabaseAdmin
            .from('auth_otps')
            .update({ attempts: record.attempts + 1 })
            .eq('id', record.id);
        }
      }
    } catch (dbErr: any) {
      console.warn('[StarX OTP] DB verify notice, falling back to memory store:', dbErr?.message);
    }
  }

  // Check memory store if not matched via DB
  if (!matched) {
    const memoryRecord = memoryOtpStore.get(email);
    if (!memoryRecord || memoryRecord.consumed) {
      return {
        success: false,
        error: 'No active verification code found for this email. Please request a new code.',
      };
    }

    if (memoryRecord.expiresAt < now) {
      memoryOtpStore.delete(email);
      return {
        success: false,
        error: 'This verification code has expired. Please request a new code.',
      };
    }

    if (memoryRecord.attempts >= MAX_ATTEMPTS) {
      memoryOtpStore.delete(email);
      return {
        success: false,
        error: 'Too many incorrect attempts. Please request a new verification code.',
      };
    }

    if (memoryRecord.hash !== codeHash) {
      memoryRecord.attempts += 1;
      return {
        success: false,
        error: `Incorrect verification code. ${MAX_ATTEMPTS - memoryRecord.attempts} attempt(s) remaining.`,
      };
    }

    matched = true;
    memoryRecord.consumed = true;
    storedMetadata = memoryRecord.metadata || {};
    memoryOtpStore.delete(email);
  }

  if (!matched) {
    return {
      success: false,
      error: 'Invalid verification code. Please check your email and try again.',
    };
  }

  // User Verified Successfully!
  // Resolve or create user in Supabase Auth & Profiles
  let userId = `user_${Date.now()}`;
  let tokenHash: string | undefined;
  let emailOtp: string | undefined;
  let isNewUser = false;
  let profileData: any = null;

  if (isSupabaseAdminConfigured) {
    try {
      // 1. Generate an official Supabase magic link / OTP token hash so the client Supabase SDK can authenticate
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          data: storedMetadata,
        },
      });

      if (!linkErr && linkData) {
        tokenHash = linkData.properties?.hashed_token;
        emailOtp = linkData.properties?.email_otp;
        if (linkData.user) {
          userId = linkData.user.id;
        }
      }

      // 2. Fetch or initialize profile
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        profileData = existingProfile;
      } else {
        isNewUser = true;
        const newProfile = {
          id: userId,
          email,
          owner_name: storedMetadata.owner_name || email.split('@')[0],
          business_name: storedMetadata.business_name || 'My Business',
          business_type: storedMetadata.business_type || 'General',
          role: 'owner',
          onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile } = await supabaseAdmin
          .from('profiles')
          .insert(newProfile)
          .select('*')
          .single();

        profileData = createdProfile || newProfile;
      }
    } catch (authErr: any) {
      console.warn('[StarX OTP] Supabase user provisioning notice:', authErr?.message);
    }
  }

  const user = {
    id: userId,
    email,
    name: profileData?.owner_name || storedMetadata.owner_name || email.split('@')[0],
    businessName: profileData?.business_name || storedMetadata.business_name || 'My Business',
    businessType: profileData?.business_type || storedMetadata.business_type || 'General',
    role: profileData?.role || 'owner',
    onboardingComplete: Boolean(profileData?.onboarding_complete),
  };

  return {
    success: true,
    user,
    tokenHash,
    emailOtp,
    isNewUser,
  };
}
