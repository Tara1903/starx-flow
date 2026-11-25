"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Phone,
  Bot,
  UserCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Instagram,
  Activity,
  Lock,
} from "lucide-react";
import type { SupportData, SupportConversation } from "../../store/adminStore";
import { cn } from "../../lib/utils";

interface AdminSupportViewProps {
  supportData: SupportData | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onRefresh: () => void;
  onOpenLeads: () => void;
  onSendReply: (
    conversationId: string,
    content: string,
    isInternal?: boolean
  ) => Promise<{ success: boolean; error: string | null }>;
  onToggleControl: (
    conversationId: string,
    controlMode: "ai" | "human"
  ) => Promise<{ success: boolean; error: string | null }>;
}

function formatShortTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminSupportView({
  supportData,
  isLoading,
  error,
  searchQuery,
  onRefresh,
  onOpenLeads,
  onSendReply,
  onToggleControl,
}: AdminSupportViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const conversations = useMemo(() => {
    const list = supportData?.conversations || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.customer_name || "").toLowerCase().includes(q) ||
        (c.customer_phone || "").toLowerCase().includes(q) ||
        (c.customer_email || "").toLowerCase().includes(q) ||
        (c.last_message || "").toLowerCase().includes(q)
    );
  }, [supportData?.conversations, searchQuery]);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedId(null);
      return;
    }
    const stillExists = selectedId && conversations.some((c) => c.id === selectedId);
    if (!stillExists) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const activeConversation: SupportConversation | null = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const handleCopyWebhook = async () => {
    const url = supportData?.connection?.webhookUrl;
    if (!url || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 1800);
    } catch {
      // Clipboard blocked in non-HTTPS context
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !replyText.trim() || isSending) return;
    setIsSending(true);
    setFeedback(null);
    const result = await onSendReply(activeConversation.id, replyText.trim(), isInternalNote);
    setIsSending(false);
    if (result.success) {
      setReplyText("");
      setFeedback({
        type: "ok",
        text: isInternalNote
          ? "Internal admin note saved to conversation timeline."
          : "Reply dispatched live to WhatsApp via Meta Cloud API.",
      });
    } else {
      setFeedback({
        type: "err",
        text: result.error || "Failed to dispatch WhatsApp reply.",
      });
    }
  };

  const handleToggleControl = async () => {
    if (!activeConversation || isToggling) return;
    const nextMode = activeConversation.control_mode === "human" ? "ai" : "human";
    setIsToggling(true);
    setFeedback(null);
    const result = await onToggleControl(activeConversation.id, nextMode);
    setIsToggling(false);
    if (result.success) {
      setFeedback({
        type: "ok",
        text:
          nextMode === "human"
            ? "Manual Admin takeover active — AI auto-reply paused for this thread."
            : "Conversation released back to StarX Flow Support AI.",
      });
    } else {
      setFeedback({
        type: "err",
        text: result.error || "Unable to switch conversation control mode.",
      });
    }
  };

  const conn = supportData?.connection;
  const profile = supportData?.profile;
  const instagram = supportData?.instagram;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  conn?.isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                )}
              />
              Admin Support Channel
            </span>
            <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
              {conversations.length} Active Thread{conversations.length === 1 ? "" : "s"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
            StarX Flow Official WhatsApp Support
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Live Meta Cloud API number telemetry, AI Support Receptionist persona, and human takeover inbox.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenLeads}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-zinc-200 transition-colors cursor-pointer"
          >
            <span>WhatsApp Demo Leads</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] tabular-nums">
              {supportData?.whatsappLeadsCount ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
            <span>Sync Support Cell</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-xs text-rose-200 flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Meta WhatsApp Line */}
        <div className="rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Phone size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">Official Support Number</p>
                <p className="text-sm font-bold text-white font-mono">
                  {conn?.displayPhoneNumber || "+1 555-155-5475"}
                </p>
              </div>
            </div>

            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                conn?.isConnected
                  ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-300"
                  : "bg-amber-500/15 border-amber-400/35 text-amber-300"
              )}
            >
              {conn?.isConnected ? "Connected" : "Pending"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[11px]">
            <div>
              <span className="text-zinc-400 block">Phone Number ID</span>
              <span className="text-zinc-200 font-mono truncate block">
                {conn?.phoneNumberId || "1460999263760910"}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">WABA ID</span>
              <span className="text-zinc-200 font-mono truncate block">
                {conn?.wabaId || "1139426225454489"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-300 pt-1">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck size={13} />
              {conn?.tokenConfigured ? "Permanent System User Token" : "Token Missing"}
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">
              {conn?.tokenSource === "connected_channels" ? "DB + Env" : conn?.tokenSource || "none"}
            </span>
          </div>
        </div>

        {/* Card 2: Active AI Support Persona */}
        <div className="rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Bot size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">Configured Business Persona</p>
                <p className="text-sm font-bold text-white truncate max-w-[210px]">
                  {profile?.businessName || "StarX Flow Official Support"}
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono text-zinc-300 tabular-nums">
              {profile?.services?.length ?? 0} Plans/Slots
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
            {profile?.aiRole || "StarX Flow Official Customer Support & Onboarding Specialist"}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px]">
            <a
              href={profile?.bookingLink || "/setup/whatsapp"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium"
            >
              <span>Onboarding Portal</span>
              <ExternalLink size={12} />
            </a>
            <span className="text-zinc-400 text-[10px]">Org Scope: Command</span>
          </div>
        </div>

        {/* Card 3: Webhook & Cross-Channel Sync */}
        <div className="rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Activity size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">Webhook &amp; Channel Bridge</p>
                <p className="text-xs font-medium text-emerald-300">Admin Cell Realtime Synced</p>
              </div>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                instagram?.isConnected
                  ? "bg-emerald-500/10 border-emerald-400/25 text-emerald-300"
                  : "bg-white/[0.05] border-white/10 text-zinc-400"
              )}
            >
              <Instagram size={11} />
              <span>{instagram?.isConnected ? "IG Linked" : "IG Standby"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-2.5 py-2">
            <code className="text-[10px] text-zinc-200 font-mono truncate flex-1">
              {conn?.webhookUrl || "https://starx-flow.runs-on.dev/api/whatsapp/webhook"}
            </code>
            <button
              type="button"
              onClick={handleCopyWebhook}
              aria-label="Copy WhatsApp webhook URL"
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {copiedWebhook ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Last Synced</span>
            <span className="font-mono text-zinc-300">
              {conn?.lastSynced ? formatShortTime(conn.lastSynced) : "Live on webhook"}
            </span>
          </div>
        </div>
      </div>

      {/* Configured USD Rates & Services Bar */}
      {profile && profile.services.length > 0 && (
        <div className="rounded-2xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/15 px-5 py-3.5 flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 mr-1">
            Live AI Quoted Plans:
          </span>
          {profile.services.map((svc) => (
            <span
              key={svc.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-zinc-200 tabular-nums"
            >
              <span className="font-medium text-white">{svc.name}</span>
              <span className="text-emerald-300 font-mono font-semibold">
                {svc.currency === "USD" ? "$" : "€"}
                {svc.price}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Main Split Support Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[460px]">
        {/* Left Thread List */}
        <div className="lg:col-span-4 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Support Conversations
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06] max-h-[480px]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                No WhatsApp Support threads yet. Any message sent to{" "}
                <span className="text-emerald-300 font-mono">+1 555-155-5475</span> appears here live.
              </div>
            ) : (
              conversations.map((convo) => {
                const isSelected = convo.id === activeConversation?.id;
                const isHuman = convo.control_mode === "human";
                return (
                  <button
                    key={convo.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(convo.id);
                      setFeedback(null);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3.5 transition-colors cursor-pointer",
                      isSelected
                        ? "bg-emerald-500/[0.14] border-l-2 border-l-emerald-400"
                        : "hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {convo.customer_name || convo.customer_phone || "WhatsApp Visitor"}
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0",
                          isHuman
                            ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                            : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
                        )}
                      >
                        {isHuman ? "Human" : "AI Auto"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                      <span className="font-mono truncate">
                        {convo.customer_phone || "No phone"}
                      </span>
                      <span className="text-[10px] shrink-0">
                        {formatShortTime(convo.updated_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 line-clamp-1 mt-1.5">
                      {convo.last_message || "Started WhatsApp Support chat"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Thread */}
        <div className="lg:col-span-8 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 flex flex-col overflow-hidden">
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare size={28} className="text-emerald-400/60 mb-2" />
              <p className="text-sm font-semibold text-zinc-200">Select a WhatsApp Support Thread</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Inspect AI replies, take over control manually, or send direct WhatsApp messages from the Admin Cell.
              </p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-5 py-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {activeConversation.customer_name || "WhatsApp Customer"}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {activeConversation.customer_phone || ""}
                    </span>
                  </div>
                  {activeConversation.customer_email && (
                    <p className="text-[11px] text-emerald-300 font-mono">
                      {activeConversation.customer_email}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleToggleControl}
                  disabled={isToggling}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-60",
                    activeConversation.control_mode === "human"
                      ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-200 hover:bg-emerald-500/25"
                      : "bg-amber-500/15 border-amber-400/35 text-amber-200 hover:bg-amber-500/25"
                  )}
                >
                  {activeConversation.control_mode === "human" ? (
                    <>
                      <Bot size={14} />
                      <span>Release to Support AI</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} />
                      <span>Take Over (Human Admin)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
                {activeConversation.messages && activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((m) => {
                    const isCustomer = m.role === "customer";
                    const isInternal = Boolean(m.is_internal);
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex flex-col max-w-[84%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                          isCustomer
                            ? "self-start mr-auto bg-white/[0.06] border border-white/10 text-zinc-100"
                            : isInternal
                              ? "self-end ml-auto bg-amber-500/15 border border-amber-400/30 text-amber-100"
                              : m.role === "human"
                                ? "self-end ml-auto bg-cyan-500/15 border border-cyan-400/30 text-cyan-50"
                                : "self-end ml-auto bg-emerald-500/15 border border-emerald-400/30 text-emerald-50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] mb-1 opacity-80">
                          <span className="font-semibold flex items-center gap-1">
                            {isInternal && <Lock size={10} />}
                            {isCustomer
                              ? activeConversation.customer_name || "Customer"
                              : isInternal
                                ? "Internal Admin Note"
                                : m.role === "human"
                                  ? m.agent_name || "Admin Agent"
                                  : "StarX Flow Support AI"}
                          </span>
                          <span className="font-mono">{formatShortTime(m.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-zinc-400 text-center py-8">
                    No messages recorded in this thread yet.
                  </p>
                )}
              </div>

              {/* Feedback Toast */}
              {feedback && (
                <div
                  className={cn(
                    "mx-4 mb-2 px-3 py-2 rounded-xl text-[11px] flex items-center gap-2 border",
                    feedback.type === "ok"
                      ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200"
                      : "bg-rose-500/10 border-rose-400/30 text-rose-200"
                  )}
                >
                  {feedback.type === "ok" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Composer */}
              <form
                onSubmit={handleSubmitReply}
                className="p-3.5 border-t border-white/[0.08] bg-white/[0.02] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-emerald-400 focus:ring-emerald-400"
                    />
                    <span>Save as internal Admin note only (do not send to WhatsApp)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? "Add internal admin note..."
                        : "Reply directly to customer on WhatsApp (+1 555-155-5475)..."
                    }
                    className="flex-1 h-10 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-emerald-400/60 text-xs text-white placeholder-zinc-400 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{isSending ? "Sending..." : isInternalNote ? "Save Note" : "Send WhatsApp"}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Telemetry Logs */}
      {supportData && supportData.logs.length > 0 && (
        <div className="rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 p-4 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Recent WhatsApp Cloud API &amp; AI Telemetry
          </h3>
          <div className="divide-y divide-white/[0.05] max-h-48 overflow-y-auto">
            {supportData.logs.map((log) => (
              <div
                key={log.id}
                className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded font-mono text-[10px] uppercase shrink-0",
                      log.type === "error"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-emerald-500/15 text-emerald-300"
                    )}
                  >
                    {log.type}
                  </span>
                  <span className="text-zinc-200 truncate">{log.message}</span>
                </div>
                <span className="text-zinc-400 font-mono text-[10px] shrink-0">
                  {formatShortTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
