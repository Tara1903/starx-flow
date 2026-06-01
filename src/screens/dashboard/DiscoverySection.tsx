import React, { useState, useEffect } from 'react';
import { Globe, Radar, Loader2, RefreshCw, Plus, X, Search } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase';

export function DiscoverySection() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [discoverySource, setDiscoverySource] = useState('google_maps');
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('outreach_discovery_runs')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setRuns(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outreach_discovery_runs' }, () => {
        fetchRuns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function startDiscovery() {
    if (!discoveryQuery.trim()) return;
    setDiscoveryLoading(true);
    setFeedback(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/discovery/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'Starxflow',
        },
        body: JSON.stringify({ query: discoveryQuery, sourceType: discoverySource }),
      });
      const result = await response.json();
      if (result.success) {
        setFeedback('Discovery run started successfully.');
        setDiscoveryQuery('');
      } else {
        setFeedback(result.error || 'Failed to start discovery.');
      }
    } catch (error: any) {
      setFeedback('Error connecting to backend: ' + error.message);
    } finally {
      setDiscoveryLoading(false);
    }
  }

  async function retryRun(id: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/discovery/runs/${id}/retry`, {
        method: 'POST',
        headers: { 'x-api-key': 'Starxflow' },
      });
      const result = await response.json();
      if (result.success) {
        setFeedback('Retry initiated.');
      } else {
        setFeedback(result.error || 'Failed to retry.');
      }
    } catch (error: any) {
      setFeedback('Error connecting to backend: ' + error.message);
    }
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Lead Discovery
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Runs" value={runs.length} icon={<Radar size={18} />} accent="from-indigo-400 to-purple-400" />
        <StatCard label="Running" value={runs.filter((r) => r.status === 'running').length} icon={<RefreshCw size={18} />} accent="from-blue-400 to-cyan-400" />
        <StatCard label="Total Imported" value={runs.reduce((sum, r) => sum + (r.imported_count || 0), 0)} icon={<Plus size={18} />} accent="from-emerald-400 to-teal-400" />
      </div>

      {feedback && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
          {feedback}
          <button onClick={() => setFeedback(null)}><X size={14} /></button>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-bold text-sm">Start a Discovery Run</h3>
        <p className="text-zinc-400 text-xs mb-4">Launch live discovery directly from the product, pull leads from external sources and sync them to your CRM.</p>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={discoveryQuery}
              onChange={(e) => setDiscoveryQuery(e.target.value)}
              placeholder="e.g. dentists in Dubai, salons in London"
              className="w-full bg-[#111] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              onKeyDown={(e) => e.key === 'Enter' && startDiscovery()}
            />
          </div>
          <select
            value={discoverySource}
            onChange={(e) => setDiscoverySource(e.target.value)}
            className="bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          >
            <option value="google_maps">Google Maps</option>
            <option value="website_scrape">Website Scrape</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <button
            onClick={startDiscovery}
            disabled={discoveryLoading || !discoveryQuery.trim()}
            className="flex justify-center items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {discoveryLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Discover
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Discovery History</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-zinc-500 text-sm">Loading runs...</div>
          ) : runs.length === 0 ? (
            <div className="text-center text-zinc-500 p-8 border border-white/5 rounded-xl">
              <Radar className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No discovery runs yet. Start one above.</p>
            </div>
          ) : (
            runs.map((run) => (
              <div key={run.id} className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{run.query}</p>
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      run.status === 'running' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      run.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      run.status === 'failed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                      {run.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500 font-mono">
                    <span>Source: {run.source_type.replace(/_/g, ' ')}</span>
                    <span className="text-emerald-400">Imported: {run.imported_count || 0}</span>
                    <span>Duplicates: {run.deduplicated_count || 0}</span>
                    <span>{new Date(run.created_at).toLocaleString()}</span>
                  </div>
                  {run.error_message && (
                    <p className="text-xs text-red-400 mt-2">{run.error_message}</p>
                  )}
                </div>
                
                {['failed', 'cancelled'].includes(run.status) && (
                  <button
                    onClick={() => retryRun(run.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number | string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex items-center gap-4">
      <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br opacity-80", accent, "text-white")}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}
