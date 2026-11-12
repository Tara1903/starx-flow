"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  Menu,
  X,
  ArrowRight,
  Search,
  Bot,
  MessageSquare,
  Calendar,
  Sparkles,
  Workflow,
  ShieldCheck,
  Layers,
  Building2,
  BookOpen,
  GitCompare,
  Compass,
  LayoutGrid,
  Instagram,
  Headphones,
  Cpu,
  Dumbbell,
  Stethoscope,
  Scissors,
  Home,
  Utensils,
  GraduationCap,
} from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { GlassButton } from "./ui/GlassButton";
import { GlassSheet } from "./ui/GlassSheet";
import { GlassDropdown, GlassDropdownItem } from "./ui/GlassDropdown";
import { cn } from "../lib/utils";
import { navPillSpring } from "../lib/motionVariants";

export function Navbar() {
  const { openSignup, openCommandCenter } = useUIStore();
  const { isLoggedIn, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const productItems: GlassDropdownItem[] = [
    {
      label: "Product Overview",
      description: "Unified AI Receptionist & Business OS",
      icon: <Cpu className="w-4 h-4" />,
      href: "/product",
    },
    {
      label: "Platform Features",
      description: "Voice, chat, workflows, CRM & bookings",
      icon: <Layers className="w-4 h-4" />,
      href: "/features",
    },
    {
      label: "How It Works",
      description: "Go live in 3 automated steps",
      icon: <Workflow className="w-4 h-4" />,
      href: "/how-it-works",
    },
    {
      label: "Verified Integrations",
      description: "WhatsApp, Instagram, Calendar & Webhooks",
      icon: <LayoutGrid className="w-4 h-4" />,
      href: "/integrations",
    },
    {
      label: "160+ Demo Collections",
      description: "Explore live industry agent previews",
      icon: <Sparkles className="w-4 h-4" />,
      href: "/collections",
      badge: "New",
    },
    {
      label: "Security & Privacy",
      description: "TLS 1.3, RLS isolation & data protection",
      icon: <ShieldCheck className="w-4 h-4" />,
      href: "/security",
    },
  ];

  const solutionsItems: GlassDropdownItem[] = [
    {
      label: "AI Automation Platform",
      description: "End-to-end operations autopilot",
      icon: <Bot className="w-4 h-4" />,
      href: "/ai-automation",
    },
    {
      label: "WhatsApp AI Chatbot",
      description: "Instant replies & booking capture 24/7",
      icon: <MessageSquare className="w-4 h-4" />,
      href: "/whatsapp-ai-chatbot",
    },
    {
      label: "Instagram AI Automation",
      description: "Convert DM & story replies into leads",
      icon: <Instagram className="w-4 h-4" />,
      href: "/instagram-ai-automation",
    },
    {
      label: "AI Customer Support",
      description: "Zero wait times across channels",
      icon: <Headphones className="w-4 h-4" />,
      href: "/ai-customer-support",
    },
    {
      label: "Autonomous AI Agents",
      description: "Custom tools, handoffs & knowledge base",
      icon: <Sparkles className="w-4 h-4" />,
      href: "/ai-agents",
    },
    {
      label: "Business Workflow Automation",
      description: "Triggers, follow-ups & CRM pipelines",
      icon: <Calendar className="w-4 h-4" />,
      href: "/business-workflow-automation",
    },
  ];

  const industriesItems: GlassDropdownItem[] = [
    {
      label: "Gyms & Fitness",
      description: "Trial bookings & membership follow-up",
      icon: <Dumbbell className="w-4 h-4" />,
      href: "/industries/gyms-fitness",
    },
    {
      label: "Dental & Clinics",
      description: "Patient intake & appointment reminders",
      icon: <Stethoscope className="w-4 h-4" />,
      href: "/industries/dental-clinics",
    },
    {
      label: "Beauty Salons & Spas",
      description: "Automated chair bookings & upsells",
      icon: <Scissors className="w-4 h-4" />,
      href: "/industries/beauty-salons",
    },
    {
      label: "Real Estate",
      description: "Lead qualification & viewing schedules",
      icon: <Home className="w-4 h-4" />,
      href: "/industries/real-estate",
    },
    {
      label: "Restaurants & Hospitality",
      description: "Reservations & guest inquiries",
      icon: <Utensils className="w-4 h-4" />,
      href: "/industries/restaurants",
    },
    {
      label: "Education & Tutors",
      description: "Course admissions & student support",
      icon: <GraduationCap className="w-4 h-4" />,
      href: "/industries/education",
    },
  ];

  const resourcesItems: GlassDropdownItem[] = [
    {
      label: "Resources & Guides",
      description: "Playbooks, decks & editorial articles",
      icon: <BookOpen className="w-4 h-4" />,
      href: "/resources",
    },
    {
      label: "Interactive Demo",
      description: "Test StarX Flow live on the web",
      icon: <Compass className="w-4 h-4" />,
      href: "/demo",
    },
    {
      label: "Platform Comparisons",
      description: "Compare vs ManyChat, Wati, Zapier & more",
      icon: <GitCompare className="w-4 h-4" />,
      href: "/compare/manychat",
    },
    {
      label: "About StarX Flow",
      description: "Our mission & engineering philosophy",
      icon: <Building2 className="w-4 h-4" />,
      href: "/about",
    },
  ];

  const handleNavigate = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  const isProductActive = [
    "/product",
    "/features",
    "/how-it-works",
    "/integrations",
    "/collections",
    "/security",
  ].some((p) => pathname.startsWith(p));

  const isSolutionsActive = [
    "/ai-automation",
    "/whatsapp-ai-chatbot",
    "/instagram-ai-automation",
    "/ai-customer-support",
    "/ai-agents",
    "/business-workflow-automation",
    "/scenarios",
    "/use-cases",
  ].some((p) => pathname.startsWith(p));

  const isIndustriesActive = pathname.startsWith("/industries");
  const isResourcesActive =
    pathname.startsWith("/resources") ||
    pathname.startsWith("/compare") ||
    pathname === "/about" ||
    pathname === "/demo";
  const isPricingActive = pathname === "/pricing";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 pointer-events-none">
        <nav
          aria-label="Primary navigation"
          className={cn(
            "pointer-events-auto max-w-7xl mx-auto px-4 lg:px-5 h-14 md:h-16 rounded-full flex items-center justify-between transition-all duration-300",
            scrolled ? "glass-navbar-scrolled" : "glass-navbar-floating"
          )}
        >
          {/* Crisp Brand Mark + Native Typography Lockup */}
          <Link
            href="/"
            aria-label="StarX Flow home"
            className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded-full px-1 py-0.5"
          >
            <img
              src="/logo.svg"
              alt=""
              aria-hidden="true"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.04]"
            />
            <span className="font-sans font-extrabold tracking-tight text-sm sm:text-base text-white whitespace-nowrap leading-none">
              StarX <span className="text-emerald-400">Flow</span>
            </span>
          </Link>

          {/* Center Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <GlassDropdown
              triggerLabel="Product"
              items={productItems}
              isActive={isProductActive}
              activeLayoutId="navbar-active-pill"
              onNavigate={handleNavigate}
            />
            <GlassDropdown
              triggerLabel="Solutions"
              items={solutionsItems}
              isActive={isSolutionsActive}
              activeLayoutId="navbar-active-pill"
              onNavigate={handleNavigate}
            />
            <GlassDropdown
              triggerLabel="Industries"
              items={industriesItems}
              isActive={isIndustriesActive}
              activeLayoutId="navbar-active-pill"
              onNavigate={handleNavigate}
            />
            <GlassDropdown
              triggerLabel="Resources"
              items={resourcesItems}
              isActive={isResourcesActive}
              activeLayoutId="navbar-active-pill"
              onNavigate={handleNavigate}
            />
            <Link
              href="/pricing"
              className={cn(
                "relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors",
                isPricingActive
                  ? "text-emerald-300"
                  : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {isPricingActive && (
                <motion.span
                  layoutId={prefersReduced ? undefined : "navbar-active-pill"}
                  transition={navPillSpring}
                  className="absolute inset-0 rounded-full bg-emerald-500/12 border border-emerald-500/30 -z-10"
                />
              )}
              Pricing
            </Link>
          </div>

          {/* Right Auth & CTA */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={openCommandCenter}
              aria-label="Open command center search (Ctrl+K)"
              className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-white bg-white/[0.03] border border-white/10 hover:border-emerald-400/35 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick jump</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/[0.06] border border-white/10 text-zinc-300">
                ⌘K
              </kbd>
            </button>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="px-3.5 py-2 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openSignup}
                  data-cursor-invert="secondary"
                  className="px-4 py-2 rounded-full text-sm font-medium text-zinc-200 bg-white/[0.03] border border-white/10 hover:border-emerald-300 hover:text-[#02120c] hover:bg-emerald-400 focus-visible:bg-emerald-400 focus-visible:text-[#02120c] transition-all cursor-pointer"
                >
                  Log in
                </button>
                <GlassButton
                  size="sm"
                  variant="primary"
                  magneticStrength="low"
                  onClick={openSignup}
                  className="px-4 py-2 text-sm"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </GlassButton>
              </>
            )}
          </div>

          {/* Mobile Right Quick Action + Menu */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/18 text-emerald-300 border border-emerald-500/35"
              >
                Dashboard
              </Link>
            ) : (
              <GlassButton
                size="sm"
                variant="primary"
                onClick={openSignup}
                className="px-3 py-1.5 text-xs min-h-[30px]"
              >
                Start Free
              </GlassButton>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="p-2 rounded-full text-zinc-300 hover:text-white bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Full Directory Drawer */}
      <GlassSheet
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        side="right"
        title="Navigation"
      >
        <div className="flex flex-col gap-5 pb-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-2.5">
              Platform
            </p>
            <div className="flex flex-col gap-1">
              {[
                { label: "Product Overview", href: "/product" },
                { label: "Features Directory", href: "/features" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Integrations", href: "/integrations" },
                { label: "160+ Business Demos", href: "/collections" },
                { label: "Pricing Plans", href: "/pricing" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-2.5">
              Solutions & Resources
            </p>
            <div className="flex flex-col gap-1">
              {[
                { label: "WhatsApp AI Chatbot", href: "/whatsapp-ai-chatbot" },
                { label: "Instagram AI Automation", href: "/instagram-ai-automation" },
                { label: "AI Receptionist & Agents", href: "/ai-agents" },
                { label: "Interactive Demo", href: "/demo" },
                { label: "Resources & Guides", href: "/resources" },
                { label: "Security & Privacy", href: "/security" },
                { label: "About StarX Flow", href: "/about" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <GlassButton
                variant="primary"
                onClick={() => handleNavigate("/dashboard")}
                className="w-full"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
              <GlassButton
                variant="ghost"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                  router.push("/");
                }}
                className="w-full"
              >
                Logout
              </GlassButton>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <GlassButton
                variant="primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSignup();
                }}
                className="w-full"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSignup();
                }}
                className="w-full"
              >
                Log in to Account
              </GlassButton>
            </div>
          )}
        </div>
      </GlassSheet>
    </>
  );
}
