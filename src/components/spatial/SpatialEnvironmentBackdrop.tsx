"use client";

import React from "react";

export function SpatialEnvironmentBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0, width: "100%", height: "1024px" }}
    >
      {/* 1. Global Atmospheric Depth Gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 50% at 75% 25%, rgba(8, 122, 81, 0.28) 0%, transparent 70%),
            radial-gradient(ellipse 55% 45% at 70% 65%, rgba(8, 122, 81, 0.22) 0%, transparent 65%),
            radial-gradient(ellipse 80% 40% at 50% 95%, rgba(40, 223, 160, 0.12) 0%, transparent 70%),
            linear-gradient(180deg, #000904 0%, #03120B 35%, #020E08 70%, #000904 100%)
          `,
        }}
      />

      {/* 2. SVG Architectural Window Frames & Misty Outdoor Mountain/Forest Views */}
      <svg
        viewBox="0 0 866 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="windowMullionGrad" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B2B1E" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#051911" stopOpacity="0.9" />
            <stop offset="1" stopColor="#03100B" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="mistyHazeGrad" x1="0" y1="0" x2="0" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1B4D36" stopOpacity="0.45" />
            <stop offset="0.7" stopColor="#0D3021" stopOpacity="0.7" />
            <stop offset="1" stopColor="#03120B" stopOpacity="0.95" />
          </linearGradient>

          <radialGradient id="floorReflectionGlow" cx="50%" cy="50%" r="50%">
            <stop stopColor="#28DFA0" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#087A51" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- SCENE 01 & 02: RIGHT-SIDE CURVED ARCHITECTURAL WINDOW --- */}
        {/* Sky / Mist Aperture inside window */}
        <path
          d="M 440 0 C 440 180, 500 320, 540 500 C 560 600, 580 700, 866 720 L 866 0 Z"
          fill="url(#mistyHazeGrad)"
          opacity="0.75"
        />

        {/* Misty Mountain Ridges visible through right window */}
        <path
          d="M 450 140 Q 560 90, 680 120 T 866 90 L 866 500 L 450 500 Z"
          fill="#06281D"
          opacity="0.6"
        />
        <path
          d="M 460 180 Q 580 140, 720 160 T 866 140 L 866 500 L 460 500 Z"
          fill="#041F16"
          opacity="0.75"
        />

        {/* Forest / Pine Tree Silhouettes outside window */}
        <path
          d="
            M 760 300 L 780 180 L 800 300 Z
            M 790 310 L 810 190 L 830 310 Z
            M 820 320 L 840 210 L 860 320 Z
            M 720 280 L 740 170 L 760 280 Z
            M 680 320 L 700 220 L 720 320 Z
          "
          fill="#083324"
          opacity="0.7"
        />

        {/* Architectural Glass Mullion / Curved Arch Border */}
        <path
          d="M 440 0 C 440 180, 500 320, 540 500 C 560 600, 580 700, 866 720"
          stroke="#104A33"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M 440 0 C 440 180, 500 320, 540 500 C 560 600, 580 700, 866 720"
          stroke="#28DFA0"
          strokeWidth="1.2"
          opacity="0.4"
        />

        {/* Secondary Vertical Window Mullion */}
        <line x1="720" y1="0" x2="720" y2="400" stroke="#0D3A27" strokeWidth="3" opacity="0.5" />
        <line x1="820" y1="0" x2="820" y2="500" stroke="#0D3A27" strokeWidth="3" opacity="0.5" />

        {/* --- SCENE 05: LEFT-SIDE ARCHED WINDOW / DOORWAY --- */}
        <path
          d="M 0 850 C 30 850, 45 880, 45 940 L 45 1024 L 0 1024 Z"
          fill="url(#mistyHazeGrad)"
          opacity="0.65"
        />
        {/* Mountain ridge through Scene 05 window */}
        <path
          d="M 0 900 Q 25 870, 45 890 L 45 1024 L 0 1024 Z"
          fill="#072C20"
          opacity="0.7"
        />
        {/* Arch frame */}
        <path
          d="M 0 850 C 30 850, 45 880, 45 940 L 45 1024"
          stroke="#104A33"
          strokeWidth="4"
          opacity="0.6"
        />

        {/* --- INDOOR BOTANICAL SILHOUETTES (Potted Monstera / Palm Plants) --- */}
        {/* Scene 01 Left Palm */}
        <path
          d="M 0 250 C 15 220, 30 180, 20 140 C 25 180, 35 210, 0 270 Z M 0 220 C 20 200, 35 170, 30 130 C 32 170, 40 200, 0 240 Z"
          fill="#052418"
          opacity="0.65"
        />
        {/* Scene 01 Right Plant (at edge of arch) */}
        <path
          d="M 866 280 C 850 250, 835 210, 845 170 C 840 210, 830 240, 866 300 Z M 866 250 C 846 230, 831 200, 836 160 C 834 200, 826 230, 866 270 Z"
          fill="#052418"
          opacity="0.6"
        />
        {/* Scene 03 Left Plant */}
        <path
          d="M 0 680 C 20 650, 35 610, 25 570 C 30 610, 40 640, 0 700 Z M 0 650 C 25 630, 40 600, 35 560 C 37 600, 45 630, 0 670 Z"
          fill="#052418"
          opacity="0.65"
        />
        {/* Scene 05 Right Plant */}
        <path
          d="M 866 960 C 848 930, 833 890, 843 850 C 838 890, 828 920, 866 980 Z"
          fill="#052418"
          opacity="0.6"
        />

        {/* --- GLOSSY OBSIDIAN FLOOR REFLECTIONS (Scene 05 Bottom) --- */}
        <ellipse cx="433" cy="1010" rx="360" ry="20" fill="url(#floorReflectionGlow)" />
        <ellipse cx="486" cy="1000" rx="90" ry="10" fill="rgba(40,223,160,0.12)" />
        <ellipse cx="688" cy="1000" rx="90" ry="10" fill="rgba(40,223,160,0.12)" />
      </svg>
    </div>
  );
}
