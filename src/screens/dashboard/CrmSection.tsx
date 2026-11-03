"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Users, Search, Plus, Filter, Download, Upload, Trash2, 
  Phone, Mail, Tag, Star, ChevronDown, CheckCircle2, AlertCircle, X, Loader2
} from "lucide-react";
import { useCrmStore } from "../../store/crmStore";
import { Lead } from "../../types/database";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
  contacted: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  qualified: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
  converted: { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400" },
  lost: { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-400" },
};

export function CrmSection() {
  const { 
    leads, isLoading, fetchLeads, createLead, updateLead, deleteLead, importLeads,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter 
  } = useCrmStore();

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

    await createLead({
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
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
        if (parts[0]) {
          parsedLeads.push({
            name: parts[0],
            phone: parts[1] || null,
            email: parts[2] || null,
            status: (parts[3] as any) || "new",
            source: "csv_import",
            score: 50,
            tags: ["csv_import"],
            notes: parts[7] || null,
            last_contact_at: new Date().toISOString(),
          });
        }
      }

      if (parsedLeads.length > 0) {
        await importLeads(parsedLeads);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-2 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, phone, or email..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "new", "contacted", "qualified", "converted", "lost"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Lead Score</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLeads.map((lead) => {
                const color = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
                return (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{lead.name}</div>
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {lead.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="space-y-0.5">
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Phone className="w-3 h-3 text-zinc-500" />
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
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLead(lead.id, { status: e.target.value as any })}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-transparent capitalize ${color.bg} ${color.text}`}
                      >
                        <option value="new" className="bg-[#111] text-blue-400">New</option>
                        <option value="contacted" className="bg-[#111] text-amber-400">Contacted</option>
                        <option value="qualified" className="bg-[#111] text-emerald-400">Qualified</option>
                        <option value="converted" className="bg-[#111] text-purple-400">Converted</option>
                        <option value="lost" className="bg-[#111] text-zinc-400">Lost</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
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
                    </td>
                    <td className="px-6 py-4 text-zinc-400 capitalize">
                      {lead.source.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${lead.name}?`)) {
                            deleteLead(lead.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-3 text-emerald-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">No customers found</h3>
                    <p className="text-zinc-500 text-xs">
                      {searchQuery ? "Try refining your search terms." : "Click 'Add Customer' or import a CSV file to begin."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101214] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Add New Customer
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Klaus Schneider"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@domain.de"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#181a1d] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Initial Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="vip, salon, dental, high_intent"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Notes / Preferences</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Prefers appointment mornings, interested in annual package."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
