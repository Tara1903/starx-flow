import React from "react";
import { MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";

export function ConversationEmpty() {
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#050505] h-full select-none animate-[fade-in-up_0.4s_ease-out]">
      <div className="glass-panel w-full h-full rounded-2xl flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4 relative">
          <MessageSquare className="w-7 h-7 text-zinc-600" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Awaiting Direct Messages</h3>
      
      <p className="text-xs text-zinc-500 mt-2 max-w-[280px] leading-relaxed">
        Your unified communication inbox is empty. Once a customer messages your WhatsApp, SMS, or Instagram channels, they will appear here.
      </p>

      <div className="mt-6 flex flex-col xs:flex-row items-center gap-3">
        <button
          onClick={() => setActiveSection("workflows")}
          className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-5 rounded-full transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate Test Call</span>
        </button>
        
        <button
          onClick={() => setActiveSection("channels")}
          className="flex items-center gap-1.5 text-xs font-semibold py-2.5 px-4 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
          <span>Check Channels</span>
        </button>
      </div>
      </div>
    </div>
  );
}
