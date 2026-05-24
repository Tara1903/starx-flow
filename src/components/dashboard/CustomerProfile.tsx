import React from "react";
import { User, Phone, Mail, MapPin, Briefcase, Activity } from "lucide-react";
import { type ConversationThread } from "../../store/dashboardStore";
import { supabase } from "../../lib/supabase";

interface CustomerProfileProps {
  thread: ConversationThread;
}

export function CustomerProfile({ thread }: CustomerProfileProps) {
  const lead = thread.lead || {};

  const handleStatusChange = async (newStatus: string) => {
    if (!thread.lead_id) return;
    // Optimistic update omitted for simplicity in this component,
    // relying on real-time subscription or a refetch if needed.
    await supabase.from("leads").update({ status: newStatus }).eq("id", thread.lead_id);
  };

  return (
    <div className="w-[300px] border-l border-white/5 bg-[#0a0a0a] flex flex-col h-full flex-shrink-0 select-none">
      <div className="p-5 border-b border-white/5 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-3">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-white font-bold text-sm truncate w-full">{thread.customerName}</h3>
        <p className="text-zinc-500 text-xs mt-1 capitalize">Source: {lead.source || thread.channel}</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto console-scroll">
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contact Info</h4>
          
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <Phone className="w-4 h-4 text-zinc-500" />
            <span className="truncate">{lead.phone || "No phone provided"}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <Mail className="w-4 h-4 text-zinc-500" />
            <span className="truncate">{lead.email || "No email provided"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lead Status</h4>
          
          <select
            value={lead.status || "new"}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-[#050505] border border-white/10 text-xs font-semibold text-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500/30 transition-all"
          >
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted (Customer)</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/5">
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
