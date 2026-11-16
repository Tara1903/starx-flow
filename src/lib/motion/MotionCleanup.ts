/**
 * StarX Flow — Motion Cleanup Coordinator
 * Central teardown registry for event listeners, observers, timers, and WebGL allocations.
 */

type TeardownFn = () => void;

class MotionCleanupRegistry {
  private cleanups = new Set<TeardownFn>();

  public register(fn: TeardownFn): () => void {
    this.cleanups.add(fn);
    return () => {
      this.cleanups.delete(fn);
    };
  }

  public flush() {
    this.cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (err) {
        console.error("StarX Motion: Cleanup error:", err);
      }
    });
    this.cleanups.clear();
  }
}

export const motionCleanup = new MotionCleanupRegistry();
