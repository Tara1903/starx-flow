import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SuccessStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function SuccessState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className
}: SuccessStateProps) {
  return (
    <div
      className={cn(
        "glass-panel flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] relative overflow-hidden animate-[fade-in-up_0.4s_ease-out]",
        className
      )}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Reusable Animated Checkmark */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 success-icon-enter">
          <Check className="w-8 h-8 stroke-[2.5px]" />
        </div>
        <div className="absolute -top-1 -right-1 text-emerald-300 animate-bounce">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      {/* Reusable CTAs */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#050505] font-extrabold text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="w-full py-3 px-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white font-extrabold text-xs rounded-xl transition-all duration-300"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
