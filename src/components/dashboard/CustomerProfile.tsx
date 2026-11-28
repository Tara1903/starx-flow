import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Link2,
  GitMerge,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Instagram,
  Globe,
} from "lucide-react";
import { type ConversationThread } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import { crmFetch } from "../../lib/crm/crmApi";
import {
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

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
  whatsapp: <MessageCircle className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />,
  instagram: <Instagram className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />,
  email: <Mail className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />,
  web: <Globe className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />,
  sms: <Phone className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />,
};

export function CustomerProfile({ thread }: CustomerProfileProps) {
  const lead = thread.lead || {};
  const currentUser = useAuthStore((s) => s.user);

  const [identities, setIdentities] = useState<LinkedIdentity[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [leadStatus, setLeadStatus] = useState<string>(lead.status || "new");
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLeadStatus(lead.status || "new");
  }, [lead.status, thread.lead_id]);

  useEffect(() => {
    if (!thread.lead_id || !currentUser?.id) return;

    let isMounted = true;
    const fetchIdentitiesAndDuplicates = async () => {
      try {
        const res = await crmFetch<{ identities?: LinkedIdentity[]; duplicates?: DuplicateCandidate[] }>(
          `/api/crm/customers/identities?userId=${currentUser.id}&leadId=${thread.lead_id}`
        );
        if (res.ok && res.data && isMounted) {
          setIdentities(res.data.identities || []);
          setDuplicates(res.data.duplicates || []);
        }
      } catch {
        // Offline ignore
      }
    };

    fetchIdentitiesAndDuplicates();
    return () => {
      isMounted = false;
    };
  }, [thread.lead_id, currentUser?.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!thread.lead_id) return;
    const previous = leadStatus;
    setLeadStatus(newStatus);
    const res = await crmFetch(`/api/crm/leads/${thread.lead_id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      setLeadStatus(previous);
    }
  };

  const handleMerge = async (duplicateLeadId: string) => {
    if (!thread.lead_id || !currentUser?.id) return;
    setIsMerging(true);
    setMergeSuccess(null);

    try {
      const res = await crmFetch("/api/crm/customers/merge", {
        method: "POST",
        body: JSON.stringify({
          userId: currentUser.id,
          targetLeadId: thread.lead_id,
          sourceLeadId: duplicateLeadId,
          actorId: currentUser.id,
        }),
      });

      if (res.ok) {
        setMergeSuccess("Profiles merged");
        setDuplicates((prev) => prev.filter((d) => d.leadId !== duplicateLeadId));
        const identRes = await crmFetch<{ identities?: LinkedIdentity[] }>(
          `/api/crm/customers/identities?userId=${currentUser.id}&leadId=${thread.lead_id}`
        );
        if (identRes.ok && identRes.data) {
          setIdentities(identRes.data.identities || []);
        }
      }
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="w-[300px] border-l border-[#edf0ee]/[0.08] bg-[#0c100e] flex flex-col h-full flex-shrink-0 select-none tabular-nums">
      <div className="p-5 border-b border-[#edf0ee]/[0.08] flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] mb-3">
          <User className="w-5 h-5" strokeWidth={1.65} />
        </div>
        <h3 className="text-[#edf0ee] font-medium text-sm truncate w-full">
          {thread.customerName}
        </h3>
        <p className="text-[#727c75] text-xs mt-1 capitalize">
          Source: {lead.source || thread.channel}
        </p>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto console-scroll flex-1">
        <div className="space-y-2.5">
          <h4 className="text-xs font-medium text-[#727c75]">Contact details</h4>

          <div className="flex items-center gap-2.5 text-xs text-[#a1aaa4]">
            <Phone className="w-3.5 h-3.5 text-[#727c75] flex-shrink-0" strokeWidth={1.65} />
            <span className="truncate">{lead.phone || "No phone on record"}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#a1aaa4]">
            <Mail className="w-3.5 h-3.5 text-[#727c75] flex-shrink-0" strokeWidth={1.65} />
            <span className="truncate">{lead.email || "No email on record"}</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-[#edf0ee]/[0.06]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-[#727c75] flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" strokeWidth={1.65} />
              <span>Linked identities</span>
            </h4>
            <span className={CONSOLE_BADGE_MUTED}>{identities.length || 1} active</span>
          </div>

          <div className="space-y-2">
            {identities.length > 0 ? (
              identities.map((id) => (
                <div
                  key={id.id}
                  className={cn(CONSOLE_SUBCARD, "p-2.5 flex items-center justify-between text-xs")}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {CHANNEL_ICON_MAP[id.channel.toLowerCase()] || (
                      <Globe className="w-3.5 h-3.5 text-[#727c75]" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[#edf0ee] text-xs font-medium truncate capitalize">
                        {id.channel}
                      </p>
                      <p className="text-[#727c75] text-[11px] font-mono truncate">
                        {id.external_user_id}
                      </p>
                    </div>
                  </div>
                  <span className={CONSOLE_BADGE_LIVE}>Linked</span>
                </div>
              ))
            ) : (
              <div className={cn(CONSOLE_SUBCARD, "p-2.5 flex items-center gap-2 text-xs text-[#a1aaa4]")}>
                {CHANNEL_ICON_MAP[(thread.channel || "").toLowerCase()] || (
                  <Globe className="w-3.5 h-3.5 text-[#727c75]" />
                )}
                <span className="truncate">{thread.channel} (Primary)</span>
              </div>
            )}
          </div>
        </div>

        {duplicates.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-[#edf0ee]/[0.06]">
            <div className={CONSOLE_BADGE_WARN}>
              <AlertCircle className="w-3 h-3" />
              <span>Possible duplicate</span>
            </div>

            {duplicates.map((dup) => (
              <div
                key={dup.leadId}
                className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 text-xs text-amber-100"
              >
                <p className="font-medium truncate">{dup.name}</p>
                <p className="text-[11px] text-amber-300/80 font-mono mt-0.5">
                  {dup.matchReason.replace("_", " ")}: {dup.phone || dup.email}
                </p>
                <button
                  type="button"
                  onClick={() => handleMerge(dup.leadId)}
                  disabled={isMerging}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-amber-300 text-[#080a09] text-xs font-medium hover:bg-amber-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <GitMerge className="w-3 h-3" />
                  <span>{isMerging ? "Merging..." : "Merge profiles"}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {mergeSuccess && (
          <div className={CONSOLE_BADGE_LIVE}>
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{mergeSuccess}</span>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t border-[#edf0ee]/[0.06]">
          <h4 className="text-xs font-medium text-[#727c75]">Lead status</h4>
          <select
            value={leadStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={cn(CONSOLE_INPUT, "w-full text-xs px-3 py-2 cursor-pointer")}
          >
            <option value="new">New lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#edf0ee]/[0.06]">
          <h4 className="text-xs font-medium text-[#727c75]">Thread summary</h4>
          <div className={cn(CONSOLE_SUBCARD, "p-3 flex items-center justify-between text-xs")}>
            <span className="text-[#a1aaa4]">Messages</span>
            <span className="font-medium text-[#edf0ee]">{thread.messages?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
