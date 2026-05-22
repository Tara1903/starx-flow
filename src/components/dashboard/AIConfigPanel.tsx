import React, { useState, useEffect } from "react";
import { Settings, PenTool, Check, Brain, ChevronDown } from "lucide-react";
import { useAuthStore, type Workflow } from "../../store/authStore";
import { cn } from "../../lib/utils";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <span className="text-green-400">MessageCircle</span>,
  SMS:       <span className="text-blue-400">Phone</span>,
  Reviews:   <span className="text-amber-400">Star</span>,
  Instagram: <span className="text-pink-400">Instagram</span>,
  Web:       <span className="text-cyan-400">Globe</span>,
};

export function AIConfigPanel() {
  const workflows = useAuthStore((s) => s.workflows);
  const updatePrompt = useAuthStore((s) => s.updateWorkflowPrompt);
  const selectedId = useAuthStore((s) => s.selectedWorkflowId);

  const selected = workflows.find((w) => w.id === selectedId) || workflows[0];

  const [editPrompt, setEditPrompt] = useState(selected?.customPrompt || "");
  const [editTone, setEditTone] = useState<Workflow["aiTone"]>(selected?.aiTone || "Friendly");

  useEffect(() => {
    if (selected) {
      setEditPrompt(selected.customPrompt);
      setEditTone(selected.aiTone);
    }
  }, [selected?.id]);

  const handleSave = () => {
    if (selected) {
      updatePrompt(selected.id, editPrompt, editTone);
    }
  };

  if (!selected) {
    return (
      <div className="glass-card rounded-xl p-5 text-center text-xs text-zinc-500 select-none">
        No active workflows found to tune. Create a workflow first.
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {/* Active Node Selection */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Settings className="w-4 h-4 text-zinc-500" />
          <span>Active Agent Config</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Target Automation Node</label>
            <div className="flex items-center gap-3 bg-white/[0.01] rounded-lg p-3 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{selected.name}</span>
                <span className="text-[10px] text-zinc-500 block truncate mt-0.5">{selected.channel} Channel</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">AI Conversational Tone</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["Friendly", "Professional", "Casual", "Urgent"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEditTone(t)}
                  className={cn(
                    "text-[10px] font-bold py-2 rounded-lg border transition-all uppercase tracking-wider",
                    editTone === t
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.03)]"
                      : "bg-white/[0.01] border-white/5 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prompts Instructions */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
          <PenTool className="w-4 h-4 text-zinc-500" />
          <span>System Instructions</span>
        </h3>
        
        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          rows={6}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-300 outline-none focus:border-emerald-500/30 transition-colors resize-none font-mono leading-relaxed select-text"
          placeholder="E.g. You are a warm receptionist... Answer customer booking questions..."
        />
        
        <button
          onClick={handleSave}
          className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-500/20 text-xs font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
