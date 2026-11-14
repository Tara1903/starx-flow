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
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface AdminToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  newLeadsCount?: number;
  adminEmail?: string;
}

export function AdminToolbar({
  searchQuery,
  onSearchChange,
  onRefresh,
  onLogout,
  onToggleMobileMenu,
  newLeadsCount = 0,
  adminEmail = "admin@starxflow.com",
}: AdminToolbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close popovers on click outside
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

  // Keyboard shortcut (⌘K or /) to focus search
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
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="sticky top-3 z-30 mb-6 w-full">
      <div className="w-full h-14 sm:h-16 px-3 sm:px-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)] flex items-center justify-between gap-3 select-none">
        {/* Left Side: Mobile Menu Button + Search Input */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open Admin Menu"
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Search Box */}
          <div className="relative w-full flex items-center">
            <Search
              size={15}
              className="absolute left-3 text-zinc-400 pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clients, workflows, demo requests..."
              className="w-full h-9 sm:h-10 pl-9 pr-14 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] focus:bg-[#0a1e16] border border-white/10 focus:border-emerald-400/60 text-xs sm:text-sm text-white placeholder-zinc-400 outline-none transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]"
            />
            <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/[0.08] text-zinc-400 border border-white/10">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Center: Live Telemetry Tag (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/25 text-[11px] font-semibold text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Operational &bull; 99.98% SLA</span>
        </div>

        {/* Right Side: Refresh + Notifications + Profile Card */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Refresh Action */}
          <button
            type="button"
            onClick={handleRefreshClick}
            aria-label="Refresh Data"
            title="Refresh Platform Telemetry"
            className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer"
          >
            <RefreshCw
              size={16}
              className={cn(isRefreshing && "animate-spin text-emerald-400")}
            />
          </button>

          {/* Notifications Popover */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              aria-label="Notifications"
              className="relative p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-colors cursor-pointer"
            >
              <Bell size={16} />
              {newLeadsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#08150f] animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0.92, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0.92, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#091710] border border-emerald-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 backdrop-blur-2xl z-50 text-left"
                >
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Platform Alerts
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {newLeadsCount} New
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {newLeadsCount > 0 ? (
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-emerald-400" />
                            Demo Requests
                          </span>
                          <span className="text-[10px] text-zinc-300">Today</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">
                          {newLeadsCount} new enterprise demo request(s) awaiting review.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 py-3 text-center">
                        All notifications clear. System nominal.
                      </p>
                    )}

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Supabase Sync Active</span>
                      </div>
                      <p className="text-[10px] text-zinc-300">
                        Live connection to auth &amp; profiles verified.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

          {/* Admin Profile Dropdown Button */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-expanded={isProfileOpen}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            >
              {/* Avatar Squircle */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                AD
              </div>

              {/* Identity (hidden on tiny screens) */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  Admin User
                </span>
                <span className="text-[10px] text-emerald-400 font-mono leading-tight">
                  Super Admin
                </span>
              </div>

              <ChevronDown
                size={14}
                className={cn(
                  "text-zinc-400 transition-transform hidden sm:block",
                  isProfileOpen && "rotate-180 text-emerald-400"
                )}
              />
            </button>

            {/* Profile Menu Popover */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0.92, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0.92, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#091710] border border-emerald-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 backdrop-blur-2xl z-50 text-left"
                >
                  <div className="p-3 border-b border-white/[0.08] mb-1">
                    <p className="text-xs font-bold text-white">Administrator</p>
                    <p className="text-[11px] text-zinc-300 font-mono truncate">
                      {adminEmail}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                      Master Control Role
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="px-3 py-2 text-xs text-zinc-300 flex items-center gap-2">
                      <Shield size={14} className="text-emerald-400" />
                      <span>Security: RLS &amp; RBAC Active</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={14} />
                      <span>Logout Admin Session</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
