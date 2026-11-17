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
  X,
  ArrowRight,
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";
import { navPillSpring, sidebarSpring, MOTION_EASE } from "../../lib/motionVariants";

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

  const desktopNavRef = useRef<HTMLElement>(null);
  const asideContainerRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      setTooltipState(null);
    }
  }, [isCollapsed]);

  const handleItemMouseEnter = (item: NavItem, e: React.MouseEvent<HTMLButtonElement>) => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    if (!isCollapsed) return;

    const asideRect = asideContainerRef.current?.getBoundingClientRect();
    const btnRect = e.currentTarget.getBoundingClientRect();
    if (!asideRect) return;

    const top = btnRect.top - asideRect.top;
    const groupName =
      item.group === "main" ? "Main" : item.group === "intelligence" ? "Intelligence" : "System";

    setTooltipState({
      label: item.label,
      badge: item.badge,
      groupName,
      top: top + btnRect.height / 2,
    });
  };

  const handleItemMouseLeave = () => {
    setTooltipState(null);
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
          badge: totalClientsCount > 0 ? totalClientsCount : undefined,
          group: "main",
          squircleColor: "from-blue-500/25 to-indigo-600/15 text-blue-300 border-blue-400/35",
        },
        {
          id: "leads",
          label: "Demo Inquiries",
          icon: Sparkles,
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
          badgeColor: "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40",
          group: "main",
          squircleColor: "from-amber-500/25 to-orange-600/15 text-amber-300 border-amber-400/35",
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

  const allItems: NavItem[] = groups.flatMap((g) => g.items);

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
            if (onCloseMobile) onCloseMobile();
          }}
          onMouseEnter={(e) => handleItemMouseEnter(item, e)}
          onMouseLeave={handleItemMouseLeave}
          className={cn(
            "w-full h-full min-h-[30px] max-h-[38px] flex items-center rounded-xl font-medium transition-all duration-150 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/70 select-none",
            isCollapsed ? "justify-center p-1" : "gap-2.5 px-2.5 py-1",
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
              className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-3.5 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
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
          DESKTOP FULL-HEIGHT DOCKED ADMIN SIDEBAR (100% NON-SCROLLABLE)
          ───────────────────────────────────────────────────────────── */}
      <motion.aside
        aria-label="Admin Navigation"
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
              "flex items-center py-2.5 px-3 relative border-b border-white/[0.06] flex-shrink-0",
              isCollapsed ? "justify-center" : "justify-between px-3.5"
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Brand Squircle */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
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
                        StarX Flow
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

          {/* 4. Streamlined Live DB Node Status Capsule */}
          <div className="px-2 py-1 border-t border-white/[0.06] flex-shrink-0 relative z-10">
            {!isCollapsed ? (
              <div className="rounded-xl px-2.5 py-1.5 bg-black/35 border border-white/[0.07] flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                    <Database className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="text-[10px] font-bold text-white truncate leading-tight">
                        Live DB Node
                      </span>
                    </div>
                    <span className="text-[8px] text-zinc-400 block truncate font-mono">
                      Supabase EU-Central
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-emerald-300 font-bold bg-emerald-500/18 px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex-shrink-0">
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
                      setTooltipState({
                        label: "Live DB: Supabase EU",
                        badge: "100% SLA",
                        top: btnRect.top - asideRect.top + btnRect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltipState(null)}
                  className="w-7 h-7 rounded-lg bg-emerald-500/18 border border-emerald-400/35 flex items-center justify-center text-emerald-300 relative shadow-sm cursor-pointer"
                  title="Database operational: 100% SLA"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                </button>
              </div>
            )}
          </div>

          {/* 5. Footer Admin Profile & Sign-out */}
          <div className="p-2 border-t border-white/[0.06] flex-shrink-0 relative z-10">
            <div
              className={cn(
                "flex items-center justify-between rounded-xl transition-colors",
                isCollapsed ? "flex-col gap-1.5" : "px-2 py-1 bg-white/[0.02] border border-white/[0.06]"
              )}
            >
              {/* Admin Avatar with Green Live Dot */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 border border-white/15 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
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

              {/* Sign Out Action Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className={cn(
                    "flex items-center justify-center text-zinc-400 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer",
                    isCollapsed ? "w-7 h-7" : ""
                  )}
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING GLASS TOOLTIP (COLLAPSED DOCK)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCollapsed && tooltipState && (
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
                        : "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                    )}
                  >
                    {tooltipState.badge}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SLIDE-OVER DRAWER (< lg)
          ───────────────────────────────────────────────────────────── */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-[280px] h-full max-w-[85vw] bg-[#07130d]/95 backdrop-blur-2xl border-r border-emerald-500/25 shadow-2xl flex flex-col justify-between p-4"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 border border-emerald-400/40 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">StarX Flow</span>
                    <p className="text-[10px] text-zinc-400 font-mono">Platform Admin</p>
                  </div>
                </div>
                {onCloseMobile && (
                  <button
                    type="button"
                    onClick={onCloseMobile}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-4">
                {groups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-1">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onSelectSection(item.id);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left",
                              isActive
                                ? "bg-emerald-500/20 text-white border border-emerald-400/40 font-semibold"
                                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-zinc-400")} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-white">Live DB Node</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-300 font-bold bg-emerald-500/18 px-1.5 py-0.5 rounded border border-emerald-400/30">
                  100% SLA
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
