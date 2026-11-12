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
  GlassButton,
  GlassModal,
  GlassSkeleton,
  EmptyState,
  ErrorState,
  ResponsiveDataTable,
  type DataColumn,
} from "../../components/ui";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-blue-500/12 border-blue-500/30", text: "text-blue-300" },
  contacted: { bg: "bg-amber-500/12 border-amber-500/30", text: "text-amber-300" },
  qualified: { bg: "bg-emerald-500/12 border-emerald-500/30", text: "text-emerald-300" },
  converted: { bg: "bg-purple-500/12 border-purple-500/30", text: "text-purple-300" },
  lost: { bg: "bg-zinc-500/12 border-zinc-500/30", text: "text-zinc-300" },
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
          <div className="font-semibold text-white">{lead.name}</div>
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {lead.tags.map((t, idx) => (
                <span key={idx} className="text-[10px] bg-white/[0.06] text-zinc-300 px-1.5 py-0.5 rounded border border-white/10">
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
        <div className="space-y-0.5 text-zinc-300">
          {lead.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-zinc-400" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Mail className="w-3 h-3 text-zinc-500" />
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
        const color = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
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
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-[#07120e] capitalize ${color.bg} ${color.text}`}
          >
            <option value="new" className="bg-[#07120e] text-blue-300">New</option>
            <option value="contacted" className="bg-[#07120e] text-amber-300">Contacted</option>
            <option value="qualified" className="bg-[#07120e] text-emerald-300">Qualified</option>
            <option value="converted" className="bg-[#07120e] text-purple-300">Converted</option>
            <option value="lost" className="bg-[#07120e] text-zinc-300">Lost</option>
          </select>
        );
      },
    },
    {
      key: "score",
      header: "Lead Score",
      render: (lead) => (
        <div className="flex items-center gap-2 tabular-nums">
          <span className="font-bold text-white">{lead.score}/100</span>
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                lead.score >= 70 ? "bg-emerald-500" : lead.score >= 40 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, lead.score))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (lead) => <span className="text-zinc-400 capitalize">{lead.source.replace("_", " ")}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (lead) => (
        <button
          type="button"
          onClick={async () => {
            if (confirm(`Are you sure you want to remove ${lead.name}?`)) {
              const res = await deleteLead(lead.id);
              if (res.error) {
                pushToast({ title: "Delete failed", description: res.error, tone: "error" });
              } else {
                pushToast({ title: "Customer removed", tone: "info" });
              }
            }
          }}
          className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          aria-label={`Delete ${lead.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" />
            CRM & Customer Directory
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your leads, qualified contacts, and customer activity history.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <GlassButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            disabled={leads.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Customer
          </GlassButton>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search customers"
            placeholder="Search customers by name, phone, or email..."
            className="glass-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm sm:text-xs text-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "new", "contacted", "qualified", "converted", "lost"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-white/[0.05] text-zinc-300 hover:text-white border border-white/10"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* States: Error -> Loading -> Table / Empty */}
      {error ? (
        <ErrorState
          title="Could not sync CRM contacts"
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
              icon={<Users className="w-6 h-6 text-emerald-400" />}
              title="No customers found"
              description={
                searchQuery
                  ? "Try refining your search query or clearing status filters."
                  : "Add your first contact manually or import an existing CSV list to start."
              }
              actionLabel={searchQuery ? "Clear Filters" : "Add Customer"}
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
            const color = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{lead.name}</h3>
                    <p className="text-[11px] text-zinc-400 capitalize mt-0.5">
                      {lead.source.replace("_", " ")} · Score {lead.score}/100
                    </p>
                  </div>
                  <select
                    aria-label={`Status for ${lead.name}`}
                    value={lead.status}
                    onChange={(e) => updateLead(lead.id, { status: e.target.value as Lead["status"] })}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none bg-[#07120e] capitalize ${color.bg} ${color.text}`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {(lead.phone || lead.email) && (
                  <div className="space-y-1 text-xs text-zinc-300">
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400">
                    Lead score: <strong className="text-white">{lead.score}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${lead.name}?`)) {
                        deleteLead(lead.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-300 bg-red-500/10 border border-red-500/20"
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

      {/* Add Customer Modal (Liquid Glass Sheet) */}
      <GlassModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        title={
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Add New Customer</span>
          </span>
        }
        subtitle="Create a structured CRM contact linked to your automations."
      >
        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 mb-1.5 font-medium">Customer Full Name *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Klaus Schneider"
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-1.5 font-medium">Phone Number</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+49 170 1234567"
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="client@domain.de"
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-1.5 font-medium">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Lead["status"])}
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-white bg-[#07120e]"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 mb-1.5 font-medium">Initial Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 mb-1.5 font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="vip, salon, dental, high_intent"
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 mb-1.5 font-medium">Notes / Preferences</label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Prefers appointment mornings, interested in annual package."
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <GlassButton type="button" variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" isLoading={isSubmitting} loadingText="Saving...">
              Save Customer
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
