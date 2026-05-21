import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Calendar,
  Lock,
  User,
  Clock,
  CreditCard,
  MessageSquare,
  Volume2,
  ShieldCheck,
  Presentation
} from "lucide-react";

export function PresentationViewer() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Slide Deck 1 States (Checklist)
  const [checklist, setChecklist] = useState({
    dryRun: false,
    waiver: false,
    escalation: false,
    autopilot: false,
  });

  // Slide Deck 2 States (Templates sandbox)
  const [userName, setUserName] = useState("John");
  const [businessName, setBusinessName] = useState("Nexus Fitness");
  const [staffName, setStaffName] = useState("Sarah");
  const [googleLink, setGoogleLink] = useState("g.page/nexus-fitness/review");

  // Chat simulator animation trigger state
  const [chatKey, setChatKey] = useState(0);

  const viewerRef = useRef<HTMLDivElement>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Deck definitions
  const isReceptionistDeck = deckId === "ai-receptionist";
  const downloadPptxUrl = isReceptionistDeck ? "/ai-receptionist-setup.pptx" : "/whatsapp-booking-playbook.pptx";
  const downloadPdfUrl = isReceptionistDeck ? "/ai-receptionist-setup.pdf" : "/whatsapp-booking-playbook.pdf";
  const deckTitle = isReceptionistDeck 
    ? "24/7 AI Receptionist Setup Masterclass" 
    : "WhatsApp Booking Templates & Playbook";

  const totalSlides = 4;

  // Handle slide autoplay
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 6000);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  // Sync fullscreen change states
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const restartChatSim = () => {
    setChatKey((prev) => prev + 1);
  };

  // Checklist handler
  const handleCheckToggle = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isAllChecked = Object.values(checklist).every(Boolean);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Slide content render functions
  const renderSlideContent = () => {
    if (isReceptionistDeck) {
      // -----------------------------------------------------------------------
      // AI RECEPTIONIST DECK
      // -----------------------------------------------------------------------
      switch (currentSlide) {
        case 0: // Cover
          return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full p-4 md:p-8">
              <div className="md:col-span-6 flex justify-center">
                <div className="relative group rounded-2xl overflow-hidden border border-emerald-500/20 bg-black/40 p-2 shadow-2xl">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all" />
                  <img
                    src="/receptionist-cover.png"
                    alt="AI Receptionist Cover"
                    className="w-full max-w-md h-auto rounded-xl object-cover border border-white/5 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-black/85 text-[10px] font-bold text-emerald-400 backdrop-blur-md shadow-lg">
                    <Sparkles size={10} className="animate-pulse text-emerald-400" />
                    LIVE DEMO INTERACTIVE
                  </div>
                </div>
              </div>
              <div className="md:col-span-6 text-left flex flex-col justify-center">
                <span className="text-emerald-400 font-bold text-xs md:text-sm tracking-[0.2em] mb-3 uppercase flex items-center gap-2">
                  <Presentation size={14} /> StarX Flow Masterclass
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                  The Ultimate 24/7 <br />
                  <span className="text-gradient-green">AI Receptionist</span> <br />
                  Setup Masterclass
                </h1>
                <div className="w-16 h-1 bg-emerald-500 rounded-full mb-6" />
                <p className="text-zinc-400 font-medium text-sm md:text-base leading-relaxed mb-6">
                  A step-by-step operational blueprint to integrate your active booking rosters, synchronize double-booking protection rules, and calibrate custom voice FAQs.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-500">
                  <span className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">Duration: 4 Chapters</span>
                  <span className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">Format: Landscape Web Presentation</span>
                </div>
              </div>
            </div>
          );

        case 1: // Phase 1: Pre-requisites
          return (
            <div className="flex flex-col justify-center h-full p-4 md:p-8">
              <div className="mb-6 text-left">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">CHAPTER 01</span>
                <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">Phase 1: Pre-requisites & Calendar Hook</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { num: "01", title: "Dedicated Line", desc: "Secure a clean WhatsApp Business number. Back up chat logs if converting an active active business line." },
                  { num: "02", title: "Calendar Sync", desc: "Integrate Google Calendar, Outlook, Square POS, or Clover natively in the StarX Flow Dashboard." },
                  { num: "03", title: "Roster Definition", desc: "Add employees, custom hours, active days, service pricing, and appointment buffers." },
                  { num: "04", title: "Double-Booking Safe", desc: "Configure 2-way sync to lock slots instantly and prevent overlapping sessions." }
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card hover:border-emerald-500/30 transition-all p-5 rounded-2xl text-left bg-zinc-950/40 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-[20px]" />
                    <span className="text-3xl font-black text-emerald-500/80 mb-3 block">{step.num}</span>
                    <h4 className="text-white font-bold text-base mb-2">{step.title}</h4>
                    <p className="text-zinc-400 font-medium text-xs leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          );

        case 2: // Phase 2: Knowledge Base
          return (
            <div className="flex flex-col justify-center h-full p-4 md:p-8">
              <div className="mb-6 text-left">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">CHAPTER 02</span>
                <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">Phase 2: Building the AI Knowledge Base</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <User size={20} className="text-emerald-400" />,
                    title: "Identity & Voice",
                    points: ["Match business name & specific locations", "Calibrate brand tone (warm/professional)", "Adopt native localized greetings"]
                  },
                  {
                    icon: <Lock size={20} className="text-emerald-400" />,
                    title: "Core FAQ Mapping",
                    points: ["Cancellation, refund & rescheduling policies", "Parking & clinic building access details", "Service upgrades & add-ons pricing"]
                  },
                  {
                    icon: <Volume2 size={20} className="text-emerald-400" />,
                    title: "Live Staff Triage",
                    points: ["Define handoff escalations & triggers", "Keywords: 'emergency', 'complaint', 'manager'", "Live desktop audio notifications & alerts"]
                  }
                ].map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card bg-zinc-950/40 p-5 rounded-2xl border border-white/5 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          {faq.icon}
                        </div>
                        <h4 className="text-white font-bold text-base">{faq.title}</h4>
                      </div>
                      <div className="flex flex-col gap-3">
                        {faq.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2.5 text-xs text-zinc-400 font-medium">
                            <span className="text-emerald-400 mt-0.5">✔</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );

        case 3: // Phase 3: Launch & Checklist
          return (
            <div className="flex flex-col justify-center h-full p-4 md:p-8">
              <div className="mb-4 text-left">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">CHAPTER 03</span>
                <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">Phase 3: Integration Testing & Launch</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 text-left">
                  <div className="glass-card bg-zinc-950/50 p-6 rounded-2xl border border-white/5 relative">
                    {isAllChecked && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-20 text-center"
                      >
                        <CheckCircle size={52} className="text-emerald-400 animate-bounce" />
                        <h4 className="text-white font-black text-xl">System Ready for Autopilot! 🚀</h4>
                        <p className="text-zinc-400 text-xs max-w-sm">
                          Your checklists are cleared. Connect your live WhatsApp number and enable calendar syncing to handle incoming inquiries 24/7.
                        </p>
                        <button 
                          onClick={() => setChecklist({ dryRun: false, waiver: false, escalation: false, autopilot: false })}
                          className="mt-2 text-xs text-emerald-400 font-bold border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                        >
                          Reset Checklist
                        </button>
                      </motion.div>
                    )}
                    <h4 className="text-white font-extrabold text-base mb-4 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-400" /> Go-Live Playbook Checklist
                    </h4>
                    <div className="flex flex-col gap-3">
                      {[
                        { key: "dryRun" as const, title: "Dry-Run Testing", desc: "Send test messages on WhatsApp to book slots, ask pricing questions, and request roster changes." },
                        { key: "waiver" as const, title: "Waiver Integrations", desc: "Confirm that WhatsApp booking waivers or Stripe deposit request links display cleanly inside client chats." },
                        { key: "escalation" as const, title: "Staff Escalation Hook", desc: "Ensure active front-desk administrators can review live conversations in the StarX Dashboard Hub." },
                        { key: "autopilot" as const, title: "Autopilot Activation", desc: "Toggle the AI assistant online, update your website WhatsApp button, and let bookings scale." }
                      ].map((item) => (
                        <div 
                          key={item.key}
                          onClick={() => handleCheckToggle(item.key)}
                          className={`flex items-start gap-4 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                            checklist[item.key] 
                              ? "bg-emerald-500/5 border-emerald-500/30" 
                              : "bg-black/20 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors ${
                            checklist[item.key] 
                              ? "bg-emerald-500 border-emerald-500 text-black" 
                              : "border-zinc-700 bg-zinc-900"
                          }`}>
                            {checklist[item.key] && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div>
                            <span className={`text-sm font-bold block transition-colors ${checklist[item.key] ? "text-emerald-300" : "text-white"}`}>
                              {item.title}
                            </span>
                            <span className="text-xs text-zinc-400 leading-relaxed font-medium block mt-0.5">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-5">
                  <div className="glass-card bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl text-left">
                    <Sparkles size={24} className="text-emerald-400 mb-3" />
                    <h5 className="text-white font-bold text-base mb-2">Did You Know?</h5>
                    <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-4">
                      Merchants using the StarX Flow 4-step calendar checklist reduce onboarding setup timelines from several days to under 15 minutes.
                    </p>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block mb-1">PRO-TIP</span>
                      <p className="text-zinc-500 text-[11px] font-semibold leading-relaxed">
                        Toggle slides automatically by clicking the Play icon in the presentation utility bar below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
      }
    } else {
      // -----------------------------------------------------------------------
      // WHATSAPP TEMPLATES PLAYBOOK DECK
      // -----------------------------------------------------------------------
      switch (currentSlide) {
        case 0: // Cover
          return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full p-4 md:p-8">
              <div className="md:col-span-6 flex justify-center">
                <div className="relative group rounded-2xl overflow-hidden border border-emerald-500/20 bg-black/40 p-2 shadow-2xl">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all" />
                  <img
                    src="/playbook-cover.png"
                    alt="WhatsApp Playbook Cover"
                    className="w-full max-w-md h-auto rounded-xl object-cover border border-white/5 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-black/85 text-[10px] font-bold text-emerald-400 backdrop-blur-md shadow-lg">
                    <Sparkles size={10} className="animate-pulse text-emerald-400" />
                    CHATPLAY SIMULATOR
                  </div>
                </div>
              </div>
              <div className="md:col-span-6 text-left flex flex-col justify-center">
                <span className="text-emerald-400 font-bold text-xs md:text-sm tracking-[0.2em] mb-3 uppercase flex items-center gap-2">
                  <Presentation size={14} /> StarX Flow Playbook
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                  WhatsApp Booking <br />
                  <span className="text-gradient-green">Templates & Playbook</span>
                </h1>
                <div className="w-16 h-1 bg-emerald-500 rounded-full mb-6" />
                <p className="text-zinc-400 font-medium text-sm md:text-base leading-relaxed mb-6">
                  High-converting, copy-pasteable script slides, integrated Stripe deposit captures, and custom localized post-session check-out review campaigns.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-500">
                  <span className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">Chapters: 4 Chapters</span>
                  <span className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">Type: Live-Simulated Playbook</span>
                </div>
              </div>
            </div>
          );

        case 1: // Template 1: Salon & Spa Chat Simulator
          return (
            <div className="flex flex-col justify-center h-full p-4 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 text-left">
                <div>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">TEMPLATE 01</span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Salon & Spa Auto-Booking Stream</h2>
                </div>
                <button
                  onClick={restartChatSim}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg hover:bg-emerald-500/20 transition-all select-none w-fit"
                >
                  <RotateCcw size={12} /> Replay Conversation
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Phone Simulator */}
                <div className="lg:col-span-7 flex justify-center">
                  <div className="w-full max-w-xl h-[330px] rounded-2xl border border-white/10 bg-zinc-950 overflow-y-auto p-4 flex flex-col gap-3 relative scrollbar-none">
                    <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-white/5 py-1.5 px-2 -mx-4 -mt-4 mb-2 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 text-[9px] font-bold text-emerald-300">SF</div>
                        <div>
                          <span className="text-[11px] font-bold text-white block">StarX AI Assistant</span>
                          <span className="text-[9px] text-emerald-400 font-medium block -mt-1">online</span>
                        </div>
                      </div>
                      <Smartphone size={14} className="text-zinc-500 mr-2" />
                    </div>

                    <AnimatePresence mode="popLayout" key={chatKey}>
                      {/* Message 1 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="self-start max-w-[85%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3 text-left shadow-md"
                      >
                        <span className="text-[10px] font-bold text-rose-400 block mb-1">Client</span>
                        <p className="text-[11px] font-medium text-white">"Hey, do you have any openings for a massage tomorrow?"</p>
                      </motion.div>

                      {/* Message 2 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                        className="self-end max-w-[85%] bg-emerald-950/30 border border-emerald-500/20 rounded-2xl rounded-tr-none p-3 text-left shadow-md"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">AI Receptionist</span>
                        <p className="text-[11px] font-medium text-white whitespace-pre-line">
                          "Hi! We do have a few openings tomorrow. Here are our available slots:
                          - 10:30 AM (with David)
                          - 2:00 PM (with Emily)
                          - 4:30 PM (with David)

                          Which slot matches your schedule?"
                        </p>
                      </motion.div>

                      {/* Message 3 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 4.8 }}
                        className="self-start max-w-[85%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3 text-left shadow-md"
                      >
                        <span className="text-[10px] font-bold text-rose-400 block mb-1">Client</span>
                        <p className="text-[11px] font-medium text-white">"2:00 PM with Emily works great."</p>
                      </motion.div>

                      {/* Message 4 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 6.8 }}
                        className="self-end max-w-[85%] bg-emerald-950/30 border border-emerald-500/20 rounded-2xl rounded-tr-none p-3 text-left shadow-md mb-2"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">AI Receptionist</span>
                        <p className="text-[11px] font-medium text-white">
                          "Awesome! To secure your 60-Minute Therapeutic Massage with Emily at 2:00 PM tomorrow, please reply with your Full Name and Email Address."
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right side controls */}
                <div className="lg:col-span-5 text-left">
                  <div className="glass-card bg-zinc-950/40 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                      <MessageSquare size={16} className="text-emerald-400" /> Interactive Playbook
                    </h4>
                    <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-4">
                      Our system understands messy user schedules, pulls real-time roster openings from Square/Clover POS calendars, and routes customers seamlessly without manual phone calls.
                    </p>
                    <button
                      onClick={() => handleCopy(`"Hi! We do have a few openings tomorrow. Here are our available slots:\n- 10:30 AM (with David)\n- 2:00 PM (with Emily)\n- 4:30 PM (with David)\n\nWhich slot matches your schedule?"`, 0)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors select-none"
                    >
                      {copiedIndex === 0 ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedIndex === 0 ? "Template Copied!" : "Copy Active Script"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );

        case 2: // Template 2: Intake Waiver & Secure Deposit Form
          return (
            <div className="flex flex-col justify-center h-full p-4 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 text-left">
                <div>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">TEMPLATE 02</span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Deposit & Clinic Intro Waivers</h2>
                </div>
                <button
                  onClick={restartChatSim}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg hover:bg-emerald-500/20 transition-all select-none w-fit"
                >
                  <RotateCcw size={12} /> Replay Conversation
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Chat and Forms Simulator */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-full h-[330px] rounded-2xl border border-white/10 bg-zinc-950 overflow-y-auto p-4 flex flex-col gap-3 relative scrollbar-none">
                    <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-white/5 py-1.5 px-2 -mx-4 -mt-4 mb-2 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 text-[9px] font-bold text-emerald-300">SF</div>
                        <div>
                          <span className="text-[11px] font-bold text-white block">StarX Clinical Assistant</span>
                          <span className="text-[9px] text-emerald-400 font-medium block -mt-1">online</span>
                        </div>
                      </div>
                      <Smartphone size={14} className="text-zinc-500 mr-2" />
                    </div>

                    <AnimatePresence mode="popLayout" key={chatKey}>
                      {/* Message 1 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="self-start max-w-[85%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3 text-left shadow-md"
                      >
                        <span className="text-[10px] font-bold text-rose-400 block mb-1">Client</span>
                        <p className="text-[11px] font-medium text-white">"Can I book a Chiropractic Adjustment?"</p>
                      </motion.div>

                      {/* Message 2 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                        className="self-end max-w-[85%] bg-emerald-950/30 border border-emerald-500/20 rounded-2xl rounded-tr-none p-3 text-left shadow-md"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">AI Receptionist</span>
                        <p className="text-[11px] font-medium text-white">
                          "Hi! I can schedule that right now. We have open times this Tuesday at 9:00 AM and Wednesday at 3:00 PM. Which is better?"
                        </p>
                      </motion.div>

                      {/* Message 3 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 4.5 }}
                        className="self-start max-w-[85%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3 text-left shadow-md"
                      >
                        <span className="text-[10px] font-bold text-rose-400 block mb-1">Client</span>
                        <p className="text-[11px] font-medium text-white">"Tuesday at 9:00 AM."</p>
                      </motion.div>

                      {/* Message 4 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 6.2 }}
                        className="self-end max-w-[85%] bg-emerald-950/30 border border-emerald-500/20 rounded-2xl rounded-tr-none p-3 text-left shadow-md mb-2"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">AI Receptionist</span>
                        <p className="text-[11px] font-medium text-white">
                          "Great! To finalize this slot, first-time patients are required to fill out a brief intake waiver and secure the session with a $20 deposit. \n\nHere is your secure link: [Link]\n\nOnce done, your slot is locked!"
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Secure Checkout Form Panel */}
                <div className="lg:col-span-6 text-left">
                  <div className="glass-card bg-zinc-950/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[30px]" />
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <CreditCard size={16} className="text-emerald-400" /> Integrated Security & Deposit Form
                    </h4>
                    <div className="border border-white/10 rounded-xl p-3 bg-black/60 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                        <span className="text-zinc-400 font-semibold">Treatment Deposit</span>
                        <span className="text-emerald-400 font-bold font-mono">$20.00 USD</span>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-1">
                        <span className="text-[9px] uppercase font-bold text-zinc-500">Secure Stripe Payment</span>
                        <div className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400 flex justify-between">
                          <span>••••  ••••  ••••  4242</span>
                          <span className="font-mono">12 / 29</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert("Secure payment form preview. Live transactions process via Stripe Connect API.")}
                        className="bg-emerald-500 text-black font-black text-[11px] py-1.5 rounded hover:bg-emerald-400 transition-colors uppercase mt-1 w-full"
                      >
                        Submit Secure Booking
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopy(`"Great! To finalize this slot, first-time patients are required to fill out a brief intake waiver and secure the session with a $20 deposit. \n\nHere is your secure link: [Link]\n\nOnce done, your slot is locked!"`, 1)}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors select-none"
                    >
                      {copiedIndex === 1 ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedIndex === 1 ? "Template Copied!" : "Copy Active Script"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );

        case 3: // Template 3: Google Review Booster Sandbox
          return (
            <div className="flex flex-col justify-center h-full p-4 md:p-8">
              <div className="mb-4 text-left">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">TEMPLATE 03</span>
                <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">The Google Review Booster Campaign</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Sandbox Inputs */}
                <div className="lg:col-span-5 text-left">
                  <div className="glass-card bg-zinc-950/40 p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                    <h4 className="text-white font-extrabold text-sm mb-1 flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-400" /> Customize Review Campaign
                    </h4>
                    <div className="flex flex-col gap-2 text-xs">
                      <div>
                        <label className="text-zinc-500 font-semibold mb-1 block">Customer Name</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white w-full focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-500 font-semibold mb-1 block">Business Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white w-full focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-500 font-semibold mb-1 block">Staff Therapist/Stylist Name</label>
                        <input
                          type="text"
                          value={staffName}
                          onChange={(e) => setStaffName(e.target.value)}
                          className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white w-full focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-500 font-semibold mb-1 block">Google Review Link</label>
                        <input
                          type="text"
                          value={googleLink}
                          onChange={(e) => setGoogleLink(e.target.value)}
                          className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white w-full focus:outline-none focus:border-emerald-500/50 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sandbox Output Preview */}
                <div className="lg:col-span-7 text-left">
                  <div className="glass-card bg-zinc-950/40 p-5 rounded-2xl border border-white/5 relative">
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mb-3 inline-block">
                      AUTOMATED SMS OUTBOX PREVIEW
                    </span>
                    <div className="border border-white/10 rounded-2xl p-4 bg-black/60 font-medium min-h-[160px] text-sm text-zinc-300 leading-relaxed italic relative">
                      "Hey <span className="text-emerald-400 font-bold not-italic">{userName}</span>! Thank you for visiting us today at <span className="text-emerald-400 font-bold not-italic">{businessName}</span>. We hope you loved your session with <span className="text-emerald-400 font-bold not-italic">{staffName}</span>!
                      <br /><br />
                      If you have 10 seconds, it would mean the world to our local staff if you shared your experience on Google: <br />
                      <span className="text-cyan-400 underline font-mono not-italic break-all">{googleLink}</span>
                      <br /><br />
                      Have an amazing week!"
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                      <button
                        onClick={() => handleCopy(`"Hey ${userName}! Thank you for visiting us today at ${businessName}. We hope you loved your session with ${staffName}!\n\nIf you have 10 seconds, it would mean the world to our local staff if you shared your experience on Google: \n${googleLink}\n\nHave an amazing week!"`, 2)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-black font-black text-xs rounded-xl hover:bg-emerald-400 transition-colors select-none"
                      >
                        {copiedIndex === 2 ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                        {copiedIndex === 2 ? "Custom Script Copied!" : "Copy Customized Script"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
      }
    }
  };

  return (
    <div className="pt-32 lg:pt-36 pb-12 min-h-screen bg-black text-white flex flex-col justify-between" ref={viewerRef}>
      {/* Dynamic Slide Background mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] atmo-glow atmo-glow-emerald opacity-5" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[500px] atmo-glow atmo-glow-soft opacity-5" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full flex-grow flex flex-col justify-between relative z-10 gap-6">
        
        {/* TOP Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/resources")}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="Back to Resources"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {isReceptionistDeck ? "Setup Deck" : "Booking Playbook"}
              </span>
              <h2 className="text-base md:text-lg font-bold text-white">{deckTitle}</h2>
            </div>
          </div>

          {/* Download and Share tools */}
          <div className="flex items-center gap-2">
            <a 
              href={downloadPptxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Download size={13} />
              <span>View PPTX</span>
            </a>
            <a 
              href={downloadPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Download size={13} />
              <span>View PDF</span>
            </a>
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Main 16:9 Presentation Viewport */}
        <div className="w-full flex justify-center items-center flex-grow">
          <div className="w-full max-w-6xl aspect-[16/9] bg-zinc-950/60 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between p-6 md:p-8">
            
            {/* Ambient inner card shadows & overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            {/* Viewport content with sliding animations */}
            <div className="flex-grow flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full w-full"
                >
                  {renderSlideContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Embedded slide-footer */}
            <div className="flex justify-between items-center text-[10px] text-zinc-600 font-semibold border-t border-white/5 pt-4 mt-auto">
              <span>STARX FLOW © 2026. MERCHANT LICENSE EXCLUSIVE</span>
              <span className="font-bold text-zinc-500">CHAPTER {currentSlide + 1} / {totalSlides}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM Slideshow Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-950/40 border border-white/5 px-6 py-4 rounded-2xl">
          {/* Autoplay & Playback controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isPlaying 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
              title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
            </button>
            <button
              onClick={() => {
                setCurrentSlide(0);
                setIsPlaying(false);
              }}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              title="Restart Slideshow"
            >
              <RotateCcw size={14} />
            </button>
            <span className="text-xs font-semibold text-zinc-500">
              {isPlaying ? "Autoplay active (6s/slide)" : "Manual mode"}
            </span>
          </div>

          {/* Core Navigation controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs rounded-xl hover:text-white hover:border-zinc-700 transition-colors select-none"
            >
              <ArrowLeft size={13} />
              <span>Prev</span>
            </button>
            
            {/* Center interactive Progress Pills */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setIsPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx 
                      ? "w-8 bg-emerald-500" 
                      : "w-2 bg-zinc-800 hover:bg-zinc-700"
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs rounded-xl hover:text-white hover:border-zinc-700 transition-colors select-none"
            >
              <span>Next</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
