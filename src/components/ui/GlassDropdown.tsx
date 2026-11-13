"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { dropdownExpand, navPillSpring } from "../../lib/motionVariants";

export interface GlassDropdownItem {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string;
}

export interface GlassDropdownProps {
  triggerLabel: string;
  items?: GlassDropdownItem[];
  children?: React.ReactNode;
  isActive?: boolean;
  activeLayoutId?: string;
  align?: "left" | "center" | "right";
  className?: string;
  menuClassName?: string;
  onNavigate?: (href: string) => void;
}

export function GlassDropdown({
  triggerLabel,
  items,
  children,
  isActive = false,
  activeLayoutId,
  align = "left",
  className,
  menuClassName,
  onNavigate,
}: GlassDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const openedByHoverRef = useRef(false);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!open) {
      openedByHoverRef.current = true;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      openedByHoverRef.current = false;
      setOpen(false);
    }, 140);
  };

  const alignClasses = {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          if (open && openedByHoverRef.current) {
            openedByHoverRef.current = false;
            return;
          }
          openedByHoverRef.current = false;
          setOpen((prev) => !prev);
        }}
        className={cn(
          "relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 cursor-pointer",
          isActive
            ? "text-emerald-300"
            : open
              ? "text-emerald-300 bg-emerald-500/10"
              : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
        )}
      >
        {isActive && activeLayoutId && (
          <motion.span
            layoutId={prefersReduced ? undefined : activeLayoutId}
            transition={navPillSpring}
            className="absolute inset-0 rounded-full bg-emerald-500/12 border border-emerald-500/30 -z-10"
          />
        )}
        {isActive && !activeLayoutId && (
          <span className="absolute inset-0 rounded-full bg-emerald-500/12 border border-emerald-500/30 -z-10" />
        )}
        <span>{triggerLabel}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 text-zinc-400",
            open && "rotate-180 text-emerald-400"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            variants={prefersReduced ? undefined : dropdownExpand}
            initial={prefersReduced ? undefined : "hidden"}
            animate={prefersReduced ? undefined : "visible"}
            exit={prefersReduced ? undefined : "exit"}
            style={{ position: "absolute" }}
            className={cn(
              "!absolute top-full mt-2.5 min-w-[270px] rounded-2xl glass-card-obsidian border border-emerald-500/25 shadow-[0_24px_60px_rgba(0,0,0,0.75),0_0_36px_rgba(16,185,129,0.14)] p-2.5 z-50 origin-top max-h-[calc(100vh-5rem)] overflow-y-auto console-scroll",
              alignClasses[align],
              menuClassName
            )}
          >
            <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            {children
              ? children
              : items?.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      if (item.onClick) item.onClick();
                      if (item.href && onNavigate) onNavigate(item.href);
                    }}
                    className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all group"
                  >
                    {item.icon && (
                      <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors flex-shrink-0">
                        {item.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-100 group-hover:text-emerald-300 transition-colors">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </button>
                ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
