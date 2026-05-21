import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface UIState {
  isSignupOpen: boolean;
  theme: Theme;
  openSignup: () => void;
  closeSignup: () => void;
  toggleSignup: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSignupOpen: false,
  theme: 'dark', // Default to dark as per current design
  openSignup: () => set({ isSignupOpen: true }),
  closeSignup: () => set({ isSignupOpen: false }),
  toggleSignup: () => set((state) => ({ isSignupOpen: !state.isSignupOpen })),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  setTheme: (theme) => set(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme };
  }),
}));
