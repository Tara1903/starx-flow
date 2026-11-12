"use client";
import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';
import { useCursorStore } from '../../store/cursorStore';

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  tier?: 'mist' | 'panel' | 'focus' | 'hero' | 'subtle' | 'premium' | 'focal';
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
  const isTouch = useCursorStore((s) => !s.isFinePointer);
  const shouldTilt = tilt && !isTouch;
  const enableSpotlight = spotlight ?? interactive;

  return (
    <motion.div
      ref={ref}
      data-cursor-spotlight={enableSpotlight && !isTouch ? 'true' : undefined}
      onPointerMove={onPointerMove}
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
