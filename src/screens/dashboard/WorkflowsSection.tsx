"use client";
import React, { useState } from "react";
import { Layers, Plus, Search } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WorkflowCard } from "../../components/dashboard/WorkflowCard";
import { ExecutionConsole } from "../../components/dashboard/ExecutionConsole";
import { CreateWorkflowWizard } from "../../components/dashboard/CreateWorkflowWizard";
import {
  CONSOLE_PANEL,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BADGE_LIVE,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

export function WorkflowsSection() {
  const workflows = useAuthStore((s) => s.workflows) || [];
  const toggleWorkflow = useAuthStore((s) => s.toggleWorkflow);
  const logs = useAuthStore((s) => s.logs) || [];
  const clearLogs = useAuthStore((s) => s.clearLogs);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkflows = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const liveCount = workflows.filter((w) => w.isActive).length;

  return (
    <div className="space-y-6 select-none tabular-nums">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className={CONSOLE_SECTION_TITLE}>Active workflows</h2>
          <span className={CONSOLE_BADGE_LIVE}>{liveCount} live</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center w-48 sm:w-56">
            <Search
              className="w-3.5 h-3.5 text-[#727c75] absolute left-3 pointer-events-none"
              strokeWidth={1.65}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows"
              className={cn(CONSOLE_INPUT, "w-full h-9 pl-9 pr-3 text-xs")}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              useAuthStore.setState({ selectedWorkflowId: null });
              setActiveSection("workflow_editor");
            }}
            className={cn(CONSOLE_BTN_PRIMARY, "h-9")}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Create flow</span>
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className={cn(CONSOLE_PANEL, "p-10 text-center")}>
          <Layers className="w-6 h-6 text-[#727c75] mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-[#edf0ee]">No matching workflows</h3>
          <p className="text-xs text-[#727c75] mt-1 max-w-xs mx-auto">
            Adjust your search filter or create a workflow to start automating responses
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkflows.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onToggle={() => toggleWorkflow(wf.id)}
              onConfigure={() => {
                useAuthStore.setState({ selectedWorkflowId: wf.id });
                setActiveSection("workflow_editor");
              }}
            />
          ))}
        </div>
      )}

      {/* Execution Console */}
      <ExecutionConsole logs={logs} onClear={clearLogs} />

      <AnimatePresence>
        {wizardOpen && (
          <CreateWorkflowWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
