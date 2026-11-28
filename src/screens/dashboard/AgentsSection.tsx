"use client";
import React, { useEffect, useState } from "react";
import {
  Bot,
  Shield,
  Play,
  Settings,
  Check,
  Save,
  Trash2,
  Database,
  Terminal,
  MessageSquare,
  User,
  RefreshCw,
  Plus,
  X,
  Building2,
  AlertCircle,
} from "lucide-react";
import { type Agent } from "../../store/authStore";
import { useAgentStore } from "../../store/agentStore";
import { useCrmStore } from "../../store/crmStore";
import { crmFetch } from "../../lib/crm/crmApi";
import type { AgentRole, AIIntelligenceTrace } from "../../lib/ai/types";
import type { BusinessReceptionistProfile, BusinessServiceItem } from "../../lib/ai/businessProfileService";
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

interface SimulationLogEntry {
  id: string;
  agent: string;
  action: string;
  detail: string;
  type: "trigger" | "handoff" | "memory" | "response" | "success" | "error";
}

export function AgentsSection() {
  const agents = useAgentStore((s) => s.agents) || [];
  const memories = useAgentStore((s) => s.agentMemories) || [];
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const addMemory = useAgentStore((s) => s.addMemory);
  const clearMemories = useAgentStore((s) => s.clearMemories);

  const leads = useCrmStore((s) => s.leads) || [];
  const fetchLeads = useCrmStore((s) => s.fetchLeads);

  const [activeTab, setActiveTab] = useState<"agents" | "business" | "memory" | "sandbox">("agents");

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newLead, setNewLead] = useState("");

  const [sandboxQuery, setSandboxQuery] = useState("");
  const [sandboxRole, setSandboxRole] = useState<AgentRole>("receptionist");
  const [sandboxLeadId, setSandboxLeadId] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<SimulationLogEntry[]>([]);
  const [simFinalResponse, setSimFinalResponse] = useState("");

  // Business Profile & Catalog editor state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("");
  const [bizLocation, setBizLocation] = useState("");
  const [bizTimezone, setBizTimezone] = useState("Europe/Berlin");
  const [bizDescription, setBizDescription] = useState("");
  const [bizCustomInstructions, setBizCustomInstructions] = useState("");
  const [bizHandoffRules, setBizHandoffRules] = useState("");
  const [bizCancellationPolicy, setBizCancellationPolicy] = useState("");
  const [bizServices, setBizServices] = useState<BusinessServiceItem[]>([]);
  const [bizFaqs, setBizFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("45");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  useEffect(() => {
    if (leads.length === 0) {
      fetchLeads().catch(() => {});
    } else if (!newLead && leads[0]?.id) {
      setNewLead(leads[0].id);
    }
  }, [leads, newLead, fetchLeads]);

  const loadBusinessProfile = async () => {
    setProfileLoading(true);
    const res = await crmFetch<{ profile: BusinessReceptionistProfile }>("/api/receptionist/settings");
    if (res.ok && res.data?.profile) {
      const p = res.data.profile;
      setBizName(p.businessName || "");
      setBizType(p.businessType || "");
      setBizLocation(p.location || "");
      setBizTimezone(p.timezone || "Europe/Berlin");
      setBizDescription(p.description || "");
      setBizCustomInstructions(p.customInstructions || "");
      setBizHandoffRules(p.handoffRules || "");
      setBizCancellationPolicy(p.policies?.cancellation || "");
      setBizServices(p.services || []);
      setBizFaqs(p.faqs || []);
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const handleSaveBusinessProfile = async () => {
    setProfileSaving(true);
    setProfileMessage(null);
    const res = await crmFetch<{ success: boolean; profile: BusinessReceptionistProfile }>(
      "/api/receptionist/settings",
      {
        method: "PUT",
        body: JSON.stringify({
          businessName: bizName.trim() || undefined,
          businessType: bizType.trim() || undefined,
          location: bizLocation.trim() || undefined,
          timezone: bizTimezone.trim() || "Europe/Berlin",
          description: bizDescription.trim() || undefined,
          customInstructions: bizCustomInstructions.trim() || undefined,
          handoffRules: bizHandoffRules.trim() || undefined,
          policies: { cancellation: bizCancellationPolicy.trim() || undefined },
          services: bizServices,
          faqs: bizFaqs,
        }),
      }
    );

    if (!res.ok) {
      setProfileMessage({ type: "err", text: res.error || "Failed to save business profile." });
    } else {
      setProfileMessage({ type: "ok", text: "Verified business profile saved across all AI channels." });
    }
    setProfileSaving(false);
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const numericPrice = Number(newServicePrice);
    const duration = Math.max(5, Number(newServiceDuration) || 45);
    setBizServices((prev) => [
      ...prev,
      {
        id: `svc-${Date.now()}`,
        name: newServiceName.trim(),
        priceEur: Number.isFinite(numericPrice) && numericPrice >= 0 ? numericPrice : undefined,
        currency: "EUR",
        durationMinutes: duration,
      },
    ]);
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDuration("45");
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setBizFaqs((prev) => [...prev, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ("");
    setNewFaqA("");
  };

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
      leadId: newLead || leads[0]?.id || "lead-general",
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
    setSimulationLogs([
      {
        id: `log-start-${Date.now()}`,
        agent: "Context Assembler",
        action: "Pipeline Dispatch",
        detail: `Executing ${sandboxRole} agent with Business Profile, CRM dossier${sandboxLeadId ? ` (${sandboxLeadId.slice(0, 8)})` : ""}, Hybrid RAG & tools...`,
        type: "trigger",
      },
    ]);
    setSimFinalResponse("");

    const res = await crmFetch<{
      success: boolean;
      reply: string;
      model: string;
      provider: string;
      requiresHumanHandoff: boolean;
      handoffReason?: string;
      sources?: string[];
      toolExecutions?: Array<{ tool: string; input: any; result: any }>;
      trace?: AIIntelligenceTrace | null;
    }>("/api/ai/sandbox", {
      method: "POST",
      body: JSON.stringify({
        message: sandboxQuery.trim(),
        role: sandboxRole,
        channel: "Sandbox",
        leadId: sandboxLeadId || null,
        enableTools: true,
      }),
    });

    if (!res.ok || !res.data) {
      setSimulationLogs((prev) => [
        ...prev,
        {
          id: `log-err-${Date.now()}`,
          agent: "Gateway",
          action: "Execution Failed",
          detail: res.error || "Unable to execute sandbox simulation.",
          type: "error",
        },
      ]);
      setIsSimulating(false);
      return;
    }

    const trace = res.data.trace;
    const nextLogs: SimulationLogEntry[] = [
      {
        id: `log-ctx-${Date.now()}`,
        agent: "Context Assembler",
        action: "Grounded Context Loaded",
        detail: `Sources: ${(trace?.contextSourcesUsed || []).join(", ") || "Base Role"} · KB chunks: ${trace?.ragChunksCount ?? 0} · Memories: ${trace?.memoriesCount ?? 0} · CRM Linked: ${trace?.crmLinked ? "Yes" : "No"}`,
        type: "memory",
      },
    ];

    for (const exec of res.data.toolExecutions || []) {
      nextLogs.push({
        id: `log-tool-${Date.now()}-${Math.random()}`,
        agent: "ToolExecutor",
        action: exec.tool,
        detail: exec.result?.success
          ? `Succeeded: ${JSON.stringify(exec.result.data || {}).slice(0, 160)}`
          : `Blocked/Error: ${exec.result?.error || "Rejected"}`,
        type: exec.result?.success ? "handoff" : "error",
      });
    }

    if (res.data.requiresHumanHandoff) {
      nextLogs.push({
        id: `log-handoff-${Date.now()}`,
        agent: "Handoff Gate",
        action: "Escalated to Staff",
        detail: res.data.handoffReason || "Human escalation triggered.",
        type: "handoff",
      });
    }

    nextLogs.push({
      id: `log-done-${Date.now()}`,
      agent: `LLM (${res.data.provider})`,
      action: res.data.model,
      detail: `Completed in ${trace?.latencyMs ?? 0}ms · Intent: ${trace?.intent || sandboxRole} · Citations: ${(res.data.sources || []).join(", ") || "None"}`,
      type: "success",
    });

    setSimulationLogs((prev) => [...prev, ...nextLogs]);
    setSimFinalResponse(res.data.reply);
    setIsSimulating(false);
  };

  const getLogBorderColor = (type: SimulationLogEntry["type"]) => {
    switch (type) {
      case "trigger":
        return "border-l-[#727c75] text-[#a1aaa4]";
      case "handoff":
        return "border-l-sky-300 text-sky-300";
      case "memory":
        return "border-l-amber-300 text-amber-300";
      case "response":
        return "border-l-[#a1aaa4] text-[#edf0ee]";
      case "error":
        return "border-l-[#e5484d] text-[#f28b8e]";
      case "success":
        return "border-l-[#34d399] text-[#4cc38a]";
      default:
        return "border-l-[#727c75] text-[#a1aaa4]";
    }
  };

  const resolveLeadLabel = (leadId: string | null) => {
    if (!leadId) return "Workspace general";
    const found = leads.find((l) => l.id === leadId);
    if (found) return found.name || found.email || found.phone || leadId.slice(0, 8);
    if (leadId === "lead-1") return "Sample Client #1";
    if (leadId === "lead-2") return "Sample Client #2";
    return leadId.slice(0, 12);
  };

  return (
    <div className="space-y-6 select-none pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#edf0ee]/[0.08] pb-4">
        <div>
          <h2 className={CONSOLE_HEADING}>AI agents & receptionist brain</h2>
          <p className="text-xs text-[#727c75] mt-1">
            Configure specialist agents, verified business catalog & policies, CRM customer memories, and live pipeline traces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#0c100e] border border-[#edf0ee]/[0.08] p-1 self-start">
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
            onClick={() => setActiveTab("business")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              activeTab === "business"
                ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                : "text-[#727c75] hover:text-[#edf0ee]"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business Profile</span>
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
                    <span>{memories.length} records</span>
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

      {/* 2. BUSINESS PROFILE & CATALOG TAB */}
      {activeTab === "business" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className={cn(CONSOLE_PANEL, "space-y-4")}>
            <div className="flex items-center justify-between border-b border-[#edf0ee]/[0.08] pb-3">
              <div>
                <h3 className={CONSOLE_SECTION_TITLE}>Business identity & guardrails</h3>
                <p className="text-xs text-[#727c75] mt-0.5">
                  Source of truth injected into every receptionist & web chat reply
                </p>
              </div>
              {profileLoading && <RefreshCw className="w-4 h-4 text-[#727c75] animate-spin" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Business name</label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Your Workspace / Company Name"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Industry / type</label>
                <input
                  type="text"
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                  placeholder="e.g. SaaS, Clinic, Legal, Salon"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Location / city</label>
                <input
                  type="text"
                  value={bizLocation}
                  onChange={(e) => setBizLocation(e.target.value)}
                  placeholder="e.g. Berlin / Remote"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Timezone</label>
                <input
                  type="text"
                  value={bizTimezone}
                  onChange={(e) => setBizTimezone(e.target.value)}
                  placeholder="Europe/Berlin"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Overview description</label>
              <textarea
                rows={2}
                value={bizDescription}
                onChange={(e) => setBizDescription(e.target.value)}
                placeholder="Short summary of what your organization delivers..."
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs resize-none")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Cancellation & booking policy</label>
              <input
                type="text"
                value={bizCancellationPolicy}
                onChange={(e) => setBizCancellationPolicy(e.target.value)}
                placeholder="e.g. Free reschedule up to 24 hours ahead"
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Custom receptionist instructions</label>
              <textarea
                rows={3}
                value={bizCustomInstructions}
                onChange={(e) => setBizCustomInstructions(e.target.value)}
                placeholder="Tone guidelines, qualification questions, or compliance reminders..."
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs resize-none")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1">Human escalation rules</label>
              <input
                type="text"
                value={bizHandoffRules}
                onChange={(e) => setBizHandoffRules(e.target.value)}
                placeholder="e.g. Escalate billing disputes or enterprise custom quotes"
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
              />
            </div>

            {profileMessage && (
              <div
                className={cn(
                  "rounded-lg border p-3 text-xs flex items-center gap-2",
                  profileMessage.type === "ok"
                    ? "bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#4cc38a]"
                    : "bg-[#e5484d]/10 border-[#e5484d]/25 text-[#f28b8e]"
                )}
              >
                {profileMessage.type === "err" && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveBusinessProfile}
              disabled={profileSaving}
              className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5")}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{profileSaving ? "Saving..." : "Save verified profile"}</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Services Catalog */}
            <div className={cn(CONSOLE_PANEL, "space-y-4")}>
              <h3 className={CONSOLE_SECTION_TITLE}>Services & pricing catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Service name"
                  className={cn(CONSOLE_INPUT, "sm:col-span-2 px-3 py-2 text-xs")}
                />
                <input
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="Price (EUR)"
                  className={cn(CONSOLE_INPUT, "px-3 py-2 text-xs")}
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  disabled={!newServiceName.trim()}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {bizServices.length === 0 ? (
                <p className="text-xs text-[#727c75] py-2">
                  No verified services listed yet. Add services above so the AI never guesses pricing.
                </p>
              ) : (
                <div className="space-y-2">
                  {bizServices.map((svc, idx) => (
                    <div
                      key={svc.id || idx}
                      className={cn(CONSOLE_SUBCARD, "px-3 py-2 flex items-center justify-between text-xs")}
                    >
                      <div>
                        <span className="font-medium text-[#edf0ee]">{svc.name}</span>
                        <span className="text-[#727c75] ml-2">
                          {svc.priceEur !== undefined ? `€${svc.priceEur}` : "Custom"} · {svc.durationMinutes} min
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBizServices((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-[#727c75] hover:text-[#f28b8e] p-1 cursor-pointer"
                        aria-label="Remove service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verified FAQs */}
            <div className={cn(CONSOLE_PANEL, "space-y-4")}>
              <h3 className={CONSOLE_SECTION_TITLE}>Verified FAQs</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  placeholder="Customer question (e.g. Do you offer onboarding?)"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFaqA}
                    onChange={(e) => setNewFaqA(e.target.value)}
                    placeholder="Verified answer"
                    className={cn(CONSOLE_INPUT, "flex-1 px-3 py-2 text-xs")}
                  />
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    disabled={!newFaqQ.trim() || !newFaqA.trim()}
                    className={CONSOLE_BTN_SECONDARY}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add FAQ</span>
                  </button>
                </div>
              </div>

              {bizFaqs.length > 0 && (
                <div className="space-y-2 max-h-[240px] overflow-y-auto console-scroll pr-1">
                  {bizFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className={cn(CONSOLE_SUBCARD, "p-3 flex items-start justify-between gap-2 text-xs")}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-[#edf0ee]">{faq.question}</p>
                        <p className="text-[#a1aaa4] leading-relaxed">{faq.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBizFaqs((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-[#727c75] hover:text-[#f28b8e] p-1 cursor-pointer shrink-0"
                        aria-label="Remove FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MEMORY TAB */}
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
                  {leads.length === 0 ? (
                    <option value="lead-general">Workspace default customer</option>
                  ) : (
                    leads.slice(0, 50).map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name || l.email || l.phone || l.id.slice(0, 8)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Memory key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. preferred_channel"
                  className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs font-mono")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. Prefers morning slots & German replies"
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
                  Specialist agents save customer preferences automatically during live conversations or manually here.
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
                            <span>{resolveLeadLabel(mem.leadId)}</span>
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

      {/* 4. ORCHESTRATION SANDBOX TAB */}
      {activeTab === "sandbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className={cn(CONSOLE_PANEL, "space-y-4 select-none")}>
            <div>
              <h3 className={CONSOLE_SECTION_TITLE}>Live pipeline trace sandbox</h3>
              <p className="text-xs text-[#727c75] mt-1 leading-relaxed">
                Runs your real Context Assembler, CRM 360 Dossier, Hybrid RAG retrieval, and LLM tool calls end-to-end.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={sandboxRole}
                onChange={(e) => setSandboxRole(e.target.value as AgentRole)}
                aria-label="Sandbox agent role"
                className={cn(CONSOLE_INPUT, "px-3 py-2 text-xs cursor-pointer")}
              >
                <option value="receptionist">Receptionist</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="appointment">Booking</option>
                <option value="order">Order Tracking</option>
              </select>

              <select
                value={sandboxLeadId}
                onChange={(e) => setSandboxLeadId(e.target.value)}
                aria-label="Sandbox CRM lead"
                className={cn(CONSOLE_INPUT, "px-3 py-2 text-xs cursor-pointer")}
              >
                <option value="">No CRM lead (anonymous)</option>
                {leads.slice(0, 40).map((l) => (
                  <option key={l.id} value={l.id}>
                    Lead: {l.name || l.email || l.phone || l.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <textarea
                value={sandboxQuery}
                onChange={(e) => setSandboxQuery(e.target.value)}
                rows={3}
                placeholder="Ask about services, prices, available appointment times tomorrow, or escalation..."
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2.5 text-xs resize-none")}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSandboxQuery(
                      "What services do you offer and what appointment times are available tomorrow?"
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
                  <span>Live assistant output</span>
                </span>
                <p className={cn(CONSOLE_SUBCARD, "p-3.5 text-xs text-[#edf0ee] leading-relaxed select-text whitespace-pre-wrap")}>
                  {simFinalResponse}
                </p>
              </div>
            )}
          </div>

          <div className={cn(CONSOLE_PANEL, "flex flex-col min-h-[460px]")}>
            <div className="text-xs font-medium text-[#edf0ee] flex items-center gap-2 border-b border-[#edf0ee]/[0.08] pb-3">
              <RefreshCw className={cn("w-3.5 h-3.5 text-[#a1aaa4]", isSimulating && "animate-spin text-[#34d399]")} />
              <span>Pipeline execution trace</span>
            </div>

            {simulationLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <Play className="w-7 h-7 text-[#727c75] mb-3" />
                <p className="text-sm font-medium text-[#edf0ee]">Awaiting execution trace</p>
                <p className="text-xs text-[#727c75] mt-1 max-w-[260px] leading-relaxed">
                  Context sources, RAG hits, tool executions, and LLM latency will stream here from /api/ai/sandbox.
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

      {/* 5. AGENT TUNE MODAL */}
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
