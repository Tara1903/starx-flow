"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  ArrowRight,
  Bot,
  MessageSquare,
  Calendar,
  Settings,
  ShieldCheck,
  Wifi,
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
    { id: "pricing", icon: DollarSign, label: "View Pricing Plans", path: "/pricing" },
    { id: "settings", icon: Settings, label: "Workspace Settings", path: "/dashboard?section=settings" },
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
            transition={{ duration: 0.16 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            style={{ WebkitBackdropFilter: "blur(8px)" }}
            onClick={closeCommandCenter}
          />
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }}
            transition={smoothTransition}
            className="relative w-full max-w-xl rounded-2xl bg-[#0c100e] overflow-hidden border border-[#edf0ee]/12 shadow-[0_24px_64px_rgba(0,0,0,0.75)]"
          >
            <div className="flex items-center px-4 border-b border-[#edf0ee]/[0.08]">
              <Search className="w-4 h-4 text-[#727c75] flex-shrink-0" strokeWidth={1.65} />
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
                placeholder="Search commands or routes"
                className="w-full bg-transparent text-[#edf0ee] px-3 py-3.5 outline-none text-sm placeholder:text-[#727c75]"
              />
              <button
                type="button"
                onClick={closeCommandCenter}
                className="text-[11px] font-mono text-[#a1aaa4] hover:text-[#edf0ee] bg-[#19201d] border border-[#edf0ee]/10 px-2 py-0.5 rounded cursor-pointer"
              >
                esc
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 console-scroll">
              {query.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleAction("/demo")}
                  className="w-full text-left px-3 py-2.5 mb-1.5 bg-[#121715] border border-[#34d399]/25 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#19201d] transition-colors"
                >
                  <Bot className="w-4 h-4 text-[#34d399] shrink-0" strokeWidth={1.65} />
                  <div>
                    <div className="text-[#edf0ee] text-sm font-medium">
                      Try interactive AI demo
                    </div>
                    <div className="text-[#a1aaa4] text-xs">
                      Test &ldquo;{query}&rdquo; in the demo sandbox
                    </div>
                  </div>
                </button>
              )}

              <div className="px-3 py-2 text-xs font-medium text-[#727c75] flex items-center justify-between">
                <span>Quick navigation</span>
                <span className="text-[11px] font-mono text-[#727c75] hidden sm:inline">↑↓ navigate · ↵ open</span>
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
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors text-left cursor-pointer",
                      isSelected
                        ? "bg-[#19201d] border-[#edf0ee]/12"
                        : "border-transparent hover:bg-[#19201d]/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                          isSelected ? "text-[#34d399]" : "text-[#727c75]"
                        )}
                      >
                        <action.icon className="w-4 h-4" strokeWidth={1.65} />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected ? "text-[#edf0ee]" : "text-[#a1aaa4]"
                        )}
                      >
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight
                      className={cn(
                        "w-3.5 h-3.5 transition-opacity",
                        isSelected ? "text-[#34d399] opacity-100" : "text-[#727c75] opacity-40"
                      )}
                    />
                  </button>
                );
              })}

              {filteredActions.length === 0 && (
                <div className="px-3 py-8 text-center text-[#727c75] text-sm">
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
