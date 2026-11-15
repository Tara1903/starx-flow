"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SpatialSectionHeaderProps {
  badge: string;
  badgeIcon?: React.ReactNode;
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export function SpatialSectionHeader({
  badge,
  badgeIcon,
  titlePrefix,
  titleHighlight,
  titleSuffix,
  subtitle,
  align = "center",
  className = "",
}: SpatialSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`relative z-10 mb-14 lg:mb-18 spatial-content-protected ${
        isCenter ? "text-center max-w-3xl mx-auto" : "text-left max-w-2xl"
      } ${className}`}
    >
      {/* 1. Crystal Telemetry Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-crystal text-xs font-semibold tracking-widest text-emerald-300 uppercase mb-5 shadow-[0_0_24px_rgba(16,185,129,0.22)] ${
          isCenter ? "mx-auto" : ""
        }`}
      >
        {badgeIcon || <Sparkles size={12} className="text-emerald-400" />}
        <span>{badge}</span>
      </div>

      {/* 2. Main Spatial Display Title (Permanently Visible) */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.08]">
        {titlePrefix && <span>{titlePrefix} </span>}
        {titleHighlight && (
          <span className="text-gradient-green">{titleHighlight} </span>
        )}
        {titleSuffix && <span>{titleSuffix}</span>}
      </h2>

      {/* 3. Editorial Lead Subtitle (Permanently Visible) */}
      {subtitle && (
        <p className="text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
