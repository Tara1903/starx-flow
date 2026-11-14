import { create } from 'zustand';

type Theme = 'dark' | 'light';
export type AuthMode = 'login' | 'signup';

interface UIState {
  isSignupOpen: boolean;
  authMode: AuthMode;
  isFirstVisitPrompt: boolean;
  isDemoOpen: boolean;
  isCommandCenterOpen: boolean;
  theme: Theme;
  openSignup: () => void;
  openLogin: () => void;
  openFirstVisitPrompt: () => void;
  setAuthMode: (mode: AuthMode) => void;
  closeSignup: () => void;
  toggleSignup: () => void;
  openDemo: () => void;
  closeDemo: () => void;
  toggleDemo: () => void;
  openCommandCenter: () => void;
  closeCommandCenter: () => void;
  toggleCommandCenter: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSignupOpen: false,
  authMode: 'signup',
  isFirstVisitPrompt: false,
  isDemoOpen: false,
  isCommandCenterOpen: false,
  theme: 'dark',
  openSignup: () => set({ isSignupOpen: true, authMode: 'signup', isFirstVisitPrompt: false }),
  openLogin: () => set({ isSignupOpen: true, authMode: 'login', isFirstVisitPrompt: false }),
  openFirstVisitPrompt: () => set({ isSignupOpen: true, authMode: 'signup', isFirstVisitPrompt: true }),
  setAuthMode: (authMode) => set({ authMode }),
  closeSignup: () => set({ isSignupOpen: false, isFirstVisitPrompt: false }),
  toggleSignup: () => set((state) => ({ isSignupOpen: !state.isSignupOpen })),
  openDemo: () => set({ isDemoOpen: true }),
  closeDemo: () => set({ isDemoOpen: false }),
  toggleDemo: () => set((state) => ({ isDemoOpen: !state.isDemoOpen })),
  openCommandCenter: () => set({ isCommandCenterOpen: true }),
  closeCommandCenter: () => set({ isCommandCenterOpen: false }),
  toggleCommandCenter: () =>
    set((state) => ({ isCommandCenterOpen: !state.isCommandCenterOpen })),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    }),
  setTheme: (theme) =>
    set(() => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme };
    }),
}));
