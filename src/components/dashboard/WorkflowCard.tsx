import React from "react";
import { motion } from "motion/react";
import { 
  Zap, Play, Settings, MessageCircle, Phone, Star, Instagram, Globe, Loader2, ShieldCheck, Check
} from "lucide-react";
import { cn } from "../../lib/utils";
import { type Workflow } from "../../store/authStore";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <MessageCircle className="w-5 h-5" />,
  SMS:       <Phone className="w-5 h-5" />,
  Reviews:   <Star className="w-5 h-5" />,
  Instagram: <Instagram className="w-5 h-5" />,
  Web:       <Globe className="w-5 h-5" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400 border-green-500/20 bg-green-500/5",
  SMS:       "text-blue-400 border-blue-500/20 bg-blue-500/5",
  Reviews:   "text-amber-400 border-amber-500/20 bg-amber-500/5",
  Instagram: "text-pink-400 border-pink-500/20 bg-pink-500/5",
  Web:       "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
};

interface ToggleSwitchProps {
  active: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ active, onToggle }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={cn("toggle-track flex-shrink-0", active ? "active" : "inactive")}
      aria-label={active ? "Deactivate workflow" : "Activate workflow"}
    />
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
  onToggle: () => void;
  onSimulate: () => void;
  onConfigure: () => void;
  isSimulating: boolean;
}

export function WorkflowCard({ workflow, onToggle, onSimulate, onConfigure, isSimulating }: WorkflowCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-card rounded-xl p-5 transition-all duration-300 select-none",
        !workflow.isActive && "opacity-60"
      )}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border",
            CHANNEL_COLOR[workflow.channel]
          )}>
            {CHANNEL_ICON[workflow.channel]}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{workflow.name}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">{workflow.channel} · Tone: {workflow.aiTone}</p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <ToggleSwitch active={workflow.isActive} onToggle={onToggle} />
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2 h-8">
        {workflow.description}
      </p>

      {/* Performance KPI Widgets */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2 text-center">
          <p className="text-sm font-bold text-white leading-none">{workflow.executionsCount}</p>
          <p className="text-[9px] text-zinc-500 mt-1 font-semibold uppercase tracking-wider">Runs</p>
        </div>
        <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2 text-center">
          <p className="text-sm font-bold text-emerald-400 leading-none">{workflow.successRate}%</p>
          <p className="text-[9px] text-zinc-500 mt-1 font-semibold uppercase tracking-wider">Success</p>
        </div>
        <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2 text-center">
          <p className="text-sm font-bold text-white leading-none">{workflow.savedHours}h</p>
          <p className="text-[9px] text-zinc-500 mt-1 font-semibold uppercase tracking-wider">Saved</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex gap-2">
        <button
          onClick={onSimulate}
          disabled={!workflow.isActive || isSimulating}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg transition-all border",
            workflow.isActive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-white/5 text-zinc-500 border-white/5 cursor-not-allowed"
          )}
        >
          {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulating ? "Triage Run..." : "Test Run"}</span>
        </button>

        <button
          onClick={onConfigure}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-4 rounded-lg bg-white/5 text-zinc-400 hover:text-white border border-white/5 transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Tune</span>
        </button>
      </div>
    </motion.div>
  );
}
