"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useDashboardStore, restoreDashboardSection } from "../../store/dashboardStore";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "../../components/dashboard/DashboardTopBar";
import { GlassSkeleton, NetworkStatusBanner } from "../../components/ui";
import { cn } from "../../lib/utils";
import dynamic from "next/dynamic";

const IntegrationModal = dynamic(
  () => import("../../components/IntegrationModal").then((m) => m.IntegrationModal),
  { ssr: false }
);
const CreateWorkflowWizard = dynamic(
  () => import("../../components/dashboard/CreateWorkflowWizard").then((m) => m.CreateWorkflowWizard),
  { ssr: false }
);

// Sections (Lazy Loaded)
const OverviewSection = React.lazy(() => import("./OverviewSection").then(m => ({ default: m.OverviewSection })));
const ConversationsSection = React.lazy(() => import("./ConversationsSection").then(m => ({ default: m.ConversationsSection })));
const WorkflowsSection = React.lazy(() => import("./WorkflowsSection").then(m => ({ default: m.WorkflowsSection })));
const AIPlaygroundSection = React.lazy(() => import("./AIPlaygroundSection").then(m => ({ default: m.AIPlaygroundSection })));
const AnalyticsSection = React.lazy(() => import("./AnalyticsSection").then(m => ({ default: m.AnalyticsSection })));
const ChannelsSection = React.lazy(() => import("./ChannelsSection").then(m => ({ default: m.ChannelsSection })));
const SettingsSection = React.lazy(() => import("./SettingsSection").then(m => ({ default: m.SettingsSection })));
const WorkflowEditor = React.lazy(() => import("./WorkflowEditor").then(m => ({ default: m.WorkflowEditor })));
const AgentsSection = React.lazy(() => import("./AgentsSection").then(m => ({ default: m.AgentsSection })));
const VoiceSection = React.lazy(() => import("./VoiceSection").then(m => ({ default: m.VoiceSection })));
const BusinessOSSection = React.lazy(() => import("./BusinessOSSection").then(m => ({ default: m.BusinessOSSection })));

// Phase 2 Sections (Lazy Loaded)
const CrmSection = React.lazy(() => import("./CrmSection").then(m => ({ default: m.CrmSection })));
const CalendarSection = React.lazy(() => import("./CalendarSection").then(m => ({ default: m.CalendarSection })));
const TasksSection = React.lazy(() => import("./TasksSection").then(m => ({ default: m.TasksSection })));
const TeamSection = React.lazy(() => import("./TeamSection").then(m => ({ default: m.TeamSection })));
const OrdersSection = React.lazy(() => import("./OrdersSection").then(m => ({ default: m.OrdersSection })));
const KnowledgeSection = React.lazy(() => import("./KnowledgeSection").then(m => ({ default: m.KnowledgeSection })));

export function DashboardLayout() {
  const prefersReduced = useReducedMotion();
  const activeSection = useDashboardStore((s) => s.activeSection);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const isSidebarCollapsed = useDashboardStore((s) => s.isSidebarCollapsed);
  const fetchInboxData = useDashboardStore((s) => s.fetchInboxData);
  const subscribeToInbox = useDashboardStore((s) => s.subscribeToInbox);
  const unsubscribeFromInbox = useDashboardStore((s) => s.unsubscribeFromInbox);

  // Initialize data and subscriptions
  React.useEffect(() => {
    fetchInboxData();
    subscribeToInbox();
    return () => {
      unsubscribeFromInbox();
    };
  }, [fetchInboxData, subscribeToInbox, unsubscribeFromInbox]);

  React.useEffect(() => {
    restoreDashboardSection();
    window.addEventListener("popstate", restoreDashboardSection);
    return () => window.removeEventListener("popstate", restoreDashboardSection);
  }, []);

  // States for modals managed at layout level
  const [integrationKey, setIntegrationKey] = useState<string | null>(null);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);
  const [isWorkflowWizardOpen, setIsWorkflowWizardOpen] = useState(false);

  const handleOpenIntegration = (key: string) => {
    setIntegrationKey(key);
    setIsIntegrationOpen(true);
  };

  const handleCloseIntegration = () => {
    setIsIntegrationOpen(false);
    setIntegrationKey(null);
  };

  const handleOpenWorkflowWizard = () => {
    setIsWorkflowWizardOpen(true);
  };

  // Render the active section based on Zustand store state
  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection
            onOpenIntegration={handleOpenIntegration}
            onNewWorkflowClick={handleOpenWorkflowWizard}
          />
        );
      case "conversations":
        return <ConversationsSection />;
      case "crm":
        return <CrmSection />;
      case "calendar":
        return <CalendarSection />;
      case "orders":
        return <OrdersSection />;
      case "knowledge":
        return <KnowledgeSection />;
      case "tasks":
        return <TasksSection />;
      case "team":
        return <TeamSection />;
      case "workflows":
        return <WorkflowsSection />;
      case "playground":
        return <AIPlaygroundSection />;
      case "analytics":
        return <AnalyticsSection />;
      case "channels":
        return <ChannelsSection onOpenIntegration={handleOpenIntegration} />;
      case "settings":
        return <SettingsSection />;
      case "workflow_editor":
        return <WorkflowEditor />;
      case "agents":
        return <AgentsSection />;
      case "voice":
        return <VoiceSection />;
      case "os":
        return <BusinessOSSection />;
      default:
        return (
          <OverviewSection
            onOpenIntegration={handleOpenIntegration}
            onNewWorkflowClick={handleOpenWorkflowWizard}
          />
        );
    }
  };

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-[#020a07] text-[#f0f5ef] font-sans flex relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Emerald Ambient Depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(40, 223, 160, 0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)" }}
        />
      </div>
      {/* Dynamic desktop clearance style for fixed floating dock */}
      <style>{`
        @media (min-width: 768px) {
          .dashboard-viewport-clearance {
            padding-left: ${isSidebarCollapsed ? "96px" : "304px"} !important;
          }
        }
      `}</style>

      {/* 1. Sidebar component (Floating fixed dock on desktop, bottom navigation on mobile) */}
      <DashboardSidebar />

      {/* 2. Main Content Scrollable Viewport (Scrolls smoothly while sidebar stays fixed) */}
      <div 
        className={cn(
          "flex-1 h-screen h-[100dvh] overflow-y-auto console-scroll flex flex-col min-w-0 transition-all duration-300 relative z-10 pb-20 md:pb-0 dashboard-viewport-clearance",
          isSidebarCollapsed ? "dashboard-content-collapsed md:pl-24" : "dashboard-content-expanded md:pl-[304px]"
        )}
      >
        {/* 3. TopBar Component (Sticky at top of scrollable area) */}
        <div className="sticky top-0 z-30 bg-[#020a07]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <DashboardTopBar onNewWorkflowClick={handleOpenWorkflowWizard} />
        </div>
        <NetworkStatusBanner onReconnectRetry={fetchInboxData} />

        {/* 4. Section Render Area */}
        <div role="region" aria-label="Dashboard workspace" className="flex-1 px-4 py-5 sm:px-6 lg:px-8 py-6 pb-28 sm:pb-12 max-w-[1680px] w-full mx-auto relative z-10">
          <motion.div
            key={activeSection}
            initial={prefersReduced ? false : { opacity: 0.94, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <React.Suspense fallback={<GlassSkeleton variant="panel" />}>
              {renderActiveSection()}
            </React.Suspense>
          </motion.div>
        </div>
      </div>

      {/* 5. Master Integration credentials modal */}
      <IntegrationModal
        channelKey={integrationKey}
        isOpen={isIntegrationOpen}
        onClose={handleCloseIntegration}
      />

      {/* 6. Master Create Workflow Wizard Modal */}
      <AnimatePresence>
        {isWorkflowWizardOpen && (
          <CreateWorkflowWizard
            open={isWorkflowWizardOpen}
            onClose={() => setIsWorkflowWizardOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


