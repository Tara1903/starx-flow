'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { getActivePhysicsConfig, useCursorStore } from '../store/cursorStore';
import { resetCursorTelemetry, writeCursorTelemetry } from './cursorTelemetry';

export interface CursorPointerState {
  x: number;
  y: number;
  hasMoved: boolean;
  wake?: () => void;
  onRingFrame?: (ringX: number, ringY: number) => void;
}

interface CustomCursorProps {
  pointerRef: MutableRefObject<CursorPointerState>;
}

const MAX_FRAME_DELTA_SEC = 0.2;
const SUBSTEP_SEC = 1 / 240;
const SETTLE_EPSILON = 0.05;

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
          ? Math.max(40, config.defaultRingSize)
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
      pointerRef.current.wake = undefined;
      resetCursorTelemetry();
      return;
    }

    let rafId = 0;
    let isRunning = false;
    let lastDotTransform = '';
    let lastRingTransform = '';
    let lastReportedRingX = Number.NaN;
    let lastReportedRingY = Number.NaN;
    let settledTelemetrySent = false;

    const scheduleTick = () => {
      if (isRunning) return;
      isRunning = true;
      // Reset frame delta timestamp on wake from dormant state so the first step uses 1/60s cleanly
      physicsRef.current.lastFrameMs = 0;
      settledTelemetrySent = false;
      rafId = window.requestAnimationFrame(tick);
    };

    pointerRef.current.wake = scheduleTick;

    const tick = (now: number) => {
      isRunning = false;
      const state = physicsRef.current;
      const pointer = pointerRef.current;
      const rt = runtimeStateRef.current;

      const rawDt = state.lastFrameMs > 0 ? (now - state.lastFrameMs) / 1000 : 1 / 60;
      state.lastFrameMs = now;
      const dt = Math.min(Math.max(rawDt, 0.001), MAX_FRAME_DELTA_SEC);
      const instantFps = dt > 0 ? Math.min(240, 1 / dt) : 60;
      state.fpsEstimate = state.fpsEstimate * 0.9 + instantFps * 0.1;

      if (!pointer.hasMoved) {
        return;
      }

      const liveConfig = getActivePhysicsConfig();
      // Layer 1: Inner dot tracks physical mouse coordinates immediately (0ms delay)
      const dotX = pointer.x;
      const dotY = pointer.y;

      const responsiveness = Math.max(
        0.15,
        Math.min(2.0, liveConfig.followResponsiveness ?? 0.72),
      );

      let settled = false;
      if (!state.initialized || rt.isReducedMotion) {
        state.ringX = dotX;
        state.ringY = dotY;
        state.velX = 0;
        state.velY = 0;
        state.initialized = true;
        settled = true;
      } else {
        // Layer 2: Outer ring chases ONLY inner dot coordinates via frame-rate-independent
        // damped spring with responsiveness scaling & progressive soft separation tether.
        let remaining = dt * responsiveness;
        const stiffness = Math.max(30, liveConfig.outerStiffness);
        const damping = Math.max(4, liveConfig.outerDamping);
        const maxSep = Math.max(16, liveConfig.maxSeparationPx ?? 56);
        const softStart = maxSep * 0.65;
        const softBand = Math.max(8, maxSep - softStart);

        while (remaining > 0) {
          const step = Math.min(remaining, SUBSTEP_SEC);
          const dx = dotX - state.ringX;
          const dy = dotY - state.ringY;
          const dist = Math.hypot(dx, dy);

          let kMult = 1;
          if (dist > softStart) {
            const excessRatio = (dist - softStart) / softBand;
            kMult = Math.min(4.5, 1 + 2.5 * excessRatio * excessRatio);
          }
          const cMult = Math.sqrt(kMult);

          const ax = dx * (stiffness * kMult) - state.velX * (damping * cMult);
          const ay = dy * (stiffness * kMult) - state.velY * (damping * cMult);

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
          settled = true;
        }
      }

      const nextDotTransform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(${rt.dotScale})`;
      const dotEl = dotRef.current;
      if (dotEl && nextDotTransform !== lastDotTransform) {
        dotEl.style.transform = nextDotTransform;
        lastDotTransform = nextDotTransform;
      }

      const rx = settled ? dotX : Math.round(state.ringX * 100) / 100;
      const ry = settled ? dotY : Math.round(state.ringY * 100) / 100;
      const nextRingTransform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${rt.ringScale})`;
      const ringEl = ringRef.current;
      if (ringEl && nextRingTransform !== lastRingTransform) {
        ringEl.style.transform = nextRingTransform;
        lastRingTransform = nextRingTransform;
      }

      if (rx !== lastReportedRingX || ry !== lastReportedRingY) {
        lastReportedRingX = rx;
        lastReportedRingY = ry;
        pointer.onRingFrame?.(rx, ry);
      }

      if (!settled || !settledTelemetrySent) {
        writeCursorTelemetry({
          dotX,
          dotY,
          ringX: state.ringX,
          ringY: state.ringY,
          ringVelocityX: state.velX * responsiveness,
          ringVelocityY: state.velY * responsiveness,
          lagDistancePx: settled ? 0 : Math.hypot(dotX - state.ringX, dotY - state.ringY),
          mode: rt.mode,
          label: rt.label,
          activeVariant: rt.activeVariant,
          fpsEstimate: Math.round(state.fpsEstimate),
        });
        if (settled) {
          settledTelemetrySent = true;
        }
      }

      if (!settled) {
        isRunning = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    if (pointerRef.current.hasMoved) {
      scheduleTick();
    }

    return () => {
      pointerRef.current.wake = undefined;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      isRunning = false;
    };
  }, [isActive, pointerRef]);

  useEffect(() => {
    if (isActive && pointerRef.current.hasMoved) {
      pointerRef.current.wake?.();
    }
  }, [
    isActive,
    pointerRef,
    isVisible,
    isPressed,
    mode,
    label,
    activeVariant,
    isNativeFallback,
    isReducedMotion,
    playgroundOverrides,
  ]);

  if (!isActive) {
    return null;
  }

  const effectiveMode = isPressed && mode !== 'disabled' && !isNativeFallback ? 'click' : mode;
  const glowScalar = Math.max(0, Math.min(2, config.glowIntensity));
  const ringShadow =
    activeVariant === 'danger'
      ? `0 0 ${Math.round(16 * glowScalar)}px rgba(248, 113, 113, ${0.20 * glowScalar})`
      : mode === 'disabled'
        ? 'none'
        : mode === 'hover' || mode === 'label'
          ? `0 0 ${Math.round(16 * glowScalar)}px rgba(16, 185, 129, ${0.18 * glowScalar})`
          : `0 0 ${Math.round(12 * glowScalar)}px rgba(16, 185, 129, ${0.14 * glowScalar})`;

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
