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
  Home,
  Users,
  Calendar as CalendarIcon,
  CheckSquare,
  Contact,
  Bot,
  Phone,
  Cpu,
  Search,
  Zap,
  Pause,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  useDashboardStore,
  type DashboardSection,
} from "../../store/dashboardStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";
import { navPillSpring, sidebarSpring, MOTION_EASE, liquidSpring } from "../../lib/motionVariants";

/* ─────────────────────────────────────────────────────────────
   EXECUTIVE FULL-HEIGHT LIQUID GLASS SIDEBAR DOCK
   Features:
   1. Full-height dock (fixed inset-y-0 left-0, 100vh / 100dvh)
   2. 100% Non-scrollable in both extended (280px) and collapsed (72px) states
   3. All 16 dashboard areas accessible directly
   4. Category filter pills: All (16) | Core (6) | AI (4) | Ops (6)
   5. Sleek brand header with smooth expand/collapse toggle
   6. Command Center ⌘K search bar
   7. Streamlined live AI Receptionist & Auto-Pilot control capsule
   8. User profile card with active status and 1-click sign-out
   9. Floating liquid-glass tooltips & flyouts in collapsed state
   10. Fully keyboard navigable (Arrow keys, Home, End)
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

  // Category filter state for expanded mode
  const [selectedCategory, setSelectedCategory] = useState<"all" | "core" | "ai" | "ops">("all");

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
  const [tooltipState, setTooltipState] = useState<{ label: string; badge?: string | number; groupName?: string; top: number } | null>(null);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
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
      const groupName = item.group === "core" ? "Core" : item.group === "ai" ? "AI Suite" : "Operations";
      setTooltipState({ label: item.label, badge: item.badge, groupName, top: top + btnRect.height / 2 });
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

  // All 16 Dashboard Sections
  const menuItems: SidebarItem[] = [
    // ── Group 1: Core (6) ──
    {
      id: "overview",
      label: "Overview",
      icon: <Home className="w-3.5 h-3.5" />,
      group: "core",
      squircleColor: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35",
    },
    {
      id: "conversations",
      label: "Inbox",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined,
      group: "core",
      squircleColor: "from-blue-500/25 to-indigo-600/15 text-blue-300 border-blue-400/35",
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: <Layers className="w-3.5 h-3.5" />,
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
      icon: <Users className="w-3.5 h-3.5" />,
      group: "core",
      squircleColor: "from-emerald-500/25 to-green-600/15 text-emerald-300 border-emerald-400/35",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-[6px] font-bold text-amber-300 tracking-tighter">{dayName}</span>
          <span className="text-[9px] font-extrabold text-white leading-none">{dayNum}</span>
        </div>
      ),
      badge: "10:30",
      group: "core",
      squircleColor: "from-amber-500/25 to-orange-600/15 text-amber-300 border-amber-400/35",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      group: "core",
      squircleColor: "from-rose-500/25 to-pink-600/15 text-rose-300 border-rose-400/35",
    },

    // ── Group 2: AI Suite (4) ──
    {
      id: "agents",
      label: "AI Receptionist",
      icon: <Bot className="w-3.5 h-3.5" />,
      badge: "Live",
      group: "ai",
      squircleColor: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35",
    },
    {
      id: "voice",
      label: "Voice AI",
      icon: <Phone className="w-3.5 h-3.5" />,
      group: "ai",
      squircleColor: "from-cyan-500/25 to-blue-600/15 text-cyan-300 border-cyan-400/35",
    },
    {
      id: "playground",
      label: "AI Playground",
      icon: <Brain className="w-3.5 h-3.5" />,
      group: "ai",
      squircleColor: "from-purple-500/25 to-fuchsia-600/15 text-purple-300 border-purple-400/35",
    },
    {
      id: "os",
      label: "Business OS",
      icon: <Cpu className="w-3.5 h-3.5" />,
      group: "ai",
      squircleColor: "from-indigo-500/25 to-violet-600/15 text-indigo-300 border-indigo-400/35",
    },

    // ── Group 3: Operations & Config (6) ──
    {
      id: "knowledge",
      label: "Knowledge",
      icon: <BookOpen className="w-3.5 h-3.5" />,
      group: "ops",
      squircleColor: "from-sky-500/25 to-cyan-600/15 text-sky-300 border-sky-400/35",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      group: "ops",
      squircleColor: "from-amber-500/25 to-yellow-600/15 text-amber-300 border-amber-400/35",
    },
    {
      id: "team",
      label: "Team",
      icon: <Contact className="w-3.5 h-3.5" />,
      group: "ops",
      squircleColor: "from-teal-500/25 to-emerald-600/15 text-teal-300 border-teal-400/35",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      group: "ops",
      squircleColor: "from-cyan-500/25 to-teal-600/15 text-cyan-300 border-cyan-400/35",
    },
    {
      id: "channels",
      label: "Channels",
      icon: <Radio className="w-3.5 h-3.5" />,
      badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined,
      group: "ops",
      squircleColor: "from-blue-500/25 to-sky-600/15 text-blue-300 border-blue-400/35",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-3.5 h-3.5" />,
      group: "ops",
      squircleColor: "from-zinc-500/25 to-zinc-600/15 text-zinc-300 border-zinc-400/35",
    },
  ];

  // Filter items based on selected category in expanded mode (in collapsed, show all 16)
  const displayedItems = isCollapsed
    ? menuItems
    : selectedCategory === "all"
      ? menuItems
      : menuItems.filter((i) => i.group === selectedCategory);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP FULL-HEIGHT DOCKED SIDEBAR (100% NON-SCROLLABLE)
          ───────────────────────────────────────────────────────────── */}
      <motion.aside
        aria-label="Dashboard sidebar"
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={sidebarSpring}
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-40 select-none h-screen h-[100dvh]"
      >
        <div
          ref={asideContainerRef}
          className="glass-card-obsidian flex flex-col h-full border-r border-white/[0.10] bg-[#030907]/95 backdrop-blur-2xl shadow-[8px_0_32px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* 1. Header with Brand & Sleek Expand/Collapse Toggle Button */}
          <div
            className={cn(
              "flex items-center py-2 px-3 relative border-b border-white/[0.06] flex-shrink-0",
              isCollapsed ? "justify-center" : "justify-between px-3.5"
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Brand Squircle */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <img
                  src="/logo.svg"
                  alt="StarX"
                  className="w-4 h-4 object-contain"
                />
              </div>

              {/* Brand Text & Badge (Expanded) */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="sidebar-brand-expanded"
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0.92, x: -6 }}
                    transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                    className="flex flex-col min-w-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-tight truncate">
                        StarX Flow
                      </span>
                      <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 rounded-full leading-none">
                        PRO
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-400 truncate max-w-[130px]">
                      {user?.businessName || "Studio workspace"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expand / Collapse Chevron Toggle Button */}
            <motion.button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "w-6 h-6 rounded-full bg-[#0c1a15] border border-emerald-400/40 flex items-center justify-center text-zinc-300 hover:text-emerald-300 hover:border-emerald-400/70 transition-colors shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400",
                isCollapsed ? "absolute -right-3 top-3.5 z-50 bg-[#07130e]" : "relative"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5 text-emerald-300" />
              )}
            </motion.button>
          </div>

          {/* 2. Quick Command Search (Expanded: Bar, Collapsed: Squircle) */}
          <div className="px-2.5 pt-1.5 pb-0.5 relative z-10 flex-shrink-0">
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
                        label: "Search commands",
                        badge: "⌘K",
                        top: btnRect.top - asideRect.top + btnRect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltipState(null)}
                  aria-label="Search and command center (Press ⌘K)"
                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm group"
                >
                  <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openCommandCenter}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.07] text-[11px] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-300 transition-colors" />
                  <span>Search commands...</span>
                </div>
                <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">
                  ⌘K
                </kbd>
              </button>
            )}
          </div>

          {/* 3. Category Filter Selector Pills (Expanded Only) */}
          {!isCollapsed && (
            <div className="px-2.5 py-0.5 flex items-center gap-1 border-b border-white/[0.05] flex-shrink-0">
              {(
                [
                  { id: "all", label: "All (16)" },
                  { id: "core", label: "Core" },
                  { id: "ai", label: "AI" },
                  { id: "ops", label: "Ops" },
                ] as const
              ).map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex-1 py-0.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer text-center",
                      isSelected
                        ? "bg-emerald-500/22 text-emerald-300 border border-emerald-400/35 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. Non-Scrollable Navigation Area: strictly overflow-hidden */}
          <nav
            ref={desktopNavRef}
            onKeyDown={handleDesktopNavKeyDown}
            aria-label="Dashboard sections"
            className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden px-1.5 xl:px-2 py-0.5 select-none"
          >
            {displayedItems.map((item, idx) => {
              const prevItem = displayedItems[idx - 1];
              const showGroupDivider =
                selectedCategory === "all" &&
                prevItem &&
                prevItem.group !== item.group;

              return (
                <React.Fragment key={item.id}>
                  {showGroupDivider && (
                    <div className="my-px border-t border-white/[0.05] flex-shrink-0" />
                  )}
                  {renderNavItem(item)}
                </React.Fragment>
              );
            })}
          </nav>

          {/* 5. Streamlined Lower AI Receptionist & Auto-Pilot Control Capsule */}
          <div className="px-2 py-0.5 border-t border-white/[0.06] flex-shrink-0 relative z-10">
            {!isCollapsed ? (
              <div className="rounded-xl px-2 py-1 bg-black/35 border border-white/[0.07] flex items-center justify-between gap-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5.5 h-5.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-white truncate leading-tight">
                        AI Receptionist
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                    </div>
                    <span className="text-[8px] text-zinc-400 block truncate">
                      Active on 3 channels
                    </span>
                  </div>
                </div>

                {/* Equalizer & Auto-Pilot Switch */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex items-end gap-0.5 h-3">
                    {[6, 12, 5, 10].map((h, i) => (
                      <motion.span
                        key={i}
                        animate={isPlayingAudio ? { height: [2.5, h, 4, h * 0.7, 2.5] } : { height: 2.5 }}
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
                    onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
                    title={isAutoPilotActive ? "AI Auto-Pilot Active" : "AI Auto-Pilot Paused"}
                    className={cn(
                      "w-7 h-4 rounded-full transition-colors duration-200 p-0.5 relative cursor-pointer border",
                      isAutoPilotActive
                        ? "bg-emerald-500/35 border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        : "bg-white/[0.08] border-white/15"
                    )}
                  >
                    <motion.div
                      animate={{ x: isAutoPilotActive ? 12 : 0 }}
                      transition={liquidSpring}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isAutoPilotActive ? "bg-emerald-400" : "bg-zinc-400"
                      )}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-0.5">
                <button
                  type="button"
                  onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
                  onMouseEnter={(e) => {
                    const asideRect = asideContainerRef.current?.getBoundingClientRect();
                    const btnRect = e.currentTarget.getBoundingClientRect();
                    if (asideRect) {
                      setTooltipState({
                        label: isAutoPilotActive ? "AI Receptionist: Active" : "AI Receptionist: Paused",
                        badge: "3 ch",
                        top: btnRect.top - asideRect.top + btnRect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltipState(null)}
                  className="w-7 h-7 rounded-lg bg-emerald-500/18 border border-emerald-400/35 flex items-center justify-center text-emerald-300 relative shadow-sm cursor-pointer"
                  title="AI Receptionist live status"
                >
                  <Bot className="w-3 h-3" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                </button>
              </div>
            )}
          </div>

          {/* 6. Footer User Profile & Sign-out */}
          <div className="p-1.5 border-t border-white/[0.06] flex-shrink-0 relative z-10">
            <div
              className={cn(
                "flex items-center justify-between rounded-xl transition-colors",
                isCollapsed ? "flex-col gap-1" : "px-2 py-0.5 bg-white/[0.02] border border-white/[0.06]"
              )}
            >
              {/* User Avatar with Green Live Dot */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 border border-white/15 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#09120f]" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 max-w-[130px]">
                    <span className="text-[11px] font-bold text-white truncate leading-tight">
                      {user?.name || "Partner"}
                    </span>
                    <span className="text-[9px] text-zinc-400 truncate">
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
                  "flex items-center justify-center text-zinc-400 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer",
                  isCollapsed ? "w-7 h-7" : ""
                )}
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING GLASS TOOLTIP (COLLAPSED DOCK)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && tooltipState && !flyoutState && (
              <motion.div
                initial={{ opacity: 0.92, x: 6, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0.92, x: 6, scale: 0.95 }}
                transition={{ duration: 0.12, ease: MOTION_EASE.premium }}
                style={{ top: tooltipState.top }}
                className="absolute left-full ml-3 -translate-y-1/2 z-50 px-2.5 py-1 rounded-xl bg-[#08120e]/95 backdrop-blur-2xl border border-emerald-500/30 text-[11px] font-semibold text-white whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5 pointer-events-none select-none"
              >
                <span>{tooltipState.label}</span>
                {tooltipState.badge !== undefined && (
                  <span
                    className={cn(
                      "text-[8px] px-1.5 py-0.2 rounded-full font-bold",
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
              CASCADING FLYOUT SUBMENU (COLLAPSED DOCK)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && flyoutState && (
              <motion.div
                initial={{ opacity: 0.92, x: 8, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0.92, x: 8, scale: 0.94 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                style={{ top: flyoutState.top }}
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={() => {
                  setFlyoutState(null);
                }}
                className="absolute left-full ml-3 z-50 p-2 rounded-2xl bg-[#07100c]/95 backdrop-blur-2xl border border-emerald-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.18)] min-w-[190px] space-y-1 select-none"
              >
                <p className="text-[9px] font-bold text-emerald-300/80 uppercase tracking-wider px-2 py-0.5 border-b border-white/[0.08]">
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
                    className="w-full text-left px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-emerald-500/18 transition-all flex items-center justify-between group/sub cursor-pointer"
                  >
                    <span className="truncate">{sub.label}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-500 group-hover/sub:text-emerald-300 group-hover/sub:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER NAVIGATION ITEM (COLLAPSED & EXPANDED)
     ───────────────────────────────────────────────────────────── */
  function renderNavItem(item: SidebarItem) {
    const isActive = activeSection === item.id;

    return (
      <div key={item.id} className="relative flex-1 min-h-0 flex items-center">
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
            "w-full h-full min-h-[24px] max-h-[30px] xl:max-h-[34px] flex items-center rounded-lg xl:rounded-xl font-medium transition-all duration-150 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/70 select-none",
            isCollapsed ? "justify-center p-0.5" : "gap-2 px-2 py-0.5",
            isActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
          )}
        >
          {/* Active Navigation Sliding Highlight Pill (Expanded State) */}
          {!isCollapsed && isActive && (
            <motion.span
              layoutId="activeSidebarPill"
              transition={navPillSpring}
              className="absolute inset-0 rounded-lg xl:rounded-xl bg-gradient-to-r from-emerald-500/25 via-emerald-500/12 to-emerald-500/5 border border-emerald-400/40 shadow-[0_0_16px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] -z-10"
            />
          )}

          {/* Active Indicator Dot on Collapsed Dock (Left edge) */}
          {isCollapsed && isActive && (
            <motion.span
              layoutId="activeDockDot"
              transition={navPillSpring}
              className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
            />
          )}

          {/* Liquid Glass App Squircle Icon Container */}
          <div
            className={cn(
              "w-6 h-6 xl:w-6.5 xl:h-6.5 rounded-md xl:rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-200 relative shadow-sm",
              isActive
                ? cn("bg-gradient-to-br shadow-[0_0_12px_rgba(16,185,129,0.3)]", item.squircleColor)
                : "bg-white/[0.04] border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.07] text-zinc-300 group-hover:text-white"
            )}
          >
            {item.icon}

            {/* Notification Badge on Collapsed Dock Icon */}
            {isCollapsed && item.badge !== undefined && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white border border-[#09120f] text-[7px] font-extrabold rounded-full flex items-center justify-center shadow-md leading-none">
                {item.badge}
              </span>
            )}
          </div>

          {/* Expanded Label and Badges */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0.92, x: -6 }}
                transition={{ duration: 0.12, ease: MOTION_EASE.premium }}
                className="flex items-center justify-between flex-1 min-w-0"
              >
                <span className="truncate text-[11.5px] xl:text-[12px] tracking-tight">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 text-[8.5px] font-bold rounded-full ml-auto tabular-nums leading-tight",
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
