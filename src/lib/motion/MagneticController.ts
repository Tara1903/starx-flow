/**
 * StarX Flow — Magnetic Controller
 * React hook and imperative binder for magnetic CTA buttons.
 */

"use client";

import { useEffect, useRef } from "react";
import { pointerPhysics } from "./PointerPhysics";
import { accessibilityMotion } from "./AccessibilityMotion";

export interface UseMagneticOptions {
  strength?: number;
  maxDistance?: number;
  disabled?: boolean;
}

export function useMagneticButton<T extends HTMLElement = HTMLButtonElement>(
  options: UseMagneticOptions = {}
) {
  const ref = useRef<T | null>(null);
  const { strength = 1, maxDistance = 65, disabled = false } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled || accessibilityMotion.isReducedMotion()) {
      return;
    }

    const unregister = pointerPhysics.registerMagnetic(el, strength, maxDistance);
    return () => {
      unregister();
    };
  }, [strength, maxDistance, disabled]);

  return ref;
}
