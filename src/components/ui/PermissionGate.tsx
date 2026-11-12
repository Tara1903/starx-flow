"use client";

import React from "react";
import { Lock } from "lucide-react";
import { cn } from "../../lib/utils";

export interface PermissionGateProps {
  allowed: boolean;
  reason?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Presentational UI affordance for role- or tier-restricted controls.
 * Server routes still independently enforce authentication, tenant membership, and RBAC.
 */
export function PermissionGate({
  allowed,
  reason = "Admin or Owner permission required",
  children,
  className,
}: PermissionGateProps) {
  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div
      aria-disabled="true"
      title={reason}
      className={cn(
        "relative group rounded-2xl border border-amber-400/20 bg-amber-500/[0.04] p-3",
        className
      )}
    >
      <div className="pointer-events-none opacity-45 select-none">{children}</div>
      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/12 border border-amber-400/30 px-2.5 py-1 rounded-full">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span>{reason}</span>
      </div>
    </div>
  );
}
