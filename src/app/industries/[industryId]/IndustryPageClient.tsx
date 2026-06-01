"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, MessageSquare, PhoneMissed, CalendarCheck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { industryData } from './industryData';
import { useUIStore } from '@/store/uiStore';
import { GlassPanel } from '@/components/ui/GlassPanel';

export function IndustryPageClient() {
  const { industryId } = useParams<{ industryId: string }>();
  const openSignup = useUIStore((state) => state.openSignup);

  if (!industryId || !industryData[industryId]) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  const data = industryData[industryId];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      <Navbar />

      <main id="main-content" className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              Autonomous Front Desk
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {data.heroTitle}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              {data.heroSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-24 max-w-6xl mx-auto">
            {/* Pain Points */}
            <GlassPanel tier="panel" className="p-10 rounded-3xl border-red-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-red-400">
                    <PhoneMissed className="w-5 h-5" />
                  </span>
                  The Problem
                </h2>
                <ul className="space-y-6">
                  {data.painPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-zinc-400 text-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-2.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassPanel>

            {/* AI Solutions */}
            <GlassPanel tier="hero" className="p-10 rounded-3xl border-emerald-500/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  The Solution
                </h2>
                <ul className="space-y-6">
                  {data.aiSolutions.map((sol, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-zinc-200 text-lg">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassPanel>
          </div>

          {/* Testimonial & CTA */}
          <div className="max-w-4xl mx-auto">
            <GlassPanel tier="mist" className="p-12 rounded-[2rem] text-center">
              <div className="mb-10">
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-6 h-6 text-emerald-400 fill-emerald-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-2xl font-medium text-white mb-6 leading-relaxed">
                  "{data.testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-bold text-lg">{data.testimonial.author}</div>
                  <div className="text-emerald-400">{data.testimonial.role}</div>
                </div>
              </div>

              <div className="pt-10 border-t border-white/10">
                <h3 className="text-2xl font-bold mb-6">Ready to put your {data.name.toLowerCase()} front desk on autopilot?</h3>
                <button
                  onClick={openSignup}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </GlassPanel>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
