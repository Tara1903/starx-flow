"use client";
import React, { forwardRef, useCallback, useRef } from "react";
import { cn } from "../../lib/utils";
import { motion, HTMLMotionProps, useReducedMotion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useMagneticPull } from "../../cursor/MagneticElement";
import type { CursorButtonVariant, MagneticStrengthLevel } from "../../cursor/cursorTypes";

export interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: CursorButtonVariant;
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  magneticStrength?: MagneticStrengthLevel;
  isLoading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      magnetic = false,
      magneticStrength,
      isLoading = false,
      loadingText,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const prefersReduced = useReducedMotion();
    const isBlocked = Boolean(disabled || isLoading);
    const localRef = useRef<HTMLButtonElement | null>(null);

    const resolvedStrength: MagneticStrengthLevel =
      magneticStrength ?? (magnetic ? "medium" : "none");
    const isMagneticActive = !isBlocked && resolvedStrength !== "none";

    useMagneticPull(localRef, {
      enabled: isMagneticActive,
      strength: resolvedStrength,
      disabled: isBlocked,
    });

    const setMergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        localRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const baseClasses =
      "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 cursor-pointer";

    const variants: Record<CursorButtonVariant, string> = {
      primary:
        "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-[#02120c] font-bold border border-emerald-300/35 shadow-[0_6px_18px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.45)] enabled:hover:bg-none enabled:hover:bg-white focus-visible:bg-none focus-visible:bg-white enabled:hover:text-[#03120c] focus-visible:text-[#03120c] enabled:hover:border-emerald-300 focus-visible:border-emerald-300 enabled:hover:shadow-[0_6px_16px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.75)] focus-visible:shadow-[0_6px_16px_rgba(0,0,0,0.22)]",
      secondary:
        "bg-[#0b1411]/80 backdrop-blur-md border border-white/15 text-zinc-100 shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] enabled:hover:bg-emerald-400 focus-visible:bg-emerald-400 enabled:hover:text-[#02120c] focus-visible:text-[#02120c] enabled:hover:border-emerald-300 focus-visible:border-emerald-300 enabled:hover:shadow-[0_6px_16px_rgba(0,0,0,0.26)] focus-visible:shadow-[0_6px_16px_rgba(0,0,0,0.26)]",
      outline:
        "bg-transparent border border-emerald-400/55 text-emerald-300 enabled:hover:bg-emerald-400 focus-visible:bg-emerald-400 enabled:hover:text-[#02120c] focus-visible:text-[#02120c] enabled:hover:border-emerald-300 focus-visible:border-emerald-300 enabled:hover:shadow-none focus-visible:shadow-none",
      white:
        "bg-white border border-white text-[#040807] font-bold shadow-[0_6px_22px_rgba(255,255,255,0.12)] enabled:hover:bg-[#050b08] focus-visible:bg-[#050b08] enabled:hover:text-white focus-visible:text-white enabled:hover:border-emerald-400/80 focus-visible:border-emerald-400/80 enabled:hover:shadow-[0_6px_18px_rgba(0,0,0,0.42)] focus-visible:shadow-[0_6px_18px_rgba(0,0,0,0.42)]",
      ghost:
        "bg-transparent text-zinc-300 border border-transparent enabled:hover:text-white focus-visible:text-white enabled:hover:bg-white/[0.08] focus-visible:bg-white/[0.08] enabled:hover:border-emerald-400/35 focus-visible:border-emerald-400/35",
      focus:
        "bg-emerald-500/14 backdrop-blur-md text-emerald-300 border border-emerald-500/40 shadow-[0_6px_16px_rgba(0,0,0,0.28)] enabled:hover:bg-emerald-400 focus-visible:bg-emerald-400 enabled:hover:text-[#02120c] focus-visible:text-[#02120c] enabled:hover:border-emerald-300 focus-visible:border-emerald-300 enabled:hover:shadow-none focus-visible:shadow-none",
      danger:
        "bg-red-500/15 border border-red-500/40 text-red-200 enabled:hover:bg-red-500 focus-visible:bg-red-500 enabled:hover:text-white focus-visible:text-white enabled:hover:border-red-400 focus-visible:border-red-400 enabled:hover:shadow-none focus-visible:shadow-none",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-xs gap-1.5 min-h-[32px]",
      md: "px-5 py-2.5 text-sm gap-2 min-h-[40px]",
      lg: "px-7 py-3.5 text-base gap-2.5 min-h-[48px]",
    };

    return (
      <motion.button
        ref={setMergedRef}
        disabled={isBlocked}
        aria-disabled={isBlocked || undefined}
        aria-busy={isLoading || undefined}
        data-cursor-invert={isBlocked ? undefined : variant}
        data-cursor-spotlight={isBlocked ? undefined : "button"}
        data-cursor-disabled={isBlocked ? "true" : undefined}
        data-cursor-magnetic={isMagneticActive ? resolvedStrength : undefined}
        whileHover={prefersReduced || isBlocked ? undefined : { y: -1 }}
        whileTap={prefersReduced || isBlocked ? undefined : { scale: 0.97, y: 1 }}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
        {isLoading && loadingText ? <span>{loadingText}</span> : children}
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";
