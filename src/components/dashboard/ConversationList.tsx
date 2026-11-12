import React, { useState } from "react";
import { MessageCircle, Phone, Instagram, Globe, Mail, Search } from "lucide-react";
import { useDashboardStore, type ConversationThread } from "../../store/dashboardStore";
import { cn } from "../../lib/utils";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <MessageCircle className="w-3.5 h-3.5" />,
  SMS:       <Phone className="w-3.5 h-3.5" />,
  Instagram: <Instagram className="w-3.5 h-3.5 text-pink-400" />,
  Email:     <Mail className="w-3.5 h-3.5 text-indigo-400" />,
  Web:       <Globe className="w-3.5 h-3.5 text-amber-400" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400 bg-green-500/10 border-green-500/20",
  SMS:       "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Instagram: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  Email:     "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  Web:       "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export function ConversationList() {
  const conversations = useDashboardStore((s) => s.conversations);
  const selectedId = useDashboardStore((s) => s.selectedConversationId);
  const selectConversation = useDashboardStore((s) => s.selectConversation);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "WhatsApp" | "Instagram" | "SMS" | "Email" | "Web">("All");

  const filteredThreads = conversations.filter((thread) => {
    const matchesFilter = filter === "All" || thread.channel?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      (thread.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (thread.lastMessage || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: ConversationThread["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "needs_attention":
        return "bg-amber-500 animate-pulse";
      case "resolved":
        return "bg-zinc-600";
      default:
        return "bg-zinc-500";
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (priority === 'urgent') {
      return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">Urgent</span>;
    }
    if (priority === 'high') {
      return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">High</span>;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "w-full md:w-[320px] lg:w-[360px] border-r border-emerald-500/[0.08] bg-[#040a08]/75 flex-col h-full select-none flex-shrink-0",
        selectedId ? "hidden md:flex" : "flex"
      )}
    >
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="relative flex items-center bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="bg-transparent border-none text-xs text-zinc-300 outline-none w-full placeholder-zinc-500 ml-2"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1 bg-white/[0.01] border border-white/5 rounded-lg p-0.5 text-[9px] font-bold overflow-x-auto console-scroll">
          {(["All", "WhatsApp", "Instagram", "SMS", "Email", "Web"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "flex-1 min-w-[50px] py-1.5 px-1 rounded-md transition-all uppercase tracking-wider text-center",
                filter === opt
                  ? "bg-white/10 text-white font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scroll View */}
      <div className="flex-1 overflow-y-auto console-scroll divide-y divide-white/[0.02]">
        {filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 py-12">
            No threads match current filters.
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = selectedId === thread.id;
            const channelKey = thread.channel || 'WhatsApp';
            const icon = CHANNEL_ICON[channelKey] || <MessageCircle className="w-3.5 h-3.5" />;
            const colorClass = CHANNEL_COLOR[channelKey] || "text-zinc-400 bg-white/5 border-white/10";

            return (
              <div
                key={thread.id}
                onClick={() => selectConversation(thread.id)}
                className={cn(
                  "p-4 flex flex-col gap-2 cursor-pointer transition-all relative border-l-[3px]",
                  isSelected
                    ? "glass-focus !border-l-emerald-500 border-l-[3px]"
                    : "border-transparent hover:bg-white/[0.01] hover:border-white/5"
                )}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Status indicator dot */}
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", getStatusColor(thread.status))} />
                    
                    <span className={cn("text-xs font-bold truncate", thread.unread ? "text-white" : "text-zinc-300")}>
                      {thread.customerName}
                    </span>

                    {getPriorityBadge(thread.priority)}
                  </div>

                  {/* Timestamp and channel */}
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium flex-shrink-0">
                    <span>{thread.lastMessageAt}</span>
                    <span className={cn("px-1.5 py-0.5 rounded border text-[9px] flex items-center justify-center font-bold uppercase tracking-widest", colorClass)}>
                      {icon}
                    </span>
                  </div>
                </div>

                {/* Last message text preview */}
                <p className={cn(
                  "text-xs truncate leading-normal pr-4",
                  thread.unread ? "font-semibold text-zinc-200" : "text-zinc-500"
                )}>
                  {thread.lastMessage}
                </p>

                {/* Unread circle */}
                {thread.unread && (
                  <span className="absolute right-4 bottom-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
