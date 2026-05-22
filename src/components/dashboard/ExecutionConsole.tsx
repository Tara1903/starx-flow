import React, { useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { type SimulationLog } from "../../store/authStore";
import { cn } from "../../lib/utils";

const LOG_COLORS: Record<SimulationLog["type"], string> = {
  trigger:    "text-amber-400",
  ai_process: "text-blue-400",
  ai_reply:   "text-emerald-400",
  success:    "text-green-300",
  system:     "text-zinc-500",
};

const LOG_PREFIX: Record<SimulationLog["type"], string> = {
  trigger:    "▶ TRIGGER",
  ai_process: "⟳ PROCESS",
  ai_reply:   "◈ AI-OUT ",
  success:    "✓ SUCCESS",
  system:     "⚙ SYSTEM ",
};

interface ExecutionConsoleProps {
  logs: SimulationLog[];
  onClear: () => void;
}

export function ExecutionConsole({ logs, onClear }: ExecutionConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="glass-card rounded-xl overflow-hidden select-none">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold text-zinc-300 tracking-wider uppercase">Live Execution Console</span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full status-live" />
        </div>
        <button
          onClick={onClear}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-white/5"
          title="Clear console logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Console Body */}
      <div
        ref={scrollRef}
        className="h-56 overflow-y-auto console-scroll bg-[#060606] p-4 font-mono text-xs space-y-2 select-text"
      >
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 text-zinc-700">
            <span className="cursor-blink select-none">▌</span>
            <span className="select-none">Awaiting workflow triggers...</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-entry flex gap-2 leading-relaxed align-top">
              <span className="text-zinc-600 flex-shrink-0 select-none font-mono">{log.timestamp}</span>
              <span className={cn("flex-shrink-0 font-bold select-none font-mono", LOG_COLORS[log.type])}>
                {LOG_PREFIX[log.type]}
              </span>
              <span className="text-zinc-500 flex-shrink-0 select-none font-mono">[{log.channel}]</span>
              <span className="text-zinc-300 font-mono break-all">{log.message}</span>
            </div>
          ))
        )}
        {/* Cursor */}
        {logs.length > 0 && (
          <div className="flex items-center gap-2 text-zinc-700 pt-1 select-none">
            <span className="cursor-blink">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}
