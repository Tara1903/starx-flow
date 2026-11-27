"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Inbox,
  Search,
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
} from "lucide-react";
import {
  CONSOLE_PANEL,
  CONSOLE_PANEL_FLUSH,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import type { DemoLead } from "../../store/adminStore";

const LEAD_STATUS_CONFIG: Record<
  DemoLead["status"],
  { label: string; badge: string; dot: string }
> = {
  new: { label: "New", badge: CONSOLE_BADGE_INFO, dot: "bg-sky-400" },
  contacted: { label: "Contacted", badge: CONSOLE_BADGE_WARN, dot: "bg-amber-400" },
  scheduled: { label: "Scheduled", badge: CONSOLE_BADGE_INFO, dot: "bg-sky-400" },
  completed: { label: "Completed", badge: CONSOLE_BADGE_MUTED, dot: "bg-[#a1aaa4]" },
  converted: { label: "Converted", badge: CONSOLE_BADGE_LIVE, dot: "bg-[#4cc38a]" },
  disqualified: { label: "Disqualified", badge: CONSOLE_BADGE_MUTED, dot: "bg-[#727c75]" },
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
}: AdminLeadsViewProps) {
  const prefersReduced = useReducedMotion();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<DemoLead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    <div className="space-y-6 select-none tabular-nums">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={CONSOLE_HEADING}>Demo inquiries</h1>
            {newCount > 0 && <span className={CONSOLE_BADGE_LIVE}>{newCount} new</span>}
          </div>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Incoming demo requests, scheduled consultations, and conversion status
          </p>
        </div>

        <button type="button" onClick={exportCSV} className={CONSOLE_BTN_SECONDARY}>
          <Download className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 4 Pipeline Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#a1aaa4]">New inquiries</span>
            <Inbox className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <p className="text-2xl font-semibold text-[#edf0ee]">{newCount}</p>
          <p className="text-xs text-[#727c75] mt-1">Awaiting initial review</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#a1aaa4]">Contacted</span>
            <Clock className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <p className="text-2xl font-semibold text-[#edf0ee]">{contactedCount}</p>
          <p className="text-xs text-[#727c75] mt-1">Awaiting confirmation</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#a1aaa4]">Scheduled demos</span>
            <Calendar className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <p className="text-2xl font-semibold text-[#edf0ee]">{scheduledCount}</p>
          <p className="text-xs text-[#727c75] mt-1">Walkthroughs booked</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#a1aaa4]">Converted</span>
            <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" strokeWidth={1.65} />
          </div>
          <p className="text-2xl font-semibold text-[#4cc38a]">{convertedCount}</p>
          <p className="text-xs text-[#727c75] mt-1">Active converted accounts</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={cn(CONSOLE_PANEL, "p-4")}>
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
              placeholder="Search by prospect, business, or email"
              className={cn(CONSOLE_INPUT, "w-full pl-9 pr-4 py-2 text-sm")}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 console-scroll">
            {["All", "new", "contacted", "scheduled", "completed", "converted", "disqualified"].map(
              (st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border whitespace-nowrap cursor-pointer",
                    statusFilter === st
                      ? "bg-[#19201d] text-[#edf0ee] border-[#34d399]/35"
                      : "bg-[#0d1210] text-[#727c75] border-[#edf0ee]/[0.06] hover:text-[#edf0ee]"
                  )}
                >
                  {st === "All" ? "All leads" : LEAD_STATUS_CONFIG[st as DemoLead["status"]]?.label || st}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className={CONSOLE_PANEL_FLUSH}>
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#edf0ee]/[0.08] bg-[#0d1210] text-xs font-medium text-[#727c75]">
          <div className="col-span-3">Prospect & business</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-3">Automation need</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Details</div>
        </div>

        <div className="divide-y divide-[#edf0ee]/[0.06]">
          {filteredLeads.length === 0 ? (
            <div className="py-14 text-center">
              <Inbox className="w-8 h-8 text-[#727c75] mx-auto mb-2.5" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[#edf0ee]">No demo leads found</p>
              <p className="text-xs text-[#727c75] mt-1 max-w-sm mx-auto">
                No inquiries match your current status filter or search query
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const cfg = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.new;

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-5 py-3.5 hover:bg-[#19201d]/60 cursor-pointer transition-colors duration-150 items-center"
                >
                  <div className="lg:col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#edf0ee] font-medium text-sm flex-shrink-0">
                      {lead.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#edf0ee] truncate">
                        {lead.fullName}
                      </p>
                      <p className="text-xs text-[#727c75] truncate">
                        {lead.businessName} · {lead.businessType}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-3 min-w-0">
                    <p className="text-xs text-[#a1aaa4] truncate">{lead.workEmail}</p>
                    <p className="text-[11px] text-[#727c75] mt-0.5 truncate">
                      {lead.phone ? `${lead.phone} · ` : ""}
                      <span className="capitalize">{lead.preferredContact}</span>
                    </p>
                  </div>

                  <div className="lg:col-span-3 min-w-0">
                    <p className="text-xs text-[#a1aaa4] line-clamp-2">{lead.primaryNeed}</p>
                    <p className="text-[11px] text-[#727c75] mt-0.5">
                      Team {lead.businessSize} · {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="lg:col-span-2 flex items-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) =>
                        handleQuickStatus(lead.id, e.target.value as DemoLead["status"])
                      }
                      className={cn(CONSOLE_INPUT, "w-full text-xs font-medium px-2.5 py-1.5 cursor-pointer", cfg.badge)}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="converted">Converted</option>
                      <option value="disqualified">Disqualified</option>
                    </select>
                  </div>

                  <div className="lg:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                      }}
                      aria-label={`View ${lead.fullName}`}
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
                    {selectedLead.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#edf0ee]">{selectedLead.fullName}</h3>
                    <p className="text-xs text-[#727c75]">
                      {selectedLead.businessName} · {selectedLead.businessType}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto console-scroll">
                <div className="grid grid-cols-2 gap-4 text-xs text-[#a1aaa4]">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#727c75]" />
                      <a
                        href={`mailto:${selectedLead.workEmail}`}
                        className="hover:text-[#edf0ee] transition-colors truncate"
                      >
                        {selectedLead.workEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#727c75]" />
                      <span>{selectedLead.phone || "No phone listed"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#727c75]" />
                      <span>Team size: {selectedLead.businessSize}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#727c75]" />
                      <span className="capitalize">Channel: {selectedLead.preferredContact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#727c75]" />
                      <span>{new Date(selectedLead.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedLead.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-[#727c75]" />
                        <a
                          href={selectedLead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4cc38a] hover:underline truncate"
                        >
                          {selectedLead.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn(CONSOLE_SUBCARD, "p-4")}>
                  <p className="text-xs font-medium text-[#727c75] mb-1.5">
                    Primary requirement
                  </p>
                  <p className="text-xs sm:text-sm text-[#edf0ee] leading-relaxed">
                    {selectedLead.primaryNeed}
                  </p>
                </div>

                {selectedLead.notes && (
                  <div className={cn(CONSOLE_SUBCARD, "p-4")}>
                    <p className="text-xs font-medium text-[#727c75] mb-1.5">Internal notes</p>
                    <p className="text-xs text-[#a1aaa4]">{selectedLead.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#edf0ee]/[0.08] space-y-3">
                  <p className="text-xs font-medium text-[#a1aaa4]">Update stage</p>
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
                          type="button"
                          key={st}
                          onClick={() => {
                            handleQuickStatus(selectedLead.id, st);
                            setSelectedLead({ ...selectedLead, status: st });
                          }}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                            isCur
                              ? "bg-[#19201d] text-[#edf0ee] border-[#34d399]/40"
                              : "bg-[#0d1210] text-[#727c75] border-[#edf0ee]/[0.06] hover:text-[#edf0ee]"
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
