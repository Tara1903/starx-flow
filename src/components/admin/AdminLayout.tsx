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
    <div className="min-h-screen bg-[#040806] text-zinc-100 flex relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left subtle emerald glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-600/10 blur-[130px]" />
        {/* Top-right teal ambient glow */}
        <div className="absolute top-1/4 -right-40 w-96 h-96 rounded-full bg-teal-600/8 blur-[140px]" />
        {/* Bottom center deep glow */}
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-emerald-950/20 blur-[150px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Sidebar (Unified Desktop Fixed Aside & Mobile Slide-Over Drawer) */}
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
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 z-10 transition-all duration-300",
          isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[280px]"
        )}
      >
        {/* Top Floating Glass Toolbar */}
        <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 pt-4 pb-2">
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
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.94, y: prefersReduced ? 0 : -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
