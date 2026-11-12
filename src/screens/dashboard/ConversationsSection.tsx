import React from "react";
import { ConversationList } from "../../components/dashboard/ConversationList";
import { ConversationThread } from "../../components/dashboard/ConversationThread";
import { ConversationEmpty } from "../../components/dashboard/ConversationEmpty";
import { useDashboardStore } from "../../store/dashboardStore";

export function ConversationsSection() {
  const selectedConversationId = useDashboardStore((s) => s.selectedConversationId);

  return (
    <div className="glass-card-obsidian rounded-2xl border border-emerald-500/[0.12] overflow-hidden flex h-[600px] animate-[fade-in_0.4s_ease-out]">
      {/* Search and List */}
      <ConversationList />

      {/* Message Thread view or Empty placeholder */}
      {selectedConversationId ? (
        <ConversationThread />
      ) : (
        <div className="hidden md:flex flex-1 min-w-0">
          <ConversationEmpty />
        </div>
      )}
    </div>
  );
}
