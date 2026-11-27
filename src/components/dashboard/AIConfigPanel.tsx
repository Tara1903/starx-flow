import React, { useState, useEffect } from "react";
import { Settings, PenTool, Check, Brain } from "lucide-react";
import { useAuthStore, type Workflow } from "../../store/authStore";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

export function AIConfigPanel() {
  const workflows = useAuthStore((s) => s.workflows);
  const updatePrompt = useAuthStore((s) => s.updateWorkflowPrompt);
  const selectedId = useAuthStore((s) => s.selectedWorkflowId);

  const selected = workflows.find((w) => w.id === selectedId) || workflows[0];

  const [editPrompt, setEditPrompt] = useState(selected?.customPrompt || "");
  const [editTone, setEditTone] = useState<Workflow["aiTone"]>(selected?.aiTone || "Friendly");
  const [savedFlag, setSavedFlag] = useState(false);

  useEffect(() => {
    if (selected) {
      setEditPrompt(selected.customPrompt);
      setEditTone(selected.aiTone);
    }
  }, [selected?.id]);

  const handleSave = () => {
    if (selected) {
      updatePrompt(selected.id, editPrompt, editTone);
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 1800);
    }
  };

  if (!selected) {
    return (
      <div className={cn(CONSOLE_PANEL, "p-8 text-center text-xs text-[#727c75] select-none")}>
        No active workflows found to tune. Create a workflow first.
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <div className={CONSOLE_PANEL}>
        <h2 className={cn(CONSOLE_SECTION_TITLE, "mb-4 flex items-center gap-2")}>
          <Settings className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          <span>Agent configuration</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#727c75] mb-1.5">Target automation</label>
            <div className={cn(CONSOLE_SUBCARD, "flex items-center gap-3 p-3")}>
              <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center flex-shrink-0 text-[#a1aaa4]">
                <Brain className="w-4 h-4" strokeWidth={1.65} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-[#edf0ee] block truncate">
                  {selected.name}
                </span>
                <span className="text-[11px] text-[#727c75] block truncate mt-0.5">
                  {selected.channel} channel
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#727c75] mb-1.5">Response tone</label>
            <div className="grid grid-cols-4 gap-2">
              {(["Friendly", "Professional", "Casual", "Urgent"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setEditTone(t)}
                  className={cn(
                    "text-xs font-medium py-2 rounded-lg border transition-colors cursor-pointer",
                    editTone === t
                      ? "bg-[#19201d] border-[#34d399]/35 text-[#edf0ee]"
                      : "bg-[#0d1210] border-[#edf0ee]/[0.06] text-[#727c75] hover:text-[#edf0ee]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={CONSOLE_PANEL}>
        <h2 className={cn(CONSOLE_SECTION_TITLE, "mb-3 flex items-center gap-2")}>
          <PenTool className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          <span>System instructions</span>
        </h2>

        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          rows={6}
          className={cn(CONSOLE_INPUT, "w-full p-3.5 text-xs font-mono leading-relaxed resize-none select-text")}
          placeholder="Describe how your receptionist should greet customers, answer questions, and schedule bookings"
        />

        <button
          type="button"
          onClick={handleSave}
          className={cn(CONSOLE_BTN_PRIMARY, "mt-3 w-full py-2.5")}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{savedFlag ? "Saved" : "Save changes"}</span>
        </button>
      </div>
    </div>
  );
}
