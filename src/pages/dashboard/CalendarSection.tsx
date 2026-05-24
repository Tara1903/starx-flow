import React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export function CalendarSection() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            Calendar & Bookings
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manage your schedule and upcoming appointments.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-1">
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white">Week</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors">Month</button>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </button>
          <span className="text-white font-medium min-w-[120px] text-center">October 2026</span>
          <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Placeholder */}
      <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <CalendarIcon className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No upcoming appointments</h3>
          <p className="text-zinc-500">Your schedule is clear for this period.</p>
        </div>
      </div>
    </div>
  );
}
