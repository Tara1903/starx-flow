"use client";

import React from "react";
import {
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function SpatialDemoChamber() {
  const tabs = [
    {
      id: "whatsapp",
      label: "WhatsApp Bookings",
      icon: <MessageSquare className="w-3 h-3" />,
      active: true,
    },
    {
      id: "ai-comm",
      label: "AI Communication",
      icon: <Sparkles className="w-3 h-3" />,
      active: false,
    },
    {
      id: "scheduling",
      label: "Scheduling",
      icon: <Calendar className="w-3 h-3" />,
      active: false,
    },
    {
      id: "crm",
      label: "CRM & History",
      icon: <Layers className="w-3 h-3" />,
      active: false,
    },
  ];

  const slots = [
    { time: "Tue, 10:00 AM", active: true },
    { time: "Tue, 2:00 PM", active: false },
    { time: "Wed, 11:00 AM", active: false },
  ];

  return (
    <section
      id="demo"
      className="relative w-full overflow-hidden bg-transparent"
      style={{
        height: "204px",
        maxHeight: "204px",
      }}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 55% 55%, rgba(8,122,81,0.2) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto w-full max-w-[866px] h-full spatial-content-protected flex flex-col justify-between"
        style={{ padding: "10px 40px" }}
      >
        {/* Top Bar: Eyebrow + H2 on left, 4-Pill Switcher on right */}
        <div className="flex items-start justify-between w-full" style={{ height: "46px" }}>
          <div>
            <div
              className="font-mono uppercase tracking-widest mb-0.5"
              style={{
                fontSize: "8.5px",
                color: "#28DFA0",
                letterSpacing: "0.22em",
                fontWeight: 600,
              }}
            >
              SEE IT IN ACTION
            </div>
            <h2
              className="font-editorial font-normal leading-[1.05] text-white"
              style={{
                fontSize: "22px",
                letterSpacing: "-0.015em",
              }}
            >
              <span>Real workflows.</span>{" "}
              <span>Real business impact.</span>
            </h2>
          </div>

          {/* 4-Category Switcher Pill Bar (Single-line pills) */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold whitespace-nowrap transition-all pointer-events-auto"
                style={{
                  background: tab.active ? "#28DFA0" : "rgba(255, 255, 255, 0.05)",
                  color: tab.active ? "#000904" : "#F0F5EF",
                  border: tab.active ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: tab.active ? "0 0 14px rgba(40,223,160,0.4)" : "none",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Chamber: Left copy, Center Portrait 3D Smartphone, Right Booking Confirmed Card */}
        <div className="relative flex-1 w-full flex items-center" style={{ perspective: "1200px" }}>
          {/* Left copy */}
          <div
            className="flex flex-col justify-center"
            style={{ width: "230px", zIndex: 10 }}
          >
            <h3 className="font-sans font-bold text-white text-[12px] mb-1">
              24/7 WhatsApp Bookings
            </h3>
            <p
              className="text-[#B8C9BD] text-[9.5px] leading-[1.38] mb-2"
              style={{ maxWidth: "205px" }}
            >
              Turn enquiries into confirmed appointments automatically, anytime, day no night.
            </p>
            <a
              href="#explore"
              className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#28DFA0] hover:text-[#8FFFD0] transition-colors"
            >
              <span>Explore the Workflow</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </a>
          </div>

          {/* Center: Vertical Portrait 3D Smartphone Chassis */}
          <div
            className="absolute rounded-[24px] overflow-hidden pointer-events-auto"
            style={{
              left: "290px",
              top: "-18px",
              width: "142px",
              height: "172px",
              transform: "perspective(1200px) rotateX(14deg) rotateY(-22deg) rotateZ(6deg)",
              background: "#051A12",
              border: "2px solid rgba(143,255,208,0.45)",
              boxShadow: "0 24px 50px rgba(0,0,0,0.8), 0 0 24px rgba(40,223,160,0.22)",
              zIndex: 5,
            }}
          >
            {/* Phone Top Notch / Speaker Bar */}
            <div
              className="w-full flex items-center justify-between px-2.5 py-1"
              style={{
                background: "rgba(8,122,81,0.4)",
                borderBottom: "1px solid rgba(40,223,160,0.18)",
              }}
            >
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#28DFA0]/20 flex items-center justify-center">
                  <MessageSquare className="w-1.5 h-1.5 text-[#28DFA0]" />
                </div>
                <div>
                  <div className="text-[6.5px] font-bold text-white leading-none">Your Business</div>
                  <div className="text-[5.5px] text-[#28DFA0] leading-none">Online</div>
                </div>
              </div>
              <div className="w-6 h-0.5 rounded-full bg-black/40" />
            </div>

            {/* WhatsApp Chat Content */}
            <div className="p-1.5 space-y-1">
              {/* User bubble */}
              <div className="flex justify-end">
                <div
                  className="rounded-lg rounded-tr-none px-1.5 py-0.5 text-[6.5px] text-white"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  Hi! Can I book a consultation?
                </div>
              </div>

              {/* Bot response */}
              <div className="flex justify-start">
                <div
                  className="rounded-lg rounded-tl-none px-1.5 py-1 text-[6.5px]"
                  style={{
                    background: "rgba(8,122,81,0.5)",
                    border: "1px solid rgba(40,223,160,0.25)",
                    color: "#F0F5EF",
                  }}
                >
                  <div className="text-[#8FFFD0] font-medium mb-0.5">Sure! Available slots:</div>
                  <div className="space-y-0.5">
                    {slots.map((s, idx) => (
                      <div
                        key={idx}
                        className="rounded px-1 py-0.5 flex items-center justify-between font-bold"
                        style={{
                          background: s.active ? "#28DFA0" : "rgba(255,255,255,0.06)",
                          color: s.active ? "#000904" : "#B8C9BD",
                          fontSize: "6px",
                        }}
                      >
                        <span>{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Radiant Emerald Connection Beam */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              left: "440px",
              top: "30px",
              width: "120px",
              height: "30px",
              zIndex: 6,
            }}
          >
            <svg viewBox="0 0 120 30" fill="none" className="w-full h-full">
              <path
                d="M 10 20 Q 60 5 110 15"
                stroke="#28DFA0"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                style={{ filter: "drop-shadow(0 0 6px #28DFA0)" }}
              />
            </svg>
          </div>

          {/* Right: Floating Booking Confirmed Card (x=600, y=622, w=160, h=96) */}
          <div
            className="mat-crystal-glass rounded-2xl flex flex-col items-center justify-center p-3 text-center pointer-events-auto absolute"
            style={{
              right: "40px",
              top: "10px",
              width: "155px",
              height: "94px",
              zIndex: 8,
              border: "1.5px solid rgba(143,255,208,0.4)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 24px rgba(40,223,160,0.3)",
            }}
          >
            {/* Green Circle Checkmark Badge */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(40,223,160,0.6)]"
              style={{ background: "#28DFA0" }}
            >
              <CheckCircle2 className="w-5 h-5 text-[#000904] stroke-[2.5]" />
            </div>

            <div className="text-[11.5px] font-bold text-white leading-tight">
              Booking Confirmed
            </div>
            <div className="text-[9.5px] font-mono text-[#8FFFD0] mt-0.5">
              Tue, 10:00 AM
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
