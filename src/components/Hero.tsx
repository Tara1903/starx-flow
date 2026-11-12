"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  PhoneMissed,
  Star,
  Mic,
  MessageSquare,
  CalendarCheck,
  Send,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { GlassButton } from "./ui/GlassButton";
import { GlassCard } from "./ui/GlassCard";
import { MOTION_EASE, smoothTransition } from "../lib/motionVariants";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
}

const chatScript: ChatMessage[] = [
  {
    id: "1",
    sender: "user",
    text: "Hi, do you have any slots for a deep tissue massage tomorrow?",
  },
  {
    id: "2",
    sender: "ai",
    text: "Hi! We have openings at 10:30 AM and 2:00 PM with Sarah. Want me to book one?",
  },
  { id: "3", sender: "user", text: "2 PM please!" },
  {
    id: "4",
    sender: "ai",
    text: "Done! Booked for 2:00 PM tomorrow. Calendar invite sent.",
  },
];

const floatingToasts = [
  {
    icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
    title: "New Lead",
    sub: "WhatsApp inquiry captured",
  },
  {
    icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />,
    title: "Booking Confirmed",
    sub: "Sarah K. • Tomorrow 2:00 PM",
  },
  {
    icon: <Send className="w-4 h-4 text-emerald-400" />,
    title: "Follow-up Sent",
    sub: "24h reminder & intake form",
  },
];

const waveHeights = [28, 56, 40, 84, 62, 95, 48, 76, 90, 52, 68, 36, 80, 44, 60, 32];

const TypingIndicator = () => (
  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center h-[42px] w-fit">
    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
  </div>
);

export function Hero() {
  const { openSignup, openDemo } = useUIStore();
  const prefersReduced = useReducedMotion();

  const [previewMode, setPreviewMode] = useState<"stage" | "chat">("stage");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeToastIndex, setActiveToastIndex] = useState<number>(0);

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout;

    const runScript = async () => {
      if (!active) return;
      setMessages([]);
      setIsTyping(false);

      const step = async (index: number) => {
        if (!active) return;
        if (index >= chatScript.length) {
          timer = setTimeout(() => {
            if (active) runScript();
          }, 5500);
          return;
        }

        const msg = chatScript[index];
        if (msg.sender === "ai") {
          setIsTyping(true);
          await new Promise((resolve) => {
            timer = setTimeout(resolve, 1400);
          });
          if (!active) return;
          setIsTyping(false);
          setMessages((prev) => [...prev, msg]);
        } else {
          await new Promise((resolve) => {
            timer = setTimeout(resolve, 900);
          });
          if (!active) return;
          setMessages((prev) => [...prev, msg]);
        }

        await new Promise((resolve) => {
          timer = setTimeout(resolve, 1000);
        });
        if (!active) return;
        step(index + 1);
      };

      step(0);
    };

    runScript();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveToastIndex((prev) => (prev + 1) % floatingToasts.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

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
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Emerald Atmospheric Stage Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 right-[8%] w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14)_0%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.1)_0%,transparent_70%)]"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* LEFT CONTENT (7 cols on lg) */}
          <motion.div
            className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left"
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: MOTION_EASE.premium }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-300 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Receptionist &amp; Business OS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold tracking-tight text-white leading-[1.06] mb-6">
              Your AI Receptionist{" "}
              <span className="block text-gradient-green">
                for Service Businesses
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-xl mb-8">
              WhatsApp, Instagram, Bookings, Leads, and Follow-ups — all
              automated by AI, 24/7 with zero commission fees.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
              <GlassButton
                size="lg"
                variant="primary"
                magnetic
                magneticStrength="medium"
                onClick={openSignup}
                className="w-full sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
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

            {/* Capability Checkmarks Row */}
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
          </motion.div>

          {/* RIGHT INTERACTIVE GLASS STAGE (6 cols on lg) */}
          <motion.div
            className="lg:col-span-6 xl:col-span-6 relative flex flex-col items-center lg:items-end"
            initial={prefersReduced ? false : { opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: MOTION_EASE.premium }}
          >
            {/* Radial Emerald Ring Glow Behind Showcase */}
            <div
              aria-hidden="true"
              className="absolute inset-0 m-auto w-[85%] h-[85%] rounded-full bg-emerald-500/18 blur-[95px] pointer-events-none"
            />

            <div className="w-full max-w-[540px] relative">
              {/* Interactive Preview Mode Switcher */}
              <div className="flex items-center justify-end gap-2 mb-3">
                <div className="inline-flex p-1 rounded-full bg-[#08120e]/90 border border-white/10 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("stage")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      previewMode === "stage"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Live OS View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("chat")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      previewMode === "chat"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    WhatsApp Thread
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {previewMode === "stage" ? (
                  <motion.div
                    key="stage-view"
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={smoothTransition}
                    className="relative"
                  >
                    {/* Tilted Glass Dashboard Backdrop Card */}
                    <div
                      data-cursor-spotlight="true"
                      className="glass-card-obsidian rounded-[28px] p-5 sm:p-6 border border-emerald-500/25 shadow-[0_30px_80px_rgba(0,0,0,0.85),0_0_45px_rgba(16,185,129,0.14)] overflow-hidden"
                    >
                      {/* Window Chrome */}
                      <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-300/90 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                          Operating Live 24/7
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* Left: AI Voice / Receptionist Waveform Card */}
                        <div className="sm:col-span-6 rounded-2xl bg-[#040a08]/95 border border-emerald-500/30 p-4 shadow-[0_0_28px_rgba(16,185,129,0.12)]">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                              <Mic className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">
                                AI Receptionist
                              </p>
                              <p className="text-[11px] text-emerald-400 font-medium">
                                Listening...
                              </p>
                            </div>
                          </div>

                          {/* Equalizer Waveform Bars */}
                          <div
                            aria-hidden="true"
                            className="h-20 flex items-center justify-center gap-1 px-1"
                          >
                            {waveHeights.map((h, idx) => (
                              <span
                                key={idx}
                                className="w-1.5 rounded-full bg-gradient-to-t from-emerald-600 via-emerald-400 to-emerald-200 voice-wave-bar"
                                style={{
                                  height: `${Math.max(18, Math.round(h * 0.72))}%`,
                                  animationDelay: `${idx * 90}ms`,
                                }}
                              />
                            ))}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Calendar Sync</span>
                            <span className="text-emerald-400 font-semibold">
                              Locked &amp; Active
                            </span>
                          </div>
                        </div>

                        {/* Right: Live Event Cards */}
                        <div className="sm:col-span-6 space-y-2.5">
                          {floatingToasts.map((toast, idx) => {
                            const highlighted = idx === activeToastIndex;
                            return (
                              <motion.div
                                key={toast.title}
                                animate={
                                  prefersReduced
                                    ? undefined
                                    : {
                                        scale: highlighted ? 1.02 : 1,
                                        borderColor: highlighted
                                          ? "rgba(52,211,153,0.48)"
                                          : "rgba(255,255,255,0.08)",
                                      }
                                }
                                transition={{ duration: 0.25 }}
                                className={`rounded-2xl px-3.5 py-3 border flex items-center justify-between gap-2.5 transition-colors ${
                                  highlighted
                                    ? "bg-emerald-500/12 shadow-[0_0_24px_rgba(16,185,129,0.16)]"
                                    : "bg-white/[0.03]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                    {toast.icon}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">
                                      {toast.title}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 truncate">
                                      {toast.sub}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    highlighted
                                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                                      : "bg-emerald-500/40"
                                  }`}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat-view"
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={smoothTransition}
                    className="glass-card-obsidian w-full rounded-[28px] overflow-hidden border border-emerald-500/25 shadow-[0_30px_80px_rgba(0,0,0,0.85)]"
                  >
                    <div className="px-5 py-3.5 bg-white/[0.04] border-b border-white/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[#02120c] font-bold text-xs">
                        AI
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          AI Receptionist
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          WhatsApp Cloud API • Active
                        </p>
                      </div>
                    </div>

                    <div className="p-4 h-[250px] overflow-y-auto no-scrollbar flex flex-col gap-3 bg-black/25">
                      <AnimatePresence mode="popLayout">
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={
                              prefersReduced
                                ? { opacity: 1 }
                                : { opacity: 0, y: 8, scale: 0.96 }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className={`flex w-full ${
                              msg.sender === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] px-3.5 py-2.5 text-xs sm:text-sm font-medium leading-relaxed ${
                                msg.sender === "user"
                                  ? "bg-white/[0.08] border border-white/10 text-white rounded-2xl rounded-tr-sm"
                                  : "bg-emerald-500/12 border border-emerald-500/25 text-emerald-50 rounded-2xl rounded-tl-sm"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </motion.div>
                        ))}
                        {isTyping && (
                          <motion.div
                            key="typing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <TypingIndicator />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Bottom 4 Glass Metric Cards Row */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.25, ease: MOTION_EASE.premium }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-14 lg:mt-16"
        >
          {heroMetrics.map((metric) => (
            <GlassCard
              key={metric.label}
              variant="obsidian"
              hover
              className="p-4 sm:p-5 flex items-center gap-3.5"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
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
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
