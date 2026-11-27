"use client";

import React from "react";
import { Check, CheckCircle2, Users } from "lucide-react";
import {
  CONSOLE_PANEL,
  CONSOLE_PANEL_LG,
  CONSOLE_HEADING,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
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
  activePlanKey: string;
}

export function AdminPlansView({ clients }: AdminPlansViewProps) {
  const tiers: PlanTier[] = [
    {
      id: "free",
      name: CANONICAL_PLANS.free.name,
      price: `$${CANONICAL_PLANS.free.price}`,
      cadence: "14-day trial",
      badge: "Sandbox",
      description: CANONICAL_PLANS.free.description,
      features: CANONICAL_PLANS.free.features,
      activePlanKey: "free",
    },
    {
      id: "starter",
      name: CANONICAL_PLANS.starter.name,
      price: `$${CANONICAL_PLANS.starter.price}`,
      cadence: "per month",
      badge: "Solo practices",
      description: CANONICAL_PLANS.starter.description,
      features: CANONICAL_PLANS.starter.features,
      activePlanKey: "starter",
    },
    {
      id: "growth",
      name: CANONICAL_PLANS.growth.name,
      price: `$${CANONICAL_PLANS.growth.price}`,
      cadence: "per month",
      badge: "Most popular",
      popular: true,
      description: CANONICAL_PLANS.growth.description,
      features: CANONICAL_PLANS.growth.features,
      activePlanKey: "growth",
    },
    {
      id: "pro",
      name: CANONICAL_PLANS.pro.name,
      price: `$${CANONICAL_PLANS.pro.price}`,
      cadence: "per month",
      badge: "Multi-provider",
      description: CANONICAL_PLANS.pro.description,
      features: CANONICAL_PLANS.pro.features,
      activePlanKey: "pro",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      cadence: "annual contract",
      badge: "Custom SLA",
      description: "Dedicated infrastructure, private cluster nodes, and custom tuning.",
      features: [
        "Unlimited AI receptionists",
        "Dedicated isolated VPC nodes",
        "99.99% uptime SLA",
        "Dedicated technical account manager",
        "Custom fine-tuned agent models",
        "SOC2 & HIPAA compliant security",
      ],
      activePlanKey: "enterprise",
    },
  ];

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
    <div className="space-y-6 select-none tabular-nums">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={CONSOLE_HEADING}>Subscription plans</h1>
            <span className={CONSOLE_BADGE_MUTED}>{tiers.length} active tiers</span>
          </div>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Synced with Polar billing products and workspace tier limits
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Total clients</p>
          <p className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {clients.length}
          </p>
          <p className="text-xs text-[#727c75] mt-2">Across all tiers</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Monthly MRR</p>
          <p className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            ${actualMRR.toLocaleString()}
          </p>
          <p className="text-xs text-[#727c75] mt-2">${annualARR.toLocaleString()} ARR run-rate</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Paid subscriptions</p>
          <p className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {activePaidCount}
          </p>
          <p className="text-xs text-[#727c75] mt-2">{freeTrialCount} in 14-day trials</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Average ARPU</p>
          <p className="text-[28px] font-semibold text-[#4cc38a] tracking-[-0.02em] mt-2 leading-none">
            ${arpu}
          </p>
          <p className="text-xs text-[#727c75] mt-2">Per paid workspace</p>
        </div>
      </div>

      {/* Plan Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {tiers.map((tier) => {
          const subscriberCount = getTierCount(tier.activePlanKey);
          const percentAllocation =
            clients.length > 0 ? Math.round((subscriberCount / clients.length) * 100) : 0;

          return (
            <div
              key={tier.id}
              className={cn(
                CONSOLE_PANEL_LG,
                "flex flex-col justify-between transition-colors",
                tier.popular && "border-[#34d399]/35"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={tier.popular ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                    {tier.badge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#a1aaa4]">
                    <Users className="w-3.5 h-3.5 text-[#727c75]" strokeWidth={1.65} />
                    {subscriberCount} client{subscriberCount === 1 ? "" : "s"}
                  </span>
                </div>

                <h2 className="text-base font-semibold text-[#edf0ee]">{tier.name}</h2>
                <p className="text-xs text-[#727c75] mt-1 mb-4 leading-relaxed">
                  {tier.description}
                </p>

                <div className="flex items-baseline gap-1.5 pb-4 border-b border-[#edf0ee]/[0.08]">
                  <span className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em]">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#727c75]">/ {tier.cadence}</span>
                </div>

                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#727c75]">Client share</span>
                    <span className="text-[#edf0ee] font-medium">
                      {percentAllocation}% ({subscriberCount})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0d1210] border border-[#edf0ee]/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#34d399] rounded-full"
                      style={{ width: `${percentAllocation}%` }}
                    />
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-[#a1aaa4]">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#4cc38a] flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#edf0ee]/[0.08] flex items-center justify-between text-xs text-[#727c75]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.65} />
                  Polar billing synced
                </span>
                <span className="font-mono text-[11px]">{tier.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
