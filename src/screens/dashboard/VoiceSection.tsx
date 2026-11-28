import React, { useState, useEffect, useRef } from "react";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Pause,
  Search, Brain, Info, CheckCircle, Clock, Volume2, Plus, Database, AlertCircle, X, Mic, Send
} from "lucide-react";
import { useVoiceStore } from "../../store/voiceStore";
import { useAgentStore } from "../../store/agentStore";
import { useCrmStore } from "../../store/crmStore";
import { crmFetch } from "../../lib/crm/crmApi";
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
  const leads = useCrmStore((s) => s.leads) || [];
  const fetchLeads = useCrmStore((s) => s.fetchLeads);
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
  const [simLeadId, setSimLeadId] = useState("");
  const [simCallerName, setSimCallerName] = useState("Inbound Caller");
  const [simCallerPhone, setSimCallerPhone] = useState("+49 30 982112");
  const [simUtterance, setSimUtterance] = useState("");
  const [simTurnLoading, setSimTurnLoading] = useState(false);
  const [simSummary, setSimSummary] = useState("");
  const [simSpeechAudio, setSimSpeechAudio] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  const isVisible = useIsDocumentVisible();

  useEffect(() => {
    fetchCalls();
    if (leads.length === 0) {
      fetchLeads().catch(() => {});
    }
  }, [fetchCalls, leads.length, fetchLeads]);

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

  const formatTimer = (sec: number) => `${Math.floor(sec / 60)}:${sec % 60 < 10 ? "0" : ""}${sec % 60}`;

  const speakText = (text: string) => {
    if (!simSpeechAudio || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    } catch {
      // Browser TTS optional
    }
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimStep("ringing");
    setSimTranscript([]);
    setSimTimer(0);
    setSimMemory([]);
    setSimSummary("");
    setSimUtterance("");
  };

  const handleAnswerCall = () => {
    setSimStep("active");
    const greeting = "Hello! You reached our 24/7 AI Receptionist. How can I assist you today?";
    setSimTranscript([{ role: "agent", text: greeting, timestamp: "0:01" }]);
    speakText(greeting);

    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    simIntervalRef.current = setInterval(() => {
      setSimTimer((prev) => prev + 1);
    }, 1000);
  };

  const handleSendVoiceTurn = async () => {
    const clean = simUtterance.trim();
    if (!clean || simTurnLoading) return;

    const ts = formatTimer(simTimer || simTranscript.length * 6);
    const updatedTranscript = [...simTranscript, { role: "customer" as const, text: clean, timestamp: ts }];
    setSimTranscript(updatedTranscript);
    setSimUtterance("");
    setSimTurnLoading(true);

    const res = await crmFetch<{
      reply: string;
      extractedMemory?: { key: string; value: string }[];
    }>("/api/voice/simulate", {
      method: "POST",
      body: JSON.stringify({
        message: clean,
        customerName: simCallerName,
        customerPhone: simCallerPhone,
        leadId: simLeadId || null,
        history: simTranscript.map((t) => ({ role: t.role, text: t.text, timestamp: t.timestamp })),
      }),
    });

    const replyText =
      res.ok && res.data?.reply
        ? res.data.reply
        : res.error || "Unable to reach live Voice AI pipeline. Please verify sign-in status.";

    setSimTranscript((prev) => [
      ...prev,
      { role: "agent", text: replyText, timestamp: formatTimer(simTimer + 2) },
    ]);
    speakText(replyText);

    if (res.ok && Array.isArray(res.data?.extractedMemory) && res.data.extractedMemory.length > 0) {
      setSimMemory((prev) => [...prev, ...res.data!.extractedMemory!]);
    }
    setSimTurnLoading(false);
  };

  const handleToggleSpeechMic = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    setIsListeningMic(true);
    const rec = new SpeechRec();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event: any) => {
      const spoken = event?.results?.[0]?.[0]?.transcript || "";
      if (spoken) setSimUtterance(spoken);
      setIsListeningMic(false);
    };
    rec.onerror = () => setIsListeningMic(false);
    rec.onend = () => setIsListeningMic(false);
    rec.start();
  };

  const handleHangUp = async () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setSimStep("wrapup");

    const res = await crmFetch<{ call?: { summary?: string } }>("/api/voice/simulate", {
      method: "POST",
      body: JSON.stringify({
        endCall: true,
        customerName: simCallerName,
        customerPhone: simCallerPhone,
        leadId: simLeadId || null,
        durationSeconds: simTimer,
        history: simTranscript,
        extractedMemory: simMemory,
      }),
    });

    setSimSummary(
      res.data?.call?.summary ||
        `Completed live AI Voice session with ${simCallerName} (${simTranscript.length} turns).`
    );
    setSimStep("ended");
  };

  const handleDeclineCall = () => {
    setIsSimulating(false);
    addCall({
      leadId: simLeadId || null,
      customerName: simCallerName || "Unknown Caller",
      customerPhone: simCallerPhone || "+49 30 000000",
      direction: "inbound",
      status: "missed",
      durationSeconds: 0,
      recordingUrl: "",
      transcription: [],
      summary: "Missed inbound call. Auto-SMS follow-up queued.",
      sentiment: "neutral",
      callMemory: [],
    });
  };

  const handleSaveSimulatedCall = async () => {
    await fetchCalls();
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
      <div className={cn(CONSOLE_BADGE_LIVE, "w-full justify-start rounded-xl px-4 py-3 text-xs leading-relaxed")}>
        <Info className="w-4 h-4 shrink-0" />
        <span>
          <strong className="font-semibold">Live Voice AI &amp; Twilio Webhook:</strong> Test live spoken AI turns with full Business Profile, Hybrid RAG &amp; CRM tools below, or point Twilio Voice to <code className="font-mono">/api/integrations/twilio/voice/webhook</code>.
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
                <div className="py-6 flex flex-col items-center justify-center space-y-5 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#19201d] border border-[#34d399]/35 flex items-center justify-center text-[#34d399]">
                    <PhoneIncoming className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-[#edf0ee]">Configure live AI Voice call</h4>
                    <p className="text-xs text-[#a1aaa4]">Grounded in your Business Profile, Hybrid RAG &amp; CRM dossier</p>
                  </div>

                  <div className="w-full max-w-md space-y-2.5 text-left">
                    <select
                      value={simLeadId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSimLeadId(id);
                        const match = leads.find((l) => l.id === id);
                        if (match) {
                          setSimCallerName(match.name || "Caller");
                          if (match.phone) setSimCallerPhone(match.phone);
                        }
                      }}
                      className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs cursor-pointer")}
                    >
                      <option value="">Anonymous inbound caller</option>
                      {leads.slice(0, 40).map((l) => (
                        <option key={l.id} value={l.id}>
                          CRM: {l.name || l.email || l.phone || l.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={simCallerName}
                        onChange={(e) => setSimCallerName(e.target.value)}
                        placeholder="Caller name"
                        className={cn(CONSOLE_INPUT, "px-3 py-2 text-xs")}
                      />
                      <input
                        type="text"
                        value={simCallerPhone}
                        onChange={(e) => setSimCallerPhone(e.target.value)}
                        placeholder="Caller phone"
                        className={cn(CONSOLE_INPUT, "px-3 py-2 text-xs font-mono")}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleDeclineCall}
                      className={CONSOLE_BTN_DANGER}
                    >
                      Log missed call
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
                      <span className="text-xs text-[#edf0ee] font-medium">Live AI Voice · {simCallerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSimSpeechAudio(!simSpeechAudio)}
                        className="text-[11px] text-[#a1aaa4] hover:text-[#edf0ee] cursor-pointer"
                      >
                        {simSpeechAudio ? "Audio TTS: On" : "Audio TTS: Off"}
                      </button>
                      <span className="text-xs font-mono text-[#a1aaa4] tabular-nums">
                        {formatTimer(simTimer)}
                      </span>
                    </div>
                  </div>

                  <div className={cn(CONSOLE_SUBCARD, "p-4 h-60 overflow-y-auto space-y-3 flex flex-col justify-end console-scroll")}>
                    {simTranscript.map((t, idx) => {
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
                            {isAgent ? "StarX AI Receptionist" : simCallerName}
                          </span>
                          {t.text}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSpeechMic}
                      disabled={isListeningMic}
                      title="Speak via browser microphone"
                      className={CONSOLE_BTN_SECONDARY}
                    >
                      <Mic className={cn("w-3.5 h-3.5", isListeningMic && "text-[#34d399]")} />
                    </button>
                    <input
                      type="text"
                      value={simUtterance}
                      onChange={(e) => setSimUtterance(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendVoiceTurn();
                      }}
                      placeholder="Speak or type caller utterance..."
                      className={cn(CONSOLE_INPUT, "flex-1 px-3 py-2 text-xs")}
                    />
                    <button
                      type="button"
                      onClick={handleSendVoiceTurn}
                      disabled={!simUtterance.trim() || simTurnLoading}
                      className={CONSOLE_BTN_PRIMARY}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleHangUp}
                    className={cn(CONSOLE_BTN_DANGER, "w-full py-2.5")}
                  >
                    <Phone className="w-3.5 h-3.5 rotate-[135deg]" />
                    <span>Hang up &amp; save call log</span>
                  </button>
                </div>
              )}

              {simStep === "wrapup" && (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <Brain className="w-8 h-8 text-[#34d399]" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-[#edf0ee]">Processing call wrap-up</h4>
                    <p className="text-xs text-[#727c75]">Saving transcript, sentiment tag, and CRM variables...</p>
                  </div>
                </div>
              )}

              {simStep === "ended" && (
                <div className="space-y-4">
                  <div className="bg-[#4cc38a]/10 border border-[#4cc38a]/25 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4cc38a] shrink-0" />
                    <div>
                      <h4 className="text-xs font-medium text-[#edf0ee]">Call persisted to workspace log</h4>
                      <p className="text-xs text-[#a1aaa4] mt-0.5">Summary &amp; extracted CRM signals synced cleanly.</p>
                    </div>
                  </div>

                  <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-1.5")}>
                    <span className="text-xs font-medium text-[#727c75] block">Summary</span>
                    <p className="text-xs text-[#edf0ee] leading-relaxed">{simSummary}</p>
                  </div>

                  {simMemory.length > 0 && (
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
                  )}

                  <button
                    type="button"
                    onClick={handleSaveSimulatedCall}
                    className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5")}
                  >
                    <span>Done &amp; close</span>
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
