"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * StarX Flow Lusion-Style PageTransition wrapper.
 * Smooth route entrance with zero blank flash, preserving immediate SSR visibility.
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        transitioning
          ? "opacity-90 translate-y-1"
          : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
