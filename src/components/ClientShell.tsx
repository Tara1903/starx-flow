'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { MotionProvider } from '@/lib/motion/MotionProvider';
import { useUIStore } from '../store/uiStore';
import { useAuthStore, setupAuthListener } from '../store/authStore';
import { ConsentBanner } from './ConsentBanner';
import { Navbar } from './Navbar';
import { MobileFloatingNavigation } from './MobileFloatingNavigation';
import { Footer } from './Footer';
import { AmbientEnvironment } from './AmbientEnvironment';
import { PageTransition } from './ui/PageTransition';
import { ToastViewport } from './ui/ToastViewport';
import { CursorProvider } from '../cursor';
import { OpticalGlassFilter } from './spatial/OpticalGlassFilter';

const CommandCenter = dynamic(
  () => import('./CommandCenter').then((m) => m.CommandCenter),
  { ssr: false }
);
const SignupModal = dynamic(
  () => import('./SignupModal').then((m) => m.SignupModal),
  { ssr: false }
);
const DemoModal = dynamic(
  () => import('./modals/DemoModal').then((m) => m.DemoModal),
  { ssr: false }
);

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute =
    pathname?.startsWith('/setup') ||
    pathname?.startsWith('/dashboard') ||
    (pathname?.startsWith('/admin') && pathname !== '/admin/login');
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/admin/login';
  const isHomePage = pathname === '/';
  const showNavbar = !isAppRoute;
  const showGlobalChrome = !isAppRoute && !isHomePage;
  const showMobileBottomNav = !isAuthRoute;

  const isSignupOpen = useUIStore((state) => state.isSignupOpen);
  const closeSignup = useUIStore((state) => state.closeSignup);
  const openFirstVisitPrompt = useUIStore((state) => state.openFirstVisitPrompt);
  const isDemoOpen = useUIStore((state) => state.isDemoOpen);
  const closeDemo = useUIStore((state) => state.closeDemo);
  const theme = useUIStore((state) => state.theme);
  const initSession = useAuthStore((state) => state.initSession);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initSession();
    const cleanup = setupAuthListener();
    return cleanup;
  }, [initSession]);

  // First-visit auto-popups disabled to maintain premium, non-intrusive luxury UX
  useEffect(() => {
    // No-op: do not hijack visitor screens with unsolicited auth popups
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <MotionConfig reducedMotion="user">
      <MotionProvider>
        <CursorProvider>
        <OpticalGlassFilter />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-emerald-500 focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
        >
          Skip to main content
        </a>
        {showGlobalChrome && <AmbientEnvironment />}
        {mounted && <CommandCenter />}
        {showNavbar && <Navbar />}
        <main
          id="main-content"
          aria-label="Main content"
          className="relative z-10 flex-1 flex flex-col"
        >
          <PageTransition className="flex-1 flex flex-col">
            {children}
          </PageTransition>
        </main>
        {showGlobalChrome && (
          <div className="pb-20 md:pb-0">
            <Footer />
          </div>
        )}
        {showMobileBottomNav && <MobileFloatingNavigation />}

        {mounted && (
          <>
            <AnimatePresence>
              {isSignupOpen && <SignupModal onClose={closeSignup} />}
              {isDemoOpen && <DemoModal onClose={closeDemo} />}
            </AnimatePresence>
            <ToastViewport />
            {!isHomePage && <ConsentBanner />}
          </>
        )}
        </CursorProvider>
      </MotionProvider>
    </MotionConfig>
  );
}
