import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Dumbbell, Activity, Scissors, Heart, GraduationCap,
  MessageSquare as ChatIcon
} from "lucide-react";

type IndustryKey = "gym" | "clinic" | "salon" | "spa" | "coaching";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

interface IndustryContent {
  name: string;
  tagline: string;
  icon: React.ReactNode;
  themeColor: string;
  accentBg: string;
  accentText: string;
  chat: ChatMessage[];
  stats: {
    label1: string; val1: string; pct1: string;
    label2: string; val2: string; pct2: string;
    label3: string; val3: string; pct3: string;
  };
  transactions: {
    client: string; service: string; value: string; status: string;
  }[];
  primaryMetric: {
    label: string; value: string; change: string;
  };
}

const industries: Record<IndustryKey, IndustryContent> = {
  gym: {
    name: "Gyms & Fitness",
    tagline: "Convert trial passes into recurring memberships via automated WhatsApp follow-ups.",
    icon: <Dumbbell className="w-4 h-4" />,
    themeColor: "rgba(16, 185, 129, 0.2)",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-400",
    primaryMetric: { label: "Active Members", value: "1,420", change: "+15.3% this month" },
    stats: {
      label1: "Trial Passes Issued", val1: "284", pct1: "+24.2%",
      label2: "Class Check-Ins", val2: "1,140", pct2: "+18.6%",
      label3: "Booking Rate", val3: "82%", pct3: "Optimal"
    },
    chat: [
      { sender: "user", text: "Hi, do you have any free slots for the Pilates Reformer class tomorrow morning?", time: "9:30 AM" },
      { sender: "ai", text: "Hi! Yes, we have 2 slots left at 8:00 AM and 1 slot at 10:30 AM with Coach David. Would you like me to book you in for the 8:00 AM session?", time: "9:30 AM" },
      { sender: "user", text: "Yes, 8 AM please!", time: "9:31 AM" },
      { sender: "ai", text: "Perfect, booked! You are all set for Pilates Reformer at 8:00 AM tomorrow. I've sent a calendar confirmation to your email. See you at Ironwood Fitness!", time: "9:31 AM" }
    ],
    transactions: [
      { client: "Sarah J.", service: "Monthly Gym Pass", value: "$120.00", status: "Active" },
      { client: "Michael K.", service: "1-on-1 Personal Training", value: "$85.00", status: "Booked" },
      { client: "Emma T.", service: "Pilates Guest Pass", value: "$30.00", status: "Claimed" }
    ]
  },
  clinic: {
    name: "Medical & Clinics",
    tagline: "Fill open calendar slots and intake digital forms before patients arrive.",
    icon: <Activity className="w-4 h-4" />,
    themeColor: "rgba(59, 130, 246, 0.2)",
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-400",
    primaryMetric: { label: "Patients Served", value: "852", change: "+8.9% this month" },
    stats: {
      label1: "Appts Confirmed", val1: "342", pct1: "+14.5%",
      label2: "Intake Forms Done", val2: "94%", pct2: "+6.2%",
      label3: "No-Show Rate", val3: "1.2%", pct3: "-92% drop"
    },
    chat: [
      { sender: "user", text: "Hello, I'd like to book an appointment with Dr. Marcus Vance for my back pain.", time: "11:15 AM" },
      { sender: "ai", text: "Hello! Dr. Vance has openings this Thursday at 2:00 PM and 4:30 PM. Would either of those work for you?", time: "11:15 AM" },
      { sender: "user", text: "Thursday at 2 PM is perfect.", time: "11:16 AM" },
      { sender: "ai", text: "Excellent! I've scheduled your Chiropractic Adjustment with Dr. Vance for Thursday at 2:00 PM. Please complete this 1-minute digital intake form before arriving: flow.cc/apex-intake.", time: "11:16 AM" }
    ],
    transactions: [
      { client: "David L.", service: "Chiropractic Adjustment", value: "$95.00", status: "Confirmed" },
      { client: "Clara M.", service: "Initial Consultation", value: "$150.00", status: "Paid" },
      { client: "James T.", service: "Physiotherapy Session", value: "$110.00", status: "Confirmed" }
    ]
  },
  salon: {
    name: "Hair & Salons",
    tagline: "Let clients book appointments 24/7. Auto-send follow-ups for styling renewals.",
    icon: <Scissors className="w-4 h-4" />,
    themeColor: "rgba(244, 63, 94, 0.2)",
    accentBg: "bg-rose-500/10",
    accentText: "text-rose-400",
    primaryMetric: { label: "Styling Bookings", value: "412", change: "+22.4% this month" },
    stats: {
      label1: "New Clients Captured", val1: "118", pct1: "+31.2%",
      label2: "Avg Ticket Value", val2: "$165", pct2: "+12.8%",
      label3: "Repeat Visits", val3: "78%", pct3: "Excellent"
    },
    chat: [
      { sender: "user", text: "Hey, can I book a balayage hair styling session with Sarah this weekend?", time: "2:05 PM" },
      { sender: "ai", text: "Hi! Sarah is available this Saturday at 11:00 AM and Sunday at 1:30 PM. Which day do you prefer?", time: "2:05 PM" },
      { sender: "user", text: "Saturday at 11.", time: "2:06 PM" },
      { sender: "ai", text: "Awesome! You are booked for Balayage Styling with Sarah on Saturday, May 23rd at 11:00 AM. A booking confirmation has been added to your calendar!", time: "2:06 PM" }
    ],
    transactions: [
      { client: "Aria G.", service: "Balayage Styling", value: "$160.00", status: "Confirmed" },
      { client: "Chloe V.", service: "Haircut & Blowout", value: "$85.00", status: "Completed" },
      { client: "Sophie N.", service: "Keratin Treatment", value: "$250.00", status: "Confirmed" }
    ]
  },
  spa: {
    name: "Spas & Wellness",
    tagline: "Book massage packages and coordinate staff schedules automatically over WhatsApp.",
    icon: <Heart className="w-4 h-4" />,
    themeColor: "rgba(139, 92, 246, 0.2)",
    accentBg: "bg-violet-500/10",
    accentText: "text-violet-400",
    primaryMetric: { label: "Wellness Packages", value: "284", change: "+18.1% this month" },
    stats: {
      label1: "Massages Scheduled", val1: "192", pct1: "+15.2%",
      label2: "Add-on Packages", val2: "43%", pct2: "+8.5%",
      label3: "Staff Efficiency", val3: "91%", pct3: "Optimal"
    },
    chat: [
      { sender: "user", text: "Hi, do you have any couples massage packages available today?", time: "3:40 PM" },
      { sender: "ai", text: "Hi! Yes, we have a couples Swedish Massage package open at 4:30 PM today. Would you like me to reserve it for you?", time: "3:40 PM" },
      { sender: "user", text: "Yes, let's book it.", time: "3:41 PM" },
      { sender: "ai", text: "All set! Your couples massage is confirmed for today at 4:30 PM at our Downtown oasis. A calendar invite is on its way. Relax and enjoy!", time: "3:41 PM" }
    ],
    transactions: [
      { client: "James C.", service: "Couples Massage (90m)", value: "$240.00", status: "Confirmed" },
      { client: "Nora S.", service: "Deep Tissue & Facial", value: "$180.00", status: "Paid" },
      { client: "Mark R.", service: "Hot Stone Therapy", value: "$145.00", status: "Completed" }
    ]
  },
  coaching: {
    name: "Coaching & Tutors",
    tagline: "Automate class bookings, private consultation links, and send lesson updates.",
    icon: <GraduationCap className="w-4 h-4" />,
    themeColor: "rgba(245, 158, 11, 0.2)",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-400",
    primaryMetric: { label: "Active Students", value: "310", change: "+12.1% this month" },
    stats: {
      label1: "Sessions Booked", val1: "480", pct1: "+20.4%",
      label2: "Intake Retention", val2: "92%", pct2: "+4.1%",
      label3: "Review Rating", val3: "4.9/5", pct3: "Highly Rated"
    },
    chat: [
      { sender: "user", text: "Hey, I need to schedule my 1-on-1 strategy coaching session.", time: "10:00 AM" },
      { sender: "ai", text: "Hi there! I can help with that. Coach David has open slots tomorrow at 10:00 AM and 3:00 PM. Please let me know what works.", time: "10:00 AM" },
      { sender: "user", text: "10 AM tomorrow.", time: "10:01 AM" },
      { sender: "ai", text: "Done! Your Strategy Coaching session is locked in for tomorrow at 10:00 AM. Zoom link and calendar invite sent. Get ready to scale!", time: "10:01 AM" }
    ],
    transactions: [
      { client: "Liam B.", service: "Monthly Retainer (Coaching)", value: "$450.00", status: "Active" },
      { client: "Sophia G.", service: "1-on-1 Scaling Session", value: "$150.00", status: "Confirmed" },
      { client: "Jackson D.", service: "Startup Strategy Review", value: "$200.00", status: "Completed" }
    ]
  }
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex space-x-1 p-2.5 bg-[#262d31] w-12 rounded-lg rounded-tl-none justify-center items-center h-8 shadow-sm"
  >
    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-[typing-dot_1.4s_infinite_0s]"></span>
    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-[typing-dot_1.4s_infinite_0.2s]"></span>
    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-[typing-dot_1.4s_infinite_0.4s]"></span>
  </motion.div>
);

export function Demo() {
  const [activeTab, setActiveTab] = useState<IndustryKey>("gym");
  const [displayedChat, setDisplayedChat] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const current = industries[activeTab];

  useEffect(() => {
    setDisplayedChat([]);
    setIsTyping(false);
    
    let isCancelled = false;
    
    const animateChat = async () => {
      for (let i = 0; i < current.chat.length; i++) {
        if (isCancelled) break;
        
        const msg = current.chat[i];
        if (msg.sender === "ai") {
          setIsTyping(true);
          await new Promise(r => setTimeout(r, 800));
          if (isCancelled) break;
          setIsTyping(false);
        } else {
          await new Promise(r => setTimeout(r, 400));
        }
        
        if (!isCancelled) {
          setDisplayedChat(prev => [...prev, msg]);
        }
      }
    };
    
    animateChat();
    
    return () => {
      isCancelled = true;
    };
  }, [activeTab, current.chat]);

  return (
    <section id="solutions" className="py-24 lg:py-32 px-6 relative z-10 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Ambient background glow shifting color */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-40 transition-colors duration-1000"
          style={{ background: `radial-gradient(circle, ${current.themeColor} 0%, transparent 70%)` }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 lg:mb-16 max-w-3xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-zinc-300 uppercase mb-6 backdrop-blur-md">
            <Sparkles size={10} className="text-zinc-300" />
            Interactive Simulation
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-white leading-tight">
            How StarX Flow <br />
            <span className="text-gradient-silver">Works in Your Industry</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium">
            Experience how our 24/7 WhatsApp AI receptionist handles client inquiries, schedules bookings, and syncs your dashboard instantly.
          </p>
        </motion.div>

        {/* Premium Horizontal Pill Selector */}
        <div className="w-full flex justify-center mb-12 relative z-20">
          <div className="flex gap-2 p-1.5 glass-panel rounded-full overflow-x-auto no-scrollbar">
            {(Object.keys(industries) as IndustryKey[]).map((key) => {
              const ind = industries[key];
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all duration-300 tracking-wider uppercase shrink-0 ${
                    isActive 
                      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {ind.icon}
                  <span>{ind.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-full h-auto min-h-[600px] relative z-10"
        >
          <div className="w-full h-full glass-panel rounded-[40px] p-6 md:p-10 relative shadow-2xl">
            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row gap-10 items-stretch">
              
              {/* Left Panel: Glass Surface System */}
              <div className="flex-1 flex flex-col gap-6 justify-between order-2 lg:order-1">
                
                <div className="space-y-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase ${current.accentBg} ${current.accentText} transition-colors duration-500`}>
                    {current.name} Vertical
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Autopilot client intake & scheduling
                  </h3>
                  <p className="text-zinc-400 text-base leading-relaxed max-w-lg font-medium">
                    {current.tagline}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
                    <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-widest">
                      {current.primaryMetric.label}
                    </p>
                    <p className="text-4xl font-bold text-white tracking-tight mb-2">
                      {current.primaryMetric.value}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${current.accentBg} ${current.accentText} inline-block transition-colors duration-500`}>
                      {current.primaryMetric.change}
                    </span>
                  </div>

                  <div className="glass-card p-6 rounded-3xl flex flex-col justify-center gap-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{current.stats.label1}</span>
                      <span className="text-sm text-white font-bold">{current.stats.val1}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{current.stats.label2}</span>
                      <span className="text-sm text-white font-bold">{current.stats.val2}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{current.stats.label3}</span>
                      <span className={`text-sm font-bold ${current.accentText} transition-colors duration-500`}>{current.stats.val3}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current ${current.accentText} transition-colors duration-500`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 bg-current ${current.accentText} transition-colors duration-500`}></span>
                    </span>
                    <p className="text-xs text-zinc-500 font-extrabold uppercase tracking-widest">
                      Live CRM Feed
                    </p>
                  </div>
                  <div className="space-y-3">
                    {current.transactions.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-2xl border border-white/5">
                        <div>
                          <p className="text-sm text-white font-bold">{t.client}</p>
                          <p className="text-[10px] text-zinc-400 font-medium">{t.service}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-white">{t.value}</span>
                          <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${current.accentBg} ${current.accentText} transition-colors duration-500`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Panel: Interactive WhatsApp Phone */}
              <div className="flex-1 flex justify-center items-center order-1 lg:order-2">
                <div className="w-[320px] h-[620px] bg-black border-[12px] border-zinc-900 rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10">
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3">
                    <div className="w-2 h-2 rounded-full opacity-60 animate-pulse transition-colors duration-500" style={{ backgroundColor: current.themeColor }} />
                    <div className="w-3 h-3 rounded-full border-2 border-zinc-800" />
                  </div>

                  {/* WhatsApp UI */}
                  <div className="flex-1 flex flex-col bg-[#0b141a] pt-14 text-white relative">
                    <div className="bg-[#075e54] px-5 py-3.5 flex items-center gap-3 shadow-md z-10 relative">
                      <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-bold text-white text-sm">
                        AI
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {current.name} Assistant
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </h4>
                        <p className="text-[10px] text-emerald-200 font-medium">Online Receptionist</p>
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[size:100px_auto] opacity-95 flex flex-col relative z-0">
                      <AnimatePresence mode="popLayout">
                        {displayedChat.map((msg, idx) => {
                          const isUser = msg.sender === "user";
                          return (
                            <motion.div
                              key={`${activeTab}-${idx}`}
                              initial={{ opacity: 0, scale: 0.9, y: 10, originX: isUser ? 1 : 0 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-sm relative ${
                                  isUser 
                                    ? "bg-[#056162] text-white rounded-tr-none" 
                                    : "bg-[#262d31] text-zinc-100 rounded-tl-none"
                                }`}
                              >
                                <p className="font-medium">{msg.text}</p>
                                <span className="block text-[9px] text-zinc-400 text-right mt-1.5 font-bold tracking-tighter">
                                  {msg.time}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                        {isTyping && (
                          <motion.div
                            key={`typing-${activeTab}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            className="flex justify-start"
                          >
                            <TypingIndicator />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="bg-[#1e2428] px-4 py-3.5 flex items-center gap-3 border-t border-zinc-800 z-10 relative">
                      <div className="flex-1 bg-[#2a2f32] rounded-full px-5 py-2.5 text-[12px] text-zinc-400 font-medium">
                        Type a message...
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-lg">
                        <ChatIcon size={14} className="rotate-90 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
