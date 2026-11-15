"use client";

import React from "react";
import {
  MessageSquare,
  Calendar,
  Layers,
  UserX,
  Users,
  BarChart3,
  RefreshCw,
  Clock,
} from "lucide-react";

export function SpatialConnectedOperations() {
  const problemTiles = [
    {
      id: "missed",
      title: "Missed\nenquiries",
      icon: <MessageSquare className="w-4 h-4 text-[#28DFA0]" />,
      left: "14px",
      top: "22px",
      width: "72px",
      height: "70px",
      tilt: "rotate(-3deg)",
    },
    {
      id: "manual",
      title: "Manual\nbookings",
      icon: <Calendar className="w-4 h-4 text-[#28DFA0]" />,
      left: "98px",
      top: "6px",
      width: "76px",
      height: "74px",
      tilt: "rotate(2deg)",
    },
    {
      id: "scheduling",
      title: "Scheduling\nconflicts",
      icon: <Layers className="w-4 h-4 text-[#28DFA0]" />,
      left: "186px",
      top: "28px",
      width: "74px",
      height: "70px",
      tilt: "rotate(-2deg)",
    },
    {
      id: "noshows",
      title: "No-shows",
      icon: <UserX className="w-4 h-4 text-[#28DFA0]" />,
      left: "272px",
      top: "16px",
      width: "68px",
      height: "64px",
      tilt: "rotate(4deg)",
    },
  ];

  return (
    <section
      id="connected-operations"
      className="relative w-full overflow-hidden bg-transparent"
      style={{
        height: "218px",
        maxHeight: "218px",
      }}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 75% 55%, rgba(8,122,81,0.22) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 50%, rgba(4,20,14,0.6) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto w-full max-w-[866px] h-full spatial-content-protected flex items-center justify-between"
        style={{ padding: "0 24px" }}
      >
        {/* LEFT CHAMBER: The Daily Challenge (Fragmented Shards) */}
        <div
          className="flex flex-col justify-start h-full"
          style={{ width: "360px", paddingTop: "14px", zIndex: 5 }}
        >
          {/* Eyebrow */}
          <div
            className="font-mono uppercase tracking-widest mb-1"
            style={{
              fontSize: "9px",
              color: "#28DFA0",
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >
            THE DAILY CHALLENGE
          </div>

          {/* Heading */}
          <h2
            className="font-editorial font-normal leading-[1.08] mb-2 text-white"
            style={{
              fontSize: "23px",
              letterSpacing: "-0.015em",
            }}
          >
            <span>Running a business</span>
            <br />
            <span>shouldn't feel fragmented.</span>
          </h2>

          {/* Shattered Obsidian polygon base & 4 tilted glass problem tiles */}
          <div
            className="relative flex-1"
            style={{ width: "100%", minHeight: "110px", marginTop: "4px" }}
          >
            {/* Dark polygonal rock shards SVG base */}
            <svg
              viewBox="0 0 350 70"
              fill="none"
              className="absolute bottom-0 left-0 w-full pointer-events-none"
              style={{ height: "60px", zIndex: 1 }}
            >
              <polygon
                points="10,65 50,35 110,50 170,25 240,45 300,20 340,65"
                fill="#051911"
                stroke="rgba(40,223,160,0.12)"
                strokeWidth="1"
              />
              <polygon
                points="0,70 60,42 120,58 190,32 260,52 320,30 350,70"
                fill="#020E08"
                stroke="rgba(40,223,160,0.06)"
                strokeWidth="0.8"
              />
            </svg>

            {/* 4 Floating Problem Glass Tiles */}
            {problemTiles.map((tile) => (
              <div
                key={tile.id}
                className="absolute mat-secondary-glass rounded-xl flex flex-col items-center justify-center p-1.5 text-center transition-transform hover:scale-105 pointer-events-auto"
                style={{
                  left: tile.left,
                  top: tile.top,
                  width: tile.width,
                  height: tile.height,
                  transform: tile.tilt,
                  zIndex: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(143,255,208,0.15)",
                }}
              >
                <div className="mb-1">{tile.icon}</div>
                <span
                  className="font-sans text-[8px] text-[#B8C9BD] leading-tight font-medium whitespace-pre-line"
                >
                  {tile.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Sweeping S-Curved Glass Transition Ribbon */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 pointer-events-none"
          style={{
            left: "348px",
            width: "160px",
            height: "218px",
            zIndex: 4,
          }}
        >
          <svg
            viewBox="0 0 160 218"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="sRibbonGrad" x1="0" y1="0" x2="160" y2="218" gradientUnits="userSpaceOnUse">
                <stop stopColor="#28DFA0" stopOpacity="0.75" />
                <stop offset="0.5" stopColor="#087A51" stopOpacity="0.3" />
                <stop offset="1" stopColor="#8FFFD0" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Sweeping S-wave curved path */}
            <path
              d="M 120 0 C 80 50, 40 100, 70 150 C 90 180, 110 200, 60 218"
              stroke="url(#sRibbonGrad)"
              strokeWidth="2.5"
              fill="none"
              style={{ filter: "drop-shadow(0 0 14px rgba(40,223,160,0.4))" }}
            />
            {/* Secondary translucent wave fill */}
            <path
              d="M 135 0 C 95 50, 55 100, 85 150 C 105 180, 125 200, 75 218 L 160 218 L 160 0 Z"
              fill="rgba(8,122,81,0.08)"
            />
          </svg>
        </div>

        {/* RIGHT CHAMBER: The StarX Flow Way (Orb + 6 Orbital Nodes) */}
        <div
          className="flex flex-col justify-start h-full"
          style={{ width: "380px", paddingTop: "14px", zIndex: 5 }}
        >
          {/* Eyebrow */}
          <div
            className="font-mono uppercase tracking-widest mb-1"
            style={{
              fontSize: "9px",
              color: "#28DFA0",
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >
            THE STARX FLOW WAY
          </div>

          {/* Heading */}
          <h2
            className="font-editorial font-normal leading-[1.08] mb-1 text-white"
            style={{
              fontSize: "23px",
              letterSpacing: "-0.015em",
            }}
          >
            <span>From scattered tasks to</span>
            <br />
            <span>a connected operation.</span>
          </h2>

          {/* Central Orb + Concentric Saucer + 6 Orbital Nodes */}
          <div
            className="relative flex-1"
            style={{ width: "100%", minHeight: "125px" }}
          >
            {/* Dashed Elliptical Orbital Path SVG */}
            <svg
              viewBox="0 0 360 120"
              fill="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {/* Concentric Saucer Rings Under Orb */}
              <ellipse cx="180" cy="80" rx="65" ry="14" fill="rgba(8,122,81,0.2)" stroke="#28DFA0" strokeWidth="1" strokeOpacity="0.4" />
              <ellipse cx="180" cy="82" rx="80" ry="17" stroke="#8FFFD0" strokeWidth="0.8" strokeOpacity="0.25" />

              {/* Dashed Orbit Ring */}
              <ellipse
                cx="180"
                cy="62"
                rx="115"
                ry="46"
                stroke="#28DFA0"
                strokeWidth="1"
                strokeDasharray="3 4"
                strokeOpacity="0.45"
              />
            </svg>

            {/* Central Luminous StarX Glass Orb (78x78px) */}
            <div
              className="absolute rounded-full flex items-center justify-center pointer-events-auto"
              style={{
                left: "141px",
                top: "23px",
                width: "78px",
                height: "78px",
                zIndex: 6,
                background: "radial-gradient(circle at 35% 35%, #8FFFD0 0%, #28DFA0 30%, #087A51 65%, #020C08 100%)",
                boxShadow: "0 0 35px rgba(40,223,160,0.55), inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -4px 8px rgba(0,0,0,0.6)",
                border: "1px solid rgba(143,255,208,0.5)",
              }}
            >
              {/* Central Brilliant 4-Pointed Star */}
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white drop-shadow-[0_0_8px_#FFFFFF]">
                <path
                  d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>

            {/* 6 Orbital Nodes positioned around the ellipse */}
            {/* 1. Bookings (Top) */}
            <div
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{ left: "158px", top: "0px", zIndex: 7 }}
            >
              <div className="w-7 h-7 rounded-full bg-[#05251B] border border-[#28DFA0]/50 flex items-center justify-center shadow-[0_0_10px_rgba(40,223,160,0.3)]">
                <Calendar className="w-3.5 h-3.5 text-[#28DFA0]" />
              </div>
              <span className="text-[7.5px] font-semibold text-[#8FFFD0] mt-0.5">Bookings</span>
            </div>

            {/* 2. Customers (Top Right) */}
            <div
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{ left: "260px", top: "16px", zIndex: 7 }}
            >
              <div className="w-7 h-7 rounded-full bg-[#05251B] border border-[#28DFA0]/50 flex items-center justify-center shadow-[0_0_10px_rgba(40,223,160,0.3)]">
                <Users className="w-3.5 h-3.5 text-[#28DFA0]" />
              </div>
              <span className="text-[7.5px] font-semibold text-[#8FFFD0] mt-0.5">Customers</span>
            </div>

            {/* 3. Operations (Mid Right) */}
            <div
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{ left: "288px", top: "50px", zIndex: 7 }}
            >
              <div className="w-7 h-7 rounded-full bg-[#05251B] border border-[#28DFA0]/50 flex items-center justify-center shadow-[0_0_10px_rgba(40,223,160,0.3)]">
                <BarChart3 className="w-3.5 h-3.5 text-[#28DFA0]" />
              </div>
              <span className="text-[7.5px] font-semibold text-[#8FFFD0] mt-0.5">Operations</span>
            </div>

            {/* 4. Automation (Bottom Right) */}
            <div
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{ left: "250px", top: "86px", zIndex: 7 }}
            >
              <div className="w-7 h-7 rounded-full bg-[#05251B] border border-[#28DFA0]/50 flex items-center justify-center shadow-[0_0_10px_rgba(40,223,160,0.3)]">
                <RefreshCw className="w-3.5 h-3.5 text-[#28DFA0]" />
              </div>
              <span className="text-[7.5px] font-semibold text-[#8FFFD0] mt-0.5">Automation</span>
            </div>

            {/* 5. Scheduling (Bottom Left) */}
            <div
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{ left: "95px", top: "86px", zIndex: 7 }}
            >
              <div className="w-7 h-7 rounded-full bg-[#05251B] border border-[#28DFA0]/50 flex items-center justify-center shadow-[0_0_10px_rgba(40,223,160,0.3)]">
                <Clock className="w-3.5 h-3.5 text-[#28DFA0]" />
              </div>
              <span className="text-[7.5px] font-semibold text-[#8FFFD0] mt-0.5">Scheduling</span>
            </div>

            {/* 6. Communication (Mid Left) */}
            <div
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{ left: "55px", top: "50px", zIndex: 7 }}
            >
              <div className="w-7 h-7 rounded-full bg-[#05251B] border border-[#28DFA0]/50 flex items-center justify-center shadow-[0_0_10px_rgba(40,223,160,0.3)]">
                <MessageSquare className="w-3.5 h-3.5 text-[#28DFA0]" />
              </div>
              <span className="text-[7.5px] font-semibold text-[#8FFFD0] mt-0.5">Communication</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
