/**
 * StarX OS — Consent Management Service
 * Manages cookie/analytics consent state via localStorage.
 * Analytics events are silently dropped when consent is not granted.
 */

export interface ConsentState {
  essential: true; // always true — required for service
  analytics: boolean;
  timestamp: string;
  version: string;
}

const CONSENT_KEY = 'starx_consent';
const CONSENT_VERSION = '1.0';

/** Get current consent state. Returns null if user has not responded yet. */
export function getConsent(): ConsentState | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const parsed: ConsentState = JSON.parse(stored);

    // Re-prompt if consent version has changed
    if (parsed.version !== CONSENT_VERSION) return null;

    return parsed;
  } catch {
    return null;
  }
}

/** Set consent preferences. */
export function setConsent(analytics: boolean): void {
  const state: ConsentState = {
    essential: true,
    analytics,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — consent defaults to denied
  }
}

/** Check if analytics consent has been granted. */
export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.analytics === true;
}

/** Revoke all non-essential consent. */
export function revokeConsent(): void {
  setConsent(false);
}

/** Check if consent banner needs to be shown. */
export function needsConsentPrompt(): boolean {
  return getConsent() === null;
}
