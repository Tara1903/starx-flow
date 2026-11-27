"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Phone,
  Mail,
} from "lucide-react";
import { useCrmStore } from "../../store/crmStore";
import { useToastStore } from "../../store/toastStore";
import { Lead } from "../../types/database";
import {
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import {
  GlassButton,
  GlassModal,
  GlassSkeleton,
  EmptyState,
  ErrorState,
  ResponsiveDataTable,
  type DataColumn,
} from "../../components/ui";
import { cn } from "../../lib/utils";

const STATUS_BADGES: Record<string, string> = {
  new: CONSOLE_BADGE_INFO,
  contacted: CONSOLE_BADGE_WARN,
  qualified: CONSOLE_BADGE_LIVE,
  converted: CONSOLE_BADGE_LIVE,
  lost: CONSOLE_BADGE_MUTED,
};

export function CrmSection() {
  const {
    leads,
    isLoading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    importLeads,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useCrmStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStatus, setNewStatus] = useState<Lead["status"]>("new");
  const [newScore, setNewScore] = useState(60);
  const [newNotes, setNewNotes] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchQuery === "" ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.phone && lead.phone.includes(searchQuery)) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await createLead({
      name: newName.trim(),
      phone: newPhone.trim() || null,
      email: newEmail.trim() || null,
      status: newStatus,
      source: "manual",
      score: Number(newScore),
      tags: tagsArray,
      notes: newNotes.trim() || null,
      last_contact_at: new Date().toISOString(),
    });

    setIsSubmitting(false);
    if (res.error) {
      pushToast({ title: "Could not save customer", description: res.error, tone: "error" });
      return;
    }

    pushToast({ title: "Customer added", description: `${newName.trim()} added to CRM.`, tone: "success" });
    setIsAddModalOpen(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewNotes("");
    setNewTags("");
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Name", "Phone", "Email", "Status", "Source", "Score", "Tags", "Notes", "Created At"];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      l.status,
      l.source,
      l.score,
      `"${(l.tags || []).join(", ")}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      l.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `starx_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast({ title: "CRM exported", description: `${leads.length} contacts saved to CSV.`, tone: "info" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsedLeads: Array<Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">> = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
        if (parts[0]) {
          parsedLeads.push({
            name: parts[0],
            phone: parts[1] || null,
            email: parts[2] || null,
            status: (parts[3] as Lead["status"]) || "new",
            source: "csv_import",
            score: 50,
            tags: ["csv_import"],
            notes: parts[7] || null,
            last_contact_at: new Date().toISOString(),
          });
        }
      }

      if (parsedLeads.length > 0) {
        const res = await importLeads(parsedLeads);
        if (res.error) {
          pushToast({ title: "Import failed", description: res.error, tone: "error" });
        } else {
          pushToast({ title: "CSV imported", description: `${res.imported} contacts added.`, tone: "success" });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const columns: DataColumn<Lead>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (lead) => (
        <div>
          <div className="font-medium text-[#edf0ee]">{lead.name}</div>
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {lead.tags.map((t, idx) => (
                <span key={idx} className={CONSOLE_BADGE_MUTED}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (lead) => (
        <div className="space-y-0.5 text-[#a1aaa4]">
          {lead.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#727c75]" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1.5 text-[#727c75]">
              <Mail className="w-3 h-3" />
              <span>{lead.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => {
        const badge = STATUS_BADGES[lead.status] || CONSOLE_BADGE_INFO;
        return (
          <select
            aria-label={`Status for ${lead.name}`}
            value={lead.status}
            onChange={async (e) => {
              const res = await updateLead(lead.id, { status: e.target.value as Lead["status"] });
              if (res.error) {
                pushToast({ title: "Status update failed", description: res.error, tone: "error" });
              }
            }}
            className={cn(CONSOLE_INPUT, badge, "px-2.5 py-1 capitalize cursor-pointer")}
          >
            <option value="new" className="bg-[#0c100e] text-[#edf0ee]">New</option>
            <option value="contacted" className="bg-[#0c100e] text-[#edf0ee]">Contacted</option>
            <option value="qualified" className="bg-[#0c100e] text-[#edf0ee]">Qualified</option>
            <option value="converted" className="bg-[#0c100e] text-[#edf0ee]">Converted</option>
            <option value="lost" className="bg-[#0c100e] text-[#edf0ee]">Lost</option>
          </select>
        );
      },
    },
    {
      key: "score",
      header: "Lead score",
      render: (lead) => (
        <div className="flex items-center gap-2 tabular-nums">
          <span className="font-medium text-[#edf0ee]">{lead.score}/100</span>
          <div className="w-16 h-1.5 bg-[#0d1210] border border-[#edf0ee]/[0.06] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                lead.score >= 70 ? "bg-[#34d399]" : lead.score >= 40 ? "bg-amber-400" : "bg-[#e5484d]"
              )}
              style={{ width: `${Math.min(100, Math.max(0, lead.score))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (lead) => <span className="text-[#727c75] capitalize">{lead.source.replace("_", " ")}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (lead) => (
        <button
          type="button"
          onClick={async () => {
            if (confirm(`Remove ${lead.name} from customer records?`)) {
              const res = await deleteLead(lead.id);
              if (res.error) {
                pushToast({ title: "Delete failed", description: res.error, tone: "error" });
              } else {
                pushToast({ title: "Customer removed", tone: "info" });
              }
            }
          }}
          className="p-2 rounded-lg text-[#727c75] hover:text-[#f28b8e] hover:bg-[#e5484d]/10 transition-colors cursor-pointer"
          aria-label={`Delete ${lead.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6 select-none tabular-nums">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={CONSOLE_HEADING}>Customer directory</h1>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Manage leads, qualified contacts, and customer records
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={CONSOLE_BTN_SECONDARY}
          >
            <Upload className="w-3.5 h-3.5 text-[#a1aaa4]" />
            <span>Import CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className={CONSOLE_BTN_SECONDARY}
          >
            <Download className="w-3.5 h-3.5 text-[#a1aaa4]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className={CONSOLE_BTN_PRIMARY}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#727c75] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search customers"
            placeholder="Search by name, phone, or email"
            className={cn(CONSOLE_INPUT, "w-full pl-9 pr-4 py-2 text-xs sm:text-sm")}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "new", "contacted", "qualified", "converted", "lost"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer border",
                statusFilter === st
                  ? "bg-[#19201d] text-[#edf0ee] border-[#34d399]/35"
                  : "bg-[#0c100e] text-[#727c75] border-[#edf0ee]/[0.06] hover:text-[#edf0ee]"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState
          title="Could not sync contacts"
          message={error}
          onRetry={() => fetchLeads()}
        />
      ) : isLoading ? (
        <GlassSkeleton variant="table-rows" count={5} />
      ) : (
        <ResponsiveDataTable
          data={filteredLeads}
          columns={columns}
          getRowKey={(l) => l.id}
          tableLabel="Customer directory"
          emptyState={
            <EmptyState
              icon={<Users className="w-5 h-5 text-[#727c75]" />}
              title="No customers found"
              description={
                searchQuery
                  ? "Try clearing your search term or status filter"
                  : "Add a contact manually or import a CSV list to begin"
              }
              actionLabel={searchQuery ? "Clear filters" : "Add Customer"}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery("");
                  setStatusFilter("all");
                } else {
                  setIsAddModalOpen(true);
                }
              }}
            />
          }
          renderMobileCard={(lead) => {
            const badge = STATUS_BADGES[lead.status] || CONSOLE_BADGE_INFO;
            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-[#edf0ee] text-sm truncate">{lead.name}</h3>
                    <p className="text-xs text-[#727c75] capitalize mt-0.5">
                      {lead.source.replace("_", " ")} · Score {lead.score}/100
                    </p>
                  </div>
                  <select
                    aria-label={`Status for ${lead.name}`}
                    value={lead.status}
                    onChange={(e) => updateLead(lead.id, { status: e.target.value as Lead["status"] })}
                    className={cn(CONSOLE_INPUT, badge, "px-2.5 py-1 capitalize cursor-pointer")}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {(lead.phone || lead.email) && (
                  <div className="space-y-1 text-xs text-[#a1aaa4]">
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#727c75]" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-1.5 text-[#727c75] truncate">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#edf0ee]/[0.06]">
                  <span className="text-xs text-[#727c75]">
                    Score: <strong className="text-[#edf0ee]">{lead.score}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove ${lead.name}?`)) {
                        deleteLead(lead.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-[#f28b8e] bg-[#e5484d]/10 border border-[#e5484d]/25"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          }}
        />
      )}

      <GlassModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        title={
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4 text-[#a1aaa4]" />
            <span>Add customer</span>
          </span>
        }
        subtitle="Create a CRM contact linked to your automations"
      >
        <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[#a1aaa4] mb-1.5 font-medium">Full name *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Klaus Schneider"
              className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs sm:text-sm")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#a1aaa4] mb-1.5 font-medium">Phone</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+49 170 1234567"
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs sm:text-sm")}
              />
            </div>
            <div>
              <label className="block text-[#a1aaa4] mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="client@domain.de"
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs sm:text-sm")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#a1aaa4] mb-1.5 font-medium">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Lead["status"])}
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs cursor-pointer")}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-[#a1aaa4] mb-1.5 font-medium">Score (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs tabular-nums")}
              />
            </div>
          </div>

          <div>
            <label className="block text-[#a1aaa4] mb-1.5 font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="vip, salon, dental"
              className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
            />
          </div>

          <div>
            <label className="block text-[#a1aaa4] mb-1.5 font-medium">Notes</label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Booking preferences and context"
              className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <GlassButton type="button" variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" isLoading={isSubmitting} loadingText="Saving...">
              Save customer
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
