"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Save, Plus, Trash2, Play, Sliders,
  MessageSquare, PhoneMissed, Star, Instagram, Globe,
  HelpCircle, Clock, UserCheck, Smile, Send, CheckSquare,
  Calendar, Bell, UserPlus, ArrowDown, ChevronRight
} from "lucide-react";
import { useAuthStore, type Workflow } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { cn } from "../../lib/utils";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_DANGER,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";

interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "action";
  nodeType: string;
  properties: Record<string, any>;
}

export function WorkflowEditor() {
  const workflows = useAuthStore((s) => s.workflows);
  const selectedWorkflowId = useAuthStore((s) => s.selectedWorkflowId);
  const updateWorkflow = useAuthStore((s) => s.updateWorkflow);
  const addWorkflow = useAuthStore((s) => s.addWorkflow);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  const isEditing = !!selectedWorkflowId;
  const existingWorkflow = workflows.find((w) => w.id === selectedWorkflowId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState<Workflow["channel"]>("WhatsApp");
  const [isActive, setIsActive] = useState(true);
  const [aiTone, setAiTone] = useState<Workflow["aiTone"]>("Friendly");
  const [customPrompt, setCustomPrompt] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState("");
  const saving = React.useRef(false);
  const mounted = React.useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const draft = React.useRef<{ id: string; version: number } | null>(null);

  const initializeSteps = (workflow: Workflow): WorkflowStep[] => {
    if (workflow.config && Array.isArray(workflow.config.steps) && workflow.config.steps.length > 0) {
      return JSON.parse(JSON.stringify(workflow.config.steps));
    }

    const upgradedSteps: WorkflowStep[] = [];

    let triggerNodeType = "whatsapp_message";
    if (workflow.trigger.includes("Missed") || workflow.channel === "SMS") {
      triggerNodeType = "sms_missed_call";
    } else if (workflow.channel === "Reviews") {
      triggerNodeType = "new_review";
    } else if (workflow.channel === "Instagram") {
      triggerNodeType = "insta_comment";
    } else if (workflow.channel === "Web") {
      triggerNodeType = "web_chat";
    }

    upgradedSteps.push({
      id: "step-trigger",
      type: "trigger",
      nodeType: triggerNodeType,
      properties: {
        label: workflow.trigger,
        messageSample: "Hey! Can I book a slot?",
      },
    });

    let actionNodeType = "send_message";
    if (workflow.action.includes("Task") || workflow.action.includes("task")) {
      actionNodeType = "create_task";
    } else if (workflow.action.includes("Book") || workflow.action.includes("Appointment")) {
      actionNodeType = "create_appointment";
    } else if (workflow.action.includes("Notify") || workflow.action.includes("Escalate")) {
      actionNodeType = "notify_team";
    }

    upgradedSteps.push({
      id: "step-action-1",
      type: "action",
      nodeType: actionNodeType,
      properties: {
        label: workflow.action,
        message: workflow.customPrompt || "Thanks for reaching out! We'll get back to you shortly.",
        title: "Follow up on " + workflow.name,
        priority: "high",
      },
    });

    return upgradedSteps;
  };

  useEffect(() => {
    if (isEditing && existingWorkflow) {
      if (draft.current?.id === existingWorkflow.id) return;
      draft.current = { id: existingWorkflow.id, version: existingWorkflow.editVersion ?? 0 };
      setName(existingWorkflow.name);
      setDescription(existingWorkflow.description);
      setChannel(existingWorkflow.channel);
      setIsActive(existingWorkflow.isActive);
      setAiTone(existingWorkflow.aiTone);
      setCustomPrompt(existingWorkflow.customPrompt);
      setSteps(initializeSteps(existingWorkflow));
    } else {
      draft.current = null;
      setName("");
      setDescription("");
      setChannel("WhatsApp");
      setIsActive(true);
      setAiTone("Friendly");
      setCustomPrompt("Reply helpfully and book appointments when possible.");
      setSteps([
        {
          id: "step-trigger",
          type: "trigger",
          nodeType: "whatsapp_message",
          properties: {
            label: "WhatsApp message received",
            messageSample: "Hey! Can I book a hair coloring slot for tomorrow?",
          },
        },
        {
          id: "step-action-1",
          type: "action",
          nodeType: "send_message",
          properties: {
            label: "Send automated reply",
            message: "Hi! Thanks for contacting us. We'll check the calendar and schedule that booking for you shortly.",
          },
        },
      ]);
    }
  }, [selectedWorkflowId, existingWorkflow, isEditing]);

  const applyPreset = (presetName: string) => {
    if (presetName === "off_hours") {
      setName("Off-Hours SMS Recovery");
      setDescription("Automatically notifies team and replies to SMS leads text messaging outside business hours.");
      setChannel("SMS");
      setSteps([
        {
          id: "step-trigger",
          type: "trigger",
          nodeType: "sms_missed_call",
          properties: {
            label: "Missed Call SMS Recovery",
            phoneSample: "+1 (555) 345-6789",
          },
        },
        {
          id: "step-cond-1",
          type: "condition",
          nodeType: "outside_hours",
          properties: {
            label: "Outside business hours",
            hours: "9:00 AM - 5:00 PM",
            timezone: "EST",
          },
        },
        {
          id: "step-act-1",
          type: "action",
          nodeType: "send_message",
          properties: {
            label: "Send SMS Reply",
            message: "Hey! Sorry we missed your call. We're currently closed, but we've logged your request. We will follow up first thing tomorrow morning!",
          },
        },
        {
          id: "step-act-2",
          type: "action",
          nodeType: "create_task",
          properties: {
            label: "Create Internal Task",
            title: "Follow up with off-hours caller",
            description: "Caller requested info after business hours. Call back immediately.",
          },
        },
      ]);
    } else if (presetName === "review_booster") {
      setName("Review Request Boost");
      setDescription("Fires a review invite to customers when a positive sentiment is detected on WhatsApp.");
      setChannel("WhatsApp");
      setSteps([
        {
          id: "step-trigger",
          type: "trigger",
          nodeType: "whatsapp_message",
          properties: {
            label: "WhatsApp Message Received",
            messageSample: "Thank you so much! The haircut was absolutely amazing, best service ever!",
          },
        },
        {
          id: "step-cond-1",
          type: "condition",
          nodeType: "sentiment_check",
          properties: {
            label: "Sentiment analysis is positive",
            sentiment: "Positive",
          },
        },
        {
          id: "step-act-1",
          type: "action",
          nodeType: "send_message",
          properties: {
            label: "Send Review Invite Link",
            message: "We're so glad you loved the service! If you have 30 seconds, could you share your review on Google? Here is the link: g.page/ourbusiness/review. Thank you!",
          },
        },
        {
          id: "step-act-2",
          type: "action",
          nodeType: "update_lead",
          properties: {
            label: "Update CRM Status",
            status: "converted",
          },
        },
      ]);
    } else if (presetName === "escalate_negatives") {
      setName("Urgent Complaint Escalation");
      setDescription("Detects negative customer reviews or messages and instantly updates lead status while alerting staff.");
      setChannel("Reviews");
      setSteps([
        {
          id: "step-trigger",
          type: "trigger",
          nodeType: "new_review",
          properties: {
            label: "New Review Left",
            stars: "3 stars or below",
          },
        },
        {
          id: "step-cond-1",
          type: "condition",
          nodeType: "sentiment_check",
          properties: {
            label: "Verify negative sentiment",
            sentiment: "Negative",
          },
        },
        {
          id: "step-act-1",
          type: "action",
          nodeType: "notify_team",
          properties: {
            label: "Notify Team of Bad Review",
            channel: "Alerts & Support",
            priority: "High",
          },
        },
        {
          id: "step-act-2",
          type: "action",
          nodeType: "create_task",
          properties: {
            label: "Create Internal Urgent Task",
            title: "Urgent: Resolve customer complaint review",
            description: "Negative review left on public portal. Contact client immediately to resolve issue.",
          },
        },
      ]);
    }
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case "whatsapp_message":
        return <MessageSquare className="w-4 h-4 text-[#34d399]" />;
      case "sms_missed_call":
        return <PhoneMissed className="w-4 h-4 text-[#a1aaa4]" />;
      case "new_review":
        return <Star className="w-4 h-4 text-amber-300" />;
      case "insta_comment":
        return <Instagram className="w-4 h-4 text-[#a1aaa4]" />;
      case "web_chat":
        return <Globe className="w-4 h-4 text-sky-300" />;
      case "keyword_match":
        return <Sliders className="w-4 h-4 text-[#a1aaa4]" />;
      case "outside_hours":
        return <Clock className="w-4 h-4 text-amber-300" />;
      case "new_customer":
        return <UserCheck className="w-4 h-4 text-[#4cc38a]" />;
      case "sentiment_check":
        return <Smile className="w-4 h-4 text-[#a1aaa4]" />;
      case "send_message":
        return <Send className="w-4 h-4 text-[#34d399]" />;
      case "create_task":
        return <CheckSquare className="w-4 h-4 text-[#a1aaa4]" />;
      case "create_appointment":
        return <Calendar className="w-4 h-4 text-[#4cc38a]" />;
      case "notify_team":
        return <Bell className="w-4 h-4 text-[#f28b8e]" />;
      case "update_lead":
        return <UserPlus className="w-4 h-4 text-sky-300" />;
      default:
        return <HelpCircle className="w-4 h-4 text-[#727c75]" />;
    }
  };

  const updateStepProperty = (stepId: string, propertyKey: string, value: any) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              properties: {
                ...s.properties,
                [propertyKey]: value,
              },
            }
          : s
      )
    );
  };

  const changeNodeType = (stepId: string, nodeType: string, _type: "trigger" | "condition" | "action") => {
    let properties: Record<string, any> = {};
    if (nodeType === "whatsapp_message") {
      properties = { label: "WhatsApp Message Received", messageSample: "Hey! Can I book a slot?" };
    } else if (nodeType === "sms_missed_call") {
      properties = { label: "Missed Call SMS Recovery", phoneSample: "+1 (555) 234-5678" };
    } else if (nodeType === "new_review") {
      properties = { label: "New Review Left", stars: "5 stars" };
    } else if (nodeType === "insta_comment") {
      properties = { label: "Instagram Comment or DM", commentKeyword: "VOUCHER" };
    } else if (nodeType === "web_chat") {
      properties = { label: "Website Chat Initiated", pageName: "pricing" };
    } else if (nodeType === "keyword_match") {
      properties = { label: "Message contains keywords", keywords: "book, appointment, pricing" };
    } else if (nodeType === "outside_hours") {
      properties = { label: "Outside business hours", hours: "9:00 AM - 5:00 PM", timezone: "EST" };
    } else if (nodeType === "new_customer") {
      properties = { label: "Customer is first-time contact" };
    } else if (nodeType === "sentiment_check") {
      properties = { label: "Sentiment analysis is Negative/Positive", sentiment: "Negative" };
    } else if (nodeType === "send_message") {
      properties = { label: "Send Automated Message Reply", message: "Hi! Thanks for contacting us. We will follow up shortly." };
    } else if (nodeType === "create_task") {
      properties = { label: "Create Internal Task", title: "Automated workflow request", description: "Follow up immediately." };
    } else if (nodeType === "create_appointment") {
      properties = { label: "Schedule Appointment", title: "Automated Booking", duration: "30m" };
    } else if (nodeType === "notify_team") {
      properties = { label: "Notify Staff/Team", channel: "General Staff", priority: "Normal" };
    } else if (nodeType === "update_lead") {
      properties = { label: "Update CRM Lead Status", status: "contacted" };
    }

    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, nodeType, properties } : s))
    );
  };

  const addStep = (type: "condition" | "action") => {
    const newId = `step-${type === "condition" ? "cond" : "act"}-${Date.now()}`;
    const defaultNodeType = type === "condition" ? "keyword_match" : "send_message";

    const properties =
      defaultNodeType === "keyword_match"
        ? { label: "Message contains keywords", keywords: "book, price" }
        : { label: "Send Automated Message Reply", message: "Thanks for reaching out! We'll assist you shortly." };

    const newStep: WorkflowStep = {
      id: newId,
      type,
      nodeType: defaultNodeType,
      properties,
    };

    if (type === "condition") {
      const triggerIndex = steps.findIndex((s) => s.type === "trigger");
      const updated = [...steps];
      updated.splice(triggerIndex + 1, 0, newStep);
      setSteps(updated);
    } else {
      setSteps((prev) => [...prev, newStep]);
    }
  };

  const removeStep = (stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const handleSave = async () => {
    if (saving.current || !name.trim()) return;

    const triggerStep = steps.find((s) => s.type === "trigger");
    const actionStep = steps.find((s) => s.type === "action");

    const triggerLabel = triggerStep ? triggerStep.properties.label || "Customer message" : "Custom trigger";
    const actionLabel = actionStep ? actionStep.properties.label || "Automated reaction" : "Custom action";

    const payload = {
      name,
      description,
      trigger: triggerLabel,
      action: actionLabel,
      isActive,
      channel,
      aiTone,
      customPrompt,
      config: { steps },
    };

    saving.current = true;
    setIsSaving(true);
    setSaveError("");
    try {
      if (selectedWorkflowId) await updateWorkflow(selectedWorkflowId, payload, draft.current?.version);
      else await addWorkflow(payload);
      if (mounted.current && useDashboardStore.getState().activeSection === "workflow_editor") {
        useAuthStore.setState({ selectedWorkflowId: null });
        setActiveSection("workflows");
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save this workflow. Please try again.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 select-none pb-24">
      {saveError && (
        <p role="alert" className="text-xs text-[#f28b8e] bg-[#e5484d]/10 border border-[#e5484d]/25 rounded-lg px-3.5 py-2.5">
          {saveError}
        </p>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#edf0ee]/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              useAuthStore.setState({ selectedWorkflowId: null });
              setActiveSection("workflows");
            }}
            className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] hover:text-[#edf0ee] transition-colors cursor-pointer"
            aria-label="Back to workflows"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs text-[#727c75]">Workflow engine</span>
            <h2 className={CONSOLE_HEADING}>
              {isEditing ? "Edit workflow" : "Create workflow"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08] px-3 py-1.5">
            <span className="text-xs text-[#727c75]">Status</span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer",
                isActive ? "bg-[#34d399]" : "bg-[#19201d] border border-[#edf0ee]/15"
              )}
            >
              <span
                className={cn(
                  "block w-3.5 h-3.5 rounded-full transition-transform",
                  isActive ? "translate-x-3.5 bg-[#080a09]" : "translate-x-0 bg-[#727c75]"
                )}
              />
            </button>
            <span className={cn("text-xs font-medium", isActive ? "text-[#4cc38a]" : "text-[#727c75]")}>
              {isActive ? "Active" : "Paused"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className={CONSOLE_BTN_PRIMARY}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Workflow"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* General Rules & Presets */}
        <div className={cn(CONSOLE_PANEL, "space-y-5 lg:col-span-1")}>
          <div className="border-b border-[#edf0ee]/[0.08] pb-3">
            <h3 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
              <Sliders className="w-3.5 h-3.5 text-[#34d399]" />
              <span>General rules</span>
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Workflow name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Off-Hours SMS Triage"
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What operational problem does this flow solve?"
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs resize-none")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Primary channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Workflow["channel"])}
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS (Missed calls)</option>
                <option value="Reviews">Google Reviews</option>
                <option value="Instagram">Instagram DM</option>
                <option value="Web">Website chat widget</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">AI tone preset</label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as Workflow["aiTone"])}
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
              >
                <option value="Friendly">Friendly & helpful</option>
                <option value="Professional">Polished & direct</option>
                <option value="Casual">Warm & conversational</option>
                <option value="Urgent">Immediate & attentive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">AI context guidelines</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                placeholder="Instructions for conversations handled by this workflow..."
                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs resize-none")}
              />
            </div>
          </div>

          <div className="border-t border-[#edf0ee]/[0.08] pt-4 space-y-2">
            <span className="block text-xs font-medium text-[#727c75] mb-1">Load preset</span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => applyPreset("off_hours")}
                className={cn(CONSOLE_SUBCARD, "text-left w-full p-3 hover:bg-[#19201d] transition-colors cursor-pointer group")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#edf0ee] group-hover:text-[#34d399]">Off-hours SMS recovery</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#727c75]" />
                </div>
                <p className="text-xs text-[#727c75] mt-0.5">Auto-task + SMS reply when closed</p>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("review_booster")}
                className={cn(CONSOLE_SUBCARD, "text-left w-full p-3 hover:bg-[#19201d] transition-colors cursor-pointer group")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#edf0ee] group-hover:text-[#34d399]">Review invite trigger</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#727c75]" />
                </div>
                <p className="text-xs text-[#727c75] mt-0.5">Send Google review link on positive chats</p>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("escalate_negatives")}
                className={cn(CONSOLE_SUBCARD, "text-left w-full p-3 hover:bg-[#19201d] transition-colors cursor-pointer group")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#edf0ee] group-hover:text-[#34d399]">Urgent complaint alert</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#727c75]" />
                </div>
                <p className="text-xs text-[#727c75] mt-0.5">Escalate poor ratings to managers</p>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Flow Builder */}
        <div className="lg:col-span-2">
          <div className={cn(CONSOLE_PANEL, "p-6 min-h-[540px] flex flex-col items-center")}>
            <div className="w-full flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ee]/[0.08] pb-4 mb-6">
              <div>
                <h3 className={CONSOLE_SECTION_TITLE}>Linear flow builder</h3>
                <p className="text-xs text-[#727c75] mt-0.5">
                  Configure trigger, conditions, and automated actions
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addStep("condition")}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  <Plus className="w-3.5 h-3.5 text-[#a1aaa4]" />
                  <span>Add condition</span>
                </button>
                <button
                  type="button"
                  onClick={() => addStep("action")}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  <Plus className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>Add action</span>
                </button>
              </div>
            </div>

            <div className="w-full max-w-xl flex flex-col items-center space-y-3">
              {steps.map((step, index) => {
                const isTrigger = step.type === "trigger";
                const isCondition = step.type === "condition";

                return (
                  <React.Fragment key={step.id}>
                    {index > 0 && (
                      <div className="flex flex-col items-center py-0.5">
                        <div className="w-px h-5 bg-[#edf0ee]/15" />
                        <ArrowDown className="w-3 h-3 text-[#727c75] -mt-0.5" />
                      </div>
                    )}

                    <div
                      className={cn(
                        CONSOLE_SUBCARD,
                        "w-full relative p-4 border-l-2",
                        isTrigger ? "border-l-[#34d399]" : isCondition ? "border-l-amber-300" : "border-l-sky-300"
                      )}
                    >
                      <span className="absolute -left-2.5 top-4 w-5 h-5 rounded-full bg-[#19201d] border border-[#edf0ee]/15 flex items-center justify-center text-[11px] font-mono tabular-nums text-[#edf0ee]">
                        {index + 1}
                      </span>

                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pl-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08]">
                            {getNodeIcon(step.nodeType)}
                          </div>
                          <div>
                            <span className="text-[11px] text-[#727c75] capitalize">{step.type}</span>
                            <h4 className="text-xs font-medium text-[#edf0ee]">
                              {step.properties?.label || step.nodeType}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isTrigger ? (
                            <select
                              value={step.nodeType}
                              onChange={(e) => changeNodeType(step.id, e.target.value, "trigger")}
                              className={cn(CONSOLE_INPUT, "px-2 py-1 text-xs cursor-pointer")}
                            >
                              <option value="whatsapp_message">WhatsApp message received</option>
                              <option value="sms_missed_call">SMS missed call event</option>
                              <option value="new_review">New review left</option>
                              <option value="insta_comment">Instagram comment/DM</option>
                              <option value="web_chat">Web chat widget</option>
                            </select>
                          ) : isCondition ? (
                            <>
                              <select
                                value={step.nodeType}
                                onChange={(e) => changeNodeType(step.id, e.target.value, "condition")}
                                className={cn(CONSOLE_INPUT, "px-2 py-1 text-xs cursor-pointer")}
                              >
                                <option value="keyword_match">Contains keywords</option>
                                <option value="outside_hours">Outside business hours</option>
                                <option value="new_customer">Is new customer</option>
                                <option value="sentiment_check">Sentiment check</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeStep(step.id)}
                                className={cn(CONSOLE_BTN_DANGER, "p-1.5")}
                                aria-label="Remove condition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <select
                                value={step.nodeType}
                                onChange={(e) => changeNodeType(step.id, e.target.value, "action")}
                                className={cn(CONSOLE_INPUT, "px-2 py-1 text-xs cursor-pointer")}
                              >
                                <option value="send_message">Send auto-reply message</option>
                                <option value="create_task">Create internal task</option>
                                <option value="create_appointment">Schedule booking</option>
                                <option value="notify_team">Notify team</option>
                                <option value="update_lead">Update CRM lead status</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeStep(step.id)}
                                className={cn(CONSOLE_BTN_DANGER, "p-1.5")}
                                aria-label="Remove action"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pl-3 space-y-3 border-t border-[#edf0ee]/[0.06] pt-3">
                        {step.nodeType === "whatsapp_message" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Sample trigger message</label>
                            <input
                              type="text"
                              value={step.properties?.messageSample || ""}
                              onChange={(e) => updateStepProperty(step.id, "messageSample", e.target.value)}
                              placeholder="e.g. Hey, can I book a haircut?"
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                            />
                          </div>
                        )}

                        {step.nodeType === "sms_missed_call" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Simulation phone number</label>
                            <input
                              type="text"
                              value={step.properties?.phoneSample || ""}
                              onChange={(e) => updateStepProperty(step.id, "phoneSample", e.target.value)}
                              placeholder="e.g. +1 (555) 234-5678"
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs font-mono")}
                            />
                          </div>
                        )}

                        {step.nodeType === "new_review" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Google Reviews rating filter</label>
                            <select
                              value={step.properties?.stars || "5 stars"}
                              onChange={(e) => updateStepProperty(step.id, "stars", e.target.value)}
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                            >
                              <option value="5 stars">5 stars only</option>
                              <option value="4 stars or below">4 stars or below</option>
                              <option value="3 stars or below">3 stars or below</option>
                              <option value="All ratings">All ratings</option>
                            </select>
                          </div>
                        )}

                        {step.nodeType === "insta_comment" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Instagram trigger keyword</label>
                            <input
                              type="text"
                              value={step.properties?.commentKeyword || ""}
                              onChange={(e) => updateStepProperty(step.id, "commentKeyword", e.target.value)}
                              placeholder="e.g. VOUCHER or GLOW"
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs font-mono")}
                            />
                          </div>
                        )}

                        {step.nodeType === "web_chat" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Active page name</label>
                            <input
                              type="text"
                              value={step.properties?.pageName || ""}
                              onChange={(e) => updateStepProperty(step.id, "pageName", e.target.value)}
                              placeholder="e.g. pricing or checkout"
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                            />
                          </div>
                        )}

                        {step.nodeType === "keyword_match" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Keywords (comma separated)</label>
                            <input
                              type="text"
                              value={step.properties?.keywords || ""}
                              onChange={(e) => updateStepProperty(step.id, "keywords", e.target.value)}
                              placeholder="e.g. book, appointment, timing"
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                            />
                          </div>
                        )}

                        {step.nodeType === "outside_hours" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Business hours</label>
                              <input
                                type="text"
                                value={step.properties?.hours || ""}
                                onChange={(e) => updateStepProperty(step.id, "hours", e.target.value)}
                                placeholder="e.g. 9:00 AM - 5:00 PM"
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Timezone</label>
                              <select
                                value={step.properties?.timezone || "EST"}
                                onChange={(e) => updateStepProperty(step.id, "timezone", e.target.value)}
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                              >
                                <option value="EST">Eastern Time (EST)</option>
                                <option value="CST">Central Time (CST)</option>
                                <option value="MST">Mountain Time (MST)</option>
                                <option value="PST">Pacific Time (PST)</option>
                                <option value="GMT">Greenwich Mean Time (GMT)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {step.nodeType === "new_customer" && (
                          <div className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              id={`new-cust-${step.id}`}
                              checked={step.properties?.strictMode || false}
                              onChange={(e) => updateStepProperty(step.id, "strictMode", e.target.checked)}
                              className="rounded border-[#edf0ee]/20 bg-[#121715] accent-[#34d399] w-3.5 h-3.5 cursor-pointer"
                            />
                            <label htmlFor={`new-cust-${step.id}`} className="text-xs text-[#a1aaa4] cursor-pointer">
                              Only trigger if contact has 0 prior CRM records
                            </label>
                          </div>
                        )}

                        {step.nodeType === "sentiment_check" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Target sentiment</label>
                            <select
                              value={step.properties?.sentiment || "Negative"}
                              onChange={(e) => updateStepProperty(step.id, "sentiment", e.target.value)}
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                            >
                              <option value="Negative">Negative sentiment (urgent complaints)</option>
                              <option value="Neutral">Neutral sentiment (basic FAQ queries)</option>
                              <option value="Positive">Positive sentiment (praise / high intent)</option>
                            </select>
                          </div>
                        )}

                        {step.nodeType === "send_message" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Auto-response message</label>
                            <textarea
                              value={step.properties?.message || ""}
                              onChange={(e) => updateStepProperty(step.id, "message", e.target.value)}
                              rows={3}
                              placeholder="Write the auto-reply body..."
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs resize-none")}
                            />
                          </div>
                        )}

                        {step.nodeType === "create_task" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Task title</label>
                              <input
                                type="text"
                                value={step.properties?.title || ""}
                                onChange={(e) => updateStepProperty(step.id, "title", e.target.value)}
                                placeholder="e.g. Call back customer immediately"
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Task description</label>
                              <textarea
                                value={step.properties?.description || ""}
                                onChange={(e) => updateStepProperty(step.id, "description", e.target.value)}
                                rows={2}
                                placeholder="Details of the operational task..."
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs resize-none")}
                              />
                            </div>
                          </div>
                        )}

                        {step.nodeType === "create_appointment" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Appointment label</label>
                              <input
                                type="text"
                                value={step.properties?.title || ""}
                                onChange={(e) => updateStepProperty(step.id, "title", e.target.value)}
                                placeholder="e.g. Hair coloring slot"
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Default duration</label>
                              <select
                                value={step.properties?.duration || "30m"}
                                onChange={(e) => updateStepProperty(step.id, "duration", e.target.value)}
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                              >
                                <option value="15m">15 minutes</option>
                                <option value="30m">30 minutes</option>
                                <option value="45m">45 minutes</option>
                                <option value="60m">1 hour</option>
                                <option value="90m">1.5 hours</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {step.nodeType === "notify_team" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Notification channel</label>
                              <input
                                type="text"
                                value={step.properties?.channel || ""}
                                onChange={(e) => updateStepProperty(step.id, "channel", e.target.value)}
                                placeholder="e.g. Operations"
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-[#727c75] mb-1">Priority</label>
                              <select
                                value={step.properties?.priority || "Normal"}
                                onChange={(e) => updateStepProperty(step.id, "priority", e.target.value)}
                                className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                              >
                                <option value="Low">Low (audit log)</option>
                                <option value="Normal">Normal (push notification)</option>
                                <option value="High">High (SMS alert & escalation)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {step.nodeType === "update_lead" && (
                          <div>
                            <label className="block text-xs text-[#727c75] mb-1">Set CRM lead status</label>
                            <select
                              value={step.properties?.status || "contacted"}
                              onChange={(e) => updateStepProperty(step.id, "status", e.target.value)}
                              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                            >
                              <option value="new">New (fresh enquiry)</option>
                              <option value="contacted">Contacted (in progress)</option>
                              <option value="qualified">Qualified (hot lead)</option>
                              <option value="converted">Converted (completed booking)</option>
                              <option value="lost">Lost (canceled)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex flex-col items-center mt-5">
              <div className="w-px h-5 bg-[#edf0ee]/15" />
              <div className="bg-[#0d1210] border border-[#edf0ee]/[0.08] rounded-full px-4 py-1.5 flex items-center gap-1.5 text-xs text-[#a1aaa4]">
                <Play className="w-3 h-3 text-[#727c75]" />
                <span>End of flow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
