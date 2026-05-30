import React from "react";
import { 
  Home, MessageSquare, Layers, Brain, BarChart3, Radio, Settings,
  Sparkles, Plus, TestTube, HelpCircle, Activity, Calendar,
  Users, Calendar as CalendarIcon, CheckSquare, Contact, Bot, Phone, Cpu, LogOut
} from "lucide-react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

interface DashboardTopBarProps {
  onNewWorkflowClick?: () => void;
}

export function DashboardTopBar({ onNewWorkflowClick }: DashboardTopBarProps) {
  const activeSection = useDashboardStore((s) => s.activeSection);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const workflows = useAuthStore((s) => s.workflows);
  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sectionDetails: Record<DashboardSection, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = {
    overview: {
      title: "Command Center",
      subtitle: "Overview of your conversational automations",
      icon: <Home className="w-4 h-4 text-emerald-400" />
    },
    conversations: {
      title: "Unified Inbox",
      subtitle: "Review live customer threads & AI auto-responses",
      icon: <MessageSquare className="w-4 h-4 text-pink-400" />
    },
    workflows: {
      title: "Automation Flows",
      subtitle: "Configure instant triggers & intelligent AI actions",
      icon: <Layers className="w-4 h-4 text-blue-400" />
    },
    crm: {
      title: "Customer Directory",
      subtitle: "Manage all leads and client relationships",
      icon: <Users className="w-4 h-4 text-emerald-400" />
    },
    calendar: {
      title: "Bookings",
      subtitle: "Manage your upcoming appointments and schedule",
      icon: <CalendarIcon className="w-4 h-4 text-indigo-400" />
    },
    tasks: {
      title: "Tasks",
      subtitle: "Track internal to-dos and team assignments",
      icon: <CheckSquare className="w-4 h-4 text-amber-500" />
    },
    team: {
      title: "Team Management",
      subtitle: "Manage staff access and permissions",
      icon: <Contact className="w-4 h-4 text-rose-400" />
    },
    playground: {
      title: "AI Training Lab",
      subtitle: "Test custom prompts and responses in a real-time sandbox",
      icon: <Brain className="w-4 h-4 text-purple-400" />
    },
    analytics: {
      title: "Performance Analytics",
      subtitle: "Track automated conversations, hours saved, and engagement rates",
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />
    },
    channels: {
      title: "Integrations Manager",
      subtitle: "Connect and monitor your customer messaging platforms",
      icon: <Radio className="w-4 h-4 text-cyan-400" />
    },
    settings: {
      title: "System Settings",
      subtitle: "Configure business hours, profile settings, and handoff rules",
      icon: <Settings className="w-4 h-4 text-zinc-400" />
    },
    workflow_editor: {
      title: "Workflow Engine",
      subtitle: "Design linear automated paths with triggers, conditions, and actions",
      icon: <Layers className="w-4 h-4 text-purple-400" />
    },
    agents: {
      title: "AI Specialist Workers",
      subtitle: "Manage role prompt tuning, permissions, and shared memories for autonomous agents",
      icon: <Bot className="w-4 h-4 text-emerald-400" />
    },
    voice: {
      title: "Voice Assistant",
      subtitle: "Monitor AI-answered phone calls, review transcriptions, and analyze voice interactions",
      icon: <Phone className="w-4 h-4 text-emerald-400" />
    },
    os: {
      title: "Business OS CommandCenter",
      subtitle: "Executive dashboard monitoring goals, business logic settings, and autonomous run loop activity",
      icon: <Cpu className="w-4 h-4 text-emerald-400" />
    }
  };

  const details = sectionDetails[activeSection] || sectionDetails.overview;

  const formatLocalDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl select-none">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex w-9 h-9 rounded-lg bg-white/[0.02] border border-white/5 items-center justify-center">
          {details.icon}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            <span>Console</span>
            <span>/</span>
            <span className="text-zinc-400">{activeSection}</span>
          </div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight mt-0.5 sm:text-lg">
            {details.title}
          </h1>
        </div>
      </div>

      {/* Actions and Context Info */}
      <div className="flex items-center gap-4">
        {/* Calendar / Date */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-[11px] font-semibold text-zinc-400">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>{formatLocalDate()}</span>
        </div>

        {/* Live Indicator (Desktop Only) */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-300 tracking-wide uppercase">
            {activeWorkflowsCount} Active Flows
          </span>
        </div>

        {/* Dynamic Context Button based on Section */}
        {activeSection === "overview" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("playground")}
              className="hidden xs:flex items-center gap-1.5 text-xs font-semibold py-2 px-3 sm:px-3.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <TestTube className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test AI</span>
            </button>
            {onNewWorkflowClick && (
              <button
                onClick={onNewWorkflowClick}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black py-2 px-3 sm:px-4 rounded-full transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Build Flow</span>
              </button>
            )}
          </div>
        )}

        {activeSection === "workflows" && onNewWorkflowClick && (
          <button
            onClick={onNewWorkflowClick}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black py-2 px-3 sm:px-4 rounded-full transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Workflow</span>
          </button>
        )}

        {activeSection === "conversations" && (
          <button
            onClick={() => setActiveSection("playground")}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 px-3 sm:px-4 rounded-full hover:bg-emerald-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Train AI Receptionist</span>
          </button>
        )}

        {/* Logout Icon */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-colors ml-2"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
