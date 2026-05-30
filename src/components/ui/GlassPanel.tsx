import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  tier?: 'mist' | 'panel' | 'focus' | 'hero';
  interactive?: boolean;
  tilt?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(({
  tier = 'panel',
  interactive = false,
  tilt = false,
  className,
  children,
  ...props
}, ref) => {
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const shouldTilt = tilt && !isTouch;

  return (
    <motion.div
      ref={ref}
      className={cn(
        `glass-${tier}`,
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
