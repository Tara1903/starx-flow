import React, { useState, useCallback } from "react";
import { Layers, Plus, Search } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WorkflowCard } from "../../components/dashboard/WorkflowCard";
import { ExecutionConsole } from "../../components/dashboard/ExecutionConsole";
import { CreateWorkflowWizard } from "../../components/dashboard/CreateWorkflowWizard";

export function WorkflowsSection() {
  const workflows = useAuthStore((s) => s.workflows) || [];
  const toggleWorkflow = useAuthStore((s) => s.toggleWorkflow);
  const logs = useAuthStore((s) => s.logs) || [];
  const clearLogs = useAuthStore((s) => s.clearLogs);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      {/* Header Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-zinc-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Workflow Automation
          </h2>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
            {workflows.filter((w) => w.isActive).length} Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative flex items-center bg-white/5 border border-white/5 rounded-full px-3.5 py-1.5 w-44 sm:w-56 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="bg-transparent border-none text-zinc-300 outline-none w-full placeholder-zinc-600 ml-1.5"
            />
          </div>

          <button
            onClick={() => {
              useAuthStore.setState({ selectedWorkflowId: null });
              setActiveSection("workflow_editor");
            }}
            className="flex items-center gap-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-4 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Flow</span>
          </button>
        </div>
      </div>

      {/* Grid containing workflows */}
      {filteredWorkflows.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center select-none py-12">
          <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="text-sm font-bold text-white">No workflows matching search</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Try revising your search term or create a new automated flow to start triaging.
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

      {/* Developer simulation console log */}
      <ExecutionConsole logs={logs} onClear={clearLogs} />

      {/* Workflow Wizard Overlay Modal */}
      <AnimatePresence>
        {wizardOpen && (
          <CreateWorkflowWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
