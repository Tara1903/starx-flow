"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion, HTMLMotionProps } from "motion/react";
import {
  fadeIn,
  clipRevealUp,
  scrollRevealUp,
  scrollRevealDown,
  scrollRevealLeft,
  scrollRevealRight,
  scrollRevealScale,
  VIEWPORT_CONFIG,
  MOTION_EASE,
} from "../../lib/motionVariants";

export interface ScrollRevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  direction?: "fade" | "up" | "down" | "left" | "right" | "scale" | "clip";
  delay?: number;
  duration?: number;
  once?: boolean;
  children?: React.ReactNode;
}

export function ScrollReveal({
  direction = "up",
  delay = 0,
  duration = 0.42,
  once = true,
  className,
  children,
  ...props
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();
  const [failsafeVisible, setFailsafeVisible] = useState(false);

  useEffect(() => {
    // Fail-safe guarantee: Content must NEVER stay stuck at opacity: 0 if an observer or trigger delays
    const timer = setTimeout(() => {
      setFailsafeVisible(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (prefersReduced) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  const variantMap = {
    fade: fadeIn,
    up: scrollRevealUp,
    down: scrollRevealDown,
    left: scrollRevealLeft,
    right: scrollRevealRight,
    scale: scrollRevealScale,
    clip: clipRevealUp,
  };

  return (
    <motion.div
      variants={variantMap[direction]}
      initial="hidden"
      whileInView="visible"
      animate={failsafeVisible ? "visible" : undefined}
      viewport={{ ...VIEWPORT_CONFIG, once }}
      transition={{ duration, delay, ease: MOTION_EASE.premium }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
