"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  Home,
  LayoutGrid,
  Layers,
  MoreHorizontal,
  ArrowRight,
  Sparkles,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Building2,
  Compass,
  GitCompare,
} from "lucide-react";
import { GlassSheet } from "./ui/GlassSheet";
import { GlassButton } from "./ui/GlassButton";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { cn } from "../lib/utils";
import { navPillSpring } from "../lib/motionVariants";

export function MobileFloatingNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const { openSignup } = useUIStore();
  const { isLoggedIn } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const isProduct = [
    "/product",
    "/features",
    "/how-it-works",
    "/integrations",
    "/collections",
  ].some((p) => pathname.startsWith(p));

  const isSolutions = [
    "/ai-automation",
    "/whatsapp-ai-chatbot",
    "/instagram-ai-automation",
    "/ai-customer-support",
    "/ai-agents",
    "/business-workflow-automation",
    "/industries",
  ].some((p) => pathname.startsWith(p));

  const activeTab =
    pathname === "/"
      ? "home"
      : isProduct
      ? "product"
      : isSolutions
      ? "solutions"
      : "more";

  const tabs = [
    { id: "home", label: "Home", href: "/", icon: Home },
    { id: "product", label: "Product", href: "/product", icon: LayoutGrid },
    { id: "solutions", label: "Solutions", href: "/ai-automation", icon: Layers },
  ] as const;

  const moreLinks = [
    { label: "160+ Business Demos", href: "/collections", icon: Sparkles },
    { label: "Pricing & Plans", href: "/pricing", icon: DollarSign },
    { label: "Interactive Live Demo", href: "/demo", icon: Compass },
    { label: "Platform Comparisons", href: "/compare/manychat", icon: GitCompare },
    { label: "Resources & Guides", href: "/resources", icon: BookOpen },
    { label: "Security & Privacy", href: "/security", icon: ShieldCheck },
    { label: "About StarX Flow", href: "/about", icon: Building2 },
  ];

  return (
    <>
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-3 inset-x-0 z-40 px-4 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom)]"
      >
        <div className="pointer-events-auto glass-capsule-nav rounded-full p-1.5 flex items-center justify-between gap-1 w-full max-w-[360px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-full transition-colors active:scale-95",
                  isActive ? "text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={prefersReduced ? undefined : "mobile-public-nav-pill"}
                    transition={navPillSpring}
                    className="absolute inset-0 rounded-full bg-emerald-500/18 border border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.25)] -z-10"
                  />
                )}
                <motion.span
                  animate={prefersReduced ? undefined : { scale: isActive ? 1.08 : 1, y: isActive ? -0.5 : 0 }}
                  transition={navPillSpring}
                >
                  <Icon className="w-4 h-4" />
                </motion.span>
                <span className="text-[10px] font-semibold mt-0.5 leading-none">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More pages"
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-full transition-colors cursor-pointer",
              activeTab === "more"
                ? "text-emerald-300"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {activeTab === "more" && (
              <motion.span
                layoutId={prefersReduced ? undefined : "mobile-public-nav-pill"}
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/18 border border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.25)] -z-10"
              />
            )}
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">
              More
            </span>
          </button>
        </div>
      </nav>

      <GlassSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        side="bottom"
        title="Explore StarX Flow"
      >
        <div className="space-y-3 pb-4">
          <div className="grid grid-cols-1 gap-1.5">
            {moreLinks.map((item) => {
              const Icon = item.icon;
              const isCurrent = pathname === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    router.push(item.href);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer",
                    isCurrent
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.05] border border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10">
            {isLoggedIn ? (
              <GlassButton
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMoreOpen(false);
                  router.push("/dashboard");
                }}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            ) : (
              <GlassButton
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMoreOpen(false);
                  openSignup();
                }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            )}
          </div>
        </div>
      </GlassSheet>
    </>
  );
}
