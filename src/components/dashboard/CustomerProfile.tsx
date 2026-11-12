import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Link2, GitMerge, AlertCircle, CheckCircle2, MessageCircle, Instagram, Globe } from "lucide-react";
import { type ConversationThread } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";

interface CustomerProfileProps {
  thread: ConversationThread;
}

interface LinkedIdentity {
  id: string;
  channel: string;
  external_user_id: string;
  verified_at?: string | null;
}

interface DuplicateCandidate {
  leadId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  matchReason: string;
  confidence: number;
}

const CHANNEL_ICON_MAP: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-3.5 h-3.5 text-green-400" />,
  instagram: <Instagram className="w-3.5 h-3.5 text-pink-400" />,
  email: <Mail className="w-3.5 h-3.5 text-indigo-400" />,
  web: <Globe className="w-3.5 h-3.5 text-amber-400" />,
  sms: <Phone className="w-3.5 h-3.5 text-blue-400" />,
};

export function CustomerProfile({ thread }: CustomerProfileProps) {
  const lead = thread.lead || {};
  const currentUser = useAuthStore((s) => s.user);

  const [identities, setIdentities] = useState<LinkedIdentity[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState<string | null>(null);

  // Fetch identities and potential duplicates when conversation changes
  useEffect(() => {
    if (!thread.lead_id || !currentUser?.id) return;

    let isMounted = true;
    const fetchIdentitiesAndDuplicates = async () => {
      try {
        const res = await fetch(`/api/crm/customers/identities?userId=${currentUser.id}&leadId=${thread.lead_id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIdentities(data.identities || []);
            setDuplicates(data.duplicates || []);
          }
        }
      } catch {
        // Silently ignore in offline mode
      }
    };

    fetchIdentitiesAndDuplicates();
    return () => { isMounted = false; };
  }, [thread.lead_id, currentUser?.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!thread.lead_id) return;
    await supabase.from("leads").update({ status: newStatus }).eq("id", thread.lead_id);
  };

  const handleMerge = async (duplicateLeadId: string) => {
    if (!thread.lead_id || !currentUser?.id) return;
    setIsMerging(true);
    setMergeSuccess(null);

    try {
      const res = await fetch('/api/crm/customers/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          targetLeadId: thread.lead_id,
          sourceLeadId: duplicateLeadId,
          actorId: currentUser.id,
        }),
      });

      if (res.ok) {
        setMergeSuccess("Merged successfully! Reloading identities...");
        setDuplicates((prev) => prev.filter((d) => d.leadId !== duplicateLeadId));
        // Refresh identities
        const identRes = await fetch(`/api/crm/customers/identities?userId=${currentUser.id}&leadId=${thread.lead_id}`);
        if (identRes.ok) {
          const identData = await identRes.json();
          setIdentities(identData.identities || []);
        }
      } else {
        const err = await res.json();
        alert(`Merge failed: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Merge error: ${err.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="w-[300px] border-l border-emerald-500/[0.08] bg-[#040a08]/75 flex flex-col h-full flex-shrink-0 select-none">
      <div className="p-5 border-b border-white/5 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-3">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-white font-bold text-sm truncate w-full">{thread.customerName}</h3>
        <p className="text-zinc-500 text-xs mt-1 capitalize">Source: {lead.source || thread.channel}</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto console-scroll flex-1">
        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contact Info</h4>
          
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <Phone className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span className="truncate">{lead.phone || "No phone provided"}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span className="truncate">{lead.email || "No email provided"}</span>
          </div>
        </div>

        {/* WS-03: Linked Omnichannel Identities */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3 h-3 text-emerald-400" />
              <span>Linked Identities</span>
            </h4>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {identities.length || 1} Active
            </span>
          </div>

          <div className="space-y-2">
            {identities.length > 0 ? (
              identities.map((id) => (
                <div key={id.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {CHANNEL_ICON_MAP[id.channel.toLowerCase()] || <Globe className="w-3.5 h-3.5 text-zinc-400" />}
                    <div className="min-w-0">
                      <p className="text-zinc-300 text-[11px] font-semibold truncate capitalize">{id.channel}</p>
                      <p className="text-zinc-500 text-[9px] font-mono truncate">{id.external_user_id}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-mono">Linked</span>
                </div>
              ))
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center gap-2 text-xs text-zinc-400">
                {CHANNEL_ICON_MAP[(thread.channel || '').toLowerCase()] || <Globe className="w-3.5 h-3.5 text-zinc-400" />}
                <span className="truncate">{thread.channel} (Primary)</span>
              </div>
            )}
          </div>
        </div>

        {/* Duplicate Review / Merge Candidates */}
        {duplicates.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <AlertCircle className="w-3 h-3" />
              <span>Duplicate Detected</span>
            </div>

            {duplicates.map((dup) => (
              <div key={dup.leadId} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-200">
                <p className="font-bold text-[11px] truncate">{dup.name}</p>
                <p className="text-[9px] text-amber-300/80 font-mono mt-0.5">{dup.matchReason.replace('_', ' ')}: {dup.phone || dup.email}</p>
                <button
                  onClick={() => handleMerge(dup.leadId)}
                  disabled={isMerging}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-amber-400 text-black text-[10px] font-bold hover:bg-amber-300 transition-colors disabled:opacity-50"
                >
                  <GitMerge className="w-3 h-3" />
                  <span>{isMerging ? "Merging..." : "Merge Profiles"}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {mergeSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-xs text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{mergeSuccess}</span>
          </div>
        )}

        {/* Lead Status */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lead Status</h4>
          
          <select
            value={lead.status || "new"}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="glass-input w-full text-xs font-semibold text-zinc-200 rounded-lg px-3 py-2.5"
          >
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted (Customer)</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Activity Context */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Activity Context</h4>
          
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total Interactions</span>
              <span className="text-xs font-bold text-white">{thread.messages?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
