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
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Instagram,
  Lock,
  Link2,
} from "lucide-react";
import type { SupportData, SupportConversation } from "../../store/adminStore";
import { syncAccessTokenCookie } from "../../lib/auth/clientCookie";
import {
  CONSOLE_PANEL,
  CONSOLE_PANEL_FLUSH,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_DANGER,
} from "../../lib/consoleSurface";
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
  onConnectInstagram: (params: {
    igAccountId: string;
    pageId?: string;
    username?: string;
    accessToken?: string;
  }) => Promise<{ success: boolean; error: string | null }>;
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
  onConnectInstagram,
}: AdminSupportViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<"all" | "whatsapp" | "instagram">("all");
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<"wa" | "ig" | null>(null);

  const [showIgForm, setShowIgForm] = useState(false);
  const [igAccountIdInput, setIgAccountIdInput] = useState("");
  const [igPageIdInput, setIgPageIdInput] = useState("");
  const [igUsernameInput, setIgUsernameInput] = useState("");
  const [igTokenInput, setIgTokenInput] = useState("");
  const [isSavingIg, setIsSavingIg] = useState(false);

  const conversations = useMemo(() => {
    const list = supportData?.conversations || [];
    const byChannel =
      channelFilter === "all"
        ? list
        : list.filter((c) => String(c.channel || "").toLowerCase() === channelFilter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byChannel;
    return byChannel.filter(
      (c) =>
        (c.customer_name || "").toLowerCase().includes(q) ||
        (c.customer_phone || "").toLowerCase().includes(q) ||
        (c.customer_email || "").toLowerCase().includes(q) ||
        (c.last_message || "").toLowerCase().includes(q)
    );
  }, [supportData?.conversations, channelFilter, searchQuery]);

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

  const handleCopyUrl = async (target: "wa" | "ig", url?: string) => {
    if (!url || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 1800);
    } catch {
      // Clipboard unavailable
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
          ? "Internal admin note saved to timeline."
          : `Reply dispatched via ${activeConversation.channel || "WhatsApp"}.`,
      });
    } else {
      setFeedback({
        type: "err",
        text: result.error || "Failed to send support reply.",
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
            ? "Manual takeover active. AI auto-reply paused for this thread."
            : "Conversation returned to StarX Flow Support AI.",
      });
    } else {
      setFeedback({
        type: "err",
        text: result.error || "Unable to switch control mode.",
      });
    }
  };

  const handleConnectInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!igAccountIdInput.trim() && !igPageIdInput.trim()) || isSavingIg) return;
    setIsSavingIg(true);
    setFeedback(null);
    const res = await onConnectInstagram({
      igAccountId: igAccountIdInput.trim(),
      pageId: igPageIdInput.trim() || undefined,
      username: igUsernameInput.trim() || undefined,
      accessToken: igTokenInput.trim() || undefined,
    });
    setIsSavingIg(false);
    if (res.success) {
      setShowIgForm(false);
      setIgTokenInput("");
      setFeedback({
        type: "ok",
        text: "Instagram account linked to admin support webhook.",
      });
    } else {
      setFeedback({
        type: "err",
        text: res.error || "Unable to save Instagram connection.",
      });
    }
  };

  const conn = supportData?.connection;
  const profile = supportData?.profile;
  const instagram = supportData?.instagram;

  return (
    <div className="space-y-6 pb-8 select-none tabular-nums">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={CONSOLE_HEADING}>Support desk</h1>
            <span className={conn?.isConnected ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_WARN}>
              {conversations.length} thread{conversations.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            WhatsApp Cloud API, Instagram DM bridge, and operator takeover inbox
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIgAccountIdInput(instagram?.accountId || "");
              setIgPageIdInput(instagram?.pageId || "");
              setIgUsernameInput(instagram?.username?.replace(/^@/, "") || "");
              setShowIgForm((prev) => !prev);
            }}
            className={CONSOLE_BTN_SECONDARY}
          >
            <Instagram className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
            <span>{instagram?.isConnected ? "Update Instagram" : "Link Instagram"}</span>
          </button>

          <button type="button" onClick={onOpenLeads} className={CONSOLE_BTN_SECONDARY}>
            <span>Support leads</span>
            <span className="font-mono text-[11px] text-[#a1aaa4]">
              ({supportData?.whatsappLeadsCount ?? 0})
            </span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className={CONSOLE_BTN_PRIMARY}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            <span>Sync inbox</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-[#e5484d]/10 border border-[#e5484d]/25 px-4 py-3 text-xs text-[#f28b8e] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Connect Instagram Form */}
      {showIgForm && (
        <form onSubmit={handleConnectInstagramSubmit} className={cn(CONSOLE_PANEL, "space-y-4")}>
          <div>
            <h2 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
              <Instagram className="w-4 h-4 text-[#a1aaa4]" strokeWidth={1.65} />
              Connect Instagram account
            </h2>
            <p className="text-xs text-[#727c75] mt-1">
              Save your Instagram Professional IDs from Meta Business Suite (leave token blank to reuse the system user token).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Instagram account ID *</label>
              <input
                type="text"
                value={igAccountIdInput}
                onChange={(e) => setIgAccountIdInput(e.target.value)}
                placeholder="17841400000000000"
                className={cn(CONSOLE_INPUT, "w-full h-9 px-3 text-xs font-mono")}
              />
            </div>

            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">FB page ID (optional)</label>
              <input
                type="text"
                value={igPageIdInput}
                onChange={(e) => setIgPageIdInput(e.target.value)}
                placeholder="122098765432100"
                className={cn(CONSOLE_INPUT, "w-full h-9 px-3 text-xs font-mono")}
              />
            </div>

            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Instagram handle</label>
              <input
                type="text"
                value={igUsernameInput}
                onChange={(e) => setIgUsernameInput(e.target.value)}
                placeholder="starxflow"
                className={cn(CONSOLE_INPUT, "w-full h-9 px-3 text-xs")}
              />
            </div>

            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Access token (optional)</label>
              <input
                type="password"
                value={igTokenInput}
                onChange={(e) => setIgTokenInput(e.target.value)}
                placeholder="Optional custom token"
                className={cn(CONSOLE_INPUT, "w-full h-9 px-3 text-xs font-mono")}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <a
              href="/api/meta/auth?channel=instagram&returnTo=admin"
              onClick={async (e) => {
                e.preventDefault();
                await syncAccessTokenCookie();
                window.location.href = "/api/meta/auth?channel=instagram&returnTo=admin";
              }}
              className={CONSOLE_BTN_SECONDARY}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Authorize via Meta login</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowIgForm(false)}
                className={CONSOLE_BTN_SECONDARY}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingIg || (!igAccountIdInput.trim() && !igPageIdInput.trim())}
                className={CONSOLE_BTN_PRIMARY}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{isSavingIg ? "Saving..." : "Save connection"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3 Channel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn(CONSOLE_PANEL, "space-y-3")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#a1aaa4]">
                <Phone className="w-4 h-4" strokeWidth={1.65} />
              </div>
              <div>
                <p className="text-xs text-[#727c75]">WhatsApp line</p>
                <p className="text-sm font-medium text-[#edf0ee] font-mono">
                  {conn?.displayPhoneNumber || "+1 555-155-5475"}
                </p>
              </div>
            </div>
            <span className={conn?.isConnected ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_WARN}>
              {conn?.isConnected ? "Connected" : "Pending"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#edf0ee]/[0.06] text-[11px]">
            <div>
              <span className="text-[#727c75] block">Phone ID</span>
              <span className="text-[#a1aaa4] font-mono truncate block">
                {conn?.phoneNumberId || "1460999263760910"}
              </span>
            </div>
            <div>
              <span className="text-[#727c75] block">WABA ID</span>
              <span className="text-[#a1aaa4] font-mono truncate block">
                {conn?.wabaId || "1139426225454489"}
              </span>
            </div>
          </div>

          <div className={cn(CONSOLE_SUBCARD, "flex items-center gap-2 px-2.5 py-1.5")}>
            <code className="text-[11px] text-[#a1aaa4] font-mono truncate flex-1">
              {conn?.webhookUrl || "https://starx-flow.runs-on.dev/api/whatsapp/webhook"}
            </code>
            <button
              type="button"
              onClick={() => handleCopyUrl("wa", conn?.webhookUrl)}
              aria-label="Copy WhatsApp webhook URL"
              className="p-1 rounded text-[#727c75] hover:text-[#edf0ee] transition-colors cursor-pointer"
            >
              {copiedTarget === "wa" ? <Check className="w-3.5 h-3.5 text-[#4cc38a]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL, "space-y-3")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#a1aaa4]">
                <Bot className="w-4 h-4" strokeWidth={1.65} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#727c75]">Support persona</p>
                <p className="text-sm font-medium text-[#edf0ee] truncate">
                  {profile?.businessName || "StarX Flow Support"}
                </p>
              </div>
            </div>
            <span className={CONSOLE_BADGE_MUTED}>
              {profile?.services?.length ?? 0} plans
            </span>
          </div>

          <p className="text-xs text-[#a1aaa4] line-clamp-2 leading-relaxed">
            {profile?.aiRole || "Platform support and onboarding specialist"}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#edf0ee]/[0.06] text-xs">
            <a
              href={profile?.bookingLink || "/setup/instagram"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#4cc38a] hover:underline font-medium"
            >
              <span>Onboarding portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#727c75] text-[11px]">System token active</span>
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL, "space-y-3")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#a1aaa4]">
                <Instagram className="w-4 h-4" strokeWidth={1.65} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#727c75]">Instagram DM</p>
                <p className="text-sm font-medium text-[#edf0ee] font-mono truncate max-w-[160px]">
                  {instagram?.username
                    ? `@${instagram.username.replace(/^@/, "")}`
                    : instagram?.accountId || "Not linked"}
                </p>
              </div>
            </div>
            <span className={instagram?.isConnected ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
              {instagram?.isConnected ? "Connected" : "Standby"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#edf0ee]/[0.06] text-[11px]">
            <div>
              <span className="text-[#727c75] block">IG account ID</span>
              <span className="text-[#a1aaa4] font-mono truncate block">
                {instagram?.accountId || "Pending"}
              </span>
            </div>
            <div>
              <span className="text-[#727c75] block">FB page ID</span>
              <span className="text-[#a1aaa4] font-mono truncate block">
                {instagram?.pageId || "Optional"}
              </span>
            </div>
          </div>

          <div className={cn(CONSOLE_SUBCARD, "flex items-center gap-2 px-2.5 py-1.5")}>
            <code className="text-[11px] text-[#a1aaa4] font-mono truncate flex-1">
              {instagram?.webhookUrl || "https://starx-flow.runs-on.dev/api/integrations/instagram/webhook"}
            </code>
            <button
              type="button"
              onClick={() => handleCopyUrl("ig", instagram?.webhookUrl)}
              aria-label="Copy Instagram webhook URL"
              className="p-1 rounded text-[#727c75] hover:text-[#edf0ee] transition-colors cursor-pointer"
            >
              {copiedTarget === "ig" ? <Check className="w-3.5 h-3.5 text-[#4cc38a]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quoted Plans Bar */}
      {profile && profile.services.length > 0 && (
        <div className={cn(CONSOLE_PANEL, "py-3 px-4 flex flex-wrap items-center gap-2")}>
          <span className="text-xs font-medium text-[#727c75] mr-1">Quoted plans:</span>
          {profile.services.map((svc) => (
            <span
              key={svc.name}
              className={cn(CONSOLE_SUBCARD, "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs")}
            >
              <span className="text-[#edf0ee]">{svc.name}</span>
              <span className="text-[#4cc38a] font-mono">
                {svc.currency === "USD" ? "$" : "€"}
                {svc.price}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Split Support Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[460px]">
        <div className={cn(CONSOLE_PANEL_FLUSH, "lg:col-span-4 flex flex-col")}>
          <div className="px-4 py-3 border-b border-[#edf0ee]/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-[#edf0ee]">Conversations</h2>
              <span className="text-[11px] font-mono text-[#727c75]">{conversations.length}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {(["all", "whatsapp", "instagram"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setChannelFilter(tab)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer border",
                    channelFilter === tab
                      ? "bg-[#19201d] border-[#34d399]/35 text-[#edf0ee]"
                      : "bg-[#0d1210] border-[#edf0ee]/[0.06] text-[#727c75] hover:text-[#edf0ee]"
                  )}
                >
                  {tab === "all" ? "All" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#edf0ee]/[0.06] max-h-[480px]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#727c75]">
                No {channelFilter === "all" ? "support" : channelFilter} threads yet
              </div>
            ) : (
              conversations.map((convo) => {
                const isSelected = convo.id === activeConversation?.id;
                const isHuman = convo.control_mode === "human";
                const isIg = String(convo.channel || "").toLowerCase() === "instagram";
                return (
                  <button
                    key={convo.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(convo.id);
                      setFeedback(null);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 transition-colors cursor-pointer",
                      isSelected
                        ? "bg-[#19201d] border-l-2 border-l-[#34d399]"
                        : "hover:bg-[#19201d]/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#edf0ee] truncate">
                        {convo.customer_name || convo.customer_phone || "Visitor"}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={CONSOLE_BADGE_MUTED}>{isIg ? "IG" : "WA"}</span>
                        <span className={isHuman ? CONSOLE_BADGE_WARN : CONSOLE_BADGE_LIVE}>
                          {isHuman ? "Human" : "AI"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#727c75] mt-1">
                      <span className="font-mono truncate">
                        {convo.customer_phone || convo.customer_email || convo.channel}
                      </span>
                      <span className="shrink-0">{formatShortTime(convo.updated_at)}</span>
                    </div>

                    <p className="text-xs text-[#a1aaa4] line-clamp-1 mt-1.5">
                      {convo.last_message || "Started conversation"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread Detail */}
        <div className={cn(CONSOLE_PANEL_FLUSH, "lg:col-span-8 flex flex-col")}>
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-7 h-7 text-[#727c75] mb-2" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[#edf0ee]">Select a thread</p>
              <p className="text-xs text-[#727c75] mt-1 max-w-sm">
                Inspect AI replies, switch to human control, or respond directly over WhatsApp or Instagram
              </p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3.5 border-b border-[#edf0ee]/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[#edf0ee]">
                      {activeConversation.customer_name || "Customer"}
                    </h3>
                    <span className={CONSOLE_BADGE_MUTED}>{activeConversation.channel}</span>
                    {activeConversation.customer_phone && (
                      <span className="text-xs font-mono text-[#727c75]">
                        {activeConversation.customer_phone}
                      </span>
                    )}
                  </div>
                  {activeConversation.customer_email && (
                    <p className="text-xs text-[#a1aaa4] font-mono mt-0.5">
                      {activeConversation.customer_email}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleToggleControl}
                  disabled={isToggling}
                  className={cn(
                    CONSOLE_BTN_SECONDARY,
                    activeConversation.control_mode === "human" && "border-[#34d399]/35"
                  )}
                >
                  {activeConversation.control_mode === "human" ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-[#4cc38a]" />
                      <span>Return to AI</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Take over manually</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
                {activeConversation.messages && activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((m) => {
                    const isCustomer = m.role === "customer" || m.role === "user";
                    const isInternal = Boolean(m.is_internal);
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex flex-col max-w-[84%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed border",
                          isCustomer
                            ? "self-start mr-auto bg-[#19201d] border-[#edf0ee]/10 text-[#edf0ee]"
                            : isInternal
                              ? "self-end ml-auto bg-amber-400/10 border-amber-400/20 text-amber-100"
                              : m.role === "human"
                                ? "self-end ml-auto bg-[#0d1210] border-[#edf0ee]/12 text-[#edf0ee]"
                                : "self-end ml-auto bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#edf0ee]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3 text-[11px] mb-1 text-[#a1aaa4]">
                          <span className="font-medium flex items-center gap-1">
                            {isInternal && <Lock className="w-3 h-3" />}
                            {isCustomer
                              ? activeConversation.customer_name || "Customer"
                              : isInternal
                                ? "Internal note"
                                : m.role === "human"
                                  ? m.agent_name || "Operator"
                                  : "Support AI"}
                          </span>
                          <span className="font-mono text-[#727c75]">
                            {formatShortTime(m.created_at)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#727c75] text-center py-8">
                    No messages in this thread yet
                  </p>
                )}
              </div>

              {feedback && (
                <div
                  className={cn(
                    "mx-4 mb-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2 border",
                    feedback.type === "ok" ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_DANGER
                  )}
                >
                  {feedback.type === "ok" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmitReply}
                className="p-3.5 border-t border-[#edf0ee]/[0.08] bg-[#0d1210] space-y-2"
              >
                <label className="inline-flex items-center gap-2 text-xs text-[#a1aaa4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-[#edf0ee]/20 bg-[#121715]"
                  />
                  <span>Save as internal note only</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? "Add internal note"
                        : `Reply via ${activeConversation.channel || "WhatsApp"}`
                    }
                    className={cn(CONSOLE_INPUT, "flex-1 h-9 px-3.5 text-xs")}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className={cn(CONSOLE_BTN_PRIMARY, "h-9")}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSending ? "Sending..." : isInternalNote ? "Save note" : "Send"}
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Telemetry Logs */}
      {supportData && supportData.logs.length > 0 && (
        <div className={cn(CONSOLE_PANEL, "space-y-3")}>
          <h2 className="text-xs font-medium text-[#a1aaa4]">Recent channel webhook logs</h2>
          <div className="divide-y divide-[#edf0ee]/[0.06] max-h-48 overflow-y-auto">
            {supportData.logs.map((log) => (
              <div
                key={log.id}
                className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded font-mono text-[11px] shrink-0",
                      log.type === "error" ? CONSOLE_BADGE_DANGER : CONSOLE_BADGE_MUTED
                    )}
                  >
                    {log.channel || log.type}
                  </span>
                  <span className="text-[#edf0ee] truncate">{log.message}</span>
                </div>
                <span className="text-[#727c75] font-mono text-[11px] shrink-0">
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
