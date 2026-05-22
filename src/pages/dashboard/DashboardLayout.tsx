import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "../../components/dashboard/DashboardTopBar";
import { IntegrationModal } from "../../components/IntegrationModal";
import { CreateWorkflowWizard } from "../../components/dashboard/CreateWorkflowWizard";
import { cn } from "../../lib/utils";

// Sections
import { OverviewSection } from "./OverviewSection";
import { ConversationsSection } from "./ConversationsSection";
import { WorkflowsSection } from "./WorkflowsSection";
import { AIPlaygroundSection } from "./AIPlaygroundSection";
import { AnalyticsSection } from "./AnalyticsSection";
import { ChannelsSection } from "./ChannelsSection";
import { SettingsSection } from "./SettingsSection";

export function DashboardLayout() {
  const activeSection = useDashboardStore((s) => s.activeSection);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);
  const isSidebarCollapsed = useDashboardStore((s) => s.isSidebarCollapsed);

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
        return <OverviewSection onOpenIntegration={handleOpenIntegration} />;
      case "conversations":
        return <ConversationsSection />;
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
      default:
        return <OverviewSection onOpenIntegration={handleOpenIntegration} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      {/* 1. Sidebar component (Persistent on desktop, bottom navigation on mobile) */}
      <DashboardSidebar />

      {/* 2. Main Content Wrapper */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 pb-16 sm:pb-0",
          isSidebarCollapsed ? "sm:pl-[72px]" : "sm:pl-[260px]"
        )}
      >
        {/* 3. TopBar Component */}
        <DashboardTopBar onNewWorkflowClick={handleOpenWorkflowWizard} />

        {/* 4. Section Render Area with safe bottom-padding for mobile bottom navbar */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 sm:pb-8 console-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </main>
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
