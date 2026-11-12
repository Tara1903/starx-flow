'use client';

import React, { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { useCursorStore } from '../store/cursorStore';

export interface CursorSpotlightProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

/**
 * Interactive card/panel surface host that exposes cursor coordinates cleanly
 * via CSS variables (`--sx-spot-x`, `--sx-spot-y`) driven by CursorProvider.
 */
export const CursorSpotlight = forwardRef<HTMLDivElement, CursorSpotlightProps>(
  ({ disabled = false, className, children, ...props }, ref) => {
    const isReducedMotion = useCursorStore((s) => s.isReducedMotion);
    const active = !disabled && !isReducedMotion;

    return (
      <div
        ref={ref}
        data-cursor-spotlight={active ? 'true' : 'false'}
        className={cn('relative', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CursorSpotlight.displayName = 'CursorSpotlight';
