"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  BookOpen,
  Layers,
  Brain,
  BarChart3,
  Radio,
  Settings,
  MessageSquare,
  Home,
  Users,
  Calendar as CalendarIcon,
  CheckSquare,
  Contact,
  Bot,
  Phone,
  Cpu,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { useUIStore } from "../../store/uiStore";
import { ConsoleSidebar, type ConsoleSidebarGroup } from "../shared/ConsoleSidebar";

export function DashboardSidebar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const workflows = useAuthStore((s) => s.workflows);
  const connectedChannels = useAuthStore((s) => s.connectedChannels);

  const activeSection = useDashboardStore((s) => s.activeSection);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const conversations = useDashboardStore((s) => s.conversations);

  const isCollapsed = useDashboardStore((s) => s.isSidebarCollapsed);
  const setIsCollapsed = useDashboardStore((s) => s.setSidebarCollapsed);
  const openCommandCenter = useUIStore((s) => s.openCommandCenter);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640 && window.innerWidth <= 1024) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;
  const connectedChannelsCount = connectedChannels.filter((c) => c.isConnected).length;
  const unreadConversationsCount = conversations.filter((c) => c.unread).length;

  const groups: ConsoleSidebarGroup<DashboardSection>[] = [
    {
      id: "core",
      title: "Core",
      items: [
        { id: "overview", label: "Home", icon: Home, group: "core" },
        {
          id: "conversations",
          label: "Inbox",
          icon: MessageSquare,
          badge: unreadConversationsCount || undefined,
          group: "core",
        },
        {
          id: "calendar",
          label: "Calendar",
          icon: CalendarIcon,
          group: "core",
          subItems: [
            { label: "Discovery calls", action: () => setActiveSection("calendar") },
            { label: "Book consultation", action: () => setActiveSection("calendar") },
            { label: "Calendar sync", action: () => setActiveSection("calendar") },
          ],
        },
        {
          id: "workflows",
          label: "Workflows",
          icon: Layers,
          badge: activeWorkflowsCount || undefined,
          group: "core",
          subItems: [
            { label: "Active automations", action: () => setActiveSection("workflows") },
            { label: "Flow builder", action: () => setActiveSection("workflows") },
            { label: "Draft templates", action: () => setActiveSection("workflows") },
          ],
        },
        {
          id: "crm",
          label: "Customers",
          icon: Users,
          group: "core",
          subItems: [
            { label: "Active clients", action: () => setActiveSection("crm") },
            { label: "Qualified leads", action: () => setActiveSection("crm") },
            { label: "Export contacts", action: () => setActiveSection("crm") },
          ],
        },
        { id: "orders", label: "Orders", icon: ShoppingBag, group: "core" },
      ],
    },
    {
      id: "ai",
      title: "AI workforce",
      items: [
        {
          id: "agents",
          label: "AI Receptionist",
          icon: Bot,
          badge: "Live",
          group: "ai",
          subItems: [
            { label: "Live routing", action: () => setActiveSection("agents") },
            { label: "Persona config", action: () => setActiveSection("agents") },
            { label: "Knowledge grounding", action: () => setActiveSection("agents") },
          ],
        },
        { id: "voice", label: "Voice AI", icon: Phone, group: "ai" },
        { id: "playground", label: "AI Playground", icon: Brain, group: "ai" },
        { id: "os", label: "Business OS", icon: Cpu, group: "ai" },
      ],
    },
    {
      id: "ops",
      title: "Operations",
      items: [
        { id: "knowledge", label: "Knowledge", icon: BookOpen, group: "ops" },
        { id: "tasks", label: "Tasks", icon: CheckSquare, group: "ops" },
        { id: "team", label: "Team", icon: Contact, group: "ops" },
        { id: "analytics", label: "Analytics", icon: BarChart3, group: "ops" },
        {
          id: "channels",
          label: "Channels",
          icon: Radio,
          badge: connectedChannelsCount > 0 ? connectedChannelsCount : undefined,
          group: "ops",
        },
        { id: "settings", label: "Settings", icon: Settings, group: "ops" },
      ],
    },
  ];

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "SX"
    : "SX";

  const rawBusinessName = user?.businessName?.trim() || "";
  const workspaceLabel =
    !rawBusinessName || rawBusinessName.toLowerCase().startsWith("starx flow")
      ? "Command Workspace"
      : rawBusinessName;
  const displayName = user?.name || "Workspace Owner";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <ConsoleSidebar<DashboardSection>
      asideAriaLabel="Dashboard sidebar"
      navAriaLabel="Dashboard sections"
      collapseAriaLabel="Collapse sidebar"
      expandAriaLabel="Expand sidebar"
      searchAriaLabel="Search and command center (Press ⌘K)"
      layoutIdPrefix="dashboard-sidebar"
      brandTitle="StarX Flow"
      brandSubtitle={workspaceLabel}
      brandBadge="Pro"
      groups={groups}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      onOpenSearch={openCommandCenter}
      footerInitials={initials}
      footerTitle={displayName}
      footerSubtitle={`Receptionist live · ${activeWorkflowsCount} ${activeWorkflowsCount === 1 ? "flow" : "flows"}`}
      footerLiveBanner={{
        label: "Workspace live",
        statusText: `${activeWorkflowsCount} active`,
        isHealthy: true,
      }}
      onLogout={handleLogout}
    />
  );
}
