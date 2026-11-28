import crypto from 'crypto';

/**
 * Computes Twilio's HMAC-SHA1 X-Twilio-Signature for form-encoded webhook validation.
 */
export function computeTwilioSignature(
  authToken: string,
  requestUrl: string,
  params: Record<string, string>
): string {
  const sortedKeys = Object.keys(params).sort();
  let data = requestUrl;
  for (const k of sortedKeys) {
    data += k + params[k];
  }
  return crypto.createHmac('sha1', authToken).update(data, 'utf-8').digest('base64');
}

/**
 * Constant-time verification of X-Twilio-Signature against the configured auth token.
 */
export function verifyTwilioSignature(
  authToken: string,
  requestUrl: string,
  params: Record<string, string>,
  receivedSignature: string
): boolean {
  const expectedSig = computeTwilioSignature(authToken, requestUrl, params);
  const expectedBuf = Buffer.from(expectedSig, 'utf-8');
  const receivedBuf = Buffer.from(receivedSignature.trim(), 'utf-8');
  return expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
