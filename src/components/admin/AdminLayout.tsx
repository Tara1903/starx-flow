"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AdminSidebar, type AdminSection } from "./AdminSidebar";
import { AdminToolbar } from "./AdminToolbar";
import { useAdminStore } from "../../store/adminStore";
import { cn } from "../../lib/utils";

interface AdminLayoutProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  totalClientsCount: number;
  newLeadsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  adminEmail?: string;
  isRealtimeConnected?: boolean;
  children: React.ReactNode;
}

export function AdminLayout({
  activeSection,
  onSelectSection,
  totalClientsCount,
  newLeadsCount,
  searchQuery,
  onSearchChange,
  onRefresh,
  onLogout,
  adminEmail = "admin@starxflow.com",
  isRealtimeConnected = false,
  children,
}: AdminLayoutProps) {
  const prefersReduced = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isSidebarCollapsed = useAdminStore((s) => s.isSidebarCollapsed);

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-[#080a09] text-[#edf0ee] font-sans flex relative selection:bg-[#34d399]/25 selection:text-[#edf0ee]">
      {/* Sidebar (Fixed Dock on Desktop & Mobile Slide-Over Drawer) */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          onSelectSection(sec);
          setIsMobileMenuOpen(false);
        }}
        totalClientsCount={totalClientsCount}
        newLeadsCount={newLeadsCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={onLogout}
        adminEmail={adminEmail}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Dynamic desktop clearance style for fixed dock */}
      <style>{`
        @media (min-width: 768px) {
          .admin-viewport-clearance {
            padding-left: ${isSidebarCollapsed ? "96px" : "304px"} !important;
          }
        }
      `}</style>

      {/* Main Content Scrollable Viewport */}
      <div
        className={cn(
          "flex-1 h-screen h-[100dvh] overflow-y-auto console-scroll flex flex-col min-w-0 transition-[padding] duration-300 relative z-10 pb-20 md:pb-0 admin-viewport-clearance",
          isSidebarCollapsed ? "dashboard-content-collapsed md:pl-24" : "dashboard-content-expanded md:pl-[304px]"
        )}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 bg-[#080a09]/92 backdrop-blur-md border-b border-[#edf0ee]/[0.08]">
          <AdminToolbar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onRefresh={onRefresh}
            onLogout={onLogout}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
            newLeadsCount={newLeadsCount}
            adminEmail={adminEmail}
            isRealtimeConnected={isRealtimeConnected}
          />
        </header>

        {/* Page Content View */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] w-full mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.94, y: prefersReduced ? 0 : -4 }}
              transition={{ duration: prefersReduced ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
