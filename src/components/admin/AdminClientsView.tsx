"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Mail,
  Calendar,
  Clock,
  Shield,
  X,
  UserCheck,
  BarChart3,
  Sparkles,
  Download,
  Plus,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Client } from "../../store/adminStore";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/25",
  },
  Trial: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    dot: "bg-cyan-500",
    border: "border-cyan-500/25",
  },
  Inactive: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    dot: "bg-zinc-500",
    border: "border-zinc-500/25",
  },
  Churned: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "bg-rose-500",
    border: "border-rose-500/25",
  },
};

const PLAN_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  "Free Trial": {
    text: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
  },
  Starter: {
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  Professional: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
  },
  Enterprise: {
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
};

type SortKey = "businessName" | "signupDate" | "totalExecutions" | "totalWorkflows" | "status";

interface AdminClientsViewProps {
  clients: Client[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onPlanChange: (id: string, plan: string) => void;
  onDeleteClient: (id: string) => void;
  onRefresh: () => void;
}

export function AdminClientsView({
  clients,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onPlanChange,
  onDeleteClient,
  onRefresh,
}: AdminClientsViewProps) {
  const prefersReduced = useReducedMotion();
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPlan, setFilterPlan] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("signupDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter & Sort
  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.businessName?.toLowerCase().includes(q) ||
          c.ownerName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.businessType?.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== "All") {
      result = result.filter((c) => c.status === filterStatus);
    }

    if (filterPlan !== "All") {
      result = result.filter((c) => c.plan === filterPlan);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "businessName":
          cmp = (a.businessName || "").localeCompare(b.businessName || "");
          break;
        case "signupDate":
          cmp = (a.signupDate || "").localeCompare(b.signupDate || "");
          break;
        case "totalExecutions":
          cmp = (a.totalExecutions || 0) - (b.totalExecutions || 0);
          break;
        case "totalWorkflows":
          cmp = (a.totalWorkflows || 0) - (b.totalWorkflows || 0);
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [clients, searchQuery, filterStatus, filterPlan, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortIndicator = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-25" />;
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 text-emerald-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-emerald-400" />
    );
  };

  const exportCSV = () => {
    const headers = ["Business Name,Owner,Email,Type,Status,Plan,Workflows,Executions,Signup Date"];
    const rows = filteredClients.map(
      (c) =>
        `"${c.businessName}","${c.ownerName}","${c.email}","${c.businessType}","${c.status}","${c.plan}",${c.totalWorkflows},${c.totalExecutions},"${c.signupDate}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starx-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Client Directory
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {clients.length} Total
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Manage authenticated enterprise accounts, subscription tiers, and automation capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-[#08150f]/80 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clients by company, owner, email, or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-emerald-500/15 focus:border-emerald-500/50 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200",
              showFilters
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-black/30 border-emerald-500/15 text-zinc-400 hover:text-white hover:border-emerald-500/30"
            )}
          >
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Filter View
            <ChevronDown
              className={cn(
                "w-3 h-3 text-zinc-400 transition-transform duration-200",
                showFilters && "rotate-180"
              )}
            />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-emerald-500/15 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Account Status
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Active", "Trial", "Inactive", "Churned"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 border",
                          filterStatus === st
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            : "bg-black/30 text-zinc-400 border-white/5 hover:text-white hover:border-emerald-500/20"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Filter */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Subscription Tier
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Free Trial", "Starter", "Professional", "Enterprise"].map((pl) => (
                      <button
                        key={pl}
                        onClick={() => setFilterPlan(pl)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 border",
                          filterPlan === pl
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            : "bg-black/30 text-zinc-400 border-white/5 hover:text-white hover:border-emerald-500/20"
                        )}
                      >
                        {pl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clients Glass Table */}
      <div className="rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-emerald-500/15 bg-black/40 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          <button
            onClick={() => handleSort("businessName")}
            className="col-span-4 flex items-center gap-1.5 hover:text-emerald-300 transition-colors text-left"
          >
            Business & Owner
            <SortIndicator col="businessName" />
          </button>
          <div className="col-span-2">Contact Info</div>
          <button
            onClick={() => handleSort("status")}
            className="col-span-2 flex items-center gap-1.5 hover:text-emerald-300 transition-colors text-left"
          >
            Status & Tier
            <SortIndicator col="status" />
          </button>
          <button
            onClick={() => handleSort("totalWorkflows")}
            className="col-span-1 flex items-center gap-1.5 hover:text-emerald-300 transition-colors text-left"
          >
            Flows
            <SortIndicator col="totalWorkflows" />
          </button>
          <button
            onClick={() => handleSort("totalExecutions")}
            className="col-span-1 flex items-center gap-1.5 hover:text-emerald-300 transition-colors text-left"
          >
            Execs
            <SortIndicator col="totalExecutions" />
          </button>
          <button
            onClick={() => handleSort("signupDate")}
            className="col-span-1 flex items-center gap-1.5 hover:text-emerald-300 transition-colors text-left"
          >
            Joined
            <SortIndicator col="signupDate" />
          </button>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-emerald-500/10">
          {filteredClients.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-white">No clients found</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No registered accounts match your active filters or search criteria.
              </p>
            </div>
          ) : (
            filteredClients.map((client, index) => {
              const status = STATUS_STYLES[client.status] || STATUS_STYLES.Trial;
              const plan = PLAN_STYLES[client.plan] || PLAN_STYLES["Free Trial"];

              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReduced ? 0 : index * 0.02 }}
                  onClick={() => setSelectedClient(client)}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 hover:bg-emerald-500/[0.04] cursor-pointer transition-colors duration-150 group items-center"
                >
                  {/* Business & Owner */}
                  <div className="lg:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.15)] flex-shrink-0">
                      {client.businessName ? client.businessName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {client.businessName}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {client.ownerName} · <span className="text-zinc-500">{client.businessType}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="lg:col-span-2 min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{client.email || "—"}</p>
                    <p className="text-[11px] text-zinc-500 truncate">ID: {client.id.slice(0, 8)}...</p>
                  </div>

                  {/* Status & Tier */}
                  <div className="lg:col-span-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                        status.bg,
                        status.text,
                        status.border
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                      {client.status}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border",
                        plan.bg,
                        plan.text,
                        plan.border
                      )}
                    >
                      {client.plan}
                    </span>
                  </div>

                  {/* Flows */}
                  <div className="lg:col-span-1">
                    <span className="text-xs font-semibold text-white">
                      {client.totalWorkflows || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 lg:hidden ml-1">flows</span>
                  </div>

                  {/* Execs */}
                  <div className="lg:col-span-1">
                    <span className="text-xs font-semibold text-emerald-400">
                      {(client.totalExecutions || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Joined Date */}
                  <div className="lg:col-span-1">
                    <span className="text-xs text-zinc-400">{client.signupDate || "—"}</span>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/15 border border-transparent hover:border-emerald-500/30 transition-all duration-150"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <div className="p-6 rounded-2xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Plan Tier Distribution
            </h3>
            <span className="text-xs text-zinc-400">Live Breakdown</span>
          </div>

          <div className="space-y-3.5">
            {["Enterprise", "Professional", "Starter", "Free Trial"].map((tier) => {
              const count = clients.filter((c) => c.plan === tier).length;
              const pct = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
              const plan = PLAN_STYLES[tier] || PLAN_STYLES["Free Trial"];

              return (
                <div key={tier} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded font-medium text-[11px] border",
                        plan.bg,
                        plan.text,
                        plan.border
                      )}
                    >
                      {tier}
                    </span>
                    <span className="text-zinc-300 font-semibold">
                      {count} <span className="text-zinc-500 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: prefersReduced ? 0 : 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-6 rounded-2xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Account Status Summary
            </h3>
            <span className="text-xs text-zinc-400">Health Overview</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Active", "Trial", "Inactive", "Churned"].map((st) => {
              const count = clients.filter((c) => c.status === st).length;
              const pct = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
              const s = STATUS_STYLES[st] || STATUS_STYLES.Trial;

              return (
                <div
                  key={st}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all duration-200",
                    s.bg,
                    s.border
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={cn("w-2 h-2 rounded-full", s.dot)} />
                    <span className={cn("text-xs font-semibold", s.text)}>{st}</span>
                  </div>
                  <p className="text-xl font-bold text-white tracking-tight">{count}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{pct}% of user base</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedClient(null);
            }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, y: 14, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 14, opacity: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
              className="w-full max-w-lg rounded-2xl bg-[#08150f] border border-emerald-500/30 shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-transparent">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-lg shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                    {selectedClient.businessName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedClient.businessName}</h3>
                    <p className="text-xs text-zinc-400">
                      {selectedClient.ownerName} · {selectedClient.businessType}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedClient(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300 truncate">{selectedClient.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300">Joined {selectedClient.signupDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300">Last active: {selectedClient.lastActive}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300">Role: {selectedClient.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          STATUS_STYLES[selectedClient.status]?.dot || "bg-zinc-500"
                        )}
                      />
                      <span className="text-zinc-300">Status: {selectedClient.status}</span>
                    </div>
                  </div>
                </div>

                {/* Utilization Counters */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/15 text-center">
                    <p className="text-2xl font-bold text-white">{selectedClient.totalWorkflows}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Active Workflows</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/15 text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {selectedClient.totalExecutions.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">Total Executions</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="pt-2 border-t border-emerald-500/15 space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Administrative Controls
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Status</label>
                      <select
                        value={selectedClient.status}
                        onChange={(e) => {
                          const val = e.target.value;
                          onStatusChange(selectedClient.id, val);
                          setSelectedClient({ ...selectedClient, status: val });
                        }}
                        className="w-full bg-black/60 border border-emerald-500/25 text-sm text-white rounded-xl px-3 py-2 outline-none focus:border-emerald-500/60 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Trial">Trial</option>
                        <option value="Churned">Churned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Plan Tier</label>
                      <select
                        value={selectedClient.plan}
                        onChange={(e) => {
                          const val = e.target.value;
                          onPlanChange(selectedClient.id, val);
                          setSelectedClient({ ...selectedClient, plan: val });
                        }}
                        className="w-full bg-black/60 border border-emerald-500/25 text-sm text-white rounded-xl px-3 py-2 outline-none focus:border-emerald-500/60 cursor-pointer"
                      >
                        <option value="Free Trial">Free Trial</option>
                        <option value="Starter">Starter</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => {
                        onDeleteClient(selectedClient.id);
                        setSelectedClient(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Client Account
                    </button>

                    <button
                      onClick={() => setSelectedClient(null)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
