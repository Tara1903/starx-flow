"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";

interface SpatialGlassCardProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "crystal" | "architectural";
  className?: string;
  glow?: boolean;
  hoverTilt?: boolean;
  dataTestId?: string;
  magnetic?: boolean;
}

export function SpatialGlassCard({
  children,
  variant = "primary",
  className = "",
  glow = true,
  hoverTilt = true,
  dataTestId,
  magnetic = false,
}: SpatialGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Pointer position normalized [-0.5, 0.5] for tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Exact local pixel coordinates for specular spotlight
  const pointerX = useMotionValue(-1000);
  const pointerY = useMotionValue(-1000);

  // Smooth springs for 3D tilt
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], prefersReduced || !hoverTilt ? [0, 0] : [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], prefersReduced || !hoverTilt ? [0, 0] : [-5, 5]);

  // Localized specular reflection spotlight follows cursor precisely
  const spotlightBg = useMotionTemplate`radial-gradient(380px circle at ${pointerX}px ${pointerY}px, rgba(16, 185, 129, 0.16), transparent 75%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    
    pointerX.set(localX);
    pointerY.set(localY);

    if (!prefersReduced && hoverTilt) {
      mouseX.set(localX / rect.width - 0.5);
      mouseY.set(localY / rect.height - 0.5);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    pointerX.set(-1000);
    pointerY.set(-1000);
  };

  const variantClassMap = {
    primary: "spatial-glass-primary spatial-edge-bevel",
    secondary: "spatial-glass-secondary",
    crystal: "spatial-glass-crystal spatial-edge-bevel",
    architectural: "spatial-glass-architectural spatial-edge-bevel",
  };

  return (
    <motion.div
      ref={cardRef}
      data-testid={dataTestId}
      data-magnetic={magnetic ? "true" : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative w-full rounded-3xl overflow-hidden spatial-sheen transition-shadow duration-300 ${
        variantClassMap[variant]
      } ${
        glow ? "hover:shadow-[0_0_40px_rgba(16,185,129,0.22)]" : ""
      } ${className}`}
    >
      {/* 1. Dynamic Localized Specular Spotlight (Pointer Reactive) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-80 mix-blend-screen transition-opacity duration-300"
        style={{
          background: spotlightBg,
        }}
      />

      {/* 2. Static Specular Corner Glint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial-gradient-to-tr from-transparent via-emerald-500/5 to-white/5 opacity-40 mix-blend-overlay"
      />

      {/* 3. Protected content container: typography is strictly permanent */}
      <div className="relative z-10 spatial-content-protected w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
