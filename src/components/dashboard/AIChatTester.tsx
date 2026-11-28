"use client";
import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, Brain, MessageSquare, RotateCcw, Send, Sparkles, Wrench } from "lucide-react";
import { useAuthStore, type Workflow } from "../../store/authStore";
import { useCrmStore } from "../../store/crmStore";
import { crmFetch } from "../../lib/crm/crmApi";
import type { AgentRole, AIIntelligenceTrace } from "../../lib/ai/types";
import {
  CONSOLE_PANEL_FLUSH,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_GHOST,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface PlaygroundMessage {
  sender: "user" | "ai";
  text: string;
  provider?: string;
  model?: string;
  sources?: string[];
  requiresHumanHandoff?: boolean;
  trace?: AIIntelligenceTrace | null;
}

interface SandboxApiResponse {
  success: boolean;
  configured: boolean;
  reply: string;
  model: string;
  provider: string;
  requiresHumanHandoff: boolean;
  handoffReason?: string;
  sources?: string[];
  trace?: AIIntelligenceTrace | null;
}

const ROLE_OPTIONS: Array<{ value: AgentRole; label: string }> = [
  { value: "receptionist", label: "Receptionist" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "appointment", label: "Booking" },
  { value: "order", label: "Orders" },
];

export function AIChatTester() {
  const workflows = useAuthStore((s) => s.workflows);
  const selectedId = useAuthStore((s) => s.selectedWorkflowId);
  const selected: Workflow | undefined = workflows.find((w) => w.id === selectedId) || workflows[0];

  const leads = useCrmStore((s) => s.leads);
  const fetchLeads = useCrmStore((s) => s.fetchLeads);

  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<AgentRole>("receptionist");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<PlaygroundMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (leads.length === 0) {
      fetchLeads().catch(() => {});
    }
  }, [leads.length, fetchLeads]);

  const handleSendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isAiTyping || !selected) return;

    const historySnapshot = chatMessages.slice(-16).map((m) => ({
      role: (m.sender === "user" ? "user" : "ai") as "user" | "ai",
      text: m.text,
    }));

    setChatInput("");
    setErrorBanner(null);
    setChatMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsAiTyping(true);

    const res = await crmFetch<SandboxApiResponse>("/api/ai/sandbox", {
      method: "POST",
      body: JSON.stringify({
        message: trimmed,
        role: selectedRole,
        agentName: selected.name,
        channel: selected.channel === "Reviews" ? "Sandbox" : selected.channel,
        tone: selected.aiTone,
        customPrompt: selected.customPrompt,
        leadId: selectedLeadId || null,
        history: historySnapshot,
        enableTools: true,
      }),
    });

    if (!res.ok || !res.data?.reply) {
      setErrorBanner(res.error || "Unable to reach AI intelligence pipeline.");
      setIsAiTyping(false);
      return;
    }

    const aiReply: PlaygroundMessage = {
      sender: "ai",
      text: res.data.reply,
      provider: res.data.provider,
      model: res.data.model,
      sources: res.data.sources || [],
      requiresHumanHandoff: res.data.requiresHumanHandoff,
      trace: res.data.trace || null,
    };

    setChatMessages((prev) => [...prev, aiReply]);
    setIsAiTyping(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  return (
    <div className={cn(CONSOLE_PANEL_FLUSH, "flex flex-col h-[560px]")}>
      <div className="px-4 py-3 border-b border-[#edf0ee]/[0.08] bg-[#0c100e] flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#34d399]" />
          <span className="text-xs font-medium text-[#edf0ee]">
            {selected ? `${selected.name} live simulator` : "AI intelligence simulator"}
          </span>
          <span className={CONSOLE_BADGE_LIVE}>Hybrid RAG + CRM</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as AgentRole)}
            aria-label="Specialist role"
            className={cn(CONSOLE_INPUT, "px-2 py-1 text-[11px] cursor-pointer")}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Role: {opt.label}
              </option>
            ))}
          </select>

          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            aria-label="CRM customer context"
            className={cn(CONSOLE_INPUT, "px-2 py-1 text-[11px] max-w-[180px] cursor-pointer")}
          >
            <option value="">Visitor (no CRM lead)</option>
            {leads.slice(0, 40).map((lead) => (
              <option key={lead.id} value={lead.id}>
                CRM: {lead.name || lead.email || lead.phone || lead.id.slice(0, 8)}
              </option>
            ))}
          </select>

          {chatMessages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setChatMessages([]);
                setErrorBanner(null);
              }}
              className={CONSOLE_BTN_GHOST}
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 console-scroll">
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 select-none">
            <MessageSquare className="w-7 h-7 text-[#727c75] mb-3" />
            <p className="text-sm font-medium text-[#edf0ee]">Test multi-turn AI intelligence</p>
            <p className="text-xs text-[#727c75] mt-1 max-w-sm leading-relaxed">
              Messages run through the live Context Assembler, Business Profile, CRM 360 dossier, Hybrid RAG knowledge retrieval, and Gemini/NVIDIA tool calling.
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col max-w-[88%]",
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <span className="text-[11px] text-[#727c75] mb-1 px-1 select-none">
              {msg.sender === "user" ? "Customer" : "Assistant"}
            </span>
            <div
              className={cn(
                "rounded-xl px-3.5 py-2.5 text-xs leading-relaxed border space-y-2",
                msg.sender === "user"
                  ? "bg-[#19201d] border-[#edf0ee]/10 text-[#edf0ee]"
                  : "bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#edf0ee]"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.sender === "ai" && msg.trace && (
                <div className="pt-2 border-t border-[#edf0ee]/[0.08] flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className={CONSOLE_BADGE_MUTED}>
                    {msg.provider} · {msg.trace.latencyMs}ms
                  </span>
                  <span className={CONSOLE_BADGE_MUTED}>
                    KB chunks: {msg.trace.ragChunksCount}
                  </span>
                  <span className={CONSOLE_BADGE_MUTED}>
                    Memories: {msg.trace.memoriesCount}
                  </span>
                  {msg.trace.crmLinked && (
                    <span className={CONSOLE_BADGE_LIVE}>CRM 360 linked</span>
                  )}
                  {msg.trace.toolNamesUsed.length > 0 && (
                    <span className={CONSOLE_BADGE_LIVE}>
                      <Wrench className="w-2.5 h-2.5" />
                      {msg.trace.toolNamesUsed.join(", ")}
                    </span>
                  )}
                  {msg.requiresHumanHandoff && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      Human handoff
                    </span>
                  )}
                </div>
              )}

              {msg.sender === "ai" && msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {msg.sources.slice(0, 4).map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 rounded bg-[#0d1210] border border-[#edf0ee]/10 px-1.5 py-0.5 text-[10px] text-[#a1aaa4]"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#4cc38a]" />
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {errorBanner && (
          <div className={cn(CONSOLE_SUBCARD, "p-3 border-[#e5484d]/30 bg-[#e5484d]/10 flex items-center gap-2 text-xs text-[#f28b8e]")}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {isAiTyping && (
          <div className="flex flex-col items-start max-w-[85%] select-none">
            <span className="text-[11px] text-[#727c75] mb-1 px-1">Assembling context & generating reply...</span>
            <div className="bg-[#0d1210] border border-[#edf0ee]/[0.08] rounded-xl px-4 py-3 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-[#34d399] rounded-full animate-[typing-dot_1.4s_infinite_0s]" />
              <span className="w-1.5 h-1.5 bg-[#34d399] rounded-full animate-[typing-dot_1.4s_infinite_0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#34d399] rounded-full animate-[typing-dot_1.4s_infinite_0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3.5 border-t border-[#edf0ee]/[0.08] bg-[#0d1210]">
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendChat();
            }}
            placeholder="Type a customer message to test real AI context..."
            className={cn(CONSOLE_INPUT, "flex-1 px-3.5 py-2 text-xs")}
          />
          <button
            type="button"
            onClick={handleSendChat}
            disabled={!chatInput.trim() || isAiTyping || !selected}
            className={cn(CONSOLE_BTN_PRIMARY, "px-4")}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
