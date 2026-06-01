import React, { useState, useEffect } from "react";
import { Users, Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function CrmSection() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const { data, error } = await supabase
        .from("outreach_leads")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setLeads(data);
      }
      setLoading(false);
    }
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l => 
    l.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto animate-[fade-in_0.4s_ease-out]">
      <div className="flex items-center justify-between mb-8 select-none">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" />
            Customer Directory
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manage leads, contacts, and customer history.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, phone, or email..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0a0a0a] text-zinc-300 text-sm hover:bg-white/5 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Niche</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-4">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-white font-medium mb-1">No customers found</h3>
                    <p className="text-zinc-500 text-sm">Try adjusting your search or add a new customer.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{lead.business_name || 'Unknown'}</div>
                      <div className="text-xs text-zinc-500">{lead.owner_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">{lead.email || 'No email'}</div>
                      <div className="text-xs text-zinc-500">{lead.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {lead.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 capitalize">
                      {lead.source?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {lead.niche || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-500 hover:text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
