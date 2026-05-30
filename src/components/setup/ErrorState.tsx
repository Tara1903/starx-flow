import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
  title: string;
  errorMsg: string;
  troubleshootingSteps?: string[];
  retryLabel?: string;
  onRetry?: () => void;
  skipLabel?: string;
  onSkip?: () => void;
  className?: string;
}

export function ErrorState({
  title,
  errorMsg,
  troubleshootingSteps = [
    "Verify your internet connection and api credentials.",
    "Ensure your third-party account is in good standing.",
    "Wait 2 minutes and attempt to re-sync the session.",
    "If the issue persists, contact StarX Support."
  ],
  retryLabel = "Try Again",
  onRetry,
  skipLabel,
  onSkip,
  className
}: ErrorStateProps) {
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  return (
    <div
      className={cn(
        "glass-panel w-full rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-6 relative overflow-hidden animate-[fade-in-up_0.4s_ease-out]",
        className
      )}
    >
      {/* Decorative top red light glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start gap-4">
        {/* Error icon with warning pulse */}
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center relative">
          <span className="absolute inset-0 bg-red-500/10 rounded-xl animate-ping opacity-75" />
          <AlertCircle className="w-5 h-5 relative z-10" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-extrabold text-white tracking-wide">
            {title}
          </h4>
          <p className="text-xs text-red-300/80 mt-1 leading-relaxed break-words font-medium">
            {errorMsg}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 py-2 px-4 bg-red-500 hover:bg-red-400 text-[#050505] font-extrabold text-xs rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{retryLabel}</span>
              </button>
            )}
            {onSkip && skipLabel && (
              <button
                onClick={onSkip}
                className="py-2 px-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white font-extrabold text-xs rounded-lg transition-all duration-300"
              >
                {skipLabel}
              </button>
            )}
            <button
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              className="flex items-center gap-1 py-2 px-3 text-zinc-400 hover:text-white text-xs font-semibold hover:bg-white/[0.02] rounded-lg transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Troubleshoot</span>
              {showTroubleshoot ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>
          </div>

          {/* Expanded troubleshooting guidelines */}
          {showTroubleshoot && (
            <div className="mt-4 pt-4 border-t border-white/[0.04] animate-[fade-in-up_0.2s_ease-out] space-y-2">
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Step-by-Step Resolution Guide
              </h5>
              <ul className="space-y-1.5 pl-1.5">
                {troubleshootingSteps.map((step, idx) => (
                  <li key={idx} className="text-zinc-400 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-red-400 font-bold text-[10px] mt-0.5">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
