/**
 * StarX Flow — Performance Manager
 * Adaptive GPU profiling, DPR scaling, 60-120 FPS frame monitoring, and will-change cleanup.
 */

import { PERFORMANCE_TIERS, PerformanceTier } from "./MotionConfig";

type TierChangeListener = (tier: PerformanceTier) => void;

class PerformanceManagerEngine {
  private currentTier: PerformanceTier = "HIGH";
  private listeners = new Set<TierChangeListener>();
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private isMonitoring = false;
  private monitorRafId: number | null = null;
  private isLowPower = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.detectInitialTier();
    }
  }

  private detectInitialTier() {
    const isMobile = window.innerWidth < 768;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    // Check device memory if available
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;

    if (hardwareConcurrency <= 2 || deviceMemory <= 2) {
      this.currentTier = "LOW";
    } else if (isMobile || hardwareConcurrency <= 4 || deviceMemory <= 4) {
      this.currentTier = "MEDIUM";
    } else {
      this.currentTier = "HIGH";
    }
  }

  public getTier(): PerformanceTier {
    return this.currentTier;
  }

  public getConfig() {
    return PERFORMANCE_TIERS[this.currentTier];
  }

  public subscribeTierChange(listener: TierChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.currentTier);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public startFPSMonitoring() {
    if (typeof window === "undefined" || this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameTimes = [];

    const checkFrame = (now: number) => {
      if (!this.isMonitoring) return;

      const delta = now - this.lastFrameTime;
      this.lastFrameTime = now;

      // Delta > 22ms means < 45 FPS
      this.frameTimes.push(delta);
      if (this.frameTimes.length > 30) {
        this.frameTimes.shift();

        // Calculate average FPS over last 30 frames
        const avgDelta = this.frameTimes.reduce((a, b) => a + b, 0) / 30;
        const currentFPS = 1000 / avgDelta;

        if (currentFPS < 40 && this.currentTier === "HIGH") {
          this.setTier("MEDIUM");
        } else if (currentFPS < 30 && this.currentTier === "MEDIUM") {
          this.setTier("LOW");
        }
      }

      this.monitorRafId = requestAnimationFrame(checkFrame);
    };

    this.monitorRafId = requestAnimationFrame(checkFrame);
  }

  public stopFPSMonitoring() {
    this.isMonitoring = false;
    if (this.monitorRafId !== null) {
      cancelAnimationFrame(this.monitorRafId);
      this.monitorRafId = null;
    }
  }

  private setTier(newTier: PerformanceTier) {
    if (this.currentTier === newTier) return;
    this.currentTier = newTier;
    this.listeners.forEach((listener) => listener(newTier));
  }

  /**
   * Safe will-change application with automatic cleanup after transition completes.
   */
  public applyWillChange(element: HTMLElement, properties: string, durationMs = 600) {
    element.style.willChange = properties;
    window.setTimeout(() => {
      if (element.isConnected) {
        element.style.willChange = "auto";
      }
    }, durationMs + 100);
  }
}

export const performanceManager = new PerformanceManagerEngine();
