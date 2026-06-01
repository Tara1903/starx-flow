'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore, setupAuthListener } from '../store/authStore';
import { SignupModal } from './SignupModal';
import { CustomCursor } from './CustomCursor';
import { ConsentBanner } from './ConsentBanner';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AmbientEnvironment } from './AmbientEnvironment';
import { CommandCenter } from './CommandCenter';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = pathname?.startsWith('/setup') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  
  const isSignupOpen = useUIStore((state) => state.isSignupOpen);
  const closeSignup = useUIStore((state) => state.closeSignup);
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

  // Prevent hydration mismatch on initial render for portals/modals
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-emerald-500 focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold">
        Skip to main content
      </a>
      <AmbientEnvironment />
      <CustomCursor />
      <CommandCenter />
      {!isAppRoute && <Navbar />}
      <main id="main-content" aria-label="Main content" className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>
      {!isAppRoute && <Footer />}
      
      <AnimatePresence>
        {isSignupOpen && (
          <SignupModal onClose={closeSignup} />
        )}
      </AnimatePresence>
      <ConsentBanner />
    </>
  );
}
