"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { MOTION_EASE, VIEWPORT_CONFIG } from "../../lib/motionVariants";

export interface AnimatedTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  mode?: "word" | "line";
  priority?: boolean;
  delay?: number;
  staggerSec?: number;
  className?: string;
}

/**
 * Tasteful StarX Flow text choreography primitive (word stagger or smooth line rise).
 * Renders clean semantic text immediately under reduced motion with zero per-character DOM bloat.
 * Guaranteed failsafe ensures text is never permanently hidden if an observer delays.
 */
export function AnimatedText({
  text,
  as = "h2",
  mode = "word",
  priority = false,
  delay = 0,
  staggerSec = 0.035,
  className,
}: AnimatedTextProps) {
  const prefersReduced = useReducedMotion();
  const [failsafeVisible, setFailsafeVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFailsafeVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const Tag = as;

  if (prefersReduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  if (mode === "line") {
    const MotionTag = motion[as];
    return (
      <MotionTag
        initial={{ opacity: 0, y: 12 }}
        animate={priority || failsafeVisible ? { opacity: 1, y: 0 } : undefined}
        whileInView={priority ? undefined : { opacity: 1, y: 0 }}
        viewport={priority ? undefined : VIEWPORT_CONFIG}
        transition={{ duration: 0.44, delay, ease: MOTION_EASE.premium }}
        className={className}
      >
        {text}
      </MotionTag>
    );
  }

  const words = text.split(" ");
  const MotionContainer = motion[as];

  return (
    <MotionContainer
      aria-label={text}
      initial="hidden"
      animate={priority || failsafeVisible ? "visible" : undefined}
      whileInView={priority ? undefined : "visible"}
      viewport={priority ? undefined : VIEWPORT_CONFIG}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerSec,
            delayChildren: delay,
          },
        },
      }}
      className={cn("inline-block", className)}
    >
      {words.map((word, idx) => (
        <span key={`${word}-${idx}`} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <motion.span
            variants={{
              hidden: { opacity: 0, y: "32%" },
              visible: {
                opacity: 1,
                y: "0%",
                transition: { duration: 0.42, ease: MOTION_EASE.premium },
              },
            }}
            className="inline-block"
          >
            {word}
            {idx < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionContainer>
  );
}
