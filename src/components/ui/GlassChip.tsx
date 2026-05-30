import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassChipProps extends HTMLMotionProps<"span"> {
  selected?: boolean;
  tone?: 'default' | 'emerald' | 'blue' | 'red' | 'amber';
}

export const GlassChip = forwardRef<HTMLSpanElement, GlassChipProps>(({
  selected = false,
  tone = 'default',
  className,
  children,
  ...props
}, ref) => {
  const tones = {
    default: selected 
      ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
      : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10",
    emerald: selected
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/70 hover:bg-emerald-500/10",
    blue: selected
      ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
      : "bg-blue-500/5 border-blue-500/10 text-blue-500/70 hover:bg-blue-500/10",
    red: selected
      ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
      : "bg-red-500/5 border-red-500/10 text-red-500/70 hover:bg-red-500/10",
    amber: selected
      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
      : "bg-amber-500/5 border-amber-500/10 text-amber-500/70 hover:bg-amber-500/10",
  };

  return (
    <motion.span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
});

GlassChip.displayName = 'GlassChip';
