"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { X, ArrowRight, Sparkles, Shield, Calendar, MessageSquare, Zap, Globe } from "lucide-react";

interface LusionMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LusionMenuOverlay({ isOpen, onClose }: LusionMenuOverlayProps) {
  const router = useRouter();
  const { openLogin, openSignup } = useUIStore();
  const { isLoggedIn } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation & Escape key support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus close button on open
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 100);

    // Prevent background scrolling while menu is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleNavClick = (href: string) => {
    onClose();
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(href);
    }
  };

  const navItems = [
    { number: "01", label: "Overview", subtitle: "Autonomous Front Desk Core", href: "#hero" },
    { number: "02", label: "Capabilities", subtitle: "WhatsApp, Scheduling & CRM", href: "#capabilities" },
    { number: "03", label: "Connected Ecosystem", subtitle: "Seamless Real-time Operations", href: "#connected-environment" },
    { number: "04", label: "Interactive Demo", subtitle: "Live WhatsApp Triage & ROI", href: "#demo-showcase" },
    { number: "05", label: "Transparent Pricing", subtitle: "Solo, Growth & Enterprise", href: "#pricing" },
    { number: "06", label: "About StarX", subtitle: "Company Mission & Trust", href: "/about" },
    { number: "07", label: "Resources", subtitle: "Knowledge Base & Guides", href: "/resources" },
  ];

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation"
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#030706]/98 backdrop-blur-2xl text-white transition-opacity duration-500 overflow-y-auto"
    >
      {/* Background Emerald Atmospheric Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="starx-ambient-aura bg-emerald-500/15 top-[-100px] left-1/4 scale-150" />
        <div className="starx-ambient-aura bg-emerald-700/10 bottom-[-50px] right-10 scale-125" />
      </div>

      {/* Top Header inside Menu */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-12 py-6 flex items-center justify-between border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            StarX <span className="font-light text-emerald-400">Flow</span>
          </span>
          <span className="hidden sm:inline-block ml-3 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
            Navigation Index
          </span>
        </div>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close Navigation"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-200 hover:text-white hover:border-emerald-400 hover:bg-emerald-900/50 transition-all duration-300"
        >
          <span className="text-xs uppercase tracking-widest font-mono">Close</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Editorial Links Section */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        {/* Left Column: Numbered Editorial Links */}
        <div className="lg:col-span-8 flex flex-col space-y-4 sm:space-y-6">
          {navItems.map((item, idx) => (
            <button
              key={item.number}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="group text-left flex items-baseline gap-4 sm:gap-6 py-2 border-b border-white/[0.04] hover:border-emerald-500/30 transition-all duration-300"
              style={{
                animationDelay: `${idx * 60}ms`,
              }}
            >
              <span className="text-xs sm:text-sm font-mono text-emerald-400/50 group-hover:text-emerald-300 transition-colors w-8">
                {item.number}
              </span>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <span className="font-lusion-display text-2xl sm:text-4xl md:text-5xl font-light text-white group-hover:text-emerald-300 transition-all duration-300 group-hover:translate-x-2">
                  {item.label}
                </span>
                <span className="text-xs sm:text-sm text-emerald-200/50 group-hover:text-emerald-200/80 transition-colors">
                  {item.subtitle}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 ml-auto hidden sm:block" />
            </button>
          ))}
        </div>

        {/* Right Column: Direct Actions & Status */}
        <div className="lg:col-span-4 flex flex-col space-y-8 bg-emerald-950/20 border border-emerald-500/15 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              The Intelligent Front Desk
            </span>
            <h3 className="text-xl font-semibold text-white mt-1">
              Automate Client Bookings in 3 Minutes
            </h3>
            <p className="text-sm text-emerald-100/70 mt-2 leading-relaxed">
              Connect your WhatsApp Business number, synchronize provider calendars, and eliminate double bookings with zero commission fees.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (isLoggedIn) router.push("/dashboard");
                else openSignup();
              }}
              className="w-full starx-btn-primary justify-center text-sm"
            >
              <span>{isLoggedIn ? "Go to Dashboard" : "Start 14-Day Free Trial"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (isLoggedIn) router.push("/dashboard");
                else openLogin();
              }}
              className="w-full starx-btn-secondary justify-center text-sm"
            >
              <span>{isLoggedIn ? "Account Settings" : "Sign In to Workspace"}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-emerald-500/10 space-y-2 text-xs text-emerald-200/60 font-mono">
            <div className="flex items-center justify-between">
              <span>SYSTEM STATUS:</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                99.98% OPERATIONAL
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>RESPONSE SPEED:</span>
              <span className="text-emerald-300">AVERAGE 1.4s</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ENCRYPTION:</span>
              <span className="text-emerald-300">AES-256 / SOC2-READY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer inside Menu */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-12 py-6 border-t border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/50 gap-4">
        <div>
          © {new Date().getFullYear()} StarX Flow Inc. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" onClick={onClose} className="hover:text-emerald-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" onClick={onClose} className="hover:text-emerald-300 transition-colors">
            Terms of Service
          </Link>
          <Link href="/security" onClick={onClose} className="hover:text-emerald-300 transition-colors">
            Security Overview
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
