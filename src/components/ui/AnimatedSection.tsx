"use client";

import React, { useState, useEffect } from "react";
import { motion, HTMLMotionProps, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import {
  scrollRevealUp,
  staggerContainer,
  VIEWPORT_CONFIG,
} from "../../lib/motionVariants";

export interface AnimatedSectionProps extends Omit<HTMLMotionProps<"section">, "children"> {
  stagger?: boolean;
  delay?: number;
  children?: React.ReactNode;
}

export function AnimatedSection({
  stagger = false,
  delay = 0,
  className,
  children,
  ...props
}: AnimatedSectionProps) {
  const prefersReduced = useReducedMotion();
  const [failsafeVisible, setFailsafeVisible] = useState(false);

  useEffect(() => {
    // Fail-safe guarantee: Content must NEVER stay stuck at opacity: 0 if an observer or trigger delays
    const timer = setTimeout(() => {
      setFailsafeVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (prefersReduced) {
    return (
      <section className={className} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      variants={stagger ? staggerContainer : scrollRevealUp}
      initial="hidden"
      whileInView="visible"
      animate={failsafeVisible ? "visible" : undefined}
      viewport={VIEWPORT_CONFIG}
      transition={delay ? { delay } : undefined}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
