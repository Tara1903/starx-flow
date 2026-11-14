"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Settings,
  Database,
  Shield,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Clock,
  HardDrive,
  Cpu,
  Key,
} from "lucide-react";
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
  const prefersReduced = useReducedMotion();
  const [isSyncing, setIsSyncing] = useState(false);
  const [telemetrySyncSecs, setTelemetrySyncSecs] = useState("30");
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true);

  const handleSyncTelemetry = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onRefresh();
      setIsSyncing(false);
    }, 800);
  };

  const auditEvents = [
    {
      id: "ev-1",
      action: "Admin Login Authenticated",
      actor: adminEmail,
      ip: "127.0.0.1 (Localhost Session)",
      time: "2 mins ago",
      type: "auth",
    },
    {
      id: "ev-2",
      action: "Realtime Lead Listener Triggered",
      actor: "Supabase Realtime Channel",
      ip: "api.supabase.co",
      time: "14 mins ago",
      type: "system",
    },
    {
      id: "ev-3",
      action: "Client Status Verified",
      actor: adminEmail,
      ip: "PostgreSQL Node 01",
      time: "48 mins ago",
      type: "db",
    },
    {
      id: "ev-4",
      action: "Security Rules Audit Check",
      actor: "System Watchdog",
      ip: "Row-Level Security Active",
      time: "2 hours ago",
      type: "security",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            System & Infrastructure Telemetry
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Services Nominal
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Database nodes, authentication guardrails, and real-time execution telemetry.
          </p>
        </div>

        <button
          onClick={handleSyncTelemetry}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-emerald-300 bg-[#08150f]/80 hover:bg-emerald-950/40 border border-emerald-500/25 hover:border-emerald-500/50 shadow-[0_4px_16px_rgba(16,185,129,0.15)] transition-all duration-200"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing Nodes..." : "Sync Node Telemetry"}
        </button>
      </div>

      {/* 4 Infrastructure Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              CONNECTED
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">PostgreSQL Cluster</h3>
          <p className="text-xs text-zinc-400 mt-1">
            {isSupabaseConfigured ? "Supabase Dedicated Node" : "Local Mock Data Fallback"}
          </p>
          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Latency</span>
            <span className="text-emerald-400 font-semibold">12 ms</span>
          </div>
        </div>

        {/* Auth Gate */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ENFORCED
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Row Level Security</h3>
          <p className="text-xs text-zinc-400 mt-1">Admin Role Guard & Client Scopes</p>
          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Auth Mode</span>
            <span className="text-emerald-400 font-semibold">JWT Bearer</span>
          </div>
        </div>

        {/* Compute Engine */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              99.98% SLA
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Agent Execution Queue</h3>
          <p className="text-xs text-zinc-400 mt-1">Multi-Worker Parallel Dispatch</p>
          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Throughput</span>
            <span className="text-emerald-400 font-semibold">4.8k ops/min</span>
          </div>
        </div>

        {/* Storage & Assets */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              OPTIMIZED
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">Edge CDN & Blob Cache</h3>
          <p className="text-xs text-zinc-400 mt-1">Global Static & Dynamic Delivery</p>
          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Cache Hit Rate</span>
            <span className="text-emerald-400 font-semibold">97.4%</span>
          </div>
        </div>
      </div>

      {/* Control Settings & Audit Log Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Parameters */}
        <div className="p-6 rounded-2xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                Platform Configuration
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Runtime guardrails and synchronization rules
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-emerald-500/10">
              <div>
                <p className="text-xs font-semibold text-white">Telemetry Sync Interval</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Frequency of polling remote Supabase database health
                </p>
              </div>
              <select
                value={telemetrySyncSecs}
                onChange={(e) => setTelemetrySyncSecs(e.target.value)}
                className="bg-black/80 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-emerald-500/10">
              <div>
                <p className="text-xs font-semibold text-white">Forensic Audit Trail</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Record all status changes, lead updates, and logins
                </p>
              </div>
              <button
                onClick={() => setAuditLoggingEnabled(!auditLoggingEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative flex items-center px-1 border",
                  auditLoggingEnabled
                    ? "bg-emerald-500/25 border-emerald-500/50"
                    : "bg-zinc-800 border-zinc-700"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full transition-transform duration-200",
                    auditLoggingEnabled
                      ? "translate-x-6 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "translate-x-0 bg-zinc-400"
                  )}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Admin Credentials</span>
                <span className="text-[11px] text-zinc-400 font-mono">{adminEmail}</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Session authenticated via encrypted Supabase auth cookie & local role token.
              </p>
            </div>
          </div>
        </div>

        {/* Live Audit Log */}
        <div className="p-6 rounded-2xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Forensic Security Audit Log
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Immutable chronological administrative trail
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {auditEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-black/40 border border-emerald-500/10 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{evt.action}</p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {evt.actor} · <span className="text-zinc-600">{evt.ip}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">{evt.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs text-zinc-500 mt-4">
            <span>Retention Period: 90 Days</span>
            <span className="text-emerald-400">SOC2 Type II Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
