"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Inbox,
  MessageSquare,
  BarChart3,
  CreditCard,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowRight,
  X,
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";
import { navPillSpring, sidebarSpring, MOTION_EASE } from "../../lib/motionVariants";

export type AdminSection = "overview" | "clients" | "leads" | "support" | "analytics" | "plans" | "settings";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  totalClientsCount: number;
  newLeadsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  adminEmail?: string;
  isRealtimeConnected?: boolean;
}

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | string;
  group: "main" | "intelligence" | "system";
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
  isRealtimeConnected = true,
}: AdminSidebarProps) {
  const prefersReduced = useReducedMotion();
  const isCollapsed = useAdminStore((s) => s.isSidebarCollapsed);
  const setIsCollapsed = useAdminStore((s) => s.setSidebarCollapsed);
  const supportCount = useAdminStore((s) => s.supportData?.conversations?.length || 0);
  const openCommandCenter = useUIStore((s) => s.openCommandCenter);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024 && window.innerWidth < 1280) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  const [tooltipState, setTooltipState] = useState<{
    label: string;
    badge?: string | number;
    top: number;
  } | null>(null);

  const [flyoutState, setFlyoutState] = useState<{ item: NavItem; top: number } | null>(null);
  const [showProfileFlyout, setShowProfileFlyout] = useState(false);

  const desktopNavRef = useRef<HTMLElement>(null);
  const asideContainerRef = useRef<HTMLDivElement>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      setTooltipState(null);
      setFlyoutState(null);
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
      setShowProfileFlyout(false);
      setFlyoutState({ item, top });
    } else {
      setFlyoutState(null);
      setShowProfileFlyout(false);
      setTooltipState({
        label: item.label,
        badge: item.badge,
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
    if (e.key === "Home") buttons[0]?.focus();
    else if (e.key === "End") buttons[buttons.length - 1]?.focus();
    else if (e.key === "ArrowDown") buttons[(idx + 1 + buttons.length) % buttons.length]?.focus();
    else if (e.key === "ArrowUp") buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
  };

  const groups: NavGroup[] = [
    {
      title: "Core",
      group: "main",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard, group: "main" },
        {
          id: "clients",
          label: "Clients",
          icon: Users,
          badge: totalClientsCount > 0 ? totalClientsCount : undefined,
          group: "main",
          subItems: [
            { label: "Active subscribers", action: () => onSelectSection("clients") },
            { label: "Recent signups", action: () => onSelectSection("clients") },
          ],
        },
        {
          id: "leads",
          label: "Demo inquiries",
          icon: Inbox,
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
          group: "main",
          subItems: [
            { label: "Pending reviews", action: () => onSelectSection("leads") },
            { label: "Scheduled demos", action: () => onSelectSection("leads") },
          ],
        },
        {
          id: "support",
          label: "Support desk",
          icon: MessageSquare,
          badge: supportCount > 0 ? supportCount : undefined,
          group: "main",
          subItems: [
            { label: "Support inbox", action: () => onSelectSection("support") },
            { label: "WhatsApp & Instagram", action: () => onSelectSection("support") },
          ],
        },
      ],
    },
    {
      title: "Operations",
      group: "intelligence",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          group: "intelligence",
          subItems: [
            { label: "Throughput", action: () => onSelectSection("analytics") },
            { label: "Conversion rate", action: () => onSelectSection("analytics") },
          ],
        },
        { id: "plans", label: "Plans", icon: CreditCard, group: "intelligence" },
      ],
    },
    {
      title: "System",
      group: "system",
      items: [{ id: "settings", label: "Settings & audit", icon: Shield, group: "system" }],
    },
  ];

  const renderSidebarItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;

    return (
      <div key={item.id} className="relative flex items-center">
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
            "w-full h-9 flex items-center rounded-lg text-[13px] transition-colors duration-150 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#34d399]/70 select-none",
            isCollapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
            isActive
              ? "text-[#edf0ee] font-medium"
              : "text-[#a1aaa4] hover:text-[#edf0ee] hover:bg-[#19201d]/60"
          )}
        >
          {!isCollapsed && isActive && (
            <motion.span
              layoutId="adminSidebarActivePill"
              transition={prefersReduced ? { duration: 0 } : navPillSpring}
              className="absolute inset-0 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] -z-10"
            />
          )}

          {isCollapsed && isActive && (
            <motion.span
              layoutId="adminDockDot"
              transition={prefersReduced ? { duration: 0 } : navPillSpring}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#34d399]"
            />
          )}

          <div
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-150 relative",
              isActive ? "text-[#34d399]" : "text-[#727c75] group-hover:text-[#edf0ee]"
            )}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />

            {isCollapsed && item.badge !== undefined && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/20 text-[9px] font-mono rounded-full flex items-center justify-center tabular-nums">
                {item.badge}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="text-[11px] font-mono text-[#a1aaa4] tabular-nums ml-2">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={onCloseMobile}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-72 h-full bg-[#0c100e] border-r border-[#edf0ee]/[0.08] flex flex-col p-4 justify-between"
              aria-label="Mobile admin navigation"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#edf0ee]/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center">
                      <img src="/logo.svg" alt="StarX Flow" className="w-4 h-4 object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#edf0ee]">StarX Flow</p>
                      <p className="text-xs text-[#727c75]">Admin console</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onCloseMobile}
                    aria-label="Close navigation"
                    className="p-1.5 rounded-lg text-[#a1aaa4] hover:text-[#edf0ee] hover:bg-[#19201d]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="mt-4 space-y-5">
                  {groups.map((group) => (
                    <div key={group.title}>
                      <p className="text-xs font-medium text-[#727c75] px-2.5 mb-2">
                        {group.title}
                      </p>
                      <div className="space-y-1">{group.items.map(renderSidebarItem)}</div>
                    </div>
                  ))}
                </nav>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#f28b8e] hover:bg-[#e5484d]/10 border border-[#edf0ee]/[0.08]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Dock */}
      <motion.aside
        aria-label="Admin Navigation"
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={prefersReduced ? { duration: 0 } : sidebarSpring}
        className="hidden md:flex flex-col fixed top-3.5 bottom-3.5 left-3.5 z-40 select-none h-[calc(100vh-1.75rem)] h-[calc(100dvh-1.75rem)] pointer-events-auto"
      >
        <div
          ref={asideContainerRef}
          className="flex flex-col h-full rounded-2xl border border-[#edf0ee]/[0.08] bg-[#0c100e] relative justify-between"
        >
          {/* Top Brand Header + Collapsed Search */}
          <div className="flex flex-col flex-shrink-0">
            <div
              className={cn(
                "flex items-center h-14 px-3 relative border-b border-[#edf0ee]/[0.08] flex-shrink-0",
                isCollapsed ? "justify-center" : "justify-between px-3.5"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  onMouseEnter={(e) => {
                    if (isCollapsed) {
                      const asideRect = asideContainerRef.current?.getBoundingClientRect();
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      if (asideRect) {
                        setFlyoutState(null);
                        setTooltipState({
                          label: "StarX Flow",
                          badge: "Admin",
                          top: btnRect.top - asideRect.top + btnRect.height / 2,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed) setTooltipState(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-[#121715] border border-[#edf0ee]/10 flex items-center justify-center flex-shrink-0"
                >
                  <img src="/logo.svg" alt="StarX Flow" className="w-4 h-4 object-contain" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#edf0ee] tracking-[-0.01em] truncate">
                      StarX Flow
                    </span>
                    <span className="text-xs text-[#727c75] truncate max-w-[140px]">
                      Platform admin
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
                className={cn(
                  "w-6 h-6 rounded-full bg-[#121715] border border-[#edf0ee]/12 flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#34d399]",
                  isCollapsed ? "absolute -right-2.5 top-4 z-50" : "relative"
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {isCollapsed && (
              <div className="px-2 pt-3 pb-1 flex justify-center">
                <button
                  type="button"
                  onClick={openCommandCenter}
                  onMouseEnter={(e) => {
                    const asideRect = asideContainerRef.current?.getBoundingClientRect();
                    const btnRect = e.currentTarget.getBoundingClientRect();
                    if (asideRect) {
                      setFlyoutState(null);
                      setTooltipState({
                        label: "Search",
                        badge: "⌘K",
                        top: btnRect.top - asideRect.top + btnRect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltipState(null)}
                  aria-label="Search admin (Press ⌘K)"
                  className="w-9 h-9 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08] hover:bg-[#19201d] flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" strokeWidth={1.65} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Groups */}
          <nav
            ref={desktopNavRef}
            onKeyDown={handleDesktopNavKeyDown}
            aria-label="Admin sections"
            className="flex-1 min-h-0 flex flex-col justify-start overflow-hidden px-3 py-4 gap-5 select-none"
          >
            {groups.map((group, gIdx) => (
              <div key={group.title} className="space-y-1">
                {!isCollapsed ? (
                  <p className="text-xs font-medium text-[#727c75] px-2.5 pb-1">
                    {group.title}
                  </p>
                ) : (
                  gIdx > 0 && <div className="my-2 border-t border-[#edf0ee]/[0.06]" />
                )}
                <div className="space-y-1">{group.items.map(renderSidebarItem)}</div>
              </div>
            ))}
          </nav>

          {/* Bottom Unified Profile & Realtime Indicator */}
          <div className="flex flex-col flex-shrink-0 border-t border-[#edf0ee]/[0.08] p-3 gap-2">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.06] text-xs">
                <span className="flex items-center gap-2 text-[#a1aaa4]">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isRealtimeConnected ? "bg-[#4cc38a]" : "bg-amber-400"
                    )}
                  />
                  Supabase live
                </span>
                <span className="font-mono text-[11px] text-[#727c75]">
                  {isRealtimeConnected ? "Connected" : "Syncing"}
                </span>
              </div>
            )}

            <div
              className={cn(
                "flex items-center rounded-lg",
                isCollapsed ? "justify-center" : "justify-between px-2 py-1.5"
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
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center font-medium text-[#edf0ee] text-xs flex-shrink-0">
                  AD
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 max-w-[140px]">
                    <span className="text-xs font-medium text-[#edf0ee] truncate">
                      Platform admin
                    </span>
                    <span className="text-[11px] text-[#727c75] truncate">{adminEmail}</span>
                  </div>
                )}
              </div>

              {!isCollapsed && onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-[#727c75] hover:text-[#f28b8e] p-1.5 rounded-lg hover:bg-[#e5484d]/10 transition-colors cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.65} />
                </button>
              )}
            </div>
          </div>

          {/* Collapsed Tooltip */}
          <AnimatePresence>
            {isCollapsed && tooltipState && !flyoutState && (
              <motion.div
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.12, ease: MOTION_EASE.premium }}
                style={{ top: tooltipState.top }}
                className="absolute left-full ml-3 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg bg-[#121715] border border-[#edf0ee]/12 text-xs font-medium text-[#edf0ee] whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.55)] flex items-center gap-2 pointer-events-none select-none"
              >
                <span>{tooltipState.label}</span>
                {tooltipState.badge !== undefined && (
                  <span className="text-[11px] font-mono text-[#a1aaa4]">{tooltipState.badge}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Hover Flyout */}
          <AnimatePresence>
            {isCollapsed && flyoutState && (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                style={{ top: flyoutState.top }}
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={() => setFlyoutState(null)}
                className="absolute left-full pl-3 z-50 select-none pointer-events-auto"
              >
                <div className="p-2 rounded-xl bg-[#0c100e] border border-[#edf0ee]/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] min-w-[180px] space-y-1">
                  <p className="text-xs font-medium text-[#727c75] px-2 py-1 border-b border-[#edf0ee]/[0.06]">
                    {flyoutState.item.label}
                  </p>
                  {flyoutState.item.subItems?.map((sub, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        sub.action();
                        setFlyoutState(null);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-[#a1aaa4] hover:text-[#edf0ee] hover:bg-[#19201d] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{sub.label}</span>
                      <ArrowRight className="w-3 h-3 text-[#727c75]" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Profile Flyout */}
          <AnimatePresence>
            {isCollapsed && showProfileFlyout && (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.14, ease: MOTION_EASE.premium }}
                className="absolute left-full pl-3 bottom-3 z-50 select-none pointer-events-auto"
                onMouseEnter={() => setShowProfileFlyout(true)}
                onMouseLeave={() => setShowProfileFlyout(false)}
              >
                <div className="p-2.5 rounded-xl bg-[#0c100e] border border-[#edf0ee]/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] min-w-[180px]">
                  <div className="pb-2 border-b border-[#edf0ee]/[0.08]">
                    <p className="text-xs font-medium text-[#edf0ee] truncate">Platform admin</p>
                    <p className="text-[11px] text-[#727c75] truncate">{adminEmail}</p>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full mt-2 px-2 py-1.5 rounded-lg text-xs font-medium text-[#f28b8e] hover:bg-[#e5484d]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
