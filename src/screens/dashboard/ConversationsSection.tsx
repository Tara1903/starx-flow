import React from "react";
import { ConversationList } from "../../components/dashboard/ConversationList";
import { ConversationThread } from "../../components/dashboard/ConversationThread";
import { ConversationEmpty } from "../../components/dashboard/ConversationEmpty";
import { useDashboardStore } from "../../store/dashboardStore";
import { CONSOLE_PANEL_FLUSH } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

export function ConversationsSection() {
  const selectedConversationId = useDashboardStore((s) => s.selectedConversationId);

  return (
    <div className={cn(CONSOLE_PANEL_FLUSH, "flex h-[620px]")}>
      <ConversationList />

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
