"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface SpatialScrollSceneProps {
  id?: string;
  sceneNumber: string;
  children: React.ReactNode;
  className?: string;
  ambientBeam?: "top" | "center" | "bottom" | "none";
}

export function SpatialScrollScene({
  id,
  sceneNumber,
  children,
  className = "",
  ambientBeam = "none",
}: SpatialScrollSceneProps) {
  const prefersReduced = useReducedMotion();

  const beamMap = {
    top: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.14) 0%, transparent 60%)",
    center: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.12) 0%, transparent 65%)",
    bottom: "radial-gradient(circle at 50% 100%, rgba(16,185,129,0.15) 0%, transparent 60%)",
    none: "none",
  };

  return (
    <section
      id={id}
      data-testid={`spatial-scene-${sceneNumber}`}
      data-scene={sceneNumber}
      className={`relative w-full py-20 sm:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden ${className}`}
    >
      {/* Environmental Ambient Light Node */}
      {ambientBeam !== "none" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none -z-10"
          style={{ background: beamMap[ambientBeam] }}
        />
      )}

      {/* Main Continuous Scene Architecture */}
      <div className="max-w-7xl mx-auto w-full relative z-10 spatial-content-protected">
        {children}
      </div>
    </section>
  );
}
