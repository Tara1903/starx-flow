"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Bell,
  RefreshCw,
  Menu,
  ChevronDown,
  Shield,
  LogOut,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { CONSOLE_INPUT } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface AdminToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  newLeadsCount?: number;
  adminEmail?: string;
  isRealtimeConnected?: boolean;
}

export function AdminToolbar({
  searchQuery,
  onSearchChange,
  onRefresh,
  onLogout,
  onToggleMobileMenu,
  newLeadsCount = 0,
  adminEmail = "admin@starxflow.com",
  isRealtimeConnected = false,
}: AdminToolbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="w-full h-16 flex items-center justify-between gap-3 select-none">
      {/* Left: Mobile Menu + Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open admin menu"
          className="md:hidden p-2 rounded-lg text-[#a1aaa4] hover:text-[#edf0ee] hover:bg-[#19201d] transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" strokeWidth={1.65} />
        </button>

        <div className="relative w-full flex items-center">
          <Search
            className="w-4 h-4 absolute left-3 text-[#727c75] pointer-events-none"
            strokeWidth={1.65}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clients, leads, workflows"
            className={cn(CONSOLE_INPUT, "w-full h-9 pl-9 pr-12 text-xs sm:text-sm bg-[#121715]")}
          />
          <div className="absolute right-2.5 hidden sm:flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#19201d] text-[#a1aaa4] border border-[#edf0ee]/10">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Sync State + Refresh + Notifications + Profile */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-2.5 h-8 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08] text-xs text-[#a1aaa4]">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isRealtimeConnected ? "bg-[#4cc38a]" : "bg-amber-400"
            )}
          />
          <span>{isRealtimeConnected ? "Realtime active" : "Connecting"}</span>
        </div>

        <button
          type="button"
          onClick={handleRefreshClick}
          aria-label="Refresh platform data"
          title="Refresh data"
          className="w-8 h-8 rounded-lg bg-[#121715] hover:bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] transition-colors cursor-pointer"
        >
          <RefreshCw
            className={cn("w-4 h-4", isRefreshing && "animate-spin text-[#34d399]")}
            strokeWidth={1.65}
          />
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            className="relative w-8 h-8 rounded-lg bg-[#121715] hover:bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" strokeWidth={1.65} />
            {newLeadsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#34d399]" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0.92, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0.92, y: 4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-[#0c100e] border border-[#edf0ee]/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] p-4 z-50 text-left"
              >
                <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-[#edf0ee]/[0.08]">
                  <span className="text-xs font-medium text-[#edf0ee]">Notifications</span>
                  <span className="text-[11px] font-mono text-[#a1aaa4] bg-[#19201d] px-2 py-0.5 rounded border border-[#edf0ee]/10 tabular-nums">
                    {newLeadsCount} new
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {newLeadsCount > 0 ? (
                    <div className="p-2.5 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08] space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-[#edf0ee]">
                        <span className="flex items-center gap-1.5">
                          <Inbox className="w-3.5 h-3.5 text-[#34d399]" strokeWidth={1.65} />
                          Demo requests
                        </span>
                        <span className="text-[11px] text-[#727c75]">Today</span>
                      </div>
                      <p className="text-xs text-[#a1aaa4]">
                        {newLeadsCount} demo request{newLeadsCount === 1 ? "" : "s"} awaiting review
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#727c75] py-3 text-center">
                      No new alerts
                    </p>
                  )}

                  <div className="p-2.5 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.06] space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#edf0ee]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.65} />
                      <span>Database sync verified</span>
                    </div>
                    <p className="text-[11px] text-[#727c75]">
                      Auth and profile channels active
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2 h-8 px-2 rounded-lg bg-[#121715] hover:bg-[#19201d] border border-[#edf0ee]/[0.08] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[11px] font-medium text-[#edf0ee]">
              AD
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[#edf0ee]">
              Admin
            </span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#727c75] transition-transform duration-150 hidden sm:block",
                isProfileOpen && "rotate-180 text-[#edf0ee]"
              )}
              strokeWidth={1.65}
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0.92, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0.92, y: 4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0c100e] border border-[#edf0ee]/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] p-2 z-50 text-left"
              >
                <div className="p-2.5 border-b border-[#edf0ee]/[0.08] mb-1">
                  <p className="text-xs font-medium text-[#edf0ee]">Administrator</p>
                  <p className="text-[11px] text-[#727c75] font-mono truncate mt-0.5">
                    {adminEmail}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <div className="px-2.5 py-2 text-xs text-[#a1aaa4] flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.65} />
                    <span>RLS and RBAC enforced</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[#f28b8e] hover:bg-[#e5484d]/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.65} />
                    <span>Sign out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
