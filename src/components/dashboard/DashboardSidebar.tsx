"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ShoppingBag,
  BookOpen,
  Layers,
  Brain,
  BarChart3,
  Radio,
  Settings,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  Users,
  Calendar as CalendarIcon,
  CheckSquare,
  Contact,
  Bot,
  Phone,
  Cpu,
  Plus,
  Zap,
  Sparkles,
  Search,
  Volume2,
  Pause,
  Play,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  useDashboardStore,
  type DashboardSection,
} from "../../store/dashboardStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";
import { GlassSheet } from "../ui/GlassSheet";
import { navPillSpring, sidebarSpring, MOTION_EASE, liquidSpring } from "../../lib/motionVariants";

/* ─────────────────────────────────────────────────────────────
   GLASSY SIDEBAR V7 (VIDEO REFERENCE 02)
   Features:
   1. Floating vertical glass capsule dock (rounded-[32px], deep obsidian blur)
   2. Sleek round expand/collapse trigger button (chevron toggle at brand header)
   3. Collapsed search squircle with `Search ⌘K` tooltip -> full search bar in expanded state
   4. Liquid glass icon squircles with distinct color glow
   5. Dynamic sliding highlight pill on active item (`layoutId="activeSidebarPill"`)
   6. Active indicator dot on collapsed dock
   7. Hover flyout submenu on compound items (e.g. Workflows)
   8. Categorized group headers ("CORE" and "AUTOMATION & OPS")
   9. Embedded Live AI Receptionist activity widget with equalizer bars
   10. Interactive AI Auto-Pilot toggle switch
   11. User profile card with online status and sign-out
   12. Fully keyboard navigable and zoom resilient
   ───────────────────────────────────────────────────────────── */

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  group: "core" | "ai" | "ops";
  squircleColor: string;
  subItems?: { label: string; action: () => void }[];
}

export function DashboardSidebar() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const workflows = useAuthStore((s) => s.workflows);
  const connectedChannels = useAuthStore((s) => s.connectedChannels);

  const activeSection = useDashboardStore((s) => s.activeSection);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const conversations = useDashboardStore((s) => s.conversations);

  const isCollapsed = useDashboardStore((s) => s.isSidebarCollapsed);
  const setIsCollapsed = useDashboardStore((s) => s.setSidebarCollapsed);

  const openCommandCenter = useUIStore((s) => s.openCommandCenter);

  // Auto-collapse on medium tablet screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640 && window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  const connectedChannelsCount = connectedChannels.filter((c) => c.isConnected).length;
  const unreadConversationsCount = conversations.filter((c) => c.unread).length;

  const [flyoutState, setFlyoutState] = useState<{ item: SidebarItem; top: number } | null>(null);
  const [tooltipState, setTooltipState] = useState<{ label: string; badge?: string | number; top: number } | null>(null);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isQuickHubOpen, setIsQuickHubOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement>(null);
  const asideContainerRef = useRef<HTMLDivElement>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      setFlyoutState(null);
      setTooltipState(null);
    }
  }, [isCollapsed]);

  const handleItemMouseEnter = (item: SidebarItem, e: React.MouseEvent<HTMLButtonElement>) => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    if (!isCollapsed) return;

    const asideRect = asideContainerRef.current?.getBoundingClientRect();
    const btnRect = e.currentTarget.getBoundingClientRect();
    if (!asideRect) return;

    const top = btnRect.top - asideRect.top;

    if (item.subItems && item.subItems.length > 0) {
      setTooltipState(null);
      setFlyoutState({ item, top });
    } else {
      setFlyoutState(null);
      setTooltipState({ label: item.label, badge: item.badge, top: top + btnRect.height / 2 });
    }
  };

  const handleItemMouseLeave = () => {
    setTooltipState(null);
    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyoutState(null);
    }, 200);
  };

  // Dynamic calendar date
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dayNum = today.getDate();

  const handleDesktopNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const buttons = Array.from(
      desktopNavRef.current?.querySelectorAll<HTMLButtonElement>("button[data-nav-item='true']") || []
    );
    if (buttons.length === 0) return;
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    e.preventDefault();
    if (e.key === "Home") {
      buttons[0]?.focus();
    } else if (e.key === "End") {
      buttons[buttons.length - 1]?.focus();
    } else if (e.key === "ArrowDown") {
      buttons[(idx + 1 + buttons.length) % buttons.length]?.focus();
    } else if (e.key === "ArrowUp") {
      buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const menuItems: SidebarItem[] = [
    // Core Group
    {
      id: "overview",
      label: "Overview",
      icon: <Home className="w-4.5 h-4.5" />,
      group: "core",
      squircleColor: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35",
    },
    {
      id: "conversations",
      label: "Inbox",
      icon: <MessageSquare className="w-4.5 h-4.5" />,
      badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined,
      group: "core",
      squircleColor: "from-blue-500/25 to-indigo-600/15 text-blue-300 border-blue-400/35",
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: <Layers className="w-4.5 h-4.5" />,
      badge: activeWorkflowsCount > 0 ? activeWorkflowsCount : undefined,
      group: "core",
      squircleColor: "from-purple-500/25 to-violet-600/15 text-purple-300 border-purple-400/35",
      subItems: [
        { label: "Lead Follow-up Flow", action: () => setActiveSection("workflows") },
        { label: "AI Booking Assistant", action: () => setActiveSection("workflows") },
        { label: "Review Auto-Responder", action: () => setActiveSection("workflows") },
      ],
    },
    {
      id: "crm",
      label: "Customers",
      icon: <Users className="w-4.5 h-4.5" />,
      group: "core",
      squircleColor: "from-emerald-500/25 to-green-600/15 text-emerald-300 border-emerald-400/35",
      subItems: [
        { label: "Active Clients", action: () => setActiveSection("crm") },
        { label: "New Prospects", action: () => setActiveSection("crm") },
      ],
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-[7px] font-bold text-amber-300 tracking-tighter">{dayName}</span>
          <span className="text-[11px] font-extrabold text-white leading-none">{dayNum}</span>
        </div>
      ),
      badge: "10:30",
      group: "core",
      squircleColor: "from-amber-500/25 to-orange-600/15 text-amber-300 border-amber-400/35",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-4.5 h-4.5" />,
      group: "core",
      squircleColor: "from-rose-500/25 to-pink-600/15 text-rose-300 border-rose-400/35",
    },

    // Automation & Ops Group
    {
      id: "knowledge",
      label: "Knowledge",
      icon: <BookOpen className="w-4.5 h-4.5" />,
      group: "ops",
      squircleColor: "from-sky-500/25 to-cyan-600/15 text-sky-300 border-sky-400/35",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare className="w-4.5 h-4.5" />,
      group: "ops",
      squircleColor: "from-amber-500/25 to-yellow-600/15 text-amber-300 border-amber-400/35",
    },
    {
      id: "team",
      label: "Team",
      icon: <Contact className="w-4.5 h-4.5" />,
      group: "ops",
      squircleColor: "from-teal-500/25 to-emerald-600/15 text-teal-300 border-teal-400/35",
    },
    {
      id: "playground",
      label: "AI Playground",
      icon: <Brain className="w-4.5 h-4.5" />,
      group: "ai",
      squircleColor: "from-purple-500/25 to-fuchsia-600/15 text-purple-300 border-purple-400/35",
    },
    {
      id: "agents",
      label: "AI Receptionist",
      icon: <Bot className="w-4.5 h-4.5" />,
      badge: "Live",
      group: "ai",
      squircleColor: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35",
    },
    {
      id: "voice",
      label: "Voice AI",
      icon: <Phone className="w-4.5 h-4.5" />,
      group: "ai",
      squircleColor: "from-cyan-500/25 to-blue-600/15 text-cyan-300 border-cyan-400/35",
    },
    {
      id: "os",
      label: "Business OS",
      icon: <Cpu className="w-4.5 h-4.5" />,
      group: "ai",
      squircleColor: "from-indigo-500/25 to-violet-600/15 text-indigo-300 border-indigo-400/35",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-4.5 h-4.5" />,
      group: "ops",
      squircleColor: "from-cyan-500/25 to-teal-600/15 text-cyan-300 border-cyan-400/35",
    },
    {
      id: "channels",
      label: "Channels",
      icon: <Radio className="w-4.5 h-4.5" />,
      badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined,
      group: "ops",
      squircleColor: "from-blue-500/25 to-sky-600/15 text-blue-300 border-blue-400/35",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4.5 h-4.5" />,
      group: "ops",
      squircleColor: "from-zinc-500/25 to-zinc-600/15 text-zinc-300 border-zinc-400/35",
    },
  ];

  const coreItems = menuItems.filter((i) => i.group === "core");
  const opsItems = menuItems.filter((i) => i.group !== "core");

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP FLOATING LIQUID GLASS DOCK CAPSULE (V7 REFERENCE 02)
          ───────────────────────────────────────────────────────────── */}
      <motion.aside
        aria-label="Dashboard sidebar"
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={sidebarSpring}
        className="hidden sm:flex flex-col h-[calc(100vh-24px)] fixed left-3 top-3 z-40 select-none"
      >
        <div
          ref={asideContainerRef}
          className="glass-card-obsidian rounded-[32px] flex flex-col h-full border border-white/[0.14] shadow-[0_20px_60px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] relative overflow-visible"
        >
          
          {/* 1. Header with Brand & Floating Chevron Trigger Button */}
          <div
            className={cn(
              "flex items-center pt-4 pb-3 px-3 relative border-b border-white/[0.06]",
              isCollapsed ? "justify-center" : "justify-between px-4"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Brand Squircle */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
                <img
                  src="/logo.svg"
                  alt="StarX"
                  className="w-5 h-5 object-contain"
                />
              </div>

              {/* Brand Text & Badge (Expanded) */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="sidebar-brand-expanded"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.16, ease: MOTION_EASE.premium }}
                    className="flex flex-col min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight truncate">
                        StarX Flow
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 rounded-full">
                        PRO
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                      {user?.businessName || "Studio workspace"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* V7 Floating Chevron Toggle Button (Situated on header edge) */}
            <motion.button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "w-7 h-7 rounded-full bg-[#0c1a15] border border-emerald-400/40 flex items-center justify-center text-zinc-300 hover:text-emerald-300 hover:border-emerald-400/70 transition-colors shadow-[0_4px_14px_rgba(0,0,0,0.6)] cursor-pointer z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                isCollapsed
                  ? "absolute -right-3.5 top-5"
                  : "relative"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-emerald-300" />
              )}
            </motion.button>
          </div>

          {/* 2. Search Component (Squircle in Collapsed, Full Glass Bar in Expanded) */}
          <div className="px-3 pt-3 pb-1 relative z-10">
            {isCollapsed ? (
              <div className="relative flex justify-center">
                <button
                  type="button"
                  onClick={openCommandCenter}
                  onMouseEnter={(e) => {
                    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                    setFlyoutState(null);
                    const asideRect = asideContainerRef.current?.getBoundingClientRect();
                    const btnRect = e.currentTarget.getBoundingClientRect();
                    if (asideRect) {
                      setTooltipState({
                        label: "Search",
                        badge: "⌘K",
                        top: btnRect.top - asideRect.top + btnRect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltipState(null)}
                  aria-label="Search and command center (Press ⌘K)"
                  className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm group"
                >
                  <Search className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openCommandCenter}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.07] text-xs text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-zinc-400 group-hover:text-emerald-300 transition-colors" />
                  <span>Search commands...</span>
                </div>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">
                  ⌘K
                </kbd>
              </button>
            )}
          </div>

          {/* 3. Navigation Items Scroll Area with Staggered Groups */}
          <nav
            ref={desktopNavRef}
            onKeyDown={handleDesktopNavKeyDown}
            className="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto console-scroll relative z-10"
          >
            {/* Group 1: Core / Favorites */}
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 py-1 select-none">
                  Core
                </p>
              )}
              {coreItems.map((item) => renderNavItem(item))}
            </div>

            {/* Group 2: Automation & Ops */}
            <div className="space-y-1 pt-1 border-t border-white/[0.05]">
              {!isCollapsed && (
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 py-1 select-none">
                  Automation &amp; Ops
                </p>
              )}
              {opsItems.map((item) => renderNavItem(item))}
            </div>
          </nav>

          {/* 4. Lower Widget & Controls (Expanded Only) */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: MOTION_EASE.premium }}
                className="px-3 py-2 space-y-2 border-t border-white/[0.06] overflow-hidden"
              >
                {/* Embedded Live AI Receptionist Mini Activity Card (Matching V7 music player widget) */}
                <div className="rounded-2xl p-3 bg-black/35 border border-white/[0.08] flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/18 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate leading-tight">
                          AI Receptionist
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                      </div>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        Active on 3 channels
                      </span>
                    </div>
                  </div>

                  {/* Equalizer animation & play/pause toggle */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-end gap-0.5 h-4">
                      {[10, 16, 8, 14].map((h, i) => (
                        <motion.span
                          key={i}
                          animate={isPlayingAudio ? { height: [4, h, 6, h * 0.8, 4] } : { height: 4 }}
                          transition={{
                            duration: 0.8 + i * 0.15,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                          className="w-0.5 bg-emerald-400 rounded-full"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                      aria-label={isPlayingAudio ? "Pause live agent" : "Resume live agent"}
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Auto-Pilot Switch Toggle */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200">AI Auto-Pilot</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
                    aria-label="Toggle autonomous mode"
                    className={cn(
                      "w-9 h-5 rounded-full transition-colors duration-200 p-0.5 relative cursor-pointer border",
                      isAutoPilotActive
                        ? "bg-emerald-500/35 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        : "bg-white/[0.08] border-white/15"
                    )}
                  >
                    <motion.div
                      animate={{ x: isAutoPilotActive ? 16 : 0 }}
                      transition={liquidSpring}
                      className={cn(
                        "w-3.5 h-3.5 rounded-full shadow-sm",
                        isAutoPilotActive ? "bg-emerald-400" : "bg-zinc-400"
                      )}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. Footer Profile & Sign-out */}
          <div className="p-3 border-t border-white/[0.07] relative z-10">
            <div
              className={cn(
                "flex items-center justify-between rounded-2xl transition-colors",
                isCollapsed ? "flex-col gap-2" : "px-1.5 py-1"
              )}
            >
              {/* User Avatar with Green Live Dot */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/15 flex items-center justify-center font-bold text-white text-xs shadow-md">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "SX"}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#09120f]" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 max-w-[130px]">
                    <span className="text-xs font-bold text-white truncate leading-tight">
                      {user?.name || "Partner"}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {user?.businessName || user?.email || "My Business"}
                    </span>
                  </div>
                )}
              </div>

              {/* Sign Out Action Button */}
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "flex items-center justify-center text-zinc-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer",
                  isCollapsed ? "w-9 h-9" : ""
                )}
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              V7 FLOATING GLASS TOOLTIP (COLLAPSED DOCK, ROOT LEVEL)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && tooltipState && !flyoutState && (
              <motion.div
                initial={{ opacity: 0, x: 6, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 6, scale: 0.95 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                style={{ top: tooltipState.top }}
                className="absolute left-full ml-3 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl bg-[#08120e]/95 backdrop-blur-2xl border border-emerald-500/30 text-xs font-semibold text-white whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-2 pointer-events-none select-none"
              >
                <span>{tooltipState.label}</span>
                {tooltipState.badge !== undefined && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                      tooltipState.badge === "⌘K"
                        ? "font-mono bg-white/10 text-zinc-300 border border-white/15"
                        : "bg-red-500 text-white"
                    )}
                  >
                    {tooltipState.badge}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─────────────────────────────────────────────────────────────
              V7 CASCADING FLYOUT SUBMENU (COLLAPSED DOCK, ROOT LEVEL)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && flyoutState && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.94 }}
                transition={{ duration: 0.16, ease: MOTION_EASE.premium }}
                style={{ top: flyoutState.top }}
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={() => {
                  setFlyoutState(null);
                }}
                className="absolute left-full ml-3 z-50 p-2 rounded-2xl bg-[#07100c]/95 backdrop-blur-2xl border border-emerald-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.18)] min-w-[200px] space-y-1 select-none"
              >
                <p className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-wider px-2.5 py-1 border-b border-white/[0.08]">
                  {flyoutState.item.label} Quick Access
                </p>
                {flyoutState.item.subItems?.map((sub, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      sub.action();
                      setFlyoutState(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-emerald-500/18 transition-all flex items-center justify-between group/sub cursor-pointer"
                  >
                    <span className="truncate">{sub.label}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 group-hover/sub:text-emerald-300 group-hover/sub:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE NAVIGATION TABS V10 FLOATING CAPSULE (PRESERVED)
          ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile dashboard navigation"
        className="sm:hidden fixed bottom-3 inset-x-0 z-40 px-3 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom)]"
      >
        <div className="pointer-events-auto glass-capsule-nav rounded-full px-2 py-1.5 flex items-center justify-between gap-1 w-full max-w-[390px]">
          {/* Home / Overview */}
          <button
            type="button"
            onClick={() => setActiveSection("overview")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold transition-colors relative cursor-pointer",
              activeSection === "overview" ? "text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {activeSection === "overview" && (
              <motion.span
                layoutId="mobile-capsule-active"
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/20 border border-emerald-400/40 -z-10 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              />
            )}
            <Home className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Home</span>
          </button>

          {/* CRM / Customers */}
          <button
            type="button"
            onClick={() => setActiveSection("crm")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold transition-colors relative cursor-pointer",
              activeSection === "crm" ? "text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {activeSection === "crm" && (
              <motion.span
                layoutId="mobile-capsule-active"
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/20 border border-emerald-400/40 -z-10 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              />
            )}
            <Users className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Leads</span>
          </button>

          {/* Inbox / Conversations */}
          <button
            type="button"
            onClick={() => setActiveSection("conversations")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold transition-colors relative cursor-pointer",
              activeSection === "conversations" ? "text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {activeSection === "conversations" && (
              <motion.span
                layoutId="mobile-capsule-active"
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/20 border border-emerald-400/40 -z-10 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              />
            )}
            <div className="relative">
              <MessageSquare className="w-4 h-4" />
              {unreadConversationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className="text-[9px] mt-0.5">Inbox</span>
          </button>

          {/* Workflows */}
          <button
            type="button"
            onClick={() => setActiveSection("workflows")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold transition-colors relative cursor-pointer",
              activeSection === "workflows" ? "text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {activeSection === "workflows" && (
              <motion.span
                layoutId="mobile-capsule-active"
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/20 border border-emerald-400/40 -z-10 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              />
            )}
            <Layers className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Flows</span>
          </button>

          {/* More Sheet Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMoreOpen(true)}
            aria-label="Open full dashboard navigation"
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Sheet */}
      <GlassSheet
        open={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        title="Navigation Menu"
        side="bottom"
      >
        <div className="grid grid-cols-3 gap-3 py-4 max-h-[70vh] overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                setIsMobileMoreOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer",
                activeSection === item.id
                  ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-1.5">
                {item.icon}
              </div>
              <span className="text-xs font-medium truncate w-full">{item.label}</span>
            </button>
          ))}
        </div>
      </GlassSheet>
    </>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER NAVIGATION ITEM (COLLAPSED & EXPANDED)
     ───────────────────────────────────────────────────────────── */
  function renderNavItem(item: SidebarItem) {
    const isActive = activeSection === item.id;

    return (
      <div key={item.id} className="relative">
        <button
          type="button"
          data-nav-item="true"
          aria-current={isActive ? "page" : undefined}
          onClick={() => {
            setActiveSection(item.id);
            setFlyoutState(null);
          }}
          onMouseEnter={(e) => handleItemMouseEnter(item, e)}
          onMouseLeave={handleItemMouseLeave}
          className={cn(
            "w-full flex items-center gap-3 rounded-2xl text-sm font-medium transition-all duration-200 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 select-none",
            isCollapsed ? "justify-center p-1.5" : "px-3 py-2",
            isActive
              ? "text-white"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
          )}
        >
          {/* Active Navigation Sliding Highlight Pill (Expanded State) */}
          {!isCollapsed && isActive && (
            <motion.span
              layoutId="activeSidebarPill"
              transition={navPillSpring}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-emerald-500/12 to-emerald-500/5 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] -z-10"
            />
          )}

          {/* Active Indicator Dot on Collapsed Dock (Left edge) */}
          {isCollapsed && isActive && (
            <motion.span
              layoutId="activeDockDot"
              transition={navPillSpring}
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />
          )}

          {/* Liquid Glass App Squircle Icon Container */}
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 relative shadow-sm",
              isActive
                ? cn("bg-gradient-to-br shadow-[0_0_16px_rgba(16,185,129,0.3)]", item.squircleColor)
                : "bg-white/[0.04] border-white/10 group-hover:border-white/25 group-hover:bg-white/[0.07] text-zinc-300 group-hover:text-white"
            )}
          >
            {item.icon}

            {/* Notification Badge on Collapsed Dock Icon (top-right corner) */}
            {isCollapsed && item.badge !== undefined && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white border-2 border-[#09120f] text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-md leading-none">
                {item.badge}
              </span>
            )}
          </div>

          {/* Expanded Label and Badges */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                className="flex items-center justify-between flex-1 min-w-0"
              >
                <span className="truncate text-[13px] font-semibold tracking-tight">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-full ml-auto tabular-nums",
                      typeof item.badge === "number"
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    );
  }
}
