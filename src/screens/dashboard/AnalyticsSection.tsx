import React from "react";
import { KPIGrid } from "../../components/dashboard/KPIGrid";
import { ExecutionChart } from "../../components/dashboard/ExecutionChart";
import { ChannelDistribution } from "../../components/dashboard/ChannelDistribution";

export function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8">
          <ExecutionChart />
        </div>
        <div className="lg:col-span-4">
          <ChannelDistribution />
        </div>
      </div>
    </div>
  );
}
