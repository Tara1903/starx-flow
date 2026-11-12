'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore, setupAuthListener } from '../store/authStore';
import { ConsentBanner } from './ConsentBanner';
import { Navbar } from './Navbar';
import { MobileFloatingNavigation } from './MobileFloatingNavigation';
import { Footer } from './Footer';
import { AmbientEnvironment } from './AmbientEnvironment';
import { PageTransition } from './ui/PageTransition';
import { ToastViewport } from './ui/ToastViewport';
import { CursorProvider } from '../cursor/CursorProvider';

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
    pathname?.startsWith('/admin');

  const isSignupOpen = useUIStore((state) => state.isSignupOpen);
  const closeSignup = useUIStore((state) => state.closeSignup);
  const isDemoOpen = useUIStore((state) => state.isDemoOpen);
  const closeDemo = useUIStore((state) => state.closeDemo);
  const theme = useUIStore((state) => state.theme);
  const initSession = useAuthStore((state) => state.initSession);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initSession();
    const cleanup = setupAuthListener();
    return cleanup;
  }, [initSession]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <MotionConfig reducedMotion="user">
      <CursorProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-emerald-500 focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>
      {!isAppRoute && <AmbientEnvironment />}
      {mounted && <CommandCenter />}
      {!isAppRoute && <Navbar />}
      <main
        id="main-content"
        aria-label="Main content"
        className="relative z-10 flex-1 flex flex-col"
      >
        <PageTransition className="flex-1 flex flex-col">
          {children}
        </PageTransition>
      </main>
      {!isAppRoute && (
        <div className="pb-20 md:pb-0">
          <Footer />
        </div>
      )}
      {!isAppRoute && <MobileFloatingNavigation />}

      {mounted && (
        <>
          <AnimatePresence>
            {isSignupOpen && <SignupModal onClose={closeSignup} />}
            {isDemoOpen && <DemoModal onClose={closeDemo} />}
          </AnimatePresence>
          <ToastViewport />
          <ConsentBanner />
        </>
      )}
      </CursorProvider>
    </MotionConfig>
  );
}
