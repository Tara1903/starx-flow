/**
 * StarX Flow — Pointer Physics Engine
 * Zero-re-render pointer coordination, magnetic attraction, and gyroscopic tilt.
 * Operates purely via RAF and CSS custom properties; triggers zero React component re-renders.
 */

import { POINTER_CONFIG } from "./MotionConfig";

export interface PointerState {
  rawX: number;
  rawY: number;
  dampedX: number;
  dampedY: number;
  isActive: boolean;
}

export interface MagneticTarget {
  element: HTMLElement;
  strength?: number;
  maxDistance?: number;
}

class PointerPhysicsEngine {
  private state: PointerState = {
    rawX: -200,
    rawY: -200,
    dampedX: -200,
    dampedY: -200,
    isActive: false,
  };

  private magneticTargets = new Set<MagneticTarget>();
  private rafId: number | null = null;
  private isListening = false;
  private isReducedMotion = false;
  private lastUpdate = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }

  public init(): () => void {
    if (typeof window === "undefined" || this.isListening) {
      return () => {};
    }

    this.isListening = true;
    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", this.handlePointerLeave);
    window.addEventListener("blur", this.handlePointerLeave);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.startLoop();

    return () => this.teardown();
  }

  private handlePointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.state.rawX = e.clientX;
    this.state.rawY = e.clientY;
    this.state.isActive = true;
  };

  private handlePointerLeave = () => {
    this.state.isActive = false;
    this.resetCSSVariables();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.handlePointerLeave();
    }
  };

  private startLoop() {
    const loop = (timestamp: number) => {
      this.rafId = requestAnimationFrame(loop);

      if (!this.state.isActive) {
        return;
      }

      // Smooth damped interpolation
      const damp = POINTER_CONFIG.dampFactor;
      this.state.dampedX += (this.state.rawX - this.state.dampedX) * damp;
      this.state.dampedY += (this.state.rawY - this.state.dampedY) * damp;

      // Update CSS Variables at document root (Direct DOM mutation, 0 React re-renders)
      const docStyle = document.documentElement.style;
      docStyle.setProperty("--sx-spot-x", `${Math.round(this.state.dampedX)}px`);
      docStyle.setProperty("--sx-spot-y", `${Math.round(this.state.dampedY)}px`);
      docStyle.setProperty(
        "--sx-spot-opacity",
        this.state.isActive ? `${POINTER_CONFIG.spotlightOpacity}` : "0"
      );

      // Process magnetic targets if active
      if (!this.isReducedMotion && this.magneticTargets.size > 0) {
        this.updateMagneticTargets();
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private updateMagneticTargets() {
    this.magneticTargets.forEach((target) => {
      const { element, strength = 1, maxDistance = POINTER_CONFIG.magneticThreshold } = target;
      if (!element || !element.isConnected) {
        this.magneticTargets.delete(target);
        return;
      }

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = this.state.rawX - centerX;
      const distY = this.state.rawY - centerY;
      const distance = Math.hypot(distX, distY);

      if (distance < maxDistance && this.state.isActive) {
        const pull = (1 - distance / maxDistance) * POINTER_CONFIG.maxMagneticOffset * strength;
        const moveX = (distX / distance) * pull;
        const moveY = (distY / distance) * pull;
        element.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
      } else {
        if (element.style.transform && element.style.transform !== "") {
          element.style.transform = "";
        }
      }
    });
  }

  public registerMagnetic(element: HTMLElement, strength: number = 1, maxDistance: number = POINTER_CONFIG.magneticThreshold): () => void {
    const target: MagneticTarget = { element, strength, maxDistance };
    this.magneticTargets.add(target);

    return () => {
      this.magneticTargets.delete(target);
      if (element.isConnected) {
        element.style.transform = "";
      }
    };
  }

  public calculateCardTilt(rect: DOMRect, clientX: number, clientY: number): { rotateX: number; rotateY: number } {
    if (this.isReducedMotion) return { rotateX: 0, rotateY: 0 };

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalizedX = (clientX - centerX) / (rect.width / 2);
    const normalizedY = (clientY - centerY) / (rect.height / 2);

    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));

    const rotateY = clampedX * POINTER_CONFIG.maxTiltAngle;
    const rotateX = -clampedY * POINTER_CONFIG.maxTiltAngle;

    return { rotateX, rotateY };
  }

  private resetCSSVariables() {
    if (typeof document === "undefined") return;
    const docStyle = document.documentElement.style;
    docStyle.setProperty("--sx-spot-opacity", "0");
  }

  public teardown() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", this.handlePointerMove);
      window.removeEventListener("pointerleave", this.handlePointerLeave);
      window.removeEventListener("blur", this.handlePointerLeave);
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
    this.resetCSSVariables();
    this.magneticTargets.clear();
    this.isListening = false;
  }
}

export const pointerPhysics = new PointerPhysicsEngine();
