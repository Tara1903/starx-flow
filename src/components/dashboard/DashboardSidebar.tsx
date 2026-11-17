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
  CheckSquare,
  Contact,
  Bot,
  Phone,
  Cpu,
  Search,
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Moon,
  Sun,
  ArrowRight,
  Music,
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
   REFINED GLASSY COMMAND CENTER SIDEBAR
   Improvements:
   1. Icon sizing: Increased to comfortable w-4 / w-4.5 inside w-7.5 squircles
   2. Reduced visual clutter: Subtle grouping dividers, refined vertical rhythm
   3. Smooth active sliding pill with layoutId & soft emerald glass highlight
   4. Floating liquid-glass tooltips & unclipped cascading flyouts
   5. Lo-fi / AI Receptionist mini-player with balanced padding and controls
   6. 100% Non-scrollable in both expanded and collapsed states
   7. Retains all 16 navigation destinations without alteration
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

  // Media / Lo-fi player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [audioProgress, setAudioProgress] = useState(38);
  const [isNightShift, setIsNightShift] = useState(true);

  // Auto-collapse on medium tablet and small laptop screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640 && window.innerWidth <= 1024) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  // Audio progress animation simulation
  useEffect(() => {
    if (!isPlayingAudio) return;
    const interval = setInterval(() => {
      setAudioProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  const connectedChannelsCount = connectedChannels.filter((c) => c.isConnected).length;
  const unreadConversationsCount = conversations.filter((c) => c.unread).length;

  const [flyoutState, setFlyoutState] = useState<{ item: SidebarItem; top: number } | null>(null);
  const [tooltipState, setTooltipState] = useState<{ label: string; badge?: string | number; groupName?: string; top: number } | null>(null);
  const [showMediaFlyout, setShowMediaFlyout] = useState(false);
  const [showProfileFlyout, setShowProfileFlyout] = useState(false);

  const desktopNavRef = useRef<HTMLElement>(null);
  const asideContainerRef = useRef<HTMLDivElement>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      setFlyoutState(null);
      setTooltipState(null);
      setShowMediaFlyout(false);
      setShowProfileFlyout(false);
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
      setShowMediaFlyout(false);
      setShowProfileFlyout(false);
      setFlyoutState({ item, top });
    } else {
      setFlyoutState(null);
      setShowMediaFlyout(false);
      setShowProfileFlyout(false);
      const groupName = item.group === "core" ? "Favorites" : item.group === "ai" ? "AI Specialists" : "Operations";
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

  // All 16 Dashboard Sections with Refined Icon Sizing (w-4 / w-4.5)
  const menuItems: SidebarItem[] = [
    // ── Group 1: Favorites / Core ──
    {
      id: "overview",
      label: "Home",
      icon: <Home className="w-4 h-4" />,
      group: "core",
      squircleColor: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35",
    },
    {
      id: "conversations",
      label: "Inbox",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadConversationsCount > 0 ? unreadConversationsCount : 12,
      group: "core",
      squircleColor: "from-blue-500/25 to-indigo-600/15 text-blue-300 border-blue-400/35",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-[7px] font-bold text-amber-300 tracking-tighter uppercase">{dayName}</span>
          <span className="text-[10px] font-extrabold text-white leading-none mt-0.5">{dayNum}</span>
        </div>
      ),
      badge: "10:30",
      group: "core",
      squircleColor: "from-amber-500/25 to-orange-600/15 text-amber-300 border-amber-400/35",
      subItems: [
        { label: "Client Discovery Calls", action: () => setActiveSection("calendar") },
        { label: "Book New Consultation", action: () => setActiveSection("calendar") },
        { label: "Sync Google & Outlook", action: () => setActiveSection("calendar") },
      ],
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: <Layers className="w-4 h-4" />,
      badge: activeWorkflowsCount > 0 ? activeWorkflowsCount : 3,
      group: "core",
      squircleColor: "from-purple-500/25 to-violet-600/15 text-purple-300 border-purple-400/35",
      subItems: [
        { label: "Website Redesign", action: () => setActiveSection("workflows") },
        { label: "Mobile App Workflow", action: () => setActiveSection("workflows") },
        { label: "Brand Kit Generation", action: () => setActiveSection("workflows") },
      ],
    },
    {
      id: "crm",
      label: "Customers",
      icon: <Users className="w-4 h-4" />,
      group: "core",
      squircleColor: "from-emerald-500/25 to-green-600/15 text-emerald-300 border-emerald-400/35",
      subItems: [
        { label: "Active Clients", action: () => setActiveSection("crm") },
        { label: "High-Priority Leads", action: () => setActiveSection("crm") },
        { label: "Export Contacts CSV", action: () => setActiveSection("crm") },
      ],
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      group: "core",
      squircleColor: "from-rose-500/25 to-pink-600/15 text-rose-300 border-rose-400/35",
    },

    // ── Group 2: AI Specialists ──
    {
      id: "agents",
      label: "AI Receptionist",
      icon: <Bot className="w-4 h-4" />,
      badge: "Live",
      group: "ai",
      squircleColor: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35",
      subItems: [
        { label: "Live Call Routing", action: () => setActiveSection("agents") },
        { label: "Voice Persona Config", action: () => setActiveSection("agents") },
        { label: "Knowledge Grounding", action: () => setActiveSection("agents") },
      ],
    },
    {
      id: "voice",
      label: "Voice AI",
      icon: <Phone className="w-4 h-4" />,
      group: "ai",
      squircleColor: "from-cyan-500/25 to-blue-600/15 text-cyan-300 border-cyan-400/35",
    },
    {
      id: "playground",
      label: "AI Playground",
      icon: <Brain className="w-4 h-4" />,
      group: "ai",
      squircleColor: "from-purple-500/25 to-fuchsia-600/15 text-purple-300 border-purple-400/35",
    },
    {
      id: "os",
      label: "Business OS",
      icon: <Cpu className="w-4 h-4" />,
      group: "ai",
      squircleColor: "from-indigo-500/25 to-violet-600/15 text-indigo-300 border-indigo-400/35",
    },

    // ── Group 3: Operations & Workspace ──
    {
      id: "knowledge",
      label: "Knowledge",
      icon: <BookOpen className="w-4 h-4" />,
      group: "ops",
      squircleColor: "from-sky-500/25 to-cyan-600/15 text-sky-300 border-sky-400/35",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare className="w-4 h-4" />,
      group: "ops",
      squircleColor: "from-amber-500/25 to-yellow-600/15 text-amber-300 border-amber-400/35",
    },
    {
      id: "team",
      label: "Team",
      icon: <Contact className="w-4 h-4" />,
      group: "ops",
      squircleColor: "from-teal-500/25 to-emerald-600/15 text-teal-300 border-teal-400/35",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      group: "ops",
      squircleColor: "from-cyan-500/25 to-teal-600/15 text-cyan-300 border-cyan-400/35",
    },
    {
      id: "channels",
      label: "Channels",
      icon: <Radio className="w-4 h-4" />,
      badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined,
      group: "ops",
      squircleColor: "from-blue-500/25 to-sky-600/15 text-blue-300 border-blue-400/35",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      group: "ops",
      squircleColor: "from-zinc-500/25 to-zinc-600/15 text-zinc-300 border-zinc-400/35",
    },
  ];

  // Filter items based on selected category in expanded mode
  const displayedItems = isCollapsed
    ? menuItems
    : selectedCategory === "all"
      ? menuItems
      : menuItems.filter((i) => i.group === selectedCategory);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP FLOATING LIQUID GLASS DOCK (100% NON-SCROLLABLE)
          Anchored in place: page content scrolls independently
          ───────────────────────────────────────────────────────────── */}
      <motion.aside
        aria-label="Dashboard sidebar"
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={sidebarSpring}
        className="hidden md:flex flex-col fixed top-3.5 bottom-3.5 left-3.5 z-40 select-none h-[calc(100vh-1.75rem)] h-[calc(100dvh-1.75rem)] pointer-events-auto"
      >
        <div
          ref={asideContainerRef}
          className="flex flex-col h-full rounded-[28px] border border-white/[0.12] bg-[#030907]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_24px_rgba(16,185,129,0.08)] ring-1 ring-white/10 relative justify-between"
        >
          {/* Top Section: Brand + Search + Category Selector */}
          <div className="flex flex-col flex-shrink-0">
            {/* 1. Header with Brand & Chevron Toggle Button */}
            <div
              className={cn(
                "flex items-center py-2.5 px-3 relative border-b border-white/[0.06] flex-shrink-0",
                isCollapsed ? "justify-center" : "justify-between px-3.5"
              )}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {/* Brand Squircle */}
                <div
                  onMouseEnter={(e) => {
                    if (isCollapsed) {
                      const asideRect = asideContainerRef.current?.getBoundingClientRect();
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      if (asideRect) {
                        setFlyoutState(null);
                        setTooltipState({
                          label: "Crema Studio",
                          badge: "PRO",
                          groupName: "Workspace",
                          top: btnRect.top - asideRect.top + btnRect.height / 2,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed) setTooltipState(null);
                  }}
                  className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer"
                >
                  <img
                    src="/logo.svg"
                    alt="StarX"
                    className="w-4.5 h-4.5 object-contain"
                  />
                </div>

                {/* Brand Text & Badge (Expanded Mode) */}
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
                          Crema
                        </span>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 rounded-full leading-none">
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "w-6 h-6 rounded-full bg-[#0c1a15] border border-emerald-400/40 flex items-center justify-center text-zinc-300 hover:text-emerald-300 hover:border-emerald-400/70 transition-colors shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400",
                  isCollapsed ? "absolute -right-2.5 top-3 z-50 bg-[#07130e]" : "relative"
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
            <div className="px-2.5 pt-2 pb-1 relative z-10 flex-shrink-0">
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
                    className="w-8.5 h-8.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm group"
                  >
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                    <span>Search...</span>
                  </div>
                  <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">
                    ⌘K
                  </kbd>
                </button>
              )}
            </div>

            {/* 3. Category Filter Selector Pills (Expanded Only) */}
            {!isCollapsed && (
              <div className="px-2.5 py-1 flex items-center gap-1 border-b border-white/[0.05] flex-shrink-0">
                {(
                  [
                    { id: "all", label: "All (16)" },
                    { id: "core", label: "Favorites" },
                    { id: "ai", label: "AI" },
                    { id: "ops", label: "Workspace" },
                  ] as const
                ).map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex-1 py-1 text-[9.5px] font-bold rounded-lg transition-all cursor-pointer text-center",
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
          </div>

          {/* 4. Non-Scrollable Navigation Area: strictly overflow-hidden */}
          <nav
            ref={desktopNavRef}
            onKeyDown={handleDesktopNavKeyDown}
            aria-label="Dashboard sections"
            className="flex-1 min-h-0 flex flex-col justify-evenly overflow-hidden px-1.5 xl:px-2 py-1 select-none"
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
                    <div className="my-0.5 border-t border-white/[0.06] mx-1 flex-shrink-0" />
                  )}
                  {renderNavItem(item)}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Bottom Section: Media/Lo-Fi Card + Night Shift Toggle + User Profile */}
          <div className="flex flex-col flex-shrink-0 relative z-10 border-t border-white/[0.06] bg-black/25">
            {/* 5. Liquid Glass Music / AI Receptionist Card */}
            <div className="p-2 relative z-10">
              {!isCollapsed ? (
                <div className="rounded-2xl p-2.5 bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_20px_rgba(0,0,0,0.35)] relative overflow-hidden backdrop-blur-md group/player">
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-600/15 border border-amber-400/35 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate leading-tight">
                          Morning Brew
                        </span>
                        <span className="text-[9px] text-zinc-400 block truncate">
                          Lo-fi Café
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setAudioProgress((prev) => Math.max(0, prev - 10))}
                        className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Previous Track"
                        aria-label="Previous Track"
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                      </button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/40 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                        title={isPlayingAudio ? "Pause" : "Play"}
                        aria-label={isPlayingAudio ? "Pause playback" : "Start playback"}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-3 h-3 fill-emerald-300" />
                        ) : (
                          <Play className="w-3 h-3 fill-emerald-300 translate-x-0.5" />
                        )}
                      </motion.button>

                      <button
                        type="button"
                        onClick={() => setAudioProgress((prev) => Math.min(100, prev + 10))}
                        className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Next Track"
                        aria-label="Next Track"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrubber Progress Bar & Dancing Equalizer */}
                  <div className="mt-2 relative z-10">
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        setAudioProgress(Math.min(100, Math.max(0, (clickX / rect.width) * 100)));
                      }}
                      className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/bar"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 mt-1">
                      <span>1:15</span>
                      <div className="flex items-end gap-0.5 h-2.5">
                        {[5, 10, 4, 8].map((h, i) => (
                          <motion.span
                            key={i}
                            animate={isPlayingAudio ? { height: [2, h, 3, h * 0.7, 2] } : { height: 2 }}
                            transition={{
                              duration: 0.7 + i * 0.15,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                            }}
                            className="w-0.5 bg-emerald-400 rounded-full"
                          />
                        ))}
                      </div>
                      <span>-2:45</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Collapsed Mini Audio Player Pill */
                <div className="flex justify-center py-0.5">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    onMouseEnter={() => {
                      if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                      setFlyoutState(null);
                      setTooltipState(null);
                      setShowMediaFlyout(true);
                    }}
                    onMouseLeave={() => {
                      setShowMediaFlyout(false);
                    }}
                    className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-400/35 flex items-center justify-center text-amber-300 relative shadow-sm cursor-pointer group"
                    title="Morning Brew: Lo-fi Café"
                    aria-label="Toggle Morning Brew playback"
                  >
                    <Music className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className={cn(
                      "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#08120e]",
                      isPlayingAudio ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                    )} />
                  </button>
                </div>
              )}
            </div>

            {/* 6. Night Shift / Auto-Pilot Row */}
            <div className="px-3 py-1 flex items-center justify-between border-t border-white/[0.04]">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-2">
                    {isNightShift ? (
                      <Moon className="w-3.5 h-3.5 text-amber-300" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span className="text-[10px] font-medium text-zinc-300">
                      Night shift
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNightShift(!isNightShift)}
                    title={isNightShift ? "Night shift active" : "Night shift inactive"}
                    className={cn(
                      "w-7 h-4 rounded-full transition-colors duration-200 p-0.5 relative cursor-pointer border",
                      isNightShift
                        ? "bg-emerald-500/35 border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        : "bg-white/[0.08] border-white/15"
                    )}
                  >
                    <motion.div
                      animate={{ x: isNightShift ? 12 : 0 }}
                      transition={liquidSpring}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isNightShift ? "bg-emerald-400" : "bg-zinc-400"
                      )}
                    />
                  </button>
                </>
              ) : (
                <div className="flex justify-center w-full py-0.5">
                  <button
                    type="button"
                    onClick={() => setIsNightShift(!isNightShift)}
                    onMouseEnter={(e) => {
                      const asideRect = asideContainerRef.current?.getBoundingClientRect();
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      if (asideRect) {
                        setFlyoutState(null);
                        setTooltipState({
                          label: isNightShift ? "Night shift: On" : "Night shift: Off",
                          badge: "Auto",
                          top: btnRect.top - asideRect.top + btnRect.height / 2,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltipState(null)}
                    className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-amber-300 hover:text-white transition-colors cursor-pointer"
                    title="Night shift"
                    aria-label="Toggle Night shift"
                  >
                    {isNightShift ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 7. Footer User Profile & 1-Click Sign-out */}
            <div className="p-2 border-t border-white/[0.05] relative z-10">
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl transition-colors",
                  isCollapsed ? "justify-center" : "px-2 py-1 bg-white/[0.02] border border-white/[0.06]"
                )}
              >
                {/* User Avatar with Green Online Dot */}
                <div
                  onMouseEnter={() => {
                    if (isCollapsed) {
                      setShowProfileFlyout(true);
                      setTooltipState(null);
                      setFlyoutState(null);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed) setShowProfileFlyout(false);
                  }}
                  className="flex items-center gap-2 min-w-0 cursor-pointer"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 border border-white/20 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "NC"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#09120f]" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex flex-col min-w-0 max-w-[130px]">
                      <span className="text-[11px] font-bold text-white truncate leading-tight">
                        {user?.name || "Noah Carter"}
                      </span>
                      <span className="text-[9px] text-zinc-400 truncate">
                        {user?.email || "noah@crema.studio"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sign Out Action Button */}
                {!isCollapsed && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING GLASS TOOLTIP (COLLAPSED DOCK)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && tooltipState && !flyoutState && !showMediaFlyout && (
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
                className="absolute left-full ml-3 z-50 p-2 rounded-2xl bg-[#07100c]/95 backdrop-blur-2xl border border-emerald-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.18)] min-w-[190px] space-y-1 select-none pointer-events-auto"
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

          {/* ─────────────────────────────────────────────────────────────
              NOW PLAYING FLYOUT CARD (COLLAPSED DOCK)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && showMediaFlyout && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                className="absolute left-full ml-3 bottom-14 z-50 p-3 rounded-2xl bg-[#07100c]/95 backdrop-blur-2xl border border-amber-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] min-w-[220px] select-none pointer-events-auto"
                onMouseEnter={() => setShowMediaFlyout(true)}
                onMouseLeave={() => setShowMediaFlyout(false)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-600/15 border border-amber-400/40 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Morning Brew</span>
                    <span className="text-[10px] text-zinc-400 block truncate">Lo-fi Café</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setAudioProgress((p) => Math.max(0, p - 10))}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-7 h-7 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 flex items-center justify-center hover:bg-emerald-500/40 cursor-pointer"
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-3.5 h-3.5 fill-emerald-300" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-emerald-300 translate-x-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioProgress((p) => Math.min(100, p + 10))}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─────────────────────────────────────────────────────────────
              PROFILE FLYOUT CARD (COLLAPSED DOCK)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && showProfileFlyout && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                className="absolute left-full ml-3 bottom-2 z-50 p-2.5 rounded-2xl bg-[#07100c]/95 backdrop-blur-2xl border border-emerald-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)] min-w-[180px] select-none pointer-events-auto"
                onMouseEnter={() => setShowProfileFlyout(true)}
                onMouseLeave={() => setShowProfileFlyout(false)}
              >
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                  <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white text-[10px]">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "NC"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || "Noah Carter"}</p>
                    <p className="text-[9px] text-zinc-400 truncate">{user?.email || "noah@crema.studio"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-2 px-2 py-1 rounded-lg text-[10px] font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign out</span>
                </button>
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
            "w-full h-full min-h-[28px] max-h-[34px] xl:max-h-[38px] flex items-center rounded-xl font-medium transition-all duration-150 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/70 select-none",
            isCollapsed ? "justify-center p-0.5" : "gap-2.5 px-2.5 py-1",
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
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/22 via-emerald-500/10 to-transparent border border-emerald-400/35 shadow-[0_0_16px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.15)] -z-10"
            />
          )}

          {/* Active Indicator Dot on Collapsed Dock (Left edge) */}
          {isCollapsed && isActive && (
            <motion.span
              layoutId="activeDockDot"
              transition={navPillSpring}
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            />
          )}

          {/* Liquid Glass App Squircle Icon Container (w-7.5 h-7.5 with w-4 icon) */}
          <div
            className={cn(
              "w-7.5 h-7.5 xl:w-8 xl:h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-200 relative shadow-sm",
              isActive
                ? cn("bg-gradient-to-br shadow-[0_0_12px_rgba(16,185,129,0.3)]", item.squircleColor)
                : "bg-white/[0.04] border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.07] text-zinc-300 group-hover:text-white"
            )}
          >
            {item.icon}

            {/* Notification Badge on Collapsed Dock Icon */}
            {isCollapsed && item.badge !== undefined && (
              typeof item.badge === "number" ? (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 bg-red-500 text-white border border-[#09120f] text-[7.5px] font-extrabold rounded-full flex items-center justify-center shadow-md leading-none">
                  {item.badge}
                </span>
              ) : item.badge === "Live" ? (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#09120f] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#09120f] shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              )
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
                <span className="truncate text-[12px] xl:text-[12.5px] font-medium tracking-tight text-zinc-200 group-hover:text-white">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[8.5px] font-bold rounded-full ml-auto tabular-nums leading-tight",
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
