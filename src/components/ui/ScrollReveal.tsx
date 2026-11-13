"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "fade" | "up" | "down" | "left" | "right" | "scale" | "clip";
  delay?: number;
  duration?: number;
  once?: boolean;
  children?: React.ReactNode;
}

/**
 * StarX Flow ScrollReveal wrapper.
 * Guaranteed 100% immediate content visibility:
 * Renders children immediately visible by default (opacity: 1) without hiding
 * or depending on IntersectionObserver triggers.
 */
export function ScrollReveal({
  direction = "up",
  delay = 0,
  duration = 0.42,
  once = true,
  className,
  children,
  ...props
}: ScrollRevealProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}
