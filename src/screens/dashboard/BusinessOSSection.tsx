import React, { useState, useEffect } from "react";
import {
  Cpu, Database, Target, BarChart3, Terminal, Plus, Trash2,
  CheckCircle2, Clock, ShieldCheck, TrendingUp, Activity, Play,
  Search, Info, X
} from "lucide-react";
import { useBusinessStore } from "../../store/businessStore";
import { cn } from "../../lib/utils";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_DANGER,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_MUTED,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";

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
    deleteBusinessGoal,
  } = useBusinessStore();

  const [activeTab, setActiveTab] = useState<"cockpit" | "memory" | "goals" | "forecasting" | "logs">("cockpit");

  const [memorySearch, setMemorySearch] = useState("");
  const [memoryCategory, setMemoryCategory] = useState<"all" | "general" | "faq" | "policy" | "hours">("all");
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryValue, setNewMemoryValue] = useState("");
  const [newMemoryCat, setNewMemoryCat] = useState<"general" | "faq" | "policy" | "hours">("general");

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(0);
  const [newGoalCurrent, setNewGoalCurrent] = useState(0);
  const [newGoalUnit, setNewGoalUnit] = useState<"bookings" | "hours" | "percent" | "usd" | "count">("count");
  const [newGoalDate, setNewGoalDate] = useState("");

  const [autonomyMode, setAutonomyMode] = useState<"max" | "human">("max");
  const [leadEnrichment, setLeadEnrichment] = useState(true);
  const [selfTuning, setSelfTuning] = useState(false);

  const [growthModel, setGrowthModel] = useState<"conservative" | "linear" | "exponential">("linear");
  const [leadInflow, setLeadInflow] = useState(25);
  const [simStepIndex, setSimStepIndex] = useState(0);

  const [runLoopLogs, setRunLoopLogs] = useState<
    { id: string; time: string; module: string; message: string; type: "success" | "info" | "warning" }[]
  >([
    {
      id: "log-1",
      time: "09:12:05",
      module: "Auto-Scheduler",
      message: "Verified calendar availability for Jane Doe and booked manicure with Jessica at 15:00.",
      type: "success",
    },
    {
      id: "log-2",
      time: "10:14:22",
      module: "Review Monitor",
      message: "Detected 5-star customer review and dispatched confirmation follow-up.",
      type: "success",
    },
    {
      id: "log-3",
      time: "11:00:15",
      module: "Sales Agent",
      message: "Identified dormant inquiry and queued follow-up SMS campaign.",
      type: "info",
    },
    {
      id: "log-4",
      time: "12:15:30",
      module: "Calendar Sync",
      message: "Synchronized next-day calendar slots for Booking Agent delegation.",
      type: "info",
    },
    {
      id: "log-5",
      time: "14:30:11",
      module: "Handoff Router",
      message: "Routed pricing question to Sales Agent context.",
      type: "info",
    },
  ]);

  useEffect(() => {
    fetchBusinessMemories();
    fetchBusinessGoals();
  }, [fetchBusinessMemories, fetchBusinessGoals]);

  const handleTriggerSimLoop = () => {
    const scenarios = [
      {
        module: "Auto-Scheduler",
        message: "Extracted booking preferences and saved to shared workspace memory.",
        type: "success" as const,
      },
      {
        module: "Sales Agent",
        message: "Detected invoice question, created internal follow-up task for team review.",
        type: "info" as const,
      },
      {
        module: "Handoff Router",
        message: "Completed follow-up sequence with inactive lead and sent booking link.",
        type: "success" as const,
      },
      {
        module: "Calendar Sync",
        message: "Processed appointment cancellation and notified waitlist contacts.",
        type: "info" as const,
      },
    ];
    const scenario = scenarios[simStepIndex % scenarios.length];
    setSimStepIndex((i) => i + 1);

    setRunLoopLogs((prev) => [
      {
        id: `sim-log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour12: false }),
        module: scenario.module,
        message: scenario.message,
        type: scenario.type,
      },
      ...prev,
    ]);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey || !newMemoryValue) return;

    await addBusinessMemory({
      key: newMemoryKey,
      value: newMemoryValue,
      category: newMemoryCat,
    });

    setNewMemoryKey("");
    setNewMemoryValue("");
    setIsAddMemoryOpen(false);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || newGoalTarget <= 0) return;

    await addBusinessGoal({
      title: newGoalTitle,
      description: newGoalDesc,
      targetValue: newGoalTarget,
      currentValue: newGoalCurrent,
      unit: newGoalUnit,
      targetDate: newGoalDate ? new Date(newGoalDate).toISOString() : null,
    });

    setNewGoalTitle("");
    setNewGoalDesc("");
    setNewGoalTarget(0);
    setNewGoalCurrent(0);
    setNewGoalDate("");
    setIsAddGoalOpen(false);
  };

  const handleIncrementGoal = async (id: string) => {
    const goal = businessGoals.find((g) => g.id === id);
    if (!goal) return;

    const nextVal = Math.min(goal.targetValue, goal.currentValue + 1);
    const isCompleted = nextVal === goal.targetValue;

    await updateBusinessGoal(id, {
      currentValue: nextVal,
      status: isCompleted ? "achieved" : "active",
    });
  };

  const filteredMemories = businessMemories.filter((m) => {
    const matchesSearch =
      m.key.toLowerCase().includes(memorySearch.toLowerCase()) ||
      m.value.toLowerCase().includes(memorySearch.toLowerCase());
    const matchesCategory = memoryCategory === "all" ? true : m.category === memoryCategory;
    return matchesSearch && matchesCategory;
  });

  const achievedGoalsCount = businessGoals.filter((g) => g.status === "achieved" || (g.targetValue > 0 && g.currentValue >= g.targetValue)).length;
  const activeGoalsCount = Math.max(0, businessGoals.length - achievedGoalsCount);
  const avgGoalProgress =
    businessGoals.length > 0
      ? Math.round(
          businessGoals.reduce(
            (sum, g) => sum + (g.targetValue > 0 ? Math.min(100, (g.currentValue / g.targetValue) * 100) : 0),
            0
          ) / businessGoals.length
        )
      : 0;
  const memoryCoveragePct = Math.min(100, businessMemories.length * 10);

  const renderForecastingChart = () => {
    const pointsCount = 6;
    const padding = 40;
    const width = 600;
    const height = 180;
    const inflowMult = leadInflow / 25;

    const data: number[] = [];
    for (let i = 0; i < pointsCount; i++) {
      let val = 0;
      if (growthModel === "conservative") {
        val = 10 + i * 8 * inflowMult;
      } else if (growthModel === "linear") {
        val = 10 + i * 15 * inflowMult;
      } else {
        val = 10 + Math.pow(i, 1.8) * 12 * inflowMult;
      }
      data.push(val);
    }

    const maxVal = Math.max(...data);
    const coords = data.map((val, i) => {
      const x = padding + (i / (pointsCount - 1)) * (width - padding * 2);
      const y = height - padding - (val / (maxVal || 1)) * (height - padding * 2);
      return { x, y, val };
    });

    const pathD = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map((c) => `L ${c.x} ${c.y}`).join(" ");

    return (
      <div className="space-y-4">
        <div className={cn(CONSOLE_SUBCARD, "p-4 select-none")}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {Array.from({ length: 4 }).map((_, idx) => {
              const y = padding + (idx / 3) * (height - padding * 2);
              return (
                <line
                  key={idx}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  className="stroke-[#edf0ee]/[0.08] stroke-[1]"
                  strokeDasharray="4 4"
                />
              );
            })}

            <path
              d={pathD}
              fill="none"
              className="stroke-[#34d399] stroke-[2]"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d={`${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`}
              fill="url(#businessOsForecastGrad)"
              opacity="0.14"
            />

            <defs>
              <linearGradient id="businessOsForecastGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
            </defs>

            {coords.map((c, i) => (
              <g key={i}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="4"
                  className="fill-[#34d399] stroke-[#0d1210] stroke-[2]"
                />
                <text
                  x={c.x}
                  y={c.y - 10}
                  textAnchor="middle"
                  className="fill-[#a1aaa4] text-[10px]"
                >
                  {Math.round(c.val)}h
                </text>
                <text
                  x={c.x}
                  y={height - padding + 16}
                  textAnchor="middle"
                  className="fill-[#727c75] text-[10px]"
                >
                  Wk {i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#727c75] pt-2 border-t border-[#edf0ee]/[0.06] tabular-nums">
          <span>
            Modeled hours saved: <strong className="font-medium text-[#edf0ee]">{Math.round(data[data.length - 1])} hours</strong> over 6 weeks
          </span>
          <span>
            Projected labor value: <strong className="font-medium text-[#4cc38a]">${Math.round(data[data.length - 1] * 45)}</strong>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#edf0ee]/[0.08] pb-4">
        <div>
          <h2 className={CONSOLE_HEADING}>Business OS</h2>
          <p className="text-xs text-[#727c75] mt-1">
            Manage shared business rules, operational targets, and automation run logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 bg-[#0c100e] border border-[#edf0ee]/[0.08] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("cockpit")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeTab === "cockpit"
                  ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                  : "text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Cockpit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("memory")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeTab === "memory"
                  ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                  : "text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Business memory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("goals")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeTab === "goals"
                  ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                  : "text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Goals</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("forecasting")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeTab === "forecasting"
                  ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                  : "text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Forecast</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeTab === "logs"
                  ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/[0.08]"
                  : "text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Run loop</span>
            </button>
          </div>

          {activeTab === "memory" && (
            <button
              type="button"
              onClick={() => setIsAddMemoryOpen(true)}
              className={CONSOLE_BTN_PRIMARY}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New rule</span>
            </button>
          )}

          {activeTab === "goals" && (
            <button
              type="button"
              onClick={() => setIsAddGoalOpen(true)}
              className={CONSOLE_BTN_PRIMARY}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create goal</span>
            </button>
          )}

          {activeTab === "logs" && (
            <button
              type="button"
              onClick={handleTriggerSimLoop}
              className={CONSOLE_BTN_SECONDARY}
            >
              <Play className="w-3.5 h-3.5 text-[#34d399]" />
              <span>Run sample event</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: COCKPIT */}
      {activeTab === "cockpit" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Autonomy Mode */}
            <div className={cn(CONSOLE_PANEL, "space-y-4 flex flex-col justify-between")}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#727c75]">Autonomy mode</span>
                  <span className={autonomyMode === "max" ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_WARN}>
                    {autonomyMode === "max" ? "Autonomous" : "Co-pilot"}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-[#edf0ee]">
                  {autonomyMode === "max" ? "Full dispatch automation" : "Human approval required"}
                </h4>
                <p className="text-xs text-[#a1aaa4] leading-relaxed">
                  {autonomyMode === "max"
                    ? "Agents respond to inbound inquiries and reserve calendar slots automatically."
                    : "Agents draft responses and require team sign-off before sending."}
                </p>
              </div>
              <div className="pt-3 border-t border-[#edf0ee]/[0.06] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutonomyMode("max")}
                  className={cn(
                    "flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors cursor-pointer",
                    autonomyMode === "max"
                      ? "bg-[#edf0ee] text-[#080a09] border-[#edf0ee]"
                      : "bg-[#0d1210] text-[#a1aaa4] border-[#edf0ee]/[0.08] hover:text-[#edf0ee]"
                  )}
                >
                  Autonomous
                </button>
                <button
                  type="button"
                  onClick={() => setAutonomyMode("human")}
                  className={cn(
                    "flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors cursor-pointer",
                    autonomyMode === "human"
                      ? "bg-[#edf0ee] text-[#080a09] border-[#edf0ee]"
                      : "bg-[#0d1210] text-[#a1aaa4] border-[#edf0ee]/[0.08] hover:text-[#edf0ee]"
                  )}
                >
                  Co-pilot
                </button>
              </div>
            </div>

            {/* Real Workspace State */}
            <div className={cn(CONSOLE_PANEL, "space-y-4")}>
              <span className="text-xs font-medium text-[#727c75] block">Knowledge & target coverage</span>
              <div className="space-y-3.5 tabular-nums">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a1aaa4]">Goal completion</span>
                    <span className="text-[#edf0ee] font-medium">{avgGoalProgress}%</span>
                  </div>
                  <div className="w-full bg-[#0d1210] h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${avgGoalProgress}%` }}
                      className="bg-[#34d399] h-full transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a1aaa4]">Memory footprint ({businessMemories.length} rules)</span>
                    <span className="text-[#edf0ee] font-medium">{businessMemories.length * 4} KB</span>
                  </div>
                  <div className="w-full bg-[#0d1210] h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${memoryCoveragePct}%` }}
                      className="bg-[#a1aaa4] h-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Governance Switches */}
            <div className={cn(CONSOLE_PANEL, "space-y-3.5")}>
              <span className="text-xs font-medium text-[#727c75] block">Operating rules</span>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-[#a1aaa4] flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>Dynamic CRM enrichment</span>
                </span>
                <input
                  type="checkbox"
                  checked={leadEnrichment}
                  onChange={(e) => setLeadEnrichment(e.target.checked)}
                  className="w-4 h-4 accent-[#34d399] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-[#a1aaa4] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#a1aaa4]" />
                  <span>Self-tuning agent prompts</span>
                </span>
                <input
                  type="checkbox"
                  checked={selfTuning}
                  onChange={(e) => setSelfTuning(e.target.checked)}
                  className="w-4 h-4 accent-[#34d399] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Real Inventory Summary */}
          <div className={cn(CONSOLE_PANEL, "space-y-4")}>
            <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#34d399]" />
                <h4 className={CONSOLE_SECTION_TITLE}>Operating state overview</h4>
              </div>
              <span className={CONSOLE_BADGE_LIVE}>Workspace active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
              <div className={cn(CONSOLE_SUBCARD, "p-3.5 flex flex-col justify-between space-y-1")}>
                <span className="text-xs text-[#727c75]">Business rules indexed</span>
                <span className="text-lg font-semibold text-[#edf0ee]">{businessMemories.length}</span>
              </div>

              <div className={cn(CONSOLE_SUBCARD, "p-3.5 flex flex-col justify-between space-y-1")}>
                <span className="text-xs text-[#727c75]">Active vs achieved goals</span>
                <span className="text-lg font-semibold text-[#edf0ee]">
                  {activeGoalsCount} active · {achievedGoalsCount} done
                </span>
              </div>

              <div className={cn(CONSOLE_SUBCARD, "p-3.5 flex flex-col justify-between space-y-1")}>
                <span className="text-xs text-[#727c75]">Run loop entries</span>
                <span className="text-lg font-semibold text-[#edf0ee]">{runLoopLogs.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS MEMORY */}
      {activeTab === "memory" && (
        <div className="space-y-4">
          <div className={cn(CONSOLE_PANEL, "flex flex-col md:flex-row items-center justify-between gap-3")}>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#727c75] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search policies, hours, FAQs..."
                value={memorySearch}
                onChange={(e) => setMemorySearch(e.target.value)}
                className={cn(CONSOLE_INPUT, "w-full pl-9 pr-4 py-2 text-xs")}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(["all", "hours", "policy", "faq"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMemoryCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer capitalize",
                    memoryCategory === cat
                      ? "bg-[#19201d] text-[#edf0ee] border-[#edf0ee]/15"
                      : "bg-[#0d1210] border-[#edf0ee]/[0.06] text-[#727c75] hover:text-[#edf0ee]"
                  )}
                >
                  {cat === "all" ? "All rules" : cat === "faq" ? "FAQ" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((mem) => (
              <div key={mem.id} className={cn(CONSOLE_PANEL, "flex flex-col justify-between space-y-3 group")}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn(CONSOLE_BADGE_MUTED, "capitalize")}>{mem.category}</span>
                    <button
                      type="button"
                      onClick={() => deleteBusinessMemory(mem.id)}
                      className="opacity-70 hover:opacity-100 p-1.5 rounded-md hover:bg-[#e5484d]/10 text-[#727c75] hover:text-[#f28b8e] transition-colors cursor-pointer"
                      aria-label="Remove rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-xs font-mono text-[#4cc38a]">{mem.key}</h4>
                  <p className="text-xs text-[#a1aaa4] leading-relaxed">{mem.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GOALS */}
      {activeTab === "goals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {businessGoals.map((goal) => {
            const progress = goal.targetValue > 0 ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0;
            const isCompleted = goal.status === "achieved" || progress >= 100;

            return (
              <div key={goal.id} className={cn(CONSOLE_PANEL, "space-y-4 flex flex-col justify-between group")}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-[#edf0ee] flex items-center gap-1.5">
                        <span>{goal.title}</span>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" />}
                      </h4>
                      <p className="text-xs text-[#727c75] mt-0.5 leading-normal">{goal.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteBusinessGoal(goal.id)}
                      className="opacity-70 hover:opacity-100 p-1 rounded-md hover:bg-[#e5484d]/10 text-[#727c75] hover:text-[#f28b8e] transition-colors cursor-pointer"
                      aria-label="Remove goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 tabular-nums">
                    <div className="flex items-end justify-between text-xs">
                      <span className="text-[#a1aaa4]">Progress</span>
                      <span className={cn("font-medium", isCompleted ? "text-[#4cc38a]" : "text-[#edf0ee]")}>
                        {goal.currentValue} / {goal.targetValue} <span className="text-[#727c75]">{goal.unit}</span>
                      </span>
                    </div>

                    <div className="w-full bg-[#0d1210] h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progress}%` }}
                        className={cn("h-full transition-all duration-300", isCompleted ? "bg-[#34d399]" : "bg-[#a1aaa4]")}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#edf0ee]/[0.06] flex items-center justify-between tabular-nums">
                  <span className="text-xs text-[#727c75] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "None"}</span>
                  </span>

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleIncrementGoal(goal.id)}
                      className={cn(CONSOLE_BTN_PRIMARY, "px-3 py-1 text-xs")}
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

      {/* TAB 4: FORECAST */}
      {activeTab === "forecasting" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={cn(CONSOLE_PANEL, "lg:col-span-8 p-6 space-y-5")}>
            <div>
              <h3 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
                <TrendingUp className="w-4 h-4 text-[#34d399]" />
                <span>Workload & time-savings projection</span>
              </h3>
              <p className="text-xs text-[#727c75] mt-1">
                Scenario model based on your weekly lead volume assumption and curve shape.
              </p>
            </div>

            {renderForecastingChart()}
          </div>

          <div className={cn(CONSOLE_PANEL, "lg:col-span-4 space-y-4")}>
            <span className="text-xs font-medium text-[#727c75] block">Model parameters</span>

            <div className="space-y-1.5">
              <span className="block text-xs text-[#a1aaa4]">Growth curve</span>
              <div className={cn(CONSOLE_SUBCARD, "flex flex-col gap-1 p-1")}>
                {(
                  [
                    { id: "conservative", label: "Conservative" },
                    { id: "linear", label: "Linear growth" },
                    { id: "exponential", label: "Accelerated expansion" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGrowthModel(item.id)}
                    className={cn(
                      "text-xs font-medium py-1.5 rounded-lg transition-colors text-left px-3 cursor-pointer",
                      growthModel === item.id ? "bg-[#19201d] text-[#34d399]" : "text-[#727c75] hover:text-[#edf0ee]"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 tabular-nums">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a1aaa4]">Weekly lead inflow</span>
                <span className="text-[#edf0ee] font-medium">{leadInflow} leads / wk</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={leadInflow}
                onChange={(e) => setLeadInflow(parseInt(e.target.value, 10))}
                className="w-full accent-[#34d399] bg-[#0d1210] h-1 rounded-lg cursor-pointer"
              />
            </div>

            <p className="text-xs text-[#727c75] leading-relaxed">
              Interactive projection only; actual ROI depends on response latency and calendar fill rate.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: AUTONOMOUS RUN LOOP */}
      {activeTab === "logs" && (
        <div className={cn(CONSOLE_PANEL, "p-6 space-y-5")}>
          <div>
            <h3 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
              <Terminal className="w-4 h-4 text-[#34d399]" />
              <span>Run loop log</span>
            </h3>
            <p className="text-xs text-[#727c75] mt-1">
              Recent autonomous triage and calendar handoff events.
            </p>
          </div>

          <div className={cn(CONSOLE_SUBCARD, "p-4 font-mono text-xs h-[340px] overflow-y-auto space-y-2.5 console-scroll tabular-nums")}>
            {runLoopLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-[#727c75] shrink-0">[{log.time}]</span>
                <span className="text-[#4cc38a] shrink-0">[{log.module}]</span>
                <span className="text-[#a1aaa4]">{log.message}</span>
              </div>
            ))}
          </div>

          <div className={cn(CONSOLE_SUBCARD, "flex items-center gap-2 text-xs text-[#a1aaa4] p-3")}>
            <Info className="w-4 h-4 text-[#34d399] shrink-0" />
            <span>Use &ldquo;Run sample event&rdquo; above to preview how a new trigger appends to the log stream.</span>
          </div>
        </div>
      )}

      {/* MODAL: ADD BUSINESS MEMORY */}
      {isAddMemoryOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121715] border border-[#edf0ee]/[0.12] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#edf0ee]/[0.08] flex items-center justify-between">
              <h3 className={CONSOLE_SECTION_TITLE}>Add workspace rule</h3>
              <button
                type="button"
                onClick={() => setIsAddMemoryOpen(false)}
                className="p-1 rounded-md text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[#a1aaa4] font-medium">Category</label>
                <select
                  value={newMemoryCat}
                  onChange={(e: any) => setNewMemoryCat(e.target.value)}
                  className={cn(CONSOLE_INPUT, "w-full p-2.5")}
                >
                  <option value="general">General guideline</option>
                  <option value="hours">Hours of operation</option>
                  <option value="policy">Cancellation policy</option>
                  <option value="faq">FAQ detail</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#a1aaa4] font-medium">Rule key</label>
                <input
                  type="text"
                  placeholder="e.g. holiday_schedule"
                  value={newMemoryKey}
                  onChange={(e) => setNewMemoryKey(e.target.value)}
                  required
                  className={cn(CONSOLE_INPUT, "w-full p-2.5 font-mono")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#a1aaa4] font-medium">Rule instructions</label>
                <textarea
                  rows={4}
                  placeholder="Instructions or business policy details for AI agents..."
                  value={newMemoryValue}
                  onChange={(e) => setNewMemoryValue(e.target.value)}
                  required
                  className={cn(CONSOLE_INPUT, "w-full p-2.5 resize-none")}
                />
              </div>

              <button type="submit" className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5")}>
                Save rule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GOAL */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121715] border border-[#edf0ee]/[0.12] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#edf0ee]/[0.08] flex items-center justify-between">
              <h3 className={CONSOLE_SECTION_TITLE}>Create target goal</h3>
              <button
                type="button"
                onClick={() => setIsAddGoalOpen(false)}
                className="p-1 rounded-md text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[#a1aaa4] font-medium">Goal title</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly bookings target"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  required
                  className={cn(CONSOLE_INPUT, "w-full p-2.5")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#a1aaa4] font-medium">Description</label>
                <input
                  type="text"
                  placeholder="Optional context..."
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  className={cn(CONSOLE_INPUT, "w-full p-2.5")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[#a1aaa4] font-medium">Target value</label>
                  <input
                    type="number"
                    min="1"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(parseInt(e.target.value, 10) || 0)}
                    required
                    className={cn(CONSOLE_INPUT, "w-full p-2.5 tabular-nums")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#a1aaa4] font-medium">Unit</label>
                  <select
                    value={newGoalUnit}
                    onChange={(e: any) => setNewGoalUnit(e.target.value)}
                    className={cn(CONSOLE_INPUT, "w-full p-2.5")}
                  >
                    <option value="count">Count</option>
                    <option value="bookings">Bookings</option>
                    <option value="hours">Hours saved</option>
                    <option value="percent">Percent (%)</option>
                    <option value="usd">Revenue (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[#a1aaa4] font-medium">Starting value</label>
                  <input
                    type="number"
                    min="0"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(parseInt(e.target.value, 10) || 0)}
                    className={cn(CONSOLE_INPUT, "w-full p-2.5 tabular-nums")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#a1aaa4] font-medium">Target date</label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className={cn(CONSOLE_INPUT, "w-full p-2")}
                  />
                </div>
              </div>

              <button type="submit" className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5")}>
                Save goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
