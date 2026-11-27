import React, { useState, useEffect, useRef } from "react";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Pause,
  Search, Brain, Info, CheckCircle, Clock, Volume2, Plus, Database, AlertCircle, X
} from "lucide-react";
import { useVoiceStore } from "../../store/voiceStore";
import { useAgentStore } from "../../store/agentStore";
import { cn } from "../../lib/utils";
import { useIsDocumentVisible } from "../../hooks/useMotionVisibility";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_DANGER,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_DANGER,
  CONSOLE_BADGE_MUTED,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";

export function VoiceSection() {
  const { calls, addCall, fetchCalls } = useVoiceStore();
  const { agentMemories, addMemory } = useAgentStore();
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"all" | "inbound" | "outbound">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "missed">("all");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<"ringing" | "active" | "wrapup" | "ended">("ringing");
  const [simTranscript, setSimTranscript] = useState<{ role: "agent" | "customer"; text: string; timestamp: string }[]>([]);
  const [simTimer, setSimTimer] = useState(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [simMemory, setSimMemory] = useState<{ key: string; value: string }[]>([]);

  const isVisible = useIsDocumentVisible();

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const selectedCall = calls.find((c) => c.id === selectedCallId) || calls[0];

  useEffect(() => {
    if (calls.length > 0 && !selectedCallId) {
      setSelectedCallId(calls[0].id);
    }
  }, [calls, selectedCallId]);

  useEffect(() => {
    if (isPlaying && selectedCall && isVisible) {
      const duration = selectedCall.durationSeconds || 60;
      const step = 100 / duration;

      playbackTimerRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          const next = prev + step;
          if (next >= 100) {
            setIsPlaying(false);
            if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
            return 100;
          }

          const totalSecs = Math.round((next / 100) * duration);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          setCurrentTime(`${mins}:${secs < 10 ? "0" : ""}${secs}`);

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
  }, [isPlaying, selectedCall, isVisible]);

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
      setCurrentTime(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
    }
  };

  const parseTimestampToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(":");
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

  const SIMULATOR_DIALOG = [
    { role: "customer" as const, text: "Hello? Is this StarX Styling studio?", timestamp: "0:02" },
    { role: "agent" as const, text: "Hello! Yes it is. This is your StarX AI Receptionist. How can I help you today?", timestamp: "0:08" },
    { role: "customer" as const, text: "Hi, I need to book a quick manicure for today at 3:00 PM if possible.", timestamp: "0:14" },
    { role: "agent" as const, text: "Let me check our active calendar... Yes, Jessica has an opening at 3:00 PM today. Would you like to reserve that slot?", timestamp: "0:21" },
    { role: "customer" as const, text: "Perfect. Book it please. My name is Jane Doe and my number is +1 (555) 777-8899.", timestamp: "0:29" },
    { role: "agent" as const, text: "All set, Jane! I have confirmed your manicure with Jessica today at 3:00 PM. A confirmation SMS with details is on its way.", timestamp: "0:38" },
    { role: "customer" as const, text: "Excellent, thank you so much! See you then.", timestamp: "0:43" },
    { role: "agent" as const, text: "You are very welcome! Have a great afternoon, Jane. Goodbye!", timestamp: "0:48" },
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

    simIntervalRef.current = setInterval(() => {
      setSimTimer((prev) => prev + 1);

      const triggerSecs = [2, 8, 14, 21, 29, 38, 43, 48];
      const lineIdx = triggerSecs.findIndex((s) => s === currentLineIndex + 1);

      if (lineIdx !== -1 && lineIdx < SIMULATOR_DIALOG.length) {
        setSimTranscript((prev) => [...prev, SIMULATOR_DIALOG[lineIdx]]);
        currentLineIndex++;
      }

      if (currentLineIndex >= SIMULATOR_DIALOG.length) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setSimStep("wrapup");

        setTimeout(() => {
          setSimMemory([
            { key: "appointment_booked", value: "true" },
            { key: "service_type", value: "Manicure" },
            { key: "stylist_preference", value: "Jessica" },
            { key: "booking_date", value: "Today at 3:00 PM" },
          ]);
          setSimStep("ended");
        }, 2500);
      }
    }, 1000);
  };

  const handleHangUp = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setSimStep("wrapup");

    setTimeout(() => {
      setSimMemory([
        { key: "lead_name", value: "Jane Doe" },
        { key: "contact_number", value: "+1 (555) 777-8899" },
      ]);
      setSimStep("ended");
    }, 2000);
  };

  const handleDeclineCall = () => {
    setIsSimulating(false);
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
      callMemory: [],
    });
  };

  const handleSaveSimulatedCall = () => {
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
      callMemory: simMemory,
    });

    setIsSimulating(false);
  };

  const handleCommitMemoryToCrm = (key: string, value: string) => {
    addMemory({
      leadId: selectedCall?.leadId || "lead-generic",
      key,
      value,
    });
  };

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

  const totalCallsCount = calls.length;
  const completedCallsCount = calls.filter((c) => c.status === "completed").length;
  const missedCallsCount = calls.filter((c) => c.status === "missed").length;
  const totalDuration = calls.reduce((acc, c) => acc + c.durationSeconds, 0);
  const avgDuration = totalCallsCount > 0 ? Math.round(totalDuration / totalCallsCount) : 0;

  const positiveSentimentCount = calls.filter((c) => c.sentiment === "positive").length;
  const sentimentPct = totalCallsCount > 0 ? Math.round((positiveSentimentCount / totalCallsCount) * 100) : 0;
  const aiResolutionPct = totalCallsCount > 0 ? Math.round((completedCallsCount / totalCallsCount) * 100) : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSentimentBadgeClass = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return CONSOLE_BADGE_LIVE;
      case "negative":
        return CONSOLE_BADGE_DANGER;
      default:
        return CONSOLE_BADGE_MUTED;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className={cn(CONSOLE_BADGE_WARN, "w-full justify-start rounded-xl px-4 py-3 text-xs leading-relaxed")}>
        <Info className="w-4 h-4 shrink-0" />
        <span>
          <strong className="font-semibold">Roadmap note:</strong> Voice capabilities are currently paused while launch operations focus on 24/7 multi-channel chat reception. Use the call simulator below to preview call flows.
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={CONSOLE_HEADING}>Voice console</h2>
          <p className="text-xs text-[#727c75] mt-1">
            Review recorded call logs, inspect transcripts, and simulate inbound voice workflows.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartSimulation}
          className={CONSOLE_BTN_PRIMARY}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Launch call simulator</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cn(CONSOLE_PANEL, "flex flex-col justify-between")}>
          <span className="text-xs font-medium text-[#727c75]">Voice calls logged</span>
          <div className="flex items-baseline justify-between gap-2 mt-3 tabular-nums">
            <span className="text-2xl font-semibold text-[#edf0ee]">{totalCallsCount}</span>
            <span className="text-xs text-[#a1aaa4]">
              {completedCallsCount} answered / {missedCallsCount} missed
            </span>
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL, "flex flex-col justify-between")}>
          <span className="text-xs font-medium text-[#727c75]">Average duration</span>
          <div className="flex items-baseline justify-between gap-2 mt-3 tabular-nums">
            <span className="text-2xl font-semibold text-[#edf0ee]">{formatDuration(avgDuration)}</span>
            <span className="text-xs text-[#a1aaa4] inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Across {totalCallsCount} calls
            </span>
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL, "flex flex-col justify-between")}>
          <span className="text-xs font-medium text-[#727c75]">AI answer rate</span>
          <div className="flex items-baseline justify-between gap-2 mt-3 tabular-nums">
            <span className="text-2xl font-semibold text-[#edf0ee]">{aiResolutionPct}%</span>
            <span className="text-xs text-[#4cc38a]">
              {completedCallsCount} of {totalCallsCount} resolved
            </span>
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL, "flex flex-col justify-between")}>
          <span className="text-xs font-medium text-[#727c75]">Positive sentiment</span>
          <div className="flex items-baseline justify-between gap-2 mt-3 tabular-nums">
            <span className="text-2xl font-semibold text-[#edf0ee]">{sentimentPct}%</span>
            <span className="text-xs text-[#a1aaa4]">{positiveSentimentCount} calls</span>
          </div>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Call Logs List */}
        <div className="xl:col-span-5 flex flex-col space-y-4">
          <div className={cn(CONSOLE_PANEL, "space-y-3")}>
            <div className="relative">
              <Search className="w-4 h-4 text-[#727c75] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, transcripts, or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(CONSOLE_INPUT, "w-full pl-9 pr-4 py-2 text-xs")}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={directionFilter}
                onChange={(e: any) => setDirectionFilter(e.target.value)}
                className={cn(CONSOLE_INPUT, "px-2.5 py-1.5 text-xs text-[#a1aaa4]")}
              >
                <option value="all">All directions</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className={cn(CONSOLE_INPUT, "px-2.5 py-1.5 text-xs text-[#a1aaa4]")}
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>

              <select
                value={sentimentFilter}
                onChange={(e: any) => setSentimentFilter(e.target.value)}
                className={cn(CONSOLE_INPUT, "px-2.5 py-1.5 text-xs text-[#a1aaa4]")}
              >
                <option value="all">All sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 console-scroll">
            {filteredCalls.length === 0 ? (
              <div className={cn(CONSOLE_PANEL, "p-8 text-center text-[#727c75]")}>
                <AlertCircle className="w-6 h-6 text-[#727c75] mx-auto mb-2" />
                <span className="text-xs">No calls match your filter settings</span>
              </div>
            ) : (
              filteredCalls.map((call) => {
                const isActive = selectedCallId === call.id;
                return (
                  <button
                    type="button"
                    key={call.id}
                    onClick={() => setSelectedCallId(call.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-colors cursor-pointer relative",
                      isActive
                        ? "bg-[#19201d] border-[#34d399]/35"
                        : "bg-[#121715] border-[#edf0ee]/[0.08] hover:bg-[#19201d]/70"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0d1210] border border-[#edf0ee]/[0.08] flex items-center justify-center shrink-0">
                          {call.status === "missed" ? (
                            <PhoneMissed className="w-3.5 h-3.5 text-[#f28b8e]" />
                          ) : call.direction === "inbound" ? (
                            <PhoneIncoming className="w-3.5 h-3.5 text-[#34d399]" />
                          ) : (
                            <PhoneOutgoing className="w-3.5 h-3.5 text-[#a1aaa4]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-[#edf0ee] truncate">{call.customerName}</h4>
                          <span className="text-[11px] font-mono text-[#727c75]">{call.customerPhone}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#727c75] tabular-nums shrink-0">
                        {new Date(call.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-xs text-[#a1aaa4] line-clamp-2 mt-2.5 leading-relaxed">
                      {call.summary || "No call summary generated yet."}
                    </p>

                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#edf0ee]/[0.06] tabular-nums">
                      <span className="text-xs text-[#727c75]">
                        {call.status === "missed" ? "Missed call" : formatDuration(call.durationSeconds)}
                      </span>
                      <span className={cn(getSentimentBadgeClass(call.sentiment), "capitalize")}>
                        {call.sentiment}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Call Detail, Playback & Transcript */}
        <div className="xl:col-span-7">
          {selectedCall ? (
            <div className={cn(CONSOLE_PANEL, "p-6 space-y-6")}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#edf0ee]/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#edf0ee] text-sm font-medium">
                    {selectedCall.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className={CONSOLE_SECTION_TITLE}>{selectedCall.customerName}</h3>
                    <p className="text-xs text-[#727c75] font-mono mt-0.5 tabular-nums">
                      {selectedCall.customerPhone} · {new Date(selectedCall.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(getSentimentBadgeClass(selectedCall.sentiment), "capitalize")}>
                    Sentiment: {selectedCall.sentiment}
                  </span>
                  {selectedCall.status === "missed" && (
                    <span className={CONSOLE_BADGE_DANGER}>Missed call</span>
                  )}
                </div>
              </div>

              <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-2")}>
                <div className="flex items-center gap-1.5 text-[#a1aaa4] font-medium text-xs">
                  <Brain className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>Call summary</span>
                </div>
                <p className="text-xs text-[#edf0ee] leading-relaxed">
                  {selectedCall.summary || "No summary available."}
                </p>
              </div>

              {selectedCall.status !== "missed" && (
                <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-4")}>
                  <div className="h-12 flex items-center justify-between gap-[2px] px-2 select-none">
                    {Array.from({ length: 44 }).map((_, i) => {
                      const centerOffset = Math.abs(i - 22);
                      const height = Math.max(
                        10,
                        48 - centerOffset * 1.5 - Math.sin(i * 0.4) * 8 + Math.cos(i * 0.9) * 4
                      );
                      const isPast = (i / 44) * 100 <= playbackProgress;
                      return (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className={cn(
                            "flex-1 rounded-full transition-colors duration-200",
                            isPast ? "bg-[#34d399]" : "bg-[#19201d]"
                          )}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      aria-label={isPlaying ? "Pause playback" : "Play recording"}
                      className="w-8 h-8 rounded-full bg-[#edf0ee] hover:bg-white text-[#080a09] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={playbackProgress}
                      onChange={handleSeek}
                      className="w-full accent-[#34d399] bg-[#19201d] h-1 rounded-lg cursor-pointer"
                    />

                    <span className="text-[11px] font-mono text-[#a1aaa4] w-16 text-right tabular-nums">
                      {currentTime} / {formatDuration(selectedCall.durationSeconds).replace("m ", ":").replace("s", "")}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#edf0ee]/[0.06]">
                  <span className="flex items-center gap-1.5 text-[#a1aaa4] font-medium">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Transcription timeline</span>
                  </span>
                  <span className="text-xs text-[#727c75]">Click any line to seek</span>
                </div>

                {selectedCall.transcription.length === 0 ? (
                  <p className="text-xs text-[#727c75] py-4 text-center">No audio recorded or transcribed for this call.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 console-scroll">
                    {selectedCall.transcription.map((line, idx) => {
                      const isAgent = line.role === "agent";
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleTranscriptLineClick(line.timestamp)}
                          className="w-full text-left flex gap-3 p-2.5 rounded-lg bg-[#0d1210] hover:bg-[#19201d] border border-[#edf0ee]/[0.06] transition-colors cursor-pointer"
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-mono border",
                              isAgent
                                ? "bg-[#19201d] border-[#34d399]/25 text-[#34d399]"
                                : "bg-[#19201d] border-[#edf0ee]/15 text-[#edf0ee]"
                            )}
                          >
                            {isAgent ? "AI" : "CU"}
                          </div>

                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between text-xs text-[#727c75]">
                              <span className="font-medium text-[#a1aaa4]">
                                {isAgent ? "AI Receptionist" : selectedCall.customerName}
                              </span>
                              <span className="font-mono text-[11px] tabular-nums">{line.timestamp}</span>
                            </div>
                            <p className="text-xs text-[#edf0ee] leading-relaxed">{line.text}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedCall.callMemory && selectedCall.callMemory.length > 0 && (
                <div className="pt-4 border-t border-[#edf0ee]/[0.08] space-y-3">
                  <div className="flex items-center gap-1.5 text-[#a1aaa4] font-medium text-xs">
                    <Database className="w-3.5 h-3.5" />
                    <span>Extracted CRM memory</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {selectedCall.callMemory.map((mem, idx) => {
                      const isCommitted = agentMemories.some((m) => m.key === mem.key && m.value === mem.value);

                      return (
                        <div
                          key={idx}
                          className={cn(CONSOLE_SUBCARD, "flex items-center justify-between p-2.5 gap-2 text-xs")}
                        >
                          <div className="min-w-0">
                            <span className="block text-[11px] font-mono text-[#727c75]">{mem.key}</span>
                            <span className="block font-medium text-[#edf0ee] truncate mt-0.5">{mem.value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCommitMemoryToCrm(mem.key, mem.value)}
                            disabled={isCommitted}
                            className={cn(
                              isCommitted ? CONSOLE_BADGE_LIVE : CONSOLE_BTN_SECONDARY,
                              "shrink-0 px-2.5 py-1 text-xs"
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
            <div className={cn(CONSOLE_PANEL, "p-12 text-center h-96 flex flex-col items-center justify-center")}>
              <Phone className="w-8 h-8 text-[#727c75] mb-3" />
              <h3 className={CONSOLE_SECTION_TITLE}>No call selected</h3>
              <p className="text-xs text-[#727c75] max-w-xs mx-auto mt-1 leading-relaxed">
                Select a call record from the list to inspect the summary, audio timeline, and transcript.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CALL SIMULATOR MODAL */}
      {isSimulating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121715] border border-[#edf0ee]/[0.12] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#edf0ee]/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#34d399]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={CONSOLE_SECTION_TITLE}>Voice call simulator</h3>
                  <span className="text-xs text-[#727c75]">Preview incoming AI receptionist call handling</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulating(false)}
                className="p-1 rounded-md hover:bg-[#19201d] text-[#727c75] hover:text-[#edf0ee] transition-colors cursor-pointer"
                aria-label="Close simulator"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 console-scroll">
              {simStep === "ringing" && (
                <div className="py-10 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#19201d] border border-[#34d399]/35 flex items-center justify-center text-[#34d399]">
                    <PhoneIncoming className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-[#edf0ee]">Inbound call trigger</h4>
                    <p className="text-xs font-mono text-[#a1aaa4]">+1 (555) 777-8899 · Jane Doe</p>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleDeclineCall}
                      className={CONSOLE_BTN_DANGER}
                    >
                      Ignore (triggers auto-SMS)
                    </button>
                    <button
                      type="button"
                      onClick={handleAnswerCall}
                      className={CONSOLE_BTN_PRIMARY}
                    >
                      Answer with AI agent
                    </button>
                  </div>
                </div>
              )}

              {simStep === "active" && (
                <div className="space-y-4">
                  <div className={cn(CONSOLE_SUBCARD, "flex items-center justify-between px-3.5 py-2.5")}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#34d399]" />
                      <span className="text-xs text-[#edf0ee] font-medium">Line active · AI booking specialist</span>
                    </div>
                    <span className="text-xs font-mono text-[#a1aaa4] tabular-nums">
                      {Math.floor(simTimer / 60)}:{simTimer % 60 < 10 ? "0" : ""}
                      {simTimer % 60}
                    </span>
                  </div>

                  <div className={cn(CONSOLE_SUBCARD, "h-10 flex items-center justify-center gap-1 p-3 select-none")}>
                    {Array.from({ length: 20 }).map((_, i) => {
                      const h = 20 + Math.sin(simTimer + i) * 60;
                      return (
                        <div
                          key={i}
                          style={{ height: `${Math.max(10, Math.min(100, h))}%` }}
                          className="w-1 bg-[#34d399]/65 rounded transition-all duration-300"
                        />
                      );
                    })}
                  </div>

                  <div className={cn(CONSOLE_SUBCARD, "p-4 h-60 overflow-y-auto space-y-3 flex flex-col justify-end console-scroll")}>
                    {simTranscript.length === 0 ? (
                      <p className="text-[#727c75] text-xs text-center py-12">Connecting audio stream...</p>
                    ) : (
                      simTranscript.map((t, idx) => {
                        const isAgent = t.role === "agent";
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "max-w-[85%] rounded-xl p-3 text-xs leading-relaxed border",
                              isAgent
                                ? "bg-[#19201d] border-[#edf0ee]/[0.08] text-[#edf0ee] self-start"
                                : "bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#edf0ee] self-end"
                            )}
                          >
                            <span className="block text-[11px] text-[#727c75] mb-1">
                              {isAgent ? "StarX AI Receptionist" : "Jane Doe"}
                            </span>
                            {t.text}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleHangUp}
                    className={cn(CONSOLE_BTN_DANGER, "w-full py-2.5")}
                  >
                    <Phone className="w-3.5 h-3.5 rotate-[135deg]" />
                    <span>Hang up & process transcription</span>
                  </button>
                </div>
              )}

              {simStep === "wrapup" && (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <Brain className="w-8 h-8 text-[#34d399]" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-[#edf0ee]">Processing call wrap-up</h4>
                    <p className="text-xs text-[#727c75]">Generating transcript, sentiment tag, and CRM variables...</p>
                  </div>
                </div>
              )}

              {simStep === "ended" && (
                <div className="space-y-4">
                  <div className="bg-[#4cc38a]/10 border border-[#4cc38a]/25 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4cc38a] shrink-0" />
                    <div>
                      <h4 className="text-xs font-medium text-[#edf0ee]">Processing complete</h4>
                      <p className="text-xs text-[#a1aaa4] mt-0.5">Review extracted summary and CRM memory fields below.</p>
                    </div>
                  </div>

                  <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-1.5")}>
                    <span className="text-xs font-medium text-[#727c75] block">Summary</span>
                    <p className="text-xs text-[#edf0ee] leading-relaxed">
                      Jane Doe called to schedule a manicure. Inbound AI receptionist scheduled the slot at 3:00 PM today with Jessica.
                    </p>
                  </div>

                  <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-2")}>
                    <span className="text-xs font-medium text-[#727c75] block">Extracted CRM variables</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {simMemory.map((mem, idx) => (
                        <div key={idx} className="p-2.5 bg-[#121715] border border-[#edf0ee]/[0.06] rounded-lg text-xs">
                          <span className="block font-mono text-[11px] text-[#727c75]">{mem.key}</span>
                          <span className="font-medium text-[#edf0ee] mt-0.5 block">{mem.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSimulatedCall}
                    className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5")}
                  >
                    <span>Save call log</span>
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
