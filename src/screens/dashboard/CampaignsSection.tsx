import React, { useState, useEffect } from 'react';
import { Mail, Megaphone, Plus, RefreshCw, Wallet, CheckSquare, Search } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export function CampaignsSection() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    template_subject: '',
    template_body: '',
    prompt_instructions: '',
    schedule_cron: '',
    daily_limit: '50',
    delay_min_ms: '60000',
    delay_max_ms: '300000',
    channel_account_id: '',
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('outreach_campaigns').select('*').order('created_at', { ascending: false });
    if (!error && data) setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const selectedCampaign = campaigns.find((c) => c.id === selectedId) || campaigns[0] || null;

  async function createCampaign() {
    const { error } = await supabase.from('outreach_campaigns').insert({
      name: draft.name,
      description: draft.description,
      template_subject: draft.template_subject,
      template_body: draft.template_body,
      prompt_instructions: draft.prompt_instructions,
      schedule_cron: draft.schedule_cron,
      daily_limit: Number(draft.daily_limit),
      delay_min_ms: Number(draft.delay_min_ms),
      delay_max_ms: Number(draft.delay_max_ms),
      status: 'draft',
    });

    if (!error) {
      setFeedback('Campaign created.');
      setShowCreate(false);
      setDraft({
        name: '', description: '', template_subject: '', template_body: '', prompt_instructions: '',
        schedule_cron: '', daily_limit: '50', delay_min_ms: '60000', delay_max_ms: '300000', channel_account_id: ''
      });
      fetchCampaigns();
    } else {
      setFeedback(error.message);
    }
  }

  async function toggleStatus(campaign: any) {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('outreach_campaigns').update({ status: newStatus }).eq('id', campaign.id);
    
    if (!error) {
      setFeedback(`Campaign ${newStatus}.`);
      fetchCampaigns();
    }
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      {/* Header Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-zinc-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Automated Campaigns
          </h2>
        </div>

        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-4 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Campaigns" value={campaigns.length} icon={<Megaphone size={18} />} accent="from-sky-400 to-cyan-400" />
        <StatCard label="Active Campaigns" value={campaigns.filter((c) => c.status === 'active').length} icon={<RefreshCw size={18} />} accent="from-emerald-400 to-teal-400" />
        <StatCard label="Messages Sent" value={campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)} icon={<Mail size={18} />} accent="from-violet-400 to-fuchsia-500" />
      </div>

      {feedback && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm">
          {feedback}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {showCreate && (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm">Create New Campaign</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Campaign Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                <InputField label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
                <InputField label="Template Subject" value={draft.template_subject} onChange={(v) => setDraft({ ...draft, template_subject: v })} />
                <InputField label="Daily Limit" value={draft.daily_limit} onChange={(v) => setDraft({ ...draft, daily_limit: v })} />
                <InputField label="Schedule Cron" value={draft.schedule_cron} onChange={(v) => setDraft({ ...draft, schedule_cron: v })} />
              </div>
              <label className="block mt-4">
                <span className="block text-xs font-medium text-zinc-400 mb-1.5">Template Body</span>
                <textarea
                  value={draft.template_body}
                  onChange={(e) => setDraft({ ...draft, template_body: e.target.value })}
                  rows={4}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </label>
              <label className="block mt-4">
                <span className="block text-xs font-medium text-zinc-400 mb-1.5">AI Prompt Instructions (Optional)</span>
                <textarea
                  value={draft.prompt_instructions}
                  onChange={(e) => setDraft({ ...draft, prompt_instructions: e.target.value })}
                  rows={3}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </label>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => createCampaign()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Save Campaign
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="text-zinc-500 text-sm">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 text-center">
                <Megaphone className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-1">No campaigns found</h4>
                <p className="text-zinc-500 text-sm">Create a new outreach campaign to start sending.</p>
              </div>
            ) : (
              campaigns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={clsx(
                    "bg-[#0a0a0a] border rounded-xl p-4 cursor-pointer transition-colors",
                    selectedCampaign?.id === c.id ? "border-emerald-500/50" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-bold">{c.name}</h4>
                        <span className={clsx(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          c.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        )}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-sm mt-1">{c.description || 'No description.'}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(c);
                      }}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        c.status === 'active' ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      )}
                    >
                      {c.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                  <div className="flex gap-4 mt-4 text-xs font-mono text-zinc-400">
                    <div>Leads: <span className="text-zinc-300">{c.total_leads || 0}</span></div>
                    <div>Sent: <span className="text-emerald-400">{c.sent_count || 0}</span></div>
                    <div>Replies: <span className="text-sky-400">{c.reply_count || 0}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          {selectedCampaign ? (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 sticky top-6">
              <h3 className="text-white font-bold text-lg mb-1">{selectedCampaign.name}</h3>
              <p className="text-zinc-400 text-sm mb-6">{selectedCampaign.description || 'No description.'}</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#111] border border-white/5 rounded-lg p-3">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">Leads</div>
                    <div className="text-xl text-white font-mono">{selectedCampaign.total_leads || 0}</div>
                  </div>
                  <div className="bg-[#111] border border-white/5 rounded-lg p-3">
                    <div className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider mb-1">Sent</div>
                    <div className="text-xl text-emerald-400 font-mono">{selectedCampaign.sent_count || 0}</div>
                  </div>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-lg p-4">
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">Daily Limit</div>
                  <div className="text-sm text-zinc-300 font-mono">{selectedCampaign.daily_limit || '50'} messages</div>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-lg p-4">
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">Schedule (Cron)</div>
                  <div className="text-sm text-zinc-300 font-mono">{selectedCampaign.schedule_cron || 'Unscheduled'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 text-center text-zinc-500 sticky top-6">
              Select a campaign to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number | string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex items-center gap-4">
      <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br opacity-80", accent)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
      />
    </div>
  );
}
