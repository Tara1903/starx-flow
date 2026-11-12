"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { MOTION_DURATION, MOTION_EASE } from "../../lib/motionVariants";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, [pathname]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={isFirstRender.current ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.page, ease: MOTION_EASE.premium }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
