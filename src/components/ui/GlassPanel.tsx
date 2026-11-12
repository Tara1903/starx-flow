"use client";
import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  tier?: 'mist' | 'panel' | 'focus' | 'hero';
  interactive?: boolean;
  tilt?: boolean;
  spotlight?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(({
  tier = 'panel',
  interactive = false,
  tilt = false,
  spotlight,
  className,
  children,
  onPointerMove,
  ...props
}, ref) => {
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const shouldTilt = tilt && !isTouch;
  const enableSpotlight = spotlight ?? interactive;

  return (
    <motion.div
      ref={ref}
      data-cursor-spotlight={enableSpotlight && !isTouch ? 'true' : undefined}
      onPointerMove={onPointerMove}
      className={cn(
        `glass-${tier}`,
        tier !== 'mist' && 'liquid-glass',
        interactive && 'glass-interactive cursor-pointer',
        shouldTilt && 'glass-tilt',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

GlassPanel.displayName = 'GlassPanel';
