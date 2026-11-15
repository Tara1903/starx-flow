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
  DollarSign,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Client } from "../../store/adminStore";
import { CANONICAL_PLANS, normalizePlanId } from "@/lib/plans";

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
  activePlanKey: string;
}

export function AdminPlansView({ clients }: AdminPlansViewProps) {
  const prefersReduced = useReducedMotion();

  const tiers: PlanTier[] = [
    {
      id: "free",
      name: CANONICAL_PLANS.free.name,
      price: `$${CANONICAL_PLANS.free.price}`,
      cadence: "14-day trial",
      badge: "Sandbox",
      description: CANONICAL_PLANS.free.description,
      features: CANONICAL_PLANS.free.features,
      color: "from-zinc-500/20 to-zinc-800/10",
      accentBorder: "border-zinc-500/30",
      activePlanKey: "free",
    },
    {
      id: "starter",
      name: CANONICAL_PLANS.starter.name,
      price: `$${CANONICAL_PLANS.starter.price}`,
      cadence: "per month",
      badge: "Solo Practices",
      description: CANONICAL_PLANS.starter.description,
      features: CANONICAL_PLANS.starter.features,
      color: "from-blue-500/20 to-blue-950/20",
      accentBorder: "border-blue-500/30",
      activePlanKey: "starter",
    },
    {
      id: "growth",
      name: CANONICAL_PLANS.growth.name,
      price: `$${CANONICAL_PLANS.growth.price}`,
      cadence: "per month",
      badge: "Most Popular",
      popular: true,
      description: CANONICAL_PLANS.growth.description,
      features: CANONICAL_PLANS.growth.features,
      color: "from-teal-500/25 to-emerald-950/30",
      accentBorder: "border-teal-500/50",
      activePlanKey: "growth",
    },
    {
      id: "pro",
      name: CANONICAL_PLANS.pro.name,
      price: `$${CANONICAL_PLANS.pro.price}`,
      cadence: "per month",
      badge: "Multi-Provider",
      description: CANONICAL_PLANS.pro.description,
      features: CANONICAL_PLANS.pro.features,
      color: "from-emerald-500/25 to-teal-950/30",
      accentBorder: "border-emerald-500/50",
      activePlanKey: "pro",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      cadence: "annual contract",
      badge: "Mission Critical",
      description: "Dedicated VPC infrastructure, private cluster nodes, and custom LLM tuning.",
      features: [
        "Unlimited AI Receptionists",
        "Dedicated isolated VPC nodes",
        "99.99% uptime guaranteed SLA",
        "Dedicated Technical Account Manager",
        "Custom fine-tuned agent models",
        "SOC2 & HIPAA compliant security",
      ],
      color: "from-amber-500/20 to-amber-950/20",
      accentBorder: "border-amber-500/40",
      activePlanKey: "enterprise",
    },
  ];

  // Calculate live subscriber counts matching canonical tiers
  const freeTrialCount = clients.filter(
    (c) => normalizePlanId(c.plan) === "free" || c.status?.toLowerCase() === "trial"
  ).length;

  const starterCount = clients.filter(
    (c) => normalizePlanId(c.plan) === "starter" && c.status?.toLowerCase() !== "trial"
  ).length;

  const growthCount = clients.filter(
    (c) => normalizePlanId(c.plan) === "growth" && c.status?.toLowerCase() !== "trial"
  ).length;

  const proCount = clients.filter(
    (c) => normalizePlanId(c.plan) === "pro" && c.status?.toLowerCase() !== "trial"
  ).length;

  const enterpriseCount = clients.filter(
    (c) => c.plan?.toLowerCase() === "enterprise" && c.status?.toLowerCase() !== "trial"
  ).length;

  // Real MRR calculated from active subscribers
  const actualMRR =
    starterCount * CANONICAL_PLANS.starter.price +
    growthCount * CANONICAL_PLANS.growth.price +
    proCount * CANONICAL_PLANS.pro.price +
    enterpriseCount * 299;

  const annualARR = actualMRR * 12;
  const activePaidCount = starterCount + growthCount + proCount + enterpriseCount;
  const arpu = activePaidCount > 0 ? Math.round(actualMRR / activePaidCount) : 0;

  const getTierCount = (tierKey: string) => {
    switch (tierKey) {
      case "free":
        return freeTrialCount;
      case "starter":
        return starterCount;
      case "growth":
        return growthCount;
      case "pro":
        return proCount;
      case "enterprise":
        return enterpriseCount;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Subscription Tiers &amp; Commercial Plans
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {tiers.length} Tiers Active
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Synchronized directly with the public website pricing, Polar billing products, and live client quotas.
          </p>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Total Clients</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{clients.length}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Across all platform tiers</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Monthly MRR</span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-mono">
              Live Real
            </span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">${actualMRR.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">${annualARR.toLocaleString()} ARR run-rate</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Active Paid Subscriptions</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{activePaidCount}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">{freeTrialCount} in sandbox trials</p>
        </div>

        <div className="p-4 rounded-xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-400">Average ARPU</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">${arpu}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Per active paid workspace</p>
        </div>
      </div>

      {/* Plan Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {tiers.map((tier) => {
          const subscriberCount = getTierCount(tier.activePlanKey);
          const percentAllocation =
            clients.length > 0 ? Math.round((subscriberCount / clients.length) * 100) : 0;

          return (
            <motion.div
              key={tier.id}
              whileHover={
                prefersReduced
                  ? undefined
                  : { y: -4, transition: { duration: 0.2, ease: "easeOut" } }
              }
              className={cn(
                "relative p-6 rounded-2xl bg-[#08150f]/80 backdrop-blur-2xl border flex flex-col justify-between select-none shadow-[0_16px_40px_rgba(0,0,0,0.6)]",
                tier.popular
                  ? "border-emerald-500/40 ring-1 ring-emerald-500/30"
                  : "border-emerald-500/20",
                "hover:border-emerald-500/50 transition-colors"
              )}
            >
              <div>
                {/* Header Badge & Name */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                      tier.popular
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/[0.04] text-zinc-400 border-white/10"
                    )}
                  >
                    {tier.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Users size={12} />
                    <span>{subscriberCount} Clients</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 mb-4 leading-relaxed">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 pb-4 border-b border-emerald-500/15">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">/ {tier.cadence}</span>
                </div>

                {/* Capacity Allocation Progress */}
                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Client Share</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {percentAllocation}% ({subscriberCount})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, percentAllocation)}%` }}
                    />
                  </div>
                </div>

                {/* Feature List */}
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Status footer */}
              <div className="mt-6 pt-4 border-t border-emerald-500/15 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  Live Sync Active
                </span>
                <span className="font-mono text-[11px] text-emerald-400/80 uppercase">
                  {tier.id}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
