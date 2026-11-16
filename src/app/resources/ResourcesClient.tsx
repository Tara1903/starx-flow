"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  BookOpen, 
  PlayCircle, 
  Presentation, 
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Check,
  Smartphone,
  Play,
  Pause
} from "lucide-react";
import { useIsDocumentVisible } from "../../hooks/useMotionVisibility";

export function ResourcesClient() {
  // Newsletter state
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Masterclass video player modal state
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoTime, setVideoTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const isVisible = useIsDocumentVisible();

  const articles = [
    {
      slug: "gym-onboarding",
      title: "How Gyms Can Automate Member Onboarding & Retention",
      category: "Member Engagement",
      readTime: "6 min read",
      desc: "Learn step-by-step how to utilize WhatsApp AI workflows to onboard new gym members, capture waivers, and trigger trial-to-membership conversions automatically.",
    },
    {
      slug: "spa-no-shows",
      title: "Reducing Spa & Salon No-Shows by 90% via WhatsApp Chatbots",
      category: "Operations",
      readTime: "5 min read",
      desc: "Explore how automated deposit collection, double-confirmation WhatsApp threads, and simple click-to-reschedule options secure your daily calendar slots.",
    },
    {
      slug: "clinic-receptionist",
      title: "The Complete Guide to 24/7 AI Receptionists for Chiropractic & Dental Clinics",
      category: "Clinical Admin",
      readTime: "8 min read",
      desc: "Find out how private clinics safely automate triage questions, clinic address routing, and appointment scheduling without risking patient data privacy.",
    },
    {
      slug: "google-reviews-seo",
      title: "Google Reviews On Autopilot: How To Boost Your Local Service SEO",
      category: "Local SEO",
      readTime: "4 min read",
      desc: "Discover how text-to-review automated check-out follow-ups double your five-star ratings, pushing your salon or repair shop to the top of Google Maps.",
    },
    {
      slug: "scaling-failures",
      title: "Why Local Service Businesses Fail to Scale (And How to Fix It)",
      category: "Strategy",
      readTime: "7 min read",
      desc: "An analytical breakdown of lead leakages, missed phone calls, and manual admin tasks that limit business scaling and how front-desk automation resolves them.",
    },
    {
      slug: "calendar-integration",
      title: "Square & Clover Calendar Integration: A Guide to Roster Optimization",
      category: "Integrations",
      readTime: "5 min read",
      desc: "How to synchronize employee shifts, treatment rooms, and calendar availability across multiple booking tools to ensure zero double-bookings.",
    },
  ];

  // Simulated video playback scrubber ticking - paused when backgrounded
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayerOpen && videoPlaying && isVisible) {
      interval = setInterval(() => {
        setVideoTime((prev) => (prev >= 120 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayerOpen, videoPlaying, isVisible]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    // Simulate API webhook submission
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setEmail("");
    }, 1200);
  };

  // Simulated subtitles depending on timestamp
  const getSubtitles = () => {
    if (videoTime < 15) return "Sarah: \"Welcome everyone to our operational scale-up session. Today we are focusing on lead leakage...\"";
    if (videoTime < 35) return "Sarah: \"At Aura Salon & Spa, we noticed that 62% of calls were going to voicemail during high-traffic checkout hours...\"";
    if (videoTime < 60) return "Sarah: \"By syncing our booking calendar directly to StarX Flow, our automated assistant locked in 84 treatments in week one...\"";
    if (videoTime < 90) return "Sarah: \"This eliminated manual phone calls, answered cancellation FAQs, and recovered over $4,200 in slots...\"";
    return "Sarah: \"Setting this up takes under 15 minutes. Let's look at the active dashboard settings...\"";
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-28 min-h-screen relative overflow-hidden bg-[#020a07] text-[#f0f5ef]">
      {/* Background Emerald Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(40, 223, 160, 0.16) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20 border-b border-emerald-500/20 pb-16">
          <div className="max-w-2xl text-left">
            <div className="spatial-pill-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Knowledge Base &amp; Runbooks
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              Resources to scale <br />
              <span className="text-gradient-emerald">
                your operations.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal">
              Insights, operational checklists, and automation templates to help you run a high-margin, automated local service business.
            </p>
          </div>

          {/* Newsletter Signup */}
          <div className="w-full md:w-96 glass-panel p-6 sm:p-7 rounded-2xl flex flex-col gap-4 text-left border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(40,223,160,0.12)]">
            <div className="flex flex-col gap-1">
              <h3 className="font-editorial text-white font-bold text-xl">Weekly Operations Digest</h3>
              <p className="text-[#b8c9bd] text-xs font-normal">
                Join 10,000+ local service founders scaling on autopilot.
              </p>
            </div>
            
            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-6 glass-panel border-emerald-400/40 rounded-xl gap-2 text-center"
              >
                <Check size={20} className="text-emerald-300" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase">Subscribed Successfully! 📬</span>
                <span className="text-[11px] text-[#b8c9bd]">Check your inbox for this week&apos;s playbook.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your business email"
                  required
                  disabled={submitting}
                  className="bg-[#010804] border border-emerald-500/25 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30 transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={submitting}
                  className="spatial-btn-primary w-full py-3 text-sm"
                >
                  {submitting ? "Signing up..." : "Subscribe to Playbook"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Featured Video Card */}
        <div className="mb-24 text-left">
          <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-8">Featured Masterclass</h2>
          <div 
            onClick={() => {
              setIsPlayerOpen(true);
              setVideoTime(0);
              setVideoPlaying(true);
            }}
            className="group cursor-pointer relative rounded-[2rem] overflow-hidden glass-panel aspect-video md:aspect-[21/9] border-emerald-500/25 hover:border-emerald-400/50 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.1)]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500 filter grayscale" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#020a07] via-[#020a07]/80 to-transparent z-0" />
            <div className="absolute inset-0 bg-emerald-900/10 mix-blend-overlay z-10" />

            <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-12">
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 px-3 py-1.5 rounded-full">
                  Operational Masterclass
                </span>
              </div>

              <div className="max-w-2xl">
                <h3 className="font-editorial text-2xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-emerald-300 transition-colors tracking-tight">
                  Scaling Local Service Operations: Putting Bookings &amp; Lead Capture on Autopilot
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-[#b8c9bd] text-sm font-normal">
                  <span className="flex items-center gap-2">
                    <PlayCircle size={16} className="text-emerald-400" /> 2 minutes interactive simulation
                  </span>
                  <span className="w-1 h-1 bg-emerald-500/50 rounded-full" />
                  <span>With Sarah Jennings, Founder of Aura Salon &amp; Spa</span>
                </div>
              </div>
            </div>

            <div className="absolute right-8 bottom-8 md:right-12 md:bottom-12 z-20 w-16 h-16 rounded-full bg-gradient-to-r from-[#bcf8db] to-[#44b87d] text-[#03110c] flex items-center justify-center group-hover:scale-110 transition-all shadow-[0_0_30px_rgba(40,223,160,0.5)]">
              <PlayCircle size={28} className="text-[#03110c]" />
            </div>
          </div>
        </div>

        {/* Slide Decks */}
        <div className="mb-24 text-left">
          <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-8">Free Masterclasses &amp; Slide Decks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[
              {
                title: "The Ultimate 24/7 AI Receptionist Setup Masterclass",
                desc: "A premium 16:9 presentation guide covering prerequisites, Google/Outlook sync setups, tone-of-voice FAQs, and direct staff escalations.",
                link: "/resources/ai-receptionist"
              },
              {
                title: "WhatsApp Booking Templates & Playbook",
                desc: "High-converting, copy-pasteable script slides showing salon booking streams, clinic triage dialogue bubbles, and Google Review automated templates.",
                link: "/resources/whatsapp-playbook"
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel glass-panel-hover rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 border-emerald-500/20 group cursor-pointer block text-left"
              >
                <div className="w-24 h-32 bg-[#010804] border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 blur-[10px]" />
                  <Presentation size={24} className="text-emerald-400" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-editorial text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[#b8c9bd] mb-4 font-normal leading-relaxed">{item.desc}</p>
                  <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                    <Sparkles size={14} className="animate-pulse" /> Play Interactive Slide Deck
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest Articles */}
        <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-8 text-left">Operational Guides &amp; Runbooks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {articles.map((article, idx) => (
            <div
              key={idx}
              className="group cursor-pointer flex flex-col glass-panel glass-panel-hover rounded-[2rem] p-6 text-left relative overflow-hidden border-emerald-500/20"
            >
              <Link href={"/resources/articles/" + article.slug} className="flex flex-col h-full w-full">
                <div className="w-full h-44 bg-[#010804] rounded-xl mb-6 relative overflow-hidden border border-emerald-500/20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent group-hover:from-emerald-900/30 transition-all duration-500" />
                  <BookOpen
                    size={32}
                    className="text-emerald-500/30 group-hover:text-emerald-400/60 transition-all duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-400/30">
                    {article.category}
                  </span>
                  <span className="text-xs font-mono text-[#b8c9bd]">
                    {article.readTime}
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-bold text-white mb-3 leading-snug group-hover:text-emerald-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-[#b8c9bd] mb-6 flex-1 text-sm font-normal leading-relaxed">
                  {article.desc}
                </p>

                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm group-hover:gap-3 transition-all mt-auto pt-2">
                  Read article <ArrowRight size={14} />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Masterclass Video Player Modal */}
      <AnimatePresence>
        {isPlayerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-4xl h-[95vh] md:h-auto md:aspect-[16/9] bg-[#020a07] rounded-[2rem] md:rounded-3xl border border-emerald-400/30 overflow-hidden flex flex-col justify-between p-4 md:p-6 shadow-[0_0_50px_rgba(40,223,160,0.25)] relative overflow-y-auto"
            >
              {/* Top Modal Info Bar */}
              <div className="flex justify-between items-center pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase">LIVE SIMULATED RUNBOOK MASTERCLASS</span>
                </div>
                <button 
                  onClick={() => setIsPlayerOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#010804] border border-emerald-500/30 flex items-center justify-center text-[#b8c9bd] hover:text-white hover:border-emerald-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Masterclass Simulated Screen */}
              <div className="flex-grow flex flex-col md:flex-row items-center gap-6 py-4">
                
                {/* Simulated Screen Graphic Animation */}
                <div className="w-full md:w-1/2 aspect-video min-h-[200px] md:min-h-0 bg-[#010804] border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
                  <div className="absolute top-3 left-3 bg-[#061a12] border border-emerald-500/25 rounded px-2 py-0.5 text-[8px] text-emerald-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <Smartphone size={9} />
                    Intake webhook logic
                  </div>
                  
                  {/* Floating audio bars */}
                  <div className="flex items-end gap-1 mb-4 h-12">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                      <motion.div 
                        key={bar}
                        animate={{ 
                          height: videoPlaying ? [12, 40, 16, 32, 12][bar % 5] : 12 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1 + (bar * 0.1),
                          ease: "easeInOut"
                        }}
                        className="w-1.5 bg-emerald-400 rounded-full"
                      />
                    ))}
                  </div>

                  <span className="font-editorial text-sm font-bold text-white mb-1">Speaker: Sarah Jennings</span>
                  <span className="text-[10px] text-emerald-300 font-mono uppercase tracking-wider">Founder, Aura Salon &amp; Spa</span>
                </div>

                {/* Subtitles & Captions */}
                <div className="w-full md:w-1/2 text-left h-full flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-300 tracking-widest block mb-2">RUNNING TRANSCRIPT</span>
                  <div className="bg-[#010804] border border-emerald-500/20 rounded-2xl p-4 min-h-[110px] text-xs leading-relaxed text-[#b8c9bd] italic font-normal flex items-center relative">
                    {getSubtitles()}
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-400/25 rounded-xl flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-300 border border-emerald-400/30">🚀</div>
                    <span className="text-[11px] text-[#b8c9bd] font-normal">
                      Top Tip: Watch how Sarah automatically converts missed phone calls into WhatsApp bookings.
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Scrubber Timeline Bar */}
              <div className="border-t border-emerald-500/20 pt-3 flex flex-col gap-2">
                
                {/* Scrubber track */}
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    setVideoTime(Math.floor(percent * 120));
                  }}
                  className="h-2 w-full bg-[#010804] rounded-full cursor-pointer relative overflow-hidden group hover:h-2.5 transition-all duration-200"
                >
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300 relative shadow-[0_0_8px_#34d399]"
                    style={{ width: `${(videoTime / 120) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(40,223,160,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* Chapter Markers */}
                  <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-black/60 hover:bg-white/50 transition-colors" title="Intro" />
                  <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-black/60 hover:bg-white/50 transition-colors" title="The Strategy" />
                  <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-black/60 hover:bg-white/50 transition-colors" title="Dashboard Demo" />
                </div>

                {/* Player Toolbar controls */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400 hover:text-black transition-all flex items-center justify-center shadow-[0_0_15px_rgba(40,223,160,0.2)]"
                    >
                      {videoPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} className="ml-1" fill="currentColor" />}
                    </button>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-10 h-10 rounded-full bg-[#010804] border border-emerald-500/20 text-[#b8c9bd] hover:text-white flex items-center justify-center transition-colors"
                    >
                      {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                      </span>
                      <span className="text-xs font-mono text-[#b8c9bd]">
                        {formatTime(videoTime)} <span className="text-[#b8c9bd]/50">/ 2:00</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#b8c9bd]/70 uppercase tracking-widest hidden sm:block">
                    Simulated operations player
                  </span>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
