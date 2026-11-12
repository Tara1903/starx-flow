"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { cardHoverGlow } from "../../lib/motionVariants";

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "obsidian" | "focus" | "hero" | "mist" | "liquid" | "subtle" | "premium" | "focal";
  hoverable?: boolean;
  hover?: boolean;
  glow?: boolean;
  sheen?: boolean;
  spotlight?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "obsidian",
      hoverable = false,
      hover = false,
      glow = false,
      sheen = false,
      spotlight,
      padding = "md",
      className,
      children,
      onPointerMove,
      ...props
    },
    ref
  ) => {
    const prefersReduced = useReducedMotion();
    const isHoverable = hover || hoverable;
    const enableSpotlight = spotlight ?? isHoverable;

    const variants = {
      default: "glass-panel",
      obsidian: "glass-card-obsidian",
      focus: "glass-focus",
      hero: "glass-hero",
      mist: "glass-mist",
      liquid: "liquid-glass",
      subtle: "glass-subtle",
      premium: "glass-card-obsidian",
      focal: "glass-hero",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <motion.div
        ref={ref}
        data-cursor-spotlight={enableSpotlight && !prefersReduced ? "true" : undefined}
        whileHover={isHoverable && !prefersReduced ? cardHoverGlow : undefined}
        onPointerMove={onPointerMove}
        className={cn(
          "rounded-2xl transition-colors duration-200",
          variants[variant],
          sheen && "liquid-glass-sheen",
          paddings[padding],
          hoverable &&
            "hover:border-emerald-400/40 hover:shadow-[0_18px_46px_rgba(0,0,0,0.55),0_0_32px_rgba(16,185,129,0.16)]",
          glow && "border-emerald-400/35 shadow-[0_0_36px_rgba(16,185,129,0.18)]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
