import React from "react";
import { WelcomeHeader } from "../../components/dashboard/WelcomeHeader";
import { SetupBanner } from "../../components/setup/SetupBanner";
import { SmartNudges } from "../../components/dashboard/SmartNudge";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { KPIGrid } from "../../components/dashboard/KPIGrid";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { ChannelHealth } from "../../components/dashboard/ChannelHealth";

interface OverviewSectionProps {
  onOpenIntegration: (key: string) => void;
}

export function OverviewSection({ onOpenIntegration }: OverviewSectionProps) {
  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      {/* Greeting and custom clock greeting */}
      <WelcomeHeader />

      {/* Incomplete setup banner alert */}
      <SetupBanner />

      {/* Dynamic Recommendation Banner */}
      <SmartNudges />

      {/* Shortcut Action Cards */}
      <QuickActions />

      {/* KPI Performance Gauges */}
      <KPIGrid />

      {/* Two-Column Activity & Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-1">
          <ChannelHealth onOpenIntegration={onOpenIntegration} />
        </div>
      </div>
    </div>
  );
}
