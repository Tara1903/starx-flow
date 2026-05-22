import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Play, Plus, Settings, MessageSquare, BarChart3, Radio,
  MessageCircle, Phone, Star, Instagram, Globe,
  X, Check, Loader2, Activity, Clock, TrendingUp,
  DollarSign, Send, Brain, Terminal, Sparkles,
  ChevronRight, Shield, RefreshCw, Trash2, Eye, Hash,
  Volume2, Gauge, PenTool, Layers, ArrowUpRight, Wifi, WifiOff
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuthStore, type Workflow, type SimulationLog } from "../store/authStore";
import { IntegrationModal } from "../components/IntegrationModal";

/* ──────────────────────────────────────────────
   CONSTANTS & HELPERS
   ────────────────────────────────────────────── */

type TabId = "workflows" | "playground" | "analytics" | "channels";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "workflows",  label: "Workflows",     icon: <Layers className="w-4 h-4" /> },
  { id: "playground", label: "AI Playground",  icon: <Brain className="w-4 h-4" /> },
  { id: "analytics",  label: "Analytics",      icon: <BarChart3 className="w-4 h-4" /> },
  { id: "channels",   label: "Channels",       icon: <Radio className="w-4 h-4" /> },
];

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <MessageCircle className="w-5 h-5" />,
  SMS:       <Phone className="w-5 h-5" />,
  Reviews:   <Star className="w-5 h-5" />,
  Instagram: <Instagram className="w-5 h-5" />,
  Web:       <Globe className="w-5 h-5" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400",
  SMS:       "text-blue-400",
  Reviews:   "text-amber-400",
  Instagram: "text-pink-400",
  Web:       "text-cyan-400",
};

const CHANNEL_BG: Record<string, string> = {
  WhatsApp:  "bg-green-500/10 border-green-500/20",
  SMS:       "bg-blue-500/10 border-blue-500/20",
  Reviews:   "bg-amber-500/10 border-amber-500/20",
  Instagram: "bg-pink-500/10 border-pink-500/20",
  Web:       "bg-cyan-500/10 border-cyan-500/20",
};

const LOG_COLORS: Record<SimulationLog["type"], string> = {
  trigger:    "text-amber-400",
  ai_process: "text-blue-400",
  ai_reply:   "text-emerald-400",
  success:    "text-green-300",
  system:     "text-zinc-400",
};

const LOG_PREFIX: Record<SimulationLog["type"], string> = {
  trigger:    "▶ TRIGGER",
  ai_process: "⟳ PROCESS",
  ai_reply:   "◈ AI-OUT ",
  success:    "✓ SUCCESS",
  system:     "⚙ SYSTEM ",
};

/* Gemini API key */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

/* Fallback AI chat responses if Gemini is unavailable */
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

/* Analytics mock data */
const CHART_DATA = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 35 },
  { day: "Thu", value: 72 },
  { day: "Fri", value: 64 },
  { day: "Sat", value: 89 },
  { day: "Sun", value: 76 },
];

/* ──────────────────────────────────────────────
   SUB-COMPONENTS
   ────────────────────────────────────────────── */

/* ─── Toggle Switch ─── */
function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn("toggle-track flex-shrink-0", active ? "active" : "inactive")}
      aria-label={active ? "Deactivate workflow" : "Activate workflow"}
    />
  );
}

/* ─── KPI Card ─── */
function KPICard({ icon, label, value, suffix, trend }: {
  icon: React.ReactNode; label: string; value: string; suffix?: string; trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-zinc-500">{icon}</span>
        {trend && (
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">
          {value}<span className="text-sm font-normal text-zinc-400 ml-1">{suffix}</span>
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─── Workflow Card ─── */
function WorkflowCard({ workflow, onToggle, onSimulate, onConfigure, isSimulating }: {
  workflow: Workflow;
  onToggle: () => void;
  onSimulate: () => void;
  onConfigure: () => void;
  isSimulating: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-card rounded-xl p-5 transition-all duration-300",
        !workflow.isActive && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border",
            CHANNEL_BG[workflow.channel],
            CHANNEL_COLOR[workflow.channel]
          )}>
            {CHANNEL_ICON[workflow.channel]}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{workflow.name}</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">{workflow.channel} · {workflow.aiTone}</p>
          </div>
        </div>
        <ToggleSwitch active={workflow.isActive} onToggle={onToggle} />
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
        {workflow.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-white">{workflow.executionsCount}</p>
          <p className="text-[10px] text-zinc-500">Runs</p>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-emerald-400">{workflow.successRate}%</p>
          <p className="text-[10px] text-zinc-500">Success</p>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-white">{workflow.savedHours}h</p>
          <p className="text-[10px] text-zinc-500">Saved</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onSimulate}
          disabled={!workflow.isActive || isSimulating}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg transition-all",
            workflow.isActive
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              : "bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed"
          )}
        >
          {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {isSimulating ? "Running…" : "Test Run"}
        </button>
        <button
          onClick={onConfigure}
          className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 px-4 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Configure
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Execution Console ─── */
function ExecutionConsole({ logs, onClear }: { logs: SimulationLog[]; onClear: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">Live Execution Console</span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full status-live" />
        </div>
        <button
          onClick={onClear}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Clear logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Console Body */}
      <div
        ref={scrollRef}
        className="h-56 overflow-y-auto console-scroll bg-[#060606] p-4 font-mono text-xs space-y-1.5"
      >
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 text-zinc-600">
            <span className="cursor-blink">▌</span>
            <span>Awaiting workflow triggers…</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-entry flex gap-2 leading-relaxed">
              <span className="text-zinc-600 flex-shrink-0 select-none">{log.timestamp}</span>
              <span className={cn("flex-shrink-0 font-semibold select-none", LOG_COLORS[log.type])}>
                {LOG_PREFIX[log.type]}
              </span>
              <span className="text-zinc-500 flex-shrink-0 select-none">[{log.channel}]</span>
              <span className="text-zinc-300">{log.message}</span>
            </div>
          ))
        )}
        {/* Cursor */}
        {logs.length > 0 && (
          <div className="flex items-center gap-2 text-zinc-600 pt-1">
            <span className="cursor-blink">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Create Workflow Wizard (Modal) ─── */
const TRIGGER_OPTIONS = [
  { value: "whatsapp_message", label: "WhatsApp Message Received", icon: <MessageCircle className="w-5 h-5" />, color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "missed_call",     label: "Missed Phone Call",          icon: <Phone className="w-5 h-5" />,         color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "invoice_paid",    label: "Invoice Marked Paid",        icon: <DollarSign className="w-5 h-5" />,    color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "ig_keyword",      label: "Instagram Keyword Detected", icon: <Instagram className="w-5 h-5" />,     color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { value: "web_chat",        label: "Website Chat Initiated",     icon: <Globe className="w-5 h-5" />,         color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
];

const ACTION_OPTIONS = [
  { value: "ai_reply",       label: "Generate AI Response",      icon: <Brain className="w-5 h-5" /> },
  { value: "send_sms",       label: "Dispatch SMS Message",      icon: <MessageSquare className="w-5 h-5" /> },
  { value: "review_request", label: "Send Review Invitation",    icon: <Star className="w-5 h-5" /> },
  { value: "voucher_send",   label: "Send Promotional Voucher",  icon: <Sparkles className="w-5 h-5" /> },
];

const TRIGGER_TO_CHANNEL: Record<string, Workflow["channel"]> = {
  whatsapp_message: "WhatsApp",
  missed_call: "SMS",
  invoice_paid: "Reviews",
  ig_keyword: "Instagram",
  web_chat: "Web",
};

function CreateWorkflowWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addWorkflow = useAuthStore((s) => s.addWorkflow);
  const [wizStep, setWizStep] = useState(1);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<Workflow["aiTone"]>("Friendly");
  const [deploying, setDeploying] = useState(false);

  const reset = () => { setWizStep(1); setName(""); setDesc(""); setTrigger(""); setAction(""); setPrompt(""); setTone("Friendly"); };

  const handleDeploy = async () => {
    setDeploying(true);
    await new Promise((r) => setTimeout(r, 1200));
    addWorkflow({
      name: name || "Untitled Workflow",
      description: desc || "Custom automated workflow.",
      trigger: TRIGGER_OPTIONS.find(t => t.value === trigger)?.label || trigger,
      action: ACTION_OPTIONS.find(a => a.value === action)?.label || action,
      isActive: true,
      channel: TRIGGER_TO_CHANNEL[trigger] || "Web",
      aiTone: tone,
      customPrompt: prompt || "Reply helpfully and book appointments when possible.",
    });
    setDeploying(false);
    setWizStep(5); // success
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) { onClose(); reset(); } }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.1)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white">{wizStep === 5 ? "Workflow Deployed!" : "Create New Workflow"}</h3>
            {wizStep < 5 && <p className="text-xs text-zinc-500 mt-0.5">Step {wizStep} of 4</p>}
          </div>
          <button onClick={() => { onClose(); reset(); }} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {wizStep < 5 && (
          <div className="h-0.5 bg-zinc-900">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              animate={{ width: `${(wizStep / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Steps Content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {wizStep === 1 && (
              <motion.div key="wiz1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Workflow Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Weekend Promotion Bot" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="What does this workflow do?" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors resize-none" />
                </div>
              </motion.div>
            )}

            {wizStep === 2 && (
              <motion.div key="wiz2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <p className="text-xs text-zinc-400 mb-3">Choose what triggers this workflow:</p>
                <div className="space-y-2">
                  {TRIGGER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTrigger(opt.value)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm",
                        trigger === opt.value
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border", opt.color)}>{opt.icon}</div>
                      <span className="font-medium">{opt.label}</span>
                      {trigger === opt.value && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {wizStep === 3 && (
              <motion.div key="wiz3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <p className="text-xs text-zinc-400 mb-3">Choose the automated action:</p>
                <div className="grid grid-cols-2 gap-2">
                  {ACTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAction(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all text-sm",
                        action === opt.value
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                      )}
                    >
                      <span className="text-zinc-300">{opt.icon}</span>
                      <span className="font-medium text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {wizStep === 4 && (
              <motion.div key="wiz4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">AI Response Tone</label>
                  <div className="flex gap-2">
                    {(["Friendly", "Professional", "Casual", "Urgent"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "flex-1 text-xs font-medium py-2 rounded-lg border transition-all",
                          tone === t
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Custom System Instructions</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="E.g. You are a warm receptionist for our spa salon. Greet customers, answer FAQs, and book appointments."
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>
              </motion.div>
            )}

            {wizStep === 5 && (
              <motion.div key="wiz5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Workflow Live!</h4>
                <p className="text-sm text-zinc-400 mb-6">
                  <span className="text-white font-medium">{name || "Untitled Workflow"}</span> is now active and monitoring for triggers.
                </p>
                <button
                  onClick={() => { onClose(); reset(); }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-8 py-3 rounded-full transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {wizStep < 5 && (
          <div className="flex gap-3 p-5 pt-0">
            {wizStep > 1 && (
              <button onClick={() => setWizStep(wizStep - 1)} className="px-5 py-2.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Back
              </button>
            )}
            {wizStep < 4 ? (
              <button
                onClick={() => setWizStep(wizStep + 1)}
                disabled={wizStep === 1 && !name}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm py-2.5 rounded-full transition-colors flex items-center justify-center gap-1"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-black font-semibold text-sm py-2.5 rounded-full transition-all flex items-center justify-center gap-1 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {deploying ? "Deploying…" : "Deploy Workflow"}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── AI Playground Tab ─── */
const AIPlaygroundTab = React.memo(function AIPlaygroundTab() {
  const workflows = useAuthStore((s) => s.workflows);
  const updatePrompt = useAuthStore((s) => s.updateWorkflowPrompt);
  const selectedId = useAuthStore((s) => s.selectedWorkflowId);

  const selected = workflows.find((w) => w.id === selectedId) || workflows[0];

  const [editPrompt, setEditPrompt] = useState(selected?.customPrompt || "");
  const [editTone, setEditTone] = useState<Workflow["aiTone"]>(selected?.aiTone || "Friendly");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, isAiTyping]);

  // Sync prompt/tone when selected workflow changes
  useEffect(() => {
    if (selected) {
      setEditPrompt(selected.customPrompt);
      setEditTone(selected.aiTone);
    }
  }, [selected?.id]);

  const handleSave = () => {
    if (selected) {
      updatePrompt(selected.id, editPrompt, editTone);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiTyping) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsAiTyping(true);

    // Build system prompt with tone instruction
    const fullPrompt = `${editPrompt}\n\nIMPORTANT: Respond in a ${editTone} tone. Keep replies concise (2-3 sentences max).`;

    // Try real Gemini API first
    const geminiReply = await callGeminiAI(fullPrompt, userMsg);

    if (geminiReply) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: geminiReply }]);
    } else {
      // Fallback to pre-scripted responses
      await new Promise((r) => setTimeout(r, 800));
      const responses = FALLBACK_RESPONSES[editTone];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }
    setIsAiTyping(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Configuration Panel */}
      <div className="space-y-5">
        {/* Workflow selector */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            Workflow Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Active Workflow</label>
              <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-3 border border-white/5">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", CHANNEL_BG[selected?.channel || "Web"], CHANNEL_COLOR[selected?.channel || "Web"])}>
                  {CHANNEL_ICON[selected?.channel || "Web"]}
                </div>
                <span className="text-sm font-medium text-white">{selected?.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Response Tone</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["Friendly", "Professional", "Casual", "Urgent"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setEditTone(t)}
                    className={cn(
                      "text-xs font-medium py-2 rounded-lg border transition-all",
                      editTone === t
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-zinc-400" />
            System Instructions
          </h3>
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            rows={6}
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/30 transition-colors resize-none font-mono leading-relaxed"
          />
          <button
            onClick={handleSave}
            className="mt-3 w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </div>

      {/* Right: Live AI Chat Tester */}
      <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[540px]">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Receptionist Tester</p>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Tone: {editTone} · Live sandbox
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 console-scroll">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 font-medium">Test your AI receptionist</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-[240px]">Send a message below to see how your AI responds with the current tone and instructions.</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.sender === "user"
                  ? "bg-emerald-500/15 text-emerald-100 rounded-br-md"
                  : "bg-white/[0.04] text-zinc-200 border border-white/5 rounded-bl-md"
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isAiTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/[0.04] border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0s]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0.2s]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0.4s]" />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
              placeholder="Type a customer message…"
              className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/30 transition-colors"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim() || isAiTyping}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ─── Analytics Tab ─── */
const AnalyticsTab = React.memo(function AnalyticsTab() {
  const workflows = useAuthStore((s) => s.workflows);
  const chartData = useAuthStore((s) => s.chartData);
  const totalExecs = workflows.reduce((a, w) => a + w.executionsCount, 0);
  const avgSuccess = workflows.length > 0 ? (workflows.reduce((a, w) => a + w.successRate, 0) / workflows.length).toFixed(1) : "0";
  const totalHours = workflows.reduce((a, w) => a + w.savedHours, 0).toFixed(1);
  const maxValue = Math.max(...chartData.map((d) => d.value), 5); // Fallback to 5 to avoid 0 division if no data

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Activity className="w-5 h-5" />} label="Total Workflow Runs" value={totalExecs.toString()} trend="+18%" />
        <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Average Success Rate" value={avgSuccess} suffix="%" trend="+2.1%" />
        <KPICard icon={<Clock className="w-5 h-5" />} label="Hours Saved This Month" value={totalHours} suffix="hrs" trend="+12%" />
        <KPICard icon={<DollarSign className="w-5 h-5" />} label="Est. Revenue Protected" value={`$${(parseFloat(totalHours) * 55).toFixed(0)}`} trend="+24%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Line / Bar Chart */}
        <div className="lg:col-span-3 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" /> Executions This Week
            </h3>
            <span className="text-xs text-zinc-500">Last 7 days</span>
          </div>
          {/* SVG Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-44 px-2">
            {chartData.map((d, i) => {
              const height = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: `${Math.max(height, 2)}%`, originY: 1 }}
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 relative group cursor-crosshair"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111] border border-white/10 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {d.value} runs
                    </div>
                  </motion.div>
                  <span className="text-[11px] text-zinc-500 font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Performance */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Hash className="w-4 h-4 text-zinc-400" /> Channel Distribution
          </h3>
          <div className="space-y-4">
            {workflows.map((wf) => {
              const pct = totalExecs > 0 ? Math.round((wf.executionsCount / totalExecs) * 100) : 0;
              return (
                <div key={wf.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={CHANNEL_COLOR[wf.channel]}>{CHANNEL_ICON[wf.channel]}</span>
                      <span className="text-xs font-medium text-zinc-300">{wf.channel}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ─── Channels Tab ─── */
const CHANNEL_SERVICES = [
  { name: "WhatsApp Business", key: "WhatsApp", desc: "Automate bookings, send confirmations, and capture leads via WhatsApp Business API.", status: "connected", icon: <MessageCircle className="w-6 h-6" />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { name: "Google Business Profile", key: "Reviews", desc: "Automate 5-star review requests post-service and monitor your public reputation score.", status: "connected", icon: <Star className="w-6 h-6" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { name: "SMS / Twilio", key: "SMS", desc: "Recover missed calls, send appointment reminders, and dispatch follow-ups via SMS.", status: "connected", icon: <Phone className="w-6 h-6" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { name: "Instagram Business", key: "Instagram", desc: "Auto-reply to DMs and comments with AI, send promotional vouchers, capture leads.", status: "disconnected", icon: <Instagram className="w-6 h-6" />, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { name: "Website Widget", key: "Web", desc: "Embed a live AI chat widget on your website for instant visitor engagement.", status: "disconnected", icon: <Globe className="w-6 h-6" />, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
];

const ChannelsTab = React.memo(function ChannelsTab({ onOpenIntegration }: { onOpenIntegration: (key: string) => void }) {
  const connectedChannels = useAuthStore(s => s.connectedChannels);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-white">Connected Channels</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Manage your integrations and API connections</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          {connectedChannels.filter(c => c.isConnected).length} Active
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHANNEL_SERVICES.map((ch) => {
          const connectedState = connectedChannels.find(c => c.channelKey === ch.key);
          const isConnected = connectedState?.isConnected || false;

          return (
          <motion.div
            key={ch.key}
            layout
            className={cn(
              "glass-card rounded-xl p-5 transition-all",
              !isConnected && "opacity-60"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", ch.bg, ch.color)}>
                {ch.icon}
              </div>
              <button
                onClick={() => onOpenIntegration(ch.key)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-full border transition-all",
                  isConnected
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
                )}
              >
                {isConnected ? <Wifi className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                {isConnected ? "Configure" : "Connect"}
              </button>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{ch.name}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">{ch.desc}</p>
            {isConnected && (
              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-emerald-400/70">
                <Shield className="w-3 h-3" />
                {ch.key === 'WhatsApp' && connectedState?.credentials?.phone ? (
                  <span>Active: +{connectedState.credentials.phone}</span>
                ) : (
                  <span>API configured & active</span>
                )}
              </div>
            )}
          </motion.div>
          );
        })}
      </div>
    </div>
  );
});

/* ──────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
   ────────────────────────────────────────────── */

export function Dashboard() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const workflows = useAuthStore((s) => s.workflows);
  const logs = useAuthStore((s) => s.logs);
  const toggleWorkflow = useAuthStore((s) => s.toggleWorkflow);
  const triggerMockSimulation = useAuthStore((s) => s.triggerMockSimulation);
  const clearLogs = useAuthStore((s) => s.clearLogs);

  const [activeTab, setActiveTab] = useState<TabId>("workflows");
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [configModalId, setConfigModalId] = useState<string | null>(null);
  
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [integrationChannelKey, setIntegrationChannelKey] = useState<string | null>(null);

  const handleOpenIntegration = (key: string) => {
    setIntegrationChannelKey(key);
    setIntegrationModalOpen(true);
  };

  // Auto-simulation every 25 seconds for immersive feel
  useEffect(() => {
    const interval = setInterval(() => {
      const activeWfs = workflows.filter((w) => w.isActive);
      if (activeWfs.length > 0 && !simulatingId) {
        const random = activeWfs[Math.floor(Math.random() * activeWfs.length)];
        triggerMockSimulation(random.id);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [workflows, simulatingId, triggerMockSimulation]);

  const handleSimulate = useCallback(async (id: string) => {
    setSimulatingId(id);
    await triggerMockSimulation(id);
    setSimulatingId(null);
  }, [triggerMockSimulation]);

  // If session is still loading, show spinner
  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading your dashboard…</p>
        </div>
      </section>
    );
  }

  // If not logged in, redirect to home
  if (!isLoggedIn) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black">
        <div className="glass-panel rounded-2xl p-8 max-w-sm text-center">
          <h2 className="text-lg font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to log in to access your dashboard.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-8 py-3 rounded-full transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </section>
    );
  }

  // Computed KPIs
  const totalExecs = workflows.reduce((a, w) => a + w.executionsCount, 0);
  const totalHours = workflows.reduce((a, w) => a + w.savedHours, 0).toFixed(1);
  const activeCount = workflows.filter((w) => w.isActive).length;

  return (
    <section className="min-h-screen pt-24 pb-20 bg-black dash-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ─── Admin Switcher Banner ─── */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-amber-400">Admin Mode Active</h3>
                <p className="text-xs text-amber-400/80">You are viewing the user dashboard. You can switch to the Admin Command Center at any time.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition-colors border border-amber-500/30"
            >
              Go to Admin Dashboard &rarr;
            </button>
          </motion.div>
        )}

        {/* ─── Welcome Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-1">Command Center</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, <span className="text-gradient-green">{user?.businessName || "StarX"}</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Manage workflows, tune AI behavior, and monitor real-time analytics.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full status-live" />
                <span className="text-xs font-medium text-emerald-300">System Online</span>
              </div>
              <div className="text-xs text-zinc-500 bg-white/[0.03] border border-white/5 rounded-full px-4 py-2">
                {activeCount}/{workflows.length} Active
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Quick Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard icon={<Zap className="w-5 h-5" />}       label="Workflows Deployed" value={workflows.length.toString()} />
          <KPICard icon={<Activity className="w-5 h-5" />}   label="Total Executions"   value={totalExecs.toString()} trend="+18%" />
          <KPICard icon={<Clock className="w-5 h-5" />}      label="Hours Saved"         value={totalHours} suffix="hrs" trend="+12%" />
          <KPICard icon={<DollarSign className="w-5 h-5" />} label="Revenue Protected"   value={`$${(parseFloat(totalHours) * 55).toFixed(0)}`} trend="+24%" />
        </div>

        {/* ─── Tab Navigation ─── */}
        <div className="flex items-center gap-1 mb-8 bg-white/[0.02] border border-white/5 rounded-xl p-1.5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition-all",
                activeTab === tab.id
                  ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        <AnimatePresence mode="wait">
          {activeTab === "workflows" && (
            <motion.div
              key="tab-workflows"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-zinc-400" /> Active Workflows
                </h2>
                <button
                  onClick={() => setWizardOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-5 rounded-full transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <Plus className="w-3.5 h-3.5" /> New Workflow
                </button>
              </div>

              {/* Workflow Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                {workflows.map((wf) => (
                  <WorkflowCard
                    key={wf.id}
                    workflow={wf}
                    onToggle={() => toggleWorkflow(wf.id)}
                    onSimulate={() => handleSimulate(wf.id)}
                    onConfigure={() => {
                      useAuthStore.setState({ selectedWorkflowId: wf.id });
                      setActiveTab("playground");
                    }}
                    isSimulating={simulatingId === wf.id}
                  />
                ))}
              </div>

              {/* Execution Console */}
              <ExecutionConsole logs={logs} onClear={clearLogs} />
            </motion.div>
          )}

          {activeTab === "playground" && (
            <motion.div
              key="tab-playground"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AIPlaygroundTab />
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="tab-analytics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AnalyticsTab />
            </motion.div>
          )}

          {activeTab === "channels" && (
            <motion.div
              key="tab-channels"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ChannelsTab onOpenIntegration={handleOpenIntegration} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Workflow Wizard Modal */}
      <AnimatePresence>
        {wizardOpen && (
          <CreateWorkflowWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
        )}
      </AnimatePresence>

      <IntegrationModal 
        channelKey={integrationChannelKey} 
        isOpen={integrationModalOpen} 
        onClose={() => setIntegrationModalOpen(false)} 
      />
    </section>
  );
}
