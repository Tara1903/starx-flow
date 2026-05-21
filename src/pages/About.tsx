import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Calendar, ShieldCheck, Zap } from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function About() {
  const openSignup = useUIStore((state) => state.openSignup);

  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black">
      {/* Background Gradients */}
      <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] atmo-glow atmo-glow-emerald opacity-20 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] atmo-glow atmo-glow-soft opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Intro Section */}
        <div className="max-w-4xl mx-auto text-center mb-28 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[2.8rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-tight text-white mb-10 leading-[1.05]">
              Built for modern <br />
              <span className="text-gradient-silver">
                service businesses.
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="glass-panel p-8 md:p-16 rounded-[2.5rem] shadow-2xl relative"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="space-y-6 text-lg md:text-xl text-zinc-300 leading-relaxed font-light text-left">
              <p className="font-bold text-white text-xl md:text-2xl text-center mb-6">
                "We believe service business owners should spend their time serving clients, not answering phone calls."
              </p>
              <p>
                StarX Flow was founded by local service business owners who faced the exact same problem you do: 
                hours wasted on manual scheduling, missed client inquiries, and the constant stress of managing front desk admin operations. 
              </p>
              <p>
                We built our platform to put your booking capture on autopilot, giving you a 24/7 WhatsApp AI receptionist 
                that integrates directly with your existing calendar, answers customer FAQs instantly, and helps you win back your day.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-16 mb-28 relative">
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              10M+
            </span>
            <span className="text-zinc-500 text-xs tracking-wider uppercase font-bold">
              Bookings Automated
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              8,500+
            </span>
            <span className="text-zinc-500 text-xs tracking-wider uppercase font-bold">
              Active Businesses
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              98.6%
            </span>
            <span className="text-zinc-500 text-xs tracking-wider uppercase font-bold">
              Response Accuracy
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <span className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">
              $40k+
            </span>
            <span className="text-zinc-500 text-xs tracking-wider uppercase font-bold">
              Saved in Admin Costs/Yr
            </span>
          </div>
        </div>

        {/* Founding Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
          <div className="order-2 lg:order-1 flex gap-4 h-[450px]">
            <div className="w-1/2 h-full pt-12">
              <img
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600"
                alt="Wellness and Yoga Studio"
                className="w-full h-full object-cover rounded-[2rem] opacity-70 border border-white/10 filter grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="w-1/2 h-full pb-12">
              <img
                src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600"
                alt="Clinic Treatment Session"
                className="w-full h-full object-cover rounded-[2rem] opacity-70 border border-white/10 filter grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6">
              Our Journey
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
              The silent leak in <span className="text-gradient-silver">hands-on businesses.</span>
            </h2>
            <div className="space-y-6 text-lg text-zinc-400 font-medium leading-relaxed">
              <p>
                Five years ago, we opened a small boutique reformer pilates and wellness studio. We loved teaching, working with clients, and helping people feel their best. But behind the scenes, we were drowning in admin tasks.
              </p>
              <p>
                While we were teaching hands-on classes or treating clients in therapy rooms, the phone was ringing off the hook. Unanswered WhatsApp inquiries piled up. By the time we replied 2 hours later, leads had already booked with a competitor.
              </p>
              <p>
                Existing booking systems required clients to click clunky external links, create logins, and navigate dense calendars. Many drop-offs occurred. We realized that in a world of instant messaging, a business's response speed is its greatest competitive edge.
              </p>
              <p>
                So, we built StarX Flow. An AI-powered operating system that turns WhatsApp into a 24/7 smart reservation channel and automatically syncs bookings with Google Calendar, Clover, or Square. No logins, no app downloads, no friction.
              </p>
            </div>
          </div>
        </div>

        {/* Merchant Trust and Values Section */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-4">
              Core Principles
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Designed for reliability and trust.
            </h2>
            <p className="text-zinc-400 text-lg mt-4 font-medium">
              Service business operations demand perfect scheduling and absolute dependability. Here is how we ensure StarX Flow delivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-[2rem] p-8 md:p-10 relative group transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Enterprise Security & Compliance</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                We handle client contact details, clinical bookings, and calendar databases with end-to-end encryption. Your information is private and strictly protected.
              </p>
            </div>

            <div className="glass-card rounded-[2rem] p-8 md:p-10 relative group transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Zero-Double-Booking Guarantee</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                Our smart calendar integration reads real-time availability from Google Calendar, Outlook, and Square, locking in slots instantly without overlaps.
              </p>
            </div>

            <div className="glass-card rounded-[2rem] p-8 md:p-10 relative group transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Ultra-Low Latency Booking</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                Our WhatsApp AI agent takes less than 2 seconds to respond and schedule, engaging leads at peak intent when they are most likely to convert.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-panel border border-emerald-500/20 rounded-[3rem] p-12 md:p-20 text-center shadow-[0_20px_80px_-20px_rgba(16,185,129,0.2)] bg-zinc-950/80 relative overflow-hidden"
        >
          <div className="absolute inset-0 atmo-glow atmo-glow-emerald opacity-30 mix-blend-screen" />
          <h2 className="text-[2.5rem] md:text-[4rem] font-bold text-white mb-8 tracking-tighter leading-tight relative z-10">
            Stop losing leads to unanswered phone calls.
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed relative z-10">
            Take minutes to set up, plug in your booking calendars, and let StarX Flow put your client bookings and WhatsApp customer care on autopilot.
          </p>
          <button
            onClick={openSignup}
            data-magnetic
            className="bg-emerald-500 text-black px-10 py-5 rounded-full text-lg font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 mx-auto premium-glow premium-glow-hover relative z-10 group"
          >
            Start Automating Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
