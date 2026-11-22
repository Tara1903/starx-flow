"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Home,
  LayoutGrid,
  Layers,
  DollarSign,
  Menu,
  ArrowRight,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Building2,
  Compass,
  GitCompare,
  MessageSquare,
  Users,
  Calendar,
  ShoppingBag,
  Bot,
  Phone,
  Brain,
  Cpu,
  CheckSquare,
  Contact,
  BarChart3,
  Radio,
  Settings,
  Search,
  Pause,
  Play,
  LogOut,
  Activity,
  CreditCard,
  Shield,
  Workflow,
  Instagram,
  Headphones,
  Dumbbell,
  Stethoscope,
  Scissors,
  Utensils,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { GlassSheet } from "./ui/GlassSheet";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore, type DashboardSection } from "../store/dashboardStore";
import { useAdminStore, type AdminSection } from "../store/adminStore";
import { cn } from "../lib/utils";
import { navPillSpring, MOTION_EASE } from "../lib/motionVariants";

/* ─────────────────────────────────────────────────────────────
   ULTIMATE MOBILE FLOATING NAVIGATION & MENU
   - Strictly `md:hidden` (100% invisible on PC / Laptop viewports)
   - Dual-element architecture:
     1. Left Pill Capsule (4 primary fast-switch tabs with active expansion)
     2. Right Circular 3-Line Menu Button with dynamic badge
   - Master Drawer (`GlassSheet`) containing:
     * Public Mode: Every single website option, product, industry, comparison, and CTA
     * Dashboard Mode: All 16 dashboard areas, Live AI Receptionist equalizer & controls,
       Auto-Pilot switch, Live DB Node 100% SLA, and User profile with Sign Out
     * Admin Mode: All 6 admin modules, system health, and admin logout
   ───────────────────────────────────────────────────────────── */

export function MobileFloatingNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  // Stores
  const { openSignup, openLogin, openCommandCenter } = useUIStore();
  const { isLoggedIn, user, logout, workflows, connectedChannels } = useAuthStore();
  const { activeSection: activeDashSection, setActiveSection: setActiveDashSection, conversations } = useDashboardStore();
  const { activeSection: activeAdminSection, setActiveSection: setActiveAdminSection, clients, demoLeads, logoutAdmin } = useAdminStore();

  // Master Drawer State
  const [isMasterMenuOpen, setIsMasterMenuOpen] = useState(false);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);

  // Close master menu on route change
  useEffect(() => {
    setIsMasterMenuOpen(false);
  }, [pathname]);

  // Route Detection
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAdmin = pathname?.startsWith("/admin") && pathname !== "/admin/login";
  const isPublic = !isDashboard && !isAdmin;

  // Real-time telemetry metrics
  const activeWorkflowsCount = workflows?.filter((w) => w.isActive).length ?? 0;
  const unreadConversationsCount = conversations?.filter((c) => c.unread).length ?? 0;
  const connectedChannelsCount = connectedChannels?.filter((c) => c.isConnected).length ?? 0;
  const totalClientsCount = clients?.length ?? 0;
  const newLeadsCount = demoLeads?.filter((l) => l.status === "new").length ?? 0;

  // Dynamic calendar date
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dayNum = today.getDate();

  // Badge count on the circular 3-line menu button
  const badgeCount = isDashboard
    ? unreadConversationsCount > 0
      ? unreadConversationsCount
      : activeWorkflowsCount > 0
      ? activeWorkflowsCount
      : 4
    : isAdmin
    ? newLeadsCount > 0
      ? newLeadsCount
      : 1
    : 4;

  /* ─────────────────────────────────────────────────────────────
     1. CAPSULE CORE TABS CONFIGURATION
     ───────────────────────────────────────────────────────────── */
  // A. Public Website Tabs
  const publicCapsuleTabs = [
    { id: "home", label: "Home", href: "/", icon: Home },
    { id: "product", label: "Product", href: "/product", icon: LayoutGrid },
    { id: "solutions", label: "Solutions", href: "/ai-automation", icon: Layers },
    { id: "pricing", label: "Pricing", href: "/pricing", icon: DollarSign },
  ];

  const activePublicTab =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/product") || pathname.startsWith("/features") || pathname.startsWith("/how-it-works") || pathname.startsWith("/integrations")
      ? "product"
      : pathname.startsWith("/ai-") || pathname.startsWith("/whatsapp") || pathname.startsWith("/instagram") || pathname.startsWith("/industries")
      ? "solutions"
      : pathname.startsWith("/pricing")
      ? "pricing"
      : null;

  // B. Dashboard Tabs
  const dashboardCapsuleTabs = [
    { id: "overview" as DashboardSection, label: "Home", icon: Home },
    { id: "crm" as DashboardSection, label: "Leads", icon: Users },
    { id: "conversations" as DashboardSection, label: "Inbox", icon: MessageSquare, badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined },
    { id: "workflows" as DashboardSection, label: "Flows", icon: Layers, hasActiveDot: activeWorkflowsCount > 0 },
  ];

  const isCoreDashboardActive = dashboardCapsuleTabs.some((t) => t.id === activeDashSection);
  const isSecondaryActive = isDashboard ? !isCoreDashboardActive : false;

  // C. Admin Tabs
  const adminCapsuleTabs = [
    { id: "overview" as AdminSection, label: "Overview", icon: Activity },
    { id: "clients" as AdminSection, label: "Clients", icon: Users, badge: totalClientsCount > 0 ? totalClientsCount : undefined },
    { id: "leads" as AdminSection, label: "Inquiries", icon: Sparkles, badge: newLeadsCount > 0 ? newLeadsCount : undefined },
    { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
  ];

  /* ─────────────────────────────────────────────────────────────
     2. DASHBOARD ALL 16 MODULES
     ───────────────────────────────────────────────────────────── */
  const dashboardMenuItems = [
    // Core (6)
    { id: "overview" as DashboardSection, label: "Overview", icon: Home, group: "Core", color: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35" },
    { id: "conversations" as DashboardSection, label: "Inbox", icon: MessageSquare, badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined, group: "Core", color: "from-blue-500/25 to-indigo-600/15 text-blue-300 border-blue-400/35" },
    { id: "workflows" as DashboardSection, label: "Workflows", icon: Layers, badge: activeWorkflowsCount > 0 ? activeWorkflowsCount : undefined, group: "Core", color: "from-purple-500/25 to-violet-600/15 text-purple-300 border-purple-400/35" },
    { id: "crm" as DashboardSection, label: "Customers", icon: Users, group: "Core", color: "from-emerald-500/25 to-green-600/15 text-emerald-300 border-emerald-400/35" },
    {
      id: "calendar" as DashboardSection,
      label: "Calendar",
      icon: Calendar,
      badge: "10:30",
      group: "Core",
      color: "from-amber-500/25 to-orange-600/15 text-amber-300 border-amber-400/35",
      customIcon: (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-[6px] font-bold text-amber-300 tracking-tighter">{dayName}</span>
          <span className="text-[9px] font-extrabold text-white leading-none">{dayNum}</span>
        </div>
      ),
    },
    { id: "orders" as DashboardSection, label: "Orders", icon: ShoppingBag, group: "Core", color: "from-rose-500/25 to-pink-600/15 text-rose-300 border-rose-400/35" },

    // AI Suite (4)
    { id: "agents" as DashboardSection, label: "AI Receptionist", icon: Bot, badge: "Live", group: "AI Suite", color: "from-emerald-500/25 to-teal-600/15 text-emerald-300 border-emerald-400/35" },
    { id: "voice" as DashboardSection, label: "Voice AI", icon: Phone, group: "AI Suite", color: "from-cyan-500/25 to-blue-600/15 text-cyan-300 border-cyan-400/35" },
    { id: "playground" as DashboardSection, label: "AI Playground", icon: Brain, group: "AI Suite", color: "from-purple-500/25 to-fuchsia-600/15 text-purple-300 border-purple-400/35" },
    { id: "os" as DashboardSection, label: "Business OS", icon: Cpu, group: "AI Suite", color: "from-indigo-500/25 to-violet-600/15 text-indigo-300 border-indigo-400/35" },

    // Operations & Config (6)
    { id: "knowledge" as DashboardSection, label: "Knowledge", icon: BookOpen, group: "Operations", color: "from-sky-500/25 to-cyan-600/15 text-sky-300 border-sky-400/35" },
    { id: "tasks" as DashboardSection, label: "Tasks", icon: CheckSquare, group: "Operations", color: "from-amber-500/25 to-yellow-600/15 text-amber-300 border-amber-400/35" },
    { id: "team" as DashboardSection, label: "Team", icon: Contact, group: "Operations", color: "from-teal-500/25 to-emerald-600/15 text-teal-300 border-teal-400/35" },
    { id: "analytics" as DashboardSection, label: "Analytics", icon: BarChart3, group: "Operations", color: "from-cyan-500/25 to-teal-600/15 text-cyan-300 border-cyan-400/35" },
    { id: "channels" as DashboardSection, label: "Channels", icon: Radio, badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined, group: "Operations", color: "from-blue-500/25 to-sky-600/15 text-blue-300 border-blue-400/35" },
    { id: "settings" as DashboardSection, label: "Settings", icon: Settings, group: "Operations", color: "from-zinc-500/25 to-zinc-600/15 text-zinc-300 border-zinc-400/35" },
  ];

  /* ─────────────────────────────────────────────────────────────
     3. PUBLIC WEBSITE ALL SECTIONS
     ───────────────────────────────────────────────────────────── */
  const websiteSections = [
    {
      category: "Product & Capabilities",
      items: [
        { label: "Product Overview", href: "/product", icon: Cpu, desc: "Unified AI Receptionist & Business OS" },
        { label: "Platform Features", href: "/features", icon: Layers, desc: "Voice, chat, workflows, CRM & bookings" },
        { label: "How It Works", href: "/how-it-works", icon: Workflow, desc: "Go live in 3 automated steps" },
        { label: "Verified Integrations", href: "/integrations", icon: LayoutGrid, desc: "WhatsApp, Instagram, Calendar & Webhooks" },
        { label: "Security & Privacy", href: "/security", icon: ShieldCheck, desc: "TLS 1.3, RLS isolation & GDPR protection" },
      ],
    },
    {
      category: "AI Automation Solutions",
      items: [
        { label: "AI Automation Platform", href: "/ai-automation", icon: Bot, desc: "End-to-end operations autopilot" },
        { label: "WhatsApp AI Chatbot", href: "/whatsapp-ai-chatbot", icon: MessageSquare, desc: "Instant replies & booking capture 24/7" },
        { label: "Instagram AI Automation", href: "/instagram-ai-automation", icon: Instagram, desc: "Convert DM & story replies into leads" },
        { label: "AI Customer Support", href: "/ai-customer-support", icon: Headphones, desc: "Zero wait times across communication channels" },
        { label: "Autonomous AI Agents", href: "/ai-agents", icon: Sparkles, desc: "Custom tools, handoffs & knowledge base" },
        { label: "Business Workflow Automation", href: "/business-workflow-automation", icon: Calendar, desc: "Triggers, follow-ups & CRM pipelines" },
      ],
    },
    {
      category: "Solutions by Industry",
      items: [
        { label: "Gyms & Fitness", href: "/industries/gyms-fitness", icon: Dumbbell, desc: "Trial bookings & membership follow-up" },
        { label: "Dental & Clinics", href: "/industries/dental-clinics", icon: Stethoscope, desc: "Patient intake & appointment reminders" },
        { label: "Beauty Salons & Spas", href: "/industries/beauty-salons", icon: Scissors, desc: "Automated chair bookings & upsells" },
        { label: "Real Estate", href: "/industries/real-estate", icon: Home, desc: "Lead qualification & viewing schedules" },
        { label: "Restaurants & Hospitality", href: "/industries/restaurants", icon: Utensils, desc: "Reservations & guest inquiries" },
        { label: "Education & Tutors", href: "/industries/education", icon: GraduationCap, desc: "Course admissions & student support" },
      ],
    },
    {
      category: "Resources & Comparisons",
      items: [
        { label: "Pricing & Plans", href: "/pricing", icon: DollarSign, desc: "Transparent plans with 14-day free trial" },
        { label: "Interactive Live Demo", href: "/demo", icon: Compass, desc: "Test StarX Flow live in your browser" },
        { label: "Resources & Playbooks", href: "/resources", icon: BookOpen, desc: "Guides, decks & editorial playbooks" },
        { label: "Compare vs ManyChat", href: "/compare/manychat", icon: GitCompare, desc: "Why businesses switch to StarX Flow" },
        { label: "Compare vs Voiceflow", href: "/compare/voiceflow", icon: GitCompare, desc: "Full-stack receptionist vs visual canvas" },
        { label: "Compare vs Intercom", href: "/compare/intercom", icon: GitCompare, desc: "Local business pricing without seat taxes" },
        { label: "About StarX Flow", href: "/about", icon: Building2, desc: "Our mission & engineering philosophy" },
        { label: "System Status", href: "/status", icon: Activity, desc: "Live uptime & platform telemetry" },
        { label: "Contact & Enterprise", href: "/contact", icon: Phone, desc: "Speak with our implementation team" },
      ],
    },
  ];

  /* ─────────────────────────────────────────────────────────────
     4. ADMIN ALL SECTIONS
     ───────────────────────────────────────────────────────────── */
  const adminMenuItems = [
    { id: "overview" as AdminSection, label: "Overview", icon: Activity, desc: "Platform telemetry and operational health" },
    { id: "clients" as AdminSection, label: "Clients", icon: Users, badge: totalClientsCount > 0 ? totalClientsCount : undefined, desc: "Manage registered enterprise clients" },
    { id: "leads" as AdminSection, label: "Demo Inquiries", icon: Sparkles, badge: newLeadsCount > 0 ? newLeadsCount : undefined, desc: "Inbound prospective client inquiries" },
    { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3, desc: "Usage metrics and system conversion" },
    { id: "plans" as AdminSection, label: "Plans & Tiers", icon: CreditCard, desc: "Subscription tiers and pricing limits" },
    { id: "settings" as AdminSection, label: "Settings & Audit", icon: Shield, desc: "Platform security and system logs" },
  ];

  const handleDashboardItemClick = (id: DashboardSection) => {
    setActiveDashSection(id);
    setIsMasterMenuOpen(false);
  };

  const handleAdminItemClick = (id: AdminSection) => {
    setActiveAdminSection(id);
    setIsMasterMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMasterMenuOpen(false);
    if (isAdmin) {
      logoutAdmin();
      router.push("/admin/login");
    } else {
      await logout();
      router.push("/");
    }
  };

  const handleCapsulePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--glass-light-x", `${x.toFixed(1)}%`);
    e.currentTarget.style.setProperty("--glass-light-y", `${y.toFixed(1)}%`);
  };

  const handleCapsulePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--glass-light-x", "50%");
    e.currentTarget.style.setProperty("--glass-light-y", "30%");
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          ULTIMATE BOTTOM NAVIGATION DOCK (STRICTLY md:hidden)
          Hidden on PC & Laptop viewports (>= 768px)
          ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile ultimate navigation"
        data-mobile-nav="bottom"
        className="mobile-bottom-nav fixed bottom-3 inset-x-0 z-40 px-3 flex justify-center items-center pointer-events-none pb-[env(safe-area-inset-bottom)] md:hidden select-none"
      >
        <div className="flex items-center gap-2 max-w-[420px] w-full justify-center">
          {/* ── 1. Capsule Dock ── */}
          <div
            onPointerMove={handleCapsulePointerMove}
            onPointerLeave={handleCapsulePointerLeave}
            className="pointer-events-auto flex-1 min-w-0 glass-capsule-nav rounded-full p-1.5 flex items-center justify-around relative"
          >
            {/* Dashboard Mode Capsule */}
            {isDashboard &&
              dashboardCapsuleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDashSection === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={tab.label}
                    onClick={() => setActiveDashSection(tab.id)}
                    whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                    className={cn(
                      "relative flex items-center justify-center rounded-full transition-colors cursor-pointer py-1.5",
                      isActive
                        ? "px-3 text-white font-semibold"
                        : "px-2 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="ultimateMobileActivePill"
                        transition={prefersReduced ? { duration: 0 } : navPillSpring}
                        className="glass-lens-mobile-active-pill"
                      />
                    )}

                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-300" : "text-zinc-400")} />
                      {!isActive && tab.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white border border-[#09120f] text-[7px] font-extrabold rounded-full flex items-center justify-center leading-none">
                          {tab.badge}
                        </span>
                      )}
                      {!isActive && tab.hasActiveDot && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: -4 }}
                          animate={{ opacity: 1, width: "auto", x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -4 }}
                          transition={prefersReduced ? { duration: 0 } : { duration: 0.18, ease: MOTION_EASE.premium }}
                          className="text-xs font-bold text-white tracking-tight overflow-hidden whitespace-nowrap ml-1.5"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}

            {/* Admin Mode Capsule */}
            {isAdmin &&
              adminCapsuleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeAdminSection === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={tab.label}
                    onClick={() => setActiveAdminSection(tab.id)}
                    whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                    className={cn(
                      "relative flex items-center justify-center rounded-full transition-colors cursor-pointer py-1.5",
                      isActive
                        ? "px-3 text-white font-semibold"
                        : "px-2 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="ultimateMobileActivePill"
                        transition={prefersReduced ? { duration: 0 } : navPillSpring}
                        className="glass-lens-mobile-active-pill"
                      />
                    )}

                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-300" : "text-zinc-400")} />
                      {!isActive && tab.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white border border-[#09120f] text-[7px] font-extrabold rounded-full flex items-center justify-center leading-none">
                          {tab.badge}
                        </span>
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: -4 }}
                          animate={{ opacity: 1, width: "auto", x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -4 }}
                          transition={prefersReduced ? { duration: 0 } : { duration: 0.18, ease: MOTION_EASE.premium }}
                          className="text-xs font-bold text-white tracking-tight overflow-hidden whitespace-nowrap ml-1.5"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}

            {/* Public Website Mode Capsule */}
            {isPublic &&
              publicCapsuleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activePublicTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={cn(
                      "relative flex items-center justify-center rounded-full transition-colors cursor-pointer py-1.5",
                      isActive
                        ? "px-3 text-white font-semibold"
                        : "px-2 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="ultimateMobileActivePill"
                        transition={prefersReduced ? { duration: 0 } : navPillSpring}
                        className="glass-lens-mobile-active-pill"
                      />
                    )}

                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-300" : "text-zinc-400")} />
                    </div>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: -4 }}
                          animate={{ opacity: 1, width: "auto", x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -4 }}
                          transition={prefersReduced ? { duration: 0 } : { duration: 0.18, ease: MOTION_EASE.premium }}
                          className="text-xs font-bold text-white tracking-tight overflow-hidden whitespace-nowrap ml-1.5"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
          </div>

          {/* ── 2. Companion Circular 3-Line Hamburger Menu Button with Red Badge ── */}
          <motion.button
            type="button"
            onClick={() => setIsMasterMenuOpen(true)}
            whileHover={prefersReduced ? undefined : { scale: 1.08 }}
            whileTap={prefersReduced ? undefined : { scale: 0.92 }}
            aria-label="Open ultimate navigation and menu"
            className={cn(
              "pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full glass-lens-circular-button flex items-center justify-center relative cursor-pointer flex-shrink-0 transition-all select-none",
              isMasterMenuOpen || isSecondaryActive
                ? "border-emerald-400/60 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                : "text-zinc-300 hover:text-white"
            )}
          >
            <Menu className="w-4 h-4" />
            {badgeCount !== undefined && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white border-2 border-[#030907] text-[8px] font-extrabold rounded-full flex items-center justify-center shadow-md leading-none">
                {badgeCount}
              </span>
            )}
          </motion.button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          MASTER MENU DRAWER (SLIDE-UP FULL SPECTRUM PANEL)
          Contains everything related to the current context
          ───────────────────────────────────────────────────────────── */}
      <GlassSheet
        open={isMasterMenuOpen}
        onClose={() => setIsMasterMenuOpen(false)}
        side="bottom"
        className="h-[88vh] max-h-[88dvh] rounded-t-3xl border-t border-white/10 bg-[#030907]/95 backdrop-blur-3xl shadow-[0_-16px_48px_rgba(0,0,0,0.8)]"
        title={
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <img src="/logo.svg" alt="StarX Flow" className="w-3.5 h-3.5 object-contain" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              {isDashboard ? "Dashboard Command Hub" : isAdmin ? "Admin Operations Hub" : "StarX Flow Menu"}
            </span>
            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 rounded-full leading-none">
              {isDashboard ? "PRO" : isAdmin ? "V7" : "V7"}
            </span>
          </div>
        }
      >
        <div className="flex flex-col h-full overflow-y-auto px-4 py-3 space-y-4 overscroll-contain pb-12">
          {/* Quick Search & Command Center Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsMasterMenuOpen(false);
              openCommandCenter();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white hover:border-emerald-400/40 transition-all text-xs cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search commands, pages & workflows...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-zinc-400">
              ⌘K
            </kbd>
          </button>

          {/* ═══════════════════════════════════════════════════════════
              A. DASHBOARD MODE CONTENT
              ═══════════════════════════════════════════════════════════ */}
          {isDashboard && (
            <div className="space-y-4">
              {/* 1. Live AI Receptionist & Audio Equalizer Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-[#07130e]/60 border border-emerald-500/25 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">AI Receptionist</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-400">Active on 3 channels</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Equalizer Oscillators */}
                    <div className="flex items-end gap-0.5 h-3.5 px-2 py-0.5 bg-black/40 rounded-full border border-white/10">
                      <span className={cn("w-0.5 bg-emerald-400 rounded-full transition-all duration-300", isPlayingAudio ? "h-3 animate-pulse" : "h-1 opacity-40")} />
                      <span className={cn("w-0.5 bg-emerald-400 rounded-full transition-all duration-300 delay-75", isPlayingAudio ? "h-2 animate-pulse" : "h-1 opacity-40")} />
                      <span className={cn("w-0.5 bg-emerald-400 rounded-full transition-all duration-300 delay-150", isPlayingAudio ? "h-3.5 animate-pulse" : "h-1 opacity-40")} />
                      <span className={cn("w-0.5 bg-emerald-400 rounded-full transition-all duration-300 delay-100", isPlayingAudio ? "h-1.5 animate-pulse" : "h-1 opacity-40")} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      aria-label={isPlayingAudio ? "Pause live audio" : "Play live audio"}
                      className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
                    >
                      {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400 ml-0.5" />}
                    </button>
                  </div>
                </div>

                {/* AI Auto-Pilot Switch */}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200">AI Auto-Pilot</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
                    role="switch"
                    aria-checked={isAutoPilotActive}
                    className={cn(
                      "w-10 h-5 rounded-full p-0.5 transition-colors relative cursor-pointer",
                      isAutoPilotActive ? "bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-zinc-800"
                    )}
                  >
                    <motion.div
                      animate={{ x: isAutoPilotActive ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
              </div>

              {/* 2. All 16 Dashboard Sections by Group */}
              {["Core", "AI Suite", "Operations"].map((groupName) => {
                const groupItems = dashboardMenuItems.filter((i) => i.group === groupName);
                return (
                  <div key={groupName} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 px-1">
                      {groupName === "Core" ? "Core Operations (6)" : groupName === "AI Suite" ? "AI Automation Suite (4)" : "Operations & Config (6)"}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {groupItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeDashSection === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleDashboardItemClick(item.id)}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer relative",
                              isActive
                                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.22)]"
                                : "bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                            )}
                          >
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border shadow-sm",
                                isActive
                                  ? cn("bg-gradient-to-br shadow-[0_0_10px_rgba(16,185,129,0.3)]", item.color)
                                  : "bg-white/[0.04] border-white/10 text-zinc-300"
                              )}
                            >
                              {item.customIcon || <Icon className="w-3.5 h-3.5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold block truncate leading-tight">
                                {item.label}
                              </span>
                            </div>

                            {item.badge !== undefined && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.2 text-[8px] font-bold rounded-full leading-tight flex-shrink-0",
                                  typeof item.badge === "number"
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
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
                );
              })}

              {/* 3. Live Database Status */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="font-medium text-zinc-300">Live DB Node (Supabase EU-Central)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-extrabold text-emerald-300">
                  100% SLA
                </span>
              </div>

              {/* 4. User Profile & Sign Out */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-black flex-shrink-0 shadow-sm">
                    {user?.name?.slice(0, 2).toUpperCase() || "US"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">
                      {user?.name || "User Account"}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {user?.businessName || "My Business"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              B. ADMIN MODE CONTENT
              ═══════════════════════════════════════════════════════════ */}
          {isAdmin && (
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 px-1">
                Admin Control Modules (6)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAdminSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAdminItemClick(item.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
                        isActive
                          ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.22)]"
                          : "bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block text-white truncate">{item.label}</span>
                          <span className="text-[10px] text-zinc-400 block truncate">{item.desc}</span>
                        </div>
                      </div>

                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Supabase Status */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="font-medium text-zinc-300">Live DB Node (Supabase EU-Central)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-extrabold text-emerald-300">
                  100% SLA
                </span>
              </div>

              {/* Admin Sign Out */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">admin@starxflow.com</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Admin Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              C. PUBLIC MARKETING WEBSITE CONTENT (EVERY SINGLE OPTION)
              ═══════════════════════════════════════════════════════════ */}
          {isPublic && (
            <div className="space-y-5">
              {/* Primary Fast Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMasterMenuOpen(false);
                    openSignup();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Free Trial</span>
                </button>

                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMasterMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs transition-all"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Go to Dashboard</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMasterMenuOpen(false);
                      openLogin();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* All Website Sections */}
              {websiteSections.map((sec) => (
                <div key={sec.category} className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400/90 px-1">
                    {sec.category}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMasterMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all",
                            isActive
                              ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                              : "bg-white/[0.03] border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold block text-white truncate">{item.label}</span>
                              <span className="text-[10px] text-zinc-400 block truncate">{item.desc}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Legal & Trust Links */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
                <Link href="/privacy" onClick={() => setIsMasterMenuOpen(false)} className="hover:text-zinc-300 transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link href="/terms" onClick={() => setIsMasterMenuOpen(false)} className="hover:text-zinc-300 transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link href="/security" onClick={() => setIsMasterMenuOpen(false)} className="hover:text-zinc-300 transition-colors">
                  Security (SOC-2)
                </Link>
              </div>
            </div>
          )}
        </div>
      </GlassSheet>
    </>
  );
}
