import React from "react";
import { MessageCircle, Phone, Star, Instagram, Globe, Hash } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <MessageCircle className="w-4 h-4" />,
  SMS:       <Phone className="w-4 h-4" />,
  Reviews:   <Star className="w-4 h-4" />,
  Instagram: <Instagram className="w-4 h-4" />,
  Web:       <Globe className="w-4 h-4" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400 border-green-500/20 bg-green-500/5",
  SMS:       "text-blue-400 border-blue-500/20 bg-blue-500/5",
  Reviews:   "text-amber-400 border-amber-500/20 bg-amber-500/5",
  Instagram: "text-pink-400 border-pink-500/20 bg-pink-500/5",
  Web:       "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
};

const CHANNEL_TEXT_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400",
  SMS:       "text-blue-400",
  Reviews:   "text-amber-400",
  Instagram: "text-pink-400",
  Web:       "text-cyan-400",
};

export function ChannelDistribution() {
  const workflows = useAuthStore((s) => s.workflows) || [];
  const totalExecs = workflows.reduce((a, w) => a + w.executionsCount, 0);

  return (
    <div className="glass-card rounded-xl p-5 select-none h-full">
      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
        <Hash className="w-4.5 h-4.5 text-zinc-400" />
        <span>Channel Distribution</span>
      </h3>

      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-44 text-center">
          <p className="text-xs text-zinc-500 font-medium">No channel activity yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf) => {
            const pct = totalExecs > 0 ? Math.round((wf.executionsCount / totalExecs) * 100) : 0;
            return (
              <div key={wf.id} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0", CHANNEL_COLOR[wf.channel])}>
                      {CHANNEL_ICON[wf.channel]}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
                      {wf.channel}
                    </span>
                  </div>
                  <span className={cn("text-xs font-bold", CHANNEL_TEXT_COLOR[wf.channel])}>
                    {pct}%
                  </span>
                </div>
                
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      wf.channel === "WhatsApp" && "bg-gradient-to-r from-green-500 to-emerald-400",
                      wf.channel === "SMS" && "bg-gradient-to-r from-blue-500 to-indigo-400",
                      wf.channel === "Reviews" && "bg-gradient-to-r from-amber-500 to-yellow-400",
                      wf.channel === "Instagram" && "bg-gradient-to-r from-pink-500 to-rose-400",
                      wf.channel === "Web" && "bg-gradient-to-r from-cyan-500 to-blue-400"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
