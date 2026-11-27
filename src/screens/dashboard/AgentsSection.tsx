"use client";
import React, { useState } from "react";
import {
  Bot, Shield, Play, Settings, Check,
  Save, Trash2, Database, Brain, Terminal,
  MessageSquare, User, RefreshCw, Plus, X
} from "lucide-react";
import { type Agent } from "../../store/authStore";
import { useAgentStore } from "../../store/agentStore";
import { cn } from "../../lib/utils";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_ROW,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_GHOST,
  CONSOLE_BTN_DANGER,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";

export function AgentsSection() {
  const agents = useAgentStore((s) => s.agents) || [];
  const memories = useAgentStore((s) => s.agentMemories) || [];
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const addMemory = useAgentStore((s) => s.addMemory);
  const clearMemories = useAgentStore((s) => s.clearMemories);

  const [activeTab, setActiveTab] = useState<"agents" | "memory" | "sandbox">("agents");

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newLead, setNewLead] = useState("lead-1");

  const [sandboxQuery, setSandboxQuery] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<{
    id: string;
    agent: string;
    action: string;
    detail: string;
    type: "trigger" | "handoff" | "memory" | "response" | "success";
  }[]>([]);
  const [simFinalResponse, setSimFinalResponse] = useState("");

  const handleOpenTune = (agent: Agent) => {
    setEditingAgent(agent);
    setEditPrompt(agent.systemPrompt);
    setEditPermissions(agent.permissions);
    setEditIsActive(agent.isActive);
  };

  const handleSaveTune = async () => {
    if (!editingAgent) return;
    await updateAgent(editingAgent.id, {
      systemPrompt: editPrompt,
      permissions: editPermissions,
      isActive: editIsActive,
    });
    setEditingAgent(null);
  };

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    await addMemory({
      leadId: newLead,
      key: newKey.trim(),
      value: newValue.trim(),
    });
    setNewKey("");
    setNewValue("");
  };

  const togglePermission = (perm: string) => {
    if (editPermissions.includes(perm)) {
      setEditPermissions((prev) => prev.filter((p) => p !== perm));
    } else {
      setEditPermissions((prev) => [...prev, perm]);
    }
  };

  const runSandboxSim = async () => {
    if (!sandboxQuery.trim()) return;
    setIsSimulating(true);
    setSimulationLogs([]);
    setSimFinalResponse("");

    const logs: typeof simulationLogs = [];
    const pushLog = (
      agent: string,
      action: string,
      detail: string,
      type: typeof simulationLogs[0]["type"]
    ) => {
      const newL = { id: `log-${Date.now()}-${Math.random()}`, agent, action, detail, type };
      logs.push(newL);
      setSimulationLogs([...logs]);
    };

    pushLog("System", "Inbound Request", `Query received: "${sandboxQuery}"`, "trigger");
    await new Promise((r) => setTimeout(r, 1200));

    pushLog("Receptionist Agent", "Intent Parsing", "Checking permissions... Validated. Intents detected: [Booking Slot Search] & [Pricing Query].", "handoff");
    await new Promise((r) => setTimeout(r, 1500));

    pushLog("Receptionist Agent", "Specialist Handoff", "Routing pricing complaint to Sales Agent...", "handoff");
    await new Promise((r) => setTimeout(r, 1200));

    pushLog("Sales Agent", "Shared Memory Lookup", "Searching memory key 'billing_status'...", "memory");
    await new Promise((r) => setTimeout(r, 1000));

    pushLog("Sales Agent", "Shared Memory Write", "Updated key 'billing_status' -> 'Investigating refund invoice #1204'", "memory");
    addMemory({ leadId: "lead-1", key: "billing_status", value: "Investigating refund invoice #1204" });
    await new Promise((r) => setTimeout(r, 1200));

    pushLog("Sales Agent", "Formulate Response Block", "Found $20 overcharge. Created CRM task to process refund. Drafted billing response.", "response");
    await new Promise((r) => setTimeout(r, 1500));

    pushLog("Receptionist Agent", "Specialist Handoff", "Routing scheduling inquiry to Booking Agent...", "handoff");
    await new Promise((r) => setTimeout(r, 1200));

    pushLog("Booking Agent", "Calendar Query", "Checking calendar availability for tomorrow afternoon...", "memory");
    await new Promise((r) => setTimeout(r, 1200));

    pushLog("Booking Agent", "Shared Memory Write", "Updated key 'preferred_time' -> 'Tomorrow 2:00 PM'", "memory");
    addMemory({ leadId: "lead-1", key: "preferred_time", value: "Tomorrow 2:00 PM" });
    await new Promise((r) => setTimeout(r, 1000));

    pushLog("Booking Agent", "Formulate Response Block", "Confirmed 2:00 PM tomorrow is available. Drafted booking response.", "response");
    await new Promise((r) => setTimeout(r, 1500));

    pushLog("Receptionist Agent", "Compilation", "Aggregating outputs and checking memory traces...", "handoff");
    await new Promise((r) => setTimeout(r, 1200));

    pushLog("System", "Orchestration Complete", "Merged replies into a single cohesive response.", "success");

    setSimFinalResponse(
      "Hi there! I would be happy to schedule your appointment for tomorrow at 2:00 PM. Regarding your previous visit, we found a $20 overcharge on invoice #1204. I have created a task for our team to issue you a refund immediately. Looking forward to seeing you tomorrow!"
    );
    setIsSimulating(false);
  };

  const getLogBorderColor = (type: typeof simulationLogs[0]["type"]) => {
    switch (type) {
      case "trigger":
        return "border-l-[#727c75] text-[#a1aaa4]";
      case "handoff":
        return "border-l-sky-300 text-sky-300";
      case "memory":
        return "border-l-amber-300 text-amber-300";
      case "response":
        return "border-l-[#a1aaa4] text-[#edf0ee]";
      case "success":
        return "border-l-[#34d399] text-[#4cc38a]";
      default:
        return "border-l-[#727c75] text-[#a1aaa4]";
    }
  };

  return (
    <div className="space-y-6 select-none pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#edf0ee]/[0.08] pb-4">
        <div>
          <h2 className={CONSOLE_HEADING}>AI agents & shared memory</h2>
          <p className="text-xs text-[#727c75] mt-1">
            Configure specialist agent permissions, inspect shared CRM memory, and test handoff traces.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-[#0c100e] border border-[#edf0ee]/[0.08] p-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("agents")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              activeTab === "agents"
                ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                : "text-[#727c75] hover:text-[#edf0ee]"
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Roster</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("memory")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              activeTab === "memory"
                ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                : "text-[#727c75] hover:text-[#edf0ee]"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Shared memory</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sandbox")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              activeTab === "sandbox"
                ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                : "text-[#727c75] hover:text-[#edf0ee]"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Sandbox</span>
          </button>
        </div>
      </div>

      {/* 1. AGENTS TAB */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                CONSOLE_PANEL,
                "flex flex-col justify-between min-h-[210px]",
                !agent.isActive && "opacity-65"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center border",
                        agent.isActive
                          ? "bg-[#19201d] border-[#edf0ee]/[0.08] text-[#34d399]"
                          : "bg-[#0d1210] border-[#edf0ee]/[0.06] text-[#727c75]"
                      )}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#edf0ee]">{agent.name}</h3>
                      <span className="text-xs text-[#727c75] capitalize block mt-0.5">
                        {agent.role} specialist
                      </span>
                    </div>
                  </div>

                  <span className={agent.isActive ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                    {agent.isActive ? "Active" : "Paused"}
                  </span>
                </div>

                <p className="text-xs text-[#a1aaa4] leading-relaxed line-clamp-2 select-text">
                  {agent.description}
                </p>
              </div>

              <div className="border-t border-[#edf0ee]/[0.08] pt-3.5 mt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-[#a1aaa4] tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#727c75]" />
                    <span>{agent.permissions.length} permissions</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#727c75]" />
                    <span>
                      {agent.role === "receptionist" ? memories.length : Math.floor(memories.length / 2)} records
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenTune(agent)}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Tune rules</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. MEMORY TAB */}
      {activeTab === "memory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className={cn(CONSOLE_PANEL, "space-y-4")}>
            <h3 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2 pb-3 border-b border-[#edf0ee]/[0.08]")}>
              <Plus className="w-4 h-4 text-[#34d399]" />
              <span>Write memory entry</span>
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Target customer</label>
                <select
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                >
                  <option value="lead-1">Sarah Jenkins (WhatsApp)</option>
                  <option value="lead-2">Robert Miller (SMS)</option>
                  <option value="lead-3">Jessica Alva (Instagram DM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Memory key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. preferred_stylist"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs font-mono")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. Sarah (prefers warm tea)"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                />
              </div>

              <button
                type="button"
                onClick={handleAddMemory}
                disabled={!newKey.trim() || !newValue.trim()}
                className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5")}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save entry</span>
              </button>
            </div>
          </div>

          <div className={cn(CONSOLE_PANEL, "lg:col-span-2 space-y-4 min-h-[380px]")}>
            <div className="flex items-center justify-between border-b border-[#edf0ee]/[0.08] pb-3">
              <h3 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
                <Database className="w-4 h-4 text-[#a1aaa4]" />
                <span>Shared cognitive records</span>
              </h3>

              {memories.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearMemories()}
                  className={CONSOLE_BTN_DANGER}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear all</span>
                </button>
              )}
            </div>

            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Database className="w-7 h-7 text-[#727c75] mb-3" />
                <p className="text-sm font-medium text-[#edf0ee]">No records stored</p>
                <p className="text-xs text-[#727c75] mt-1 max-w-xs leading-relaxed">
                  Specialist agents write shared customer preferences and billing context here during conversations.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto select-text">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#edf0ee]/[0.08] text-[#727c75] select-none">
                      <th className="py-2.5 font-medium pl-2">Customer</th>
                      <th className="py-2.5 font-medium">Key</th>
                      <th className="py-2.5 font-medium">Value</th>
                      <th className="py-2.5 font-medium text-right pr-2">Linked agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0ee]/[0.06]">
                    {memories.map((mem) => (
                      <tr key={mem.id} className={CONSOLE_ROW}>
                        <td className="py-3 font-medium text-[#edf0ee] pl-2">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#727c75]" />
                            <span>
                              {mem.leadId === "lead-1"
                                ? "Sarah Jenkins"
                                : mem.leadId === "lead-2"
                                  ? "Robert Miller"
                                  : "Jessica Alva"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-[#4cc38a] font-mono text-[11px]">{mem.key}</td>
                        <td className="py-3 text-[#a1aaa4] select-all">{mem.value}</td>
                        <td className="py-3 text-right pr-2 select-none">
                          <span className={CONSOLE_BADGE_MUTED}>
                            {mem.key.includes("time") || mem.key.includes("slot")
                              ? "Booking Agent"
                              : mem.key.includes("billing") || mem.key.includes("price")
                                ? "Sales Agent"
                                : "Receptionist Agent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ORCHESTRATION SANDBOX TAB */}
      {activeTab === "sandbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className={cn(CONSOLE_PANEL, "space-y-4 select-none")}>
            <div>
              <h3 className={CONSOLE_SECTION_TITLE}>Multi-agent sandbox</h3>
              <p className="text-xs text-[#727c75] mt-1 leading-relaxed">
                Test cooperative handoffs and shared memory writes with a mixed-intent message.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={sandboxQuery}
                onChange={(e) => setSandboxQuery(e.target.value)}
                rows={3}
                placeholder="e.g. I want to schedule a booking tomorrow at 2:00 PM but I have a question about invoice #1204."
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2.5 text-xs resize-none")}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSandboxQuery(
                      "I want to schedule a booking tomorrow at 2:00 PM but I have a complaint about invoice #1204."
                    )
                  }
                  className={CONSOLE_BTN_SECONDARY}
                >
                  Load sample query
                </button>

                <button
                  type="button"
                  onClick={runSandboxSim}
                  disabled={isSimulating || !sandboxQuery.trim()}
                  className={cn(CONSOLE_BTN_PRIMARY, "flex-1")}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSimulating ? "Running trace..." : "Run orchestration trace"}</span>
                </button>
              </div>
            </div>

            {simFinalResponse && (
              <div className="border-t border-[#edf0ee]/[0.08] pt-4 space-y-2 select-text">
                <span className="text-xs font-medium text-[#4cc38a] flex items-center gap-1.5 select-none">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Combined response output</span>
                </span>
                <p className={cn(CONSOLE_SUBCARD, "p-3.5 text-xs text-[#edf0ee] leading-relaxed select-text")}>
                  {simFinalResponse}
                </p>
              </div>
            )}
          </div>

          <div className={cn(CONSOLE_PANEL, "flex flex-col min-h-[460px]")}>
            <div className="text-xs font-medium text-[#edf0ee] flex items-center gap-2 border-b border-[#edf0ee]/[0.08] pb-3">
              <RefreshCw className={cn("w-3.5 h-3.5 text-[#a1aaa4]", isSimulating && "animate-spin text-[#34d399]")} />
              <span>Orchestration execution logs</span>
            </div>

            {simulationLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <Play className="w-7 h-7 text-[#727c75] mb-3" />
                <p className="text-sm font-medium text-[#edf0ee]">Awaiting execution trace</p>
                <p className="text-xs text-[#727c75] mt-1 max-w-[240px] leading-relaxed">
                  Agent handoffs, permission checks, and shared memory writes will stream here live.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pt-4 space-y-2.5 max-h-[420px] console-scroll select-text pr-1">
                {simulationLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      CONSOLE_SUBCARD,
                      "border-l-2 p-3 flex flex-col gap-1 text-xs leading-relaxed",
                      getLogBorderColor(log.type)
                    )}
                  >
                    <div className="flex items-center gap-2 select-none">
                      <span className="font-mono text-[11px] text-[#edf0ee] bg-[#19201d] border border-[#edf0ee]/[0.08] rounded px-1.5 py-0.5">
                        {log.agent}
                      </span>
                      <span className="text-xs text-[#727c75]">{log.action}</span>
                    </div>
                    <p className="text-xs text-[#a1aaa4] select-text">{log.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. AGENT TUNE MODAL */}
      {editingAgent && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121715] border border-[#edf0ee]/[0.12] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#edf0ee]/[0.08] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#34d399]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#edf0ee]">Configure: {editingAgent.name}</h3>
                  <p className="text-xs text-[#727c75] mt-0.5 font-mono">role:{editingAgent.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-[#a1aaa4]">Active</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editIsActive}
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={cn(
                    "w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer",
                    editIsActive ? "bg-[#34d399]" : "bg-[#19201d] border border-[#edf0ee]/15"
                  )}
                >
                  <span
                    className={cn(
                      "block w-3.5 h-3.5 rounded-full bg-[#080a09] transition-transform",
                      editIsActive ? "translate-x-3.5 bg-[#080a09]" : "translate-x-0 bg-[#727c75]"
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="p-1 rounded-md text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto console-scroll">
              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Description</label>
                <p className={cn(CONSOLE_SUBCARD, "text-xs text-[#a1aaa4] leading-relaxed select-text p-3")}>
                  {editingAgent.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">System instruction prompt</label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={4}
                  placeholder="Tune the system prompt instructions for this agent..."
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2.5 text-xs resize-none")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-2">Access permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: "read_crm", label: "Read customer CRM" },
                    { key: "write_calendar", label: "Write calendar bookings" },
                    { key: "write_tasks", label: "Create operational tasks" },
                    { key: "send_messages", label: "Send outbound messages" },
                  ].map((item) => {
                    const hasPerm = editPermissions.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => togglePermission(item.key)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-colors cursor-pointer",
                          hasPerm
                            ? "bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#edf0ee]"
                            : "bg-[#0d1210] border-[#edf0ee]/[0.08] text-[#a1aaa4] hover:bg-[#19201d]"
                        )}
                      >
                        <span>{item.label}</span>
                        <div
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                            hasPerm
                              ? "bg-[#34d399] border-[#34d399] text-[#080a09]"
                              : "border-[#edf0ee]/20 bg-[#121715]"
                          )}
                        >
                          {hasPerm && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#0c100e] border-t border-[#edf0ee]/[0.08] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingAgent(null)}
                className={CONSOLE_BTN_GHOST}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTune}
                className={CONSOLE_BTN_PRIMARY}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
