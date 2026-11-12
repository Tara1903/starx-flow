"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, MessageSquare, Layers, Brain, BarChart3, Radio, Settings, Search,
  Sparkles, Plus, TestTube, HelpCircle, Activity, Calendar,
  Users, Calendar as CalendarIcon, CheckSquare, Contact, Bot, Phone, Cpu, LogOut, ShoppingBag, BookOpen
} from "lucide-react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useRouter } from 'next/navigation';
import { liquidSpring } from "../../lib/motionVariants";

import { cn } from "../../lib/utils";

interface DashboardTopBarProps {
  onNewWorkflowClick?: () => void;
}

export function DashboardTopBar({ onNewWorkflowClick }: DashboardTopBarProps) {
  const activeSection = useDashboardStore((s) => s.activeSection);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const workflows = useAuthStore((s) => s.workflows);
  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  
  const logout = useAuthStore((s) => s.logout);
  const openCommandCenter = useUIStore((s) => s.openCommandCenter);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sectionDetails: Record<DashboardSection, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = {
    overview: {
      title: "Command Center",
      subtitle: "Overview of your conversational automations",
      icon: <Home className="w-4 h-4 text-emerald-400" />
    },
    conversations: {
      title: "Unified Inbox",
      subtitle: "Review live customer threads & AI auto-responses",
      icon: <MessageSquare className="w-4 h-4 text-pink-400" />
    },
    workflows: {
      title: "Automation Flows",
      subtitle: "Configure instant triggers & intelligent AI actions",
      icon: <Layers className="w-4 h-4 text-blue-400" />
    },
    crm: {
      title: "Customer Directory",
      subtitle: "Manage all leads and client relationships",
      icon: <Users className="w-4 h-4 text-emerald-400" />
    },
    calendar: {
      title: "Bookings",
      subtitle: "Manage your upcoming appointments and schedule",
      icon: <CalendarIcon className="w-4 h-4 text-indigo-400" />
    },
    orders: {
      title: "Orders & Operations",
      subtitle: "Track European customer orders, payments and fulfillment",
      icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />
    },
    knowledge: {
      title: "Knowledge Base",
      subtitle: "Manage vectorized business FAQs, policies and documents",
      icon: <BookOpen className="w-4 h-4 text-sky-400" />
    },
    tasks: {
      title: "Tasks",
      subtitle: "Track internal to-dos and team assignments",
      icon: <CheckSquare className="w-4 h-4 text-amber-500" />
    },
    team: {
      title: "Team Management",
      subtitle: "Manage staff access and permissions",
      icon: <Contact className="w-4 h-4 text-rose-400" />
    },
    playground: {
      title: "AI Training Lab",
      subtitle: "Test custom prompts and responses in a real-time sandbox",
      icon: <Brain className="w-4 h-4 text-purple-400" />
    },
    analytics: {
      title: "Performance Analytics",
      subtitle: "Track automated conversations, hours saved, and engagement rates",
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />
    },
    channels: {
      title: "Integrations Manager",
      subtitle: "Connect and monitor your customer messaging platforms",
      icon: <Radio className="w-4 h-4 text-cyan-400" />
    },
    settings: {
      title: "System Settings",
      subtitle: "Configure business hours, profile settings, and handoff rules",
      icon: <Settings className="w-4 h-4 text-zinc-400" />
    },
    workflow_editor: {
      title: "Workflow Engine",
      subtitle: "Design linear automated paths with triggers, conditions, and actions",
      icon: <Layers className="w-4 h-4 text-purple-400" />
    },
    agents: {
      title: "AI Specialist Workers",
      subtitle: "Manage role prompt tuning, permissions, and shared memories for autonomous agents",
      icon: <Bot className="w-4 h-4 text-emerald-400" />
    },
    voice: {
      title: "Voice Assistant",
      subtitle: "Monitor AI-answered phone calls, review transcriptions, and analyze voice interactions",
      icon: <Phone className="w-4 h-4 text-emerald-400" />
    },
    os: {
      title: "Business OS CommandCenter",
      subtitle: "Executive dashboard monitoring goals, business logic settings, and autonomous run loop activity",
      icon: <Cpu className="w-4 h-4 text-emerald-400" />
    }
  };

  const details = sectionDetails[activeSection] || sectionDetails.overview;

  const formatLocalDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.12] bg-[#040a08]/80 backdrop-blur-md shadow-[0_12px_34px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(16,185,129,0.12)] select-none">
      {/* Title / Breadcrumb with smooth animated swap */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 min-w-0"
        >
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-white/[0.05] border border-emerald-400/25 items-center justify-center shadow-[0_0_22px_rgba(16,185,129,0.16)] flex-shrink-0">
            {details.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
              <span>Console</span>
              <span>/</span>
              <span className="text-emerald-300 truncate">{activeSection}</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight mt-0.5 sm:text-lg truncate">
              {details.title}
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Actions and Context Info */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Command Center Quick Jump (⌘K) */}
        <button
          type="button"
          onClick={openCommandCenter}
          aria-label="Open command center search (Ctrl+K)"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/12 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-emerald-400/35 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline">Search</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/[0.06] border border-white/10 text-zinc-300">
            ⌘K
          </kbd>
        </button>

        {/* Calendar / Date */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/12 text-[11px] font-semibold text-zinc-200 tabular-nums">
          <Calendar className="w-3.5 h-3.5 text-emerald-300" />
          <span suppressHydrationWarning>{formatLocalDate()}</span>
        </div>

        {/* Live Indicator (Desktop Only) */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/14 border border-emerald-400/35 rounded-full px-3.5 py-1.5 shadow-[0_0_20px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-200 tracking-wide uppercase tabular-nums">
            {activeWorkflowsCount} Active Flows
          </span>
        </div>

        {/* Dynamic Context Button based on Section */}
        {activeSection === "overview" && (
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={liquidSpring}
              onClick={() => setActiveSection("playground")}
              className="hidden xs:flex items-center gap-1.5 text-xs font-semibold py-2 px-3 sm:px-3.5 rounded-full bg-white/[0.06] border border-white/14 text-zinc-100 hover:border-emerald-400/40 cursor-pointer"
            >
              <TestTube className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Test AI</span>
            </motion.button>
            {onNewWorkflowClick && (
              <motion.button
                type="button"
                whileHover={{ y: -1, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={liquidSpring}
                onClick={onNewWorkflowClick}
                data-cursor-spotlight="button"
                className="btn-emerald-glow flex items-center gap-1.5 text-xs font-bold py-2 px-3 sm:px-4 rounded-full cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Build Flow</span>
              </motion.button>
            )}
          </div>
        )}

        {activeSection === "workflows" && onNewWorkflowClick && (
          <motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={liquidSpring}
            onClick={onNewWorkflowClick}
            data-cursor-spotlight="button"
            className="btn-emerald-glow flex items-center gap-1.5 text-xs font-bold py-2 px-3 sm:px-4 rounded-full cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Workflow</span>
          </motion.button>
        )}

        {activeSection === "conversations" && (
          <motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={liquidSpring}
            onClick={() => setActiveSection("playground")}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/14 text-emerald-200 border border-emerald-400/35 py-2 px-3 sm:px-4 rounded-full hover:bg-emerald-500/22 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Train AI Receptionist</span>
          </motion.button>
        )}

        {/* Logout Icon */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleLogout}
          className="flex items-center justify-center w-8 h-8 rounded-full liquid-glass text-zinc-300 hover:text-white hover:border-red-400/40 transition-colors cursor-pointer"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
}
