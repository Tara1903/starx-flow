import React, { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, Phone, Star, Instagram, Globe, 
  Send, User, Sparkles, ShieldAlert, CheckCircle, HelpCircle, ArrowLeft, ArrowUpRight
} from "lucide-react";
import { useDashboardStore, type ConversationThread } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";
import { CustomerProfile } from "./CustomerProfile";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <MessageCircle className="w-4 h-4" />,
  SMS:       <Phone className="w-4 h-4" />,
  Instagram: <Instagram className="w-4 h-4 text-pink-400" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400 bg-green-500/10 border-green-500/20",
  SMS:       "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Instagram: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

export function ConversationThread() {
  const selectedId = useDashboardStore((s) => s.selectedConversationId);
  const selectConversation = useDashboardStore((s) => s.selectConversation);
  const conversations = useDashboardStore((s) => s.conversations);
  const sendMessageToThread = useDashboardStore((s) => s.sendMessageToThread);
  const toggleThreadStatus = useDashboardStore((s) => s.toggleThreadStatus);
  const addActivityEntry = useDashboardStore((s) => s.addActivityEntry);

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
  }, [selectedId]);

  if (!activeThread) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageToThread(activeThread.id, input.trim(), isHumanControl ? "human" : "ai");
    
    // Log recent action on dashboard Store
    addActivityEntry({
      channel: activeThread.channel,
      type: "success",
      message: `${isHumanControl ? "Human Agent" : "AI Agent"} responded to ${activeThread.customerName}.`
    });

    setInput("");

    // Simulate auto customer reply after 2.5 seconds to feel alive if AI responded
    if (!isHumanControl) {
      setTimeout(() => {
        sendMessageToThread(
          activeThread.id,
          "Thank you for the update! That helps clarify.",
          "user"
        );
      }, 2500);
    }
  };

  const handleStatusChange = (status: ConversationThread["status"]) => {
    toggleThreadStatus(activeThread.id, status);
    
    addActivityEntry({
      channel: activeThread.channel,
      type: "info",
      message: `Thread status updated to ${status} for ${activeThread.customerName}.`
    });
  };

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
              <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold flex items-center gap-1 uppercase tracking-widest", CHANNEL_COLOR[activeThread.channel])}>
                {CHANNEL_ICON[activeThread.channel]}
                <span className="hidden xs:inline">{activeThread.channel}</span>
              </span>
            </div>
            
            {/* AI Control details */}
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 leading-none">
              <span className={cn("w-1.5 h-1.5 rounded-full animate-ping", isHumanControl ? "bg-amber-400" : "bg-emerald-400")} />
              <span>Mode: {isHumanControl ? "Human Take-Over Active" : "AI Agent Auto-Pilot"}</span>
            </p>
          </div>
        </div>

        {/* Toggle Human / Status controls */}
        <div className="flex items-center gap-2">
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
          const isMe = msg.sender === "human";
          const isAI = msg.sender === "ai";
          const isUser = msg.sender === "user";

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
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder={
              isHumanControl
                ? "Type a manual reply to send to the channel..."
                : "Type custom text to prompt AI reply..."
            }
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-emerald-500/30 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black transition-colors flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Send className="w-4 h-4" />
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
