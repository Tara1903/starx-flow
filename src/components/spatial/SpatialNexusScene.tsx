"use client";

import React, { useState } from "react";
import {
  Cpu,
  MessageSquare,
  CalendarCheck,
  Database,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Send,
  Zap,
  Network,
} from "lucide-react";
import { SpatialScrollScene } from "./SpatialScrollScene";
import { SpatialSectionHeader } from "./SpatialSectionHeader";
import { SpatialGlassCard } from "./SpatialGlassCard";

interface NexusNode {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  summary: string;
  telemetry: string;
  details: string[];
}

export function SpatialNexusScene() {
  const [activeNodeId, setActiveNodeId] = useState<string>("ingestion");

  const nodes: NexusNode[] = [
    {
      id: "ingestion",
      title: "Omnichannel Ingestion",
      category: "CHANNEL MATRIX",
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      summary: "Inbound messages from WhatsApp, Instagram, and web chat are captured instantaneously.",
      telemetry: "Latency: < 1.4s • 100% Delivery Rate",
      details: [
        "Meta WhatsApp Cloud API integration with verified sender",
        "Instagram Direct Message lead qualification and auto-responder",
        "Zero dropped inquiries during closed business hours",
      ],
    },
    {
      id: "reasoning",
      title: "Autonomous Intelligence",
      category: "RECEPTION ENGINE",
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      summary: "Contextual conversational AI trained on your exact service menu, pricing, and practitioner rules.",
      telemetry: "Reasoning: Deterministic Guardrails",
      details: [
        "Understands complex requests (e.g., 'Do you have Marcus free at 2 PM?')",
        "Answers clinic FAQs, pricing, parking, and contraindications",
        "Handles reschedules and cancellations with zero human intervention",
      ],
    },
    {
      id: "concurrency",
      title: "Calendar Concurrency Engine",
      category: "ROSTER SYNCHRONIZATION",
      icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />,
      summary: "Direct two-way synchronization with Google Calendar & Outlook, locked by database constraints.",
      telemetry: "Concurrency Locks: PostgreSQL Mutex",
      details: [
        "Real-time bidirectional availability polling across all staff calendars",
        "PostgreSQL exclusion constraints mathematically block double-bookings",
        "Automatic buffer management between service sessions",
      ],
    },
    {
      id: "lifecycle",
      title: "Client Lifecycle & CRM",
      category: "OPERATIONAL MEMORY",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      summary: "Continuous relationship automation: intake forms, 24h reminders, and Google reviews.",
      telemetry: "No-Show Drop: -68% • RLS Isolated",
      details: [
        "Digital WhatsApp intake waivers dispatched automatically prior to arrival",
        "24-hour reminder triggers preventing unpaid vacant slots",
        "Automated post-appointment Google Review booster generating 5-star feedback",
      ],
    },
  ];

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  return (
    <SpatialScrollScene
      id="nexus"
      sceneNumber="03"
      ambientBeam="center"
      className="border-t border-white/5"
    >
      <SpatialSectionHeader
        badge="SCENE 03 // THE CONNECTED OPERATING NEXUS"
        badgeIcon={<Network size={13} className="text-emerald-400" />}
        titlePrefix="One intelligent system."
        titleHighlight="Zero fragmented"
        titleSuffix="tools."
        subtitle="StarX Flow replaces disjointed software with a unified nervous system where every communication, calendar slot, and client record flows continuously."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT: Interactive 4-Node Selector (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3 justify-between">
          {nodes.map((node) => {
            const isSelected = node.id === activeNodeId;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setActiveNodeId(node.id)}
                className="w-full text-left"
              >
                <SpatialGlassCard
                  variant={isSelected ? "primary" : "secondary"}
                  hoverTilt={false}
                  glow={isSelected}
                  className={`p-5 rounded-2xl transition-all border ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                      : "border-white/10 hover:border-white/20 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-emerald-500/25 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            : "bg-white/[0.05] border border-white/10"
                        }`}
                      >
                        {node.icon}
                      </div>
                      <span className="text-xs font-mono text-emerald-400 tracking-wider">
                        {node.category}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                          : "bg-white/[0.04] text-zinc-400 border-white/10"
                      }`}
                    >
                      {isSelected ? "ACTIVE SPHERE" : "INSPECT"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight ml-12">
                    {node.title}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 ml-12 line-clamp-2">
                    {node.summary}
                  </p>
                </SpatialGlassCard>
              </button>
            );
          })}
        </div>

        {/* RIGHT: High-Depth Telemetry Inspector Console (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <SpatialGlassCard
            variant="architectural"
            hoverTilt={true}
            glow={true}
            className="p-8 sm:p-10 rounded-3xl border border-emerald-500/30 shadow-[0_32px_100px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.15)] h-full flex flex-col justify-between"
          >
            <div>
              {/* Inspection Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                    OPERATIONAL TELEMETRY INSPECTOR
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                  {activeNode.telemetry}
                </span>
              </div>

              {/* Node Title & Description */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  {activeNode.icon}
                </div>
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                    {activeNode.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {activeNode.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                {activeNode.summary}
              </p>

              {/* Architectural Capabilities Checklist */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Verified Engine Specifications:
                </span>
                {activeNode.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Proof Assurance Pill */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero Marketplace Intermediaries
              </span>
              <span className="text-emerald-400 font-mono font-semibold">
                100% Tenant Isolation
              </span>
            </div>
          </SpatialGlassCard>
        </div>

      </div>
    </SpatialScrollScene>
  );
}
