'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { getActivePhysicsConfig, useCursorStore } from '../store/cursorStore';
import {
  CURSOR_EXCLUDED_ROUTE_PREFIXES,
  DISABLED_CURSOR_SELECTOR,
  NATIVE_CURSOR_SELECTOR,
} from './cursor.config';
import type { CursorButtonVariant, CursorMode } from './cursorTypes';
import { CustomCursor, type CursorPointerState } from './CustomCursor';

interface CursorProviderProps {
  children?: ReactNode;
}

const INTERACTIVE_CURSOR_SELECTOR = [
  '[data-cursor-invert]',
  '[data-cursor-hover="true"]',
  'button',
  'a[href]',
  '[role="button"]',
  'summary',
  'label[for]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="range"]',
].join(', ');

const VALID_VARIANTS = new Set<CursorButtonVariant>([
  'primary',
  'secondary',
  'outline',
  'white',
  'ghost',
  'focus',
  'danger',
]);

const VALID_MODES = new Set<CursorMode>([
  'default',
  'hover',
  'click',
  'label',
  'disabled',
  'native',
]);

interface ResolvedTarget {
  element: Element | null;
  mode: CursorMode;
  label: string | null;
  activeVariant: CursorButtonVariant | null;
  isNativeFallback: boolean;
}

function parseVariant(raw: string | null): CursorButtonVariant | null {
  if (!raw) return null;
  return VALID_VARIANTS.has(raw as CursorButtonVariant)
    ? (raw as CursorButtonVariant)
    : null;
}

function parseMode(raw: string | null): CursorMode | null {
  if (!raw) return null;
  return VALID_MODES.has(raw as CursorMode) ? (raw as CursorMode) : null;
}

function resolveCursorTarget(rawTarget: EventTarget | null): ResolvedTarget {
  const el =
    rawTarget instanceof Element
      ? rawTarget
      : rawTarget instanceof Node
        ? rawTarget.parentElement
        : null;

  if (!el) {
    return {
      element: null,
      mode: 'default',
      label: null,
      activeVariant: null,
      isNativeFallback: false,
    };
  }

  // 1. Native cursor zones (text/OTP inputs, textareas, selects, iframes, explicit native opt-out)
  const nativeEl = el.closest(NATIVE_CURSOR_SELECTOR);
  if (nativeEl) {
    return {
      element: nativeEl,
      mode: 'native',
      label: null,
      activeVariant: null,
      isNativeFallback: true,
    };
  }

  // 2. Disabled interactive elements
  const disabledEl = el.closest(DISABLED_CURSOR_SELECTOR);
  if (disabledEl) {
    return {
      element: disabledEl,
      mode: 'disabled',
      label: null,
      activeVariant: null,
      isNativeFallback: false,
    };
  }

  // 3. Explicit cursor mode declarations
  const explicitModeEl = el.closest('[data-cursor-mode]');
  if (explicitModeEl) {
    const parsedMode = parseMode(explicitModeEl.getAttribute('data-cursor-mode')) ?? 'default';
    const rawLabel = explicitModeEl.getAttribute('data-cursor-label')?.trim() || null;
    const variant = parseVariant(explicitModeEl.getAttribute('data-cursor-invert'));
    if (parsedMode === 'native') {
      return {
        element: explicitModeEl,
        mode: 'native',
        label: null,
        activeVariant: null,
        isNativeFallback: true,
      };
    }
    return {
      element: explicitModeEl,
      mode: rawLabel && parsedMode === 'hover' ? 'label' : parsedMode,
      label: rawLabel,
      activeVariant: variant,
      isNativeFallback: false,
    };
  }

  // 4. Contextual label zones (VIEW, OPEN, DRAG, PLAY, EXPLORE)
  const labelEl = el.closest('[data-cursor-label]');
  if (labelEl) {
    const text = labelEl.getAttribute('data-cursor-label')?.trim() || null;
    if (text) {
      return {
        element: labelEl,
        mode: 'label',
        label: text,
        activeVariant: parseVariant(labelEl.getAttribute('data-cursor-invert')),
        isNativeFallback: false,
      };
    }
  }

  // 5. Standard interactive controls & inversion surfaces
  const interactiveEl = el.closest(INTERACTIVE_CURSOR_SELECTOR);
  const optOutEl = el.closest('[data-cursor-hover="false"]');

  if (interactiveEl) {
    const suppressedByOptOut =
      optOutEl !== null &&
      (optOutEl === interactiveEl ||
        (interactiveEl.contains(optOutEl) && !optOutEl.contains(interactiveEl)));

    if (!suppressedByOptOut) {
      return {
        element: interactiveEl,
        mode: 'hover',
        label: null,
        activeVariant: parseVariant(interactiveEl.getAttribute('data-cursor-invert')),
        isNativeFallback: false,
      };
    }
  }

  return {
    element: null,
    mode: 'default',
    label: null,
    activeVariant: null,
    isNativeFallback: false,
  };
}

/**
 * Authoritative Cursor 2.0 host mounted once in ClientShell.
 * Manages environment capabilities, pointer/hover/press tracking via passive
 * listeners, route exclusions, surface spotlights, and CustomCursor.
 */
export function CursorProvider({ children }: CursorProviderProps) {
  const pathname = usePathname() ?? '/';

  const pointerRef = useRef<CursorPointerState>({
    x: 0,
    y: 0,
    hasMoved: false,
  });

  const lastSignatureRef = useRef<string>('default||null|false');
  const lastTargetElRef = useRef<Element | null>(null);
  const activeSpotlightRef = useRef<HTMLElement | null>(null);
  const lastTouchSeenRef = useRef<boolean>(false);

  const isFinePointer = useCursorStore((s) => s.isFinePointer);
  const isRouteExcluded = useCursorStore((s) => s.isRouteExcluded);
  const isDocumentHidden = useCursorStore((s) => s.isDocumentHidden);
  const isVisible = useCursorStore((s) => s.isVisible);
  const isNativeFallback = useCursorStore((s) => s.isNativeFallback);

  // Sync route exclusions & clear stale hover/playground overrides on navigation
  useEffect(() => {
    const excluded = CURSOR_EXCLUDED_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

    const store = useCursorStore.getState();
    store.setEnvironment({ isRouteExcluded: excluded });
    store.resetInteraction();
    lastSignatureRef.current = 'default||null|false';
    lastTargetElRef.current = null;

    if (activeSpotlightRef.current) {
      activeSpotlightRef.current.style.setProperty('--sx-spot-opacity', '0');
      activeSpotlightRef.current = null;
    }

    if (pathname !== '/cursor-playground') {
      store.resetPlaygroundOverrides();
    }
  }, [pathname]);

  // Synchronize hardware capability, reduced-motion, and tab visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncEnv = () => {
      useCursorStore.getState().setEnvironment({
        isFinePointer: fineMq.matches && !lastTouchSeenRef.current,
        isReducedMotion: motionMq.matches,
        isDocumentHidden: document.hidden,
      });
    };

    syncEnv();

    const onFineChange = () => {
      if (fineMq.matches) {
        lastTouchSeenRef.current = false;
      }
      syncEnv();
    };
    const onMotionChange = () => syncEnv();
    const onVisibility = () => {
      syncEnv();
      if (document.hidden) {
        const store = useCursorStore.getState();
        store.setVisible(false);
        store.setPressed(false);
      }
    };

    fineMq.addEventListener('change', onFineChange);
    motionMq.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      fineMq.removeEventListener('change', onFineChange);
      motionMq.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Keep <html> classes in sync for scoped CSS pointer rules
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const cursorEnabled = isFinePointer && !isRouteExcluded && !isDocumentHidden;

    root.classList.toggle('starx-cursor-enabled', cursorEnabled);
    root.classList.toggle('starx-cursor-active', cursorEnabled && isVisible);
    root.classList.toggle('starx-cursor-native', cursorEnabled && isNativeFallback);

    return () => {
      root.classList.remove('starx-cursor-enabled');
      root.classList.remove('starx-cursor-active');
      root.classList.remove('starx-cursor-native');
    };
  }, [isFinePointer, isRouteExcluded, isDocumentHidden, isVisible, isNativeFallback]);

  // Passive global pointer tracking & deterministic interaction state dispatcher
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const clearSpotlight = () => {
      if (activeSpotlightRef.current) {
        activeSpotlightRef.current.style.setProperty('--sx-spot-opacity', '0');
        activeSpotlightRef.current = null;
      }
      lastSpotX = Number.NaN;
      lastSpotY = Number.NaN;
    };

    // Prevent spotlight CSS variables from cascading style invalidation to all card descendants
    try {
      const cssAny = window.CSS as unknown as {
        registerProperty?: (def: {
          name: string;
          syntax: string;
          inherits: boolean;
          initialValue: string;
        }) => void;
      };
      if (cssAny && typeof cssAny.registerProperty === 'function') {
        const defs = [
          { name: '--sx-spot-x', syntax: '<length-percentage>', inherits: false, initialValue: '50%' },
          { name: '--sx-spot-y', syntax: '<length-percentage>', inherits: false, initialValue: '50%' },
          { name: '--sx-spot-opacity', syntax: '<number>', inherits: false, initialValue: '0' },
          { name: '--sx-spot-intensity', syntax: '<number>', inherits: false, initialValue: '0.16' },
        ];
        for (const def of defs) {
          try {
            cssAny.registerProperty(def);
          } catch {
            // Already registered across hot reloads / remounts
          }
        }
      }
    } catch {
      // Unsupported browser fallback works via standard custom property inheritance
    }

    let rectEpoch = 0;
    const spotRectCache = new WeakMap<
      HTMLElement,
      { left: number; top: number; epoch: number }
    >();
    let lastSpotX = Number.NaN;
    let lastSpotY = Number.NaN;
    let latestRingX = pointerRef.current.x;
    let latestRingY = pointerRef.current.y;
    let hasRingFrame = false;
    let lastRawMoveEl: EventTarget | null = null;
    let pendingTarget: EventTarget | null = null;
    let pendingX = 0;
    let pendingY = 0;
    let moveRafId = 0;
    let scrollRafId = 0;

    const invalidateSpotlightRects = () => {
      rectEpoch += 1;
    };

    const applySpotlightPosition = (spotlightHost: HTMLElement, ringX: number, ringY: number) => {
      // Magnetic buttons shift slightly on hover; read live bounds only for the single hovered magnetic host
      let left: number;
      let top: number;
      if (spotlightHost.hasAttribute('data-cursor-magnetic')) {
        const rect = spotlightHost.getBoundingClientRect();
        left = rect.left;
        top = rect.top;
      } else {
        let cached = spotRectCache.get(spotlightHost);
        if (!cached || cached.epoch !== rectEpoch) {
          const rect = spotlightHost.getBoundingClientRect();
          cached = { left: rect.left, top: rect.top, epoch: rectEpoch };
          spotRectCache.set(spotlightHost, cached);
        }
        left = cached.left;
        top = cached.top;
      }

      const localX = ringX - left;
      const localY = ringY - top;

      if (
        Number.isNaN(lastSpotX) ||
        Math.abs(localX - lastSpotX) >= 0.3 ||
        Math.abs(localY - lastSpotY) >= 0.3
      ) {
        lastSpotX = localX;
        lastSpotY = localY;
        spotlightHost.style.setProperty('--sx-spot-x', `${localX.toFixed(1)}px`);
        spotlightHost.style.setProperty('--sx-spot-y', `${localY.toFixed(1)}px`);
      }
    };

    const applyResolved = (resolved: ResolvedTarget) => {
      const signature = `${resolved.mode}|${resolved.label ?? ''}|${resolved.activeVariant ?? ''}|${resolved.isNativeFallback}`;
      if (
        resolved.element === lastTargetElRef.current &&
        signature === lastSignatureRef.current
      ) {
        return;
      }

      lastTargetElRef.current = resolved.element;
      lastSignatureRef.current = signature;

      useCursorStore.getState().setInteraction({
        mode: resolved.mode,
        label: resolved.label,
        activeVariant: resolved.activeVariant,
        isNativeFallback: resolved.isNativeFallback,
      });
    };

    const syncSpotlightHost = (target: EventTarget | null, fallbackX: number, fallbackY: number) => {
      const storeState = useCursorStore.getState();
      if (
        !storeState.isFinePointer ||
        storeState.isReducedMotion ||
        storeState.isRouteExcluded ||
        storeState.isDocumentHidden
      ) {
        clearSpotlight();
        return;
      }

      const el =
        target instanceof Element
          ? target
          : target instanceof Node
            ? target.parentElement
            : null;
      const spotlightHost = el?.closest(
        '[data-cursor-spotlight="button"], [data-cursor-spotlight="true"]',
      ) as HTMLElement | null;

      if (activeSpotlightRef.current && activeSpotlightRef.current !== spotlightHost) {
        activeSpotlightRef.current.style.setProperty('--sx-spot-opacity', '0');
        lastSpotX = Number.NaN;
        lastSpotY = Number.NaN;
      }

      if (!spotlightHost) {
        activeSpotlightRef.current = null;
        return;
      }

      const ringX = hasRingFrame ? latestRingX : fallbackX;
      const ringY = hasRingFrame ? latestRingY : fallbackY;
      applySpotlightPosition(spotlightHost, ringX, ringY);

      if (activeSpotlightRef.current !== spotlightHost) {
        const cfg = getActivePhysicsConfig();
        spotlightHost.style.setProperty(
          '--sx-spot-intensity',
          String(Math.max(0, Math.min(0.45, cfg.spotlightIntensity))),
        );
        spotlightHost.style.setProperty('--sx-spot-opacity', '1');
        activeSpotlightRef.current = spotlightHost;
      }
    };

    pointerRef.current.onRingFrame = (ringX: number, ringY: number) => {
      latestRingX = ringX;
      latestRingY = ringY;
      hasRingFrame = true;

      const host = activeSpotlightRef.current;
      if (!host) return;
      if (!host.isConnected) {
        activeSpotlightRef.current = null;
        return;
      }

      const storeState = useCursorStore.getState();
      if (
        !storeState.isFinePointer ||
        storeState.isReducedMotion ||
        storeState.isRouteExcluded ||
        storeState.isDocumentHidden
      ) {
        clearSpotlight();
        return;
      }

      applySpotlightPosition(host, ringX, ringY);
    };

    const flushPointerMove = () => {
      moveRafId = 0;
      const state = useCursorStore.getState();
      if (!state.isFinePointer || state.isRouteExcluded || state.isDocumentHidden) {
        return;
      }

      if (!state.isVisible) {
        state.setVisible(true);
      }

      if (pendingTarget !== lastRawMoveEl) {
        lastRawMoveEl = pendingTarget;
        const resolved = resolveCursorTarget(pendingTarget);
        applyResolved(resolved);
      }
      syncSpotlightHost(pendingTarget, pendingX, pendingY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        if (!lastTouchSeenRef.current) {
          lastTouchSeenRef.current = true;
          const store = useCursorStore.getState();
          store.setEnvironment({ isFinePointer: false });
          store.setVisible(false);
          clearSpotlight();
        }
        return;
      }

      if (lastTouchSeenRef.current && e.pointerType === 'mouse') {
        lastTouchSeenRef.current = false;
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        useCursorStore.getState().setEnvironment({ isFinePointer: fine });
      }

      const state = useCursorStore.getState();
      if (!state.isFinePointer || state.isRouteExcluded || state.isDocumentHidden) {
        return;
      }

      // Immediate 0ms dot update & spring wake
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.hasMoved = true;
      pointerRef.current.wake?.();

      pendingTarget = e.target;
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!moveRafId) {
        moveRafId = window.requestAnimationFrame(flushPointerMove);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        lastTouchSeenRef.current = true;
        useCursorStore.getState().setEnvironment({ isFinePointer: false });
        useCursorStore.getState().setVisible(false);
        clearSpotlight();
        return;
      }
      if (e.button !== 0) return;

      const state = useCursorStore.getState();
      if (!state.isFinePointer || state.isRouteExcluded) return;

      lastRawMoveEl = null;
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.hasMoved = true;
      pointerRef.current.wake?.();
      applyResolved(resolveCursorTarget(e.target));
      state.setPressed(true);
    };

    const onPointerUp = () => {
      const state = useCursorStore.getState();
      if (state.isPressed) {
        state.setPressed(false);
      }
      pointerRef.current.wake?.();
      lastRawMoveEl = null;
      if (pointerRef.current.hasMoved && state.isFinePointer && !state.isRouteExcluded) {
        const refreshUnderPointer = () => {
          const under = document.elementFromPoint(pointerRef.current.x, pointerRef.current.y);
          if (under) {
            applyResolved(resolveCursorTarget(under));
          }
        };
        refreshUnderPointer();
        window.requestAnimationFrame(refreshUnderPointer);
      }
    };

    const onMouseLeaveDocument = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        lastRawMoveEl = null;
        const store = useCursorStore.getState();
        store.setVisible(false);
        store.setPressed(false);
        clearSpotlight();
      }
    };

    const onWindowBlur = () => {
      lastRawMoveEl = null;
      const store = useCursorStore.getState();
      store.setVisible(false);
      store.setPressed(false);
      store.resetInteraction();
      lastSignatureRef.current = 'default||null|false';
      lastTargetElRef.current = null;
      clearSpotlight();
    };

    const onScrollRefresh = () => {
      invalidateSpotlightRects();
      if (!pointerRef.current.hasMoved || scrollRafId) return;
      const state = useCursorStore.getState();
      if (!state.isVisible || !state.isFinePointer || state.isRouteExcluded) return;
      scrollRafId = window.requestAnimationFrame(() => {
        scrollRafId = 0;
        if (lastTargetElRef.current && !lastTargetElRef.current.isConnected) {
          lastRawMoveEl = null;
          const under = document.elementFromPoint(pointerRef.current.x, pointerRef.current.y);
          applyResolved(resolveCursorTarget(under));
        }
        if (activeSpotlightRef.current?.isConnected && hasRingFrame) {
          applySpotlightPosition(activeSpotlightRef.current, latestRingX, latestRingY);
        } else if (activeSpotlightRef.current && !activeSpotlightRef.current.isConnected) {
          activeSpotlightRef.current = null;
        }
      });
    };

    const onViewportResize = () => {
      invalidateSpotlightRects();
      lastRawMoveEl = null;
      if (pointerRef.current.hasMoved) {
        pointerRef.current.x = Math.min(window.innerWidth, Math.max(0, pointerRef.current.x));
        pointerRef.current.y = Math.min(window.innerHeight, Math.max(0, pointerRef.current.y));
        pointerRef.current.wake?.();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeaveDocument, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('scroll', onScrollRefresh, { passive: true, capture: true });
    window.addEventListener('resize', onViewportResize, { passive: true });
    window.visualViewport?.addEventListener('resize', onViewportResize);

    return () => {
      if (moveRafId) window.cancelAnimationFrame(moveRafId);
      if (scrollRafId) window.cancelAnimationFrame(scrollRafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeaveDocument);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('scroll', onScrollRefresh, { capture: true });
      window.removeEventListener('resize', onViewportResize);
      window.visualViewport?.removeEventListener('resize', onViewportResize);
      pointerRef.current.onRingFrame = undefined;
      clearSpotlight();
    };
  }, []);

  return (
    <>
      {children}
      <CustomCursor pointerRef={pointerRef} />
    </>
  );
}
