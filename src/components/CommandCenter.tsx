"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Calendar,
  Settings,
  ShieldCheck,
  Wifi,
  LayoutGrid,
  DollarSign,
} from "lucide-react";
import { smoothTransition } from "../lib/motionVariants";
import { useUIStore } from "../store/uiStore";
import { cn } from "../lib/utils";

export function CommandCenter() {
  const isOpen = useUIStore((s) => s.isCommandCenterOpen);
  const closeCommandCenter = useUIStore((s) => s.closeCommandCenter);
  const toggleCommandCenter = useUIStore((s) => s.toggleCommandCenter);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandCenter();
      } else if (e.key === "Escape" && isOpen) {
        closeCommandCenter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCommandCenter, toggleCommandCenter]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
    setQuery("");
  }, [isOpen]);

  const handleAction = (path: string) => {
    closeCommandCenter();
    router.push(path);
  };

  const actions = [
    { id: "dashboard", icon: Command, label: "Go to Dashboard", path: "/dashboard" },
    { id: "whatsapp-meta", icon: ShieldCheck, label: "Configure Meta API", path: "/setup/whatsapp" },
    { id: "channels", icon: Wifi, label: "Manage Integrations", path: "/dashboard?section=channels" },
    { id: "inbox", icon: MessageSquare, label: "View Inbox", path: "/dashboard?section=conversations" },
    { id: "calendar", icon: Calendar, label: "View Calendar", path: "/dashboard?section=calendar" },
    { id: "collections", icon: LayoutGrid, label: "Browse 160+ Business Demos", path: "/collections" },
    { id: "pricing", icon: DollarSign, label: "View Pricing Plans", path: "/pricing" },
    { id: "settings", icon: Settings, label: "OS Settings", path: "/dashboard?section=settings" },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredActions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filteredActions[selectedIndex];
      if (chosen) handleAction(chosen.path);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 pt-16 sm:pt-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            style={{ WebkitBackdropFilter: "blur(12px)" }}
            onClick={closeCommandCenter}
          />
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10 }}
            transition={smoothTransition}
            className="relative w-full max-w-2xl glass-card-obsidian rounded-2xl overflow-hidden border border-emerald-500/25 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(16,185,129,0.12)]"
          >
            <div className="flex items-center px-4 border-b border-white/10 focus-within:border-emerald-400/50 transition-colors">
              <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                aria-label="Search commands or routes"
                placeholder="Type a command or search routes..."
                className="w-full bg-transparent text-white px-3.5 py-4 outline-none focus-visible:outline-none text-sm sm:text-base placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={closeCommandCenter}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded-md cursor-pointer"
              >
                <span>esc</span>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 console-scroll">
              {query.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleAction("/demo")}
                  className="w-full text-left px-3 py-3 mb-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-emerald-500/18 transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-emerald-50 text-sm font-medium">
                      Try Interactive AI Demo
                    </div>
                    <div className="text-emerald-400/75 text-xs">
                      Test &ldquo;{query}&rdquo; in live demo sandbox
                    </div>
                  </div>
                </button>
              )}

              <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Quick Navigation</span>
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">↑↓ to navigate · ↵ to open</span>
              </div>

              {filteredActions.map((action, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    type="button"
                    key={action.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleAction(action.path)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all group text-left cursor-pointer",
                      isSelected
                        ? "bg-emerald-500/12 border-emerald-500/30"
                        : "border-transparent hover:bg-emerald-500/10 hover:border-emerald-500/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-white/[0.05] text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/15"
                        )}
                      >
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected ? "text-white" : "text-zinc-200 group-hover:text-white"
                        )}
                      >
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-all",
                        isSelected
                          ? "text-emerald-400 translate-x-0.5"
                          : "text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5"
                      )}
                    />
                  </button>
                );
              })}

              {filteredActions.length === 0 && (
                <div className="px-3 py-8 text-center text-zinc-400 text-sm">
                  No commands found for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
