"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface SpatialAtmosphereProps {
  intensity?: "normal" | "immersive";
  className?: string;
}

export function SpatialAtmosphere({
  intensity = "immersive",
  className = "",
}: SpatialAtmosphereProps) {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020403] ${className}`}
    >
      {/* 1. Deep Spatial Radial Glow Top-Center */}
      <div
        className="absolute -top-[250px] left-1/2 -translate-x-1/2 w-[1200px] h-[750px] rounded-[100%] opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.08) 35%, rgba(2, 4, 3, 0) 70%)",
        }}
      />

      {/* 2. Floating Atmospheric Emerald Radiance Orbs */}
      {mounted && !prefersReduced && intensity === "immersive" && (
        <>
          <motion.div
            animate={{
              x: [0, 40, -30, 0],
              y: [0, -35, 20, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[20%] -left-[100px] w-[600px] h-[600px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 65%)",
            }}
          />

          <motion.div
            animate={{
              x: [0, -45, 30, 0],
              y: [0, 40, -25, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute top-[45%] -right-[150px] w-[650px] h-[650px] rounded-full opacity-35"
            style={{
              background:
                "radial-gradient(circle, rgba(52, 211, 153, 0.14) 0%, transparent 65%)",
            }}
          />
        </>
      )}

      {/* 3. Subtle Perspective Grid Floor */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16, 185, 129, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, #000 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, #000 30%, transparent 75%)",
        }}
      />

      {/* 4. Fine Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
