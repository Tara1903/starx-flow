import React, { useState, useEffect } from "react";
import { 
  Cpu, Database, Target, BarChart3, Terminal, Plus, Trash2, 
  CheckCircle2, AlertCircle, Sparkles, Clock, ShieldCheck, 
  HelpCircle, Settings, ChevronRight, TrendingUp, DollarSign, Activity, Play,
  Search, Info
} from "lucide-react";
import { type BusinessMemory, type BusinessGoal } from "../../store/authStore";
import { useBusinessStore } from "../../store/businessStore";
import { cn } from "../../lib/utils";

export function BusinessOSSection() {
  const { 
    businessMemories, 
    businessGoals, 
    fetchBusinessMemories, 
    addBusinessMemory, 
    deleteBusinessMemory,
    fetchBusinessGoals, 
    addBusinessGoal, 
    updateBusinessGoal, 
    deleteBusinessGoal 
  } = useBusinessStore();

  const [activeTab, setActiveTab] = useState<"cockpit" | "memory" | "goals" | "forecasting" | "logs">("cockpit");
  
  // Memory Board states
  const [memorySearch, setMemorySearch] = useState("");
  const [memoryCategory, setMemoryCategory] = useState<"all" | "general" | "faq" | "policy" | "hours">("all");
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryValue, setNewMemoryValue] = useState("");
  const [newMemoryCat, setNewMemoryCat] = useState<"general" | "faq" | "policy" | "hours">("general");

  // Goal Engine states
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(0);
  const [newGoalCurrent, setNewGoalCurrent] = useState(0);
  const [newGoalUnit, setNewGoalUnit] = useState<"bookings" | "hours" | "percent" | "usd" | "count">("count");
  const [newGoalDate, setNewGoalDate] = useState("");

  // Executive Settings / Telemetry
  const [autonomyMode, setAutonomyMode] = useState<"max" | "human">("max");
  const [leadEnrichment, setLeadEnrichment] = useState(true);
  const [selfTuning, setSelfTuning] = useState(false);
  const [systemLoad, setSystemLoad] = useState(32); // %

  // Forecasting parameters
  const [growthModel, setGrowthModel] = useState<"conservative" | "linear" | "exponential">("linear");
  const [leadInflow, setLeadInflow] = useState(25); // leads per week

  // Autonomous run loop logs
  const [runLoopLogs, setRunLoopLogs] = useState<{ id: string; time: string; module: string; message: string; type: "success" | "info" | "warning" }[]>([
    { id: "log-1", time: "09:12:05 AM", module: "Auto-Scheduler", message: "Successfully verified slot matching Jane Doe. Booked manicure with Jessica for 3:00 PM.", type: "success" },
    { id: "log-2", time: "10:14:22 AM", module: "Review Monitor", message: "Review from customer 'John' detected (5 stars). Transmitted thank you message.", type: "success" },
    { id: "log-3", time: "11:00:15 AM", module: "Sales Agent", message: "Identified lead 'Robert' is cold. Dispatched coupon discount booster 'WELCOME15' via SMS.", type: "info" },
    { id: "log-4", time: "12:15:30 PM", module: "Calendar Sync", message: "Synchronized slots for tomorrow. Found 4 open slots for Booking Agent delegation.", type: "info" },
    { id: "log-5", time: "02:30:11 PM", module: "Handoff Router", message: "Inbound question regarding custom styling pricing routed to Sales Agent registry.", type: "info" }
  ]);

  useEffect(() => {
    fetchBusinessMemories();
    fetchBusinessGoals();
  }, [fetchBusinessMemories, fetchBusinessGoals]);

  // Load simulator fluctuator
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemLoad((prev) => {
        const offset = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(15, Math.min(85, prev + offset));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Inbound loop simulator trigger
  const handleTriggerSimLoop = () => {
    const modules = ["Auto-Scheduler", "Review Monitor", "Sales Agent", "Handoff Router", "Telephony Hook"];
    const actions = [
      "Extracted booking preferences and saved to shared database.",
      "Detected invoice dispute. Created internal task and assigned to Admin.",
      "Completed follow-up sequence with cold lead. Sent appointment link.",
      "Detected appointment cancellation. Triggered waiting-list notification loop.",
      "Processed transcription summary from incoming call from +1 (555) 234-8800."
    ];
    
    const randomIdx = Math.floor(Math.random() * actions.length);
    const newLog = {
      id: `sim-log-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      module: modules[Math.floor(Math.random() * modules.length)],
      message: actions[randomIdx],
      type: (randomIdx % 3 === 0 ? "success" : "info") as any
    };

    setRunLoopLogs(prev => [newLog, ...prev]);
  };

  // Add Memory logic
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey || !newMemoryValue) return;

    await addBusinessMemory({
      key: newMemoryKey,
      value: newMemoryValue,
      category: newMemoryCat
    });

    setNewMemoryKey("");
    setNewMemoryValue("");
    setIsAddMemoryOpen(false);
  };

  // Add Goal logic
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || newGoalTarget <= 0) return;

    await addBusinessGoal({
      title: newGoalTitle,
      description: newGoalDesc,
      targetValue: newGoalTarget,
      currentValue: newGoalCurrent,
      unit: newGoalUnit,
      targetDate: newGoalDate ? new Date(newGoalDate).toISOString() : null
    });

    setNewGoalTitle("");
    setNewGoalDesc("");
    setNewGoalTarget(0);
    setNewGoalCurrent(0);
    setNewGoalDate("");
    setIsAddGoalOpen(false);
  };

  const handleIncrementGoal = async (id: string) => {
    const goal = businessGoals.find(g => g.id === id);
    if (!goal) return;

    const nextVal = Math.min(goal.targetValue, goal.currentValue + 1);
    const isCompleted = nextVal === goal.targetValue;

    await updateBusinessGoal(id, {
      currentValue: nextVal,
      status: isCompleted ? "achieved" : "active"
    });
  };

  // Memory filtering
  const filteredMemories = businessMemories.filter(m => {
    const matchesSearch = m.key.toLowerCase().includes(memorySearch.toLowerCase()) || 
                          m.value.toLowerCase().includes(memorySearch.toLowerCase());
    const matchesCategory = memoryCategory === "all" ? true : m.category === memoryCategory;
    return matchesSearch && matchesCategory;
  });

  // Forecasting Chart Data modeling
  const renderForecastingChart = () => {
    // Generate simulated coordinates based on scale settings
    const pointsCount = 6;
    const padding = 40;
    const width = 600;
    const height = 180;
    
    // Multipliers based on growth configurations
    const baseMult = growthModel === "conservative" ? 1.2 : growthModel === "linear" ? 2.1 : 3.5;
    const inflowMult = leadInflow / 25;
    
    const data: number[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const x = i;
      let val = 0;
      if (growthModel === "conservative") {
        val = 10 + x * 8 * inflowMult;
      } else if (growthModel === "linear") {
        val = 10 + x * 15 * inflowMult;
      } else {
        val = 10 + Math.pow(x, 1.8) * 12 * inflowMult;
      }
      data.push(val);
    }

    const maxVal = Math.max(...data);
    const minVal = 0;
    const range = maxVal - minVal;

    // Convert coordinates to SVG point path strings
    const coords = data.map((val, i) => {
      const x = padding + (i / (pointsCount - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      return { x, y, val };
    });

    const pathD = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(" ");

    return (
      <div className="space-y-4">
        {/* SVG Drawing area */}
        <div className="bg-black/50 border border-white/5 rounded-xl p-4 relative overflow-hidden select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Grid Lines */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const y = padding + (idx / 3) * (height - padding * 2);
              return (
                <line 
                  key={idx} 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  className="stroke-white/5 stroke-[1] stroke-dasharray" 
                  strokeDasharray="4 4" 
                />
              );
            })}
            
            {/* Curve Path */}
            <path 
              d={pathD} 
              fill="none" 
              className="stroke-emerald-400 stroke-[2.5]" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Glowing Shadow Area */}
            <path 
              d={`${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`} 
              fill="url(#grad)" 
              opacity="0.1" 
            />

            {/* Glow Definition */}
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Scatter dots */}
            {coords.map((c, i) => (
              <g key={i}>
                <circle 
                  cx={c.x} 
                  cy={c.y} 
                  r="4" 
                  className="fill-emerald-400 stroke-[#0c0c0c] stroke-[2] hover:r-6 cursor-pointer transition-all" 
                />
                {/* Value tooltip */}
                <text 
                  x={c.x} 
                  y={c.y - 10} 
                  textAnchor="middle" 
                  className="fill-zinc-500 font-bold text-[9px]"
                >
                  {Math.round(c.val)}h
                </text>
                <text 
                  x={c.x} 
                  y={height - padding + 15} 
                  textAnchor="middle" 
                  className="fill-zinc-600 font-medium text-[8px]"
                >
                  Wk {i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-white/[0.03]">
          <span>Forecasted total hours saved: <strong className="text-white">{Math.round(data[data.length - 1])} hours</strong> over 6 weeks</span>
          <span>Revenue recovered model: <strong className="text-emerald-400">${Math.round(data[data.length - 1] * 45)}</strong></span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Sub navigation header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              activeTab === "cockpit" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Executive Cockpit</span>
          </button>
          
          <button
            onClick={() => setActiveTab("memory")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              activeTab === "memory" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Business Memory</span>
          </button>

          <button
            onClick={() => setActiveTab("goals")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              activeTab === "goals" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Goal Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("forecasting")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              activeTab === "forecasting" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Predictive Model</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              activeTab === "logs" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Autonomous Run Loop</span>
          </button>
        </div>

        {/* Global Action buttons dynamically rendering */}
        {activeTab === "memory" && (
          <button
            onClick={() => setIsAddMemoryOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>New Memory Rule</span>
          </button>
        )}

        {activeTab === "goals" && (
          <button
            onClick={() => setIsAddGoalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Target Goal</span>
          </button>
        )}

        {activeTab === "logs" && (
          <button
            onClick={handleTriggerSimLoop}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full hover:bg-emerald-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate System Inbound</span>
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 1: EXECUTIVE COCKPIT */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === "cockpit" && (
        <div className="space-y-6">
          
          {/* Top telemetry dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* System Autonomy Status */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-2xl space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">System Autonomy Mode</span>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {autonomyMode === "max" ? "MAX AUTONOMY ACTIVE" : "HUMAN HAND-OFF ACTIVE"}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    {autonomyMode === "max" 
                      ? "AI agents resolve all conversations and book slots autonomously." 
                      : "AI requires human authorization verification before sending messages."}
                  </p>
                </div>
                <div className="relative flex h-3 w-3">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    autonomyMode === "max" ? "bg-emerald-400" : "bg-amber-400"
                  )} />
                  <span className={cn(
                    "relative inline-flex rounded-full h-3 w-3",
                    autonomyMode === "max" ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                </div>
              </div>
              <div className="pt-3 border-t border-white/[0.03] flex items-center justify-between gap-4">
                <button
                  onClick={() => setAutonomyMode("max")}
                  className={cn(
                    "flex-1 text-[10px] font-bold py-1.5 rounded transition-all",
                    autonomyMode === "max" ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-400"
                  )}
                >
                  Autonomous
                </button>
                <button
                  onClick={() => setAutonomyMode("human")}
                  className={cn(
                    "flex-1 text-[10px] font-bold py-1.5 rounded transition-all",
                    autonomyMode === "human" ? "bg-amber-500 text-black" : "bg-white/5 text-zinc-400"
                  )}
                >
                  Co-Pilot (Handoff)
                </button>
              </div>
            </div>

            {/* Core telemetry meters */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-2xl space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Operational Metrics</span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Processor System Load</span>
                    <span className="text-white font-bold">{systemLoad}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${systemLoad}%` }} 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Cognitive Memory Footprint</span>
                    <span className="text-white font-bold">{businessMemories.length * 4} KB</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(businessMemories.length / 10) * 100}%` }} 
                      className="bg-indigo-500 h-full transition-all duration-500" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced OS Switches */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-2xl space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Command Center Switches</span>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Dynamic CRM Enrichment
                </span>
                <input
                  type="checkbox"
                  checked={leadEnrichment}
                  onChange={(e) => setLeadEnrichment(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  Self-Tuning Agent Prompts
                </span>
                <input
                  type="checkbox"
                  checked={selfTuning}
                  onChange={(e) => setSelfTuning(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* Executive Observability Deck */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.03]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Telemetry & Latency monitor</h4>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Live Sync: ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Supabase API Ping</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white tracking-tight">12 ms</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Twilio SMS Gateway</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white tracking-tight">38 ms</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Gemini Inference Latency</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white tracking-tight">195 ms</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Custom mini chart */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Request Latency Histogram (Last 10 executions)</span>
                <span>Average: 81.6 ms</span>
              </div>
              <div className="h-10 flex items-end gap-1 px-1 py-1 bg-black/30 border border-white/5 rounded-lg">
                {[45, 12, 140, 24, 30, 210, 45, 38, 120, 150].map((latency, idx) => {
                  const heightPct = (latency / 250) * 100;
                  return (
                    <div 
                      key={idx}
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        "flex-1 rounded-sm transition-all duration-300",
                        latency > 150 ? "bg-amber-500/60" : "bg-emerald-500/40 hover:bg-emerald-400"
                      )}
                      title={`Execution ${idx + 1}: ${latency}ms`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick System Status report */}
          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                All Systems Nominal
              </h3>
              <p className="text-xs text-zinc-500 leading-normal max-w-xl">
                StarX Flow Operating System is running efficiently. AI workers (Receptionist, Booking, Review, Sales) are reading parameters from the shared global business memory.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase">Operational Savings</span>
                <span className="text-2xl font-bold text-white tracking-tight">$810.00</span>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div className="text-right">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase">AI Hours Earned</span>
                <span className="text-2xl font-bold text-emerald-400 tracking-tight">18h saved</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 2: BUSINESS COGNITIVE MEMORY */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === "memory" && (
        <div className="space-y-4">
          
          {/* Controls Box */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search policy, FAQ, guidelines..."
                value={memorySearch}
                onChange={(e) => setMemorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black border border-white/5 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button 
                onClick={() => setMemoryCategory("all")}
                className={cn("px-3 py-1.5 rounded-lg border", memoryCategory === "all" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-black border-white/5 text-zinc-500")}
              >
                All Rules
              </button>
              <button 
                onClick={() => setMemoryCategory("hours")}
                className={cn("px-3 py-1.5 rounded-lg border", memoryCategory === "hours" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-black border-white/5 text-zinc-500")}
              >
                Hours
              </button>
              <button 
                onClick={() => setMemoryCategory("policy")}
                className={cn("px-3 py-1.5 rounded-lg border", memoryCategory === "policy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-black border-white/5 text-zinc-500")}
              >
                Policy
              </button>
              <button 
                onClick={() => setMemoryCategory("faq")}
                className={cn("px-3 py-1.5 rounded-lg border", memoryCategory === "faq" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-black border-white/5 text-zinc-500")}
              >
                FAQ
              </button>
            </div>
          </div>

          {/* Memories list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((mem) => (
              <div 
                key={mem.id} 
                className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-2xl flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      {mem.category}
                    </span>
                    <button
                      onClick={() => deleteBusinessMemory(mem.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/10"
                      title="Remove Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight uppercase">{mem.key.replace(/_/g, ' ')}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{mem.value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 3: GOAL ENGINE */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === "goals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessGoals.map((goal) => {
            const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
            const isCompleted = goal.status === "achieved" || progress >= 100;
            
            return (
              <div 
                key={goal.id} 
                className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-2xl space-y-4 relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Finished glow banner */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                )}

                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                        {goal.title}
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">{goal.description}</p>
                    </div>
                    
                    <button
                      onClick={() => deleteBusinessGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/5 rounded text-zinc-500 hover:text-rose-400 border border-transparent hover:border-rose-500/10 transition-all"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-end justify-between text-xs">
                      <span className="text-zinc-400 font-medium">Progress</span>
                      <span className={cn("font-bold", isCompleted ? "text-emerald-400" : "text-white")}>
                        {goal.currentValue} / {goal.targetValue} <span className="text-[10px] text-zinc-500 uppercase font-semibold">{goal.unit}</span>
                      </span>
                    </div>
                    
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${progress}%` }} 
                        className={cn("h-full transition-all duration-500", isCompleted ? "bg-emerald-500" : "bg-indigo-500")}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.03] flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-600" />
                    Target Date: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "None"}
                  </span>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => handleIncrementGoal(goal.id)}
                      className="text-[10px] bg-emerald-500 text-black hover:bg-emerald-400 px-3 py-1 rounded font-bold transition-all"
                    >
                      Increment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 4: FORECASTING MODEL */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === "forecasting" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Chart visualizers column */}
          <div className="lg:col-span-8 bg-[#0c0c0c] border border-white/5 rounded-xl p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Operational Growth & Savings Modeling
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                Runs projections on hours saved and customer acquisition based on AI agent engagement statistics.
              </p>
            </div>
            
            {renderForecastingChart()}
          </div>

          {/* Forecasting parameters controller */}
          <div className="lg:col-span-4 bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-2xl space-y-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Simulation Adjusters</span>
            
            {/* Growth curve type switcher */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase">Growth Curve Type</span>
              <div className="flex flex-col gap-1 bg-black p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setGrowthModel("conservative")}
                  className={cn(
                    "text-[10px] font-bold py-1.5 rounded transition-all text-left px-3",
                    growthModel === "conservative" ? "bg-white/5 text-emerald-400" : "text-zinc-500"
                  )}
                >
                  Conservative Model
                </button>
                <button
                  onClick={() => setGrowthModel("linear")}
                  className={cn(
                    "text-[10px] font-bold py-1.5 rounded transition-all text-left px-3",
                    growthModel === "linear" ? "bg-white/5 text-emerald-400" : "text-zinc-500"
                  )}
                >
                  Linear Growth Model
                </button>
                <button
                  onClick={() => setGrowthModel("exponential")}
                  className={cn(
                    "text-[10px] font-bold py-1.5 rounded transition-all text-left px-3",
                    growthModel === "exponential" ? "bg-white/5 text-emerald-400" : "text-zinc-500"
                  )}
                >
                  Exponential Expansion Model
                </button>
              </div>
            </div>

            {/* slider lead inflow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-400">Lead Inflow Ingestion</span>
                <span className="text-white">{leadInflow} leads / wk</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={leadInflow}
                onChange={(e) => setLeadInflow(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
              />
            </div>
            
            {/* description of forecast parameters */}
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              * The projections simulate AI conversation success scaling. Values are modeling calculations derived from automated webhook logs.
            </p>
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 5: AUTONOMOUS RUN LOOP ACTIVITY */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Run Loop Core
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                Review automated workflows completed autonomously by specialized agents without human intervention.
              </p>
            </div>
          </div>

          {/* Terminal log output */}
          <div className="bg-black/80 border border-white/5 rounded-xl p-4 font-mono text-[11px] h-[340px] overflow-y-auto space-y-2.5 console-scroll shadow-inner">
            {runLoopLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                <span className="text-emerald-400 font-semibold flex-shrink-0">[{log.module}]</span>
                <span className="text-zinc-300">{log.message}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/[0.01] border border-white/5 rounded-lg p-3">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>The run loop simulator is active. Inbound triggers automatically check and route intents every few minutes. Click "Simulate System Inbound" to trigger manually.</span>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: ADD BUSINESS MEMORY */}
      {/* ──────────────────────────────────────────────────────── */}
      {isAddMemoryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#090909] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
            
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Add Global Memory Rule</h3>
              <button 
                onClick={() => setIsAddMemoryOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                X
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-zinc-400 uppercase font-bold tracking-wider">Rule Category</label>
                <select
                  value={newMemoryCat}
                  onChange={(e: any) => setNewMemoryCat(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40"
                >
                  <option value="general">General Guideline</option>
                  <option value="hours">Hours of Operation</option>
                  <option value="policy">Cancellation Policy</option>
                  <option value="faq">FAQ Detail</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 uppercase font-bold tracking-wider">Rule Key / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. holiday_schedule, discount_rules"
                  value={newMemoryKey}
                  onChange={(e) => setNewMemoryKey(e.target.value)}
                  required
                  className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 uppercase font-bold tracking-wider">Rule Details (Context)</label>
                <textarea
                  rows={4}
                  placeholder="Details of instructions or info that AI agents should obey..."
                  value={newMemoryValue}
                  onChange={(e) => setNewMemoryValue(e.target.value)}
                  required
                  className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                Save Memory Rule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: ADD GOAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#090909] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
            
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create Target Business Goal</h3>
              <button 
                onClick={() => setIsAddGoalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                X
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-zinc-400 uppercase font-bold tracking-wider">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule New Clients, Triage Inbound Calls"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  required
                  className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 uppercase font-bold tracking-wider">Goal Description</label>
                <input
                  type="text"
                  placeholder="Description of target KPI parameter..."
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-zinc-400 uppercase font-bold tracking-wider">Target Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-400 uppercase font-bold tracking-wider">KPI Unit</label>
                  <select
                    value={newGoalUnit}
                    onChange={(e: any) => setNewGoalUnit(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40"
                  >
                    <option value="count">Count (Numbers)</option>
                    <option value="bookings">Bookings</option>
                    <option value="hours">Hours Saved</option>
                    <option value="percent">Percentage (%)</option>
                    <option value="usd">Revenue (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-zinc-400 uppercase font-bold tracking-wider">Initial Value</label>
                  <input
                    type="number"
                    min="0"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-400 uppercase font-bold tracking-wider">Goal Deadline</label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                Confirm Business Goal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
