import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Check, ChevronRight, Loader2, Sparkles, MessageCircle, Phone, DollarSign, Instagram, Globe, Brain, MessageSquare, Zap
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore, type Workflow } from "../../store/authStore";

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
  { value: "review_request", label: "Send Review Invitation",    icon: <StarIcon className="w-5 h-5" /> },
  { value: "voucher_send",   label: "Send Promotional Voucher",  icon: <Sparkles className="w-5 h-5" /> },
];

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

const TRIGGER_TO_CHANNEL: Record<string, Workflow["channel"]> = {
  whatsapp_message: "WhatsApp",
  missed_call: "SMS",
  invoice_paid: "Reviews",
  ig_keyword: "Instagram",
  web_chat: "Web",
};

interface CreateWorkflowWizardProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkflowWizard({ open, onClose }: CreateWorkflowWizardProps) {
  const addWorkflow = useAuthStore((s) => s.addWorkflow);
  const [wizStep, setWizStep] = useState(1);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<Workflow["aiTone"]>("Friendly");
  const [deploying, setDeploying] = useState(false);

  const reset = () => { 
    setWizStep(1); 
    setName(""); 
    setDesc(""); 
    setTrigger(""); 
    setAction(""); 
    setPrompt(""); 
    setTone("Friendly"); 
  };

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
    setWizStep(5); // success step
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) { onClose(); reset(); } }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.1)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.005]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{wizStep === 5 ? "Workflow Deployed!" : "Create New Workflow"}</h3>
            {wizStep < 5 && <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Step {wizStep} of 4</p>}
          </div>
          <button onClick={() => { onClose(); reset(); }} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        {wizStep < 5 && (
          <div className="h-0.5 bg-zinc-900 w-full">
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
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Workflow Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Weekend Promotion Bot" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="What does this workflow automate?" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors resize-none" />
                </div>
              </motion.div>
            )}

            {wizStep === 2 && (
              <motion.div key="wiz2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <p className="text-[11px] text-zinc-500 font-medium mb-3">Choose the specific event that triggers this automation:</p>
                <div className="space-y-2 h-[280px] overflow-y-auto console-scroll pr-1">
                  {TRIGGER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTrigger(opt.value)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-xs",
                        trigger === opt.value
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : "bg-white/[0.01] border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border", opt.color)}>{opt.icon}</div>
                      <span className="font-semibold">{opt.label}</span>
                      {trigger === opt.value && <Check className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {wizStep === 3 && (
              <motion.div key="wiz3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <p className="text-[11px] text-zinc-500 font-medium mb-3">Choose the automated action response:</p>
                <div className="grid grid-cols-2 gap-3">
                  {ACTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAction(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all text-xs justify-center min-h-[90px]",
                        action === opt.value
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : "bg-white/[0.01] border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                      )}
                    >
                      <span className="text-zinc-300">{opt.icon}</span>
                      <span className="font-semibold text-[10px] mt-1">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {wizStep === 4 && (
              <motion.div key="wiz4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">AI Response Tone</label>
                  <div className="flex gap-2">
                    {(["Friendly", "Professional", "Casual", "Urgent"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "flex-1 text-xs font-semibold py-2 rounded-lg border transition-all",
                          tone === t
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.03)]"
                            : "bg-white/[0.01] border-white/5 text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Custom Prompt Instructions</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="E.g. You are a warm receptionist for our beauty salon. Help answer price FAQs and direct customers to bookings."
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-300 outline-none focus:border-emerald-500/50 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </motion.div>
            )}

            {wizStep === 5 && (
              <motion.div key="wiz5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 success-icon-enter">
                  <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Workflow Deployed Live!</h4>
                <p className="text-xs text-zinc-500 mb-6 max-w-[280px] mx-auto leading-relaxed">
                  <span className="text-zinc-200 font-semibold">{name || "Untitled Workflow"}</span> is now active and monitoring live customer channels.
                </p>
                <button
                  onClick={() => { onClose(); reset(); }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-8 py-3 rounded-full transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-wider"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {wizStep < 5 && (
          <div className="flex gap-3 p-5 pt-0 bg-white/[0.005]">
            {wizStep > 1 && (
              <button onClick={() => setWizStep(wizStep - 1)} className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-500 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider">
                Back
              </button>
            )}
            {wizStep < 4 ? (
              <button
                onClick={() => setWizStep(wizStep + 1)}
                disabled={wizStep === 1 && !name}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs py-2.5 rounded-full transition-colors flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleDeploy}
                disabled={deploying || !trigger || !action}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-black font-bold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1 shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-wider"
              >
                {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{deploying ? "Deploying..." : "Deploy Workflow"}</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
