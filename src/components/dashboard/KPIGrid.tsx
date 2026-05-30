import React from "react";
import { motion } from "motion/react";
import { Zap, Activity, Clock, DollarSign, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: string;
  delayIndex: number;
}

function KPICard({ icon, label, value, suffix, trend, delayIndex }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delayIndex * 0.08, ease: "easeOut" }}
      className="glass-panel glass-lift rounded-xl p-5 flex flex-col justify-between h-[115px] hover:border-emerald-500/10 transition-colors select-none"
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-500">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>{trend}</span>
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-2xl font-bold text-white tracking-tight leading-none">
          {value}
          {suffix && <span className="text-xs font-normal text-zinc-500 ml-1">{suffix}</span>}
        </p>
        <p className="text-[11px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}

export function KPIGrid() {
  const workflows = useAuthStore((s) => s.workflows);
  
  const totalExecutions = workflows.reduce((acc, wf) => acc + (wf.executionsCount || 0), 0);
  const totalHoursSaved = Number(workflows.reduce((acc, wf) => acc + (wf.savedHours || 0), 0).toFixed(1));
  const estimatedRevenue = Math.round(totalHoursSaved * 55);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        icon={<Zap className="w-4 h-4 text-emerald-400" />}
        label="Deployed Flows"
        value={workflows.length}
        delayIndex={0}
      />
      <KPICard
        icon={<Activity className="w-4 h-4 text-pink-400" />}
        label="Total Triage Runs"
        value={totalExecutions}
        trend="+18%"
        delayIndex={1}
      />
      <KPICard
        icon={<Clock className="w-4 h-4 text-blue-400" />}
        label="Hours Saved"
        value={totalHoursSaved}
        suffix="h"
        trend="+12%"
        delayIndex={2}
      />
      <KPICard
        icon={<DollarSign className="w-4 h-4 text-amber-400" />}
        label="Rev Protected"
        value={`$${estimatedRevenue.toLocaleString()}`}
        trend="+24%"
        delayIndex={3}
      />
    </div>
  );
}
