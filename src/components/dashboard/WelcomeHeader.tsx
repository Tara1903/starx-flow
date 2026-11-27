"use client";

import React from "react";
import { useAuthStore } from "../../store/authStore";
import { CONSOLE_HEADING } from "../../lib/consoleSurface";

export function WelcomeHeader() {
  const user = useAuthStore((s) => s.user);
  const workflows = useAuthStore((s) => s.workflows);
  const activeCount = workflows.filter((w) => w.isActive).length;

  const businessName = user?.businessName || "Workspace overview";
  const businessMeta = [user?.businessType, user?.name].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1 select-none">
      <div className="min-w-0">
        <h1 className={CONSOLE_HEADING}>{businessName}</h1>
        <p className="text-xs sm:text-sm text-[#727c75] mt-0.5 truncate">
          {businessMeta ? `${businessMeta} · ` : ""}
          Automated customer communications and receptionist activity
        </p>
      </div>

      <div className="inline-flex items-center gap-2 text-xs text-[#a1aaa4] self-start sm:self-auto tabular-nums">
        <span
          className={
            activeCount > 0
              ? "w-1.5 h-1.5 rounded-full bg-[#4cc38a]"
              : "w-1.5 h-1.5 rounded-full bg-[#727c75]"
          }
          aria-hidden="true"
        />
        <span>
          {activeCount > 0
            ? `${activeCount} automation${activeCount === 1 ? "" : "s"} active`
            : "Channels standby"}
        </span>
      </div>
    </div>
  );
}
