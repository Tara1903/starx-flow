"use client";

import React from "react";
import { motion } from "motion/react";
import { Plus, Brain, MessageSquare, Radio, ArrowRight } from "lucide-react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import {
  liquidStaggerGrid,
  liquidCardEntrance,
  liquidHoverLift,
  liquidTapPress,
} from "../../lib/motionVariants";

interface ActionItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
  section: DashboardSection;
  ctaText: string;
  colorClass: string;
  hoverColorClass: string;
}

interface QuickActionsProps {
  onNewWorkflowClick?: () => void;
}

export function QuickActions({ onNewWorkflowClick }: QuickActionsProps) {
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  const actions: ActionItem[] = [
    {
      title: "Build Flow Node",
      desc: "Deploy customized trigger & action rules",
      icon: <Plus className="w-5 h-5" />,
      section: "workflows",
      ctaText: "Add Workflow",
      colorClass: "text-emerald-300 bg-emerald-500/18 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.25)]",
      hoverColorClass: "group-hover:border-emerald-300/60 group-hover:bg-emerald-500/28 group-hover:scale-110"
    },
    {
      title: "Test AI Sandbox",
      desc: "Simulate and tune custom prompt replies",
      icon: <Brain className="w-5 h-5" />,
      section: "playground",
      ctaText: "AI Lab",
      colorClass: "text-purple-300 bg-purple-500/18 border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.22),inset_0_1px_0_rgba(255,255,255,0.25)]",
      hoverColorClass: "group-hover:border-purple-300/60 group-hover:bg-purple-500/28 group-hover:scale-110"
    },
    {
      title: "Triage Live Inbox",
      desc: "Respond directly to incoming customer chats",
      icon: <MessageSquare className="w-5 h-5" />,
      section: "conversations",
      ctaText: "View Chats",
      colorClass: "text-pink-300 bg-pink-500/18 border-pink-400/30 shadow-[0_0_20px_rgba(236,72,153,0.22),inset_0_1px_0_rgba(255,255,255,0.25)]",
      hoverColorClass: "group-hover:border-pink-300/60 group-hover:bg-pink-500/28 group-hover:scale-110"
    },
    {
      title: "Setup Integrations",
      desc: "Configure WhatsApp, SMS, or Google GBP",
      icon: <Radio className="w-5 h-5" />,
      section: "channels",
      ctaText: "Connections",
      colorClass: "text-cyan-300 bg-cyan-500/18 border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.22),inset_0_1px_0_rgba(255,255,255,0.25)]",
      hoverColorClass: "group-hover:border-cyan-300/60 group-hover:bg-cyan-500/28 group-hover:scale-110"
    }
  ];

  const handleAction = (item: ActionItem) => {
    if (item.section === "workflows" && onNewWorkflowClick) {
      onNewWorkflowClick();
    } else {
      setActiveSection(item.section);
    }
  };

  return (
    <div className="space-y-3 select-none">
      <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</h3>
      </div>
      <motion.div
        variants={liquidStaggerGrid}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {actions.map((item, i) => (
          <motion.button
            type="button"
            key={i}
            data-cursor-spotlight="true"
            data-cursor-hover="true"
            variants={liquidCardEntrance}
            whileHover={liquidHoverLift}
            whileTap={liquidTapPress}
            onClick={() => handleAction(item)}
            className="text-left group cursor-pointer liquid-glass glass-card-obsidian glass-interactive rounded-2xl p-4.5 flex flex-col justify-between min-h-[136px] border border-white/[0.14] hover:border-emerald-400/45"
          >
            {/* Header Icon */}
            <div className="flex items-center justify-between w-full relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${item.colorClass} ${item.hoverColorClass}`}>
                {item.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all duration-300" />
            </div>

            {/* Description */}
            <div className="mt-3 relative z-10">
              <h4 className="text-xs font-bold text-white leading-tight group-hover:text-emerald-200 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-zinc-300/80 mt-1 leading-normal">
                {item.desc}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
