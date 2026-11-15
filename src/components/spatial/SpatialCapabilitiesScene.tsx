"use client";

import React from "react";
import {
  MessageSquare,
  Bell,
  Star,
  Calendar,
  ClipboardList,
  Layers,
} from "lucide-react";

export function SpatialCapabilitiesScene() {
  const cards = [
    {
      id: "whatsapp",
      title: "24/7 WhatsApp\nBookings",
      icon: <MessageSquare className="w-4 h-4 text-[#28DFA0]" />,
      elevated: false,
    },
    {
      id: "noshow",
      title: "No-Show\nPrevention",
      icon: <Bell className="w-4 h-4 text-[#28DFA0]" />,
      elevated: false,
    },
    {
      id: "review",
      title: "Google\nReview Booster",
      icon: <Star className="w-4 h-4 text-[#28DFA0] fill-[#28DFA0]/20" />,
      elevated: true, // Elevated Z:+8px with brighter ambient glow
    },
    {
      id: "calendar",
      title: "Staff\nCalendar Sync",
      icon: <Calendar className="w-4 h-4 text-[#28DFA0]" />,
      elevated: false,
    },
    {
      id: "forms",
      title: "WhatsApp\nIntake Forms",
      icon: <ClipboardList className="w-4 h-4 text-[#28DFA0]" />,
      elevated: false,
    },
    {
      id: "crm",
      title: "Unified Service\nCRM & Audit Trail",
      icon: <Layers className="w-4 h-4 text-[#28DFA0]" />,
      elevated: false,
    },
  ];

  return (
    <section
      id="capabilities"
      className="relative w-full overflow-hidden bg-transparent"
      style={{
        height: "120px",
        maxHeight: "120px",
      }}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(8,122,81,0.14) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto w-full max-w-[866px] h-full spatial-content-protected flex flex-col justify-between"
        style={{ padding: "6px 0 4px 0" }}
      >
        {/* Eyebrow & H2 (Left offset 90px to match cards start) */}
        <div style={{ paddingLeft: "90px" }}>
          <div
            className="font-mono uppercase tracking-widest mb-0.5"
            style={{
              fontSize: "8.5px",
              color: "#28DFA0",
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >
            CORE CAPABILITIES
          </div>
          <h2
            className="font-editorial font-normal leading-none text-white"
            style={{
              fontSize: "19px",
              letterSpacing: "-0.015em",
            }}
          >
            Everything you need, working together.
          </h2>
        </div>

        {/* 6 Uniform Capability Cards Row (x: 90px, w: 102px, gap: 14px) */}
        <div
          className="relative flex items-center justify-center w-full"
          style={{ gap: "14px" }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className={`mat-secondary-glass rounded-xl flex flex-col items-center justify-center text-center p-1.5 transition-transform hover:scale-105 pointer-events-auto ${
                card.elevated ? "shadow-[0_0_20px_rgba(40,223,160,0.35)]" : ""
              }`}
              style={{
                width: "102px",
                height: "72px",
                transform: card.elevated ? "translateY(-4px)" : "none",
                border: card.elevated
                  ? "1px solid rgba(143,255,208,0.4)"
                  : "1px solid rgba(40,223,160,0.15)",
                background: card.elevated
                  ? "linear-gradient(145deg, rgba(16,50,32,0.65) 0%, rgba(8,26,16,0.85) 100%)"
                  : undefined,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                style={{
                  background: card.elevated ? "rgba(40,223,160,0.2)" : "rgba(8,122,81,0.25)",
                  border: "1px solid rgba(40,223,160,0.25)",
                }}
              >
                {card.icon}
              </div>
              <span
                className="font-sans text-[7.5px] font-semibold text-[#F0F5EF] leading-tight whitespace-pre-line"
              >
                {card.title}
              </span>
            </div>
          ))}
        </div>

        {/* Reflective Pedestal Shelf Line (x: 70px to 790px, width 720px) */}
        <div
          aria-hidden="true"
          className="mx-auto w-[720px] pointer-events-none"
          style={{
            height: "4px",
            background: "linear-gradient(90deg, transparent 0%, rgba(40,223,160,0.4) 20%, rgba(143,255,208,0.7) 50%, rgba(40,223,160,0.4) 80%, transparent 100%)",
            boxShadow: "0 0 10px rgba(40,223,160,0.5)",
            borderRadius: "2px",
          }}
        />
      </div>
    </section>
  );
}
