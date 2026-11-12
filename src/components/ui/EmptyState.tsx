"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "../../lib/utils";
import { GlassButton } from "./GlassButton";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-card-obsidian rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <GlassButton
          variant="primary"
          size="sm"
          onClick={onAction}
          className="mt-5"
        >
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
}
