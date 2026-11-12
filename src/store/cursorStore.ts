import { create } from 'zustand';
import { DEFAULT_CURSOR_PHYSICS } from '../cursor/cursor.config';
import type {
  CursorButtonVariant,
  CursorMode,
  CursorPhysicsConfig,
} from '../cursor/cursorTypes';

interface CursorState {
  isFinePointer: boolean;
  isReducedMotion: boolean;
  isRouteExcluded: boolean;
  isDocumentHidden: boolean;
  isVisible: boolean;
  isPressed: boolean;
  mode: CursorMode;
  label: string | null;
  activeVariant: CursorButtonVariant | null;
  isNativeFallback: boolean;
  /** Development-only overrides active strictly inside /cursor-playground */
  playgroundOverrides: Partial<CursorPhysicsConfig>;

  setEnvironment: (env: Partial<Pick<CursorState, 'isFinePointer' | 'isReducedMotion' | 'isRouteExcluded' | 'isDocumentHidden'>>) => void;
  setVisible: (visible: boolean) => void;
  setPressed: (pressed: boolean) => void;
  setInteraction: (payload: {
    mode: CursorMode;
    label?: string | null;
    activeVariant?: CursorButtonVariant | null;
    isNativeFallback?: boolean;
  }) => void;
  resetInteraction: () => void;
  setPlaygroundOverrides: (next: Partial<CursorPhysicsConfig>) => void;
  resetPlaygroundOverrides: () => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  isFinePointer: false,
  isReducedMotion: false,
  isRouteExcluded: false,
  isDocumentHidden: false,
  isVisible: false,
  isPressed: false,
  mode: 'default',
  label: null,
  activeVariant: null,
  isNativeFallback: false,
  playgroundOverrides: {},

  setEnvironment: (env) => set((state) => ({ ...state, ...env })),
  setVisible: (isVisible) => set({ isVisible }),
  setPressed: (isPressed) => set({ isPressed }),
  setInteraction: ({
    mode,
    label = null,
    activeVariant = null,
    isNativeFallback = false,
  }) =>
    set({
      mode,
      label,
      activeVariant,
      isNativeFallback,
    }),
  resetInteraction: () =>
    set({
      mode: 'default',
      label: null,
      activeVariant: null,
      isNativeFallback: false,
      isPressed: false,
    }),
  setPlaygroundOverrides: (next) =>
    set((state) => ({
      playgroundOverrides: { ...state.playgroundOverrides, ...next },
    })),
  resetPlaygroundOverrides: () => set({ playgroundOverrides: {} }),
}));

export function getActivePhysicsConfig(): CursorPhysicsConfig {
  const overrides = useCursorStore.getState().playgroundOverrides;
  return {
    ...DEFAULT_CURSOR_PHYSICS,
    ...overrides,
  };
}
