"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";

interface LusionHeaderProps {
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

export function LusionHeader({ onToggleMenu, isMenuOpen }: LusionHeaderProps) {
  const router = useRouter();
  const { openLogin, openSignup } = useUIStore();
  const { isLoggedIn } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      openLogin();
    }
  };

  const handleGetStartedClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      openSignup();
    }
  };

  return (
    <header
      id="top-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#030706]/80 backdrop-blur-xl border-b border-emerald-500/15 py-3.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand Wordmark & Icon */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
          aria-label="StarX Flow Home"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
              className="w-8 h-8 transition-transform duration-500 group-hover:scale-110 filter drop-shadow-[0_0_12px_rgba(110,231,183,0.8)]"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 2L19.4 12.6L30 16L19.4 19.4L16 30L12.6 19.4L2 16L12.6 12.6L16 2Z"
                fill="url(#headerStarGrad)"
              />
              <path
                d="M16 7L18.2 13.8L25 16L18.2 18.2L16 25L13.8 18.2L7 16L13.8 13.8L16 7Z"
                fill="#ffffff"
                opacity="0.9"
              />
              <defs>
                <linearGradient
                  id="headerStarGrad"
                  x1="2"
                  y1="2"
                  x2="30"
                  y2="30"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#a7f3d0" />
                  <stop offset="0.5" stopColor="#34d399" />
                  <stop offset="1" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
            StarX <span className="font-light text-emerald-400">Flow</span>
          </span>
        </Link>

        {/* Desktop Minimal Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-emerald-100/75"
        >
          <a
            href="#capabilities"
            className="hover:text-white transition-colors duration-200"
          >
            Capabilities
          </a>
          <a
            href="#connected-environment"
            className="hover:text-white transition-colors duration-200"
          >
            Connected Ecosystem
          </a>
          <a
            href="#demo-showcase"
            className="hover:text-white transition-colors duration-200"
          >
            Interactive Demo
          </a>
          <a
            href="#pricing"
            className="hover:text-white transition-colors duration-200"
          >
            Pricing
          </a>
        </nav>

        {/* Right CTA & Menu Trigger */}
        <div className="flex items-center gap-3">
          <button
            id="btn-nav-login"
            type="button"
            onClick={handleLoginClick}
            className="hidden sm:inline-flex text-[14px] font-medium text-emerald-200/90 hover:text-white px-4 py-2 rounded-full transition-colors"
          >
            {isLoggedIn ? "Dashboard" : "Log In"}
          </button>

          <button
            id="btn-nav-get-started"
            type="button"
            onClick={handleGetStartedClick}
            className="starx-btn-primary !py-2.5 !px-5 !text-[13.5px] gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
          >
            <span>{isLoggedIn ? "Open Workspace" : "Get Started"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Lusion Menu Button */}
          <button
            id="btn-nav-menu-toggle"
            type="button"
            onClick={onToggleMenu}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:text-white hover:border-emerald-400 hover:bg-emerald-900/50 transition-all duration-300 ml-1"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 transition-transform duration-300 rotate-90 scale-110" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
