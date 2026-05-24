import React, { useState, useMemo } from "react";
import { 
  Bot, Shield, Key, Eye, Play, Sliders, Settings, Check, 
  Sparkles, Save, Edit3, Trash2, Database, Brain, ArrowRight,
  MessageSquare, User, Calendar, AlertTriangle, RefreshCw, Plus
} from "lucide-react";
import { type Agent, type AgentMemory } from "../../store/authStore";
import { useAgentStore } from "../../store/agentStore";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function AgentsSection() {
  const agents = useAgentStore((s) => s.agents) || [];
  const memories = useAgentStore((s) => s.agentMemories) || [];
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const addMemory = useAgentStore((s) => s.addMemory);
  const clearMemories = useAgentStore((s) => s.clearMemories);

  // Active Hub Tab: 'agents' | 'memory' | 'sandbox'
  const [activeTab, setActiveTab] = useState<'agents' | 'memory' | 'sandbox'>('agents');
  
  // Selected Agent for Prompt/Permission Tuning Modal
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  // Shared Memory adding state
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newLead, setNewLead] = useState("lead-1");

  // Sandbox simulation states
  const [sandboxQuery, setSandboxQuery] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<{
    id: string;
    agent: string;
    action: string;
    detail: string;
    type: 'trigger' | 'handoff' | 'memory' | 'response' | 'success';
  }[]>([]);
  const [simFinalResponse, setSimFinalResponse] = useState("");

  const handleOpenTune = (agent: Agent) => {
    setEditingAgent(agent);
    setEditPrompt(agent.systemPrompt);
    setEditPermissions(agent.permissions);
    setEditIsActive(agent.isActive);
  };

  const handleSaveTune = async () => {
    if (!editingAgent) return;
    await updateAgent(editingAgent.id, {
      systemPrompt: editPrompt,
      permissions: editPermissions,
      isActive: editIsActive
    });
    setEditingAgent(null);
  };

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    await addMemory({
      leadId: newLead,
      key: newKey.trim(),
      value: newValue.trim()
    });
    setNewKey("");
    setNewValue("");
  };

  const togglePermission = (perm: string) => {
    if (editPermissions.includes(perm)) {
      setEditPermissions(prev => prev.filter(p => p !== perm));
    } else {
      setEditPermissions(prev => [...prev, perm]);
    }
  };

  // Run Orchestration simulation
  const runSandboxSim = async () => {
    if (!sandboxQuery.trim()) return;
    setIsSimulating(true);
    setSimulationLogs([]);
    setSimFinalResponse("");

    const logs: typeof simulationLogs = [];
    const pushLog = (agent: string, action: string, detail: string, type: typeof simulationLogs[0]['type']) => {
      const newL = { id: `log-${Date.now()}-${Math.random()}`, agent, action, detail, type };
      logs.push(newL);
      setSimulationLogs([...logs]);
    };

    // Step 1: Receptionist receives query & validates intent
    pushLog("System", "Inbound Request", `Query received: "${sandboxQuery}"`, "trigger");
    await new Promise(r => setTimeout(r, 1200));

    pushLog("Receptionist Agent", "Intent Parsing", "Checking permissions... Validated. Intents detected: [Booking Slot Search] & [Pricing Query].", "handoff");
    await new Promise(r => setTimeout(r, 1500));

    // Step 2: Routing based on intents
    // Sales Intent gets routing to Sales Agent
    pushLog("Receptionist Agent", "Specialist Handoff", "Routing pricing complaint to Sales Agent...", "handoff");
    await new Promise(r => setTimeout(r, 1200));

    pushLog("Sales Agent", "Shared Memory Lookup", "Searching memory key 'billing_status'...", "memory");
    await new Promise(r => setTimeout(r, 1000));

    pushLog("Sales Agent", "Shared Memory Write", "Updated key 'billing_status' -> 'Investigating refund invoice #1204'", "memory");
    // Write locally to memory store
    addMemory({ leadId: 'lead-1', key: 'billing_status', value: 'Investigating refund invoice #1204' });
    await new Promise(r => setTimeout(r, 1200));

    pushLog("Sales Agent", "Formulate Response Block", "Found $20 overcharge. Created CRM task to process refund. Drafted billing response.", "response");
    await new Promise(r => setTimeout(r, 1500));

    // Booking Intent gets routing to Booking Agent
    pushLog("Receptionist Agent", "Specialist Handoff", "Routing scheduling inquiry to Booking Agent...", "handoff");
    await new Promise(r => setTimeout(r, 1200));

    pushLog("Booking Agent", "Calendar Query", "Checking calendar availability for tomorrow afternoon...", "memory");
    await new Promise(r => setTimeout(r, 1200));

    pushLog("Booking Agent", "Shared Memory Write", "Updated key 'preferred_time' -> 'Tomorrow 2:00 PM'", "memory");
    addMemory({ leadId: 'lead-1', key: 'preferred_time', value: 'Tomorrow 2:00 PM' });
    await new Promise(r => setTimeout(r, 1000));

    pushLog("Booking Agent", "Formulate Response Block", "Confirmed 2:00 PM tomorrow is available. Drafted booking response.", "response");
    await new Promise(r => setTimeout(r, 1500));

    // Step 3: Receptionist aggregates responses and formats output
    pushLog("Receptionist Agent", "Compilation", "Aggregating outputs and checking memory traces...", "handoff");
    await new Promise(r => setTimeout(r, 1200));

    pushLog("System", "Orchestration Complete", "Merged replies into a single cohesive response.", "success");
    
    setSimFinalResponse("Hi there! I would be happy to schedule your appointment for tomorrow at 2:00 PM. Regarding your previous visit, we found a $20 overcharge on invoice #1204. I have created a task for our team to issue you a refund immediately. Looking forward to seeing you tomorrow!");
    setIsSimulating(false);
  };

  const getAgentRoleColor = (role: string) => {
    switch (role) {
      case 'receptionist': return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';
      case 'booking': return 'border-sky-500/20 text-sky-400 bg-sky-500/5';
      case 'review': return 'border-amber-500/20 text-amber-400 bg-amber-500/5';
      case 'sales': return 'border-rose-500/20 text-rose-400 bg-rose-500/5';
      default: return 'border-zinc-500/20 text-zinc-400 bg-zinc-500/5';
    }
  };

  const getLogColor = (type: typeof simulationLogs[0]['type']) => {
    switch (type) {
      case 'trigger': return 'text-zinc-400 border-zinc-800 bg-zinc-950/40';
      case 'handoff': return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
      case 'memory': return 'text-sky-400 border-sky-500/20 bg-sky-500/5';
      case 'response': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'success': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      default: return 'text-zinc-400 border-white/5 bg-[#0a0a0a]';
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out] select-none pb-24">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none border-b border-white/5 pb-4">
        <div className="flex items-center gap-1 bg-[#0c0c0c] border border-white/5 p-1 rounded-full w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('agents')}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all w-1/3 sm:w-auto justify-center",
              activeTab === 'agents' 
                ? "bg-white/5 border border-white/10 text-white" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all w-1/3 sm:w-auto justify-center",
              activeTab === 'memory' 
                ? "bg-white/5 border border-white/10 text-white" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Shared Memory</span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all w-1/3 sm:w-auto justify-center",
              activeTab === 'sandbox' 
                ? "bg-white/5 border border-white/10 text-white" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Orchestration Sandbox</span>
          </button>
        </div>

        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 bg-[#0a0a0a] border border-white/5 px-3 py-1.5 rounded-full self-start select-none">
          <Brain className="w-3.5 h-3.5 text-emerald-400" />
          <span>Multi-Agent Cognitive System</span>
        </div>
      </div>

      {/* 1. AGENTS TAB */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
          {agents.map((agent) => (
            <motion.div
              layout
              key={agent.id}
              className={cn(
                "glass-card rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between h-[230px]",
                agent.isActive 
                  ? agent.role === 'receptionist' ? 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.02)]'
                    : agent.role === 'booking' ? 'border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.02)]'
                    : agent.role === 'review' ? 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.02)]'
                    : 'border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.02)]'
                  : 'border-zinc-800 opacity-60'
              )}
            >
              {/* Glow badge overlay */}
              <span className={cn(
                "absolute -top-6 -right-6 w-12 h-12 rounded-full filter blur-xl select-none opacity-20",
                agent.role === 'receptionist' ? 'bg-emerald-400' :
                agent.role === 'booking' ? 'bg-sky-400' :
                agent.role === 'review' ? 'bg-amber-400' : 'bg-rose-400'
              )} />

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center border",
                      getAgentRoleColor(agent.role)
                    )}>
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{agent.name}</h3>
                      <span className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider block">
                        Specialist: {agent.role}
                      </span>
                    </div>
                  </div>

                  <span className={cn(
                    "text-[8px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide uppercase",
                    agent.isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-zinc-800/80 text-zinc-500 border-zinc-700/30'
                  )}>
                    {agent.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 h-8 select-text">
                  {agent.description}
                </p>
              </div>

              {/* KPI indicators & Actions footer */}
              <div className="border-t border-white/[0.03] pt-3.5 flex items-center justify-between mt-auto">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-zinc-500 select-none">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold text-zinc-400">
                      {agent.permissions.length} Permissions
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 select-none">
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold text-zinc-400">
                      {agent.role === 'receptionist' ? memories.length : Math.floor(memories.length / 2)} Records
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenTune(agent)}
                  className="flex items-center gap-1 text-[10px] font-extrabold uppercase bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white py-1.5 px-3 rounded-full border border-white/5 transition-all cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Tune Rules</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 2. MEMORY TAB */}
      {activeTab === 'memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Add cognitive entry */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 bg-[#080808]/80 space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              Write Memory Entry
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Target Lead/Customer</label>
                <select
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  <option value="lead-1">Sarah Jenkins (WhatsApp Lead)</option>
                  <option value="lead-2">Robert Miller (SMS Caller)</option>
                  <option value="lead-3">Jessica Alva (Instagram DM Commenter)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Memory Key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. preferred_stylist"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cognitive Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. Sarah (Likes warm tea)"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <button
                onClick={handleAddMemory}
                disabled={!newKey.trim() || !newValue.trim()}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Write to Memory</span>
              </button>
            </div>
          </div>

          {/* Cognitive values database display */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/5 bg-[#080808]/80 space-y-4 min-h-[400px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-sky-400" />
                  Cognitive Records Database
                </h3>
              </div>

              {memories.length > 0 && (
                <button
                  onClick={() => clearMemories()}
                  className="flex items-center gap-1 text-[10px] font-extrabold uppercase bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-1.5 px-3 rounded-full transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                <Database className="w-8 h-8 text-zinc-700 mb-3" />
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No Cognitive Records</p>
                <p className="text-[10px] text-zinc-600 mt-1 max-w-xs leading-relaxed">
                  Specialist agents write contextual notes here when interacting with customers so other agents can access them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto select-text">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 select-none">
                      <th className="py-2.5 font-bold uppercase text-[9px] tracking-widest pl-2">Lead Reference</th>
                      <th className="py-2.5 font-bold uppercase text-[9px] tracking-widest">Key</th>
                      <th className="py-2.5 font-bold uppercase text-[9px] tracking-widest">Cognitive Value</th>
                      <th className="py-2.5 font-bold uppercase text-[9px] tracking-widest text-right pr-2">Linked Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {memories.map((mem) => (
                      <tr key={mem.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 font-semibold text-zinc-300 pl-2">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-zinc-600" />
                            <span>{mem.leadId === "lead-1" ? "Sarah Jenkins" : mem.leadId === "lead-2" ? "Robert Miller" : "Jessica Alva"}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sky-400 font-mono text-[10px]">{mem.key}</td>
                        <td className="py-3 text-zinc-200 select-all font-medium">{mem.value}</td>
                        <td className="py-3 text-right pr-2 select-none">
                          <span className="text-[9px] font-bold text-zinc-500 border border-white/5 bg-[#0f0f0f] rounded-full px-2 py-0.5">
                            {mem.key.includes('time') || mem.key.includes('slot') ? 'Booking Agent' : 
                             mem.key.includes('billing') || mem.key.includes('price') ? 'Sales Agent' : 'Receptionist Agent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ORCHESTRATION SANDBOX TAB */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start select-none">
          {/* Query prompt input panel */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 bg-[#080808]/80 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Agent Sandbox</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                Test cooperative agent handoffs and shared memory logs. Enter a query containing booking and pricing intents together to watch the coordination trace.
              </p>
            </div>

            <div className="space-y-3.5">
              <textarea
                value={sandboxQuery}
                onChange={(e) => setSandboxQuery(e.target.value)}
                rows={3}
                placeholder="e.g. I want to schedule a booking tomorrow at 2:00 PM but I have a complaint about invoice #1204."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 transition-all resize-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setSandboxQuery("I want to schedule a booking tomorrow at 2:00 PM but I have a complaint about invoice #1204.")}
                  className="bg-[#111] hover:bg-[#151515] border border-white/5 rounded-xl px-3 py-2 text-[10px] text-zinc-400 font-bold transition-all cursor-pointer"
                >
                  Load Sample Query
                </button>

                <button
                  onClick={runSandboxSim}
                  disabled={isSimulating || !sandboxQuery.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black py-2.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSimulating ? "Running Orchestration..." : "Run Orchestration Trace"}</span>
                </button>
              </div>
            </div>

            {/* Sandbox Final Combined Response Output */}
            {simFinalResponse && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-white/5 pt-4 space-y-2 select-text"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1 select-none">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Combined Response Output
                </span>
                <p className="bg-[#0c0c0c] border border-emerald-500/10 rounded-xl p-3.5 text-xs text-zinc-200 leading-relaxed select-text font-medium">
                  {simFinalResponse}
                </p>
              </motion.div>
            )}
          </div>

          {/* Simulation tracing terminal */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 bg-[#080808]/80 flex flex-col min-h-[500px]">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
              <RefreshCw className={cn("w-4 h-4 text-purple-400", isSimulating && "animate-spin")} />
              Orchestration Execution Logs
            </span>

            {simulationLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center select-none">
                <Play className="w-8 h-8 text-zinc-700 mb-3" />
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Awaiting Execution Trace</p>
                <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px] leading-relaxed">
                  Traces showing agent handoffs, permission verification, and memory reads/writes will load here live.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pt-4 space-y-3.5 max-h-[440px] console-scroll select-text pr-1">
                {simulationLogs.map((log) => (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id}
                    className={cn(
                      "rounded-xl border p-3 flex items-start gap-2.5 text-xs leading-relaxed",
                      getLogColor(log.type)
                    )}
                  >
                    <span className="w-2 h-2 rounded-full mt-1 bg-current" />
                    <div>
                      <div className="flex items-center gap-2 select-none">
                        <span className="font-extrabold uppercase text-[9px] tracking-wider bg-black/40 border border-white/5 rounded px-1.5 py-0.5">
                          {log.agent}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {log.action}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-zinc-300 select-text">
                        {log.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. AGENT TUNE MODAL */}
      <AnimatePresence>
        {editingAgent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Tune: {editingAgent.name}</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">
                      Role ID: {editingAgent.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#111] border border-white/5 px-2.5 py-1 rounded-full select-none">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">Agent Status</span>
                  <button
                    onClick={() => setEditIsActive(!editIsActive)}
                    className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${editIsActive ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`bg-black w-3 h-3 rounded-full transition-transform duration-200 transform ${editIsActive ? 'translate-x-3' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto console-scroll">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                  <p className="text-xs text-zinc-500 leading-relaxed select-text bg-[#0c0c0c] border border-white/5 rounded-xl p-3.5 font-medium">
                    {editingAgent.description}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">System Instruction Prompt</label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={4}
                    placeholder="Tune the system prompt instructions for this agent..."
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Permissions checkboxes */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Granular Access Permissions</label>
                  <div className="grid grid-cols-2 gap-3.5 select-none">
                    {[
                      { key: 'read_crm', label: 'Read Customer CRM' },
                      { key: 'write_calendar', label: 'Write Calendar Bookings' },
                      { key: 'write_tasks', label: 'Create Operational Tasks' },
                      { key: 'send_messages', label: 'Send Outbound Messages' }
                    ].map((item) => {
                      const hasPerm = editPermissions.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => togglePermission(item.key)}
                          className={cn(
                            "flex items-center justify-between px-3.5 py-3.5 rounded-xl border text-left text-xs font-bold transition-all",
                            hasPerm 
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                              : "bg-[#111] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-[#151515]"
                          )}
                        >
                          <span>{item.label}</span>
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                            hasPerm ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-700 bg-black/40"
                          )}>
                            {hasPerm && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-end gap-3.5">
                <button
                  onClick={() => setEditingAgent(null)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTune}
                  className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black py-2 px-5 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
