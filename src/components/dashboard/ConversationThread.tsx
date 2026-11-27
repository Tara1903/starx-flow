import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Phone,
  Instagram,
  Globe,
  Mail,
  Send,
  User,
  Bot,
  ShieldAlert,
  Lock,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useDashboardStore, type ConversationThread } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import {
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_DANGER,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import { CustomerProfile } from "./CustomerProfile";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp: <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.65} />,
  SMS: <Phone className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Instagram: <Instagram className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Email: <Mail className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Web: <Globe className="w-3.5 h-3.5" strokeWidth={1.65} />,
};

export function ConversationThread() {
  const selectedId = useDashboardStore((s) => s.selectedConversationId);
  const selectConversation = useDashboardStore((s) => s.selectConversation);
  const conversations = useDashboardStore((s) => s.conversations);
  const sendMessageToThread = useDashboardStore((s) => s.sendMessageToThread);
  const toggleThreadStatus = useDashboardStore((s) => s.toggleThreadStatus);
  const setConversationPriority = useDashboardStore((s) => s.setConversationPriority);
  const isInternalMode = useDashboardStore((s) => s.isInternalMode);
  const setIsInternalMode = useDashboardStore((s) => s.setIsInternalMode);
  const collisionWarning = useDashboardStore((s) => s.collisionWarning);
  const setCollisionWarning = useDashboardStore((s) => s.setCollisionWarning);
  const addActivityEntry = useDashboardStore((s) => s.addActivityEntry);

  const currentUser = useAuthStore((s) => s.user);
  const activeThread = conversations.find((c) => c.id === selectedId);
  const [input, setInput] = useState("");
  const [isHumanControl, setIsHumanControl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  useEffect(() => {
    setIsHumanControl(false);
    setIsInternalMode(false);
  }, [selectedId, setIsInternalMode]);

  useEffect(() => {
    if (!selectedId || !currentUser) return;

    const pingPresence = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedId}/presence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: currentUser.id,
            agentName: currentUser.name || currentUser.email || "Agent",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.hasCollision) {
            setCollisionWarning({
              isCollision: true,
              activeViewers: data.activeViewers || [],
            });
          } else {
            setCollisionWarning(null);
          }
        }
      } catch {
        // Offline ignore
      }
    };

    pingPresence();
    const interval = setInterval(pingPresence, 20000);
    return () => clearInterval(interval);
  }, [selectedId, currentUser, setCollisionWarning]);

  if (!activeThread) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    if (isInternalMode) {
      sendMessageToThread(activeThread.id, input.trim(), "human", true);
      addActivityEntry({
        channel: (activeThread.channel as any) || "WhatsApp",
        type: "info",
        message: `Staff note added to ${activeThread.customerName} thread`,
      });
    } else {
      sendMessageToThread(activeThread.id, input.trim(), isHumanControl ? "human" : "ai", false);
      addActivityEntry({
        channel: (activeThread.channel as any) || "WhatsApp",
        type: "success",
        message: `${isHumanControl ? "Operator" : "AI receptionist"} replied to ${activeThread.customerName}`,
      });

      if (!isHumanControl) {
        setTimeout(() => {
          sendMessageToThread(
            activeThread.id,
            "Thanks for clarifying, that answers my question.",
            "user",
            false
          );
        }, 2500);
      }
    }

    setInput("");
  };

  const handleStatusChange = (status: ConversationThread["status"]) => {
    toggleThreadStatus(activeThread.id, status);
    addActivityEntry({
      channel: (activeThread.channel as any) || "WhatsApp",
      type: "info",
      message: `Thread status set to ${status} for ${activeThread.customerName}`,
    });
  };

  const handlePriorityChange = (priority: "low" | "medium" | "high" | "urgent") => {
    setConversationPriority(activeThread.id, priority);
    addActivityEntry({
      channel: (activeThread.channel as any) || "WhatsApp",
      type: "info",
      message: `Thread priority set to ${priority} for ${activeThread.customerName}`,
    });
  };

  const channelKey = activeThread.channel || "WhatsApp";
  const icon = CHANNEL_ICON[channelKey] || <MessageCircle className="w-3.5 h-3.5" />;

  return (
    <div className="flex-1 flex h-full min-w-0 bg-[#121715]">
      <div className="flex-1 flex flex-col h-full relative select-none min-w-0">
        {/* Thread Header */}
        <div className="px-5 py-3.5 border-b border-[#edf0ee]/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => selectConversation(null)}
              aria-label="Back to thread list"
              className="md:hidden text-[#a1aaa4] hover:text-[#edf0ee] p-1 rounded hover:bg-[#19201d] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4]">
              <User className="w-4 h-4" strokeWidth={1.65} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-[#edf0ee] truncate">
                  {activeThread.customerName}
                </h2>
                <span className={CONSOLE_BADGE_MUTED}>
                  {icon}
                  <span className="hidden xs:inline">{channelKey}</span>
                </span>
              </div>

              <p className="text-xs text-[#727c75] mt-0.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isHumanControl ? "bg-amber-400" : "bg-[#4cc38a]"
                  )}
                />
                <span>{isHumanControl ? "Manual operator active" : "AI auto-reply active"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeThread.priority || "medium"}
              onChange={(e) => handlePriorityChange(e.target.value as any)}
              className={cn(CONSOLE_INPUT, "text-xs px-2.5 py-1.5 cursor-pointer")}
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={activeThread.status}
              onChange={(e) => handleStatusChange(e.target.value as ConversationThread["status"])}
              className={cn(CONSOLE_INPUT, "text-xs px-2.5 py-1.5 cursor-pointer")}
            >
              <option value="active">Active</option>
              <option value="needs_attention">Needs review</option>
              <option value="resolved">Resolved</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setIsHumanControl(!isHumanControl);
                handleStatusChange(isHumanControl ? "active" : "needs_attention");
              }}
              className={cn(
                CONSOLE_BTN_SECONDARY,
                isHumanControl && "border-amber-400/30 text-amber-300"
              )}
            >
              {isHumanControl ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-[#a1aaa4]" />
              )}
              <span className="hidden sm:inline">
                {isHumanControl ? "Release to AI" : "Take over"}
              </span>
            </button>
          </div>
        </div>

        {/* Collision Banner */}
        {collisionWarning?.isCollision && (
          <div
            className={cn(
              CONSOLE_BADGE_DANGER,
              "rounded-none border-x-0 border-t-0 px-5 py-2 justify-start"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {collisionWarning.activeViewers.join(", ")}{" "}
              {collisionWarning.activeViewers.length > 1 ? "are" : "is"} also viewing this thread
            </span>
          </div>
        )}

        {/* Takeover Banner */}
        {isHumanControl && (
          <div
            className={cn(
              CONSOLE_BADGE_WARN,
              "rounded-none border-x-0 border-t-0 px-5 py-2 justify-between"
            )}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              <span>AI auto-replies paused while manual reply mode is active</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsHumanControl(false);
                handleStatusChange("active");
              }}
              className="underline hover:opacity-80 cursor-pointer"
            >
              Resume AI
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 console-scroll select-text">
          {activeThread.messages.map((msg) => {
            const isInternal = !!msg.is_internal;
            const isAI = msg.sender === "ai";
            const isUser = msg.sender === "user";

            if (isInternal) {
              return (
                <div key={msg.id} className="mx-auto max-w-[90%] w-full my-1">
                  <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3.5 text-xs text-amber-100">
                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-amber-400/15">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300">
                        <Lock className="w-3 h-3" />
                        Internal staff note
                      </span>
                      <span className="text-[11px] font-mono text-amber-300/70">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="break-words leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  isUser ? "mr-auto items-start" : "ml-auto items-end"
                )}
              >
                <span className="text-[11px] text-[#727c75] mb-1 px-1 select-none">
                  {isUser ? "Customer" : isAI ? "AI receptionist" : "Operator"}
                </span>

                <div
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-xs leading-relaxed border",
                    isUser
                      ? "bg-[#19201d] border-[#edf0ee]/[0.08] text-[#edf0ee]"
                      : isAI
                        ? "bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#edf0ee]"
                        : "bg-[#0d1210] border-[#edf0ee]/14 text-[#edf0ee]"
                  )}
                >
                  <p className="break-words">{msg.text}</p>
                </div>

                <span className="text-[11px] text-[#727c75] font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="p-4 border-t border-[#edf0ee]/[0.08] bg-[#0d1210]">
          <div className="flex items-center gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => setIsInternalMode(false)}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer border",
                !isInternalMode
                  ? "bg-[#19201d] text-[#edf0ee] border-[#34d399]/35"
                  : "border-transparent text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              Customer reply
            </button>
            <button
              type="button"
              onClick={() => setIsInternalMode(true)}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer border",
                isInternalMode
                  ? "bg-amber-400/10 text-amber-300 border-amber-400/25"
                  : "border-transparent text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              <Lock className="w-3 h-3" />
              <span>Internal note</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder={
                isInternalMode
                  ? "Add internal staff note"
                  : isHumanControl
                    ? "Send manual customer reply"
                    : "Send customer message or prompt test"
              }
              className={cn(CONSOLE_INPUT, "flex-1 h-9 px-3.5 text-xs")}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(CONSOLE_BTN_PRIMARY, "h-9 px-4")}
              aria-label={isInternalMode ? "Save internal note" : "Send message"}
            >
              {isInternalMode ? <Lock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden xl:block">
        <CustomerProfile thread={activeThread} />
      </div>
    </div>
  );
}
