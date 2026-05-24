import React from "react";

export function AmbientEnvironment() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* Moving Gradients */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-[0.03] filter blur-[100px]"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
          animation: "ambient-orbit 40s linear infinite",
        }}
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-[0.02] filter blur-[120px]"
        style={{
          background: "radial-gradient(circle, #0d9488 0%, transparent 70%)",
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
