"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { GlassButton } from "@/components/ui/GlassButton";

interface Props {
  primaryText?: string;
  secondaryText?: string;
  secondaryHref?: string;
  align?: "center" | "left";
}

export function LandingCTAButtons({
  primaryText = "Start 14-Day Free Trial",
  secondaryText = "Test Live AI Demo",
  secondaryHref = "/chat",
  align = "center",
}: Props) {
  const openSignup = useUIStore((state) => state.openSignup);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-4 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <GlassButton
        size="lg"
        variant="primary"
        magnetic
        onClick={openSignup}
        className="w-full sm:w-auto"
      >
        <Sparkles className="w-4 h-4" />
        {primaryText}
        <ArrowRight className="w-4 h-4" />
      </GlassButton>

      <Link
        href={secondaryHref}
        className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0b1411]/75 backdrop-blur-md border border-white/15 hover:border-emerald-500/40 text-white hover:text-emerald-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      >
        <MessageSquare className="w-4 h-4 text-emerald-400" />
        {secondaryText}
      </Link>
    </div>
  );
}
