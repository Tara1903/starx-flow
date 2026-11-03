/**
 * StarX-Flow Server-Side Credential Encryption Engine
 * Enforces AES-256-GCM authenticated encryption for all external provider secrets at rest.
 * Prevents exposure of OAuth tokens, refresh tokens, and API keys.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  tag: string;
}

export class CredentialEncryption {
  /**
   * Derives a 256-bit encryption key from environment secret.
   * Uses SHA-256 derivation to guarantee exact 32-byte key length.
   * Strict Security Rule (M1): Production must fail closed if encryption key is missing.
   */
  static getKey(): Buffer {
    const secret =
      process.env.ENCRYPTION_KEY ||
      process.env.ENCRYPTION_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.JWT_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'CRITICAL SECURITY CONFIGURATION ERROR: Master ENCRYPTION_KEY or ENCRYPTION_SECRET_KEY must be set in production.'
        );
      }
      return crypto.createHash('sha256').update('starx-flow-dev-master-encryption-secret-key-32').digest();
    }

    return crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypts plaintext string or JSON object to serialized ciphertext string.
   * Format: enc:v1:<iv-hex>:<tag-hex>:<ciphertext-hex>
   */
  static encrypt(data: string | Record<string, any>): string {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    const key = this.getKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
    let ciphertext = cipher.update(text, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return `enc:v1:${iv.toString('hex')}:${tag}:${ciphertext}`;
  }

  /**
   * Decrypts serialized ciphertext string back to plaintext.
   */
  static decrypt<T = any>(encryptedString: string): T {
    if (!encryptedString) {
      throw new Error('Cannot decrypt empty string');
    }

    if (!encryptedString.startsWith('enc:v1:')) {
      // Legacy unencrypted plaintext fallback for migrations / tests
      try {
        return JSON.parse(encryptedString) as T;
      } catch {
        return encryptedString as unknown as T;
      }
    }

    const parts = encryptedString.split(':');
    if (parts.length !== 5) {
      throw new Error('Malformed encrypted payload format');
    }

    const iv = Buffer.from(parts[2], 'hex');
    const tag = Buffer.from(parts[3], 'hex');
    const ciphertext = parts[4];
    const key = this.getKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  }

  /**
   * Safe helper to decrypt without throwing (returns null on failure).
   */
  static tryDecrypt<T = any>(encryptedString?: string | null): T | null {
    if (!encryptedString) return null;
    try {
      return this.decrypt<T>(encryptedString);
    } catch {
      return null;
    }
  }
}
