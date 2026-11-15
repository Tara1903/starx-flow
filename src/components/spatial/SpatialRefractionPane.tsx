"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface SpatialRefractionPaneProps {
  children: React.ReactNode;
  depth?: number; // z-axis offset in px (e.g., 20, 40, 60)
  className?: string;
  float?: boolean;
}

export function SpatialRefractionPane({
  children,
  depth = 30,
  className = "",
  float = false,
}: SpatialRefractionPaneProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      animate={
        float && !prefersReduced
          ? {
              y: [0, -8, 0],
              rotateZ: [0, 0.5, 0],
            }
          : undefined
      }
      transition={
        float && !prefersReduced
          ? {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : undefined
      }
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl spatial-glass-primary p-6 ${className}`}
    >
      {/* Specular Edge Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
      />

      {/* Permanently Protected Content */}
      <div className="relative z-10 spatial-content-protected">
        {children}
      </div>
    </motion.div>
  );
}
