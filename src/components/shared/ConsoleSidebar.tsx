"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { navPillSpring, sidebarSpring, MOTION_EASE } from "../../lib/motionVariants";

export interface ConsoleSidebarSubItem {
  label: string;
  action: () => void;
}

export interface ConsoleSidebarItem<SectionId extends string = string> {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | string;
  group: string;
  subItems?: ConsoleSidebarSubItem[];
}

export interface ConsoleSidebarGroup<SectionId extends string = string> {
  id: string;
  title: string;
  items: ConsoleSidebarItem<SectionId>[];
}

export interface ConsoleSidebarProps<SectionId extends string = string> {
  asideAriaLabel: string;
  navAriaLabel: string;
  collapseAriaLabel: string;
  expandAriaLabel: string;
  searchAriaLabel: string;
  layoutIdPrefix: string;
  brandTitle: string;
  brandSubtitle: string;
  brandBadge?: string;
  groups: ConsoleSidebarGroup<SectionId>[];
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
  footerInitials: string;
  footerTitle: string;
  footerSubtitle: string;
  footerLiveBanner?: {
    label: string;
    statusText: string;
    isHealthy: boolean;
  };
  onLogout?: () => void;
  mobileDrawer?: {
    open: boolean;
    onClose: () => void;
    ariaLabel: string;
  };
}

export function ConsoleSidebar<SectionId extends string = string>({
  asideAriaLabel,
  navAriaLabel,
  collapseAriaLabel,
  expandAriaLabel,
  searchAriaLabel,
  layoutIdPrefix,
  brandTitle,
  brandSubtitle,
  brandBadge,
  groups,
  activeSection,
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
  onOpenSearch,
  footerInitials,
  footerTitle,
  footerSubtitle,
  footerLiveBanner,
  onLogout,
  mobileDrawer,
}: ConsoleSidebarProps<SectionId>) {
  const prefersReduced = useReducedMotion();

  const [tooltipState, setTooltipState] = useState<{
    label: string;
    badge?: string | number;
    groupName?: string;
    top: number;
  } | null>(null);

  const [flyoutState, setFlyoutState] = useState<{
    item: ConsoleSidebarItem<SectionId>;
    top: number;
  } | null>(null);

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

  const handleItemMouseEnter = (
    item: ConsoleSidebarItem<SectionId>,
    groupTitle: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
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
        groupName: groupTitle,
        top: top + btnRect.height / 2,
      });
    }
  };

  const handleItemMouseLeave = () => {
    setTooltipState(null);
    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyoutState(null);
    }, 220);
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

  const renderNavOption = (
    item: ConsoleSidebarItem<SectionId>,
    groupTitle: string,
    { forceExpanded = false }: { forceExpanded?: boolean } = {}
  ) => {
    const IconComp = item.icon;
    const isActive = activeSection === item.id;
    const collapsedView = !forceExpanded && isCollapsed;

    return (
      <button
        key={item.id}
        type="button"
        data-nav-item={forceExpanded ? undefined : "true"}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          onSelectSection(item.id);
          setFlyoutState(null);
          if (forceExpanded && mobileDrawer?.onClose) {
            mobileDrawer.onClose();
          }
        }}
        onMouseEnter={(e) => {
          if (!forceExpanded) handleItemMouseEnter(item, groupTitle, e);
        }}
        onMouseLeave={() => {
          if (!forceExpanded) handleItemMouseLeave();
        }}
        className={cn(
          "relative flex items-center rounded-xl transition-colors duration-150 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399]/70 select-none flex-shrink-0 border-0",
          collapsedView
            ? "w-11 h-11 justify-center mx-auto"
            : "w-full h-11 px-3.5 gap-3.5",
          isActive
            ? "bg-[#1d2722] text-[#edf0ee] font-medium"
            : "bg-[#121715] text-[#a1aaa4] hover:bg-[#19211d] hover:text-[#edf0ee]"
        )}
      >
        {isActive && (
          <motion.span
            layoutId={forceExpanded ? undefined : `${layoutIdPrefix}-active-bar`}
            transition={prefersReduced ? { duration: 0 } : navPillSpring}
            className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-[#34d399]"
            aria-hidden="true"
          />
        )}

        <span
          className={cn(
            "relative flex items-center justify-center flex-shrink-0 transition-colors",
            collapsedView ? "w-6 h-6" : "w-6 h-6",
            isActive ? "text-[#34d399]" : "text-[#8e9992] group-hover:text-[#edf0ee]"
          )}
        >
          <IconComp className="w-[20px] h-[20px]" strokeWidth={1.75} />

          {collapsedView && item.badge !== undefined && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#1d2722] text-[#edf0ee] text-[10px] font-mono font-medium flex items-center justify-center leading-none tabular-nums">
              {item.badge === "Live" ? "·" : item.badge}
            </span>
          )}
        </span>

        {!collapsedView && (
          <span className="flex items-center justify-between flex-1 min-w-0 gap-2.5">
            <span className="truncate text-[14px] leading-none">{item.label}</span>

            {item.badge !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 text-[11px] font-mono rounded-md ml-auto tabular-nums leading-tight whitespace-nowrap flex-shrink-0",
                  item.badge === "Live"
                    ? "bg-[#34d399]/14 text-[#4cc38a]"
                    : "bg-[#1c2420] text-[#a1aaa4]"
                )}
              >
                {item.badge}
              </span>
            )}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Optional Mobile Drawer (used cleanly on Admin mobile viewports) */}
      <AnimatePresence>
        {mobileDrawer?.open && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/75"
              onClick={mobileDrawer.onClose}
              aria-hidden="true"
            />
            <motion.aside
              initial={prefersReduced ? false : { x: -280 }}
              animate={{ x: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { x: -280 }}
              transition={{ duration: prefersReduced ? 0 : 0.2, ease: MOTION_EASE.premium }}
              className="relative z-10 w-72 h-full bg-[#0c100e] border-r border-[#edf0ee]/[0.08] flex flex-col p-3.5 justify-between"
              aria-label={mobileDrawer.ariaLabel}
            >
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between px-1 pb-3.5 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#121715] flex items-center justify-center flex-shrink-0">
                      <img src="/logo.svg" alt={brandTitle} className="w-5 h-5 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-semibold text-[#edf0ee] truncate">{brandTitle}</p>
                        {brandBadge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-[#34d399]/14 text-[#4cc38a] leading-none">
                            {brandBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#727c75] truncate">{brandSubtitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={mobileDrawer.onClose}
                    aria-label="Close navigation"
                    className="w-8 h-8 rounded-lg bg-[#121715] hover:bg-[#19211d] flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto console-scroll flex flex-col gap-5 py-1">
                  {groups.map((group) => (
                    <div key={group.id} className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-[#727c75] px-2">{group.title}</p>
                      <div className="flex flex-col gap-2">
                        {group.items.map((item) =>
                          renderNavOption(item, group.title, { forceExpanded: true })
                        )}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full h-11 mt-3 px-3.5 rounded-xl bg-[#121715] hover:bg-[#e5484d]/12 text-[#f28b8e] text-sm font-medium transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.75} />
                  <span>Sign out</span>
                </button>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Unified Desktop Sidebar Rail (Identical across Admin & Client Dashboards) */}
      <motion.aside
        aria-label={asideAriaLabel}
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={prefersReduced ? { duration: 0 } : sidebarSpring}
        className="hidden md:flex flex-col fixed top-3.5 bottom-3.5 left-3.5 z-40 select-none h-[calc(100vh-1.75rem)] h-[calc(100dvh-1.75rem)] pointer-events-auto"
      >
        <div
          ref={asideContainerRef}
          className="flex flex-col h-full rounded-2xl border border-[#edf0ee]/[0.08] bg-[#0c100e] relative justify-between"
        >
          {/* Header & Optional Collapsed Search Button */}
          <div className="flex flex-col flex-shrink-0">
            <div
              className={cn(
                "flex items-center h-16 px-3.5 relative flex-shrink-0",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onMouseEnter={(e) => {
                    if (isCollapsed) {
                      const asideRect = asideContainerRef.current?.getBoundingClientRect();
                      const btnRect = e.currentTarget.getBoundingClientRect();
                      if (asideRect) {
                        setFlyoutState(null);
                        setTooltipState({
                          label: brandTitle,
                          badge: brandBadge,
                          top: btnRect.top - asideRect.top + btnRect.height / 2,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed) setTooltipState(null);
                  }}
                  className="w-9 h-9 rounded-xl bg-[#121715] flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  <img src="/logo.svg" alt={brandTitle} className="w-5 h-5 object-contain" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-semibold text-[#edf0ee] tracking-[-0.01em] truncate">
                        {brandTitle}
                      </span>
                      {brandBadge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[#34d399]/14 text-[#4cc38a] leading-none whitespace-nowrap">
                          {brandBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#727c75] truncate max-w-[152px] leading-tight mt-0.5">
                      {brandSubtitle}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? expandAriaLabel : collapseAriaLabel}
                className={cn(
                  "w-7 h-7 rounded-full bg-[#121715] hover:bg-[#19211d] flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399]/70",
                  isCollapsed
                    ? "absolute -right-3 top-4.5 z-50 border border-[#edf0ee]/[0.1]"
                    : "relative flex-shrink-0"
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
              <div className="px-3 pb-2 flex-shrink-0 flex justify-center">
                <button
                  type="button"
                  onClick={onOpenSearch}
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
                  aria-label={searchAriaLabel}
                  className="w-11 h-11 rounded-xl bg-[#121715] hover:bg-[#19211d] flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399]/70"
                >
                  <Search className="w-[20px] h-[20px]" strokeWidth={1.75} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Options — Larger Borderless Tonal Tiles Separated cleanly by #0c100e Canvas */}
          <nav
            ref={desktopNavRef}
            onKeyDown={handleDesktopNavKeyDown}
            aria-label={navAriaLabel}
            className={cn(
              "flex-1 min-h-0 flex flex-col overflow-y-auto console-scroll select-none",
              isCollapsed ? "px-3 py-1 gap-2 items-center" : "px-3 py-1 gap-5"
            )}
          >
            {groups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  "flex flex-col flex-shrink-0",
                  isCollapsed ? "gap-2 items-center w-full" : "gap-2"
                )}
              >
                {!isCollapsed && group.title && (
                  <span className="text-xs font-medium text-[#727c75] px-2 pt-1 whitespace-nowrap">
                    {group.title}
                  </span>
                )}
                <div className={cn("flex flex-col gap-2 w-full", isCollapsed && "items-center")}>
                  {group.items.map((item) => renderNavOption(item, group.title))}
                </div>
              </div>
            ))}
          </nav>

          {/* Identical Unified Footer */}
          <div className="flex flex-col flex-shrink-0 p-3 gap-2">
            {!isCollapsed && footerLiveBanner && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#121715] text-xs">
                <span className="flex items-center gap-2 text-[#a1aaa4]">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      footerLiveBanner.isHealthy ? "bg-[#34d399]" : "bg-amber-400"
                    )}
                    aria-hidden="true"
                  />
                  <span>{footerLiveBanner.label}</span>
                </span>
                <span className="font-mono text-[11px] text-[#727c75]">
                  {footerLiveBanner.statusText}
                </span>
              </div>
            )}

            <div
              className={cn(
                "flex items-center rounded-xl transition-colors",
                isCollapsed
                  ? "justify-center"
                  : "justify-between px-2.5 py-2 bg-[#121715]"
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
                className="flex items-center gap-3 min-w-0 cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-[#1d2722] flex items-center justify-center font-medium text-[#edf0ee] text-xs">
                    {footerInitials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34d399] ring-2 ring-[#0c100e]" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 max-w-[144px]">
                    <span className="text-[13px] font-medium text-[#edf0ee] truncate leading-tight">
                      {footerTitle}
                    </span>
                    <span className="text-[11px] text-[#727c75] truncate leading-tight tabular-nums mt-0.5">
                      {footerSubtitle}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center justify-center text-[#727c75] hover:text-[#f28b8e] p-2 rounded-lg hover:bg-[#e5484d]/12 transition-colors cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399]/70"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>

          {/* Collapsed Tooltip */}
          <AnimatePresence>
            {isCollapsed && tooltipState && !flyoutState && (
              <motion.div
                key={tooltipState.label}
                initial={prefersReduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -4 }}
                transition={{ duration: prefersReduced ? 0 : 0.14, ease: MOTION_EASE.premium }}
                style={{ top: tooltipState.top }}
                className="absolute left-full ml-3 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl bg-[#121715] border border-[#edf0ee]/[0.1] text-xs font-medium text-[#edf0ee] whitespace-nowrap shadow-[0_12px_32px_rgba(0,0,0,0.65)] flex items-center gap-2 pointer-events-none select-none"
              >
                <span>{tooltipState.label}</span>
                {tooltipState.badge !== undefined && (
                  <span className="text-[11px] font-mono text-[#4cc38a] tabular-nums">
                    {tooltipState.badge}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Flyout Menu */}
          <AnimatePresence>
            {isCollapsed && flyoutState && (
              <motion.div
                key={String(flyoutState.item.id)}
                initial={prefersReduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -4 }}
                transition={{ duration: prefersReduced ? 0 : 0.14, ease: MOTION_EASE.premium }}
                style={{ top: flyoutState.top }}
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={() => setFlyoutState(null)}
                className="absolute left-full pl-3 z-50 select-none pointer-events-auto"
              >
                <div className="p-2 rounded-2xl bg-[#0c100e] border border-[#edf0ee]/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.75)] min-w-[200px] flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-[#727c75] px-2.5 py-1">
                    {flyoutState.item.label}
                  </p>
                  {flyoutState.item.subItems?.map((sub, sIdx) => (
                    <button
                      key={`${String(flyoutState.item.id)}-${sIdx}`}
                      type="button"
                      onClick={() => {
                        sub.action();
                        setFlyoutState(null);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[#121715] hover:bg-[#19211d] text-xs font-medium text-[#a1aaa4] hover:text-[#edf0ee] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate">{sub.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#727c75]" />
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
                initial={prefersReduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -4 }}
                transition={{ duration: prefersReduced ? 0 : 0.14, ease: MOTION_EASE.premium }}
                className="absolute left-full pl-3 bottom-3 z-50 select-none pointer-events-auto"
                onMouseEnter={() => setShowProfileFlyout(true)}
                onMouseLeave={() => setShowProfileFlyout(false)}
              >
                <div className="p-3 rounded-2xl bg-[#0c100e] border border-[#edf0ee]/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.75)] min-w-[200px] space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1d2722] flex items-center justify-center font-medium text-[#edf0ee] text-xs flex-shrink-0">
                      {footerInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#edf0ee] truncate">{footerTitle}</p>
                      <p className="text-[11px] text-[#727c75] truncate">{footerSubtitle}</p>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full px-3 py-2 rounded-xl bg-[#121715] hover:bg-[#e5484d]/12 text-xs font-medium text-[#f28b8e] transition-colors flex items-center gap-2 cursor-pointer"
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
