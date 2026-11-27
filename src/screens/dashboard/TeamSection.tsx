"use client";

import React, { useState, useEffect } from "react";
import { Plus, Mail, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import {
  CONSOLE_PANEL,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_WARN,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

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
    try {
      const { data } = await supabase
        .from("organization_members")
        .select("id, role, created_at, user_id");

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
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isSubmitting) return;

    setIsSubmitting(true);
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
    if (confirm("Revoke workspace access for this team member?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={CONSOLE_HEADING}>Team management</h1>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Manage operator seats, role permissions, and organization access
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className={CONSOLE_BTN_PRIMARY}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div key={m.id} className={cn(CONSOLE_PANEL, "relative flex flex-col justify-between")}>
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#edf0ee] font-medium text-sm flex-shrink-0">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-medium text-[#edf0ee] truncate">{m.name}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#727c75] mt-0.5 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" strokeWidth={1.65} />
                      <span className="truncate">{m.email}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={cn(
                    m.role === "owner"
                      ? CONSOLE_BADGE_LIVE
                      : m.role === "admin"
                        ? CONSOLE_BADGE_INFO
                        : CONSOLE_BADGE_MUTED,
                    "capitalize"
                  )}
                >
                  {m.role}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#edf0ee]/[0.06] flex items-center justify-between text-xs">
              {m.status === "active" ? (
                <span className="text-[#4cc38a] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cc38a]" />
                  Active
                </span>
              ) : (
                <span className={CONSOLE_BADGE_WARN}>Invitation pending</span>
              )}

              {m.role !== "owner" && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-1.5 rounded-md text-[#727c75] hover:text-[#f28b8e] hover:bg-[#e5484d]/10 transition-colors cursor-pointer"
                  title="Remove member"
                  aria-label="Remove member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="rounded-2xl border border-dashed border-[#edf0ee]/14 bg-[#0c100e] p-6 flex flex-col items-center justify-center gap-2.5 hover:border-[#34d399]/35 hover:bg-[#121715] transition-colors cursor-pointer min-h-[144px]"
        >
          <div className="w-9 h-9 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4]">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-[#a1aaa4]">Invite team member</span>
        </button>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-[#0c100e] border border-[#edf0ee]/12 max-w-md w-full p-6 shadow-[0_24px_64px_rgba(0,0,0,0.75)] space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
              <h3 className="text-[#edf0ee] font-semibold text-sm">Invite team member</h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                aria-label="Close modal"
                className="text-[#727c75] hover:text-[#edf0ee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[#a1aaa4] mb-1">Full name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Elena Weber"
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              <div>
                <label className="block text-[#a1aaa4] mb-1">Email address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="elena@company.com"
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              <div>
                <label className="block text-[#a1aaa4] mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                >
                  <option value="member">Member (Conversations and bookings)</option>
                  <option value="admin">Admin (Workflows, agents, and invites)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={CONSOLE_BTN_PRIMARY}>
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
