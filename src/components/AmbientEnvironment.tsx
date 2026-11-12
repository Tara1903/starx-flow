"use client";

import React from "react";

/**
 * Ultra-lightweight living atmospheric backdrop.
 * Restores StarX Flow's pure black (`#000000`) canvas with ultra-subtle (2-3%)
 * emerald ambient depth using pre-feathered CSS radial gradients inside a GPU-isolated
 * layer — zero `filter: blur(...)` or SVG `<feTurbulence>` compositor stalls at 100%-250% zoom.
 */
export function AmbientEnvironment() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black"
      style={{ contain: "strict" }}
      aria-hidden="true"
    >
      {/* Top-Left Deep Emerald Accent (~2.5% peak) */}
      <div
        className="absolute w-[90vw] h-[90vw] rounded-full opacity-[0.025]"
        style={{
          top: "-30%",
          left: "-20%",
          background:
            "radial-gradient(circle, #10b981 0%, #064e3b 35%, transparent 72%)",
        }}
      />

      {/* Bottom-Right Deep Teal Accent (~1.8% peak) */}
      <div
        className="absolute w-[80vw] h-[80vw] rounded-full opacity-[0.018]"
        style={{
          bottom: "-30%",
          right: "-15%",
          background:
            "radial-gradient(circle, #0d9488 0%, #134e4a 35%, transparent 72%)",
        }}
      />

      {/* Mid-Plane Subtle Emerald Depth (~3% peak) */}
      <div
        className="absolute w-[50vw] h-[50vw] rounded-full opacity-[0.03]"
        style={{
          top: "20%",
          left: "30%",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 65%)",
        }}
      />

      {/* Lower-Right Subtle Accent (~2% peak) */}
      <div
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-[0.02]"
        style={{
          top: "60%",
          right: "10%",
          background:
            "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 65%)",
        }}
      />

      {/* Upper-Right Minimal Highlight (~1.5% peak) */}
      <div
        className="absolute w-[30vw] h-[30vw] rounded-full opacity-[0.015]"
        style={{
          top: "10%",
          right: "20%",
          background:
            "radial-gradient(circle, rgba(52, 211, 153, 0.6) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
