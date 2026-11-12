import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastState {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const next: ToastItem = {
      id,
      durationMs: toast.durationMs ?? (toast.tone === 'error' ? 6000 : 3800),
      ...toast,
    };

    // Keep maximum 4 visible notifications so viewport never saturates
    set((state) => ({
      toasts: [...state.toasts.slice(-3), next],
    }));

    if (next.durationMs && next.durationMs > 0 && typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (get().toasts.some((t) => t.id === id)) {
          get().dismissToast(id);
        }
      }, next.durationMs);
    }

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
