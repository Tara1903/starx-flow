"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { modalEnter, overlayBackdrop } from "../../lib/motionVariants";

export interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  disableClose?: boolean;
  className?: string;
}

export function GlassModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
  disableClose = false,
  className,
}: GlassModalProps) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !disableClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose, disableClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={prefersReduced ? undefined : overlayBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !disableClose) onClose();
          }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto"
          style={{ WebkitBackdropFilter: "blur(12px)" }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            variants={prefersReduced ? undefined : modalEnter}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative w-full rounded-t-3xl sm:rounded-3xl glass-focal border border-emerald-500/25 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(16,185,129,0.18)] overflow-y-auto max-h-[90vh] max-h-[90dvh] pb-[env(safe-area-inset-bottom)] sm:my-auto",
              maxWidths[maxWidth],
              className
            )}
            style={{ WebkitBackdropFilter: "blur(24px)" }}
          >
            {/* Top specular emerald line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

            {(title || !disableClose) && (
              <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div className="min-w-0 pr-4">
                  {title && (
                    <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
                  )}
                </div>
                {!disableClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="relative z-10">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
