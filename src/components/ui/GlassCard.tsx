"use client";

import React, { forwardRef } from "react";
import {
  motion,
  HTMLMotionProps,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "../../lib/utils";
import { cardHoverGlow } from "../../lib/motionVariants";

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "obsidian" | "focus" | "hero" | "mist" | "liquid" | "subtle" | "premium" | "focal";
  hoverable?: boolean;
  hover?: boolean;
  glow?: boolean;
  sheen?: boolean;
  spotlight?: boolean;
  hoverTilt?: boolean;
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
      hoverTilt = false,
      padding = "md",
      className,
      children,
      onPointerMove,
      onPointerLeave,
      style,
      ...props
    },
    ref
  ) => {
    const prefersReduced = useReducedMotion();
    const isHoverable = hover || hoverable;
    const enableSpotlight = spotlight ?? isHoverable;
    const enableTilt = (hoverTilt || isHoverable) && !prefersReduced;

    // 3D Gyroscopic Tilt Physics
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 350, mass: 0.6 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(smoothY, [-0.5, 0.5], enableTilt ? [4, -4] : [0, 0]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], enableTilt ? [-4, 4] : [0, 0]);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (enableSpotlight) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty("--sx-spot-x", `${x}px`);
        e.currentTarget.style.setProperty("--sx-spot-y", `${y}px`);
        e.currentTarget.style.setProperty("--sx-spot-opacity", "1");
      }
      if (enableTilt) {
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
      }
      onPointerMove?.(e);
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      if (enableSpotlight) {
        e.currentTarget.style.setProperty("--sx-spot-opacity", "0");
      }
      if (enableTilt) {
        mouseX.set(0);
        mouseY.set(0);
      }
      onPointerLeave?.(e);
    };

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
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          ...(enableTilt ? { rotateX, rotateY, transformStyle: "preserve-3d" as const } : {}),
          ...style,
        }}
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
