import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Layers, Brain, BarChart3, Radio, Settings, MessageSquare,
  LogOut, Shield, ChevronLeft, ChevronRight, Menu, HelpCircle,
  Home, Activity, RefreshCw, Smartphone, Users, Calendar as CalendarIcon, CheckSquare, Contact, Bot, Phone, Cpu
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { cn } from "../../lib/utils";

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function DashboardSidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const workflows = useAuthStore((s) => s.workflows);
  const connectedChannels = useAuthStore((s) => s.connectedChannels);

  const activeSection = useDashboardStore((s) => s.activeSection);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const conversations = useDashboardStore((s) => s.conversations);

  const isCollapsed = useDashboardStore((s) => s.isSidebarCollapsed);
  const setIsCollapsed = useDashboardStore((s) => s.setSidebarCollapsed);

  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  const connectedChannelsCount = connectedChannels.filter((c) => c.isConnected).length;
  const unreadConversationsCount = conversations.filter((c) => c.unread).length;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems: SidebarItem[] = [
    { id: "overview", label: "Overview", icon: <Home className="w-4 h-4" /> },
    {
      id: "conversations",
      label: "Inbox",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: <Layers className="w-4 h-4" />,
      badge: activeWorkflowsCount > 0 ? activeWorkflowsCount : undefined
    },
    { id: "crm", label: "Customers", icon: <Users className="w-4 h-4" /> },
    { id: "calendar", label: "Calendar", icon: <CalendarIcon className="w-4 h-4" /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "team", label: "Team", icon: <Contact className="w-4 h-4" /> },
    { id: "playground", label: "AI Playground", icon: <Brain className="w-4 h-4" /> },
    { id: "agents", label: "AI Agents", icon: <Bot className="w-4 h-4" /> },
    { id: "voice", label: "Voice Assistant", icon: <Phone className="w-4 h-4" /> },
    { id: "os", label: "Business OS", icon: <Cpu className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    {
      id: "channels",
      label: "Channels",
      icon: <Radio className="w-4 h-4" />,
      badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined
    },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden sm:flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 bg-[#050505] transition-all duration-300 z-30 select-none",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Brand Header */}
        <div className={cn("flex items-center p-5 border-b border-white/5 relative", isCollapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-bold text-sm">S</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight">StarX Flow</span>
                <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[140px]">
                  {user?.businessName || "My Business"}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors hover:border-white/20"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto console-scroll">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                  isActive
                    ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent"
                )}
              >
                <div className={cn("flex-shrink-0", isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-400")}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                
                {/* Badge */}
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "flex items-center justify-center text-[10px] font-bold rounded-full",
                      isCollapsed
                        ? "absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 text-black"
                        : "ml-auto px-1.5 py-0.5 min-w-[18px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-md bg-[#0a0a0a] border border-white/10 text-zinc-300 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Status Dot */}
          <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] border border-white/5", isCollapsed ? "justify-center" : "")}>
            <div className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            {!isCollapsed && <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">System Live</span>}
          </div>

          {/* User & Logout */}
          <div className={cn("flex items-center justify-between", isCollapsed ? "flex-col gap-2" : "px-1")}>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 max-w-[140px]">
                <span className="text-xs font-bold text-white truncate">{user?.name || "Owner"}</span>
                <span className="text-[10px] text-zinc-500 truncate">{user?.email}</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center justify-center text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/10",
                isCollapsed ? "w-10 h-10" : ""
              )}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
      <nav className="sm:hidden mobile-nav">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn("mobile-nav-item relative", isActive && "active")}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center border border-black">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
        {/* Toggle Panel for remaining sections */}
        <button
          onClick={() => {
            const nextTabMap: Record<string, DashboardSection> = {
              overview: "settings",
              conversations: "settings",
              workflows: "settings",
              crm: "settings",
              calendar: "settings",
              tasks: "settings",
              team: "settings",
              playground: "settings",
              agents: "settings",
              voice: "settings",
              os: "settings",
              workflow_editor: "settings",
              analytics: "settings",
              channels: "settings",
              settings: "overview"
            };
            setActiveSection(nextTabMap[activeSection] || "overview");
          }}
          className={cn("mobile-nav-item", (activeSection === "channels" || activeSection === "settings") && "active")}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-1">More</span>
        </button>
      </nav>
    </>
  );
}
