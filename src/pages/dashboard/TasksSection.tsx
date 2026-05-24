import React from "react";
import { CheckSquare, Plus, MoreHorizontal } from "lucide-react";

export function TasksSection() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Task Management
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Track to-dos and internal assignments.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Pending Column */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
              To Do
            </h3>
            <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-md">0</span>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-sm text-zinc-600">No tasks pending</p>
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              In Progress
            </h3>
            <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-md">0</span>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-sm text-zinc-600">Nothing in progress</p>
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Completed
            </h3>
            <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-md">0</span>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-sm text-zinc-600">No completed tasks yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
