"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Sparkles,
  Phone,
  Play,
  Pause,
  Mic,
  Volume2,
  DollarSign,
  Layers,
  MessageSquare,
  Users,
  ChevronRight,
  TrendingUp,
  Activity,
  Bot,
  Zap,
} from "lucide-react";
import { liquidSpring, MOTION_EASE } from "../../lib/motionVariants";
import { cn } from "../../lib/utils";

/* ─────────────────────────────────────────────────────────────
   GLASSY DASHBOARD V30 SHOWCASE
   Exact Reference 01 Implementation:
   1. Radial Circular Progress Target Gauge (with traveling bead & tick marks)
   2. Curved Bezier Trend Line Velocity Card (with gradient area & sliding pill)
   3. Staggered Animated Vertical Bar Chart (with glowing peak day pill)
   4. Live Audio Waveform Voice Call Card (with multi-frequency animated voice bars)
   5. Exact `whileHover={{ y: -5 }}` spring physics across all cards
   ───────────────────────────────────────────────────────────── */

export function GlassyDashboardV30Showcase() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="space-y-6 select-none">
      {/* V30 Showcase Grid: 3 Columns on Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Column 1: Target Radial Gauge (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col">
          <TargetRadialGaugeCard />
        </div>

        {/* Column 2: Center & Right (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6 justify-between">
          {/* Row A: Trend Line + Voice Call */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrendLineVelocityCard />
            <VoiceCallWaveformCard />
          </div>

          {/* Row B: Animated Staggered Bar Chart */}
          <StaggeredBarTelemetryCard />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. TARGET RADIAL GAUGE CARD ("Quarterly Target")
   Reference 01: Circular arc with animated stroke, traveling glowing bead,
   inner tick marks, centered counter, toggle switch, sub-dock.
   ───────────────────────────────────────────────────────────── */

function TargetRadialGaugeCard() {
  const [isGaugeActive, setIsGaugeActive] = useState(true);
  const [targetPct, setTargetPct] = useState(78);
  const [displayPct, setDisplayPct] = useState(78);
  const [activeSubDock, setActiveSubDock] = useState<string>("rev");

  // Animate percentage count-up smoothly
  useEffect(() => {
    let frame = 0;
    const totalFrames = 28;
    const startVal = displayPct;
    const delta = targetPct - startVal;

    const timer = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(Math.round(startVal + delta * eased));
      if (progress >= 1) clearInterval(timer);
    }, 22);

    return () => clearInterval(timer);
  }, [targetPct]);

  // SVG Geometry for Circular Open Arc (260 degree arc from 140deg to 400deg)
  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2 - 4; // ~82
  const center = size / 2;

  // Arc angles (in radians)
  const startAngle = (140 * Math.PI) / 180;
  const totalArc = (260 * Math.PI) / 180;
  const totalCircumference = 2 * Math.PI * radius;
  const arcLength = (totalArc / (2 * Math.PI)) * totalCircumference;

  // Current progress fraction
  const progressRatio = isGaugeActive ? targetPct / 100 : 0;
  const strokeOffset = arcLength * (1 - progressRatio);

  // Calculate bead position at the leading edge of the arc
  const currentAngle = startAngle + totalArc * progressRatio;
  const beadX = center + radius * Math.cos(currentAngle);
  const beadY = center + radius * Math.sin(currentAngle);

  // Generate 28 inner radial tick marks
  const tickMarks = useMemo(() => {
    interface TickMark {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isPast: boolean;
      id: number;
    }
    const ticks: TickMark[] = [];
    const count = 30;
    const innerR = radius - 16;
    const outerR = radius - 11;

    for (let i = 0; i <= count; i++) {
      const angle = startAngle + (totalArc / count) * i;
      const x1 = center + innerR * Math.cos(angle);
      const y1 = center + innerR * Math.sin(angle);
      const x2 = center + outerR * Math.cos(angle);
      const y2 = center + outerR * Math.sin(angle);
      const isPast = i / count <= progressRatio;

      ticks.push({
        x1: Number(x1.toFixed(2)),
        y1: Number(y1.toFixed(2)),
        x2: Number(x2.toFixed(2)),
        y2: Number(y2.toFixed(2)),
        isPast,
        id: i,
      });
    }
    return ticks;
  }, [center, radius, startAngle, totalArc, progressRatio]);

  return (
    <motion.div
      data-cursor-spotlight="true"
      whileHover={{ y: -5 }}
      transition={liquidSpring}
      className="glass-card-obsidian rounded-2xl p-6 flex flex-col justify-between h-full border border-white/[0.14] hover:border-emerald-400/45 select-none relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Top Header & Interactive Toggle */}
      <div className="flex items-start justify-between w-full relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">Automation Target</h3>
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full">
              Q4 2026
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Workspace conversational goal</p>
        </div>

        {/* V30 Spring Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsGaugeActive(!isGaugeActive)}
          aria-label="Toggle automation target gauge"
          className={cn(
            "w-11 h-6 rounded-full transition-colors duration-300 p-0.5 relative cursor-pointer border",
            isGaugeActive
              ? "bg-emerald-500/30 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              : "bg-white/[0.08] border-white/15"
          )}
        >
          <motion.div
            animate={{ x: isGaugeActive ? 20 : 0 }}
            transition={liquidSpring}
            className={cn(
              "w-4.5 h-4.5 rounded-full shadow-md",
              isGaugeActive ? "bg-emerald-400" : "bg-zinc-400"
            )}
          />
        </button>
      </div>

      {/* Center Circular Radial Progress with Traveling Glowing Bead */}
      <div className="relative flex items-center justify-center py-4 my-auto z-10">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="v30-gauge-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <filter id="v30-bead-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${center + radius * Math.cos(startAngle)} ${center + radius * Math.sin(startAngle)} A ${radius} ${radius} 0 1 1 ${center + radius * Math.cos(startAngle + totalArc)} ${center + radius * Math.sin(startAngle + totalArc)}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Inner Radial Tick Marks */}
          {tickMarks.map((tick) => (
            <line
              key={tick.id}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isPast ? "rgba(52, 211, 153, 0.65)" : "rgba(255, 255, 255, 0.12)"}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          ))}

          {/* Animated Foreground Progress Arc */}
          <motion.path
            d={`M ${center + radius * Math.cos(startAngle)} ${center + radius * Math.sin(startAngle)} A ${radius} ${radius} 0 1 1 ${center + radius * Math.cos(startAngle + totalArc)} ${center + radius * Math.sin(startAngle + totalArc)}`}
            fill="none"
            stroke="url(#v30-gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${totalCircumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{
              duration: 1.2,
              ease: MOTION_EASE.premium,
            }}
          />

          {/* Luminous Glowing Bead Traveling on Arc Tip */}
          {isGaugeActive && (
            <g>
              <circle
                cx={Number(beadX.toFixed(2))}
                cy={Number(beadY.toFixed(2))}
                r={6.5}
                fill="#ffffff"
                filter="url(#v30-bead-glow)"
                className="drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] transition-all duration-300"
              />
              <circle
                cx={Number(beadX.toFixed(2))}
                cy={Number(beadY.toFixed(2))}
                r={3}
                fill="#38bdf8"
              />
            </g>
          )}
        </svg>

        {/* Centered Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-1">
          <motion.span
            key={displayPct}
            className="text-4xl font-extrabold text-white tracking-tight leading-none"
          >
            {displayPct}%
          </motion.span>
          <span className="text-[11px] font-semibold text-emerald-400 mt-1 uppercase tracking-wider">
            {isGaugeActive ? "Achieved" : "Paused"}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">780 of 1,000 tasks</span>
        </div>
      </div>

      {/* Bottom Range Adjustment & Sub-Dock Pills */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between text-xs text-zinc-300">
          <button
            type="button"
            onClick={() => setTargetPct((prev) => Math.max(20, prev - 5))}
            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 flex items-center justify-center font-bold text-zinc-200 transition-colors cursor-pointer"
            aria-label="Decrease target"
          >
            –
          </button>
          <span className="text-[11px] font-medium text-zinc-300 tabular-nums">
            €450k of €700k Target
          </span>
          <button
            type="button"
            onClick={() => setTargetPct((prev) => Math.min(100, prev + 5))}
            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 flex items-center justify-center font-bold text-zinc-200 transition-colors cursor-pointer"
            aria-label="Increase target"
          >
            +
          </button>
        </div>

        {/* Sub-dock icon pills */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { id: "rev", label: "Rev", icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: "flows", label: "Flows", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "calls", label: "Calls", icon: <Phone className="w-3.5 h-3.5" /> },
            { id: "chats", label: "Inbox", icon: <MessageSquare className="w-3.5 h-3.5" /> },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSubDock(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-center cursor-pointer",
                activeSubDock === item.id
                  ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-semibold mt-1 tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. CURVED TREND LINE VELOCITY CARD
   Reference 01: Bezier curve line reveal animation, glowing gradient fill,
   milestone time indicators, sliding segmented filter pill.
   ───────────────────────────────────────────────────────────── */

function TrendLineVelocityCard() {
  const prefersReduced = useReducedMotion();
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");

  const trendData = {
    today: {
      val: "€23.3k",
      target: "/ €28k",
      delta: "+12.4%",
      path: "M 10 75 C 50 72, 80 60, 120 50 C 160 40, 200 32, 240 22 C 280 14, 310 12, 350 8",
      area: "M 10 75 C 50 72, 80 60, 120 50 C 160 40, 200 32, 240 22 C 280 14, 310 12, 350 8 L 350 95 L 10 95 Z",
      milestones: [
        { label: "10:00", val: "€2.4k" },
        { label: "12:00", val: "€3.1k" },
        { label: "14:00", val: "€4.6k" },
        { label: "16:00", val: "€5.2k" },
        { label: "18:00", val: "€5.6k" },
      ],
    },
    week: {
      val: "€148.2k",
      target: "/ €160k",
      delta: "+18.7%",
      path: "M 10 80 C 60 76, 90 65, 140 45 C 190 28, 240 38, 290 20 C 320 12, 340 10, 350 6",
      area: "M 10 80 C 60 76, 90 65, 140 45 C 190 28, 240 38, 290 20 C 320 12, 340 10, 350 6 L 350 95 L 10 95 Z",
      milestones: [
        { label: "Mon", val: "€18k" },
        { label: "Tue", val: "€24k" },
        { label: "Wed", val: "€32k" },
        { label: "Thu", val: "€29k" },
        { label: "Fri", val: "€45k" },
      ],
    },
    month: {
      val: "€584.0k",
      target: "/ €620k",
      delta: "+22.1%",
      path: "M 10 85 C 70 80, 110 60, 170 42 C 220 28, 270 24, 310 14 C 330 9, 340 7, 350 5",
      area: "M 10 85 C 70 80, 110 60, 170 42 C 220 28, 270 24, 310 14 C 330 9, 340 7, 350 5 L 350 95 L 10 95 Z",
      milestones: [
        { label: "W1", val: "€110k" },
        { label: "W2", val: "€135k" },
        { label: "W3", val: "€160k" },
        { label: "W4", val: "€179k" },
        { label: "Run", val: "Active" },
      ],
    },
  };

  const active = trendData[filter];

  return (
    <motion.div
      data-cursor-spotlight="true"
      whileHover={{ y: -5 }}
      transition={liquidSpring}
      className="glass-card-obsidian rounded-2xl p-5 flex flex-col justify-between border border-white/[0.14] hover:border-emerald-400/45 select-none relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Top Value & Sliding Segmented Filter */}
      <div className="flex items-start justify-between w-full relative z-10">
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Revenue Velocity
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{active.val}</h2>
            <span className="text-xs text-zinc-400">{active.target}</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full ml-1">
              <ArrowUpRight className="w-3 h-3" />
              {active.delta}
            </span>
          </div>
        </div>

        {/* Sliding Segmented Pill Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
          {(["today", "week", "month"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={cn(
                "relative px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer",
                filter === opt ? "text-emerald-200" : "text-zinc-400 hover:text-white"
              )}
            >
              {filter === opt && (
                <motion.span
                  layoutId="trendFilterPill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-emerald-500/25 border border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.25)] -z-10"
                />
              )}
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Animated Curved Trend Line */}
      <div className="relative h-24 my-3 z-10">
        <svg
          viewBox="0 0 360 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="v30-trend-area" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#065f46" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="v30-trend-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path
            key={`area-${filter}`}
            d={active.area}
            fill="url(#v30-trend-area)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Bezier Stroke Curve */}
          <motion.path
            key={`line-${filter}`}
            d={active.path}
            fill="none"
            stroke="url(#v30-trend-stroke)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.1,
              ease: MOTION_EASE.premium,
            }}
          />
        </svg>
      </div>

      {/* Milestone Points */}
      <div className="grid grid-cols-5 gap-1 pt-2 border-t border-white/[0.08] relative z-10">
        {active.milestones.map((m, i) => (
          <div key={i} className="text-center">
            <span className="text-[11px] font-bold text-white block tabular-nums">{m.val}</span>
            <span className="text-[9px] text-zinc-400 uppercase tracking-tight block">{m.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. LIVE VOICE CALL / WAVEFORM VISUALIZER CARD
   Reference 01: Real-time Discovery Call card with caller info,
   dancing multi-frequency audio waveform bars, live timer, and call controls.
   ───────────────────────────────────────────────────────────── */

function VoiceCallWaveformCard() {
  const prefersReduced = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(true);
  const [seconds, setSeconds] = useState(134); // 02:14

  // Ticking call timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate 26 visualizer bars with varied height targets
  const waveformBars = useMemo(() => {
    return [
      12, 18, 28, 14, 22, 34, 18, 26, 40, 24, 32, 44, 30,
      38, 22, 34, 16, 28, 42, 20, 26, 36, 14, 24, 18, 10
    ];
  }, []);

  return (
    <motion.div
      data-cursor-spotlight="true"
      whileHover={{ y: -5 }}
      transition={liquidSpring}
      className="glass-card-obsidian rounded-2xl p-5 flex flex-col justify-between border border-white/[0.14] hover:border-emerald-400/45 select-none relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Caller Header */}
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-3">
          {/* Caller Avatar with Live Pulsing Dot */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-emerald-500/20 border border-emerald-400/35 flex items-center justify-center font-bold text-emerald-300 text-sm shadow-[0_0_14px_rgba(16,185,129,0.2)]">
              SC
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080d0b] animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080d0b]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white tracking-tight">Discovery Call</h4>
              <span className="text-[9px] font-semibold text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded">
                Northwind Co
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Sarah Chen · Head of Ops</p>
          </div>
        </div>

        {/* Live Call Duration */}
        <span
          suppressHydrationWarning
          className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full tabular-nums shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        >
          {formatTime(seconds)}
        </span>
      </div>

      {/* Live Animated Voice Waveform Visualizer */}
      <div className="h-16 flex items-center justify-between gap-1 px-1 my-3 bg-black/25 rounded-xl border border-white/[0.06] p-2 relative z-10">
        {waveformBars.map((baseH, idx) => {
          // Dynamic bouncing height animation with staggered phase
          const animateHeight = isPlaying
            ? [baseH * 0.4, baseH, baseH * 0.6, baseH * 1.2, baseH * 0.5]
            : baseH * 0.4;

          return (
            <motion.div
              key={idx}
              animate={{ height: animateHeight }}
              transition={{
                duration: 0.8 + (idx % 4) * 0.15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: (idx * 0.04) % 0.4,
              }}
              style={{ minHeight: 4 }}
              className={cn(
                "flex-1 rounded-full transition-colors",
                idx >= 8 && idx <= 18
                  ? "bg-gradient-to-t from-cyan-400 to-emerald-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                  : "bg-white/[0.25]"
              )}
            />
          );
        })}
      </div>

      {/* Call Player Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause audio stream" : "Play audio stream"}
            className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/30 flex items-center justify-center text-emerald-300 transition-colors cursor-pointer shadow-[0_0_14px_rgba(16,185,129,0.25)]"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <span className="text-[11px] text-zinc-300 font-medium">
            {isPlaying ? "Live AI transcription" : "Audio stream paused"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <button
            type="button"
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Mute mic"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Volume settings"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. STAGGERED ANIMATED BAR TELEMETRY CARD
   Reference 01: Vertical column bars with staggered scaleY growth,
   highlighted peak day pill ("58.5"), hover tooltips, and time toggle.
   ───────────────────────────────────────────────────────────── */

function StaggeredBarTelemetryCard() {
  const prefersReduced = useReducedMotion();
  const [filter, setFilter] = useState<"week" | "month" | "year">("week");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const barDataset = [
    { day: "Mon", val: 24.2, height: 42 },
    { day: "Tue", val: 38.6, height: 64 },
    { day: "Wed", val: 58.5, height: 96, isPeak: true },
    { day: "Thu", val: 46.1, height: 76 },
    { day: "Fri", val: 32.4, height: 54 },
    { day: "Sat", val: 18.0, height: 30 },
    { day: "Sun", val: 12.5, height: 20 },
  ];

  return (
    <motion.div
      data-cursor-spotlight="true"
      whileHover={{ y: -5 }}
      transition={liquidSpring}
      className="glass-card-obsidian rounded-2xl p-5 border border-white/[0.14] hover:border-emerald-400/45 select-none relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Card Header & Time Filter */}
      <div className="flex items-center justify-between w-full relative z-10 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Execution Telemetry (k)
            </h3>
            <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 rounded-full">
              Wed Peak: 58.5k
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Automated workflow trigger volume</p>
        </div>

        {/* Sliding Segmented Pill Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
          {(["week", "month", "year"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={cn(
                "relative px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer",
                filter === opt ? "text-cyan-200" : "text-zinc-400 hover:text-white"
              )}
            >
              {filter === opt && (
                <motion.span
                  layoutId="barFilterPill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-cyan-500/25 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.25)] -z-10"
                />
              )}
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative h-44 flex flex-col justify-end pt-6 z-10">
        {/* Horizontal Guide Lines */}
        <div className="absolute inset-x-0 top-6 bottom-7 pointer-events-none flex flex-col justify-between">
          <div className="border-t border-dashed border-white/[0.07] w-full flex justify-end">
            <span className="text-[9px] text-zinc-500 tabular-nums -mt-3.5">60k</span>
          </div>
          <div className="border-t border-dashed border-white/[0.05] w-full flex justify-end">
            <span className="text-[9px] text-zinc-500 tabular-nums -mt-3.5">30k</span>
          </div>
          <div className="border-t border-white/[0.08] w-full" />
        </div>

        {/* The 7 Bars */}
        <div className="flex items-end justify-between gap-3 sm:gap-6 h-32 px-4 relative z-10">
          {barDataset.map((bar, i) => {
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={bar.day}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
              >
                {/* Floating Peak Pill Badge on Peak Bar or Hover */}
                {(bar.isPeak || isHovered) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "absolute bottom-full mb-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums shadow-lg z-20 pointer-events-none whitespace-nowrap",
                      bar.isPeak
                        ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                        : "bg-[#0c1a15] text-emerald-300 border border-emerald-400/40"
                    )}
                  >
                    {bar.val}k
                  </motion.div>
                )}

                {/* Vertical Bar Growing from Origin Bottom */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.48,
                    ease: MOTION_EASE.premium,
                  }}
                  style={{
                    height: `${bar.height}%`,
                    transformOrigin: "bottom",
                  }}
                  className={cn(
                    "w-full max-w-[42px] rounded-t-xl transition-all",
                    bar.isPeak
                      ? "bg-gradient-to-t from-blue-600 via-cyan-400 to-emerald-300 shadow-[0_0_20px_rgba(6,182,212,0.45)] brightness-110"
                      : "bg-gradient-to-t from-white/[0.08] to-white/[0.22] hover:from-emerald-600/60 hover:to-emerald-400 hover:shadow-[0_0_14px_rgba(16,185,129,0.3)]"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 pt-2 border-t border-white/[0.08]">
          {barDataset.map((bar, i) => (
            <span
              key={bar.day}
              className={cn(
                "flex-1 text-center text-[10px] font-bold uppercase tracking-wider transition-colors",
                bar.isPeak || hoveredIdx === i ? "text-cyan-300" : "text-zinc-500"
              )}
            >
              {bar.day}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
