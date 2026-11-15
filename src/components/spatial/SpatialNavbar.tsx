"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

export function SpatialNavbar() {
  const { openSignup } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  return (
    <header
      className="w-full relative z-30 pointer-events-auto"
      style={{
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="w-full max-w-[866px] flex items-center justify-between"
        style={{ height: "32px", padding: "0 40px" }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          {/* StarX 4-Pointed Star Icon */}
          <div className="w-4 h-4 relative flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-[#28DFA0] drop-shadow-[0_0_8px_rgba(40,223,160,0.6)]"
            >
              <path
                d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span
            className="font-sans font-bold tracking-tight text-white text-[13px]"
            style={{ letterSpacing: "-0.01em" }}
          >
            StarX Flow
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-7">
          <Link
            href="#product"
            className="text-[11px] text-[#B8C9BD] hover:text-[#F0F5EF] transition-colors font-medium"
          >
            Product
          </Link>
          <Link
            href="#solutions"
            className="text-[11px] text-[#B8C9BD] hover:text-[#F0F5EF] transition-colors font-medium"
          >
            Solutions
          </Link>
          <Link
            href="#pricing"
            className="text-[11px] text-[#B8C9BD] hover:text-[#F0F5EF] transition-colors font-medium"
          >
            Pricing
          </Link>
          <Link
            href="#resources"
            className="text-[11px] text-[#B8C9BD] hover:text-[#F0F5EF] transition-colors font-medium"
          >
            Resources
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="rounded-full px-3 py-1 text-[10.5px] font-medium transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#F0F5EF",
              height: "26px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoggedIn ? "Dashboard" : "Log in"}
          </Link>

          <button
            type="button"
            onClick={
              isLoggedIn
                ? () => (window.location.href = "/dashboard")
                : openSignup
            }
            className="rounded-full px-3.5 py-1 text-[10.5px] font-bold transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(40,223,160,0.3)] hover:shadow-[0_0_18px_rgba(40,223,160,0.5)]"
            style={{
              background: "#28DFA0",
              color: "#000904",
              height: "26px",
            }}
          >
            <span>Get Started</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
}
