/**
 * Scrubs sensitive tokens, credentials, URLs, and raw SQL/stack traces
 * from error messages before they can appear in UI alerts, ErrorState,
 * toasts, or browser console warnings.
 */
const SECRET_PATTERNS: RegExp[] = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g,
  /\b(sk|pk|rk|whsec|re|polar|sb|sbp)_[A-Za-z0-9_-]{8,}\b/gi,
  /https?:\/\/[a-z0-9-]+\.supabase\.(co|in)[^\s"']*/gi,
  /postgres(ql)?:\/\/[^\s"']+/gi,
];

export function sanitizeClientError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const raw =
    typeof err === "string"
      ? err
      : err instanceof Error
      ? err.message
      : typeof (err as { error?: unknown })?.error === "string"
      ? String((err as { error: string }).error)
      : "";

  if (!raw || !raw.trim()) return fallback;

  let clean = raw.trim();
  for (const pattern of SECRET_PATTERNS) {
    clean = clean.replace(pattern, "[redacted]");
  }

  // Collapse raw stack frames or internal DB relation dumps
  if (
    /\bat\s+[\w.$]+\s*\(|relation\s+"[^"]+"\s+does not exist|duplicate key value violates/i.test(
      clean
    )
  ) {
    return fallback;
  }

  if (clean.length > 220) {
    clean = `${clean.slice(0, 217)}...`;
  }

  return clean;
}
