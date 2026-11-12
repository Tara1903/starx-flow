"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  useDashboardStore,
  type DashboardSection,
} from "../../store/dashboardStore";
import { cn } from "../../lib/utils";
import { GlassSheet } from "../ui/GlassSheet";
import { GlassTooltip } from "../ui/GlassTooltip";
import { navPillSpring, sidebarSpring, MOTION_EASE } from "../../lib/motionVariants";

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  group: "core" | "ai" | "ops";
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

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640 && window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  const connectedChannelsCount = connectedChannels.filter((c) => c.isConnected).length;
  const unreadConversationsCount = conversations.filter((c) => c.unread).length;

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isQuickHubOpen, setIsQuickHubOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement>(null);

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
    { id: "overview", label: "Overview", icon: <Home className="w-4 h-4" />, group: "core" },
    {
      id: "conversations",
      label: "Inbox",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined,
      group: "core",
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: <Layers className="w-4 h-4" />,
      badge: activeWorkflowsCount > 0 ? activeWorkflowsCount : undefined,
      group: "ai",
    },
    { id: "crm", label: "Customers", icon: <Users className="w-4 h-4" />, group: "core" },
    { id: "calendar", label: "Calendar", icon: <CalendarIcon className="w-4 h-4" />, group: "core" },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" />, group: "core" },
    { id: "knowledge", label: "Knowledge", icon: <BookOpen className="w-4 h-4" />, group: "ops" },
    { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-4 h-4" />, group: "core" },
    { id: "team", label: "Team", icon: <Contact className="w-4 h-4" />, group: "ops" },
    { id: "playground", label: "AI Playground", icon: <Brain className="w-4 h-4" />, group: "ai" },
    { id: "agents", label: "AI Receptionist", icon: <Bot className="w-4 h-4" />, group: "ai" },
    { id: "voice", label: "Voice (Post-Launch)", icon: <Phone className="w-4 h-4" />, group: "ai" },
    { id: "os", label: "Business OS", icon: <Cpu className="w-4 h-4" />, group: "ai" },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" />, group: "ops" },
    {
      id: "channels",
      label: "Channels",
      icon: <Radio className="w-4 h-4" />,
      badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined,
      group: "ops",
    },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" />, group: "ops" },
  ];

  const primaryBottomIds = new Set<DashboardSection>(["overview", "crm", "conversations"]);
  const isMoreActive = !primaryBottomIds.has(activeSection);

  return (
    <>
      {/* Desktop Floating Obsidian-Emerald Glass Dock (Reference 2: Expanding Sidebar) */}
      <motion.aside
        aria-label="Dashboard sidebar"
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={prefersReduced ? { duration: 0.01 } : sidebarSpring}
        className="hidden sm:flex flex-col h-screen fixed left-0 top-0 p-2 z-30 select-none"
      >
        <div className="glass-dock rounded-2xl flex flex-col h-full overflow-visible">
          {/* Brand Header */}
          <div
            className={cn(
              "flex items-center px-3 py-4 border-b border-white/[0.07] relative",
              isCollapsed ? "justify-center" : "justify-between px-4"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-500/35 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(16,185,129,0.2)]">
                <img
                  src="/logo.svg"
                  alt="StarX"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="sidebar-brand-label"
                    initial={prefersReduced ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, x: -6 }}
                    transition={{ duration: 0.16, ease: MOTION_EASE.premium }}
                    className="flex flex-col min-w-0"
                  >
                    <span className="text-sm font-bold text-white tracking-tight truncate">
                      StarX Flow
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-medium truncate max-w-[140px]">
                      {user?.businessName || "My Business"}
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
              whileTap={prefersReduced ? undefined : { scale: 0.9 }}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#09120f] border border-emerald-500/30 flex items-center justify-center text-zinc-400 hover:text-emerald-300 hover:border-emerald-400/60 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </motion.button>
          </div>

          {/* Navigation Items */}
          <nav
            ref={desktopNavRef}
            onKeyDown={handleDesktopNavKeyDown}
            className="flex-1 px-2 py-3 space-y-1 overflow-y-auto console-scroll"
          >
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              const buttonNode = (
                <button
                  type="button"
                  key={item.id}
                  data-nav-item="true"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                    isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                    isActive
                      ? "text-emerald-200"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={prefersReduced ? undefined : "dashboard-dock-active"}
                      transition={navPillSpring}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/22 via-emerald-500/10 to-transparent border border-emerald-500/35 shadow-[0_0_20px_rgba(16,185,129,0.14)] -z-10"
                    />
                  )}

                  <span
                    className={cn(
                      "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive
                        ? "text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.55)]"
                        : "text-zinc-400 group-hover:text-emerald-300"
                    )}
                  >
                    {item.icon}
                  </span>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        initial={prefersReduced ? false : { opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReduced ? undefined : { opacity: 0, x: -4 }}
                        transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                        className="truncate text-[13px]"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "flex items-center justify-center text-[10px] font-bold rounded-full",
                        isCollapsed
                          ? "absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-black border border-black"
                          : "ml-auto px-1.5 py-0.5 min-w-[20px] bg-emerald-500/18 text-emerald-300 border border-emerald-500/35"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );

              if (isCollapsed) {
                return (
                  <GlassTooltip key={item.id} content={item.label} side="right">
                    {buttonNode}
                  </GlassTooltip>
                );
              }

              return buttonNode;
            })}
          </nav>

          {/* Footer Area */}
          <div className="p-2.5 border-t border-white/[0.07] space-y-2">
            {/* System Live Indicator */}
            <div
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <div className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping motion-reduce:hidden absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              {!isCollapsed && (
                <span className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider">
                  System Live
                </span>
              )}
            </div>

            {/* User & Logout */}
            <div
              className={cn(
                "flex items-center justify-between",
                isCollapsed ? "flex-col gap-1.5" : "px-1.5 py-1"
              )}
            >
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 max-w-[150px]">
                  <span className="text-xs font-bold text-white truncate">
                    {user?.name || "Owner"}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">
                    {user?.email}
                  </span>
                </div>
              )}

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
        </div>
      </motion.aside>

      {/* Mobile Navigation Tabs V10 Floating Capsule */}
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
              "relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-full transition-colors cursor-pointer",
              activeSection === "overview" ? "text-emerald-300" : "text-zinc-400"
            )}
          >
            {activeSection === "overview" && (
              <motion.span
                layoutId={prefersReduced ? undefined : "dashboard-mobile-pill"}
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/18 border border-emerald-500/35 -z-10"
              />
            )}
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">
              Home
            </span>
          </button>

          {/* Leads / CRM */}
          <button
            type="button"
            onClick={() => setActiveSection("crm")}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-full transition-colors cursor-pointer",
              activeSection === "crm" ? "text-emerald-300" : "text-zinc-400"
            )}
          >
            {activeSection === "crm" && (
              <motion.span
                layoutId={prefersReduced ? undefined : "dashboard-mobile-pill"}
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/18 border border-emerald-500/35 -z-10"
              />
            )}
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">
              Leads
            </span>
          </button>

          {/* Center Glowing Emerald Quick Action Hub */}
          <button
            type="button"
            onClick={() => setIsQuickHubOpen(true)}
            aria-label="Open quick actions"
            className="relative -mt-4 mx-1 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-[#02120c] flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.55),inset_0_1px_0_rgba(255,255,255,0.5)] border border-emerald-300/60 active:scale-95 transition-transform cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Inbox */}
          <button
            type="button"
            onClick={() => setActiveSection("conversations")}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-full transition-colors cursor-pointer",
              activeSection === "conversations" ? "text-emerald-300" : "text-zinc-400"
            )}
          >
            {activeSection === "conversations" && (
              <motion.span
                layoutId={prefersReduced ? undefined : "dashboard-mobile-pill"}
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/18 border border-emerald-500/35 -z-10"
              />
            )}
            <div className="relative">
              <MessageSquare className="w-4 h-4" />
              {unreadConversationsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 bg-emerald-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center border border-black">
                  {unreadConversationsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold mt-0.5 leading-none">
              Inbox
            </span>
          </button>

          {/* More */}
          <button
            type="button"
            onClick={() => setIsMobileMoreOpen(true)}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-full transition-colors cursor-pointer",
              isMoreActive ? "text-emerald-300" : "text-zinc-400"
            )}
          >
            {isMoreActive && (
              <motion.span
                layoutId={prefersReduced ? undefined : "dashboard-mobile-pill"}
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/18 border border-emerald-500/35 -z-10"
              />
            )}
            <Menu className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Center Quick Actions Sheet (Mobile) */}
      <GlassSheet
        open={isQuickHubOpen}
        onClose={() => setIsQuickHubOpen(false)}
        side="bottom"
        title="Quick Actions"
      >
        <div className="space-y-2 pb-4">
          {[
            {
              id: "crm" as DashboardSection,
              label: "Manage Leads & Customers",
              icon: <Plus className="w-4 h-4 text-emerald-400" />,
            },
            {
              id: "workflows" as DashboardSection,
              label: "Create Automation Workflow",
              icon: <Zap className="w-4 h-4 text-emerald-400" />,
            },
            {
              id: "calendar" as DashboardSection,
              label: "Schedule & View Bookings",
              icon: <CalendarIcon className="w-4 h-4 text-emerald-400" />,
            },
            {
              id: "agents" as DashboardSection,
              label: "Configure AI Receptionist",
              icon: <Bot className="w-4 h-4 text-emerald-400" />,
            },
          ].map((action) => (
            <button
              type="button"
              key={action.id}
              onClick={() => {
                setActiveSection(action.id);
                setIsQuickHubOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/35 text-sm font-semibold text-zinc-100 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-3">
                {action.icon}
                {action.label}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          ))}
        </div>
      </GlassSheet>

      {/* Mobile Full Directory Sheet */}
      <GlassSheet
        open={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        side="bottom"
        title="Workspace Modules"
      >
        <div className="flex flex-col gap-1.5 pb-6">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMoreOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.05] border border-transparent"
                )}
              >
                <span className={cn(isActive ? "text-emerald-400" : "text-zinc-400")}>
                  {item.icon}
                </span>
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="h-px bg-white/10 my-2" />

          <button
            type="button"
            onClick={() => {
              setIsMobileMoreOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </GlassSheet>
    </>
  );
}
