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
        "rounded-2xl bg-[#121715] border border-[#edf0ee]/[0.08] p-8 sm:p-10 text-center flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] mb-4">
        {icon || <Inbox className="w-5 h-5" strokeWidth={1.65} />}
      </div>
      <h3 className="text-sm font-medium text-[#edf0ee]">{title}</h3>
      {description && (
        <p className="text-xs text-[#727c75] max-w-sm mt-1.5 leading-relaxed">
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
