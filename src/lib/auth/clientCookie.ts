import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * Syncs the active Supabase access token into a first-party SameSite=Lax cookie
 * so top-level browser navigations (such as OAuth start/callback routes) can
 * authenticate the user cleanly without exposing tokens in URL query parameters.
 */
export async function syncAccessTokenCookie(): Promise<string | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !isSupabaseConfigured) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || null;
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    if (token) {
      document.cookie = `sb-access-token=${encodeURIComponent(token)}; Path=/; Max-Age=3600; SameSite=Lax${secureFlag}`;
    }
    return token;
  } catch {
    return null;
  }
}

export function clearAccessTokenCookie(): void {
  if (typeof document === 'undefined') return;
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `sb-access-token=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
}
