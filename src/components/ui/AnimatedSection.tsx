"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface AnimatedSectionProps extends React.HTMLAttributes<HTMLElement> {
  stagger?: boolean;
  delay?: number;
  children?: React.ReactNode;
}

/**
 * StarX Flow AnimatedSection wrapper.
 * Guaranteed 100% immediate content visibility:
 * Renders section immediately visible by default (opacity: 1) without hiding.
 */
export function AnimatedSection({
  stagger = false,
  delay = 0,
  className,
  children,
  ...props
}: AnimatedSectionProps) {
  return (
    <section className={cn(className)} {...props}>
      {children}
    </section>
  );
}
