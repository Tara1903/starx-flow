"use client";

import React from "react";
import { motion } from "motion/react";
import { WelcomeHeader } from "../../components/dashboard/WelcomeHeader";
import { SetupBanner } from "../../components/setup/SetupBanner";
import { SmartNudges } from "../../components/dashboard/SmartNudge";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { KPIGrid } from "../../components/dashboard/KPIGrid";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { ChannelHealth } from "../../components/dashboard/ChannelHealth";
import { liquidStaggerGrid, liquidCardEntrance } from "../../lib/motionVariants";

interface OverviewSectionProps {
  onOpenIntegration: (key: string) => void;
  onNewWorkflowClick?: () => void;
}

export function OverviewSection({
  onOpenIntegration,
  onNewWorkflowClick,
}: OverviewSectionProps) {
  return (
    <motion.div
      variants={liquidStaggerGrid}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Greeting and custom clock greeting */}
      <motion.div variants={liquidCardEntrance}>
        <WelcomeHeader />
      </motion.div>

      {/* Incomplete setup banner alert */}
      <motion.div variants={liquidCardEntrance}>
        <SetupBanner />
      </motion.div>

      {/* Dynamic Recommendation Banner */}
      <motion.div variants={liquidCardEntrance}>
        <SmartNudges />
      </motion.div>

      {/* Shortcut Action Cards */}
      <motion.div variants={liquidCardEntrance}>
        <QuickActions onNewWorkflowClick={onNewWorkflowClick} />
      </motion.div>

      {/* KPI Performance Gauges */}
      <motion.div variants={liquidCardEntrance}>
        <KPIGrid />
      </motion.div>

      {/* Two-Column Activity & Health Grid */}
      <motion.div
        variants={liquidCardEntrance}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-1">
          <ChannelHealth onOpenIntegration={onOpenIntegration} />
        </div>
      </motion.div>
    </motion.div>
  );
}
