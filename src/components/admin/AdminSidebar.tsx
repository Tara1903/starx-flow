"use client";

import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Inbox,
  MessageSquare,
  BarChart3,
  CreditCard,
  Shield,
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { useUIStore } from "../../store/uiStore";
import { ConsoleSidebar, type ConsoleSidebarGroup } from "../shared/ConsoleSidebar";

export type AdminSection = "overview" | "clients" | "leads" | "support" | "analytics" | "plans" | "settings";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  totalClientsCount: number;
  newLeadsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  adminEmail?: string;
  isRealtimeConnected?: boolean;
}

export function AdminSidebar({
  activeSection,
  onSelectSection,
  totalClientsCount,
  newLeadsCount,
  isOpenMobile = false,
  onCloseMobile,
  onLogout,
  adminEmail = "admin@starxflow.com",
  isRealtimeConnected = true,
}: AdminSidebarProps) {
  const isCollapsed = useAdminStore((s) => s.isSidebarCollapsed);
  const setIsCollapsed = useAdminStore((s) => s.setSidebarCollapsed);
  const supportCount = useAdminStore((s) => s.supportData?.conversations?.length || 0);
  const openCommandCenter = useUIStore((s) => s.openCommandCenter);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024 && window.innerWidth < 1280) {
      setIsCollapsed(true);
    }
  }, [setIsCollapsed]);

  const groups: ConsoleSidebarGroup<AdminSection>[] = [
    {
      id: "main",
      title: "Core",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard, group: "main" },
        {
          id: "clients",
          label: "Clients",
          icon: Users,
          badge: totalClientsCount > 0 ? totalClientsCount : undefined,
          group: "main",
          subItems: [
            { label: "Active subscribers", action: () => onSelectSection("clients") },
            { label: "Recent signups", action: () => onSelectSection("clients") },
          ],
        },
        {
          id: "leads",
          label: "Demo inquiries",
          icon: Inbox,
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
          group: "main",
          subItems: [
            { label: "Pending reviews", action: () => onSelectSection("leads") },
            { label: "Scheduled demos", action: () => onSelectSection("leads") },
          ],
        },
        {
          id: "support",
          label: "Support desk",
          icon: MessageSquare,
          badge: supportCount > 0 ? supportCount : undefined,
          group: "main",
          subItems: [
            { label: "Support inbox", action: () => onSelectSection("support") },
            { label: "WhatsApp & Instagram", action: () => onSelectSection("support") },
          ],
        },
      ],
    },
    {
      id: "intelligence",
      title: "Operations",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          group: "intelligence",
          subItems: [
            { label: "Throughput", action: () => onSelectSection("analytics") },
            { label: "Conversion rate", action: () => onSelectSection("analytics") },
          ],
        },
        { id: "plans", label: "Plans", icon: CreditCard, group: "intelligence" },
      ],
    },
    {
      id: "system",
      title: "System",
      items: [{ id: "settings", label: "Settings & audit", icon: Shield, group: "system" }],
    },
  ];

  return (
    <ConsoleSidebar<AdminSection>
      asideAriaLabel="Admin Navigation"
      navAriaLabel="Admin sections"
      collapseAriaLabel="Collapse admin sidebar"
      expandAriaLabel="Expand admin sidebar"
      searchAriaLabel="Search admin (Press ⌘K)"
      layoutIdPrefix="admin-sidebar"
      brandTitle="StarX Flow"
      brandSubtitle="Platform admin"
      brandBadge="Admin"
      groups={groups}
      activeSection={activeSection}
      onSelectSection={onSelectSection}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      onOpenSearch={openCommandCenter}
      footerInitials="AD"
      footerTitle="Platform admin"
      footerSubtitle={adminEmail}
      footerLiveBanner={{
        label: "Supabase live",
        statusText: isRealtimeConnected ? "Connected" : "Syncing",
        isHealthy: isRealtimeConnected,
      }}
      onLogout={onLogout}
      mobileDrawer={
        onCloseMobile
          ? {
              open: isOpenMobile,
              onClose: onCloseMobile,
              ariaLabel: "Mobile admin navigation",
            }
          : undefined
      }
    />
  );
}
