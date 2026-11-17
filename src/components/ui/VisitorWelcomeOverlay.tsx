"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, Calendar, MessageSquare, ShieldCheck, HelpCircle } from "lucide-react";
import { liquidSpring } from "@/lib/motionVariants";

const STORAGE_KEY = "starx_welcome_dismissed_v1";
const DISMISSAL_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function VisitorWelcomeOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Check if dismissed recently in localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp) && Date.now() - timestamp < DISMISSAL_EXPIRY_MS) {
          return; // Still within dismissal cooldown
        }
      }
      // Small 800ms delay after load so visitor sees the site first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 750);
      return () => clearTimeout(timer);
    } catch {
      // In private browsing mode or SSR, default to showing
      setIsOpen(true);
    }
  }, []);

  // Keyboard accessibility: Escape to dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus primary button when modal appears
    primaryButtonRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Storage unavailable
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="visitor-welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
          style={{ WebkitBackdropFilter: "blur(4px)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-modal-title"
          aria-describedby="welcome-modal-desc"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          <motion.div
            ref={cardRef}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={liquidSpring}
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#040e0a]/95 border border-emerald-500/30 text-white shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_36px_rgba(16,185,129,0.18)] relative overflow-hidden select-none"
          >
            {/* Top decorative gradient ambient line */}
            <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

            {/* Dismiss Close Icon */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss welcome overlay"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge & Title */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 shadow-[0_0_14px_rgba(16,185,129,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Operating System</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-live" />
            </div>

            <h2 id="welcome-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome to StarX Flow
            </h2>

            <p id="welcome-modal-desc" className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed mt-2.5">
              The complete AI-powered operating system built for service businesses. Automate 24/7 client booking, prevent costly no-shows, collect verified Google reviews, and sync staff calendars seamlessly.
            </p>

            {/* Value Highlights Grid */}
            <div className="grid grid-cols-2 gap-2.5 my-5 text-left">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">24/7 WhatsApp Booking</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 truncate">Instant customer reservations</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">No-Show Prevention</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 truncate">Automated reminder flows</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">Calendar Sync</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 truncate">Google &amp; Outlook 2-way sync</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">Review Booster</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 truncate">Automated GBP review engine</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                ref={primaryButtonRef}
                href="/demo"
                onClick={handleDismiss}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs font-bold text-[#041a10] bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all text-center flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                <span>Explore Live Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto py-3 px-5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/12 transition-colors text-center cursor-pointer"
              >
                Continue to Website
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
