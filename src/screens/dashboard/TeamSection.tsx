"use client";

import React, { useState, useEffect } from "react";
import { 
  Contact, Plus, Shield, User, Mail, MoreHorizontal, 
  Trash2, X, CheckCircle2, Loader2, AlertCircle 
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited";
  created_at: string;
}

export function TeamSection() {
  const user = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [user]);

  const loadMembers = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Query organization_members or profiles
      const { data } = await supabase
        .from("organization_members")
        .select(`
          id,
          role,
          created_at,
          user_id
        `);

      if (data && data.length > 0) {
        setMembers(
          data.map((m: any) => ({
            id: m.id,
            name: m.user_id === user.id ? user.name : "Team Member",
            email: m.user_id === user.id ? user.email : "team@starxflow.com",
            role: m.role || "member",
            status: "active",
            created_at: m.created_at,
          }))
        );
      } else {
        // Fallback to current authenticated user as Owner
        setMembers([
          {
            id: "owner-1",
            name: user.name || "Business Owner",
            email: user.email || "admin@starxflow.com",
            role: "owner",
            status: "active",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.warn("[TeamSection] Error loading team members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate invitation dispatch
    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "invited",
      created_at: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);
    setIsSubmitting(false);
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
  };

  const handleRemoveMember = (id: string) => {
    if (confirm("Are you sure you want to revoke access for this team member?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Contact className="w-6 h-6 text-emerald-400" />
            Team & Staff Management
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Manage staff seats, role permissions, and access controls across your organization.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m) => (
          <div
            key={m.id}
            className="glass-card-obsidian glass-lift border border-emerald-500/[0.12] hover:border-emerald-500/35 rounded-2xl p-6 relative group transition-all shadow-xl"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                  m.role === "owner"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : m.role === "admin"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                }`}
              >
                {m.role}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 font-bold text-base">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-sm truncate">{m.name}</h3>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-0.5 truncate">
                  <Mail className="w-3 h-3 flex-shrink-0 text-zinc-500" />
                  <span className="truncate">{m.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                {m.status === "active" ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Invitation Pending
                  </span>
                )}
              </span>

              {m.role !== "owner" && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Invite Member Prompt Card */}
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="glass-panel border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group min-h-[160px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-emerald-400 transition-colors">
            Invite a new team member
          </span>
        </button>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card-obsidian border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Contact className="w-5 h-5 text-emerald-400" />
                Invite Team Member
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Elena Weber"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="elena@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#181a1d] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none"
                >
                  <option value="member">Member (Can manage conversations and appointments)</option>
                  <option value="admin">Admin (Can tune AI agents and invite members)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
