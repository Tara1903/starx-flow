'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { getActivePhysicsConfig, useCursorStore } from '../store/cursorStore';
import { resetCursorTelemetry, writeCursorTelemetry } from './cursorTelemetry';

export interface CursorPointerState {
  x: number;
  y: number;
  hasMoved: boolean;
}

interface CustomCursorProps {
  pointerRef: MutableRefObject<CursorPointerState>;
}

const MAX_FRAME_DELTA_SEC = 0.2;
const SUBSTEP_SEC = 1 / 120;
const SETTLE_EPSILON = 0.02;

/**
 * Dual-Layer Custom Cursor 2.0 renderer.
 * Layer 1 (dot): tracks physical mouse pointer immediately (0ms delay).
 * Layer 2 (ring): follows strictly the inner dot via damped spring solver.
 */
export function CustomCursor({ pointerRef }: CustomCursorProps) {
  const isFinePointer = useCursorStore((s) => s.isFinePointer);
  const isReducedMotion = useCursorStore((s) => s.isReducedMotion);
  const isRouteExcluded = useCursorStore((s) => s.isRouteExcluded);
  const isDocumentHidden = useCursorStore((s) => s.isDocumentHidden);
  const isVisible = useCursorStore((s) => s.isVisible);
  const isPressed = useCursorStore((s) => s.isPressed);
  const mode = useCursorStore((s) => s.mode);
  const label = useCursorStore((s) => s.label);
  const activeVariant = useCursorStore((s) => s.activeVariant);
  const isNativeFallback = useCursorStore((s) => s.isNativeFallback);
  const playgroundOverrides = useCursorStore((s) => s.playgroundOverrides);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const physicsRef = useRef({
    initialized: false,
    ringX: 0,
    ringY: 0,
    velX: 0,
    velY: 0,
    fpsEstimate: 60,
    lastFrameMs: 0,
  });

  const isActive = isFinePointer && !isRouteExcluded && !isDocumentHidden;

  // Compute responsive target diameter & visual glow from active physics config
  const config = getActivePhysicsConfig();
  const targetRingSize =
    mode === 'label'
      ? config.labelRingSize
      : mode === 'hover'
        ? config.hoverRingSize
        : mode === 'disabled'
          ? 38
          : config.defaultRingSize;

  const isClickableScale = isPressed && mode !== 'disabled' && !isNativeFallback;
  const ringScale = isClickableScale ? config.clickCompressionScale : 1;
  const dotScale = isClickableScale ? 0.85 : 1;

  // Store latest dynamic scale/reduction flags in a ref so the RAF loop never restarts on state ticks
  const runtimeStateRef = useRef({
    ringScale,
    dotScale,
    isReducedMotion,
    mode,
    label,
    activeVariant,
  });

  runtimeStateRef.current = {
    ringScale,
    dotScale,
    isReducedMotion,
    mode,
    label,
    activeVariant,
  };

  useEffect(() => {
    if (!isActive) {
      physicsRef.current.initialized = false;
      physicsRef.current.lastFrameMs = 0;
      resetCursorTelemetry();
      return;
    }

    let rafId = 0;

    const tick = (now: number) => {
      const state = physicsRef.current;
      const pointer = pointerRef.current;
      const liveConfig = getActivePhysicsConfig();
      const rt = runtimeStateRef.current;

      const rawDt = state.lastFrameMs > 0 ? (now - state.lastFrameMs) / 1000 : 1 / 60;
      state.lastFrameMs = now;
      const dt = Math.min(Math.max(rawDt, 0.001), MAX_FRAME_DELTA_SEC);
      const instantFps = dt > 0 ? Math.min(240, 1 / dt) : 60;
      state.fpsEstimate = state.fpsEstimate * 0.9 + instantFps * 0.1;

      if (pointer.hasMoved) {
        // Layer 1: Inner dot tracks physical mouse coordinates immediately (0ms delay)
        const dotX = pointer.x;
        const dotY = pointer.y;

        if (!state.initialized || rt.isReducedMotion) {
          state.ringX = dotX;
          state.ringY = dotY;
          state.velX = 0;
          state.velY = 0;
          state.initialized = true;
        } else {
          // Layer 2: Outer ring chases ONLY inner dot coordinates via frame-rate-independent spring
          let remaining = dt;
          const stiffness = Math.max(40, liveConfig.outerStiffness);
          const damping = Math.max(4, liveConfig.outerDamping);

          while (remaining > 0) {
            const step = Math.min(remaining, SUBSTEP_SEC);
            const dx = dotX - state.ringX;
            const dy = dotY - state.ringY;
            const ax = dx * stiffness - state.velX * damping;
            const ay = dy * stiffness - state.velY * damping;

            state.velX += ax * step;
            state.velY += ay * step;
            state.ringX += state.velX * step;
            state.ringY += state.velY * step;
            remaining -= step;
          }

          const residualDist = Math.hypot(dotX - state.ringX, dotY - state.ringY);
          const residualSpeed = Math.hypot(state.velX, state.velY);
          if (residualDist < SETTLE_EPSILON && residualSpeed < SETTLE_EPSILON) {
            state.ringX = dotX;
            state.ringY = dotY;
            state.velX = 0;
            state.velY = 0;
          }
        }

        const dotEl = dotRef.current;
        if (dotEl) {
          dotEl.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(${rt.dotScale})`;
        }

        const ringEl = ringRef.current;
        if (ringEl) {
          ringEl.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0) translate(-50%, -50%) scale(${rt.ringScale})`;
        }

        writeCursorTelemetry({
          dotX,
          dotY,
          ringX: state.ringX,
          ringY: state.ringY,
          ringVelocityX: state.velX,
          ringVelocityY: state.velY,
          lagDistancePx: Math.hypot(dotX - state.ringX, dotY - state.ringY),
          mode: rt.mode,
          label: rt.label,
          activeVariant: rt.activeVariant,
          fpsEstimate: Math.round(state.fpsEstimate),
        });
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isActive, pointerRef]);

  if (!isActive) {
    return null;
  }

  const effectiveMode = isPressed && mode !== 'disabled' && !isNativeFallback ? 'click' : mode;
  const glowScalar = Math.max(0, Math.min(2, config.glowIntensity));
  const ringShadow =
    activeVariant === 'danger'
      ? `0 0 ${Math.round(22 * glowScalar)}px rgba(248, 113, 113, ${0.38 * glowScalar})`
      : mode === 'disabled'
        ? 'none'
        : mode === 'hover' || mode === 'label'
          ? `0 0 ${Math.round(26 * glowScalar)}px rgba(52, 211, 153, ${0.42 * glowScalar}), inset 0 0 14px rgba(16, 185, 129, 0.14)`
          : `0 0 ${Math.round(18 * glowScalar)}px rgba(16, 185, 129, ${0.24 * glowScalar}), inset 0 0 10px rgba(16, 185, 129, 0.08)`;

  return (
    <div
      className="starx-cursor-layer"
      aria-hidden="true"
      data-testid="starx-cursor-layer"
      data-visible={isVisible && !isNativeFallback ? 'true' : 'false'}
      data-native={isNativeFallback ? 'true' : 'false'}
      data-mode={effectiveMode}
      data-has-overrides={Object.keys(playgroundOverrides).length > 0 ? 'true' : 'false'}
    >
      <div
        ref={ringRef}
        data-testid="starx-cursor-ring"
        className="starx-cursor-ring"
        data-mode={effectiveMode}
        data-pressed={isPressed ? 'true' : 'false'}
        data-variant={activeVariant ?? undefined}
        style={{
          width: `${targetRingSize}px`,
          height: `${targetRingSize}px`,
          boxShadow: glowScalar !== 1 || activeVariant ? ringShadow : undefined,
        }}
      >
        {label ? <span className="starx-cursor-label-text">{label}</span> : null}
      </div>
      <div
        ref={dotRef}
        data-testid="starx-cursor-dot"
        className="starx-cursor-dot"
        data-mode={effectiveMode}
        data-variant={activeVariant ?? undefined}
        style={{
          width: `${config.dotSize}px`,
          height: `${config.dotSize}px`,
        }}
      />
    </div>
  );
}
