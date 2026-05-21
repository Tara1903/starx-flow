import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, PhoneMissed, Star } from "lucide-react";
import { useUIStore } from "../store/uiStore";

// Type definitions for the chat simulation
interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
}

const chatScript: ChatMessage[] = [
  { id: "1", sender: "user", text: "Hi, do you have any slots for a deep tissue massage tomorrow?" },
  { id: "2", sender: "ai", text: "Hi! We have openings at 10:30 AM and 2:00 PM with therapist Sarah. Want me to book one?" },
  { id: "3", sender: "user", text: "2 PM please!" },
  { id: "4", sender: "ai", text: "Done! Booked for 2:00 PM tomorrow. Calendar invite sent. See you then! ✓" },
];

const floatingToasts = [
  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: "Appointment confirmed — Sarah K., Deep Tissue, 2:00 PM" },
  { icon: <PhoneMissed className="w-4 h-4 text-emerald-400" />, text: "Missed call recovered — Lead captured via WhatsApp" },
  { icon: <Star className="w-4 h-4 text-emerald-400" />, text: "Google review request sent — 4.9 avg rating" },
];

const TypingIndicator = () => (
  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center h-[44px]">
    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0s]" />
    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0.2s]" />
    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[typing-dot_1.4s_infinite_0.4s]" />
  </div>
);

export function Hero() {
  const openSignup = useUIStore((state) => state.openSignup);
  
  // Chat Simulation State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Toast Simulation State
  const [activeToastIndex, setActiveToastIndex] = useState<number | null>(null);

  // Loop Chat Simulation infinitely without getting stuck
  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout;

    const runScript = async () => {
      if (!active) return;
      
      // Reset state for new loop iteration
      setMessages([]);
      setIsTyping(false);

      const step = async (index: number) => {
        if (!active) return;
        
        if (index >= chatScript.length) {
          // Completed all messages, wait 6 seconds and restart simulation loop
          timer = setTimeout(() => {
            if (active) runScript();
          }, 6000);
          return;
        }

        const msg = chatScript[index];
        
        if (msg.sender === "ai") {
          // Show typing loader
          setIsTyping(true);
          // Let the AI "type" for 1600ms
          await new Promise((resolve) => {
            timer = setTimeout(resolve, 1600);
          });
          if (!active) return;
          setIsTyping(false);
          setMessages((prev) => [...prev, msg]);
        } else {
          // User pause before typing
          await new Promise((resolve) => {
            timer = setTimeout(resolve, 1000);
          });
          if (!active) return;
          setMessages((prev) => [...prev, msg]);
        }

        // Wait brief moment before starting next turn
        await new Promise((resolve) => {
          timer = setTimeout(resolve, 1200);
        });
        if (!active) return;
        step(index + 1);
      };

      // Start from first message (index 0)
      step(0);
    };

    runScript();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  // Loop Floating Toast Simulation endlessly
  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout;

    const cycleToasts = () => {
      if (!active) return;
      
      const showToast = (index: number) => {
        if (!active) return;
        setActiveToastIndex(index);

        // Hide current toast after 3500ms
        timer = setTimeout(() => {
          if (!active) return;
          setActiveToastIndex(null);

          // Delay before presenting the next toast
          timer = setTimeout(() => {
            if (!active) return;
            showToast((index + 1) % floatingToasts.length);
          }, 3000);
        }, 3500);
      };

      // Initial toast offset when landing on page
      timer = setTimeout(() => {
        if (active) showToast(0);
      }, 4000);
    };

    cycleToasts();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] pt-32 pb-20 flex items-center justify-center overflow-hidden">
      
      {/* ATMOSPHERIC BACKGROUND LAYER */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="atmo-glow atmo-glow-emerald w-[900px] h-[900px] opacity-35 translate-x-[25%] translate-y-[15%]" />
        <div className="atmo-glow atmo-glow-soft w-[700px] h-[700px] opacity-15 -translate-x-[35%] -translate-y-[20%]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">
          
          {/* LEFT CONTENT (50%) */}
          <motion.div 
            className="w-full lg:w-[50%] flex flex-col items-start text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full surface-primary text-[11px] font-bold tracking-widest text-zinc-300 uppercase mb-8 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Operating System for Local Businesses
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.05] mb-6">
              Your business, <br />
              <span className="text-zinc-500">running itself.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-zinc-400 font-medium leading-relaxed max-w-lg mb-10">
              Automate bookings, capture leads, and reply to every customer instantly — 24/7 on WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={openSignup}
                data-magnetic
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-full transition-all premium-glow-hover shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a 
                href="#solutions"
                data-magnetic
                className="w-full sm:w-auto px-8 py-4 surface-primary hover:bg-white/5 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
              >
                See It Live <span className="text-zinc-500">↓</span>
              </a>
            </div>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="Avatar" className="w-full h-full object-cover opacity-80" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-zinc-500">
                Trusted by <span className="text-white">3,000+</span> service businesses
              </p>
            </div>
          </motion.div>

          {/* RIGHT CONTENT (50%) - SYMMETRICAL & ALIGNED GLASS PANEL CARD */}
          <div className="w-full lg:w-[50%] relative flex justify-center lg:justify-end">
            
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />
            
            <motion.div 
              className="glass-panel w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl relative z-10 border-t border-white/20"
              initial={{ opacity: 0, scale: 0.95, rotateY: 5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{ transformPerspective: 1000 }}
            >
              {/* Header */}
              <div className="px-5 py-4 bg-white/5 border-b border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-inner">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Receptionist
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </h3>
                  <p className="text-[11px] font-medium text-zinc-400">Online • Operating normally</p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="p-5 h-[380px] overflow-y-auto no-scrollbar flex flex-col gap-4 bg-black/20">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[85%] px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                          msg.sender === "user" 
                            ? "bg-zinc-800 text-white rounded-2xl rounded-tr-sm" 
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-50 rounded-2xl rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      key="typing-indicator"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                      className="flex justify-start"
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Auto scroll anchor */}
                <div className="h-4" />
              </div>

              {/* Input Area (Visual Only) */}
              <div className="px-5 py-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                <div className="h-10 rounded-full bg-white/5 border border-white/10 flex items-center px-4">
                  <span className="text-xs text-zinc-500 font-medium">Message AI Receptionist...</span>
                </div>
              </div>
            </motion.div>

            {/* FLOATING TOAST SYSTEM - Positioned beautifully and symmetrically under the card */}
            <div className="absolute -bottom-8 right-0 z-20 pointer-events-none w-full max-w-[420px]">
              <AnimatePresence>
                {activeToastIndex !== null && (
                  <motion.div
                    key={activeToastIndex}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl border border-white/10 bg-black/60 backdrop-blur-md"
                  >
                    <div className="bg-emerald-500/20 p-1.5 rounded-full shrink-0 border border-emerald-500/30">
                      {floatingToasts[activeToastIndex].icon}
                    </div>
                    <p className="text-[11px] font-bold text-white leading-tight">
                      {floatingToasts[activeToastIndex].text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
