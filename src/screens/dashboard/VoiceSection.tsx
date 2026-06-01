import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Pause, 
  Search, SlidersHorizontal, ArrowLeft, Brain, Calendar, Info, 
  CheckCircle, Clock, Volume2, Plus, Sparkles, User, Database, AlertCircle, X
} from "lucide-react";
import { type Call } from "../../store/authStore";
import { useVoiceStore } from "../../store/voiceStore";
import { useAgentStore } from "../../store/agentStore";
import { cn } from "../../lib/utils";

export function VoiceSection() {
  const { calls, addCall, fetchCalls } = useVoiceStore();
  const { agentMemories, addMemory } = useAgentStore();
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"all" | "inbound" | "outbound">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "missed">("all");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  
  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState("0:00");
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulator Modal State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<"ringing" | "active" | "wrapup" | "ended">("ringing");
  const [simTranscript, setSimTranscript] = useState<{ role: "agent" | "customer"; text: string; timestamp: string }[]>([]);
  const [simTimer, setSimTimer] = useState(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [simMemory, setSimMemory] = useState<{ key: string; value: string }[]>([]);

  // Fetch calls on load
  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const selectedCall = calls.find(c => c.id === selectedCallId) || calls[0];

  // Set default selected call if list loads
  useEffect(() => {
    if (calls.length > 0 && !selectedCallId) {
      setSelectedCallId(calls[0].id);
    }
  }, [calls, selectedCallId]);

  // Audio Playback Simulation Logic
  useEffect(() => {
    if (isPlaying && selectedCall) {
      const duration = selectedCall.durationSeconds || 60;
      const step = 100 / duration; // % progress per second
      
      playbackTimerRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          const next = prev + step;
          if (next >= 100) {
            setIsPlaying(false);
            if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
            return 100;
          }
          
          // Format current timestamp
          const totalSecs = Math.round((next / 100) * duration);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
          
          return next;
        });
      }, 1000);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    }
    
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, selectedCall]);

  // Reset progress when changing selected call
  useEffect(() => {
    setIsPlaying(false);
    setPlaybackProgress(0);
    setCurrentTime("0:00");
  }, [selectedCallId]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlaybackProgress(value);
    
    if (selectedCall) {
      const duration = selectedCall.durationSeconds || 60;
      const totalSecs = Math.round((value / 100) * duration);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }
  };

  // Convert mm:ss text to seconds for scrubbing
  const parseTimestampToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  const handleTranscriptLineClick = (timestamp: string) => {
    if (!selectedCall) return;
    const lineSecs = parseTimestampToSeconds(timestamp);
    const duration = selectedCall.durationSeconds || 60;
    const progress = (lineSecs / duration) * 100;
    setPlaybackProgress(progress);
    setCurrentTime(timestamp);
    setIsPlaying(true);
  };

  // ────────────────────────────────────────────────────────
  // LIVE CALL SIMULATOR DIALOG STAGES
  // ────────────────────────────────────────────────────────
  const SIMULATOR_DIALOG = [
    { role: "customer" as const, text: "Hello? Is this StarX Styling studio?", timestamp: "0:02" },
    { role: "agent" as const, text: "Hello! Yes it is. This is your StarX AI Receptionist. How can I help you today?", timestamp: "0:08" },
    { role: "customer" as const, text: "Hi, I need to book a quick manicure for today at 3:00 PM if possible.", timestamp: "0:14" },
    { role: "agent" as const, text: "Let me check our active calendar... Yes, Jessica has an opening at 3:00 PM today. Would you like to reserve that slot?", timestamp: "0:21" },
    { role: "customer" as const, text: "Perfect. Book it please. My name is Jane Doe and my number is +1 (555) 777-8899.", timestamp: "0:29" },
    { role: "agent" as const, text: "All set, Jane! I have confirmed your manicure with Jessica today at 3:00 PM. A confirmation SMS with details is on its way.", timestamp: "0:38" },
    { role: "customer" as const, text: "Excellent, thank you so much! See you then.", timestamp: "0:43" },
    { role: "agent" as const, text: "You are very welcome! Have a great afternoon, Jane. Goodbye!", timestamp: "0:48" }
  ];

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimStep("ringing");
    setSimTranscript([]);
    setSimTimer(0);
    setSimMemory([]);
  };

  const handleAnswerCall = () => {
    setSimStep("active");
    let currentLineIndex = 0;
    
    // Timer increment
    simIntervalRef.current = setInterval(() => {
      setSimTimer((prev) => prev + 1);
      
      // Feed dialogue in steps
      const triggerSecs = [2, 8, 14, 21, 29, 38, 43, 48];
      const lineIdx = triggerSecs.findIndex(s => s === currentLineIndex + 1);
      
      if (lineIdx !== -1 && lineIdx < SIMULATOR_DIALOG.length) {
        setSimTranscript(prev => [...prev, SIMULATOR_DIALOG[lineIdx]]);
        currentLineIndex++;
      }
      
      // Auto-wrap call after completing dialog
      if (currentLineIndex >= SIMULATOR_DIALOG.length) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setSimStep("wrapup");
        
        // AI cognitive processing extraction
        setTimeout(() => {
          setSimMemory([
            { key: "appointment_booked", value: "true" },
            { key: "service_type", value: "Manicure" },
            { key: "stylist_preference", value: "Jessica" },
            { key: "booking_date", value: "Today at 3:00 PM" }
          ]);
          setSimStep("ended");
        }, 2500);
      }
      
    }, 1000);
  };

  const handleHangUp = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setSimStep("wrapup");
    
    // Ingest even if hung up early
    setTimeout(() => {
      setSimMemory([
        { key: "lead_name", value: "Jane Doe" },
        { key: "contact_number", value: "+1 (555) 777-8899" }
      ]);
      setSimStep("ended");
    }, 2000);
  };

  const handleDeclineCall = () => {
    setIsSimulating(false);
    // Ingest missed call log
    addCall({
      leadId: null,
      customerName: "Unknown Caller",
      customerPhone: "+1 (555) 303-4400",
      direction: "inbound",
      status: "missed",
      durationSeconds: 0,
      recordingUrl: "",
      transcription: [],
      summary: "Missed call from a potential customer. SMS auto-reply triggered.",
      sentiment: "neutral",
      callMemory: []
    });
  };

  const handleSaveSimulatedCall = () => {
    // Add call log
    addCall({
      leadId: null,
      customerName: "Jane Doe",
      customerPhone: "+1 (555) 777-8899",
      direction: "inbound",
      status: simTranscript.length > 3 ? "completed" : "failed",
      durationSeconds: simTimer,
      recordingUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop_ambience.ogg",
      transcription: simTranscript,
      summary: "Customer called to schedule a manicure. Inbound AI receptionist scheduled slot at 3:00 PM today with Jessica.",
      sentiment: "positive",
      callMemory: simMemory
    });
    
    setIsSimulating(false);
  };

  // Commit cognitive memory to global lead memories
  const handleCommitMemoryToCrm = (key: string, value: string) => {
    addMemory({
      leadId: selectedCall?.leadId || 'lead-generic',
      key,
      value
    });
    // Visual alert of success is handled inside addMemory adding to UI
  };

  // Filters calculation
  const filteredCalls = calls.filter((call) => {
    const matchesSearch = 
      call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.customerPhone.includes(searchQuery) ||
      call.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDirection = directionFilter === "all" ? true : call.direction === directionFilter;
    const matchesStatus = statusFilter === "all" ? true : call.status === statusFilter;
    const matchesSentiment = sentimentFilter === "all" ? true : call.sentiment === sentimentFilter;
    
    return matchesSearch && matchesDirection && matchesStatus && matchesSentiment;
  });

  // Aggregated analytics calculation
  const totalCallsCount = calls.length;
  const completedCallsCount = calls.filter(c => c.status === "completed").length;
  const missedCallsCount = calls.filter(c => c.status === "missed").length;
  const totalDuration = calls.reduce((acc, c) => acc + c.durationSeconds, 0);
  const avgDuration = totalCallsCount > 0 ? Math.round(totalDuration / totalCallsCount) : 0;
  
  const positiveSentimentCount = calls.filter(c => c.sentiment === "positive").length;
  const sentimentPct = totalCallsCount > 0 ? Math.round((positiveSentimentCount / totalCallsCount) * 100) : 100;
  const aiResolutionPct = totalCallsCount > 0 ? Math.round((completedCallsCount / totalCallsCount) * 100) : 100;

  // Render format utilities
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "negative": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* top banner / triggers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Voice Operating Deck</h2>
          <p className="text-xs text-zinc-500 mt-1">Review live call logs, run simulations, and analyze client requests</p>
        </div>
        <button
          onClick={handleStartSimulation}
          className="flex items-center gap-2 text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 px-4 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-emerald-400/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Call Simulator</span>
        </button>
      </div>

      {/* Analytics widgets grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Voice Traffic</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{totalCallsCount}</span>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {completedCallsCount} active / {missedCallsCount} missed
            </span>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avg Call Duration</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{formatDuration(avgDuration)}</span>
            <span className="text-[10px] text-indigo-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> Optimum talk-time
            </span>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Agent Answer Rate</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{aiResolutionPct}%</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              +12.4% vs last week
            </span>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Positive Call Sentiment</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{sentimentPct}%</span>
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              {positiveSentimentCount} happy clients
            </span>
          </div>
        </div>
      </div>

      {/* Main interaction panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Logs List */}
        <div className="xl:col-span-5 flex flex-col space-y-4">
          
          {/* Controls box */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4 space-y-3 shadow-2xl">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, transcripts, or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black border border-white/5 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>
            
            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <select
                value={directionFilter}
                onChange={(e: any) => setDirectionFilter(e.target.value)}
                className="bg-black border border-white/5 rounded px-2.5 py-1.5 text-zinc-400 focus:outline-none focus:border-emerald-500/40 transition-all"
              >
                <option value="all">All Directions</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-black border border-white/5 rounded px-2.5 py-1.5 text-zinc-400 focus:outline-none focus:border-emerald-500/40 transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>

              <select
                value={sentimentFilter}
                onChange={(e: any) => setSentimentFilter(e.target.value)}
                className="bg-black border border-white/5 rounded px-2.5 py-1.5 text-zinc-400 focus:outline-none focus:border-emerald-500/40 transition-all"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          {/* Calls List cards container */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 console-scroll">
            {filteredCalls.length === 0 ? (
              <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-8 text-center text-zinc-500 shadow-2xl">
                <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <span className="text-xs">No calls match your filter settings</span>
              </div>
            ) : (
              filteredCalls.map((call) => {
                const isActive = selectedCallId === call.id;
                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCallId(call.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer select-none relative group",
                      isActive
                        ? "bg-emerald-500/[0.02] border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                        : "bg-[#0c0c0c] border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
                    )}
                  >
                    {/* Active highlight line */}
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-emerald-500 rounded-r" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-lg border flex items-center justify-center",
                          call.direction === "inbound" 
                            ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                            : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        )}>
                          {call.status === "missed" ? (
                            <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
                          ) : call.direction === "inbound" ? (
                            <PhoneIncoming className="w-3.5 h-3.5" />
                          ) : (
                            <PhoneOutgoing className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-tight">{call.customerName}</h4>
                          <span className="text-[10px] text-zinc-500">{call.customerPhone}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-3 leading-relaxed">
                      {call.summary || "No call summary generated yet."}
                    </p>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.03]">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        {call.status === "missed" ? "Missed Call" : formatDuration(call.durationSeconds)}
                      </span>
                      <span className="text-[9px] text-zinc-600">•</span>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full border font-semibold",
                        getSentimentBadgeColor(call.sentiment)
                      )}>
                        {call.sentiment}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Audio Playback, transcript and call summary details */}
        <div className="xl:col-span-7">
          {selectedCall ? (
            <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* Header metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    {selectedCall.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{selectedCall.customerName}</h3>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span>{selectedCall.customerPhone}</span>
                      <span>•</span>
                      <span>{new Date(selectedCall.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full border font-bold capitalize",
                    getSentimentBadgeColor(selectedCall.sentiment)
                  )}>
                    Sentiment: {selectedCall.sentiment}
                  </span>
                  {selectedCall.status === "missed" && (
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full font-bold">
                      Missed Call
                    </span>
                  )}
                </div>
              </div>

              {/* Summary Block */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-xs">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Call Summary</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {selectedCall.summary || "No summary available."}
                </p>
              </div>

              {/* Playback & Audio Panel (if completed/has audio) */}
              {selectedCall.status !== "missed" && (
                <div className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-4">
                  
                  {/* Waveform Visualization */}
                  <div className="h-12 flex items-center justify-between gap-[2px] px-2 select-none">
                    {Array.from({ length: 44 }).map((_, i) => {
                      // Generate a wave-like profile
                      const centerOffset = Math.abs(i - 22);
                      const height = Math.max(10, 48 - (centerOffset * 1.5) - (Math.sin(i * 0.4) * 8) + (Math.cos(i * 0.9) * 4));
                      const isPast = (i / 44) * 100 <= playbackProgress;
                      return (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className={cn(
                            "flex-1 rounded-full transition-all duration-300",
                            isPast 
                              ? isPlaying 
                                ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                : "bg-emerald-600"
                              : "bg-zinc-800"
                          )}
                        />
                      );
                    })}
                  </div>

                  {/* Scrubber slider bar */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayback}
                      className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                    </button>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={playbackProgress}
                      onChange={handleSeek}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded-lg cursor-pointer appearance-none focus:outline-none"
                    />
                    
                    <span className="text-[10px] text-zinc-500 font-bold w-12 text-right">
                      {currentTime} / {formatDuration(selectedCall.durationSeconds).replace('m ', ':').replace('s', '')}
                    </span>
                  </div>
                </div>
              )}

              {/* Transcript list */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-xs pb-2 border-b border-white/[0.03]">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Transcription Timeline</span>
                  <span className="text-[9px] text-zinc-600 font-normal ml-auto">(Click bubbles to skip audio)</span>
                </div>

                {selectedCall.transcription.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No audio recorded or transcribed for this call type.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 console-scroll">
                    {selectedCall.transcription.map((line, idx) => {
                      const isAgent = line.role === "agent";
                      return (
                        <div
                          key={idx}
                          onClick={() => handleTranscriptLineClick(line.timestamp)}
                          className={cn(
                            "flex gap-3 p-2.5 rounded-lg transition-all cursor-pointer",
                            isAgent 
                              ? "bg-indigo-500/[0.01] hover:bg-indigo-500/5" 
                              : "bg-emerald-500/[0.01] hover:bg-emerald-500/5"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold border",
                            isAgent 
                              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          )}>
                            {isAgent ? "AI" : "CU"}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-[9px] text-zinc-500">
                              <span className="font-bold uppercase tracking-wider">{isAgent ? "AI Receptionist" : selectedCall.customerName}</span>
                              <span>{line.timestamp}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                              {line.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Call Memory items extracted */}
              {selectedCall.callMemory && selectedCall.callMemory.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-xs">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Extracted Cognitive Memory</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCall.callMemory.map((mem, idx) => {
                      // Check if already committed
                      const isCommitted = agentMemories.some(m => m.key === mem.key && m.value === mem.value);
                      
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-lg text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="block text-[9px] text-zinc-500 uppercase font-bold tracking-wider">{mem.key.replace(/_/g, ' ')}</span>
                            <span className="block font-semibold text-white truncate">{mem.value}</span>
                          </div>
                          <button
                            onClick={() => handleCommitMemoryToCrm(mem.key, mem.value)}
                            disabled={isCommitted}
                            className={cn(
                              "px-2.5 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0",
                              isCommitted 
                                ? "bg-zinc-900 border border-emerald-500/30 text-emerald-400 cursor-default" 
                                : "bg-emerald-500 text-black hover:bg-emerald-400"
                            )}
                          >
                            {isCommitted ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>Synced</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Sync CRM</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-12 text-center text-zinc-500 shadow-2xl h-96 flex flex-col items-center justify-center">
              <Phone className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-white mb-1">No Call Selected</h3>
              <p className="text-xs max-w-xs mx-auto">Select a call log from the left sidebar panel to review details, audio timelines, and transcripts.</p>
            </div>
          )}
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* DIALOG SIMULATOR MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {isSimulating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#090909] border border-white/10 rounded-2xl w-full max-w-xl shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Glow gradient header */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Interactive Voice Sandbox</h3>
                  <span className="text-[10px] text-zinc-500">Simulate incoming customer voice triggers</span>
                </div>
              </div>
              <button 
                onClick={() => setIsSimulating(false)}
                className="p-1 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sim Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 console-scroll">
              
              {/* Ringing state view */}
              {simStep === "ringing" && (
                <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
                  
                  {/* Phone Ringing Animated Ripple */}
                  <div className="relative flex items-center justify-center w-24 h-24">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/20 animate-ping opacity-75"></span>
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <Phone className="w-8 h-8 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white tracking-tight">INBOUND TELEPHONY TRIGGER</h4>
                    <p className="text-xs text-zinc-500">+1 (555) 777-8899 (Jane Doe)</p>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleDeclineCall}
                      className="px-6 py-2.5 rounded-full border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-colors"
                    >
                      Ignore (Triggers Auto-SMS)
                    </button>
                    <button
                      onClick={handleAnswerCall}
                      className="px-8 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      Answer with AI Agent
                    </button>
                  </div>
                </div>
              )}

              {/* Active Conversation state */}
              {simStep === "active" && (
                <div className="space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between p-3 bg-black border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Line Active • AI Booking Specialist</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-semibold w-12 text-right">
                      {Math.floor(simTimer / 60)}:{(simTimer % 60) < 10 ? '0' : ''}{simTimer % 60}
                    </span>
                  </div>

                  {/* Bouncing speech wave */}
                  <div className="h-10 flex items-center justify-center gap-1 bg-white/[0.01] border border-white/5 rounded-xl p-3 select-none">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const h = 20 + Math.sin(simTimer + i) * 60;
                      return (
                        <div 
                          key={i} 
                          style={{ height: `${Math.max(10, Math.min(100, h))}%` }} 
                          className="w-1 bg-emerald-500/60 rounded transition-all duration-300 animate-pulse" 
                        />
                      );
                    })}
                  </div>

                  {/* Scrollable live feed */}
                  <div className="bg-black/50 border border-white/5 rounded-xl p-4 h-60 overflow-y-auto space-y-3 flex flex-col justify-end console-scroll">
                    {simTranscript.length === 0 ? (
                      <p className="text-zinc-500 text-xs text-center py-12 animate-pulse">Call initiated. Connecting audio stream...</p>
                    ) : (
                      simTranscript.map((t, idx) => {
                        const isAgent = t.role === "agent";
                        return (
                          <div 
                            key={idx}
                            className={cn(
                              "max-w-[85%] rounded-xl p-3 text-xs leading-relaxed font-semibold",
                              isAgent 
                                ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 self-start" 
                                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 self-end"
                            )}
                          >
                            <span className="block text-[8px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                              {isAgent ? "StarX AI Receptionist" : "Jane Doe"}
                            </span>
                            {t.text}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={handleHangUp}
                    className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 rotate-[135deg]" />
                    Hang Up & Process Transcription
                  </button>
                </div>
              )}

              {/* AI Wrap-up state */}
              {simStep === "wrapup" && (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative">
                    <Brain className="w-12 h-12 text-emerald-400 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white tracking-tight">AI WRAP-UP PROCESSING</h4>
                    <p className="text-xs text-zinc-500">Transcribing dial tone, sentiment tagging, extracting crm variables...</p>
                  </div>
                </div>
              )}

              {/* End of call review */}
              {simStep === "ended" && (
                <div className="space-y-5">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Processing Completed</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Call log synced to Supabase database. review findings below.</p>
                    </div>
                  </div>

                  {/* Summaries review */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">AI Summary</span>
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                      Jane Doe called to schedule a manicure. Inbound AI receptionist scheduled the slot at 3:00 PM today with Jessica.
                    </p>
                  </div>

                  {/* Memories review */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Extracted CRM Memory Parameters</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {simMemory.map((mem, idx) => (
                        <div key={idx} className="p-2 bg-black border border-white/5 rounded text-[11px]">
                          <span className="block text-[8px] text-zinc-500 uppercase font-bold">{mem.key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-white mt-0.5 block">{mem.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSimulatedCall}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <span>Commit Log to Registry</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
