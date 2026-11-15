"use client";

import React from "react";
import {
  MessageSquare,
  Calendar,
  Users,
  ArrowRight,
  Play,
  ChevronDown,
  Bot,
  User,
  Check,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

export function SpatialHero() {
  const { openSignup, openDemo } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  const slots = [
    { time: "Tue, 10:00 AM", active: true },
    { time: "Tue, 2:00 PM", active: false },
    { time: "Wed, 11:00 AM", active: false },
  ];

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-transparent text-white"
      style={{
        height: "272px",
        maxHeight: "272px",
      }}
    >
      {/* Ambient Radial Illumination */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 65% 50%, rgba(8,122,81,0.3) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 20% 50%, rgba(40,223,160,0.1) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto w-full max-w-[866px] h-full spatial-content-protected flex"
        style={{ padding: "0 40px" }}
      >
        {/* LEFT COLUMN: Headings, CTAs, Feature Strip */}
        <div
          className="flex flex-col justify-start"
          style={{ width: "340px", paddingTop: "14px", zIndex: 10 }}
        >
          {/* Eyebrow */}
          <div
            className="font-mono uppercase tracking-widest mb-1"
            style={{
              fontSize: "8.5px",
              color: "#28DFA0",
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >
            THE INTELLIGENT BUSINESS ENVIRONMENT
          </div>

          {/* H1 Heading */}
          <h1
            className="font-editorial font-normal leading-[1.04] mb-2 text-white"
            style={{
              fontSize: "35px",
              letterSpacing: "-0.015em",
            }}
          >
            <span>Run Your Business</span>
            <br />
            <span className="text-gradient-reference">on One Flow</span>
          </h1>

          {/* Subtitle */}
          <p
            className="leading-[1.38] mb-3"
            style={{
              fontSize: "11px",
              color: "#B8C9BD",
              maxWidth: "295px",
            }}
          >
            AI-powered communication, bookings, and operations — connected in one intelligent environment.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5 mb-3">
            <button
              type="button"
              onClick={isLoggedIn ? () => (window.location.href = "/dashboard") : openSignup}
              className="rounded-full font-bold text-[11px] flex items-center gap-1.5 transition-transform hover:scale-[1.02] shadow-[0_0_16px_rgba(40,223,160,0.4)]"
              style={{
                background: "#28DFA0",
                color: "#000904",
                padding: "6px 15px",
                height: "28px",
              }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={openDemo}
              className="rounded-full font-medium text-[11px] flex items-center gap-1.5 transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                color: "#F0F5EF",
                padding: "6px 13px",
                height: "28px",
              }}
            >
              <span>See It in Action</span>
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
          </div>

          {/* Feature Strip */}
          <div
            className="flex items-center gap-2.5"
            style={{ fontSize: "9.5px", color: "#B8C9BD" }}
          >
            <div className="flex items-center gap-1">
              <MessageSquare className="w-2.5 h-2.5 text-[#28DFA0]" />
              <span>WhatsApp Bookings</span>
            </div>
            <span style={{ color: "#19643D" }}>|</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-[#28DFA0]" />
              <span>Scheduling</span>
            </div>
            <span style={{ color: "#19643D" }}>|</span>
            <div className="flex items-center gap-1">
              <Users className="w-2.5 h-2.5 text-[#28DFA0]" />
              <span>Customer CRM</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Arch, Pedestal, Calendar, WhatsApp & Capsules */}
        <div
          className="relative flex-1 h-full"
          style={{ perspective: "1200px", marginLeft: "-10px" }}
        >
          {/* Architectural Window Background Landscape (Misty Trees & Ridges) */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none overflow-hidden rounded-t-[140px]"
            style={{
              top: "12px",
              left: "18px",
              width: "372px",
              height: "220px",
              zIndex: 1,
              background: "linear-gradient(180deg, #051A12 0%, #020C08 85%)",
              opacity: 0.7,
            }}
          >
            <svg viewBox="0 0 372 220" fill="none" className="w-full h-full">
              <path
                d="M0 160 Q 90 120 180 145 T 372 130 L 372 220 L 0 220 Z"
                fill="#07281D"
                opacity="0.6"
              />
              <path
                d="M0 180 Q 120 150 240 170 T 372 160 L 372 220 L 0 220 Z"
                fill="#052016"
                opacity="0.85"
              />
              <path
                d="M 290 220 L 310 130 L 330 220 Z M 320 220 L 340 140 L 360 220 Z M 30 220 L 50 150 L 70 220 Z"
                fill="#093828"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Monumental Glass Arch SVG Loop */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              top: "8px",
              left: "10px",
              width: "386px",
              height: "232px",
              zIndex: 2,
            }}
          >
            <svg
              viewBox="0 0 386 232"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 0 30px rgba(40,223,160,0.4))" }}
            >
              <defs>
                <linearGradient id="heroArchGradV3" x1="193" y1="0" x2="193" y2="232" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="0.15" stopColor="#8FFFD0" stopOpacity="0.95" />
                  <stop offset="0.6" stopColor="#28DFA0" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#087A51" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M 20 232 L 20 95 C 20 18 366 18 366 95 L 366 232"
                stroke="url(#heroArchGradV3)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 34 232 L 34 100 C 34 32 352 32 352 100 L 352 232"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.2"
              />
            </svg>
          </div>

          {/* Concentric Illuminated Pedestal Base (Floor Rings) */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{ bottom: "2px", left: "0px", zIndex: 3 }}
          >
            <svg width="406" height="50" viewBox="0 0 406 50" fill="none">
              <ellipse cx="203" cy="38" rx="190" ry="10" fill="rgba(40,223,160,0.2)" />
              <ellipse cx="203" cy="36" rx="180" ry="8" stroke="#28DFA0" strokeOpacity="0.6" strokeWidth="1.8" />
              <ellipse cx="203" cy="32" rx="150" ry="6" stroke="#8FFFD0" strokeOpacity="0.45" strokeWidth="1.2" fill="rgba(8,122,81,0.25)" />
              <ellipse cx="203" cy="28" rx="116" ry="4.5" stroke="#8FFFD0" strokeOpacity="0.35" strokeWidth="1" fill="rgba(12,40,25,0.4)" />
            </svg>
          </div>

          {/* Plane 2: Calendar Slab (Tilted 3D Tablet) */}
          <div
            className="mat-primary-glass rounded-xl overflow-hidden pointer-events-auto absolute"
            style={{
              width: "214px",
              height: "162px",
              top: "20px",
              left: "120px",
              transform: "perspective(1200px) rotateX(4deg) rotateY(-8deg)",
              zIndex: 5,
              border: "1px solid rgba(143,255,208,0.32)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.7), 0 0 24px rgba(40,223,160,0.2)",
            }}
          >
            {/* Header: Bookings */}
            <div
              className="flex items-center justify-between px-3 py-1.5"
              style={{
                background: "rgba(8,122,81,0.45)",
                borderBottom: "1px solid rgba(40,223,160,0.2)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[#28DFA0]" />
                <span className="text-[10px] font-semibold text-[#8FFFD0]">Bookings</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#28DFA0] shadow-[0_0_6px_#28DFA0]" />
            </div>

            {/* Calendar Month Grid */}
            <div className="p-2.5">
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[7.5px] text-[#B8C9BD] mb-1">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[7.5px]">
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1;
                  const isActive = day === 15 || day === 16;
                  const isPast = day < 8;
                  return (
                    <div
                      key={day}
                      className="py-0.5 rounded flex items-center justify-center font-medium"
                      style={{
                        background: isActive ? "#28DFA0" : "transparent",
                        color: isActive ? "#000904" : isPast ? "#506A5C" : "#F0F5EF",
                        fontWeight: isActive ? 700 : 500,
                        boxShadow: isActive ? "0 0 8px rgba(40,223,160,0.6)" : "none",
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Plane 3: WhatsApp Dialogue Card (Floating in front) */}
          <div
            className="mat-crystal-glass rounded-xl overflow-hidden pointer-events-auto absolute"
            style={{
              width: "144px",
              height: "140px",
              top: "80px",
              left: "48px",
              zIndex: 8,
              border: "1px solid rgba(143,255,208,0.4)",
              boxShadow: "0 24px 50px rgba(0,0,0,0.75), 0 0 24px rgba(40,223,160,0.25)",
            }}
          >
            {/* WhatsApp Header */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5"
              style={{
                background: "rgba(8,122,81,0.65)",
                borderBottom: "1px solid rgba(40,223,160,0.25)",
              }}
            >
              <MessageSquare className="w-3 h-3 text-[#28DFA0]" />
              <span className="text-[9px] font-bold text-white tracking-tight">WhatsApp</span>
            </div>

            {/* Chat Messages */}
            <div className="p-2 space-y-1.5">
              <div
                className="rounded-lg rounded-tl-xs px-2 py-1 text-[8.5px] leading-snug font-medium"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  maxWidth: "92%",
                }}
              >
                Hi! Can I book an appointment for this week?
              </div>

              <div
                className="rounded-lg rounded-tr-xs px-2 py-1 text-[8px] leading-snug"
                style={{
                  background: "rgba(8,122,81,0.52)",
                  border: "1px solid rgba(40,223,160,0.3)",
                  color: "#F0F5EF",
                }}
              >
                <p className="text-[#8FFFD0] font-semibold mb-1">Sure! Here are the available slots:</p>
                <div className="space-y-0.5">
                  {slots.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded px-1.5 py-0.5 flex items-center justify-between font-bold"
                      style={{
                        background: s.active ? "#28DFA0" : "rgba(255,255,255,0.08)",
                        color: s.active ? "#000904" : "#B8C9BD",
                        fontSize: "7.5px",
                      }}
                    >
                      <span>• {s.time}</span>
                      {s.active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Capsule (Top Right) */}
          <div
            className="mat-crystal-glass rounded-xl flex flex-col justify-center px-2.5 absolute"
            style={{
              width: "112px",
              height: "52px",
              top: "66px",
              right: "0px",
              zIndex: 9,
              border: "1px solid rgba(143,255,208,0.35)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.6), 0 0 18px rgba(40,223,160,0.22)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-4 h-4 rounded bg-[#28DFA0]/20 border border-[#28DFA0]/40 flex items-center justify-center">
                <Bot className="w-2.5 h-2.5 text-[#28DFA0]" />
              </div>
              <span className="text-[9.5px] font-bold text-white">AI Assistant</span>
            </div>
            <div className="text-[8.5px] font-semibold text-[#28DFA0] flex items-center gap-1">
              <span>Booking confirmed 🗓️</span>
            </div>
          </div>

          {/* Customer Capsule (Bottom Right) */}
          <div
            className="mat-crystal-glass rounded-xl flex flex-col justify-center px-2.5 absolute"
            style={{
              width: "112px",
              height: "52px",
              top: "128px",
              right: "0px",
              zIndex: 9,
              border: "1px solid rgba(143,255,208,0.35)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.6), 0 0 18px rgba(40,223,160,0.22)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded bg-white/10 border border-white/20 flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-[#B8C9BD]" />
              </div>
              <span className="text-[9.5px] font-bold text-white">Customer</span>
            </div>
            <div className="text-[8px] text-[#B8C9BD]">New appointment</div>
            <div className="text-[8px] font-mono font-semibold text-[#28DFA0]">• Tue, 10:00 AM</div>
          </div>
        </div>
      </div>

      {/* Centered Scroll Prompt at Bottom */}
      <div
        className="absolute bottom-1 inset-x-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 12 }}
      >
        <span
          className="font-mono uppercase text-[7.5px] tracking-[0.25em] text-[#B8C9BD] opacity-80"
          style={{ marginBottom: "1px" }}
        >
          SCROLL TO EXPLORE
        </span>
        <ChevronDown className="w-3 h-3 text-[#28DFA0]" />
      </div>
    </section>
  );
}
