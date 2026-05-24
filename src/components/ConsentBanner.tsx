import { useState, useEffect } from 'react';
import { needsConsentPrompt, setConsent } from '../services/consent';

/**
 * StarX OS — Cookie Consent Banner
 * Displayed on first visit or when consent version changes.
 * Essential cookies are always enabled (auth, session).
 * Analytics cookies require explicit opt-in.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to avoid layout shift on initial render
    const timer = setTimeout(() => {
      if (needsConsentPrompt()) {
        setVisible(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <div
      id="consent-banner"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-gray-900/95 p-5 shadow-2xl backdrop-blur-xl"
        style={{
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              We use cookies for authentication and core functionality.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Optional analytics help us improve StarX OS.{' '}
              <a
                href="/cookies"
                className="underline underline-offset-2 hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              id="consent-essential-only"
              onClick={handleEssentialOnly}
              className="rounded-lg border border-white/20 px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:border-white/40 hover:text-white"
            >
              Essential Only
            </button>
            <button
              id="consent-accept-all"
              onClick={handleAcceptAll}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
