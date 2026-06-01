import React, { useState, useEffect } from "react";
import { Layers, PlayCircle, PauseCircle, Send, RefreshCw, X, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import clsx from "clsx";

export function WorkflowsSection() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('outreach_automation_rules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setRules(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();

    const channel = supabase
      .channel('automation-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outreach_automation_rules' }, () => {
        fetchRules();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function toggleRule(rule: any) {
    setActionLoading(`toggle-${rule.id}`);
    try {
      const endpoint = rule.is_active ? 'deactivate' : 'activate';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/n8n/workflows/${rule.workflow_id}/${endpoint}`, {
        method: 'POST',
        headers: { 'x-api-key': 'Starxflow' }
      });
      const result = await response.json();
      
      if (result.success) {
        setFeedback(`${rule.name} ${rule.is_active ? 'paused' : 'activated'} successfully.`);
        // Note: The supabase subscription should auto-update the UI if the backend updates the DB row
      } else {
        setFeedback(result.error || 'Failed to update rule.');
      }
    } catch (error: any) {
      setFeedback('Error connecting to backend: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function runRule(rule: any) {
    setActionLoading(`run-${rule.id}`);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/n8n/workflows/${rule.workflow_id}/run`, {
        method: 'POST',
        headers: { 'x-api-key': 'Starxflow' }
      });
      const result = await response.json();
      
      if (result.success) {
        setFeedback(`${rule.name} triggered successfully.`);
      } else {
        setFeedback(result.error || 'Failed to trigger workflow.');
      }
    } catch (error: any) {
      setFeedback('Error connecting to backend: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  }

  const activeCount = rules.filter(r => r.is_active).length;
  const executions = rules.reduce((sum, r) => sum + (r.execution_count || 0), 0);

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Workflow Automations
          </h2>
        </div>
        <button
          onClick={fetchRules}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Workflows
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Active Automations" value={activeCount} accent="from-emerald-400 to-teal-400" />
        <StatCard label="Total Executions" value={executions} accent="from-indigo-400 to-purple-400" />
      </div>

      {feedback && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
          {feedback}
          <button onClick={() => setFeedback(null)}><X size={14} /></button>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">n8n Workflow Roster</h3>
        
        {loading && rules.length === 0 ? (
          <div className="text-zinc-500 text-sm">Loading workflows...</div>
        ) : rules.length === 0 ? (
          <div className="text-center text-zinc-500 p-8 border border-white/5 rounded-xl">
            <Layers className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No workflows detected in n8n database.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{rule.name}</p>
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      rule.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                      {rule.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                    {rule.description || 'No description provided.'}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <MetaPill label="ID" value={rule.workflow_id} />
                    <MetaPill label="Executions" value={rule.execution_count || 0} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `toggle-${rule.id}` ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : rule.is_active ? (
                      <PauseCircle size={14} />
                    ) : (
                      <PlayCircle size={14} />
                    )}
                    {rule.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => runRule(rule)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs font-semibold text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `run-${rule.id}` ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Run Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex flex-col justify-center relative overflow-hidden">
      <div className={clsx("absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-10 blur-2xl rounded-full", accent)} />
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white mt-1 relative z-10">{value}</p>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-full px-2.5 py-1 text-[10px] text-zinc-400 font-mono">
      <span className="uppercase tracking-wider opacity-70">{label}:</span> <span className="text-white">{value}</span>
    </div>
  );
}
