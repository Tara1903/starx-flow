"use client";

import React, { useEffect } from "react";
import { WelcomeHeader } from "../../components/dashboard/WelcomeHeader";
import { DashboardNotifications } from "../../components/dashboard/DashboardNotifications";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { KPIGrid } from "../../components/dashboard/KPIGrid";
import { ExecutionChart } from "../../components/dashboard/ExecutionChart";
import { ChannelDistribution } from "../../components/dashboard/ChannelDistribution";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { ChannelHealth } from "../../components/dashboard/ChannelHealth";
import { useAuthStore } from "../../store/authStore";
import { useCrmStore } from "../../store/crmStore";

interface OverviewSectionProps {
  onOpenIntegration: (key: string) => void;
  onNewWorkflowClick?: () => void;
}

export function OverviewSection({
  onOpenIntegration,
  onNewWorkflowClick,
}: OverviewSectionProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const fetchLeads = useCrmStore((s) => s.fetchLeads);
  const fetchSequences = useCrmStore((s) => s.fetchSequences);

  useEffect(() => {
    if (userId) {
      void fetchLeads();
      void fetchSequences();
    }
  }, [userId, fetchLeads, fetchSequences]);

  return (
    <div className="space-y-6">
      {/* Workspace context header & quick shortcuts */}
      <WelcomeHeader />

      {/* Actionable workspace setup & status strip */}
      <DashboardNotifications />

      {/* 4 Compact Stat Cards (Real metrics only) */}
      <KPIGrid />

      {/* Focal 8:4 Telemetry Row: Weekly Executions + Channel Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8">
          <ExecutionChart />
        </div>
        <div className="lg:col-span-4">
          <ChannelDistribution />
        </div>
      </div>

      {/* Compact Quick Action Strip (including CRM Hub icons) */}
      <QuickActions onNewWorkflowClick={onNewWorkflowClick} />

      {/* Two-Column Activity Ledger & Channel Connections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-4">
          <ChannelHealth onOpenIntegration={onOpenIntegration} />
        </div>
      </div>
    </div>
  );
}
