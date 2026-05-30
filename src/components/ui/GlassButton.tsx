import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'focus';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(({
  variant = 'primary',
  size = 'md',
  magnetic = false,
  className,
  children,
  ...props
}, ref) => {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full select-none";
  
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]",
    secondary: "glass-panel glass-interactive text-white hover:text-emerald-400",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    focus: "glass-focus text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <motion.button
      ref={ref}
      data-magnetic={magnetic ? "true" : undefined}
      whileTap={{ scale: 0.97 }}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});

GlassButton.displayName = 'GlassButton';
