"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
  CreditCard,
  Shield,
  Settings,
  Activity,
  CheckCircle2,
  ChevronRight,
  Database,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type AdminSection = "overview" | "clients" | "leads" | "analytics" | "plans" | "settings";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  totalClientsCount: number;
  newLeadsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: number | string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  activeSection,
  onSelectSection,
  totalClientsCount,
  newLeadsCount,
  isOpenMobile = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const prefersReduced = useReducedMotion();

  const groups: NavGroup[] = [
    {
      title: "MAIN",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          id: "clients",
          label: "Clients",
          icon: Users,
          badge: totalClientsCount > 0 ? totalClientsCount : undefined,
        },
        {
          id: "leads",
          label: "Demo Inquiries",
          icon: Sparkles,
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
          badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
        },
      ],
    },
    {
      title: "INTELLIGENCE",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
        },
        {
          id: "plans",
          label: "Plans & Tiers",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          id: "settings",
          label: "Settings & Audit",
          icon: Shield,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-transparent border border-emerald-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight font-sans">
                  StarX Flow
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
                  V7
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">Platform Admin</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-6">
          {groups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest px-3 mb-2">
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
                        "relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer text-left",
                        isActive
                          ? "text-white font-semibold"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      {/* Active Sliding Highlight Pill (layoutId) */}
                      {isActive && (
                        <motion.div
                          layoutId="adminSidebarActivePill"
                          transition={
                            prefersReduced
                              ? undefined
                              : { type: "spring", stiffness: 420, damping: 32, mass: 0.7 }
                          }
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/22 via-emerald-500/14 to-emerald-400/5 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.28)] pointer-events-none"
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-emerald-400/80"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>

                      {/* Notification Count Badge */}
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "relative z-10 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-transform",
                            item.badgeColor ||
                              (isActive
                                ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                                : "bg-white/[0.08] text-zinc-400 border border-white/10")
                          )}
                        >
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

      {/* Footer System Status Card */}
      <div className="pt-4 border-t border-white/[0.08]">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live DB Node
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              100% SLA
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-300">
            <Database size={11} className="text-zinc-300" />
            <span className="truncate">Supabase EU-Central</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Glass Sidebar (Matching Admin Dashboard V7) */}
      <aside
        aria-label="Admin Navigation"
        className="hidden lg:flex flex-col w-[260px] h-[calc(100vh-24px)] fixed left-3 top-3 z-40 rounded-[28px] bg-[#07130d]/88 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.14)] overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Slide-over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-[280px] h-full max-w-[85vw] bg-[#07130d]/95 backdrop-blur-2xl border-r border-emerald-500/25 shadow-2xl"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
}
