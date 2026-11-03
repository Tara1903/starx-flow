"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, CheckCircle2, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: string[];
}

export function WebChatWidget({ businessId, organizationId }: { businessId?: string; organizationId?: string }) {
  const effectiveOrgId = organizationId || businessId || "default-org";
  const [isOpen, setIsOpen] = useState(false);
  const [businessName, setBusinessName] = useState("StarX Flow");
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [hoursToday, setHoursToday] = useState("09:00 - 18:00");
  const [sessionId, setSessionId] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "ai",
      text: "Hello! Welcome to our 24/7 AI Receptionist. How can I help you today? Feel free to ask about our services, opening hours, or request an appointment.",
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session from localStorage
  useEffect(() => {
    let sid = "";
    try {
      sid = localStorage.getItem("starx_chat_session") || "";
      if (!sid) {
        sid = `web-sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        localStorage.setItem("starx_chat_session", sid);
      }
    } catch {
      sid = `web-sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
    setSessionId(sid);

    // Fetch public business config
    fetch(`/api/chat/config?organizationId=${encodeURIComponent(effectiveOrgId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.businessName) {
          setBusinessName(data.businessName);
          if (data.isOpen !== undefined) setIsOpenNow(data.isOpen);
          if (data.hoursToday) setHoursToday(data.hoursToday);
          if (data.greetingMessage) {
            setMessages([
              {
                id: "msg-init",
                sender: "ai",
                text: data.greetingMessage,
                timestamp: "Just now",
              },
            ]);
          }
        }
      })
      .catch(() => {});
  }, [effectiveOrgId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: effectiveOrgId,
          organizationId: effectiveOrgId,
          sessionId,
          conversationId,
          message: text.trim(),
          visitorName: "Website Visitor",
        }),
      });

      const data = await res.json();
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sources: data.sources,
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (data.requiresHandoff) {
          const handoffNotice: ChatMessage = {
            id: `notice-${Date.now()}`,
            sender: "ai",
            text: "🔔 A team member has been notified and will follow up with you personally.",
            timestamp: "Just now",
          };
          setMessages((prev) => [...prev, handoffNotice]);
        }
      } else {
        throw new Error(data.error || "No reply received");
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "Thanks for your message! Our concierge is taking note and a team member will reply shortly.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-[360px] sm:w-[400px] h-[520px] max-h-[80vh] bg-[#0c0d0e]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/20 via-white/5 to-transparent border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    {businessName}
                    <span className={`w-2 h-2 rounded-full ${isOpenNow ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`}></span>
                  </h3>
                  <p className="text-zinc-400 text-xs">
                    {isOpenNow ? "Open Now" : "Currently Closed"} • {hoursToday}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="px-4 py-2 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none text-[11px]">
              <button
                onClick={() => handleSendMessage("What are your business hours and location?")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 whitespace-nowrap transition-colors"
              >
                🕒 Opening hours
              </button>
              <button
                onClick={() => handleSendMessage("I'd like to book an appointment.")}
                className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 whitespace-nowrap transition-colors"
              >
                📅 Book Appointment
              </button>
              <button
                onClick={() => handleSendMessage("What are your pricing packages?")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 whitespace-nowrap transition-colors"
              >
                💶 Pricing
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="max-w-[80%] flex flex-col gap-1">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-emerald-500 text-black font-medium rounded-tr-sm"
                          : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-zinc-500 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5 items-center text-zinc-400 text-xs pl-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>AI Assistant is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#0a0b0c] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500/40 transition-colors"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-transparent border-none text-xs text-white placeholder-zinc-500 outline-none flex-1 py-1"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-black flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1 pt-1.5">
                <span>Protected by StarX AI</span>
                <span>GDPR Compliant</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Floating Pill */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm rounded-full shadow-lg shadow-emerald-500/20 border border-emerald-400/40 hover:brightness-110 transition-all"
      >
        <MessageSquare className="w-5 h-5" />
        <span>Chat with AI Concierge</span>
      </motion.button>
    </div>
  );
}
