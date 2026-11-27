"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  ChevronRight,
  Loader2,
  MessageCircle,
  Phone,
  DollarSign,
  Instagram,
  Globe,
  Brain,
  MessageSquare,
  Zap,
  CheckCircle2,
  Star,
} from "lucide-react";
import {
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import { useAuthStore, type Workflow } from "../../store/authStore";

const TRIGGER_OPTIONS = [
  { value: "whatsapp_message", label: "WhatsApp message received", icon: MessageCircle },
  { value: "missed_call", label: "Missed phone call", icon: Phone },
  { value: "invoice_paid", label: "Invoice marked paid", icon: DollarSign },
  { value: "ig_keyword", label: "Instagram keyword detected", icon: Instagram },
  { value: "web_chat", label: "Website Chat Initiated", icon: Globe },
];

const ACTION_OPTIONS = [
  { value: "ai_reply", label: "Generate AI Response", icon: Brain },
  { value: "send_sms", label: "Dispatch SMS message", icon: MessageSquare },
  { value: "review_request", label: "Send review invitation", icon: Star },
  { value: "voucher_send", label: "Send offer follow-up", icon: Zap },
];

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
  const saving = React.useRef(false);
  const [error, setError] = useState("");
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deploying) {
        onClose();
        setWizStep(1);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, deploying, onClose]);

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
    if (saving.current || !name.trim() || !trigger || !action) return;
    saving.current = true;
    setDeploying(true);
    setError("");
    try {
      await addWorkflow({
        name: name.trim(),
        description: desc || "Custom automated workflow.",
        trigger: TRIGGER_OPTIONS.find((t) => t.value === trigger)?.label || trigger,
        action: ACTION_OPTIONS.find((a) => a.value === action)?.label || action,
        isActive: true,
        channel: TRIGGER_TO_CHANNEL[trigger] || "Web",
        aiTone: tone,
        customPrompt: prompt || "Reply helpfully and book appointments when possible.",
      });
      setWizStep(5);
    } catch {
      setError("Could not save workflow. Review your fields and try again.");
    } finally {
      saving.current = false;
      setDeploying(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (!saving.current && e.target === e.currentTarget) {
          onClose();
          reset();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none"
    >
      <motion.div
        initial={{ scale: 0.97, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, y: 8 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-2xl bg-[#0c100e] border border-[#edf0ee]/12 overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.75)]"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#edf0ee]/[0.08]">
          <div>
            <h3 className="text-sm font-semibold text-[#edf0ee]">
              {wizStep === 5 ? "Workflow activated" : "Create workflow"}
            </h3>
            {wizStep < 5 && (
              <p className="text-xs text-[#727c75] mt-0.5 tabular-nums">Step {wizStep} of 4</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close workflow wizard"
            disabled={deploying}
            onClick={() => {
              onClose();
              reset();
            }}
            className="text-[#727c75] hover:text-[#edf0ee] transition-colors p-1.5 rounded-lg hover:bg-[#19201d] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {wizStep < 5 && (
          <div className="h-0.5 bg-[#121715] w-full">
            <motion.div
              className="h-full bg-[#34d399]"
              animate={{ width: `${(wizStep / 4) * 100}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="px-5 pt-4 text-xs text-[#f28b8e]">
            {error}
          </p>
        )}

        <div className="p-5">
          <AnimatePresence mode="wait">
            {wizStep === 1 && (
              <motion.div
                key="wiz1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
                    Workflow name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Weekend Promotion Bot"
                    className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2.5 text-xs")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    placeholder="Describe what this rule handles"
                    className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2.5 text-xs resize-none")}
                  />
                </div>
              </motion.div>
            )}

            {wizStep === 2 && (
              <motion.div
                key="wiz2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-xs text-[#727c75] mb-3">
                  Select the trigger event
                </p>
                <div className="space-y-2 h-[260px] overflow-y-auto console-scroll pr-1">
                  {TRIGGER_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setTrigger(opt.value)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors text-xs cursor-pointer",
                          trigger === opt.value
                            ? "bg-[#19201d] border-[#34d399]/40 text-[#edf0ee]"
                            : "bg-[#121715] border-[#edf0ee]/[0.06] text-[#a1aaa4] hover:border-[#edf0ee]/14 hover:text-[#edf0ee]"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#0d1210] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4]">
                          <Icon className="w-4 h-4" strokeWidth={1.65} />
                        </div>
                        <span className="font-medium">{opt.label}</span>
                        {trigger === opt.value && (
                          <Check className="w-4 h-4 text-[#34d399] ml-auto flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {wizStep === 3 && (
              <motion.div
                key="wiz3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-xs text-[#727c75] mb-3">
                  Select the automated response
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ACTION_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setAction(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors text-xs justify-center min-h-[88px] cursor-pointer",
                          action === opt.value
                            ? "bg-[#19201d] border-[#34d399]/40 text-[#edf0ee]"
                            : "bg-[#121715] border-[#edf0ee]/[0.06] text-[#a1aaa4] hover:border-[#edf0ee]/14 hover:text-[#edf0ee]"
                        )}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.65} />
                        <span className="font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {wizStep === 4 && (
              <motion.div
                key="wiz4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
                    Response tone
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["Friendly", "Professional", "Casual", "Urgent"] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "text-xs font-medium py-2 rounded-lg border transition-colors cursor-pointer",
                          tone === t
                            ? "bg-[#19201d] border-[#34d399]/35 text-[#edf0ee]"
                            : "bg-[#121715] border-[#edf0ee]/[0.06] text-[#727c75] hover:text-[#edf0ee]"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
                    Prompt instructions
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Instructions for how the assistant should reply and handle booking requests"
                    className={cn(CONSOLE_INPUT, "w-full p-3.5 text-xs resize-none leading-relaxed")}
                  />
                </div>
              </motion.div>
            )}

            {wizStep === 5 && (
              <motion.div
                key="wiz5"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4cc38a]/12 border border-[#4cc38a]/25 flex items-center justify-center mx-auto mb-4 text-[#4cc38a]">
                  <CheckCircle2 className="w-6 h-6" strokeWidth={1.65} />
                </div>
                <h4 className="text-base font-semibold text-[#edf0ee] mb-1.5">
                  Workflow Deployed!
                </h4>
                <p className="text-xs text-[#727c75] mb-6 max-w-[280px] mx-auto leading-relaxed">
                  {name || "Untitled workflow"} is now monitoring incoming channel triggers.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    reset();
                  }}
                  className={cn(CONSOLE_BTN_PRIMARY, "px-6 py-2")}
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {wizStep < 5 && (
          <div className="flex gap-2.5 p-5 pt-0 justify-end">
            {wizStep > 1 && (
              <button
                type="button"
                disabled={deploying}
                onClick={() => setWizStep(wizStep - 1)}
                className={CONSOLE_BTN_SECONDARY}
              >
                Back
              </button>
            )}
            {wizStep < 4 ? (
              <button
                type="button"
                onClick={() => setWizStep(wizStep + 1)}
                disabled={
                  (wizStep === 1 && !name.trim()) ||
                  (wizStep === 2 && !trigger) ||
                  (wizStep === 3 && !action)
                }
                className={cn(CONSOLE_BTN_PRIMARY, "flex-1")}
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeploy}
                disabled={deploying || !trigger || !action}
                className={cn(CONSOLE_BTN_PRIMARY, "flex-1")}
              >
                {deploying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>{deploying ? "Deploying..." : "Deploy Workflow"}</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
