"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { DemoLead } from "../../store/adminStore";

const LEAD_STATUS_CONFIG: Record<
  DemoLead["status"],
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  new: {
    label: "New",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-500/30",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/30",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-500",
    border: "border-purple-500/30",
  },
  completed: {
    label: "Completed",
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    dot: "bg-teal-500",
    border: "border-teal-500/30",
  },
  converted: {
    label: "Converted",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/30",
  },
  disqualified: {
    label: "Disqualified",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    dot: "bg-zinc-500",
    border: "border-zinc-500/30",
  },
};

interface AdminLeadsViewProps {
  leads: DemoLead[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (id: string, status: DemoLead["status"], notes?: string) => Promise<void>;
  onRefresh: () => void;
}

export function AdminLeadsView({
  leads,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onRefresh,
}: AdminLeadsViewProps) {
  const prefersReduced = useReducedMotion();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<DemoLead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.businessName?.toLowerCase().includes(q) ||
          l.fullName?.toLowerCase().includes(q) ||
          l.workEmail?.toLowerCase().includes(q) ||
          l.primaryNeed?.toLowerCase().includes(q) ||
          (l.phone && l.phone.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((l) => l.status === statusFilter);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads, searchQuery, statusFilter]);

  const handleQuickStatus = async (leadId: string, newStatus: DemoLead["status"]) => {
    setUpdatingId(leadId);
    try {
      await onStatusChange(leadId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const newCount = leads.filter((l) => l.status === "new").length;
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const scheduledCount = leads.filter((l) => l.status === "scheduled").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  const exportCSV = () => {
    const headers = [
      "Full Name,Work Email,Phone,Business Name,Type,Size,Primary Need,Preferred Contact,Status,Created At",
    ];
    const rows = filteredLeads.map(
      (l) =>
        `"${l.fullName}","${l.workEmail}","${l.phone || ""}","${l.businessName}","${l.businessType}","${l.businessSize}","${l.primaryNeed.replace(/"/g, '""')}","${l.preferredContact}","${l.status}","${l.createdAt}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starx-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Demo Inquiries & Pipeline
            {newCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 animate-pulse">
                {newCount} New
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Incoming high-intent demo requests, scheduled consultations, and conversion pipeline.
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

      {/* 4 Lead Pipeline Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-400">New Inquiries</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-white">{newCount}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Needs immediate follow-up</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-amber-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-amber-400">Contacted</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{contactedCount}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Awaiting schedule confirmation</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-purple-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-purple-400">Scheduled Demos</span>
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{scheduledCount}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Demo walkthrough locked in</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/25 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Converted Clients</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300">{convertedCount}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Won accounts this cycle</p>
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
              placeholder="Search leads by prospect, company, email, or need..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-emerald-500/15 focus:border-emerald-500/50 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Quick status pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 console-scroll">
            {["All", "new", "contacted", "scheduled", "completed", "converted", "disqualified"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border whitespace-nowrap",
                    statusFilter === st
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "bg-black/30 text-zinc-400 border-white/5 hover:text-white hover:border-emerald-500/20"
                  )}
                >
                  {st === "All" ? "All Leads" : LEAD_STATUS_CONFIG[st as DemoLead["status"]]?.label || st}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Leads Glass Table */}
      <div className="rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-emerald-500/15 bg-black/40 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          <div className="col-span-3">Prospect & Business</div>
          <div className="col-span-3">Contact & Channel</div>
          <div className="col-span-3">Automation Need</div>
          <div className="col-span-2">Pipeline Status</div>
          <div className="col-span-1 text-right">Details</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-emerald-500/10">
          {filteredLeads.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-white">No demo leads match</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No inquiries match your filter criteria or search keyword.
              </p>
            </div>
          ) : (
            filteredLeads.map((lead, index) => {
              const cfg = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.new;

              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReduced ? 0 : index * 0.02 }}
                  onClick={() => setSelectedLead(lead)}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 hover:bg-emerald-500/[0.04] cursor-pointer transition-colors duration-150 group items-center"
                >
                  {/* Prospect & Business */}
                  <div className="lg:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.15)] flex-shrink-0">
                      {lead.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {lead.fullName}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {lead.businessName} · <span className="text-zinc-500">{lead.businessType}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact & Channel */}
                  <div className="lg:col-span-3 min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{lead.workEmail}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                      {lead.phone && <span>{lead.phone}</span>}
                      <span className="capitalize">({lead.preferredContact})</span>
                    </div>
                  </div>

                  {/* Automation Need */}
                  <div className="lg:col-span-3 min-w-0">
                    <p className="text-xs text-zinc-300 line-clamp-2">{lead.primaryNeed}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Team: {lead.businessSize} · Submitted:{" "}
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div
                    className="lg:col-span-2 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) =>
                        handleQuickStatus(lead.id, e.target.value as DemoLead["status"])
                      }
                      className={cn(
                        "w-full text-xs font-semibold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer transition-all duration-150",
                        cfg.bg,
                        cfg.text,
                        cfg.border
                      )}
                    >
                      <option value="new">New Inquiry</option>
                      <option value="contacted">Contacted</option>
                      <option value="scheduled">Scheduled Demo</option>
                      <option value="completed">Completed Demo</option>
                      <option value="converted">Converted Client</option>
                      <option value="disqualified">Disqualified</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div className="lg:col-span-1 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
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

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedLead(null);
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
                    {selectedLead.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedLead.fullName}</h3>
                    <p className="text-xs text-zinc-400">
                      {selectedLead.businessName} · {selectedLead.businessType}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto console-scroll">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-4 h-4 text-emerald-400/70" />
                      <a
                        href={`mailto:${selectedLead.workEmail}`}
                        className="text-zinc-300 hover:text-emerald-400 transition-colors truncate"
                      >
                        {selectedLead.workEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300">{selectedLead.phone || "No phone given"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Building className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300">Team Size: {selectedLead.businessSize}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <MessageSquare className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300 capitalize">
                        Channel: {selectedLead.preferredContact}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-zinc-300">
                        {new Date(selectedLead.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedLead.website && (
                      <div className="flex items-center gap-2 text-xs">
                        <ExternalLink className="w-4 h-4 text-emerald-400/70" />
                        <a
                          href={selectedLead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline truncate"
                        >
                          {selectedLead.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Need */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/15">
                  <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Primary Automation Requirement
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    {selectedLead.primaryNeed}
                  </p>
                </div>

                {/* Notes if present */}
                {selectedLead.notes && (
                  <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/15">
                    <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Internal Notes
                    </h4>
                    <p className="text-xs text-zinc-300">{selectedLead.notes}</p>
                  </div>
                )}

                {/* Status Switcher */}
                <div className="pt-2 border-t border-emerald-500/15 space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Pipeline Progression
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "new",
                        "contacted",
                        "scheduled",
                        "completed",
                        "converted",
                        "disqualified",
                      ] as DemoLead["status"][]
                    ).map((st) => {
                      const cfg = LEAD_STATUS_CONFIG[st];
                      const isCur = selectedLead.status === st;

                      return (
                        <button
                          key={st}
                          onClick={() => {
                            handleQuickStatus(selectedLead.id, st);
                            setSelectedLead({ ...selectedLead, status: st });
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center justify-center gap-1.5",
                            isCur
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-emerald-500/40`
                              : "bg-black/30 text-zinc-400 border-white/5 hover:text-white hover:border-emerald-500/20"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </button>
                      );
                    })}
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
