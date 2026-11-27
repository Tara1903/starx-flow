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
  Home,
  Users,
  Calendar as CalendarIcon,
  CheckSquare,
  Contact,
  Bot,
  Phone,
  Cpu,
  Search,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  useDashboardStore,
  type DashboardSection,
} from "../../store/dashboardStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";
import { navPillSpring, sidebarSpring, liquidSpring, MOTION_EASE } from "../../lib/motionVariants";

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  group: "core" | "ai" | "ops";
  subItems?: { label: string; dotClass: string; action: () => void }[];
}

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "ai", label: "AI" },
  { id: "ops", label: "Ops" },
] as const;

type CategoryFilter = (typeof CATEGORY_TABS)[number]["id"];

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

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [hoveredItemId, setHoveredItemId] = useState<DashboardSection | null>(null);
  const [flyoutState, setFlyoutState] = useState<{ item: SidebarItem; top: number } | null>(null);
  const [tooltipState, setTooltipState] = useState<{
    label: string;
    badge?: string | number;
    groupName?: string;
    top: number;
  } | null>(null);
  const [showProfileFlyout, setShowProfileFlyout] = useState(false);

  const desktopNavRef = useRef<HTMLElement>(null);
  const asideContainerRef = useRef<HTMLDivElement>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-collapse on narrow tablet/small-laptop viewports
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640 && window.innerWidth <= 1024) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  useEffect(() => {
    setHoveredItemId(null);
    if (!isCollapsed) {
      setFlyoutState(null);
      setTooltipState(null);
      setShowProfileFlyout(false);
    }
  }, [isCollapsed]);

  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  const connectedChannelsCount = connectedChannels.filter((c) => c.isConnected).length;
  const unreadConversationsCount = conversations.filter((c) => c.unread).length;

  const handleItemMouseEnter = (item: SidebarItem, e: React.MouseEvent<HTMLButtonElement>) => {
    setHoveredItemId(item.id);
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    if (!isCollapsed) return;

    const asideRect = asideContainerRef.current?.getBoundingClientRect();
    const btnRect = e.currentTarget.getBoundingClientRect();
    if (!asideRect) return;

    const top = btnRect.top - asideRect.top;

    if (item.subItems && item.subItems.length > 0) {
      setTooltipState(null);
      setShowProfileFlyout(false);
      setFlyoutState({ item, top });
    } else {
      setFlyoutState(null);
      setShowProfileFlyout(false);
      const groupName =
        item.group === "core" ? "Core" : item.group === "ai" ? "AI Workforce" : "Operations";
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
    }, 260);
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

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const menuItems: SidebarItem[] = [
    // Core
    {
      id: "overview",
      label: "Home",
      icon: <Home className="w-4 h-4" />,
      group: "core",
    },
    {
      id: "conversations",
      label: "Inbox",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadConversationsCount || undefined,
      group: "core",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <CalendarIcon className="w-4 h-4" />,
      group: "core",
      subItems: [
        { label: "Discovery Calls", dotClass: "bg-amber-400", action: () => setActiveSection("calendar") },
        { label: "Book Consultation", dotClass: "bg-emerald-400", action: () => setActiveSection("calendar") },
        { label: "Calendar Sync", dotClass: "bg-sky-400", action: () => setActiveSection("calendar") },
      ],
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: <Layers className="w-4 h-4" />,
      badge: activeWorkflowsCount || undefined,
      group: "core",
      subItems: [
        { label: "Active Automations", dotClass: "bg-emerald-400", action: () => setActiveSection("workflows") },
        { label: "Flow Builder", dotClass: "bg-purple-400", action: () => setActiveSection("workflows") },
        { label: "Draft Templates", dotClass: "bg-amber-400", action: () => setActiveSection("workflows") },
      ],
    },
    {
      id: "crm",
      label: "Customers",
      icon: <Users className="w-4 h-4" />,
      group: "core",
      subItems: [
        { label: "Active Clients", dotClass: "bg-emerald-400", action: () => setActiveSection("crm") },
        { label: "Qualified Leads", dotClass: "bg-teal-400", action: () => setActiveSection("crm") },
        { label: "Export Contacts", dotClass: "bg-zinc-400", action: () => setActiveSection("crm") },
      ],
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      group: "core",
    },

    // AI Workforce
    {
      id: "agents",
      label: "AI Receptionist",
      icon: <Bot className="w-4 h-4" />,
      badge: "Live",
      group: "ai",
      subItems: [
        { label: "Live Routing", dotClass: "bg-emerald-400", action: () => setActiveSection("agents") },
        { label: "Persona Config", dotClass: "bg-cyan-400", action: () => setActiveSection("agents") },
        { label: "Knowledge Grounding", dotClass: "bg-purple-400", action: () => setActiveSection("agents") },
      ],
    },
    {
      id: "voice",
      label: "Voice AI",
      icon: <Phone className="w-4 h-4" />,
      group: "ai",
    },
    {
      id: "playground",
      label: "AI Playground",
      icon: <Brain className="w-4 h-4" />,
      group: "ai",
    },
    {
      id: "os",
      label: "Business OS",
      icon: <Cpu className="w-4 h-4" />,
      group: "ai",
    },

    // Operations
    {
      id: "knowledge",
      label: "Knowledge",
      icon: <BookOpen className="w-4 h-4" />,
      group: "ops",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare className="w-4 h-4" />,
      group: "ops",
    },
    {
      id: "team",
      label: "Team",
      icon: <Contact className="w-4 h-4" />,
      group: "ops",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      group: "ops",
    },
    {
      id: "channels",
      label: "Channels",
      icon: <Radio className="w-4 h-4" />,
      badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined,
      group: "ops",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      group: "ops",
    },
  ];

  const displayedItems = isCollapsed
    ? menuItems
    : selectedCategory === "all"
      ? menuItems
      : menuItems.filter((i) => i.group === selectedCategory);

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "SX"
    : "SX";

  const workspaceLabel = user?.businessName || "Command Center";
  const displayName = user?.name || "Workspace Owner";
  const displayEmail = user?.email || "";

  const hoverSpring = prefersReduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 480, damping: 30, mass: 0.55 };

  return (
    <motion.aside
      aria-label="Dashboard sidebar"
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={prefersReduced ? { duration: 0 } : sidebarSpring}
      className="hidden md:flex flex-col fixed top-3.5 bottom-3.5 left-3.5 z-40 select-none h-[calc(100vh-1.75rem)] h-[calc(100dvh-1.75rem)] pointer-events-auto"
    >
      <motion.div
        ref={asideContainerRef}
        initial={false}
        animate={{ borderRadius: isCollapsed ? 28 : 24 }}
        transition={prefersReduced ? { duration: 0 } : sidebarSpring}
        className="flex flex-col h-full border border-white/[0.09] bg-[#040b08]/92 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.06)] relative justify-between"
      >
        {/* Top Header, Quick Jump, and Segmented Filter */}
        <div className="flex flex-col flex-shrink-0">
          {/* Brand Row */}
          <div
            className={cn(
              "flex items-center h-13 px-3 relative border-b border-white/[0.06] flex-shrink-0",
              isCollapsed ? "justify-center" : "justify-between px-3.5"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <motion.div
                whileHover={prefersReduced ? undefined : { scale: 1.07 }}
                whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                transition={liquidSpring}
                onMouseEnter={(e) => {
                  if (isCollapsed) {
                    const asideRect = asideContainerRef.current?.getBoundingClientRect();
                    const btnRect = e.currentTarget.getBoundingClientRect();
                    if (asideRect) {
                      setFlyoutState(null);
                      setTooltipState({
                        label: "StarX Flow",
                        badge: "Pro",
                        groupName: workspaceLabel,
                        top: btnRect.top - asideRect.top + btnRect.height / 2,
                      });
                    }
                  }
                }}
                onMouseLeave={() => {
                  if (isCollapsed) setTooltipState(null);
                }}
                className="w-8 h-8 rounded-xl bg-emerald-500/12 border border-emerald-400/35 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.16)] cursor-pointer"
              >
                <img src="/logo.svg" alt="StarX Flow" className="w-4.5 h-4.5 object-contain" />
              </motion.div>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="sidebar-brand-copy"
                    initial={prefersReduced ? false : { opacity: 0.92, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
                    transition={{ duration: prefersReduced ? 0 : 0.2, ease: MOTION_EASE.premium }}
                    className="flex flex-col min-w-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#f2fbf6] tracking-tight truncate">
                        StarX Flow
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 leading-none whitespace-nowrap">
                        Pro
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8ca398] truncate max-w-[148px] leading-tight">
                      {workspaceLabel}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              whileHover={prefersReduced ? undefined : { scale: 1.12 }}
              whileTap={prefersReduced ? undefined : { scale: 0.9 }}
              transition={liquidSpring}
              className={cn(
                "w-6 h-6 rounded-full bg-[#0a1712] border border-white/[0.14] flex items-center justify-center text-[#8ca398] hover:text-emerald-300 hover:border-emerald-400/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                isCollapsed ? "absolute -right-3 top-3.5 z-50 shadow-md" : "relative flex-shrink-0"
              )}
            >
              <motion.span
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={prefersReduced ? { duration: 0 } : liquidSpring}
                className="flex items-center justify-center"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.span>
            </motion.button>
          </div>

          {/* Quick Jump / Command Center */}
          <div className="px-3 pt-2.5 pb-1.5 flex-shrink-0">
            {isCollapsed ? (
              <div className="flex justify-center">
                <motion.button
                  type="button"
                  whileHover={prefersReduced ? undefined : { scale: 1.08 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                  transition={liquidSpring}
                  onClick={openCommandCenter}
                  onMouseEnter={(e) => {
                    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                    setFlyoutState(null);
                    const asideRect = asideContainerRef.current?.getBoundingClientRect();
                    const btnRect = e.currentTarget.getBoundingClientRect();
                    if (asideRect) {
                      setTooltipState({
                        label: "Quick jump",
                        badge: "⌘K",
                        top: btnRect.top - asideRect.top + btnRect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltipState(null)}
                  aria-label="Search and command center (Press ⌘K)"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-emerald-400/40 hover:bg-white/[0.07] flex items-center justify-center text-[#8ca398] hover:text-emerald-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                  <Search className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={prefersReduced ? undefined : { scale: 0.985 }}
                onClick={openCommandCenter}
                className="w-full h-8 flex items-center justify-between px-2.5 rounded-xl bg-white/[0.035] border border-white/[0.08] hover:border-emerald-400/35 hover:bg-white/[0.06] text-xs text-[#8ca398] hover:text-[#f2fbf6] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 group"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Search className="w-3.5 h-3.5 text-[#8ca398] group-hover:text-emerald-300 transition-colors flex-shrink-0" />
                  <span className="truncate">Quick jump...</span>
                </span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 border border-white/[0.1] leading-none flex-shrink-0">
                  ⌘K
                </kbd>
              </motion.button>
            )}
          </div>

          {/* Segmented Category Filter with Gliding Pill */}
          {!isCollapsed && (
            <div className="px-3 pb-2 border-b border-white/[0.06] flex-shrink-0">
              <div
                role="tablist"
                aria-label="Filter navigation sections"
                className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                {CATEGORY_TABS.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "relative py-1 px-1.5 text-[11px] font-medium rounded-[9px] transition-colors cursor-pointer text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                        isSelected ? "text-emerald-200" : "text-[#8ca398] hover:text-zinc-200"
                      )}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="sidebarCategoryPill"
                          transition={prefersReduced ? { duration: 0 } : navPillSpring}
                          className="absolute inset-0 rounded-[9px] bg-emerald-500/18 border border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] -z-10"
                        />
                      )}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Rail — V7 staggered dock icons, gliding hover surface & active rail */}
        <nav
          ref={desktopNavRef}
          onKeyDown={handleDesktopNavKeyDown}
          onMouseLeave={() => setHoveredItemId(null)}
          aria-label="Dashboard sections"
          className={cn(
            "flex-1 min-h-0 flex flex-col overflow-y-auto console-scroll py-1.5 select-none",
            isCollapsed ? "px-2 gap-1 items-center" : "px-2.5 gap-0.5"
          )}
        >
          {displayedItems.map((item, idx) => {
            const prevItem = displayedItems[idx - 1];
            const showGroupHeader =
              !isCollapsed &&
              selectedCategory === "all" &&
              prevItem &&
              prevItem.group !== item.group;
            const showCollapsedDivider =
              isCollapsed && prevItem && prevItem.group !== item.group;

            const groupTitle =
              item.group === "ai" ? "AI Workforce" : "Operations";

            return (
              <React.Fragment key={item.id}>
                {showGroupHeader && (
                  <div className="pt-2 pb-1 [@media(max-height:840px)]:pt-1 [@media(max-height:840px)]:pb-0.5 px-2.5 flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-medium text-[#70877c] tracking-wide whitespace-nowrap">
                      {groupTitle}
                    </span>
                    <span className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                )}
                {showCollapsedDivider && (
                  <div className="my-0.5 w-6 border-t border-white/[0.07] flex-shrink-0" />
                )}
                {renderNavItem(item, idx)}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer: Honest Live Status + Account Profile */}
        <div className="flex flex-col flex-shrink-0 border-t border-white/[0.06] bg-black/20 rounded-b-[inherit]">
          {!isCollapsed && (
            <div className="px-3.5 py-2 flex items-center justify-between text-[11px] border-b border-white/[0.05]">
              <span className="flex items-center gap-2 text-[#a7bfb3] min-w-0 truncate">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  {!prefersReduced && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />
                </span>
                <span className="truncate">Receptionist active</span>
              </span>
              <span className="font-mono text-[10px] text-[#8ca398] tabular-nums flex-shrink-0">
                {activeWorkflowsCount} {activeWorkflowsCount === 1 ? "flow" : "flows"}
              </span>
            </div>
          )}

          <div className="p-2.5">
            <div
              className={cn(
                "flex items-center justify-between rounded-xl transition-colors",
                isCollapsed
                  ? "justify-center"
                  : "px-2 py-1.5 bg-white/[0.03] border border-white/[0.06]"
              )}
            >
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
                className="flex items-center gap-2.5 min-w-0"
              >
                <motion.div
                  whileHover={prefersReduced ? undefined : { scale: 1.07 }}
                  transition={liquidSpring}
                  className="relative flex-shrink-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 border border-white/20 flex items-center justify-center font-semibold text-white text-[11px]">
                    {initials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#040b08]" />
                </motion.div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 max-w-[144px]">
                    <span className="text-xs font-semibold text-[#f2fbf6] truncate leading-tight">
                      {displayName}
                    </span>
                    {displayEmail && (
                      <span className="text-[11px] text-[#8ca398] truncate leading-tight">
                        {displayEmail}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <motion.button
                  type="button"
                  whileHover={prefersReduced ? undefined : { scale: 1.08 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                  onClick={handleLogout}
                  className="flex items-center justify-center text-[#8ca398] hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/25 cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Tooltip Pill (Collapsed Dock — V7 spring pop-out) */}
        <AnimatePresence>
          {isCollapsed && tooltipState && !flyoutState && (
            <motion.div
              key={tooltipState.label}
              initial={prefersReduced ? false : { opacity: 0, x: -8, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -6, scale: 0.94 }}
              transition={prefersReduced ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 28, mass: 0.6 }}
              style={{ top: tooltipState.top }}
              className="absolute left-full ml-3 -translate-y-1/2 z-50 px-3 py-1.5 rounded-full bg-[#07120d]/95 backdrop-blur-2xl border border-emerald-500/30 text-xs font-medium text-white whitespace-nowrap shadow-[0_12px_32px_rgba(0,0,0,0.72)] flex items-center gap-2 pointer-events-none select-none"
            >
              <span>{tooltipState.label}</span>
              {tooltipState.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none",
                    tooltipState.badge === "⌘K"
                      ? "font-mono bg-white/10 text-zinc-300 border border-white/15"
                      : tooltipState.badge === "Live" || tooltipState.badge === "Pro"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/35"
                        : "bg-red-500 text-white"
                  )}
                >
                  {tooltipState.badge}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cascading Staggered Floating Pill Submenu (Collapsed Dock — V7 00:02 replica) */}
        <AnimatePresence>
          {isCollapsed && flyoutState && (
            <motion.div
              key={flyoutState.item.id}
              initial={prefersReduced ? false : { opacity: 0.92 }}
              animate={{ opacity: 1 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.14 }}
              style={{ top: flyoutState.top }}
              onMouseEnter={() => {
                if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
              }}
              onMouseLeave={() => setFlyoutState(null)}
              className="absolute left-full pl-3 -translate-y-1/4 z-50 flex flex-col gap-1.5 min-w-[198px] select-none pointer-events-auto"
            >
              {flyoutState.item.subItems?.map((sub, sIdx) => {
                const fanRotate = prefersReduced ? 0 : [-4.2, 1.2, 6.2][sIdx] ?? 0;
                const fanY = prefersReduced ? 0 : [-2, 0, 3][sIdx] ?? 0;
                return (
                  <motion.button
                    key={`${flyoutState.item.id}-${sub.label}`}
                    type="button"
                    style={{ transformOrigin: "left center" }}
                    initial={prefersReduced ? false : { opacity: 0, x: -16, y: 0, scale: 0.86, rotate: 0 }}
                    animate={{ opacity: 1, x: 0, y: fanY, scale: 1, rotate: fanRotate }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -10, scale: 0.9, rotate: 0 }}
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 420,
                            damping: 25,
                            mass: 0.65,
                            delay: sIdx * 0.05,
                          }
                    }
                    whileHover={prefersReduced ? undefined : { x: 5, scale: 1.03, rotate: 0 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                    onClick={() => {
                      sub.action();
                      setFlyoutState(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-full bg-[#07120d]/95 backdrop-blur-2xl border border-emerald-400/25 hover:border-emerald-400/55 shadow-[0_12px_30px_rgba(0,0,0,0.75)] text-xs font-medium text-zinc-200 hover:text-white transition-colors flex items-center justify-between gap-2.5 group/sub cursor-pointer"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", sub.dotClass)} />
                      <span className="truncate">{sub.label}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 group-hover/sub:text-emerald-300 group-hover/sub:translate-x-0.5 transition-all flex-shrink-0" />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Flyout (Collapsed Dock) */}
        <AnimatePresence>
          {isCollapsed && showProfileFlyout && (
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, x: -8, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -6, scale: 0.94 }}
              transition={prefersReduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 28 }}
              className="absolute left-full pl-3 bottom-2.5 z-50 select-none pointer-events-auto"
              onMouseEnter={() => setShowProfileFlyout(true)}
              onMouseLeave={() => setShowProfileFlyout(false)}
            >
              <div className="p-2.5 rounded-2xl bg-[#07120d]/95 backdrop-blur-2xl border border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] min-w-[192px]">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-semibold text-white text-[11px] flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                    {displayEmail && (
                      <p className="text-[11px] text-[#8ca398] truncate">{displayEmail}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-2 px-2 py-1.5 rounded-lg text-xs font-medium text-red-300 hover:bg-red-500/12 hover:text-red-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );

  function renderNavItem(item: SidebarItem, index: number) {
    const isActive = activeSection === item.id;
    const isHovered = hoveredItemId === item.id && !isActive;

    return (
      <motion.button
        key={item.id}
        type="button"
        data-nav-item="true"
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        initial={
          prefersReduced
            ? false
            : isCollapsed
              ? { scale: 0.78, y: -6, opacity: 0.92 }
              : { x: -6, opacity: 0.94 }
        }
        animate={{ scale: 1, y: 0, x: 0, opacity: 1 }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 420,
                damping: 28,
                mass: 0.62,
                delay: Math.min(index, 15) * (isCollapsed ? 0.022 : 0.012),
              }
        }
        whileHover={prefersReduced ? undefined : isCollapsed ? { scale: 1.1 } : { x: 2 }}
        whileTap={prefersReduced ? undefined : { scale: 0.975 }}
        onClick={() => {
          setActiveSection(item.id);
          setFlyoutState(null);
        }}
        onMouseEnter={(e) => handleItemMouseEnter(item, e)}
        onMouseLeave={handleItemMouseLeave}
        className={cn(
          "relative flex items-center rounded-xl transition-colors duration-150 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 select-none flex-shrink-0",
          isCollapsed
            ? "w-10 h-9 [@media(max-height:840px)]:h-7.5 justify-center mx-auto"
            : "w-full h-[31px] xl:h-[33px] [@media(max-height:840px)]:h-[26px] gap-2.5 px-2.5",
          isActive
            ? "text-[#f2fbf6] font-semibold"
            : "text-[#9cb2a7] hover:text-[#f2fbf6]"
        )}
      >
        {/* V7 Gliding Hover Pill (slides smoothly row-to-row across pointer traversal) */}
        {isHovered && (
          <motion.span
            layoutId={isCollapsed ? "hoverDockTile" : "hoverSidebarPill"}
            transition={hoverSpring}
            className="absolute inset-0 rounded-xl bg-white/[0.055] border border-white/[0.07] -z-20 pointer-events-none"
          />
        )}

        {/* Active Highlight Surface + Emerald Accent Rail */}
        {!isCollapsed && isActive && (
          <motion.span
            layoutId="activeSidebarPill"
            transition={prefersReduced ? { duration: 0 } : navPillSpring}
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/18 via-emerald-500/8 to-transparent border border-emerald-400/32 shadow-[0_4px_16px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] -z-10"
          />
        )}
        {!isCollapsed && isActive && (
          <motion.span
            layoutId="activeSidebarRail"
            transition={prefersReduced ? { duration: 0 } : navPillSpring}
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]"
          />
        )}

        {/* Collapsed Dock Active Surface */}
        {isCollapsed && isActive && (
          <motion.span
            layoutId="activeDockTile"
            transition={prefersReduced ? { duration: 0 } : navPillSpring}
            className="absolute inset-0 rounded-xl bg-emerald-500/18 border border-emerald-400/35 shadow-[0_0_14px_rgba(16,185,129,0.22)] -z-10"
          />
        )}

        {/* Icon Slot (replays staggered V7 dock waterfall cascade when collapsing) */}
        <motion.span
          key={isCollapsed ? `dock-icon-${item.id}` : `row-icon-${item.id}`}
          initial={
            prefersReduced
              ? false
              : isCollapsed
                ? { scale: 0.54, y: 8, opacity: 0.92 }
                : { scale: 0.92 }
          }
          animate={
            prefersReduced
              ? undefined
              : {
                  scale: isActive || hoveredItemId === item.id ? 1.1 : 1,
                  y: 0,
                  opacity: 1,
                }
          }
          transition={
            prefersReduced
              ? { duration: 0 }
              : isCollapsed
                ? {
                    type: "spring",
                    stiffness: 440,
                    damping: 24,
                    mass: 0.58,
                    delay: Math.min(index, 14) * 0.025,
                  }
                : hoverSpring
          }
          className={cn(
            "relative flex items-center justify-center flex-shrink-0 transition-colors w-5 h-5",
            isActive
              ? "text-emerald-300"
              : "text-[#8ca398] group-hover:text-emerald-200"
          )}
        >
          {item.icon}

          {isCollapsed && item.badge !== undefined && (
            typeof item.badge === "number" ? (
              <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 bg-red-500 text-white border border-[#040b08] text-[8px] font-bold rounded-full flex items-center justify-center leading-none tabular-nums">
                {item.badge}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#040b08] shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            )
          )}
        </motion.span>

        {/* Expanded Label & Trailing Badge (slides in smoothly on dock expand) */}
        {!isCollapsed && (
          <motion.span
            initial={prefersReduced ? false : { opacity: 0.92, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReduced ? 0 : 0.18,
              delay: prefersReduced ? 0 : Math.min(index, 12) * 0.01,
              ease: MOTION_EASE.premium,
            }}
            className="flex items-center justify-between flex-1 min-w-0 gap-2"
          >
            <span className="truncate text-[12.5px] xl:text-[13px] tracking-[-0.01em] leading-none">
              {item.label}
            </span>

            {item.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] font-semibold rounded-md ml-auto tabular-nums leading-none whitespace-nowrap flex-shrink-0",
                  typeof item.badge === "number"
                    ? "bg-white/[0.08] text-zinc-200 border border-white/[0.1]"
                    : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                )}
              >
                {item.badge}
              </span>
            )}
          </motion.span>
        )}
      </motion.button>
    );
  }
}
