import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Search, Command, ArrowRight, Sparkles, MessageSquare, Calendar, Settings } from "lucide-react";

export function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const actions = [
    { id: "dashboard", icon: Command, label: "Go to Dashboard", path: "/dashboard" },
    { id: "inbox", icon: MessageSquare, label: "View Inbox", path: "/dashboard?section=conversations" },
    { id: "calendar", icon: Calendar, label: "View Calendar", path: "/dashboard?section=calendar" },
    { id: "settings", icon: Settings, label: "OS Settings", path: "/dashboard?section=settings" },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 border-b border-white/10">
              <Search className="w-5 h-5 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-white px-4 py-4 outline-none text-lg placeholder:text-zinc-500"
              />
              <div className="flex items-center gap-1 text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">
                <span>esc</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 console-scroll">
              {query.length > 2 && (
                <div className="px-2 py-3 mb-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-emerald-500/20 transition-colors">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-emerald-50 text-sm font-medium">Ask AI to execute</div>
                    <div className="text-emerald-400/70 text-xs">"{query}"</div>
                  </div>
                </div>
              )}

              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Quick Actions
              </div>
              
              {filteredActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.path)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}

              {filteredActions.length === 0 && (
                <div className="px-3 py-8 text-center text-zinc-500 text-sm">
                  No commands found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
