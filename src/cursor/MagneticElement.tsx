'use client';

import React, { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../lib/utils';
import { getActivePhysicsConfig, useCursorStore } from '../store/cursorStore';
import { DEFAULT_CURSOR_PHYSICS, MAGNETIC_STRENGTH_PRESETS } from './cursor.config';
import type { MagneticStrengthLevel } from './cursorTypes';

interface UseMagneticPullOptions {
  enabled?: boolean;
  strength?: MagneticStrengthLevel;
  disabled?: boolean;
}

let sharedRectEpoch = 0;
let sharedListenersBound = false;
function ensureSharedRectInvalidation() {
  if (sharedListenersBound || typeof window === 'undefined') return;
  sharedListenersBound = true;
  const bump = () => {
    sharedRectEpoch += 1;
  };
  window.addEventListener('scroll', bump, { passive: true, capture: true });
  window.addEventListener('resize', bump, { passive: true });
  window.visualViewport?.addEventListener('resize', bump);
}

/**
 * Bounded pointer-attraction spring applied via CSS `translate` (independent of
 * Framer Motion `transform`) that stops its RAF loop cleanly once settled.
 */
export function useMagneticPull<T extends HTMLElement>(
  elementRef: React.RefObject<T | null>,
  { enabled = false, strength = 'medium', disabled = false }: UseMagneticPullOptions,
) {
  const isFinePointer = useCursorStore((s) => s.isFinePointer);
  const isReducedMotion = useCursorStore((s) => s.isReducedMotion);
  const isRouteExcluded = useCursorStore((s) => s.isRouteExcluded);
  const isDocumentHidden = useCursorStore((s) => s.isDocumentHidden);

  const canPull =
    enabled &&
    !disabled &&
    strength !== 'none' &&
    isFinePointer &&
    !isReducedMotion &&
    !isRouteExcluded &&
    !isDocumentHidden;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (!canPull) {
      el.style.translate = '';
      return;
    }

    ensureSharedRectInvalidation();
    let targetX = 0;
    let targetY = 0;
    let currX = 0;
    let currY = 0;
    let rafId = 0;
    let lastMs = 0;
    let cachedCenterX = 0;
    let cachedCenterY = 0;
    let cachedEpoch = -1;
    let pendingPointerX = 0;
    let pendingPointerY = 0;
    let pointerDirty = false;
    let isHovered = false;

    const step = (now: number) => {
      if (isHovered && pointerDirty) {
        pointerDirty = false;
        if (cachedEpoch !== sharedRectEpoch) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            cachedCenterX = rect.left - currX + rect.width / 2;
            cachedCenterY = rect.top - currY + rect.height / 2;
            cachedEpoch = sharedRectEpoch;
          }
        }
        if (cachedEpoch === sharedRectEpoch) {
          const preset = MAGNETIC_STRENGTH_PRESETS[strength];
          const liveCfg = getActivePhysicsConfig();
          const baseStrength = Math.max(0.01, DEFAULT_CURSOR_PHYSICS.magneticStrength);
          const scalar = Math.max(0, liveCfg.magneticStrength / baseStrength);
          const maxDisp = preset.maxDisplacementPx * scalar;
          const factor = preset.factor * scalar;

          const dx = pendingPointerX - cachedCenterX;
          const dy = pendingPointerY - cachedCenterY;
          targetX = Math.max(-maxDisp, Math.min(maxDisp, dx * factor));
          targetY = Math.max(-maxDisp, Math.min(maxDisp, dy * factor));
        }
      }

      const dt = lastMs > 0 ? Math.min(0.15, Math.max(0.001, (now - lastMs) / 1000)) : 1 / 60;
      lastMs = now;
      const alpha = 1 - Math.exp(-18 * dt);

      currX += (targetX - currX) * alpha;
      currY += (targetY - currY) * alpha;

      if (Math.abs(targetX - currX) < 0.08 && Math.abs(targetY - currY) < 0.08) {
        currX = targetX;
        currY = targetY;
      }

      if (currX === 0 && currY === 0) {
        el.style.translate = '';
      } else {
        el.style.translate = `${currX.toFixed(2)}px ${currY.toFixed(2)}px`;
      }

      if (pointerDirty || currX !== targetX || currY !== targetY) {
        rafId = window.requestAnimationFrame(step);
      } else {
        rafId = 0;
        lastMs = 0;
      }
    };

    const ensureLoop = () => {
      if (!rafId) {
        lastMs = 0;
        rafId = window.requestAnimationFrame(step);
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isHovered = true;
      cachedEpoch = -1;
      pendingPointerX = e.clientX;
      pendingPointerY = e.clientY;
      pointerDirty = true;
      ensureLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isHovered = true;
      pendingPointerX = e.clientX;
      pendingPointerY = e.clientY;
      pointerDirty = true;
      ensureLoop();
    };

    const onPointerLeave = () => {
      isHovered = false;
      pointerDirty = false;
      cachedEpoch = -1;
      targetX = 0;
      targetY = 0;
      if (currX !== 0 || currY !== 0) {
        ensureLoop();
      }
    };

    el.addEventListener('pointerenter', onPointerEnter, { passive: true });
    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      el.removeEventListener('pointerenter', onPointerEnter);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
      el.style.translate = '';
    };
  }, [elementRef, canPull, strength]);
}

export interface MagneticElementProps {
  children: ReactNode;
  strength?: MagneticStrengthLevel;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable bounded magnetic wrapper for high-priority CTAs, icons, and badges.
 */
export function MagneticElement({
  children,
  strength = 'medium',
  disabled = false,
  className,
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useMagneticPull(ref, {
    enabled: !disabled && strength !== 'none',
    strength,
    disabled,
  });

  return (
    <div
      ref={ref}
      data-cursor-magnetic={disabled ? 'none' : strength}
      className={cn('inline-flex', className)}
    >
      {children}
    </div>
  );
}
