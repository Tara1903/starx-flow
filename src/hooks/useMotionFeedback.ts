'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { motionDisabled, spatialProfile, SPATIAL_MOTION as M } from '@/lib/motion/spatialTokens';

/** React owns product state; animation never delays or replaces the new content. */
export function useMotionFeedback(root: RefObject<HTMLDivElement | null>, value: string | number, selector: string) {
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    if (motionDisabled() || !root.current || root.current.dataset.sxMotion === 'off') return;
    const distance = M.profiles[spatialProfile()].distance;
    const animations = Array.from(root.current.querySelectorAll<HTMLElement>(selector)).flatMap(el => {
      if (!el.animate) return [];
      return [el.animate([
        { transform: `translateY(${2 * distance}px)` },
        { transform: 'translateY(0)' },
      ], { duration: M.duration.notification * 1000, easing: M.easing, composite: 'add' })];
    });
    return () => animations.forEach(animation => animation.cancel());
  }, [root, value, selector]);
}
