"use client";

import { useCallback } from 'react';
import { useCursorStore } from '../store/cursorStore';
import type { CursorButtonVariant, CursorContextualLabel, CursorMode } from './cursorTypes';

/**
 * Exposes StarX Flow Custom Cursor 2.0 interaction state & explicit
 * programmatic mode helpers to components and Cursor Playground diagnostics.
 */
export function useCursor() {
  const mode = useCursorStore((s) => s.mode);
  const label = useCursorStore((s) => s.label);
  const activeVariant = useCursorStore((s) => s.activeVariant);
  const isPressed = useCursorStore((s) => s.isPressed);
  const isFinePointer = useCursorStore((s) => s.isFinePointer);
  const isReducedMotion = useCursorStore((s) => s.isReducedMotion);
  const isNativeFallback = useCursorStore((s) => s.isNativeFallback);
  const setInteraction = useCursorStore((s) => s.setInteraction);
  const resetInteraction = useCursorStore((s) => s.resetInteraction);

  const setCursorMode = useCallback(
    (
      nextMode: CursorMode,
      options?: {
        label?: CursorContextualLabel | null;
        variant?: CursorButtonVariant | null;
      }
    ) => {
      setInteraction({
        mode: nextMode,
        label: options?.label ?? null,
        activeVariant: options?.variant ?? null,
        isNativeFallback: nextMode === 'native',
      });
    },
    [setInteraction]
  );

  return {
    mode,
    label,
    activeVariant,
    isPressed,
    isFinePointer,
    isReducedMotion,
    isNativeFallback,
    setCursorMode,
    resetCursor: resetInteraction,
  };
}
