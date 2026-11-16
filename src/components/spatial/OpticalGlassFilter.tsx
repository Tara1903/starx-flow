"use client";

import React from "react";

/**
 * OpticalGlassFilter
 * 
 * Provides calibrated SVG optical filters for live HTML DOM refraction
 * and volumetric frosted glass micro-grain.
 * 
 * Calibrated for luxury emerald liquid glass (StarX Flow Stage 1-4):
 * - #starx-glass-refraction: Subtle edge displacement map (scale=4)
 * - #starx-glass-grain: Tactile microscopic volume tooth
 */
export function OpticalGlassFilter() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden"
    >
      <defs>
        {/* Subtle, crystal-clear optical lens displacement (Refraction = 0.35) */}
        <filter
          id="starx-glass-refraction"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.025"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4.5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feBlend in="SourceGraphic" in2="displaced" mode="normal" />
        </filter>

        {/* Microscopic Volumetric Frost Grain (Frost = 0.50) */}
        <filter
          id="starx-glass-grain"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
            result="grain"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.035 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
