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
 * listeners, route exclusions (/collections), surface spotlights, and CustomCursor.
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

    const updateSpotlightAt = (target: EventTarget | null, clientX: number, clientY: number) => {
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
      const spotlightHost = el?.closest('[data-cursor-spotlight="true"]') as HTMLElement | null;

      if (activeSpotlightRef.current && activeSpotlightRef.current !== spotlightHost) {
        activeSpotlightRef.current.style.setProperty('--sx-spot-opacity', '0');
      }

      if (!spotlightHost) {
        activeSpotlightRef.current = null;
        return;
      }

      const rect = spotlightHost.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const cfg = getActivePhysicsConfig();

      spotlightHost.style.setProperty('--sx-spot-x', `${localX.toFixed(1)}px`);
      spotlightHost.style.setProperty('--sx-spot-y', `${localY.toFixed(1)}px`);
      spotlightHost.style.setProperty('--sx-spot-opacity', '1');
      spotlightHost.style.setProperty(
        '--sx-spot-intensity',
        String(Math.max(0, Math.min(0.45, cfg.spotlightIntensity))),
      );
      activeSpotlightRef.current = spotlightHost;
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

      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.hasMoved = true;

      if (!state.isVisible) {
        state.setVisible(true);
      }

      const resolved = resolveCursorTarget(e.target);
      applyResolved(resolved);
      updateSpotlightAt(e.target, e.clientX, e.clientY);
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

      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.hasMoved = true;
      applyResolved(resolveCursorTarget(e.target));
      state.setPressed(true);
    };

    const onPointerUp = () => {
      const state = useCursorStore.getState();
      if (state.isPressed) {
        state.setPressed(false);
      }
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
        const store = useCursorStore.getState();
        store.setVisible(false);
        store.setPressed(false);
        clearSpotlight();
      }
    };

    const onWindowBlur = () => {
      const store = useCursorStore.getState();
      store.setVisible(false);
      store.setPressed(false);
      store.resetInteraction();
      lastSignatureRef.current = 'default||null|false';
      lastTargetElRef.current = null;
      clearSpotlight();
    };

    const onScrollRefresh = () => {
      if (!pointerRef.current.hasMoved) return;
      const state = useCursorStore.getState();
      if (!state.isVisible || !state.isFinePointer || state.isRouteExcluded) return;
      if (lastTargetElRef.current && !lastTargetElRef.current.isConnected) {
        const under = document.elementFromPoint(pointerRef.current.x, pointerRef.current.y);
        applyResolved(resolveCursorTarget(under));
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeaveDocument, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('scroll', onScrollRefresh, { passive: true, capture: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeaveDocument);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('scroll', onScrollRefresh, { capture: true });
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
