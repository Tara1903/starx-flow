"use client";

import { useState, useEffect } from "react";
import { needsConsentPrompt, setConsent } from "../services/consent";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/**
 * StarX OS — Cookie Consent Banner
 * Docked cleanly above mobile bottom navigation and revealed only after scroll engagement
 * or an idle delay so initial Hero above-the-fold controls stay unobstructed.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!needsConsentPrompt()) return;

    let shown = false;
    const reveal = () => {
      if (!shown && needsConsentPrompt()) {
        shown = true;
        setVisible(true);
      }
    };

    const isNarrowMobile = window.innerWidth < 640;
    const timer = window.setTimeout(reveal, isNarrowMobile ? 4200 : 1400);

    const onScroll = () => {
      if (window.scrollY > 120) {
        reveal();
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleAcceptAll = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="consent-banner"
          role="region"
          aria-label="Cookie consent"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.28 }}
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] sm:bottom-4 left-0 right-0 z-[9990] px-3 sm:px-4 pointer-events-none"
        >
          <div
            className="mx-auto max-w-2xl rounded-2xl bg-[#050c09]/95 backdrop-blur-2xl backdrop-saturate-150 border border-emerald-400/30 p-3.5 sm:p-4 shadow-[0_24px_64px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-auto"
            style={{ WebkitBackdropFilter: "blur(24px) saturate(150%)" }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white">
                  We use cookies for authentication and core security.
                </p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-zinc-400">
                  Optional analytics help improve StarX OS.{" "}
                  <a
                    href="/cookies"
                    className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300 transition-colors"
                  >
                    Cookie Policy
                  </a>
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  id="consent-essential-only"
                  type="button"
                  onClick={handleEssentialOnly}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 min-h-[38px] text-xs font-medium text-zinc-200 transition-all hover:border-white/30 hover:text-white cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  id="consent-accept-all"
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 px-4 py-2 min-h-[38px] text-xs font-bold text-[#02120c] transition-all hover:brightness-105 shadow-[0_0_16px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
