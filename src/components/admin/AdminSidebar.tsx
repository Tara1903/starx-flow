"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
  CreditCard,
  Shield,
  Activity,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";
import { navPillSpring, sidebarSpring, MOTION_EASE, liquidSpring } from "../../lib/motionVariants";

export type AdminSection = "overview" | "clients" | "leads" | "analytics" | "plans" | "settings";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  totalClientsCount: number;
  newLeadsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  adminEmail?: string;
}

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: number | string;
  badgeColor?: string;
  group: "main" | "intelligence" | "system";
  squircleColor: string;
  subItems?: { label: string; action: () => void }[];
}

interface NavGroup {
  title: string;
  group: "main" | "intelligence" | "system";
  items: NavItem[];
}

export function AdminSidebar({
  activeSection,
  onSelectSection,
  totalClientsCount,
  newLeadsCount,
  isOpenMobile = false,
  onCloseMobile,
  onLogout,
  adminEmail = "admin@starxflow.com",
}: AdminSidebarProps) {
  const prefersReduced = useReducedMotion();
  const isCollapsed = useAdminStore((s) => s.isSidebarCollapsed);
  const setIsCollapsed = useAdminStore((s) => s.setSidebarCollapsed);
  const openCommandCenter = useUIStore((s) => s.openCommandCenter);

  // Auto-collapse on medium desktop/tablet screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024 && window.innerWidth < 1280) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  const [tooltipState, setTooltipState] = useState<{
    label: string;
    badge?: string | number;
    groupName?: string;
    top: number;
  } | null>(null);

  const [flyoutState, setFlyoutState] = useState<{ item: NavItem; top: number } | null>(null);
  const [showNodeFlyout, setShowNodeFlyout] = useState(false);
  const [showProfileFlyout, setShowProfileFlyout] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  const desktopNavRef = useRef<HTMLElement>(null);
  const asideContainerRef = useRef<HTMLDivElement>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      setTooltipState(null);
      setFlyoutState(null);
      setShowNodeFlyout(false);
      setShowProfileFlyout(false);
    }
  }, [isCollapsed]);

  const handleItemMouseEnter = (item: NavItem, e: React.MouseEvent<HTMLButtonElement>) => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    if (!isCollapsed) return;

    const asideRect = asideContainerRef.current?.getBoundingClientRect();
    const btnRect = e.currentTarget.getBoundingClientRect();
    if (!asideRect) return;

    const top = btnRect.top - asideRect.top;

    if (item.subItems && item.subItems.length > 0) {
      setTooltipState(null);
      setShowNodeFlyout(false);
      setShowProfileFlyout(false);
      setFlyoutState({ item, top });
    } else {
      setFlyoutState(null);
      setShowNodeFlyout(false);
      setShowProfileFlyout(false);
      const groupName =
        item.group === "main" ? "Main" : item.group === "intelligence" ? "Intelligence" : "System";
      setTooltipState({
        label: item.label,
        badge: item.badge,
        groupName,
        top: top + btnRect.height / 2,
      });
    }
  };

  const handleItemMouseLeave = () => {
    setTooltipState(null);
    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyoutState(null);
    }, 200);
  };

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

  const groups: NavGroup[] = [
    {
      title: "MAIN",
      group: "main",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
          group: "main",
          squircleColor: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35",
        },
        {
          id: "clients",
          label: "Clients",
          icon: Users,
          badge: totalClientsCount > 0 ? totalClientsCount : 5,
          group: "main",
          squircleColor: "from-blue-500/25 to-indigo-600/15 text-blue-300 border-blue-400/35",
          subItems: [
            { label: "Active Subscribers", action: () => onSelectSection("clients") },
            { label: "New Registrations", action: () => onSelectSection("clients") },
            { label: "Export Clients CSV", action: () => onSelectSection("clients") },
          ],
        },
        {
          id: "leads",
          label: "Demo Inquiries",
          icon: Sparkles,
          badge: newLeadsCount > 0 ? newLeadsCount : 1,
          badgeColor: "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40",
          group: "main",
          squircleColor: "from-amber-500/25 to-orange-600/15 text-amber-300 border-amber-400/35",
          subItems: [
            { label: "Pending Reviews", action: () => onSelectSection("leads") },
            { label: "Scheduled Demos", action: () => onSelectSection("leads") },
            { label: "Archived Leads", action: () => onSelectSection("leads") },
          ],
        },
      ],
    },
    {
      title: "INTELLIGENCE",
      group: "intelligence",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          group: "intelligence",
          squircleColor: "from-cyan-500/25 to-teal-600/15 text-cyan-300 border-cyan-400/35",
          subItems: [
            { label: "Real-time Traffic", action: () => onSelectSection("analytics") },
            { label: "Conversion Funnel", action: () => onSelectSection("analytics") },
            { label: "Server Load & SLA", action: () => onSelectSection("analytics") },
          ],
        },
        {
          id: "plans",
          label: "Plans & Tiers",
          icon: CreditCard,
          group: "intelligence",
          squircleColor: "from-purple-500/25 to-violet-600/15 text-purple-300 border-purple-400/35",
        },
      ],
    },
    {
      title: "SYSTEM",
      group: "system",
      items: [
        {
          id: "settings",
          label: "Settings & Audit",
          icon: Shield,
          group: "system",
          squircleColor: "from-zinc-500/25 to-zinc-600/15 text-zinc-300 border-zinc-400/35",
        },
      ],
    },
  ];

  const renderSidebarItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;

    return (
      <div key={item.id} className="relative flex-1 min-h-0 flex items-center">
        <button
          type="button"
          data-nav-item="true"
          aria-current={isActive ? "page" : undefined}
          onClick={() => {
            onSelectSection(item.id);
            setFlyoutState(null);
            if (onCloseMobile) onCloseMobile();
          }}
          onMouseEnter={(e) => handleItemMouseEnter(item, e)}
          onMouseLeave={handleItemMouseLeave}
          className={cn(
            "w-full h-full min-h-[28px] max-h-[36px] flex items-center rounded-xl font-medium transition-all duration-150 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/70 select-none",
            isCollapsed ? "justify-center p-0.5" : "gap-2.5 px-2.5 py-1",
            isActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
          )}
        >
          {/* Active Navigation Sliding Highlight Pill (Expanded) */}
          {!isCollapsed && isActive && (
            <motion.span
              layoutId="adminSidebarActivePill"
              transition={navPillSpring}
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/25 via-emerald-500/12 to-emerald-500/5 border border-emerald-400/40 shadow-[0_0_16px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] -z-10"
            />
          )}

          {/* Active Indicator Dot on Collapsed Dock (Left edge) */}
          {isCollapsed && isActive && (
            <motion.span
              layoutId="adminDockDot"
              transition={navPillSpring}
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-3.5 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            />
          )}

          {/* Liquid Glass App Squircle Icon Container */}
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-200 relative shadow-sm",
              isActive
                ? cn("bg-gradient-to-br shadow-[0_0_12px_rgba(16,185,129,0.3)]", item.squircleColor)
                : "bg-white/[0.04] border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.07] text-zinc-300 group-hover:text-white"
            )}
          >
            <Icon className="w-3.5 h-3.5" />

            {/* Notification Badge on Collapsed Dock Icon */}
            {isCollapsed && item.badge !== undefined && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 bg-red-500 text-white border border-[#09120f] text-[7.5px] font-extrabold rounded-full flex items-center justify-center shadow-md leading-none">
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
                <span className="truncate text-[12px] tracking-tight">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-bold font-mono rounded-full ml-auto tabular-nums leading-tight",
                      item.badgeColor ||
                        (isActive
                          ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40"
                          : "bg-white/[0.08] text-zinc-300 border border-white/10")
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
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP FLOATING LIQUID GLASS ADMIN DOCK (100% NON-SCROLLABLE)
          Fixed in place: page content scrolls independently
          ───────────────────────────────────────────────────────────── */}
      <motion.aside
        aria-label="Admin Navigation"
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={sidebarSpring}
        className="hidden md:flex flex-col fixed top-3.5 bottom-3.5 left-3.5 z-40 select-none h-[calc(100vh-1.75rem)] h-[calc(100dvh-1.75rem)] pointer-events-auto"
      >
        <div
          ref={asideContainerRef}
          className="flex flex-col h-full rounded-[28px] border border-white/[0.12] bg-[#030907]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_24px_rgba(16,185,129,0.08)] ring-1 ring-white/10 relative justify-between"
        >
          {/* Top Section: Brand + Search */}
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
                          label: "StarXFlow",
                          badge: "V7",
                          groupName: "Admin",
                          top: btnRect.top - asideRect.top + btnRect.height / 2,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed) setTooltipState(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Brand Text & Badge (Expanded) */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key="admin-brand-expanded"
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0.92, x: -6 }}
                      transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                      className="flex flex-col min-w-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white tracking-tight truncate">
                          StarXFlow
                        </span>
                        <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 rounded-full leading-none">
                          V7
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono truncate max-w-[130px]">
                        Platform Admin
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
                aria-label={isCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
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
                      const asideRect = asideContainerRef.current?.getBoundingClientRect();
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      if (asideRect) {
                        setFlyoutState(null);
                        setTooltipState({
                          label: "Search admin commands",
                          badge: "⌘K",
                          top: btnRect.top - asideRect.top + btnRect.height / 2,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltipState(null)}
                    aria-label="Search admin (Press ⌘K)"
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
                    <span>Search admin...</span>
                  </div>
                  <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15">
                    ⌘K
                  </kbd>
                </button>
              )}
            </div>
          </div>

          {/* 3. Non-Scrollable Navigation Area: strictly overflow-hidden */}
          <nav
            ref={desktopNavRef}
            onKeyDown={handleDesktopNavKeyDown}
            aria-label="Admin sections"
            className="flex-1 min-h-0 flex flex-col justify-around overflow-hidden px-2 py-1 select-none"
          >
            {groups.map((group, gIdx) => (
              <div key={group.title} className="space-y-0.5">
                {!isCollapsed ? (
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2.5 py-0.5 select-none">
                    {group.title}
                  </p>
                ) : (
                  gIdx > 0 && <div className="my-1 border-t border-white/[0.06] flex-shrink-0" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => renderSidebarItem(item))}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Section: Infrastructure Card + Realtime Sync Switch + Admin Profile */}
          <div className="flex flex-col flex-shrink-0 relative z-10 border-t border-white/[0.06] bg-black/20">
            {/* 4. Streamlined Live DB Node Status Capsule (Video replica) */}
            <div className="px-2.5 py-1.5 relative z-10">
              {!isCollapsed ? (
                <div className="rounded-xl px-2.5 py-2 bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        <span className="text-[10px] font-bold text-white truncate leading-tight">
                          Live DB Node
                        </span>
                      </div>
                      <span className="text-[8.5px] text-zinc-400 block truncate font-mono">
                        Supabase EU-Central
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-emerald-300 font-bold bg-emerald-500/18 px-2 py-0.5 rounded-full border border-emerald-400/30 flex-shrink-0 shadow-sm">
                    100% SLA
                  </span>
                </div>
              ) : (
                <div className="flex justify-center py-0.5">
                  <button
                    type="button"
                    onMouseEnter={(e) => {
                      const asideRect = asideContainerRef.current?.getBoundingClientRect();
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      if (asideRect) {
                        setFlyoutState(null);
                        setTooltipState(null);
                        setShowNodeFlyout(true);
                      }
                    }}
                    onMouseLeave={() => setShowNodeFlyout(false)}
                    className="w-8 h-8 rounded-xl bg-emerald-500/18 border border-emerald-400/35 flex items-center justify-center text-emerald-300 relative shadow-sm cursor-pointer group"
                    title="Database operational: 100% SLA"
                    aria-label="Database status"
                  >
                    <Database className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] border border-[#08120e]" />
                  </button>
                </div>
              )}
            </div>

            {/* 5. Realtime Sync Toggle Row (Night shift replica from video) */}
            <div className="px-3 py-1 flex items-center justify-between border-t border-white/[0.04]">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-2">
                    <Zap className={cn("w-3.5 h-3.5", isRealtimeActive ? "text-emerald-400" : "text-zinc-500")} />
                    <span className="text-[10px] font-medium text-zinc-300">
                      Realtime sync
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRealtimeActive(!isRealtimeActive)}
                    title={isRealtimeActive ? "Realtime sync active" : "Realtime sync paused"}
                    className={cn(
                      "w-7 h-4 rounded-full transition-colors duration-200 p-0.5 relative cursor-pointer border",
                      isRealtimeActive
                        ? "bg-emerald-500/35 border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        : "bg-white/[0.08] border-white/15"
                    )}
                  >
                    <motion.div
                      animate={{ x: isRealtimeActive ? 12 : 0 }}
                      transition={liquidSpring}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isRealtimeActive ? "bg-emerald-400" : "bg-zinc-400"
                      )}
                    />
                  </button>
                </>
              ) : (
                <div className="flex justify-center w-full py-0.5">
                  <button
                    type="button"
                    onClick={() => setIsRealtimeActive(!isRealtimeActive)}
                    onMouseEnter={(e) => {
                      const asideRect = asideContainerRef.current?.getBoundingClientRect();
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      if (asideRect) {
                        setFlyoutState(null);
                        setTooltipState({
                          label: isRealtimeActive ? "Realtime: Active" : "Realtime: Paused",
                          badge: "24ms",
                          top: btnRect.top - asideRect.top + btnRect.height / 2,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltipState(null)}
                    className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 hover:text-white transition-colors cursor-pointer"
                    title="Realtime sync"
                    aria-label="Toggle Realtime sync"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 6. Footer Admin Profile & Sign-out */}
            <div className="p-2 border-t border-white/[0.05] relative z-10">
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl transition-colors",
                  isCollapsed ? "justify-center" : "px-2 py-1 bg-white/[0.02] border border-white/[0.06]"
                )}
              >
                {/* Admin Avatar with Green Live Dot */}
                <div
                  onMouseEnter={(e) => {
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
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 border border-white/20 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
                      AD
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#09120f]" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex flex-col min-w-0 max-w-[130px]">
                      <span className="text-[11px] font-bold text-white truncate leading-tight">
                        Platform Admin
                      </span>
                      <span className="text-[9px] text-zinc-400 truncate">
                        {adminEmail}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sign Out Button */}
                {!isCollapsed && onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
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
            {isCollapsed && tooltipState && !flyoutState && !showNodeFlyout && (
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
                        : "bg-emerald-500 text-black"
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
              NODE STATUS FLYOUT (COLLAPSED DOCK)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && showNodeFlyout && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                className="absolute left-full ml-3 bottom-14 z-50 p-3 rounded-2xl bg-[#07100c]/95 backdrop-blur-2xl border border-emerald-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)] min-w-[210px] select-none pointer-events-auto"
                onMouseEnter={() => setShowNodeFlyout(true)}
                onMouseLeave={() => setShowNodeFlyout(false)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Live DB Node</p>
                    <p className="text-[9px] font-mono text-zinc-400">Supabase EU-Central</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">Latency: 24ms</span>
                  <span className="text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded">100% SLA</span>
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white text-[10px]">
                    AD
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Platform Admin</p>
                    <p className="text-[9px] text-zinc-400 truncate">{adminEmail}</p>
                  </div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full mt-2 px-2 py-1 rounded-lg text-[10px] font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign out</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
