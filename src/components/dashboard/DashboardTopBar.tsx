"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Home,
  MessageSquare,
  Layers,
  Brain,
  BarChart3,
  Radio,
  Settings,
  Search,
  Plus,
  FlaskConical,
  Calendar,
  Users,
  CheckSquare,
  Contact,
  Bot,
  Phone,
  Cpu,
  LogOut,
  ShoppingBag,
  BookOpen,
} from "lucide-react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useRouter } from "next/navigation";
import { CONSOLE_BTN_PRIMARY, CONSOLE_BTN_SECONDARY } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface DashboardTopBarProps {
  onNewWorkflowClick?: () => void;
}

const SECTION_META: Record<
  DashboardSection,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  overview: {
    title: "Command center",
    subtitle: "Operations summary and channel throughput",
    icon: Home,
  },
  conversations: {
    title: "Unified inbox",
    subtitle: "Customer threads and AI auto-responses",
    icon: MessageSquare,
  },
  workflows: {
    title: "Workflows",
    subtitle: "Automated triggers and channel rules",
    icon: Layers,
  },
  crm: {
    title: "Customers",
    subtitle: "Leads and client contact records",
    icon: Users,
  },
  calendar: {
    title: "Bookings",
    subtitle: "Scheduled appointments and calendar slots",
    icon: Calendar,
  },
  orders: {
    title: "Orders",
    subtitle: "Payments and fulfillment tracking",
    icon: ShoppingBag,
  },
  knowledge: {
    title: "Knowledge base",
    subtitle: "Business FAQs, policies, and reference docs",
    icon: BookOpen,
  },
  tasks: {
    title: "Tasks",
    subtitle: "Internal follow-ups and assignments",
    icon: CheckSquare,
  },
  team: {
    title: "Team",
    subtitle: "Staff roles and access permissions",
    icon: Contact,
  },
  playground: {
    title: "AI sandbox",
    subtitle: "Test prompts and tone against customer queries",
    icon: Brain,
  },
  analytics: {
    title: "Analytics",
    subtitle: "Conversation volume, hours saved, and channel share",
    icon: BarChart3,
  },
  channels: {
    title: "Channels",
    subtitle: "Messaging integrations and webhook status",
    icon: Radio,
  },
  settings: {
    title: "Settings",
    subtitle: "Workspace hours, billing, and security controls",
    icon: Settings,
  },
  workflow_editor: {
    title: "Workflow editor",
    subtitle: "Configure step triggers, prompts, and channel routing",
    icon: Layers,
  },
  agents: {
    title: "AI specialists",
    subtitle: "Worker roles, prompts, and shared memory",
    icon: Bot,
  },
  voice: {
    title: "Voice receptionist",
    subtitle: "Call logs, recordings, and transcripts",
    icon: Phone,
  },
  os: {
    title: "Business OS",
    subtitle: "Goals, operating rules, and autonomous loop logs",
    icon: Cpu,
  },
};

export function DashboardTopBar({ onNewWorkflowClick }: DashboardTopBarProps) {
  const prefersReduced = useReducedMotion();
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

  const details = SECTION_META[activeSection] || SECTION_META.overview;
  const Icon = details.icon;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16 select-none">
      {/* Title & single-line context */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={prefersReduced ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -3 }}
          transition={{ duration: prefersReduced ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 min-w-0"
        >
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08] items-center justify-center text-[#a1aaa4] flex-shrink-0">
            <Icon className="w-4 h-4" strokeWidth={1.65} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] sm:text-base font-semibold text-[#edf0ee] tracking-[-0.01em] truncate">
              {details.title}
            </h1>
            <p className="hidden md:block text-xs text-[#727c75] truncate">
              {details.subtitle}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={openCommandCenter}
          aria-label="Open command center search (Ctrl+K)"
          className="hidden sm:inline-flex items-center gap-2 px-3 h-8 rounded-lg bg-[#121715] hover:bg-[#19201d] border border-[#edf0ee]/10 text-xs font-medium text-[#a1aaa4] hover:text-[#edf0ee] transition-colors duration-150 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#727c75]" strokeWidth={1.65} />
          <span className="hidden xl:inline">Search</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#19201d] border border-[#edf0ee]/10 text-[#a1aaa4]">
            ⌘K
          </kbd>
        </button>

        <div
          suppressHydrationWarning
          className="hidden lg:inline-flex items-center px-2.5 h-8 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08] text-xs text-[#a1aaa4] tabular-nums"
        >
          {formattedDate}
        </div>

        <div className="hidden md:inline-flex items-center gap-2 h-8 px-2.5 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08] text-xs text-[#a1aaa4] tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" aria-hidden="true" />
          <span>{activeWorkflowsCount} active flows</span>
        </div>

        {activeSection === "overview" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection("playground")}
              className={cn(CONSOLE_BTN_SECONDARY, "hidden xs:inline-flex h-8 py-0 px-3")}
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
              <span className="hidden sm:inline">Test AI</span>
            </button>
            {onNewWorkflowClick && (
              <button
                type="button"
                onClick={onNewWorkflowClick}
                className={cn(CONSOLE_BTN_PRIMARY, "h-8 py-0 px-3.5")}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span className="hidden sm:inline">Build Flow</span>
              </button>
            )}
          </div>
        )}

        {activeSection === "workflows" && onNewWorkflowClick && (
          <button
            type="button"
            onClick={onNewWorkflowClick}
            className={cn(CONSOLE_BTN_PRIMARY, "h-8 py-0 px-3.5")}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">Create workflow</span>
          </button>
        )}

        {activeSection === "conversations" && (
          <button
            type="button"
            onClick={() => setActiveSection("playground")}
            className={cn(CONSOLE_BTN_SECONDARY, "h-8 py-0 px-3")}
          >
            <Brain className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
            <span className="hidden sm:inline">Train receptionist</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#121715] hover:bg-[#19201d] border border-[#edf0ee]/10 text-[#a1aaa4] hover:text-[#edf0ee] transition-colors duration-150 cursor-pointer"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.65} />
        </button>
      </div>
    </header>
  );
}
