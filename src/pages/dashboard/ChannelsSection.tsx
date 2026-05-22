import React from "react";
import { ChannelGrid } from "../../components/dashboard/ChannelGrid";

interface ChannelsSectionProps {
  onOpenIntegration: (key: string) => void;
}

export function ChannelsSection({ onOpenIntegration }: ChannelsSectionProps) {
  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      {/* Integrations Grid mapping active states and configure keys */}
      <ChannelGrid onOpenIntegration={onOpenIntegration} />
    </div>
  );
}
