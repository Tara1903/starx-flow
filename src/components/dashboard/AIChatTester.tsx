"use client";
import React, { useState, useRef, useEffect } from "react";
import { Brain, MessageSquare, Send } from "lucide-react";
import { useAuthStore, type Workflow } from "../../store/authStore";
import {
  CONSOLE_PANEL_FLUSH,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

const FALLBACK_RESPONSES: Record<Workflow["aiTone"], string[]> = {
  Friendly: [
    "Thanks for reaching out. We have openings tomorrow at 10:00 AM and 2:00 PM. Which time works best for you?",
    "That slot is now reserved for you, and a calendar confirmation has been dispatched.",
  ],
  Professional: [
    "Thank you for contacting us. Available windows tomorrow are 10:00 AM, 1:30 PM, and 4:00 PM. Please let us know your preference.",
    "Your appointment is confirmed. Please arrive 10 minutes prior to your scheduled time.",
  ],
  Casual: [
    "We have an opening tomorrow afternoon at 2:00 PM if you would like me to hold that for you.",
    "All set, your time is confirmed. Let us know if anything changes.",
  ],
  Urgent: [
    "Slot reserved for tomorrow at 2:00 PM. Reply CANCEL to release this window.",
    "Booking hold expires in 30 minutes. Reply to confirm.",
  ],
};

async function callSandboxAI(customPrompt: string, aiTone: string, userMessage: string): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch("/api/ai/sandbox", {
      method: "POST",
      headers,
      body: JSON.stringify({
        customPrompt,
        aiTone,
        message: userMessage,
      }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.reply || null;
  } catch {
    return null;
  }
}

export function AIChatTester() {
  const workflows = useAuthStore((s) => s.workflows);
  const selectedId = useAuthStore((s) => s.selectedWorkflowId);
  const selected = workflows.find((w) => w.id === selectedId) || workflows[0];

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, isAiTyping]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiTyping || !selected) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsAiTyping(true);

    const editPrompt = selected.customPrompt || "You are a helpful receptionist.";
    const editTone = selected.aiTone || "Friendly";

    const geminiReply = await callSandboxAI(editPrompt, editTone, userMsg);

    if (geminiReply) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: geminiReply }]);
    } else {
      await new Promise((r) => setTimeout(r, 700));
      const responses = FALLBACK_RESPONSES[editTone];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }

    setIsAiTyping(false);
  };

  return (
    <div className={cn(CONSOLE_PANEL_FLUSH, "flex flex-col h-[420px] select-none")}>
      <div className="px-5 py-3.5 border-b border-[#edf0ee]/[0.08] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4]">
          <Brain className="w-4 h-4" strokeWidth={1.65} />
        </div>
        <div>
          <h2 className={CONSOLE_SECTION_TITLE}>Receptionist sandbox</h2>
          <p className="text-xs text-[#727c75] mt-0.5">
            Tone: {selected?.aiTone || "Friendly"} · Simulated customer prompt check
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3.5 console-scroll select-text">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 select-none">
            <MessageSquare className="w-6 h-6 text-[#727c75] mb-2.5" strokeWidth={1.5} />
            <p className="text-xs font-medium text-[#edf0ee]">Test a customer inquiry</p>
            <p className="text-xs text-[#727c75] mt-1 max-w-[260px] leading-relaxed">
              Send a sample question below to verify how your configured prompt responds
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <span className="text-[11px] text-[#727c75] mb-1 px-1 select-none">
              {msg.sender === "user" ? "Customer" : "Receptionist"}
            </span>
            <div
              className={cn(
                "rounded-xl px-3.5 py-2.5 text-xs leading-relaxed border",
                msg.sender === "user"
                  ? "bg-[#19201d] border-[#edf0ee]/10 text-[#edf0ee]"
                  : "bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#edf0ee]"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isAiTyping && (
          <div className="flex flex-col items-start max-w-[85%] select-none">
            <span className="text-[11px] text-[#727c75] mb-1 px-1">Generating reply...</span>
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
            placeholder="Type a test customer message"
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
