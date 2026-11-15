"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Mic,
  MessageSquare,
  CalendarCheck,
  Send,
  Clock,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { GlassButton } from "./ui/GlassButton";
import { AnimatedTabs } from "./ui/AnimatedTabs";
import { SpatialGlassCard } from "./spatial/SpatialGlassCard";
import { SpatialAtmosphere } from "./spatial/SpatialAtmosphere";
import { useInViewport, useIsDocumentVisible } from "../hooks/useMotionVisibility";
import { MOTION_EASE } from "../lib/motionVariants";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time?: string;
}

const chatScript: ChatMessage[] = [
  {
    id: "1",
    sender: "user",
    text: "Hi, do you have any slots for a deep tissue massage tomorrow afternoon?",
    time: "2:14 PM",
  },
  {
    id: "2",
    sender: "ai",
    text: "Hi Sarah! We have openings at 10:30 AM and 2:00 PM with therapist Marcus. Want me to reserve 2:00 PM for you?",
    time: "2:14 PM",
  },
  {
    id: "3",
    sender: "user",
    text: "2 PM works perfectly, please book it!",
    time: "2:15 PM",
  },
  {
    id: "4",
    sender: "ai",
    text: "Done! Confirmed for 2:00 PM tomorrow. Google Calendar invite sent & 24h intake form dispatched. See you then! ✓",
    time: "2:15 PM",
  },
];

const frontDeskEvents = [
  {
    icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />,
    title: "Appointment Confirmed",
    sub: "Sarah K. • Deep Tissue • Tomorrow 2:00 PM",
    badge: "Auto-Locked",
  },
  {
    icon: <Zap className="w-4 h-4 text-emerald-400" />,
    title: "0% Commission Direct Booking",
    sub: "$120.00 service fee captured directly to Stripe",
    badge: "Zero Fees",
  },
  {
    icon: <Send className="w-4 h-4 text-emerald-400" />,
    title: "Automated Intake Dispatched",
    sub: "WhatsApp reminder & health waiver scheduled",
    badge: "24h Prior",
  },
  {
    icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
    title: "Instagram DM Lead Converted",
    sub: "Inquiry answered in 1.4s • Slot booked",
    badge: "Instant Reply",
  },
];

const waveHeights = [22, 54, 36, 78, 56, 88, 42, 68, 86, 46, 62, 32, 76, 40, 58, 28];

const TypingIndicator = () => (
  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl rounded-tl-xs px-4 py-2.5 flex items-center gap-2 h-[38px] w-fit shadow-sm">
    <div className="flex gap-1.5 items-center">
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
    <span className="text-[11px] text-emerald-300/80 font-medium ml-1">AI analyzing availability...</span>
  </div>
);

export function Hero() {
  const { openSignup, openDemo } = useUIStore();
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const inViewport = useInViewport(heroRef, "120px", true);
  const isDocVisible = useIsDocumentVisible();
  const shouldAnimate = !prefersReduced && inViewport && isDocVisible;

  const [previewMode, setPreviewMode] = useState<"stage" | "chat">("stage");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [chatScript[0], chatScript[1]]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [bookingStage, setBookingStage] = useState<string>("Active • Listening");

  // Dynamic looping chat simulation
  useEffect(() => {
    if (prefersReduced) {
      setMessages(chatScript);
      setIsTyping(false);
      return;
    }
    if (!shouldAnimate) return;

    let active = true;
    let timer: NodeJS.Timeout;

    const runScript = async () => {
      if (!active) return;
      setMessages([chatScript[0]]);
      setIsTyping(false);
      setBookingStage("Inquiry Received");

      const step = async (index: number) => {
        if (!active) return;

        if (index >= chatScript.length) {
          setBookingStage("Calendar Locked ✓");
          timer = setTimeout(() => {
            if (active) runScript();
          }, 6500);
          return;
        }

        const msg = chatScript[index];

        if (msg.sender === "ai") {
          setIsTyping(true);
          setBookingStage(index === 1 ? "Checking Rosters..." : "Confirming Slot & Calendar...");
          await new Promise((res) => {
            timer = setTimeout(res, 1400);
          });
          if (!active) return;
          setIsTyping(false);
          setMessages((prev) => [...prev, msg]);
          setBookingStage(index === 1 ? "Slot Offered: 2:00 PM" : "Calendar Sync'd ✓");
        } else {
          await new Promise((res) => {
            timer = setTimeout(res, 900);
          });
          if (!active) return;
          setMessages((prev) => [...prev, msg]);
          if (index === 0) setBookingStage("Inquiry Received");
          if (index === 2) setBookingStage("Slot Selected: 2:00 PM");
        }

        await new Promise((res) => {
          timer = setTimeout(res, 1100);
        });
        if (!active) return;
        step(index + 1);
      };

      step(1);
    };

    runScript();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [shouldAnimate, prefersReduced]);

  // Cycle front desk operational event stream
  useEffect(() => {
    if (!shouldAnimate) return;
    const interval = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % frontDeskEvents.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [shouldAnimate]);

  const heroMetrics = [
    {
      value: "24/7",
      label: "AI Availability",
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
    },
    {
      value: "< 2s",
      label: "Instant Replies",
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
    },
    {
      value: "0%",
      label: "Booking Commissions",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    },
    {
      value: "13+",
      label: "Industry Verticals",
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <section
      ref={heroRef}
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 overflow-hidden"
    >
      {/* 1. Spatial Liquid Glass Dynamic Atmosphere (z-0) */}
      <SpatialAtmosphere intensity="immersive" />

      {/* 2. Hero Content Container (z-10) */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* LEFT CONTENT (6 cols on lg) — Permanent Text Visibility Protected */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left spatial-content-protected">
            
            {/* 1. Crystal Glass Announcement Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full spatial-glass-crystal text-xs font-semibold text-emerald-300 mb-6 shadow-[0_0_24px_rgba(16,185,129,0.22)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>AI Receptionist &amp; Business OS</span>
              <span className="text-zinc-500 text-[10px]">|</span>
              <span className="text-zinc-400 font-normal">v2.4 Live Autopilot</span>
            </div>

            {/* 2. Flagship Title Typography — Permanently Visible */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold tracking-tight text-white leading-[1.06] mb-6">
              Your AI Receptionist{" "}
              <span className="block text-gradient-green">
                for Service Businesses
              </span>
            </h1>

            {/* 3. Supporting Subtitle — Permanently Visible */}
            <p className="text-base sm:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-xl mb-8">
              WhatsApp, Instagram, Bookings, Leads, and Follow-ups — all
              automated by AI, 24/7 with zero commission fees.
            </p>

            {/* 4. Primary & Secondary CTA Buttons with Magnetic Snap */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
              <GlassButton
                size="lg"
                variant="primary"
                magnetic
                magneticStrength="medium"
                onClick={openSignup}
                className="w-full sm:w-auto group shadow-[0_0_36px_rgba(16,185,129,0.35)]"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </GlassButton>
              <GlassButton
                size="lg"
                variant="secondary"
                magneticStrength="low"
                onClick={openDemo}
                className="w-full sm:w-auto"
              >
                Book a Demo
              </GlassButton>
            </div>

            {/* 5. Capability Checkmarks */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs sm:text-sm text-zinc-300 font-medium">
              {[
                "AI Voice & Chat",
                "Lead Management",
                "Automations",
                "Business OS",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT INTERACTIVE PRODUCT SHOWCASE (6 cols on lg) — Spatial 3D Composition */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col items-center lg:items-end w-full spatial-perspective-stage">
            
            {/* Spatial Illumination Beam Behind Showcase */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 m-auto w-[96%] h-[96%] rounded-[40px] pointer-events-none blur-[40px] opacity-70"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(52,211,153,0.06) 45%, transparent 70%)",
              }}
            />

            <div className="w-full max-w-[560px] relative">
              
              {/* Top Mode Switcher */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-zinc-300">
                    Spatial AI Receptionist Simulator
                  </span>
                </div>
                <AnimatedTabs<"stage" | "chat">
                  layoutId="hero-stage-tabs"
                  size="sm"
                  ariaLabel="Hero preview mode"
                  activeId={previewMode}
                  onChange={setPreviewMode}
                  tabs={[
                    { id: "stage", label: "Live OS View" },
                    { id: "chat", label: "WhatsApp Thread" },
                  ]}
                  className="spatial-glass-crystal border-emerald-500/20 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                />
              </div>

              {/* SPATIAL 3D GLASS COMPOSITION: Multi-Plane Stacking */}
              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                
                {/* DEPTH PLANE 1 (Background Architectural Console: translateZ(-25px)) */}
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute -top-5 -left-5 -right-5 bottom-8 rounded-[36px] spatial-glass-architectural opacity-60 border border-emerald-500/15 pointer-events-none"
                  style={{
                    transform: "translateZ(-25px) rotateX(2deg) rotateY(-2deg)",
                  }}
                />

                {/* DEPTH PLANE 2 (Main Primary Liquid Glass Console: translateZ(10px)) */}
                <SpatialGlassCard
                  variant="primary"
                  hoverTilt={true}
                  glow={true}
                  dataTestId="hero-spatial-glass-card"
                  className="w-full rounded-[28px] border border-emerald-500/30 flex flex-col shadow-[0_32px_96px_rgba(0,0,0,0.95),0_0_60px_rgba(16,185,129,0.2)]"
                >
                  {/* Window Chrome Header */}
                  <div className="px-5 py-3.5 bg-white/[0.04] border-b border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <div className="h-4 w-px bg-white/10 mx-1" />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white tracking-tight">
                          StarX AI Receptionist
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {bookingStage}
                      </span>
                    </div>
                  </div>

                  {/* Integrated Audio Voice Radar Strip */}
                  <div className="px-5 py-2.5 bg-emerald-950/30 border-b border-emerald-500/15 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        AI Voice &amp; Chat Inbound
                      </span>
                    </div>

                    {/* Realtime Waveform Animation */}
                    <div
                      aria-hidden="true"
                      className="h-5 flex items-center justify-center gap-1 px-2"
                    >
                      {waveHeights.map((h, idx) => (
                        <span
                          key={idx}
                          className="w-1 rounded-full bg-gradient-to-t from-emerald-600 via-emerald-400 to-emerald-200 voice-wave-bar"
                          style={{
                            height: `${Math.max(25, Math.round(h * 0.72))}%`,
                            animationDelay: `${idx * 85}ms`,
                          }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/25">
                      &lt; 1.4s Latency
                    </span>
                  </div>

                  {/* Main Content Area */}
                  <div className="p-5 flex flex-col justify-between min-h-[300px]">
                    {previewMode === "chat" ? (
                      <div className="flex flex-col justify-between flex-1 gap-3">
                        {/* Conversation Messages */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                          <AnimatePresence mode="popLayout">
                            {messages.map((msg) => (
                              <motion.div
                                key={msg.id}
                                initial={
                                  prefersReduced
                                    ? { opacity: 1 }
                                    : { opacity: 0, y: 8, scale: 0.98 }
                                }
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.24, ease: MOTION_EASE.premium }}
                                className={`flex w-full ${
                                  msg.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[86%] sm:max-w-[80%] px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed shadow-md ${
                                    msg.sender === "user"
                                      ? "bg-white/[0.09] border border-white/12 text-white rounded-2xl rounded-tr-xs"
                                      : "bg-emerald-500/15 border border-emerald-400/30 text-emerald-50 rounded-2xl rounded-tl-xs shadow-[0_4px_16px_rgba(16,185,129,0.15)]"
                                  }`}
                                >
                                  <p>{msg.text}</p>
                                  {msg.time && (
                                    <span className="block text-[10px] text-zinc-400 mt-1 text-right">
                                      {msg.time}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}

                            {isTyping && (
                              <motion.div
                                key="typing-bubble"
                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex justify-start"
                              >
                                <TypingIndicator />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Live Synchronized Integration Status */}
                        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-300">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="font-semibold text-emerald-300 truncate">
                              WhatsApp Cloud API
                            </span>
                            <span className="text-zinc-400 truncate">
                              • Calendar Synced • 24/7 Autopilot
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0 ml-2">
                            0% Fee
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          Live Operations Stream
                        </p>
                        <div className="space-y-2">
                          {frontDeskEvents.map((evt) => (
                            <div
                              key={evt.title}
                              className="rounded-xl px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-emerald-400/40 hover:bg-white/[0.05] transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                  {evt.icon}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">
                                    {evt.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 truncate">
                                    {evt.sub}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                                {evt.badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Showcase Footer Activity Bar */}
                  <div className="px-5 py-3 bg-black/70 border-t border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-xs font-medium text-zinc-300 truncate">
                        {frontDeskEvents[activeEventIndex].title}:{" "}
                        <span className="text-zinc-400 font-normal">
                          {frontDeskEvents[activeEventIndex].sub}
                        </span>
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold ml-2 shrink-0">
                      Live
                    </span>
                  </div>
                </SpatialGlassCard>

                {/* DEPTH PLANE 3 (Foreground Floating Crystal Badge: translateZ(55px)) */}
                <motion.div
                  animate={
                    !prefersReduced
                      ? {
                          y: [0, -10, 0],
                          rotateZ: [0, 1.5, 0],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    transform: "translateZ(55px)",
                    transformStyle: "preserve-3d",
                  }}
                  className="hidden sm:flex absolute -bottom-6 -left-6 z-20 items-center gap-3 px-4 py-3 rounded-2xl spatial-glass-crystal border border-emerald-400/40 shadow-[0_16px_36px_rgba(0,0,0,0.7),0_0_24px_rgba(16,185,129,0.35)]"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Sarah K. Confirmed
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                    </div>
                    <div className="text-[10px] text-emerald-300/90 font-medium">
                      Tomorrow 2:00 PM • Calendar Locked ✓
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4 Spatial Glass Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-14 lg:mt-18">
          {heroMetrics.map((metric) => (
            <SpatialGlassCard
              key={metric.label}
              variant="secondary"
              hoverTilt={true}
              glow={true}
              className="p-4 sm:p-5 h-full flex items-center gap-3.5 border-emerald-500/20 hover:border-emerald-400/40"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.18)]">
                {metric.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs text-zinc-400 font-medium truncate">
                  {metric.label}
                </div>
              </div>
            </SpatialGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
