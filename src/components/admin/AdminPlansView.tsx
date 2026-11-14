"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CreditCard,
  Check,
  Zap,
  Users,
  Shield,
  ArrowUpRight,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Client } from "../../store/adminStore";

interface AdminPlansViewProps {
  clients: Client[];
}

interface PlanTier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  badge: string;
  popular?: boolean;
  description: string;
  features: string[];
  color: string;
  accentBorder: string;
  activePlanName: string;
}

export function AdminPlansView({ clients }: AdminPlansViewProps) {
  const prefersReduced = useReducedMotion();

  const tiers: PlanTier[] = [
    {
      id: "free-trial",
      name: "Free Trial",
      price: "$0",
      cadence: "14-day trial",
      badge: "Sandbox",
      description: "Full sandboxed access for evaluating StarX intelligent workflow automations.",
      features: [
        "1 active automated workflow",
        "500 task executions / mo",
        "Standard webhook latency",
        "Community support & docs",
        "Basic execution logging",
      ],
      color: "from-zinc-500/20 to-zinc-800/10",
      accentBorder: "border-zinc-500/30",
      activePlanName: "Free Trial",
    },
    {
      id: "starter",
      name: "Starter",
      price: "$99",
      cadence: "per month",
      badge: "Emerging Teams",
      description: "Essential autonomous agent flows for growing businesses and lean operators.",
      features: [
        "5 active automated workflows",
        "10,000 task executions / mo",
        "Real-time event webhooks",
        "Email support (24h SLA)",
        "30-day telemetry retention",
      ],
      color: "from-blue-500/20 to-blue-950/20",
      accentBorder: "border-blue-500/30",
      activePlanName: "Starter",
    },
    {
      id: "professional",
      name: "Professional",
      price: "$299",
      cadence: "per month",
      badge: "Most Popular",
      popular: true,
      description: "High-scale concurrent multi-agent automation with dedicated execution nodes.",
      features: [
        "Unlimited automated workflows",
        "100,000 task executions / mo",
        "Sub-second trigger response",
        "Priority 24/7 technical SLA",
        "Custom REST & Zapier webhooks",
        "90-day forensic audit logs",
      ],
      color: "from-emerald-500/25 to-teal-950/30",
      accentBorder: "border-emerald-500/50",
      activePlanName: "Professional",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      cadence: "annual billing",
      badge: "Mission Critical",
      description: "Dedicated VPC infrastructure, private cluster nodes, and custom LLM tuning.",
      features: [
        "Unlimited workflows & executions",
        "Dedicated isolated VPC nodes",
        "99.99% uptime guaranteed SLA",
        "Dedicated Technical Account Manager",
        "Custom fine-tuned agent models",
        "SOC2 & HIPAA compliant security",
      ],
      color: "from-amber-500/20 to-amber-950/20",
      accentBorder: "border-amber-500/40",
      activePlanName: "Enterprise",
    },
  ];

  // Calculate live subscriber counts
  const starterCount = clients.filter((c) => c.plan === "Starter").length;
  const proCount = clients.filter((c) => c.plan === "Professional").length;
  const enterpriseCount = clients.filter((c) => c.plan === "Enterprise").length;
  const trialCount = clients.filter((c) => c.plan === "Free Trial").length;

  // Approximate MRR
  const estimatedMRR = starterCount * 99 + proCount * 299 + enterpriseCount * 999;

  return (
    <div className="space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Subscription Tiers & Capacity
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              4 Tiers Active
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Configure pricing tiers, compute allocation, and monitor subscriber distribution.
          </p>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Total Subscribers</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{clients.length}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Across all 4 active tiers</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Monthly ARR</span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
              +14.2%
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-300">
            ${(estimatedMRR * 12).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Annualized platform revenue</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Avg Client LTV</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${clients.length > 0 ? Math.round((estimatedMRR * 18) / clients.length) : 0}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">18-month projected value</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Pro & Enterprise Share</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {clients.length > 0
              ? Math.round(((proCount + enterpriseCount) / clients.length) * 100)
              : 0}
            %
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">High-tier conversion mix</p>
        </div>
      </div>

      {/* 4 Plan Tier Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier, idx) => {
          const clientCount = clients.filter((c) => c.plan === tier.activePlanName).length;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReduced ? 0 : idx * 0.08 }}
              whileHover={prefersReduced ? {} : { y: -6, transition: { duration: 0.2 } }}
              className={cn(
                "relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300",
                "bg-[#08150f]/85 backdrop-blur-2xl border",
                tier.popular
                  ? "border-emerald-500/60 shadow-[0_20px_60px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.16)]"
                  : "border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-[10px] tracking-wide uppercase shadow-[0_4px_12px_rgba(16,185,129,0.4)]">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider uppercase",
                      tier.accentBorder,
                      tier.popular ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-zinc-400"
                    )}
                  >
                    {tier.badge}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {clientCount} {clientCount === 1 ? "client" : "clients"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-xs text-zinc-400 min-h-[36px] line-clamp-2 mb-4">
                  {tier.description}
                </p>

                <div className="flex items-baseline gap-1 mb-5 pb-5 border-b border-emerald-500/15">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-zinc-500">/{tier.cadence}</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Included Features
                  </p>
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Stat pill */}
              <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Active Share</span>
                <span className="font-semibold text-emerald-400">
                  {clients.length > 0 ? Math.round((clientCount / clients.length) * 100) : 0}% of
                  users
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
