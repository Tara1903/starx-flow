import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Brain, MessageSquare, Send, Sparkles } from "lucide-react";
import { useAuthStore, type Workflow } from "../../store/authStore";
import { cn } from "../../lib/utils";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const FALLBACK_RESPONSES: Record<Workflow["aiTone"], string[]> = {
  Friendly: [
    "Hey there! 😊 Thanks so much for reaching out! I'd love to help you find the perfect time. We've got openings tomorrow at 10 AM and 2 PM — which works better for you?",
    "Awesome choice! I've penciled you in. You'll get a calendar invite in just a sec. Can't wait to see you! ✨",
  ],
  Professional: [
    "Thank you for contacting us. We have the following time slots open: 10:00 AM, 1:30 PM, and 4:00 PM. Please indicate your preference.",
    "Your appointment has been confirmed. Please arrive 10 minutes prior to your scheduled time.",
  ],
  Casual: [
    "Hey! Yeah we're totally free tomorrow afternoon. Want me to grab you the 2pm slot? Super easy to book 👍",
    "Done deal! You're all set. Just show up and we'll take care of the rest. See ya!",
  ],
  Urgent: [
    "CONFIRMED — Your slot is reserved. Time: Tomorrow, 2:00 PM. Please do not be late. Reply CANCEL to modify.",
    "ALERT: Your booking window closes in 30 minutes. Please confirm immediately.",
  ],
};

async function callGeminiAI(systemPrompt: string, userMessage: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
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

    const editPrompt = selected.customPrompt || "You are a helpful assistant.";
    const editTone = selected.aiTone || "Friendly";

    // Build system instructions with tone guidelines
    const fullPrompt = `${editPrompt}\n\nIMPORTANT: Respond in a ${editTone} tone. Keep replies concise (2-3 sentences max).`;

    const geminiReply = await callGeminiAI(fullPrompt, userMsg);

    if (geminiReply) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: geminiReply }]);
    } else {
      // Scripted fallbacks
      await new Promise((r) => setTimeout(r, 1000));
      const responses = FALLBACK_RESPONSES[editTone];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }
    
    setIsAiTyping(false);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[400px] select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-tight">AI Receptionist Sandbox</p>
          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full status-live" />
            <span>Tone: {selected?.aiTone || "Friendly"} · Real-time simulation</span>
          </p>
        </div>
      </div>

      {/* Messages timeline */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 console-scroll select-text">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 select-none">
            <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Awaiting Test Prompts</p>
            <p className="text-[11px] text-zinc-600 mt-1 max-w-[240px] leading-relaxed">
              Send a customer inquiry below to test how your trained AI receptionist replies with current prompt instructions.
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex flex-col max-w-[85%]", msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start")}
          >
            <span className="text-[8.5px] font-bold text-zinc-600 uppercase tracking-wider mb-1 px-1 select-none">
              {msg.sender === "user" ? "Customer" : "Trained AI Agent"}
            </span>
            <div className={cn(
              "rounded-2xl px-4 py-3 text-xs leading-relaxed border transition-all",
              msg.sender === "user"
                ? "bg-emerald-500/15 border-emerald-500/10 text-emerald-100 rounded-tr-md"
                : "bg-white/[0.02] border-white/5 text-zinc-300 rounded-tl-md"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isAiTyping && (
          <div className="flex flex-col items-start max-w-[85%] select-none">
            <span className="text-[8.5px] font-bold text-zinc-600 uppercase tracking-wider mb-1 px-1">
              AI Processing...
            </span>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl rounded-tl-md px-4 py-3.5 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input controls */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
            placeholder="Type a test customer question..."
            className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/30 transition-colors"
          />
          <button
            onClick={handleSendChat}
            disabled={!chatInput.trim() || isAiTyping || !selected}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
