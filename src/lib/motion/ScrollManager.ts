/**
 * StarX Flow — Scroll Manager
 * High-performance normalized scroll tracking, section progress, direction, and velocity.
 * Writes `--sx-scroll-progress` directly to CSS; notifies registered subscribers via callback.
 */

export type ScrollDirection = "down" | "up" | "idle";

export interface ScrollState {
  scrollY: number;
  maxScroll: number;
  progress: number; // 0 to 1
  direction: ScrollDirection;
  velocity: number; // px per ms
}

export type ScrollSubscriber = (state: ScrollState) => void;

class ScrollManagerEngine {
  private state: ScrollState = {
    scrollY: 0,
    maxScroll: 1,
    progress: 0,
    direction: "idle",
    velocity: 0,
  };

  private subscribers = new Set<ScrollSubscriber>();
  private sectionElements = new Map<string, HTMLElement>();
  private rafId: number | null = null;
  private isListening = false;
  private lastScrollY = 0;
  private lastTime = 0;

  public init(): () => void {
    if (typeof window === "undefined" || this.isListening) {
      return () => {};
    }

    this.isListening = true;
    this.lastScrollY = window.scrollY;
    this.lastTime = performance.now();

    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });

    // Initial measure
    this.updateScrollMetrics();

    return () => this.teardown();
  }

  private onScroll = () => {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.handleScrollRAF);
    }
  };

  private onResize = () => {
    this.updateScrollMetrics();
  };

  private handleScrollRAF = () => {
    this.rafId = null;
    this.updateScrollMetrics();
  };

  private updateScrollMetrics() {
    if (typeof window === "undefined") return;

    const currentY = window.scrollY;
    const now = performance.now();
    const dt = Math.max(1, now - this.lastTime);
    const dy = currentY - this.lastScrollY;

    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const progress = Math.min(1, Math.max(0, currentY / maxScroll));

    let direction: ScrollDirection = "idle";
    if (Math.abs(dy) > 0.5) {
      direction = dy > 0 ? "down" : "up";
    }

    const velocity = Math.abs(dy) / dt;

    this.state = {
      scrollY: currentY,
      maxScroll,
      progress,
      direction,
      velocity,
    };

    this.lastScrollY = currentY;
    this.lastTime = now;

    // Update CSS custom property for zero-re-render scroll animations
    document.documentElement.style.setProperty(
      "--sx-scroll-progress",
      progress.toFixed(4)
    );

    // Notify registered subscribers
    this.subscribers.forEach((sub) => sub(this.state));
  }

  public subscribe(callback: ScrollSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.state); // Immediate initial sync

    return () => {
      this.subscribers.delete(callback);
    };
  }

  public registerSection(id: string, element: HTMLElement) {
    this.sectionElements.set(id, element);
  }

  public unregisterSection(id: string) {
    this.sectionElements.delete(id);
  }

  public getSectionProgress(id: string): number {
    const el = this.sectionElements.get(id);
    if (!el || typeof window === "undefined") return 0;

    const rect = el.getBoundingClientRect();
    const windowH = window.innerHeight;

    // 0 when section enters bottom of viewport, 1 when section top leaves top of viewport
    const totalDist = windowH + rect.height;
    const currentDist = windowH - rect.top;

    return Math.min(1, Math.max(0, currentDist / totalDist));
  }

  public getState(): ScrollState {
    return this.state;
  }

  public teardown() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.onScroll);
      window.removeEventListener("resize", this.onResize);
    }
    this.subscribers.clear();
    this.sectionElements.clear();
    this.isListening = false;
  }
}

export const scrollManager = new ScrollManagerEngine();
