"use client";

import React from "react";
import { CONSOLE_PANEL_LG } from "../../../lib/consoleSurface";
import { cn } from "../../../lib/utils";
import { EmptyState } from "../../ui/EmptyState";

export interface ChartShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ChartShell({
  title,
  subtitle,
  icon,
  actions,
  isEmpty = false,
  emptyTitle = "No telemetry recorded yet",
  emptyDescription = "Real metrics will appear automatically once live workflows execute.",
  emptyActionLabel,
  onEmptyAction,
  children,
  className,
}: ChartShellProps) {
  return (
    <div
      className={cn(
        CONSOLE_PANEL_LG,
        "select-none h-full flex flex-col justify-between tabular-nums",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#edf0ee]/[0.08] mb-5">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-[#edf0ee] flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-[#727c75] mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>

      {isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
          className="border-0 bg-transparent p-6 my-auto"
        />
      ) : (
        children
      )}
    </div>
  );
}
