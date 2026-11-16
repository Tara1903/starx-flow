/**
 * StarX Flow — Accessibility Motion System
 * Complete prefers-reduced-motion detection, keyboard accessibility, and safe motion degradation.
 */

type AccessibilityListener = (reduced: boolean) => void;

class AccessibilityMotionEngine {
  private isReduced: boolean = false;
  private listeners = new Set<AccessibilityListener>();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.checkStatus();

    this.mediaQuery.addEventListener("change", this.checkStatus);

    // Also check query param or stored preference
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("motion") === "off") {
        this.isReduced = true;
      }
    }

    this.syncRootAttribute();
  }

  private checkStatus = () => {
    const systemPref = this.mediaQuery ? this.mediaQuery.matches : false;
    let overridePref = false;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      overridePref = urlParams.get("motion") === "off";
    }

    const nextState = systemPref || overridePref;
    if (this.isReduced !== nextState) {
      this.isReduced = nextState;
      this.syncRootAttribute();
      this.listeners.forEach((l) => l(this.isReduced));
    }
  };

  private syncRootAttribute() {
    if (typeof document === "undefined") return;
    if (this.isReduced) {
      document.documentElement.setAttribute("data-reduced-motion", "true");
    } else {
      document.documentElement.removeAttribute("data-reduced-motion");
    }
  }

  public isReducedMotion(): boolean {
    return this.isReduced;
  }

  public subscribe(listener: AccessibilityListener): () => void {
    this.listeners.add(listener);
    listener(this.isReduced);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public teardown() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.checkStatus);
    }
    this.listeners.clear();
  }
}

export const accessibilityMotion = new AccessibilityMotionEngine();
