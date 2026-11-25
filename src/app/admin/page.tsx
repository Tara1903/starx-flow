"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminStore, type Client, type DemoLead } from "../../store/adminStore";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { type AdminSection } from "../../components/admin/AdminSidebar";
import { AdminOverviewView } from "../../components/admin/AdminOverviewView";
import { AdminClientsView } from "../../components/admin/AdminClientsView";
import { AdminLeadsView } from "../../components/admin/AdminLeadsView";
import { AdminAnalyticsView } from "../../components/admin/AdminAnalyticsView";
import { AdminPlansView } from "../../components/admin/AdminPlansView";
import { AdminSettingsView } from "../../components/admin/AdminSettingsView";
import { AdminSupportView } from "../../components/admin/AdminSupportView";

export default function AdminPage() {
  const router = useRouter();
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const isLoading = useAdminStore((s) => s.isLoading);
  const isRealtimeConnected = useAdminStore((s) => s.isRealtimeConnected);
  const clients = useAdminStore((s) => s.clients);
  const demoLeads = useAdminStore((s) => s.demoLeads);
  const supportData = useAdminStore((s) => s.supportData);
  const isSupportLoading = useAdminStore((s) => s.isSupportLoading);
  const supportError = useAdminStore((s) => s.supportError);
  const loginAdmin = useAdminStore((s) => s.loginAdmin);
  const logoutAdmin = useAdminStore((s) => s.logoutAdmin);
  const subscribeToAdminRealtime = useAdminStore((s) => s.subscribeToAdminRealtime);
  const fetchClients = useAdminStore((s) => s.fetchClients);
  const fetchDemoLeads = useAdminStore((s) => s.fetchDemoLeads);
  const fetchSupportData = useAdminStore((s) => s.fetchSupportData);
  const sendSupportReply = useAdminStore((s) => s.sendSupportReply);
  const toggleSupportControl = useAdminStore((s) => s.toggleSupportControl);
  const connectSupportInstagram = useAdminStore((s) => s.connectSupportInstagram);
  const updateClientStatus = useAdminStore((s) => s.updateClientStatus);
  const updateClientPlan = useAdminStore((s) => s.updateClientPlan);
  const updateDemoLeadStatus = useAdminStore((s) => s.updateDemoLeadStatus);
  const deleteClient = useAdminStore((s) => s.deleteClient);
  const activeSection = useAdminStore((s) => s.activeSection);
  const setActiveSection = useAdminStore((s) => s.setActiveSection);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  // Authentication gate
  useEffect(() => {
    const checkAdmin = async () => {
      setIsChecking(true);
      if (!isAdmin) {
        const isAuth = await loginAdmin();
        if (!isAuth) {
          router.push("/admin/login");
          return;
        }
      }
      setIsChecking(false);
    };
    checkAdmin();
  }, [isAdmin, loginAdmin, router]);

  // Initial data fetch & Live Supabase Realtime synchronization
  useEffect(() => {
    if (isAdmin) {
      fetchClients();
      fetchDemoLeads();
      fetchSupportData();
      const unsubscribe = subscribeToAdminRealtime();
      return () => {
        unsubscribe();
      };
    }
  }, [isAdmin, fetchClients, fetchDemoLeads, fetchSupportData, subscribeToAdminRealtime]);

  const handleRefresh = useCallback(() => {
    fetchClients();
    fetchDemoLeads();
    fetchSupportData();
  }, [fetchClients, fetchDemoLeads, fetchSupportData]);

  const handleLeadStatusChange = async (
    id: string,
    status: DemoLead["status"],
    notes?: string
  ) => {
    await updateDemoLeadStatus(id, status, notes);
  };

  const newLeadsCount = demoLeads.filter((l) => l.status === "new").length;

  // Loading spinner
  if (isChecking || (isLoading && clients.length === 0 && demoLeads.length === 0)) {
    return (
      <div className="min-h-screen bg-[#040806] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <p className="text-xs font-semibold text-emerald-400/80 tracking-wider uppercase">
            Loading StarX Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      totalClientsCount={clients.length}
      newLeadsCount={newLeadsCount}
      searchQuery={globalSearch}
      onSearchChange={setGlobalSearch}
      onRefresh={handleRefresh}
      onLogout={logoutAdmin}
      adminEmail="admin@starxflow.com"
      isRealtimeConnected={isRealtimeConnected}
    >
      {activeSection === "overview" && (
        <AdminOverviewView
          clients={clients}
          demoLeads={demoLeads}
          onSelectSection={setActiveSection}
          onRefresh={handleRefresh}
        />
      )}

      {activeSection === "clients" && (
        <AdminClientsView
          clients={clients}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onStatusChange={updateClientStatus}
          onPlanChange={updateClientPlan}
          onDeleteClient={deleteClient}
          onRefresh={handleRefresh}
        />
      )}

      {activeSection === "leads" && (
        <AdminLeadsView
          leads={demoLeads}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onStatusChange={handleLeadStatusChange}
          onRefresh={handleRefresh}
        />
      )}

      {activeSection === "support" && (
        <AdminSupportView
          supportData={supportData}
          isLoading={isSupportLoading}
          error={supportError}
          searchQuery={globalSearch}
          onRefresh={fetchSupportData}
          onOpenLeads={() => setActiveSection("leads")}
          onSendReply={sendSupportReply}
          onToggleControl={toggleSupportControl}
          onConnectInstagram={connectSupportInstagram}
        />
      )}

      {activeSection === "analytics" && (
        <AdminAnalyticsView
          totalClients={clients.length}
          totalExecutions={clients.reduce((acc, c) => acc + (c.totalExecutions || 0), 0)}
          clients={clients}
          demoLeads={demoLeads}
        />
      )}

      {activeSection === "plans" && <AdminPlansView clients={clients} />}

      {activeSection === "settings" && (
        <AdminSettingsView onRefresh={handleRefresh} adminEmail="admin@starxflow.com" />
      )}
    </AdminLayout>
  );
}
