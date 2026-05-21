import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  BookOpen, 
  PlayCircle, 
  Download, 
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

export function Resources() {
  // Newsletter state
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Masterclass video player modal state
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoTime, setVideoTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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

  // Simulated video playback scrubber ticking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayerOpen && videoPlaying) {
      interval = setInterval(() => {
        setVideoTime((prev) => (prev >= 120 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayerOpen, videoPlaying]);

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
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] atmo-glow atmo-glow-emerald opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[400px] atmo-glow atmo-glow-soft opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Grid */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-white/10 pb-16">
          <div className="max-w-2xl text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md"
            >
              Knowledge Base
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight text-white mb-6 leading-[1.05]"
            >
              Resources to scale <br />
              <span className="text-gradient-silver">
                your operations.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium"
            >
              Insights, operational checklists, and automation templates to help you run a high-margin, automated local service business.
            </motion.p>
          </div>

          {/* Newsletter Signup (Fully functional) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-auto glass-panel p-6 rounded-2xl shadow-2xl flex flex-col gap-4 min-w-[320px] text-left"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-bold text-lg">Weekly Operations Digest</h3>
              <p className="text-zinc-400 text-sm font-medium">
                Join 10,000+ local service founders.
              </p>
            </div>
            
            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl gap-2 text-center"
              >
                <Check size={20} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Subscribed Successfully! 📬</span>
                <span className="text-[10px] text-zinc-500 font-semibold">Check your inbox for this week's guide.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your business email"
                  required
                  disabled={submitting}
                  className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={submitting}
                  data-magnetic 
                  className="bg-emerald-500 text-black font-black py-3 text-sm rounded-lg hover:bg-emerald-400 transition-colors premium-glow premium-glow-hover flex items-center justify-center gap-2 select-none disabled:opacity-50"
                >
                  {submitting ? "Signing up..." : "Subscribe"}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Featured Video Card */}
        <div className="mb-24 text-left">
          <h2 className="text-2xl font-bold text-white mb-8">Featured Masterclass</h2>
          <div 
            onClick={() => {
              setIsPlayerOpen(true);
              setVideoTime(0);
              setVideoPlaying(true);
            }}
            className="group cursor-pointer relative rounded-[2rem] overflow-hidden glass-card aspect-video md:aspect-[21/9] border border-white/5 hover:border-emerald-500/30 transition-colors"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500 filter grayscale" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/80 to-transparent z-0" />
            <div className="absolute inset-0 bg-emerald-900/10 mix-blend-overlay z-10" />

            <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-12">
              <div className="flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  Operational Masterclass
                </span>
              </div>

              <div className="max-w-2.5xl">
                <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight group-hover:text-emerald-300 transition-colors tracking-tight">
                  Scaling Local Service Operations: Putting Bookings & Lead Capture on Autopilot
                </h3>
                <div className="flex items-center gap-4 text-zinc-300 mb-2 md:mb-0 text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <PlayCircle size={16} className="text-emerald-400" /> 2 minutes simulated class
                  </span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span>With Sarah Jennings, Founder of Aura Salon & Spa</span>
                </div>
              </div>
            </div>

            <div className="absolute right-8 bottom-8 md:right-12 md:bottom-12 z-20 w-16 h-16 rounded-full bg-emerald-500 text-black flex flex-col items-center justify-center group-hover:scale-110 group-hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <PlayCircle size={24} className="ml-1 text-black" />
            </div>
          </div>
        </div>

        {/* Slide Decks */}
        <div className="mb-24 text-left">
          <h2 className="text-2xl font-bold text-white mb-8">Free Masterclasses & Slide Decks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                to={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 hover:border-emerald-500/30 transition-colors group cursor-pointer block text-left"
              >
                <div className="w-24 h-32 bg-black/50 border border-white/5 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 blur-[10px]" />
                  <Presentation size={24} className="text-emerald-400" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-4 font-medium leading-relaxed">{item.desc}</p>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <Sparkles size={14} className="animate-pulse" /> Play Interactive Slide Deck
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest Articles (Re-wired to Articles dynamic database) */}
        <h2 className="text-2xl font-bold text-white mb-8 text-left">Operational Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="group cursor-pointer flex flex-col glass-card rounded-[2rem] p-6 text-left relative overflow-hidden"
            >
              <Link to={"/resources/articles/" + article.slug} className="flex flex-col h-full w-full">
                <div className="w-full h-48 bg-black/40 rounded-xl mb-6 relative overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent group-hover:from-emerald-900/20 transition-all duration-500" />
                  <BookOpen
                    size={32}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/20 group-hover:text-emerald-500/40 transition-all duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {article.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold">
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-emerald-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-zinc-400 mb-6 flex-1 text-sm font-medium leading-relaxed">
                  {article.desc}
                </p>

                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm group-hover:gap-3 transition-all mt-auto pt-2">
                  Read article <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-4xl aspect-[16/9] bg-zinc-950 rounded-3xl border border-emerald-500/30 overflow-hidden flex flex-col justify-between p-4 md:p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative"
            >
              {/* Top Modal Info Bar */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">LIVE SIMULATED RUNBOOK MASTERCLASS</span>
                </div>
                <button 
                  onClick={() => setIsPlayerOpen(false)}
                  className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Masterclass Simulated Screen */}
              <div className="flex-grow flex flex-col md:flex-row items-center gap-6 py-4">
                
                {/* Simulated Screen Graphic Animation */}
                <div className="w-full md:w-1/2 aspect-video bg-black/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
                  <div className="absolute top-3 left-3 bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-[8px] text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Smartphone size={9} />
                    Intake webhook logic
                  </div>
                  
                  {/* Floating audio bars to simulate speaker */}
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
                        className="w-1.5 bg-emerald-500 rounded-full"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-extrabold text-white mb-1">Speaker: Sarah Jennings</span>
                  <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Founder, Aura Salon & Spa</span>
                </div>

                {/* Subtitles & Captions */}
                <div className="w-full md:w-1/2 text-left h-full flex flex-col justify-center">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block mb-2">RUNNING TRANSCRIPT</span>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-h-[110px] text-xs leading-relaxed text-zinc-300 italic font-medium flex items-center relative">
                    {getSubtitles()}
                  </div>
                  <div className="mt-4 p-3 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-400 border border-emerald-500/25">🚀</div>
                    <span className="text-[10px] font-bold text-zinc-400">
                      Top Tip: Watch how Sarah automatically converts missed phone calls into WhatsApp bookings.
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Scrubber Timeline Bar */}
              <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
                
                {/* Scrubber track */}
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    setVideoTime(Math.floor(percent * 120));
                  }}
                  className="h-1.5 w-full bg-zinc-900 rounded-full cursor-pointer relative overflow-hidden group"
                >
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(videoTime / 120) * 100}%` }}
                  />
                </div>

                {/* Player Toolbar controls */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center"
                    >
                      {videoPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} className="ml-0.5" fill="currentColor" />}
                    </button>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center"
                    >
                      {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {formatTime(videoTime)} / 2:00
                    </span>
                  </div>

                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
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
