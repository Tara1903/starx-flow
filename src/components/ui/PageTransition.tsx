"use client";

import React from "react";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * StarX Flow PageTransition wrapper.
 * Guaranteed 100% immediate content visibility:
 * Renders page content immediately visible without blank screens during transitions.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return <div className={className}>{children}</div>;
}
