"use client";

import React from "react";
import {
  Plus,
  Brain,
  MessageSquare,
  Radio,
  ArrowRight,
  Kanban,
  Search,
  Workflow,
  Users,
} from "lucide-react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { useCrmStore, type CrmWorkspaceTab } from "../../store/crmStore";
import { CONSOLE_BADGE_LIVE, CONSOLE_BADGE_MUTED, CONSOLE_PANEL } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface ActionItem {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  section: DashboardSection;
  crmTab?: CrmWorkspaceTab;
  badge?: string;
}

interface QuickActionsProps {
  onNewWorkflowClick?: () => void;
}

export function QuickActions({ onNewWorkflowClick }: QuickActionsProps) {
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const setCrmTab = useCrmStore((s) => s.setActiveTab);
  const leadsCount = useCrmStore((s) => s.leads.length);
  const analytics = useCrmStore((s) => s.analytics);
  const sequencesCount = useCrmStore((s) => s.sequences.length);

  const coreActions: ActionItem[] = [
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

  const crmActions: ActionItem[] = [
    {
      title: "CRM Pipeline",
      desc: "Kanban stages and weighted revenue forecast",
      icon: Kanban,
      section: "crm",
      crmTab: "pipeline",
      badge: analytics?.weightedPipelineValue
        ? `€${Math.round(analytics.weightedPipelineValue).toLocaleString()}`
        : undefined,
    },
    {
      title: "Open Lead Finder",
      desc: "Discover businesses & enrich contact details",
      icon: Search,
      section: "crm",
      crmTab: "finder",
    },
    {
      title: "Outreach Sequences",
      desc: "Automated email, WhatsApp & IG follow-ups",
      icon: Workflow,
      section: "crm",
      crmTab: "sequences",
      badge: sequencesCount > 0 ? `${sequencesCount} active` : undefined,
    },
    {
      title: "Customer Directory",
      desc: "360° dossiers, tasks, orders & bookings",
      icon: Users,
      section: "crm",
      crmTab: "directory",
      badge: leadsCount > 0 ? `${leadsCount} records` : undefined,
    },
  ];

  const handleAction = (item: ActionItem) => {
    if (item.crmTab) {
      setCrmTab(item.crmTab);
      setActiveSection("crm");
      return;
    }
    if (item.section === "workflows" && onNewWorkflowClick) {
      onNewWorkflowClick();
    } else {
      setActiveSection(item.section);
    }
  };

  const renderGrid = (items: ActionItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            type="button"
            key={item.title}
            onClick={() => handleAction(item)}
            className={cn(
              CONSOLE_PANEL,
              "text-left group cursor-pointer p-4 flex items-center justify-between gap-3 hover:bg-[#19201d] hover:border-[#edf0ee]/14 transition-colors duration-150 tabular-nums"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] group-hover:text-[#34d399] flex-shrink-0 transition-colors">
                <Icon className="w-4 h-4" strokeWidth={1.65} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-[#edf0ee] truncate">
                    {item.title}
                  </p>
                  {item.badge && (
                    <span className={cn(item.crmTab === "pipeline" ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED, "px-1.5 py-0 text-[10px]")}>
                      {item.badge}
                    </span>
                  )}
                </div>
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
  );

  return (
    <div className="space-y-4 select-none">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-[#727c75]">Revenue CRM & Prospecting</h2>
          <button
            type="button"
            onClick={() => {
              setCrmTab("pipeline");
              setActiveSection("crm");
            }}
            className="text-[11px] font-medium text-[#34d399] hover:text-[#4cc38a] cursor-pointer"
          >
            Open CRM Hub
          </button>
        </div>
        {renderGrid(crmActions)}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-[#727c75]">Quick shortcuts</h2>
        </div>
        {renderGrid(coreActions)}
      </div>
    </div>
  );
}
