import React from "react";
import { ConversationList } from "../../components/dashboard/ConversationList";
import { ConversationThread } from "../../components/dashboard/ConversationThread";
import { ConversationEmpty } from "../../components/dashboard/ConversationEmpty";
import { useDashboardStore } from "../../store/dashboardStore";

export function ConversationsSection() {
  const selectedConversationId = useDashboardStore((s) => s.selectedConversationId);

  return (
    <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex h-[600px] animate-[fade-in_0.4s_ease-out]">
      {/* Search and List */}
      <ConversationList />

      {/* Message Thread view or Empty placeholder */}
      {selectedConversationId ? (
        <ConversationThread />
      ) : (
        <ConversationEmpty />
      )}
    </div>
  );
}
