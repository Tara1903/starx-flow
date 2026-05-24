import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboardStore, type DashboardSection } from "../../store/dashboardStore";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "../../components/dashboard/DashboardTopBar";
import { IntegrationModal } from "../../components/IntegrationModal";
import { CreateWorkflowWizard } from "../../components/dashboard/CreateWorkflowWizard";
import { cn } from "../../lib/utils";

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

export function DashboardLayout() {
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

  // Mark onboarding complete safely if they somehow reach dashboard without it
  React.useEffect(() => {
    import("../../store/authStore").then(({ useAuthStore }) => {
      const auth = useAuthStore.getState();
      if (auth.user && !auth.user.onboardingComplete) {
        useAuthStore.setState({ user: { ...auth.user, onboardingComplete: true } });
        
        import("../../store/onboardingStore").then(({ useOnboardingStore }) => {
          useOnboardingStore.getState().completeOnboarding();
        });
      }
    });
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
        return <OverviewSection onOpenIntegration={handleOpenIntegration} />;
      case "conversations":
        return <ConversationsSection />;
      case "crm":
        return <CrmSection />;
      case "calendar":
        return <CalendarSection />;
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
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 pb-24 sm:pb-12 console-scroll relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <React.Suspense fallback={
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs gap-3 py-24 select-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-semibold tracking-wider uppercase text-[9px] text-zinc-500">Loading module...</span>
                </div>
              }>
                {renderActiveSection()}
              </React.Suspense>
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
