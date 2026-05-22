import React from "react";
import { KPIGrid } from "../../components/dashboard/KPIGrid";
import { ExecutionChart } from "../../components/dashboard/ExecutionChart";
import { ChannelDistribution } from "../../components/dashboard/ChannelDistribution";

export function AnalyticsSection() {
  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      {/* Real-time KPI Metric displays */}
      <KPIGrid />

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ExecutionChart />
        </div>
        <div className="lg:col-span-2">
          <ChannelDistribution />
        </div>
      </div>
    </div>
  );
}
