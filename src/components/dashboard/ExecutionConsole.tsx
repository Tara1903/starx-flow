import React, { useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { type SimulationLog } from "../../store/authStore";
import { CONSOLE_PANEL_FLUSH } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

const LOG_COLORS: Record<SimulationLog["type"], string> = {
  trigger: "text-amber-300",
  ai_process: "text-sky-300",
  ai_reply: "text-[#4cc38a]",
  success: "text-[#34d399]",
  system: "text-[#727c75]",
};

const LOG_LABEL: Record<SimulationLog["type"], string> = {
  trigger: "Trigger",
  ai_process: "Process",
  ai_reply: "Reply",
  success: "Success",
  system: "System",
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
    <div className={cn(CONSOLE_PANEL_FLUSH, "select-none")}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#edf0ee]/[0.08]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          <span className="text-xs font-medium text-[#edf0ee]">Execution log</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[#727c75] hover:text-[#f28b8e] transition-colors p-1 rounded hover:bg-[#19201d] cursor-pointer"
          title="Clear logs"
          aria-label="Clear console logs"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.65} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="h-52 overflow-y-auto console-scroll bg-[#0c100e] p-4 font-mono text-xs space-y-2 select-text tabular-nums"
      >
        {logs.length === 0 ? (
          <p className="text-[#727c75] select-none">Awaiting workflow runs...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2.5 leading-relaxed items-baseline">
              <span className="text-[#727c75] flex-shrink-0 select-none">{log.timestamp}</span>
              <span className={cn("flex-shrink-0 font-medium select-none w-16", LOG_COLORS[log.type])}>
                {LOG_LABEL[log.type]}
              </span>
              <span className="text-[#a1aaa4] flex-shrink-0 select-none">[{log.channel}]</span>
              <span className="text-[#edf0ee] break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
