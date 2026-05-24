import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Save, Plus, Trash2, Play, Sliders, Settings, 
  MessageSquare, PhoneMissed, Star, Instagram, Globe, 
  HelpCircle, Clock, UserCheck, Smile, Send, CheckSquare, 
  Calendar, Bell, UserPlus, AlertCircle, ArrowDown, ChevronRight
} from "lucide-react";
import { useAuthStore, type Workflow } from "../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { motion } from "motion/react";

// Types for local workflow steps
interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
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
  const existingWorkflow = workflows.find(w => w.id === selectedWorkflowId);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState<Workflow['channel']>("WhatsApp");
  const [isActive, setIsActive] = useState(true);
  const [aiTone, setAiTone] = useState<Workflow['aiTone']>("Friendly");
  const [customPrompt, setCustomPrompt] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Initialize form
  useEffect(() => {
    if (isEditing && existingWorkflow) {
      setName(existingWorkflow.name);
      setDescription(existingWorkflow.description);
      setChannel(existingWorkflow.channel);
      setIsActive(existingWorkflow.isActive);
      setAiTone(existingWorkflow.aiTone);
      setCustomPrompt(existingWorkflow.customPrompt);
      
      // Initialize steps from config or upgrade legacy flow
      setSteps(initializeSteps(existingWorkflow));
    } else {
      // New workflow default state
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
            label: "WhatsApp Message Received",
            messageSample: "Hey! Can I book a hair coloring slot for tomorrow?"
          }
        },
        {
          id: "step-action-1",
          type: "action",
          nodeType: "send_message",
          properties: {
            label: "Send Automated Message Reply",
            message: "Hi! Thanks for contacting us. We'll check the calendar and schedule that booking for you shortly."
          }
        }
      ]);
    }
  }, [selectedWorkflowId, existingWorkflow, isEditing]);

  // Upgrade legacy workflow helper
  const initializeSteps = (workflow: Workflow): WorkflowStep[] => {
    if (workflow.config && Array.isArray(workflow.config.steps) && workflow.config.steps.length > 0) {
      return JSON.parse(JSON.stringify(workflow.config.steps)); // Deep clone
    }
    
    const upgradedSteps: WorkflowStep[] = [];
    
    // 1. Map trigger
    let triggerNodeType = 'whatsapp_message';
    if (workflow.trigger.includes('Missed') || workflow.channel === 'SMS') {
      triggerNodeType = 'sms_missed_call';
    } else if (workflow.channel === 'Reviews') {
      triggerNodeType = 'new_review';
    } else if (workflow.channel === 'Instagram') {
      triggerNodeType = 'insta_comment';
    } else if (workflow.channel === 'Web') {
      triggerNodeType = 'web_chat';
    }
    
    upgradedSteps.push({
      id: 'step-trigger',
      type: 'trigger',
      nodeType: triggerNodeType,
      properties: {
        label: workflow.trigger,
        messageSample: "Hey! Can I book a slot?"
      }
    });
    
    // 2. Map action
    let actionNodeType = 'send_message';
    if (workflow.action.includes('Task') || workflow.action.includes('task')) {
      actionNodeType = 'create_task';
    } else if (workflow.action.includes('Book') || workflow.action.includes('Appointment')) {
      actionNodeType = 'create_appointment';
    } else if (workflow.action.includes('Notify') || workflow.action.includes('Escalate')) {
      actionNodeType = 'notify_team';
    }
    
    upgradedSteps.push({
      id: 'step-action-1',
      type: 'action',
      nodeType: actionNodeType,
      properties: {
        label: workflow.action,
        message: workflow.customPrompt || "Thanks for reaching out! We'll get back to you shortly.",
        title: "Follow up on " + workflow.name,
        priority: "high"
      }
    });
    
    return upgradedSteps;
  };

  // Preset Configurations
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
            phoneSample: "+1 (555) 345-6789"
          }
        },
        {
          id: "step-cond-1",
          type: "condition",
          nodeType: "outside_hours",
          properties: {
            label: "Outside business hours",
            hours: "9:00 AM - 5:00 PM",
            timezone: "EST"
          }
        },
        {
          id: "step-act-1",
          type: "action",
          nodeType: "send_message",
          properties: {
            label: "Send SMS Reply",
            message: "Hey! Sorry we missed your call. We're currently closed, but we've logged your request. We will follow up first thing tomorrow morning!"
          }
        },
        {
          id: "step-act-2",
          type: "action",
          nodeType: "create_task",
          properties: {
            label: "Create Internal Task",
            title: "Follow up with off-hours caller",
            description: "Caller requested info after business hours. Call back immediately."
          }
        }
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
            messageSample: "Thank you so much! The haircut was absolutely amazing, best service ever!"
          }
        },
        {
          id: "step-cond-1",
          type: "condition",
          nodeType: "sentiment_check",
          properties: {
            label: "Sentiment analysis is positive",
            sentiment: "Positive"
          }
        },
        {
          id: "step-act-1",
          type: "action",
          nodeType: "send_message",
          properties: {
            label: "Send Review Invite Link",
            message: "We're so glad you loved the service! If you have 30 seconds, could you share your review on Google? Here is the link: g.page/ourbusiness/review. Thank you!"
          }
        },
        {
          id: "step-act-2",
          type: "action",
          nodeType: "update_lead",
          properties: {
            label: "Update CRM Status",
            status: "converted"
          }
        }
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
            stars: "3 stars or below"
          }
        },
        {
          id: "step-cond-1",
          type: "condition",
          nodeType: "sentiment_check",
          properties: {
            label: "Verify negative sentiment",
            sentiment: "Negative"
          }
        },
        {
          id: "step-act-1",
          type: "action",
          nodeType: "notify_team",
          properties: {
            label: "Notify Team of Bad Review",
            channel: "Alerts & Support",
            priority: "High"
          }
        },
        {
          id: "step-act-2",
          type: "action",
          nodeType: "create_task",
          properties: {
            label: "Create Internal Urgent Task",
            title: "Urgent: Resolve customer complaint review",
            description: "Negative review left on public portal. Contact client immediately to resolve issue."
          }
        }
      ]);
    }
  };

  // Node Icon helper
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      // Triggers
      case 'whatsapp_message': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'sms_missed_call': return <PhoneMissed className="w-4 h-4 text-sky-400" />;
      case 'new_review': return <Star className="w-4 h-4 text-amber-400" />;
      case 'insta_comment': return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'web_chat': return <Globe className="w-4 h-4 text-indigo-400" />;
      
      // Conditions
      case 'keyword_match': return <Sliders className="w-4 h-4 text-purple-400" />;
      case 'outside_hours': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'new_customer': return <UserCheck className="w-4 h-4 text-teal-400" />;
      case 'sentiment_check': return <Smile className="w-4 h-4 text-yellow-400" />;
      
      // Actions
      case 'send_message': return <Send className="w-4 h-4 text-emerald-400" />;
      case 'create_task': return <CheckSquare className="w-4 h-4 text-sky-400" />;
      case 'create_appointment': return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'notify_team': return <Bell className="w-4 h-4 text-red-400" />;
      case 'update_lead': return <UserPlus className="w-4 h-4 text-blue-400" />;
      
      default: return <HelpCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  // Modify individual step property
  const updateStepProperty = (stepId: string, propertyKey: string, value: any) => {
    setSteps(prev => prev.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          properties: {
            ...s.properties,
            [propertyKey]: value
          }
        };
      }
      return s;
    }));
  };

  // Modify step nodeType (e.g. changing trigger type or action type)
  const changeNodeType = (stepId: string, nodeType: string, type: 'trigger' | 'condition' | 'action') => {
    // Default properties for the type
    let properties: Record<string, any> = {};
    if (nodeType === 'whatsapp_message') {
      properties = { label: "WhatsApp Message Received", messageSample: "Hey! Can I book a slot?" };
    } else if (nodeType === 'sms_missed_call') {
      properties = { label: "Missed Call SMS Recovery", phoneSample: "+1 (555) 234-5678" };
    } else if (nodeType === 'new_review') {
      properties = { label: "New Review Left", stars: "5 stars" };
    } else if (nodeType === 'insta_comment') {
      properties = { label: "Instagram Comment or DM", commentKeyword: "VOUCHER" };
    } else if (nodeType === 'web_chat') {
      properties = { label: "Website Chat Initiated", pageName: "pricing" };
    } else if (nodeType === 'keyword_match') {
      properties = { label: "Message contains keywords", keywords: "book, appointment, pricing" };
    } else if (nodeType === 'outside_hours') {
      properties = { label: "Outside business hours", hours: "9:00 AM - 5:00 PM", timezone: "EST" };
    } else if (nodeType === 'new_customer') {
      properties = { label: "Customer is first-time contact" };
    } else if (nodeType === 'sentiment_check') {
      properties = { label: "Sentiment analysis is Negative/Positive", sentiment: "Negative" };
    } else if (nodeType === 'send_message') {
      properties = { label: "Send Automated Message Reply", message: "Hi! Thanks for contacting us. We will follow up shortly." };
    } else if (nodeType === 'create_task') {
      properties = { label: "Create Internal Task", title: "Automated workflow request", description: "Follow up immediately." };
    } else if (nodeType === 'create_appointment') {
      properties = { label: "Schedule Appointment", title: "Automated Booking", duration: "30m" };
    } else if (nodeType === 'notify_team') {
      properties = { label: "Notify Staff/Team", channel: "General Staff", priority: "Normal" };
    } else if (nodeType === 'update_lead') {
      properties = { label: "Update CRM Lead Status", status: "contacted" };
    }

    setSteps(prev => prev.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          nodeType,
          properties
        };
      }
      return s;
    }));
  };

  // Add a step (either condition or action)
  const addStep = (type: 'condition' | 'action') => {
    const newId = `step-${type === 'condition' ? 'cond' : 'act'}-${Date.now()}`;
    const defaultNodeType = type === 'condition' ? 'keyword_match' : 'send_message';
    
    let properties: Record<string, any> = {};
    if (defaultNodeType === 'keyword_match') {
      properties = { label: "Message contains keywords", keywords: "book, price" };
    } else {
      properties = { label: "Send Automated Message Reply", message: "Thanks for reaching out! We'll assist you shortly." };
    }

    const newStep: WorkflowStep = {
      id: newId,
      type,
      nodeType: defaultNodeType,
      properties
    };

    if (type === 'condition') {
      // Add conditions after trigger (index 1)
      const triggerIndex = steps.findIndex(s => s.type === 'trigger');
      const updated = [...steps];
      updated.splice(triggerIndex + 1, 0, newStep);
      setSteps(updated);
    } else {
      // Add action at the end
      setSteps(prev => [...prev, newStep]);
    }
  };

  // Remove a step
  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId));
  };

  // Handle Save
  const handleSave = async () => {
    if (!name.trim()) return;

    // Create workflow trigger & action string values from first trigger and first action steps
    const triggerStep = steps.find(s => s.type === 'trigger');
    const actionStep = steps.find(s => s.type === 'action');

    const triggerLabel = triggerStep ? triggerStep.properties.label || "Customer message" : "Custom trigger";
    const actionLabel = actionStep ? actionStep.properties.label || "Automated reaction" : "Custom action";

    const configPayload = { steps };

    const payload = {
      name,
      description,
      trigger: triggerLabel,
      action: actionLabel,
      isActive,
      channel,
      aiTone,
      customPrompt,
      config: configPayload
    };

    setIsSaved(true);
    
    if (isEditing) {
      await updateWorkflow(selectedWorkflowId!, payload);
    } else {
      await addWorkflow(payload);
    }

    setTimeout(() => {
      setIsSaved(false);
      // Navigate back
      useAuthStore.setState({ selectedWorkflowId: null });
      setActiveSection("workflows");
    }, 800);
  };

  return (
    <div className="space-y-6 select-none animate-[fade-in_0.4s_ease-out] pb-24">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              useAuthStore.setState({ selectedWorkflowId: null });
              setActiveSection("workflows");
            }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Workflow Engine</span>
            <h2 className="text-lg font-bold text-white leading-tight">
              {isEditing ? "Edit Advanced Flow" : "Create Advanced Flow"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active toggle */}
          <div className="flex items-center gap-2 bg-[#0c0c0c] border border-white/5 px-3 py-1.5 rounded-full">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Status</span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${isActive ? 'bg-emerald-500' : 'bg-zinc-800'}`}
            >
              <div className={`bg-black w-4 h-4 rounded-full transition-transform duration-200 transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className={`text-[10px] font-extrabold uppercase ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {isActive ? 'Active' : 'Paused'}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaved || !name.trim()}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black py-2.5 px-5 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? "Saving..." : "Save Workflow"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Configuration Panel */}
        <div className="glass-card rounded-2xl p-5 space-y-5 lg:col-span-1 border border-white/5 bg-[#080808]/80">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              General Rules
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Workflow Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Off-Hours SMS Triage"
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What operational problem does this flow solve?"
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Primary Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Workflow['channel'])}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS (Missed Calls)</option>
                <option value="Reviews">Google Reviews</option>
                <option value="Instagram">Instagram DM</option>
                <option value="Web">Website Chat Widget</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">AI Tone Presets</label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as Workflow['aiTone'])}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <option value="Friendly">Friendly & Enthusiastic</option>
                <option value="Professional">Polished & Direct</option>
                <option value="Casual">Warm & Conversational</option>
                <option value="Urgent">Immediate & Attentive</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">AI Context Guidelines</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                placeholder="Give the AI receptionist instructions for conversations handled by this workflow..."
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-2 select-none">
            <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Load Automation Preset</span>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => applyPreset("off_hours")}
                className="text-left w-full bg-[#111] hover:bg-[#151515] border border-white/5 rounded-xl p-3 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Off-Hours SMS Recovery</span>
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400" />
                </div>
                <p className="text-[9px] text-zinc-500 mt-0.5">Auto-task + SMS response when closed</p>
              </button>

              <button 
                onClick={() => applyPreset("review_booster")}
                className="text-left w-full bg-[#111] hover:bg-[#151515] border border-white/5 rounded-xl p-3 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Review Booster Invite</span>
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400" />
                </div>
                <p className="text-[9px] text-zinc-500 mt-0.5">Send Google review links on positive chats</p>
              </button>

              <button 
                onClick={() => applyPreset("escalate_negatives")}
                className="text-left w-full bg-[#111] hover:bg-[#151515] border border-white/5 rounded-xl p-3 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Urgent Complaint Alert</span>
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400" />
                </div>
                <p className="text-[9px] text-zinc-500 mt-0.5">Escalate poor ratings to managers immediately</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Builder Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-[#080808]/80 min-h-[550px] flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-4 mb-6 select-none">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Linear Flow Builder</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Establish triggers, optional conditions, and automated operational actions</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addStep('condition')}
                  className="flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold py-1.5 px-3 rounded-full transition-colors"
                >
                  <Plus className="w-3 h-3 text-purple-400" />
                  <span>+ Add Condition</span>
                </button>
                <button
                  onClick={() => addStep('action')}
                  className="flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold py-1.5 px-3 rounded-full transition-colors"
                >
                  <Plus className="w-3 h-3 text-sky-400" />
                  <span>+ Add Action</span>
                </button>
              </div>
            </div>

            {/* List of Steps */}
            <div className="w-full max-w-xl flex flex-col items-center space-y-4 select-none">
              {steps.map((step, index) => {
                const isTrigger = step.type === 'trigger';
                const isCondition = step.type === 'condition';
                const isAction = step.type === 'action';
                
                return (
                  <React.Fragment key={step.id}>
                    {/* Visual Connector Line (Except for first item) */}
                    {index > 0 && (
                      <div className="flex flex-col items-center py-1 select-none">
                        <div className="w-[1.5px] h-6 bg-zinc-800" />
                        <ArrowDown className="w-3 h-3 text-zinc-600 -mt-1" />
                      </div>
                    )}

                    {/* Step Card */}
                    <div className={`w-full glass-card rounded-xl border relative transition-all bg-[#0d0d0d]/90 p-4 ${
                      isTrigger ? 'border-emerald-500/20 focus-within:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.02)]' :
                      isCondition ? 'border-purple-500/20 focus-within:border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.02)]' :
                      'border-sky-500/20 focus-within:border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.02)]'
                    }`}>
                      {/* Badge / Index */}
                      <span className={`absolute -left-2 top-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold border select-none ${
                        isTrigger ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                        isCondition ? 'bg-purple-950 text-purple-400 border-purple-500/30' :
                        'bg-sky-950 text-sky-400 border-sky-500/30'
                      }`}>
                        {index + 1}
                      </span>

                      {/* Header of Card */}
                      <div className="flex items-center justify-between mb-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${
                            isTrigger ? 'bg-emerald-500/10 border-emerald-500/20' :
                            isCondition ? 'bg-purple-500/10 border-purple-500/20' :
                            'bg-sky-500/10 border-sky-500/20'
                          }`}>
                            {getNodeIcon(step.nodeType)}
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500">
                              {step.type}
                            </span>
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {step.properties?.label || step.nodeType}
                            </h4>
                          </div>
                        </div>

                        {/* Step Type Selector / Delete button */}
                        <div className="flex items-center gap-2">
                          {isTrigger ? (
                            <select
                              value={step.nodeType}
                              onChange={(e) => changeNodeType(step.id, e.target.value, 'trigger')}
                              className="bg-zinc-900 border border-white/5 rounded-md px-2 py-1 text-[10px] text-zinc-400 outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                              <option value="whatsapp_message">WhatsApp Message Received</option>
                              <option value="sms_missed_call">SMS Missed Call Event</option>
                              <option value="new_review">New Reviews Left</option>
                              <option value="insta_comment">Instagram Comment/DM</option>
                              <option value="web_chat">Web Chat Widget</option>
                            </select>
                          ) : isCondition ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                value={step.nodeType}
                                onChange={(e) => changeNodeType(step.id, e.target.value, 'condition')}
                                className="bg-zinc-900 border border-white/5 rounded-md px-2 py-1 text-[10px] text-zinc-400 outline-none focus:border-purple-500/50 cursor-pointer"
                              >
                                <option value="keyword_match">Contains Keywords</option>
                                <option value="outside_hours">Outside Business Hours</option>
                                <option value="new_customer">Is New Customer</option>
                                <option value="sentiment_check">Sentiment Check</option>
                              </select>
                              <button 
                                onClick={() => removeStep(step.id)}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <select
                                value={step.nodeType}
                                onChange={(e) => changeNodeType(step.id, e.target.value, 'action')}
                                className="bg-zinc-900 border border-white/5 rounded-md px-2 py-1 text-[10px] text-zinc-400 outline-none focus:border-sky-500/50 cursor-pointer"
                              >
                                <option value="send_message">Send Auto-Reply Message</option>
                                <option value="create_task">Create Internal Task</option>
                                <option value="create_appointment">Schedule Booking</option>
                                <option value="notify_team">Notify Staff/Team</option>
                                <option value="update_lead">Update CRM Lead Status</option>
                              </select>
                              <button 
                                onClick={() => removeStep(step.id)}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Form depending on NodeType */}
                      <div className="pl-4 pr-1 mt-3.5 space-y-3.5 border-t border-white/[0.03] pt-3">
                        {/* Triggers */}
                        {step.nodeType === 'whatsapp_message' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Message Keyword or Simulation Value</label>
                            <input 
                              type="text"
                              value={step.properties?.messageSample || ""}
                              onChange={(e) => updateStepProperty(step.id, 'messageSample', e.target.value)}
                              placeholder="e.g. 'Hey, can I book a haircut?'"
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500/40"
                            />
                          </div>
                        )}

                        {step.nodeType === 'sms_missed_call' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Simulation Phone Number</label>
                            <input 
                              type="text"
                              value={step.properties?.phoneSample || ""}
                              onChange={(e) => updateStepProperty(step.id, 'phoneSample', e.target.value)}
                              placeholder="e.g. +1 (555) 234-5678"
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40"
                            />
                          </div>
                        )}

                        {step.nodeType === 'new_review' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Google Reviews Rating</label>
                            <select
                              value={step.properties?.stars || "5 stars"}
                              onChange={(e) => updateStepProperty(step.id, 'stars', e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-amber-500/40 cursor-pointer"
                            >
                              <option value="5 stars">5 stars only</option>
                              <option value="4 stars or below">4 stars or below</option>
                              <option value="3 stars or below">3 stars or below</option>
                              <option value="All ratings">All ratings</option>
                            </select>
                          </div>
                        )}

                        {step.nodeType === 'insta_comment' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Instagram Trigger Comment/DM Keyword</label>
                            <input 
                              type="text"
                              value={step.properties?.commentKeyword || ""}
                              onChange={(e) => updateStepProperty(step.id, 'commentKeyword', e.target.value)}
                              placeholder="e.g. VOUCHER or GLOW"
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-pink-500/40"
                            />
                          </div>
                        )}

                        {step.nodeType === 'web_chat' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Active Page Name</label>
                            <input 
                              type="text"
                              value={step.properties?.pageName || ""}
                              onChange={(e) => updateStepProperty(step.id, 'pageName', e.target.value)}
                              placeholder="e.g. pricing or checkouts"
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500/40"
                            />
                          </div>
                        )}

                        {/* Conditions */}
                        {step.nodeType === 'keyword_match' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Filter Message Keywords (comma separated)</label>
                            <input 
                              type="text"
                              value={step.properties?.keywords || ""}
                              onChange={(e) => updateStepProperty(step.id, 'keywords', e.target.value)}
                              placeholder="e.g. book, appointment, hair, timing"
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-purple-500/40"
                            />
                          </div>
                        )}

                        {step.nodeType === 'outside_hours' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Standard Business Hours</label>
                              <input 
                                type="text"
                                value={step.properties?.hours || ""}
                                onChange={(e) => updateStepProperty(step.id, 'hours', e.target.value)}
                                placeholder="e.g. 9:00 AM - 5:00 PM"
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-purple-500/40"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Timezone</label>
                              <select 
                                value={step.properties?.timezone || "EST"}
                                onChange={(e) => updateStepProperty(step.id, 'timezone', e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-purple-500/40 cursor-pointer"
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

                        {step.nodeType === 'new_customer' && (
                          <div className="flex items-center gap-2 select-none py-1">
                            <input 
                              type="checkbox" 
                              id={`new-cust-${step.id}`}
                              checked={step.properties?.strictMode || false}
                              onChange={(e) => updateStepProperty(step.id, 'strictMode', e.target.checked)}
                              className="rounded border-white/10 bg-black text-purple-500 outline-none focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                            />
                            <label htmlFor={`new-cust-${step.id}`} className="text-[10px] text-zinc-400 font-bold uppercase cursor-pointer">
                              Only trigger if number has 0 contacts in CRM
                            </label>
                          </div>
                        )}

                        {step.nodeType === 'sentiment_check' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Target Sentiment</label>
                            <select
                              value={step.properties?.sentiment || "Negative"}
                              onChange={(e) => updateStepProperty(step.id, 'sentiment', e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-purple-500/40 cursor-pointer"
                            >
                              <option value="Negative">Negative Sentiment (Urgent Complaints)</option>
                              <option value="Neutral">Neutral Sentiment (Basic FAQ Queries)</option>
                              <option value="Positive">Positive Sentiment (Praise / High Intent)</option>
                            </select>
                          </div>
                        )}

                        {/* Actions */}
                        {step.nodeType === 'send_message' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Auto-Response Message Content</label>
                            <textarea
                              value={step.properties?.message || ""}
                              onChange={(e) => updateStepProperty(step.id, 'message', e.target.value)}
                              rows={3}
                              placeholder="Write the auto-reply body..."
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40 resize-none"
                            />
                          </div>
                        )}

                        {step.nodeType === 'create_task' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Internal Task Title</label>
                              <input 
                                type="text"
                                value={step.properties?.title || ""}
                                onChange={(e) => updateStepProperty(step.id, 'title', e.target.value)}
                                placeholder="e.g. Call back customer immediately"
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Task Description</label>
                              <textarea
                                value={step.properties?.description || ""}
                                onChange={(e) => updateStepProperty(step.id, 'description', e.target.value)}
                                rows={2}
                                placeholder="Details of the operational task..."
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40 resize-none"
                              />
                            </div>
                          </div>
                        )}

                        {step.nodeType === 'create_appointment' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Appointment Label</label>
                              <input 
                                type="text"
                                value={step.properties?.title || ""}
                                onChange={(e) => updateStepProperty(step.id, 'title', e.target.value)}
                                placeholder="e.g. Hair coloring slot"
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Default Duration</label>
                              <select
                                value={step.properties?.duration || "30m"}
                                onChange={(e) => updateStepProperty(step.id, 'duration', e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40 cursor-pointer"
                              >
                                <option value="15m">15 Minutes</option>
                                <option value="30m">30 Minutes</option>
                                <option value="45m">45 Minutes</option>
                                <option value="60m">1 Hour</option>
                                <option value="90m">1.5 Hours</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {step.nodeType === 'notify_team' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Staff Notification Channel</label>
                              <input 
                                type="text"
                                value={step.properties?.channel || ""}
                                onChange={(e) => updateStepProperty(step.id, 'channel', e.target.value)}
                                placeholder="e.g. Operations or General"
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Alert Priority</label>
                              <select
                                value={step.properties?.priority || "Normal"}
                                onChange={(e) => updateStepProperty(step.id, 'priority', e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40 cursor-pointer"
                              >
                                <option value="Low">Low (Audit Log)</option>
                                <option value="Normal">Normal (Push Notification)</option>
                                <option value="High">High (SMS Alert & Escalation)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {step.nodeType === 'update_lead' && (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Set Lead CRM Status</label>
                            <select
                              value={step.properties?.status || "contacted"}
                              onChange={(e) => updateStepProperty(step.id, 'status', e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/40 cursor-pointer"
                            >
                              <option value="new">New (Fresh Enquiry)</option>
                              <option value="contacted">Contacted (In Progress)</option>
                              <option value="qualified">Qualified (Hot Lead)</option>
                              <option value="converted">Converted (Completed Booking)</option>
                              <option value="lost">Lost (Canceled)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* End of flow design block */}
            <div className="flex flex-col items-center mt-6 select-none">
              <div className="w-[1.5px] h-6 bg-zinc-800" />
              <div className="bg-zinc-950 border border-white/10 rounded-full px-4 py-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-zinc-400">
                <Play className="w-3.5 h-3.5 text-zinc-600" />
                End of Automation Path
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
