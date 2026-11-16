"use client";

import React from "react";
import { ArrowRight, Calendar, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export function AboutClient() {
  const openSignup = useUIStore((state) => state.openSignup);

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
        {/* Intro Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24 pt-4 md:pt-8">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Our Mission &amp; Purpose
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.08]">
            Built for modern <br />
            <span className="text-gradient-emerald">
              hands-on service businesses.
            </span>
          </h1>

          <div className="glass-panel p-8 md:p-14 rounded-[2.5rem] relative border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(40,223,160,0.12)]">
            <div className="space-y-6 text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal text-left">
              <p className="font-editorial font-bold text-white text-2xl md:text-3xl text-center mb-6 leading-snug">
                &ldquo;We believe service business owners should spend their time serving clients, not answering repetitive phone calls.&rdquo;
              </p>
              <p>
                StarX Flow was founded by local service operators who faced the exact same problem you do: 
                hours wasted on manual scheduling, missed client inquiries during peak sessions, and the constant stress of managing front desk admin operations.
              </p>
              <p>
                We built our platform to put your booking capture on autopilot, giving you a 24/7 WhatsApp AI receptionist 
                that integrates directly with your existing calendars, answers customer FAQs instantly, and helps you win back your day.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Operating Standards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 mb-24">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center border-emerald-500/20">
            <span className="text-4xl md:text-5xl font-black text-white mb-2 font-mono">
              0%
            </span>
            <span className="text-[#b8c9bd] text-xs tracking-wider uppercase font-mono font-semibold">
              Booking Commissions
            </span>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center border-emerald-500/20">
            <span className="text-4xl md:text-5xl font-black text-white mb-2 font-mono">
              100%
            </span>
            <span className="text-[#b8c9bd] text-xs tracking-wider uppercase font-mono font-semibold">
              Client Data Ownership
            </span>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center border-emerald-500/20">
            <span className="text-4xl md:text-5xl font-black text-white mb-2 font-mono">
              2-Way
            </span>
            <span className="text-[#b8c9bd] text-xs tracking-wider uppercase font-mono font-semibold">
              Live Calendar Sync
            </span>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center border-emerald-400/30 shadow-[0_0_20px_rgba(40,223,160,0.12)]">
            <span className="text-4xl md:text-5xl font-black text-emerald-300 mb-2 font-mono">
              TLS 1.3
            </span>
            <span className="text-emerald-200/80 text-xs tracking-wider uppercase font-mono font-semibold">
              Encrypted Transport &amp; RLS
            </span>
          </div>
        </div>

        {/* Founding Story Section */}
        <div className="glass-panel rounded-[3rem] p-8 md:p-14 mb-24 border-emerald-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 lg:order-1 flex gap-4 h-[350px] sm:h-[450px]">
              <div className="w-1/2 h-full pt-8 md:pt-12">
                <img
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600"
                  alt="Wellness and Yoga Studio"
                  width={600}
                  height={400}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-[2rem] opacity-75 border border-emerald-400/25 filter grayscale hover:grayscale-0 transition-all duration-500 shadow-xl"
                />
              </div>
              <div className="w-1/2 h-full pb-8 md:pb-12">
                <img
                  src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600"
                  alt="Clinic Treatment Session"
                  width={600}
                  height={400}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-[2rem] opacity-75 border border-emerald-400/25 filter grayscale hover:grayscale-0 transition-all duration-500 shadow-xl"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-xs font-mono tracking-wider text-emerald-300 uppercase mb-6">
                Our Origin
              </div>
              <h2 className="font-editorial text-3xl lg:text-5xl font-bold text-white mb-6 md:mb-8 tracking-tight leading-tight">
                The silent leak in <span className="text-gradient-emerald">hands-on businesses.</span>
              </h2>
              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-[#b8c9bd] font-normal leading-relaxed">
                <p>
                  Five years ago, we opened a small boutique reformer pilates and wellness studio. We loved teaching, working with clients, and helping people feel their best. But behind the scenes, we were drowning in administrative overhead.
                </p>
                <p>
                  While we were teaching hands-on classes or treating clients in therapy rooms, the phone was ringing off the hook. Unanswered WhatsApp inquiries piled up. By the time we replied 2 hours later, leads had already booked with a competitor.
                </p>
                <p>
                  Existing booking systems required clients to click clunky external links, create logins, and navigate dense calendars. Many drop-offs occurred. We realized that in a world of instant messaging, a business&apos;s response speed is its greatest competitive edge.
                </p>
                <p>
                  So, we built StarX Flow. An AI-powered operating system that turns WhatsApp into a 24/7 smart reservation channel and automatically syncs bookings with Google Calendar or Microsoft Outlook. No logins, no app downloads, zero friction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Merchant Trust and Values Section */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="spatial-pill-badge mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Core Principles
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl font-bold text-white tracking-tight">
              Designed for reliability and trust.
            </h2>
            <p className="text-[#b8c9bd] text-lg mt-4 font-normal">
              Service business operations demand perfect scheduling and absolute dependability. Here is how StarX Flow delivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <div className="glass-panel glass-panel-hover rounded-[2rem] p-8 md:p-10 border-emerald-500/20 group">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-300 mb-6 border border-emerald-400/30 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-editorial text-xl font-bold text-white mb-4">Enterprise Security &amp; Tenant Isolation</h3>
              <p className="text-[#b8c9bd] text-sm leading-relaxed font-normal">
                Client records and appointments are isolated via PostgreSQL Row Level Security (RLS), transmitted over TLS 1.3, and encrypted at rest with AES-256.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover rounded-[2rem] p-8 md:p-10 border-emerald-500/20 group">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-300 mb-6 border border-emerald-400/30 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                <Calendar size={24} />
              </div>
              <h3 className="font-editorial text-xl font-bold text-white mb-4">Engineered Concurrency Locking</h3>
              <p className="text-[#b8c9bd] text-sm leading-relaxed font-normal">
                Two-way calendar synchronization with Google Calendar and Microsoft Outlook, backed by PostgreSQL exclusion constraint locks to eliminate double-bookings.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover rounded-[2rem] p-8 md:p-10 border-emerald-500/20 group">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-300 mb-6 border border-emerald-400/30 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                <Zap size={24} />
              </div>
              <h3 className="font-editorial text-xl font-bold text-white mb-4">Real-Time Conversational Booking</h3>
              <p className="text-[#b8c9bd] text-sm leading-relaxed font-normal">
                Our conversational receptionist engages WhatsApp and Instagram inquiries instantly at peak intent, qualifying leads and locking in slots in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-panel max-w-5xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center mb-8 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)]">
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Stop losing leads to unanswered phone calls.
          </h2>
          <p className="text-lg text-[#b8c9bd] max-w-2xl mx-auto mb-9 font-normal leading-relaxed">
            Take minutes to set up, plug in your booking calendars, and let StarX Flow put your client bookings and WhatsApp customer care on autopilot.
          </p>
          <button
            type="button"
            onClick={openSignup}
            className="spatial-btn-primary"
          >
            Start Automating Free
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
