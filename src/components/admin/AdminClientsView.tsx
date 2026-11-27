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
  Download,
} from "lucide-react";
import {
  CONSOLE_PANEL,
  CONSOLE_PANEL_FLUSH,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_DANGER,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_DANGER,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import type { Client } from "../../store/adminStore";

const STATUS_BADGE: Record<string, string> = {
  Active: CONSOLE_BADGE_LIVE,
  Trial: CONSOLE_BADGE_INFO,
  Inactive: CONSOLE_BADGE_MUTED,
  Churned: CONSOLE_BADGE_DANGER,
};

const STATUS_DOT: Record<string, string> = {
  Active: "bg-[#4cc38a]",
  Trial: "bg-sky-400",
  Inactive: "bg-[#727c75]",
  Churned: "bg-[#e5484d]",
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
}: AdminClientsViewProps) {
  const prefersReduced = useReducedMotion();
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPlan, setFilterPlan] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("signupDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
      result = result.filter((c) => {
        if (filterPlan === "Free Trial") return c.plan === "Free Trial" || c.status === "Trial";
        if (filterPlan === "Pro") return c.plan === "Pro" || c.plan === "Professional";
        return c.plan === filterPlan;
      });
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
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-35" />;
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 text-[#34d399]" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#34d399]" />
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
    <div className="space-y-6 select-none">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={CONSOLE_HEADING}>Client directory</h1>
            <span className={CONSOLE_BADGE_MUTED}>{clients.length} total</span>
          </div>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Manage authenticated accounts, plan tiers, and workspace execution counts
          </p>
        </div>

        <button type="button" onClick={exportCSV} className={CONSOLE_BTN_SECONDARY}>
          <Download className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className={cn(CONSOLE_PANEL, "p-4 space-y-3")}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727c75]"
              strokeWidth={1.65}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by business, owner, or email"
              className={cn(CONSOLE_INPUT, "w-full pl-9 pr-4 py-2 text-sm")}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              CONSOLE_BTN_SECONDARY,
              "px-4",
              showFilters && "border-[#34d399]/35 text-[#edf0ee]"
            )}
          >
            <Filter className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
            <span>Filters</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#727c75] transition-transform duration-150",
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
              transition={{ duration: prefersReduced ? 0 : 0.18 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-[#edf0ee]/[0.08] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[#a1aaa4] mb-2">Account status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Active", "Trial", "Inactive", "Churned"].map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border cursor-pointer",
                          filterStatus === st
                            ? "bg-[#19201d] text-[#edf0ee] border-[#34d399]/35"
                            : "bg-[#0d1210] text-[#727c75] border-[#edf0ee]/[0.06] hover:text-[#edf0ee]"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#a1aaa4] mb-2">Subscription tier</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Free Trial", "Starter", "Growth", "Pro", "Enterprise"].map((pl) => (
                      <button
                        type="button"
                        key={pl}
                        onClick={() => setFilterPlan(pl)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border cursor-pointer",
                          filterPlan === pl
                            ? "bg-[#19201d] text-[#edf0ee] border-[#34d399]/35"
                            : "bg-[#0d1210] text-[#727c75] border-[#edf0ee]/[0.06] hover:text-[#edf0ee]"
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

      {/* Clients Table */}
      <div className={cn(CONSOLE_PANEL_FLUSH, "tabular-nums")}>
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#edf0ee]/[0.08] bg-[#0d1210] text-xs font-medium text-[#727c75]">
          <button
            type="button"
            onClick={() => handleSort("businessName")}
            className="col-span-4 flex items-center gap-1.5 hover:text-[#edf0ee] transition-colors text-left cursor-pointer"
          >
            Business & owner
            <SortIndicator col="businessName" />
          </button>
          <div className="col-span-2">Contact</div>
          <button
            type="button"
            onClick={() => handleSort("status")}
            className="col-span-2 flex items-center gap-1.5 hover:text-[#edf0ee] transition-colors text-left cursor-pointer"
          >
            Status & tier
            <SortIndicator col="status" />
          </button>
          <button
            type="button"
            onClick={() => handleSort("totalWorkflows")}
            className="col-span-1 flex items-center gap-1.5 hover:text-[#edf0ee] transition-colors text-left cursor-pointer"
          >
            Flows
            <SortIndicator col="totalWorkflows" />
          </button>
          <button
            type="button"
            onClick={() => handleSort("totalExecutions")}
            className="col-span-1 flex items-center gap-1.5 hover:text-[#edf0ee] transition-colors text-left cursor-pointer"
          >
            Runs
            <SortIndicator col="totalExecutions" />
          </button>
          <button
            type="button"
            onClick={() => handleSort("signupDate")}
            className="col-span-1 flex items-center gap-1.5 hover:text-[#edf0ee] transition-colors text-left cursor-pointer"
          >
            Joined
            <SortIndicator col="signupDate" />
          </button>
          <div className="col-span-1 text-right">Details</div>
        </div>

        <div className="divide-y divide-[#edf0ee]/[0.06]">
          {filteredClients.length === 0 ? (
            <div className="py-14 text-center">
              <Users className="w-8 h-8 text-[#727c75] mx-auto mb-2.5" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[#edf0ee]">No clients found</p>
              <p className="text-xs text-[#727c75] mt-1 max-w-sm mx-auto">
                No registered accounts match your active filters or search term
              </p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const badgeCls = STATUS_BADGE[client.status] || CONSOLE_BADGE_INFO;
              const dotCls = STATUS_DOT[client.status] || "bg-[#727c75]";

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-5 py-3.5 hover:bg-[#19201d]/60 cursor-pointer transition-colors duration-150 items-center"
                >
                  <div className="lg:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#edf0ee] font-medium text-sm flex-shrink-0">
                      {client.businessName ? client.businessName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#edf0ee] truncate">
                        {client.businessName}
                      </p>
                      <p className="text-xs text-[#727c75] truncate">
                        {client.ownerName} · {client.businessType}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 min-w-0">
                    <p className="text-xs text-[#a1aaa4] truncate">{client.email || "—"}</p>
                    <p className="text-[11px] font-mono text-[#727c75] truncate">
                      {client.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="lg:col-span-2 flex flex-wrap items-center gap-1.5">
                    <span className={badgeCls}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", dotCls)} />
                      {client.status}
                    </span>
                    <span className={CONSOLE_BADGE_MUTED}>{client.plan}</span>
                  </div>

                  <div className="lg:col-span-1 text-xs font-medium text-[#edf0ee]">
                    {client.totalWorkflows || 0}
                    <span className="text-[#727c75] lg:hidden ml-1 font-normal">flows</span>
                  </div>

                  <div className="lg:col-span-1 text-xs font-medium text-[#4cc38a]">
                    {(client.totalExecutions || 0).toLocaleString()}
                  </div>

                  <div className="lg:col-span-1 text-xs text-[#727c75]">
                    {client.signupDate || "—"}
                  </div>

                  <div className="lg:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                      }}
                      aria-label={`Inspect ${client.businessName}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" strokeWidth={1.65} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Breakdown Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={cn(CONSOLE_PANEL, "space-y-4")}>
          <div className="flex items-center justify-between">
            <h2 className={CONSOLE_SECTION_TITLE}>Plan tier breakdown</h2>
            <span className="text-xs text-[#727c75]">Active share</span>
          </div>

          <div className="space-y-3">
            {["Enterprise", "Pro", "Growth", "Starter", "Free Trial"].map((tier) => {
              const count = clients.filter((c) => {
                if (tier === "Pro") return c.plan === "Pro" || c.plan === "Professional";
                if (tier === "Free Trial") return c.plan === "Free Trial" || c.status === "Trial";
                return c.plan === tier;
              }).length;
              const pct = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;

              return (
                <div key={tier} className="space-y-1.5 tabular-nums">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a1aaa4] font-medium">{tier}</span>
                    <span className="text-[#edf0ee] font-medium">
                      {count} <span className="text-[#727c75] font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0d1210] rounded-full overflow-hidden border border-[#edf0ee]/[0.06]">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-[#34d399]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL, "space-y-4")}>
          <div className="flex items-center justify-between">
            <h2 className={CONSOLE_SECTION_TITLE}>Account status summary</h2>
            <span className="text-xs text-[#727c75]">Current roster</span>
          </div>

          <div className="grid grid-cols-2 gap-3 tabular-nums">
            {["Active", "Trial", "Inactive", "Churned"].map((st) => {
              const count = clients.filter((c) => c.status === st).length;
              const pct = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;

              return (
                <div key={st} className={cn(CONSOLE_SUBCARD, "p-3.5")}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[st] || "bg-[#727c75]")} />
                    <span className="text-xs font-medium text-[#a1aaa4]">{st}</span>
                  </div>
                  <p className="text-xl font-semibold text-[#edf0ee]">{count}</p>
                  <p className="text-[11px] text-[#727c75] mt-0.5">{pct}% of user base</p>
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
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { scale: 0.97, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={prefersReduced ? { opacity: 0 } : { scale: 0.97, y: 8, opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg rounded-2xl bg-[#0c100e] border border-[#edf0ee]/12 shadow-[0_24px_64px_rgba(0,0,0,0.75)] overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#edf0ee]/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#edf0ee] font-semibold text-base">
                    {selectedClient.businessName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#edf0ee]">
                      {selectedClient.businessName}
                    </h3>
                    <p className="text-xs text-[#727c75]">
                      {selectedClient.ownerName} · {selectedClient.businessType}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5 tabular-nums">
                <div className="grid grid-cols-2 gap-4 text-xs text-[#a1aaa4]">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#727c75]" />
                      <span className="truncate">{selectedClient.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#727c75]" />
                      <span>Joined {selectedClient.signupDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#727c75]" />
                      <span>Last active {selectedClient.lastActive}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#727c75]" />
                      <span>Role: {selectedClient.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          STATUS_DOT[selectedClient.status] || "bg-[#727c75]"
                        )}
                      />
                      <span>Status: {selectedClient.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={cn(CONSOLE_SUBCARD, "p-3.5 text-center")}>
                    <p className="text-xl font-semibold text-[#edf0ee]">
                      {selectedClient.totalWorkflows}
                    </p>
                    <p className="text-xs text-[#727c75] mt-0.5">Active workflows</p>
                  </div>
                  <div className={cn(CONSOLE_SUBCARD, "p-3.5 text-center")}>
                    <p className="text-xl font-semibold text-[#4cc38a]">
                      {selectedClient.totalExecutions.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#727c75] mt-0.5">Total executions</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#edf0ee]/[0.08] space-y-4">
                  <p className="text-xs font-medium text-[#a1aaa4]">Account controls</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#727c75] mb-1.5">Status</label>
                      <select
                        value={selectedClient.status}
                        onChange={(e) => {
                          const val = e.target.value;
                          onStatusChange(selectedClient.id, val);
                          setSelectedClient({ ...selectedClient, status: val });
                        }}
                        className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Trial">Trial</option>
                        <option value="Churned">Churned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#727c75] mb-1.5">Plan tier</label>
                      <select
                        value={selectedClient.plan}
                        onChange={(e) => {
                          const val = e.target.value;
                          onPlanChange(selectedClient.id, val);
                          setSelectedClient({ ...selectedClient, plan: val });
                        }}
                        className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                      >
                        <option value="Free Trial">Free Trial ($0/mo)</option>
                        <option value="Starter">Starter ($29/mo)</option>
                        <option value="Growth">Growth ($59/mo)</option>
                        <option value="Pro">Pro ($99/mo)</option>
                        <option value="Enterprise">Enterprise (Custom)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteClient(selectedClient.id);
                        setSelectedClient(null);
                      }}
                      className={CONSOLE_BTN_DANGER}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      className={CONSOLE_BTN_SECONDARY}
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
