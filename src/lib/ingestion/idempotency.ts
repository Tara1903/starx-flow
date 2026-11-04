/**
 * StarX-Flow Webhook Idempotency & Replay Defense
 * Prevents duplicate processing of incoming webhook events within a sliding time window.
 */

interface CacheEntry {
  key: string;
  processedAt: number;
  expiresAt: number;
}

export class IdempotencyManager {
  private static cache = new Map<string, CacheEntry>();
  private static defaultTtlMs = 15 * 60 * 1000; // 15 minutes window
  private static maxCacheSize = 10000;

  /**
   * Generates a deterministic idempotency key for an event.
   */
  static buildKey(channel: string, eventId?: string | null): string {
    const safeChannel = (channel || 'unknown').toLowerCase();
    const safeId = (eventId || '').trim();
    return `${safeChannel}:${safeId}`;
  }

  /**
   * Checks whether the event has already been recorded or is currently being processed.
   */
  static isDuplicate(channel: string, eventId: string): boolean {
    if (!eventId) return false;
    this.evictExpired();

    const key = this.buildKey(channel, eventId);
    const entry = this.cache.get(key);

    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Records an event as processed to prevent replay.
   */
  static markProcessed(channel: string, eventId: string, customTtlMs?: number): void {
    if (!eventId) return;

    // Guard against memory leaks
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest(1000);
    }

    const key = this.buildKey(channel, eventId);
    const now = Date.now();
    const ttl = customTtlMs || this.defaultTtlMs;

    this.cache.set(key, {
      key,
      processedAt: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Explicitly clear an event (useful for rollback on processing failure).
   */
  static clear(channel: string, eventId?: string | null): void {
    if (!eventId) return;
    const key = this.buildKey(channel, eventId);
    this.cache.delete(key);
  }

  /**
   * Removes expired entries from the cache.
   */
  private static evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Removes oldest entries if cache reaches maximum capacity.
   */
  private static evictOldest(count: number): void {
    const iterator = this.cache.keys();
    for (let i = 0; i < count; i++) {
      const next = iterator.next();
      if (next.done) break;
      this.cache.delete(next.value);
    }
  }

  /**
   * Returns current cache size (for telemetry and health monitoring).
   */
  static size(): number {
    return this.cache.size;
  }
}
