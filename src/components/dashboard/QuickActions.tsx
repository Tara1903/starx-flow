import React from "react";
import { Plus, Brain, MessageSquare, Radio, ArrowRight } from "lucide-react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";

interface ActionItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
  section: DashboardSection;
  ctaText: string;
  colorClass: string;
  hoverColorClass: string;
}

interface QuickActionsProps {
  onNewWorkflowClick?: () => void;
}

export function QuickActions({ onNewWorkflowClick }: QuickActionsProps) {
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  const actions: ActionItem[] = [
    {
      title: "Build Flow Node",
      desc: "Deploy customized trigger & action rules",
      icon: <Plus className="w-5 h-5" />,
      section: "workflows",
      ctaText: "Add Workflow",
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/10",
      hoverColorClass: "hover:border-emerald-500/20 hover:bg-emerald-500/20"
    },
    {
      title: "Test AI Sandbox",
      desc: "Simulate and tune custom prompt replies",
      icon: <Brain className="w-5 h-5" />,
      section: "playground",
      ctaText: "AI Lab",
      colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/10",
      hoverColorClass: "hover:border-purple-500/20 hover:bg-purple-500/20"
    },
    {
      title: "Triage Live Inbox",
      desc: "Respond directly to incoming customer chats",
      icon: <MessageSquare className="w-5 h-5" />,
      section: "conversations",
      ctaText: "View Chats",
      colorClass: "text-pink-400 bg-pink-500/10 border-pink-500/10",
      hoverColorClass: "hover:border-pink-500/20 hover:bg-pink-500/20"
    },
    {
      title: "Setup Integrations",
      desc: "Configure WhatsApp, SMS, or Google GBP",
      icon: <Radio className="w-5 h-5" />,
      section: "channels",
      ctaText: "Connections",
      colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/10",
      hoverColorClass: "hover:border-cyan-500/20 hover:bg-cyan-500/20"
    }
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
      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((item, i) => (
          <div
            key={i}
            onClick={() => handleAction(item)}
            className="group cursor-pointer bg-white/[0.005] border border-white/[0.04] rounded-xl p-4 flex flex-col justify-between h-[130px] transition-all hover:bg-white/[0.015] hover:border-white/10"
          >
            {/* Header Icon */}
            <div className="flex items-center justify-between w-full">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${item.colorClass} ${item.hoverColorClass}`}>
                {item.icon}
              </div>
            </div>

            {/* Description */}
            <div className="mt-3">
              <h4 className="text-xs font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
