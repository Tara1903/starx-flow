import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { syncAccessTokenCookie } from '@/lib/auth/clientCookie';

export async function getCrmAuthHeaders(extraHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (typeof window !== 'undefined' && isSupabaseConfigured) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token || (await syncAccessTokenCookie());
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Cookie auth fallback remains active on same-origin requests
    }
  }

  return headers;
}

export async function crmFetch<T = any>(
  url: string,
  options: RequestInit & { idempotencyKey?: string } = {}
): Promise<{ ok: boolean; status: number; data: T | null; error: string | null }> {
  const { idempotencyKey, headers: rawHeaders, ...rest } = options;
  const authHeaders = await getCrmAuthHeaders(
    rawHeaders && typeof rawHeaders === 'object' && !Array.isArray(rawHeaders)
      ? (rawHeaders as Record<string, string>)
      : undefined
  );
  if (idempotencyKey) {
    authHeaders['Idempotency-Key'] = idempotencyKey;
  }

  try {
    const res = await fetch(url, {
      ...rest,
      headers: authHeaders,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        json?.error?.message ||
        (typeof json?.error === 'string' ? json.error : null) ||
        `Request failed (${res.status})`;
      return { ok: false, status: res.status, data: null, error: message };
    }
    return { ok: true, status: res.status, data: json as T, error: null };
  } catch (err: any) {
    return { ok: false, status: 0, data: null, error: err?.message || 'Network request failed' };
  }
}
