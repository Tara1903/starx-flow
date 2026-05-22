import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Flame, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { cn } from '../../lib/utils';

interface ReadinessScoreProps {
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
  className?: string;
}

export function ReadinessScore({
  size = 120,
  strokeWidth = 8,
  showDetails = true,
  className
}: ReadinessScoreProps) {
  const { user, connectedChannels } = useAuthStore();
  const { aiConfig, testResults } = useOnboardingStore();

  // Dynamic score logic mirroring calculate_readiness RPC
  let score = 0;
  
  // 1. Profile complete: +15
  const isProfileComplete = user?.businessName && user.businessName !== 'My Business' && user.name !== 'Owner';
  if (isProfileComplete) score += 15;

  // 2. Connected channels: +20 each (max 60)
  const activeChannelsCount = connectedChannels.filter(c => c.isConnected).length;
  score += Math.min(activeChannelsCount * 20, 60);

  // 3. AI Brain configured: +15
  const isAIConfigured = !!aiConfig.businessName;
  if (isAIConfigured) score += 15;

  // 4. Test run completed: +10
  const isTestCompleted = testResults.whatsapp || testResults.instagram || testResults.sms;
  if (isTestCompleted) score += 10;

  score = Math.min(score, 100);

  // Circle SVG metrics
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  // Status mapping
  const getStatusText = (s: number) => {
    if (s === 100) return { label: 'Fully Configured', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (s >= 70) return { label: 'Nearly Ready', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    if (s >= 40) return { label: 'Brain Active', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'Incomplete Setup', color: 'text-zinc-500', bg: 'bg-zinc-800/20', border: 'border-zinc-700/20' };
  };

  const status = getStatusText(score);

  return (
    <div className={cn("glass-card rounded-2xl p-6 border border-white/[0.06] bg-[#090909]/60 backdrop-blur-md relative overflow-hidden", className)}>
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Gauge Visualization */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-zinc-900"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Highlight gradient */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
              <span className="text-3xl font-black text-white tracking-tight leading-none">{score}%</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Ready</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Deployment Score</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
              This score calculates the activation status of your automated communication command center.
            </p>
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full border text-[10px] font-extrabold uppercase tracking-wide", status.color, status.bg, status.border)}>
              <Flame className="w-3 h-3" />
              <span>{status.label}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Metrics breakdown list */}
      {showDetails && (
        <div className="mt-6 pt-5 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Profile milestone */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.02] bg-white/[0.01]">
            <span className="text-xs text-zinc-400">Business Profile (+15%)</span>
            {isProfileComplete ? (
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-zinc-600" />
            )}
          </div>

          {/* Active channels milestone */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.02] bg-white/[0.01]">
            <span className="text-xs text-zinc-400">Channels Link (+20% each, max 60%)</span>
            <span className="text-xs font-bold text-zinc-300">
              {activeChannelsCount}/3 connected
            </span>
          </div>

          {/* AI configured milestone */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.02] bg-white/[0.01]">
            <span className="text-xs text-zinc-400">AI Prompt Configured (+15%)</span>
            {isAIConfigured ? (
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-zinc-600" />
            )}
          </div>

          {/* Sandbox checked milestone */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.02] bg-white/[0.01]">
            <span className="text-xs text-zinc-400">Assistant Live-Tested (+10%)</span>
            {isTestCompleted ? (
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-zinc-600" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
