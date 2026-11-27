import React, { useState } from "react";
import { MessageCircle, Phone, Instagram, Globe, Mail, Search } from "lucide-react";
import { useDashboardStore, type ConversationThread } from "../../store/dashboardStore";
import {
  CONSOLE_INPUT,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_DANGER,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp: <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.65} />,
  SMS: <Phone className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Instagram: <Instagram className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Email: <Mail className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Web: <Globe className="w-3.5 h-3.5" strokeWidth={1.65} />,
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
      (thread.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (thread.lastMessage || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: ConversationThread["status"]) => {
    switch (status) {
      case "active":
        return "bg-[#4cc38a]";
      case "needs_attention":
        return "bg-amber-400";
      case "resolved":
        return "bg-[#727c75]";
      default:
        return "bg-[#727c75]";
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (priority === "urgent") {
      return <span className={cn(CONSOLE_BADGE_DANGER, "text-[10px] px-1.5 py-0")}>Urgent</span>;
    }
    if (priority === "high") {
      return <span className={cn(CONSOLE_BADGE_WARN, "text-[10px] px-1.5 py-0")}>High</span>;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "w-full md:w-[320px] lg:w-[350px] border-r border-[#edf0ee]/[0.08] bg-[#0c100e] flex-col h-full select-none flex-shrink-0",
        selectedId ? "hidden md:flex" : "flex"
      )}
    >
      <div className="p-3.5 border-b border-[#edf0ee]/[0.08] space-y-2.5">
        <div className="relative flex items-center">
          <Search
            className="w-3.5 h-3.5 text-[#727c75] absolute left-3 pointer-events-none"
            strokeWidth={1.65}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className={cn(CONSOLE_INPUT, "w-full h-9 pl-9 pr-3 text-xs")}
          />
        </div>

        <div className="grid grid-cols-3 gap-1 bg-[#080a09] border border-[#edf0ee]/[0.06] rounded-lg p-1 text-[11px]">
          {(["All", "WhatsApp", "Instagram", "SMS", "Email", "Web"] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "py-1 px-2 rounded-md font-medium transition-colors text-center cursor-pointer truncate",
                filter === opt
                  ? "bg-[#19201d] text-[#edf0ee]"
                  : "text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto console-scroll divide-y divide-[#edf0ee]/[0.06]">
        {filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#727c75]">
            No conversations match your filter
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = selectedId === thread.id;
            const channelKey = thread.channel || "WhatsApp";
            const icon = CHANNEL_ICON[channelKey] || <MessageCircle className="w-3.5 h-3.5" />;

            return (
              <div
                key={thread.id}
                onClick={() => selectConversation(thread.id)}
                className={cn(
                  "px-4 py-3.5 flex flex-col gap-1.5 cursor-pointer transition-colors relative border-l-2",
                  isSelected
                    ? "bg-[#19201d] border-l-[#34d399]"
                    : "border-transparent hover:bg-[#121715]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        getStatusColor(thread.status)
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs truncate",
                        thread.unread ? "font-semibold text-[#edf0ee]" : "font-medium text-[#a1aaa4]"
                      )}
                    >
                      {thread.customerName}
                    </span>
                    {getPriorityBadge(thread.priority)}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#727c75] flex-shrink-0">
                    <span className="font-mono">{thread.lastMessageAt}</span>
                    <span className={cn(CONSOLE_BADGE_MUTED, "px-1.5 py-0.5")}>{icon}</span>
                  </div>
                </div>

                <p
                  className={cn(
                    "text-xs truncate pr-4",
                    thread.unread ? "text-[#edf0ee]" : "text-[#727c75]"
                  )}
                >
                  {thread.lastMessage}
                </p>

                {thread.unread && (
                  <span className="absolute right-4 bottom-4 w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
