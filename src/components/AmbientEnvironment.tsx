import React from "react";

export function AmbientEnvironment() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      
      {/* ── Rear Plane: Slow drift, deep color ── */}
      <div 
        className="absolute w-[90vw] h-[90vw] rounded-full mix-blend-screen opacity-[0.025]"
        style={{
          top: "-30%",
          left: "-20%",
          background: "radial-gradient(circle, #10b981 0%, #064e3b 30%, transparent 70%)",
          filter: "blur(120px)",
          animation: "ambient-drift-slow 60s ease-in-out infinite",
        }}
      />
      <div 
        className="absolute w-[80vw] h-[80vw] rounded-full mix-blend-screen opacity-[0.018]"
        style={{
          bottom: "-30%",
          right: "-15%",
          background: "radial-gradient(circle, #0d9488 0%, #134e4a 30%, transparent 70%)",
          filter: "blur(140px)",
          animation: "ambient-drift-slow 70s ease-in-out infinite reverse",
        }}
      />

      {/* ── Mid Plane: Section glow, moderate drift ── */}
      <div 
        className="absolute w-[50vw] h-[50vw] rounded-full mix-blend-screen opacity-[0.03]"
        style={{
          top: "20%",
          left: "30%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 60%)",
          filter: "blur(100px)",
          animation: "ambient-drift-mid 35s ease-in-out infinite",
        }}
      />
      <div 
        className="absolute w-[40vw] h-[40vw] rounded-full mix-blend-screen opacity-[0.02]"
        style={{
          top: "60%",
          right: "10%",
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "ambient-drift-mid 40s ease-in-out infinite reverse",
        }}
      />

      {/* ── Foreground Accent Plane: Localized highlights, subtle ── */}
      <div 
        className="absolute w-[30vw] h-[30vw] rounded-full mix-blend-screen opacity-[0.015]"
        style={{
          top: "10%",
          right: "20%",
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.6) 0%, transparent 50%)",
          filter: "blur(60px)",
          animation: "ambient-orbit 45s linear infinite",
        }}
      />
      <div 
        className="absolute w-[20vw] h-[20vw] rounded-full mix-blend-screen opacity-[0.012]"
        style={{
          bottom: "15%",
          left: "15%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 50%)",
          filter: "blur(50px)",
          animation: "ambient-orbit-reverse 50s linear infinite",
        }}
      />
      
      {/* SVG Noise Texture Overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.02] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
