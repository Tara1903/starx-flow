"use client";

import React from "react";
import { Plus, Brain, MessageSquare, Radio, ArrowRight } from "lucide-react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { CONSOLE_PANEL } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface ActionItem {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  section: DashboardSection;
}

interface QuickActionsProps {
  onNewWorkflowClick?: () => void;
}

export function QuickActions({ onNewWorkflowClick }: QuickActionsProps) {
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  const actions: ActionItem[] = [
    {
      title: "Create automation",
      desc: "Add trigger and AI action rules",
      icon: Plus,
      section: "workflows",
    },
    {
      title: "Test in AI sandbox",
      desc: "Simulate and tune receptionist replies",
      icon: Brain,
      section: "playground",
    },
    {
      title: "Open unified inbox",
      desc: "Inspect customer threads across channels",
      icon: MessageSquare,
      section: "conversations",
    },
    {
      title: "Manage integrations",
      desc: "Connect WhatsApp, SMS, reviews, or Instagram",
      icon: Radio,
      section: "channels",
    },
  ];

  const handleAction = (item: ActionItem) => {
    if (item.section === "workflows" && onNewWorkflowClick) {
      onNewWorkflowClick();
    } else {
      setActiveSection(item.section);
    }
  };

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-[#727c75]">Quick shortcuts</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.title}
              onClick={() => handleAction(item)}
              className={cn(
                CONSOLE_PANEL,
                "text-left group cursor-pointer p-4 flex items-center justify-between gap-3 hover:bg-[#19201d] hover:border-[#edf0ee]/14 transition-colors duration-150"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] group-hover:text-[#edf0ee] flex-shrink-0 transition-colors">
                  <Icon className="w-4 h-4" strokeWidth={1.65} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#edf0ee] truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#727c75] mt-0.5 truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#727c75] group-hover:text-[#34d399] flex-shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
