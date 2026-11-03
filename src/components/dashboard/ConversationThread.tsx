import React, { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, Phone, Instagram, Globe, Mail,
  Send, User, Sparkles, ShieldAlert, Lock, AlertTriangle, ArrowLeft
} from "lucide-react";
import { useDashboardStore, type ConversationThread } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";
import { CustomerProfile } from "./CustomerProfile";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <MessageCircle className="w-4 h-4" />,
  SMS:       <Phone className="w-4 h-4" />,
  Instagram: <Instagram className="w-4 h-4 text-pink-400" />,
  Email:     <Mail className="w-4 h-4 text-indigo-400" />,
  Web:       <Globe className="w-4 h-4 text-amber-400" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400 bg-green-500/10 border-green-500/20",
  SMS:       "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Instagram: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  Email:     "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  Web:       "text-amber-400 bg-amber-500/10 border-amber-500/20",
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

  // Reset human takeover when changing conversations
  useEffect(() => {
    setIsHumanControl(false);
    setIsInternalMode(false);
  }, [selectedId, setIsInternalMode]);

  // Collision detection heartbeat: notify presence API every 20 seconds
  useEffect(() => {
    if (!selectedId || !currentUser) return;

    const pingPresence = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: currentUser.id,
            agentName: currentUser.name || currentUser.email || 'Agent',
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
        // Silently ignore in offline mode
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
      // Send private internal note
      sendMessageToThread(activeThread.id, input.trim(), "human", true);
      addActivityEntry({
        channel: (activeThread.channel as any) || 'WhatsApp',
        type: "info",
        message: `Private staff note added to ${activeThread.customerName}'s thread.`
      });
    } else {
      // Send public message to customer
      sendMessageToThread(activeThread.id, input.trim(), isHumanControl ? "human" : "ai", false);
      addActivityEntry({
        channel: (activeThread.channel as any) || 'WhatsApp',
        type: "success",
        message: `${isHumanControl ? "Human Agent" : "AI Agent"} responded to ${activeThread.customerName}.`
      });

      // Simulate auto customer reply after 2.5 seconds if AI responded in test UI
      if (!isHumanControl) {
        setTimeout(() => {
          sendMessageToThread(
            activeThread.id,
            "Thank you for the update! That helps clarify.",
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
      channel: (activeThread.channel as any) || 'WhatsApp',
      type: "info",
      message: `Thread status updated to ${status} for ${activeThread.customerName}.`
    });
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    setConversationPriority(activeThread.id, priority);
    addActivityEntry({
      channel: (activeThread.channel as any) || 'WhatsApp',
      type: "info",
      message: `Thread priority set to ${priority.toUpperCase()} for ${activeThread.customerName}.`
    });
  };

  const channelKey = activeThread.channel || 'WhatsApp';
  const icon = CHANNEL_ICON[channelKey] || <MessageCircle className="w-4 h-4" />;
  const colorClass = CHANNEL_COLOR[channelKey] || "text-zinc-400 bg-white/5 border-white/10";

  return (
    <div className="flex-1 flex h-full min-w-0">
      <div className="flex-1 flex flex-col h-full bg-[#050505] relative select-none">
        {/* Thread Header Bar */}
        <div className="px-5 py-4 border-b border-white/5 bg-white/[0.005] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => selectConversation(null)}
              className="md:hidden text-zinc-500 hover:text-white p-1 rounded hover:bg-white/5 transition-all mr-1"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>

            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white leading-tight truncate">
                  {activeThread.customerName}
                </h2>
                <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold flex items-center gap-1 uppercase tracking-widest", colorClass)}>
                  {icon}
                  <span className="hidden xs:inline">{channelKey}</span>
                </span>
              </div>
              
              {/* AI Control details */}
              <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 leading-none">
                <span className={cn("w-1.5 h-1.5 rounded-full animate-ping", isHumanControl ? "bg-amber-400" : "bg-emerald-400")} />
                <span>Mode: {isHumanControl ? "Human Take-Over Active" : "AI Agent Auto-Pilot"}</span>
              </p>
            </div>
          </div>

          {/* Controls: Priority, Status, Take Over */}
          <div className="flex items-center gap-2">
            {/* Priority Selector */}
            <select
              value={activeThread.priority || 'medium'}
              onChange={(e) => handlePriorityChange(e.target.value as any)}
              className="bg-[#0a0a0a] border border-white/10 text-[10px] font-semibold text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500/30 transition-all select-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Active Status Badge selection */}
            <select
              value={activeThread.status}
              onChange={(e) => handleStatusChange(e.target.value as ConversationThread["status"])}
              className="bg-[#0a0a0a] border border-white/10 text-[10px] font-semibold text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500/30 transition-all select-none"
            >
              <option value="active">Active Triage</option>
              <option value="needs_attention">Needs Human</option>
              <option value="resolved">Mark Resolved</option>
            </select>

            {/* Take Over Switch */}
            <button
              onClick={() => {
                setIsHumanControl(!isHumanControl);
                handleStatusChange(isHumanControl ? "active" : "needs_attention");
              }}
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all",
                isHumanControl
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                  : "bg-white/5 text-zinc-400 border-white/5 hover:text-white hover:bg-white/10"
              )}
            >
              {isHumanControl ? <ShieldAlert className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isHumanControl ? "Release to AI" : "Take Over AI"}</span>
              <span className="sm:hidden">{isHumanControl ? "Manual" : "Auto"}</span>
            </button>
          </div>
        </div>

        {/* Presence Collision Warning Banner */}
        {collisionWarning?.isCollision && (
          <div className="px-5 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-[11px] font-medium text-red-400 select-none animate-fadeIn flex-shrink-0">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>
              Collision Alert: {collisionWarning.activeViewers.join(", ")} {collisionWarning.activeViewers.length > 1 ? "are" : "is"} currently viewing or replying to this conversation.
            </span>
          </div>
        )}

        {/* Human Takeover Notice Banner */}
        {isHumanControl && (
          <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] font-medium text-amber-400 select-none animate-fadeIn flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>AI agent auto-replies are paused. You are now answering this customer manually.</span>
            </div>
            <button
              onClick={() => {
                setIsHumanControl(false);
                handleStatusChange("active");
              }}
              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 border-b border-amber-300 hover:border-amber-200"
            >
              Re-enable AI
            </button>
          </div>
        )}

        {/* Conversational Bubbles timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 console-scroll">
          {activeThread.messages.map((msg) => {
            const isInternal = !!msg.is_internal;
            const isMe = msg.sender === "human";
            const isAI = msg.sender === "ai";
            const isUser = msg.sender === "user";

            if (isInternal) {
              return (
                <div key={msg.id} className="mx-auto max-w-[90%] w-full my-2">
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5 text-xs text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-amber-500/15">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        <Lock className="w-3 h-3" />
                        <span>Staff Internal Note — Private</span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400/70">{msg.timestamp}</span>
                    </div>
                    <p className="break-words leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col max-w-[85%]", isUser ? "mr-auto items-start" : "ml-auto items-end")}
              >
                {/* Bubble text label indicator */}
                <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase mb-1 px-1">
                  {isUser ? "Customer" : isAI ? "AI Autopilot" : "Human Agent"}
                </span>

                {/* Chat bubble surface */}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-xs leading-relaxed border transition-all",
                    isUser
                      ? "bg-white/[0.02] border-white/5 text-zinc-300 rounded-tl-md"
                      : isAI
                      ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-100 rounded-tr-md"
                      : "bg-blue-500/10 border-blue-500/15 text-blue-100 rounded-tr-md shadow-[0_0_15px_rgba(59,130,246,0.03)]"
                  )}
                >
                  <p className="break-words">{msg.text}</p>
                </div>

                {/* Bubble timestamp */}
                <span className="text-[9px] text-zinc-600 font-medium font-mono mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input area */}
        <div className="p-4 border-t border-white/5 bg-white/[0.005]">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mb-2.5">
            <button
              onClick={() => setIsInternalMode(false)}
              className={cn(
                "text-[10px] font-bold px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                !isInternalMode
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <span>Public Customer Reply</span>
            </button>
            <button
              onClick={() => setIsInternalMode(true)}
              className={cn(
                "text-[10px] font-bold px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                isInternalMode
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Lock className="w-3 h-3" />
              <span>Internal Note (Private)</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder={
                isInternalMode
                  ? "Add private note for staff (will never be sent to customer)..."
                  : isHumanControl
                  ? "Type manual reply to send to customer channel..."
                  : "Type custom text to prompt AI reply..."
              }
              className={cn(
                "flex-1 bg-[#0a0a0a] border rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-colors",
                isInternalMode
                  ? "border-amber-500/30 focus:border-amber-500/60 placeholder-amber-400/40"
                  : "border-white/10 focus:border-emerald-500/30"
              )}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl disabled:opacity-40 text-black transition-colors flex-shrink-0",
                isInternalMode
                  ? "bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              )}
            >
              {isInternalMode ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
        
      {/* Right Sidebar - Customer Profile */}
      <div className="hidden xl:block">
        <CustomerProfile thread={activeThread} />
      </div>
    </div>
  );
}
