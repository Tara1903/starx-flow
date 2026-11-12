"use client";

import React from "react";
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
      viewport={VIEWPORT_CONFIG}
      transition={delay ? { delay } : undefined}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
