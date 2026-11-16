"use client";

import React, { useState } from "react";
import { Dumbbell, Activity, Scissors, Heart, GraduationCap, Send, RotateCcw, Check, Sparkles, Calculator, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

type IndustryKey = "clinic" | "gym" | "salon" | "spa" | "coaching";

interface IndustryData {
  name: string;
  category: string;
  icon: React.ReactNode;
  metric: string;
  metricLabel: string;
  chat: { sender: "user" | "ai"; text: string; time: string }[];
}

export function LusionInteractiveDemoShowcase() {
  const { openSignup } = useUIStore();

  // Industry Triage State
  const [activeIndustry, setActiveIndustry] = useState<IndustryKey>("clinic");

  // Sarah Demo State
  const [selectedSlot, setSelectedSlot] = useState<string>("Tue, 2:00 PM");
  const [customMsg, setCustomMsg] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    { sender: "user", text: "Hi, do you have any openings for a 60-min treatment tomorrow afternoon?", time: "2:14 PM" },
    { sender: "ai", text: "Hi Sarah! Marcus Vance has openings tomorrow at 10:30 AM and 2:00 PM. Would you like me to reserve 2:00 PM for you?", time: "2:14 PM" },
  ]);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ROI Calculator State
  const [sessionVal, setSessionVal] = useState<number>(150);
  const [missedEnquiries, setMissedEnquiries] = useState<number>(32);

  // ROI Calculations: 45% conversion of missed leads * average ticket value
  const recoveredMonthly = Math.round(missedEnquiries * 0.45 * sessionVal);
  // 15 mins saved per automated booking enquiry
  const hoursSaved = Math.round((missedEnquiries * 2.8 * 15) / 60);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const industries: Record<IndustryKey, IndustryData> = {
    clinic: {
      name: "Medical & Health Clinics",
      category: "Healthcare",
      icon: <Activity className="w-4 h-4" />,
      metric: "-92% Drop",
      metricLabel: "In Patient No-Shows via WhatsApp Reminders",
      chat: [
        { sender: "user", text: "Hello, I'd like to book an appointment with Dr. Marcus Vance for my back pain.", time: "11:15 AM" },
        { sender: "ai", text: "Hello! Dr. Vance has openings this Thursday at 2:00 PM and 4:30 PM. Would either of those work for you?", time: "11:15 AM" },
        { sender: "user", text: "Thursday at 2 PM is perfect.", time: "11:16 AM" },
        { sender: "ai", text: "Excellent! I've scheduled your Chiropractic Adjustment with Dr. Vance for Thursday at 2:00 PM. Please complete this 1-minute digital intake form: flow.cc/apex-intake.", time: "11:16 AM" },
      ],
    },
    gym: {
      name: "Gyms & Fitness Studios",
      category: "Fitness",
      icon: <Dumbbell className="w-4 h-4" />,
      metric: "82% Optimal",
      metricLabel: "Trial Pass to Recurring Membership Conversion",
      chat: [
        { sender: "user", text: "Hi, do you have any free slots for the Pilates Reformer class tomorrow morning?", time: "9:30 AM" },
        { sender: "ai", text: "Hi! Yes, we have 2 slots left at 8:00 AM and 1 slot at 10:30 AM with Coach David. Would you like me to book you in for the 8:00 AM session?", time: "9:30 AM" },
        { sender: "user", text: "Yes, 8 AM please!", time: "9:31 AM" },
        { sender: "ai", text: "Perfect, booked! You are all set for Pilates Reformer at 8:00 AM tomorrow. Calendar invite dispatched. See you at Ironwood!", time: "9:31 AM" },
      ],
    },
    salon: {
      name: "Hair & Beauty Salons",
      category: "Beauty",
      icon: <Scissors className="w-4 h-4" />,
      metric: "+34% Re-bookings",
      metricLabel: "Automated Styling Renewal Reminders",
      chat: [
        { sender: "user", text: "Hey! Can I book a Balayage and haircut with Elena this Friday?", time: "4:00 PM" },
        { sender: "ai", text: "Hey Clara! Elena has an opening Friday at 1:30 PM (estimated 2.5 hours). Would you like to reserve that chair?", time: "4:00 PM" },
        { sender: "user", text: "Yes please, Friday 1:30 PM works!", time: "4:01 PM" },
        { sender: "ai", text: "Done! Balayage with Elena locked for Friday at 1:30 PM. A $30 deposit link has been sent to confirm: flow.cc/pay-chair.", time: "4:01 PM" },
      ],
    },
    spa: {
      name: "Day Spas & Wellness",
      category: "Wellness",
      icon: <Heart className="w-4 h-4" />,
      metric: "100% Upfront",
      metricLabel: "Direct Deposit Capture with Zero Chargebacks",
      chat: [
        { sender: "user", text: "Hi! Do you have a couples hot stone massage available Saturday evening?", time: "7:20 PM" },
        { sender: "ai", text: "Good evening! We have a private couples suite open Saturday at 6:00 PM with master therapists. Would you like to lock this session?", time: "7:20 PM" },
        { sender: "user", text: "Yes, locking Saturday 6 PM please.", time: "7:21 PM" },
        { sender: "ai", text: "Reserved! Saturday 6:00 PM couples hot stone suite confirmed. Intake waiver and directions sent to your WhatsApp.", time: "7:21 PM" },
      ],
    },
    coaching: {
      name: "Coaching & Consultations",
      category: "Professional",
      icon: <GraduationCap className="w-4 h-4" />,
      metric: "1.4s Reply",
      metricLabel: "Capturing High-Intent Discovery Calls",
      chat: [
        { sender: "user", text: "I'd like to schedule a 30-min discovery call to discuss executive coaching.", time: "1:05 PM" },
        { sender: "ai", text: "Welcome! Coach Michael has priority slots on Zoom tomorrow at 11:00 AM and 3:30 PM EST. Which time fits your schedule?", time: "1:05 PM" },
        { sender: "user", text: "3:30 PM EST works best.", time: "1:06 PM" },
        { sender: "ai", text: "Confirmed! Discovery Call scheduled for tomorrow at 3:30 PM EST. Zoom link and prep questionnaire dispatched to your calendar.", time: "1:06 PM" },
      ],
    },
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    const userText = customMsg.trim();
    setCustomMsg("");

    const newHistory = [
      ...chatHistory,
      { sender: "user" as const, text: userText, time: "Just now" },
    ];
    setChatHistory(newHistory);

    // AI automated reply after 500ms
    setTimeout(() => {
      setChatHistory([
        ...newHistory,
        {
          sender: "ai" as const,
          text: `Done! Confirmed for ${selectedSlot}. Google Calendar invite sent & intake waiver dispatched. See you then! ✓`,
          time: "Just now",
        },
      ]);
      setBookingConfirmed(true);
      showToast(`Appointment confirmed for ${selectedSlot}! Synced to Google Calendar.`);
    }, 600);
  };

  const handleResetDemo = () => {
    setChatHistory([
      { sender: "user", text: "Hi, do you have any openings for a 60-min treatment tomorrow afternoon?", time: "2:14 PM" },
      { sender: "ai", text: "Hi Sarah! Marcus Vance has openings tomorrow at 10:30 AM and 2:00 PM. Would you like me to reserve 2:00 PM for you?", time: "2:14 PM" },
    ]);
    setSelectedSlot("Tue, 2:00 PM");
    setBookingConfirmed(false);
    showToast("Interactive demo reset to initial state.");
  };

  return (
    <section id="demo-showcase" className="relative py-24 sm:py-32 border-t border-emerald-500/10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 starx-glass-panel px-5 py-3 text-xs sm:text-sm text-emerald-200 border-emerald-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Living Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 space-y-24">
        {/* ======================================================= */}
        {/* SHOWCASE PART 1: LIVE INTERACTIVE INDUSTRY TRIAGE       */}
        {/* ======================================================= */}
        <div>
          <div className="max-w-3xl space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-px bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
                Interactive Triage Simulator
              </span>
            </div>
            <h2 className="font-lusion-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Test Real Client Conversations <br />
              <span className="text-gradient-emerald font-normal">
                Across Different Industries.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/70 font-normal leading-relaxed">
              Select an industry below to see how StarX Flow tailors responses, handles service nuances, and locks conflict-free appointments in real time.
            </p>
          </div>

          {/* Industry Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {(Object.keys(industries) as IndustryKey[]).map((key) => {
              const item = industries[key];
              const isActive = activeIndustry === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveIndustry(key);
                    showToast(`Loaded ${item.name} conversational profile.`);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(52,211,153,0.35)] scale-105"
                      : "bg-emerald-950/40 text-emerald-200/80 hover:text-white hover:bg-emerald-900/40 border border-emerald-500/20"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Simulated WhatsApp Industry Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center starx-glass-panel p-6 sm:p-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    {industries[activeIndustry].icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {industries[activeIndustry].name}
                    </h3>
                    <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      StarX AI Concierge Active • 1.4s Reply Speed
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-400/10 text-emerald-300 border border-emerald-500/20">
                  {industries[activeIndustry].category}
                </span>
              </div>

              {/* Chat Thread */}
              <div className="bg-[#040e09]/90 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 max-h-[360px] overflow-y-auto">
                {industries[activeIndustry].chat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-emerald-500/25 text-emerald-100 rounded-tr-xs border border-emerald-400/30"
                          : "bg-emerald-950/80 text-emerald-100 rounded-tl-xs border border-emerald-500/20"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300/50 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Key Industry Metric Readout */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:border-l lg:border-emerald-500/15 lg:pl-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  VERIFIED INDUSTRY BENCHMARK
                </span>
                <div className="font-lusion-display text-4xl sm:text-5xl font-light text-white text-gradient-gold-emerald mt-2">
                  {industries[activeIndustry].metric}
                </div>
                <p className="text-sm text-emerald-100/75 mt-2">
                  {industries[activeIndustry].metricLabel}
                </p>
              </div>

              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/15 space-y-2 text-xs">
                <div className="font-semibold text-white">Why This Works:</div>
                <p className="text-emerald-100/70 leading-relaxed">
                  Trained specifically on industry booking vocabulary, cancellation policies, staff skill levels, and digital waivers. No generic AI hallucinations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openSignup()}
                className="starx-btn-primary w-full justify-center text-sm"
              >
                <span>Deploy for {industries[activeIndustry].category}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* SHOWCASE PART 2: LIVE SARAH DEMO BOOKING FLOW           */}
        {/* ======================================================= */}
        <div className="pt-8">
          <div className="max-w-3xl space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-px bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
                Interactive Booking Simulation
              </span>
            </div>
            <h2 className="font-lusion-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Experience the Full Booking Loop.
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/70 font-normal leading-relaxed">
              Choose a slot or type a custom request into the live WhatsApp field below to watch instant appointment locking in action.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Chat Simulator */}
            <div className="lg:col-span-7 starx-glass-panel p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center font-bold text-emerald-300 text-xs">
                    SX
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Sarah Jenkins Demo Session</div>
                    <div className="text-[11px] text-emerald-400 font-mono">Live Interactive Demo</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetDemo}
                  title="Reset Demo Flow"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-300/70 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-950/40 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Chat Thread */}
              <div className="bg-[#030d08]/90 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3 min-h-[220px] max-h-[300px] overflow-y-auto">
                {chatHistory.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.sender === "user"
                          ? "bg-emerald-500/25 text-emerald-100 rounded-tr-xs border border-emerald-400/30"
                          : "bg-emerald-950/80 text-emerald-100 rounded-tl-xs border border-emerald-500/20"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300/50 mt-1 px-1">
                      {m.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Slot Quick Selection */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono text-emerald-300/80">Available Priority Openings:</div>
                <div className="flex flex-wrap gap-2">
                  {["Tue, 10:00 AM", "Tue, 2:00 PM", "Tue, 4:00 PM"].map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          showToast(`Slot chosen: ${slot}`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-400 text-black font-semibold shadow-[0_0_12px_rgba(74,222,128,0.5)]"
                            : "bg-emerald-950/50 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-900/40"
                        }`}
                      >
                        {isSelected ? `✓ ${slot}` : slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input Form */}
              <form onSubmit={handleSendCustomMessage} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder={`Type 'Book ${selectedSlot}' or a custom question...`}
                  className="flex-1 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="starx-btn-primary !py-2.5 !px-4 text-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Booking Status Card */}
            <div className="lg:col-span-5 starx-glass-panel p-6 sm:p-8 space-y-6">
              <div className="border-b border-emerald-500/15 pb-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                  REAL-TIME ACTION CONFIRMATION
                </span>
                <h4 className="text-xl font-semibold text-white mt-1">
                  Appointment Synchronized
                </h4>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between py-2 border-b border-emerald-500/10">
                  <span className="text-emerald-200/60">CLIENT NAME:</span>
                  <span className="text-white font-semibold">Sarah Jenkins</span>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-500/10">
                  <span className="text-emerald-200/60">SELECTED SERVICE:</span>
                  <span className="text-white">Deep Tissue (60m)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-500/10">
                  <span className="text-emerald-200/60">ASSIGNED PROVIDER:</span>
                  <span className="text-emerald-300">Dr. Marcus Vance</span>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-500/10">
                  <span className="text-emerald-200/60">CONFIRMED TIME:</span>
                  <span className="text-emerald-400 font-bold">{selectedSlot}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-emerald-200/60">CALENDAR STATUS:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Locked on Google Cal
                  </span>
                </div>
              </div>

              <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/15 text-[11px] text-emerald-100/70">
                <strong>Audit Note:</strong> Zero human intervention required. Confirmation message dispatched via WhatsApp with calendar ICS payload.
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* SHOWCASE PART 3: INTERACTIVE ROI RECOVERY CALCULATOR     */}
        {/* ======================================================= */}
        <div className="pt-8">
          <div className="max-w-3xl space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-px bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
                Revenue Leakage Engine
              </span>
            </div>
            <h2 className="font-lusion-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Calculate Your Monthly Recovered Revenue.
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/70 font-normal leading-relaxed">
              Adjust your average appointment ticket size and estimated missed monthly enquiries to see the direct financial impact of 24/7 autonomous WhatsApp triage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center starx-glass-panel p-6 sm:p-10">
            {/* Sliders Control */}
            <div className="lg:col-span-7 space-y-8">
              {/* Slider 1: Session Value */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-white">
                  <span>Average Service / Treatment Ticket:</span>
                  <span className="text-xl font-mono text-emerald-300">${sessionVal}</span>
                </div>
                <input
                  id="roi-session-val"
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={sessionVal}
                  onChange={(e) => setSessionVal(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-emerald-950/60 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-emerald-200/50">
                  <span>$50</span>
                  <span>$250</span>
                  <span>$500+</span>
                </div>
              </div>

              {/* Slider 2: Missed Calls/Enquiries */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-white">
                  <span>Estimated After-Hours / Missed Enquiries Monthly:</span>
                  <span className="text-xl font-mono text-emerald-300">{missedEnquiries} enquiries</span>
                </div>
                <input
                  id="roi-missed-calls"
                  type="range"
                  min="10"
                  max="100"
                  step="2"
                  value={missedEnquiries}
                  onChange={(e) => setMissedEnquiries(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-emerald-950/60 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-emerald-200/50">
                  <span>10 calls/mo</span>
                  <span>50 calls/mo</span>
                  <span>100 calls/mo</span>
                </div>
              </div>
            </div>

            {/* Readout Results */}
            <div className="lg:col-span-5 bg-emerald-950/40 rounded-2xl p-6 sm:p-8 border border-emerald-500/20 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  ESTIMATED REVENUE RECOVERY
                </span>
                <div
                  id="roi-monthly-recovery"
                  className="font-lusion-display text-4xl sm:text-5xl font-light text-white text-gradient-gold-emerald mt-2"
                >
                  ${recoveredMonthly.toLocaleString()}<span className="text-base text-emerald-300/80 font-normal"> / mo</span>
                </div>
                <p className="text-xs text-emerald-100/70 mt-1">
                  Captured directly by converting after-hours WhatsApp interest in under 2 seconds.
                </p>
              </div>

              <div className="pt-4 border-t border-emerald-500/15">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  ADMINISTRATIVE TIME SAVED
                </span>
                <div
                  id="roi-hours-saved"
                  className="text-2xl sm:text-3xl font-semibold text-white mt-1"
                >
                  {hoursSaved} hours / mo
                </div>
                <p className="text-xs text-emerald-100/70 mt-1">
                  Eliminating back-and-forth phone tag and manual calendar updates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openSignup()}
                className="starx-btn-primary w-full justify-center text-sm"
              >
                <span>Capture This Revenue with StarX</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
