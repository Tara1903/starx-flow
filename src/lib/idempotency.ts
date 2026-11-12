/**
 * Idempotency helper shared by client retry queues and API mutation handlers
 * so transient timeouts or double-submissions never create duplicate records.
 */

export function createIdempotencyKey(prefix = "req"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function extractIdempotencyKey(req: Request, body?: Record<string, unknown>): string | null {
  const headerVal =
    req.headers.get("idempotency-key") || req.headers.get("Idempotency-Key");
  const bodyVal =
    body && typeof body.idempotencyKey === "string" ? body.idempotencyKey : null;
  const candidate = (headerVal || bodyVal || "").trim();
  if (!candidate || candidate.length > 128) return null;
  return candidate;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const MEMORY_TTL_MS = 10 * 60 * 1000;
const serverIdempotencyStore = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of serverIdempotencyStore.entries()) {
    if (entry.expiresAt <= now) {
      serverIdempotencyStore.delete(key);
    }
  }
}

/**
 * Ensures concurrent or retried calls with the same scoped key execute `work`
 * at most once within the retention window and return the exact same result.
 */
export async function runWithIdempotency<T>(
  scopedKey: string | null,
  work: () => Promise<T>
): Promise<{ result: T; deduplicated: boolean }> {
  if (!scopedKey) {
    return { result: await work(), deduplicated: false };
  }

  pruneExpired();
  const cached = serverIdempotencyStore.get(scopedKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { result: cached.value as T, deduplicated: true };
  }

  const active = inFlightRequests.get(scopedKey);
  if (active) {
    const result = (await active) as T;
    return { result, deduplicated: true };
  }

  const promise = work()
    .then((res) => {
      serverIdempotencyStore.set(scopedKey, {
        value: res,
        expiresAt: Date.now() + MEMORY_TTL_MS,
      });
      return res;
    })
    .finally(() => {
      inFlightRequests.delete(scopedKey);
    });

  inFlightRequests.set(scopedKey, promise);
  return { result: await promise, deduplicated: false };
}
