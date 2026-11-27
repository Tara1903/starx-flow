import React from "react";
import { MessageSquare, Layers, Radio } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";
import { CONSOLE_BTN_PRIMARY, CONSOLE_BTN_SECONDARY } from "../../lib/consoleSurface";

export function ConversationEmpty() {
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#121715] h-full select-none">
      <div className="w-12 h-12 rounded-xl bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center mb-4 text-[#727c75]">
        <MessageSquare className="w-5 h-5" strokeWidth={1.65} />
      </div>

      <h2 className="text-sm font-medium text-[#edf0ee]">No conversation selected</h2>
      <p className="text-xs text-[#727c75] mt-1.5 max-w-[280px] leading-relaxed">
        Select a thread from the left list or wait for inbound messages from connected channels.
      </p>

      <div className="mt-5 flex flex-col xs:flex-row items-center gap-2.5">
        <button
          type="button"
          onClick={() => setActiveSection("workflows")}
          className={CONSOLE_BTN_PRIMARY}
        >
          <Layers className="w-3.5 h-3.5" strokeWidth={1.65} />
          <span>View workflows</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("channels")}
          className={CONSOLE_BTN_SECONDARY}
        >
          <Radio className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
          <span>Check channels</span>
        </button>
      </div>
    </div>
  );
}
