"use client";

import React from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export interface NetworkStatusBannerProps {
  onReconnectRetry?: () => void;
}

export function NetworkStatusBanner({ onReconnectRetry }: NetworkStatusBannerProps) {
  const { isOnline, justReconnected } = useNetworkStatus();
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline"
          role="alert"
          aria-live="assertive"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
          className="mx-4 sm:mx-8 mt-3 rounded-2xl bg-amber-500/12 border border-amber-400/35 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-100"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <WifiOff className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="truncate font-medium">
              Connection offline — live syncing paused. Pending actions will retry safely once connected.
            </span>
          </div>
          {onReconnectRetry && (
            <button
              type="button"
              onClick={onReconnectRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-100 font-semibold flex-shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </motion.div>
      )}

      {isOnline && justReconnected && (
        <motion.div
          key="reconnected"
          role="status"
          aria-live="polite"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
          className="mx-4 sm:mx-8 mt-3 rounded-2xl bg-emerald-500/14 border border-emerald-400/35 px-4 py-2 flex items-center gap-2 text-xs text-emerald-200 font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Back online — workspace synchronized cleanly.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
