import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('starx_cookie_consent');
    if (!consent) {
      // Small delay so it doesn't pop up immediately on mount
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('starx_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('starx_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-2rem)] sm:w-[400px]"
        >
          <div className="glass-panel rounded-2xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.05)] border-emerald-500/10">
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">We respect your privacy</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies as detailed in our{' '}
                  <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
