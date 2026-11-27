"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  Shield,
  RefreshCw,
  Clock,
  HardDrive,
  Cpu,
} from "lucide-react";
import {
  CONSOLE_PANEL,
  CONSOLE_PANEL_LG,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import { isSupabaseConfigured } from "../../lib/supabase";

interface AdminSettingsViewProps {
  onRefresh: () => void;
  adminEmail?: string;
}

export function AdminSettingsView({
  onRefresh,
  adminEmail = "admin@starxflow.com",
}: AdminSettingsViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [telemetrySyncSecs, setTelemetrySyncSecs] = useState("30");
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true);

  const handleSyncTelemetry = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onRefresh();
      setIsSyncing(false);
    }, 600);
  };

  const auditEvents = [
    {
      id: "ev-1",
      action: "Admin session authenticated",
      actor: adminEmail,
      ip: "Session token verified",
      time: "2m ago",
    },
    {
      id: "ev-2",
      action: "Realtime lead listener connected",
      actor: "Supabase Realtime",
      ip: "api.supabase.co",
      time: "14m ago",
    },
    {
      id: "ev-3",
      action: "Client records synchronized",
      actor: adminEmail,
      ip: "PostgreSQL primary",
      time: "48m ago",
    },
    {
      id: "ev-4",
      action: "Row-level security policy check",
      actor: "Access watchdog",
      ip: "RLS active",
      time: "2h ago",
    },
  ];

  return (
    <div className="space-y-6 select-none tabular-nums">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={CONSOLE_HEADING}>System & audit</h1>
            <span className={CONSOLE_BADGE_LIVE}>All services online</span>
          </div>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Database connectivity, access guardrails, and administrative trail
          </p>
        </div>

        <button
          type="button"
          onClick={handleSyncTelemetry}
          disabled={isSyncing}
          className={CONSOLE_BTN_SECONDARY}
        >
          <RefreshCw className={cn("w-3.5 h-3.5 text-[#a1aaa4]", isSyncing && "animate-spin")} />
          <span>{isSyncing ? "Syncing..." : "Sync telemetry"}</span>
        </button>
      </div>

      {/* 4 Infrastructure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-3">
            <Database className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
            <span className={CONSOLE_BADGE_LIVE}>Connected</span>
          </div>
          <h2 className="text-sm font-medium text-[#edf0ee]">PostgreSQL cluster</h2>
          <p className="text-xs text-[#727c75] mt-1">
            {isSupabaseConfigured ? "Supabase managed instance" : "Local fallback active"}
          </p>
          <div className="mt-4 pt-3 border-t border-[#edf0ee]/[0.06] flex items-center justify-between text-xs text-[#727c75]">
            <span>Engine</span>
            <span className="text-[#edf0ee] font-mono">Postgres 15</span>
          </div>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-3">
            <Shield className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
            <span className={CONSOLE_BADGE_LIVE}>Enforced</span>
          </div>
          <h2 className="text-sm font-medium text-[#edf0ee]">Row-level security</h2>
          <p className="text-xs text-[#727c75] mt-1">Admin role guard and tenant scopes</p>
          <div className="mt-4 pt-3 border-t border-[#edf0ee]/[0.06] flex items-center justify-between text-xs text-[#727c75]">
            <span>Auth mode</span>
            <span className="text-[#edf0ee] font-mono">JWT Bearer</span>
          </div>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-3">
            <Cpu className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
            <span className={CONSOLE_BADGE_MUTED}>Active</span>
          </div>
          <h2 className="text-sm font-medium text-[#edf0ee]">Execution queue</h2>
          <p className="text-xs text-[#727c75] mt-1">Webhook worker dispatch</p>
          <div className="mt-4 pt-3 border-t border-[#edf0ee]/[0.06] flex items-center justify-between text-xs text-[#727c75]">
            <span>Queue mode</span>
            <span className="text-[#edf0ee]">Parallel</span>
          </div>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-3">
            <HardDrive className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
            <span className={CONSOLE_BADGE_MUTED}>Vercel edge</span>
          </div>
          <h2 className="text-sm font-medium text-[#edf0ee]">Edge asset cache</h2>
          <p className="text-xs text-[#727c75] mt-1">Static and SSR font delivery</p>
          <div className="mt-4 pt-3 border-t border-[#edf0ee]/[0.06] flex items-center justify-between text-xs text-[#727c75]">
            <span>Fonts</span>
            <span className="text-[#edf0ee]">Local + Edge</span>
          </div>
        </div>
      </div>

      {/* Settings & Audit Trail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={cn(CONSOLE_PANEL_LG, "space-y-5")}>
          <div className="flex items-center justify-between border-b border-[#edf0ee]/[0.08] pb-3.5">
            <div>
              <h2 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
                <Settings className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
                Platform configuration
              </h2>
              <p className="text-xs text-[#727c75] mt-0.5">
                Sync frequency and access logging rules
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className={cn(CONSOLE_SUBCARD, "flex items-center justify-between p-3.5 gap-3")}>
              <div>
                <p className="text-xs font-medium text-[#edf0ee]">Sync interval</p>
                <p className="text-xs text-[#727c75] mt-0.5">
                  Polling interval for workspace metrics
                </p>
              </div>
              <select
                value={telemetrySyncSecs}
                onChange={(e) => setTelemetrySyncSecs(e.target.value)}
                className={cn(CONSOLE_INPUT, "text-xs px-3 py-1.5 cursor-pointer")}
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>

            <div className={cn(CONSOLE_SUBCARD, "flex items-center justify-between p-3.5 gap-3")}>
              <div>
                <p className="text-xs font-medium text-[#edf0ee]">Audit logging</p>
                <p className="text-xs text-[#727c75] mt-0.5">
                  Record status updates, tier changes, and sign-ins
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={auditLoggingEnabled}
                aria-label="Toggle audit logging"
                onClick={() => setAuditLoggingEnabled(!auditLoggingEnabled)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative flex items-center px-1 border cursor-pointer",
                  auditLoggingEnabled
                    ? "bg-[#34d399]/25 border-[#34d399]/50"
                    : "bg-[#19201d] border-[#edf0ee]/10"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full transition-transform duration-150",
                    auditLoggingEnabled ? "translate-x-5 bg-[#34d399]" : "translate-x-0 bg-[#727c75]"
                  )}
                />
              </button>
            </div>

            <div className={cn(CONSOLE_SUBCARD, "p-3.5 space-y-1.5")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#edf0ee]">Operator account</span>
                <span className="text-xs text-[#a1aaa4] font-mono">{adminEmail}</span>
              </div>
              <p className="text-xs text-[#727c75]">
                Authenticated through Supabase cookie and role verification
              </p>
            </div>
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL_LG, "flex flex-col justify-between")}>
          <div>
            <div className="flex items-center justify-between border-b border-[#edf0ee]/[0.08] pb-3.5 mb-4">
              <div>
                <h2 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
                  <Clock className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
                  Recent security events
                </h2>
                <p className="text-xs text-[#727c75] mt-0.5">
                  Chronological administrative session events
                </p>
              </div>
              <span className={CONSOLE_BADGE_MUTED}>90-day retention</span>
            </div>

            <div className="space-y-2.5">
              {auditEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={cn(CONSOLE_SUBCARD, "p-3 flex items-start justify-between gap-3")}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#edf0ee] truncate">{evt.action}</p>
                    <p className="text-xs text-[#727c75] truncate mt-0.5">
                      {evt.actor} · {evt.ip}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#727c75] whitespace-nowrap">
                    {evt.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
