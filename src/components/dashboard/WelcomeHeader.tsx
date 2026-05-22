import React from "react";
import { Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function WelcomeHeader() {
  const user = useAuthStore((s) => s.user);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Operational Hub</span>
        </div>
        
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 sm:text-3xl">
          {getGreeting()}, <span className="text-gradient-green">{user?.name || "Partner"}</span>
        </h1>
        
        <p className="text-xs text-zinc-500 mt-1 max-w-[460px]">
          Managing automations for <span className="text-zinc-300 font-semibold">{user?.businessName || "My Business"}</span>
          {user?.businessType ? ` (${user.businessType})` : ""}. All communication channels are operational.
        </p>
      </div>

      {/* Security Status Box */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 shadow-sm max-w-xs md:self-center">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">AI Agent Shield</p>
          <p className="text-[10px] text-zinc-500">Security & credentials 100% active</p>
        </div>
      </div>
    </div>
  );
}
