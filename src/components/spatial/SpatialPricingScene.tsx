"use client";

import React from "react";
import { ShieldCheck, Users, Layers, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

export function SpatialPricingScene() {
  const { openSignup } = useUIStore();

  const trustBadges = [
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#28DFA0]" />,
      title: "Zero Double-Booking",
      subtitle: "Guarantee",
    },
    {
      icon: <Users className="w-3.5 h-3.5 text-[#28DFA0]" />,
      title: "100% Direct",
      subtitle: "Client Ownership",
    },
    {
      icon: <Layers className="w-3.5 h-3.5 text-[#28DFA0]" />,
      title: "Predictable",
      subtitle: "Flat-Rate Pricing",
    },
  ];

  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-transparent"
      style={{
        height: "162px",
        maxHeight: "162px",
      }}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 85% at 50% 100%, rgba(8,122,81,0.2) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto w-full max-w-[866px] h-full spatial-content-protected flex items-center justify-between"
        style={{ padding: "0 40px" }}
      >
        {/* LEFT COLUMN: Eyebrow + H2 + Horizontal Trust Badges */}
        <div
          className="flex flex-col justify-between h-full"
          style={{ width: "340px", paddingTop: "12px", paddingBottom: "10px" }}
        >
          <div>
            <div
              className="font-mono uppercase tracking-widest mb-1"
              style={{
                fontSize: "8.5px",
                color: "#28DFA0",
                letterSpacing: "0.22em",
                fontWeight: 600,
              }}
            >
              SIMPLE, PREDICTABLE PRICING
            </div>
            <h2
              className="font-editorial font-normal leading-[1.08] text-white"
              style={{
                fontSize: "23px",
                letterSpacing: "-0.015em",
              }}
            >
              <span>Choose the right plan</span>
              <br />
              <span>for your business.</span>
            </h2>
          </div>

          {/* 3 Horizontal Trust Badges */}
          <div className="flex items-center gap-5">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <div className="mt-0.5">{badge.icon}</div>
                <div className="font-sans text-[7.5px] text-[#B8C9BD] leading-tight">
                  <div className="font-semibold text-white whitespace-nowrap">{badge.title}</div>
                  <div className="whitespace-nowrap">{badge.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Metallic Torus Ring + 2 Pricing Cards */}
        <div
          className="relative flex items-center"
          style={{ gap: "18px", zIndex: 5 }}
        >
          {/* Angled Metallic / Glass Torus Ring SVG behind Solo Card */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              left: "-36px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "78px",
              height: "76px",
              zIndex: 0,
            }}
          >
            <svg viewBox="0 0 78 76" fill="none" className="w-full h-full">
              <defs>
                <linearGradient id="torusGradV2" x1="0" y1="0" x2="78" y2="76" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="0.2" stopColor="#8FFFD0" stopOpacity="0.8" />
                  <stop offset="0.6" stopColor="#28DFA0" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#087A51" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <ellipse
                cx="39"
                cy="38"
                rx="34"
                ry="32"
                stroke="url(#torusGradV2)"
                strokeWidth="4.5"
                transform="rotate(-25 39 38)"
                style={{ filter: "drop-shadow(0 0 16px rgba(40,223,160,0.45))" }}
              />
            </svg>
          </div>

          {/* Solo / Small Business Card ($29) (184x122px) */}
          <div
            className="mat-primary-glass rounded-2xl flex flex-col justify-between p-3.5 transition-transform hover:scale-[1.02] pointer-events-auto"
            style={{
              width: "184px",
              height: "122px",
              zIndex: 2,
              border: "1px solid rgba(143,255,208,0.32)",
              boxShadow: "0 16px 36px rgba(0,0,0,0.7), 0 0 20px rgba(40,223,160,0.18)",
            }}
          >
            <div>
              <div className="text-[10px] font-bold text-white mb-0.5">
                Solo / Small Business
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="font-editorial text-[24px] font-bold text-white">$29</span>
                <span className="text-[8.5px] text-[#B8C9BD]">/ month</span>
              </div>
              <p className="text-[7.5px] text-[#B8C9BD] leading-tight">
                Everything you need to run bookings, customers, and operations in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={openSignup}
              className="w-full rounded-full font-bold text-[9px] flex items-center justify-center gap-1 transition-all shadow-[0_0_12px_rgba(40,223,160,0.3)] hover:shadow-[0_0_18px_rgba(40,223,160,0.5)]"
              style={{
                background: "#28DFA0",
                color: "#000904",
                height: "24px",
              }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Multi-Provider Group Card ($99) (184x122px) */}
          <div
            className="mat-primary-glass rounded-2xl flex flex-col justify-between p-3.5 transition-transform hover:scale-[1.02] pointer-events-auto"
            style={{
              width: "184px",
              height: "122px",
              zIndex: 2,
              border: "1px solid rgba(143,255,208,0.32)",
              boxShadow: "0 16px 36px rgba(0,0,0,0.7), 0 0 20px rgba(40,223,160,0.18)",
            }}
          >
            <div>
              <div className="text-[10px] font-bold text-white mb-0.5">
                Multi-Provider Group
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="font-editorial text-[24px] font-bold text-white">$99</span>
                <span className="text-[8.5px] text-[#B8C9BD]">/ month</span>
              </div>
              <p className="text-[7.5px] text-[#B8C9BD] leading-tight">
                Built for teams with multiple providers, calendars, and higher booking volume.
              </p>
            </div>

            <button
              type="button"
              onClick={openSignup}
              className="w-full rounded-full font-bold text-[9px] flex items-center justify-center gap-1 transition-all shadow-[0_0_12px_rgba(40,223,160,0.3)] hover:shadow-[0_0_18px_rgba(40,223,160,0.5)]"
              style={{
                background: "#28DFA0",
                color: "#000904",
                height: "24px",
              }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* High-Gloss Obsidian Floor Sheen at Bottom */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-4 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(40,223,160,0.08) 60%, rgba(8,122,81,0.15) 100%)",
        }}
      />
    </section>
  );
}
