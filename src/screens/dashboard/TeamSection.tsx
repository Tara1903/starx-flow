import React from "react";
import { Contact, Plus, Shield, User, Mail, MoreHorizontal } from "lucide-react";

export function TeamSection() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Contact className="w-6 h-6 text-emerald-400" />
            Team Management
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manage staff access and permissions.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Team Member Card (Admin/Owner) */}
        <div className="bg-[#0a0a0a] border border-emerald-500/20 rounded-2xl p-6 relative group hover:border-emerald-500/40 transition-colors">
          <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" />
            OWNER
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">You</h3>
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-0.5">
                <Mail className="w-3 h-3" />
                <span>Admin User</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Now
            </span>
            <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invite Prompt */}
        <button className="bg-[#050505] border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-emerald-400 transition-colors">Invite a team member</span>
        </button>
      </div>
    </div>
  );
}
