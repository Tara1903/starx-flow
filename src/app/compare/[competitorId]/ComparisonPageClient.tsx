"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Check, X, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { comparisonData } from './comparisonData';
import { useUIStore } from '@/store/uiStore';

export function ComparisonPageClient() {
  const { competitorId } = useParams<{ competitorId: string }>();
  const openSignup = useUIStore((state) => state.openSignup);

  if (!competitorId || !comparisonData[competitorId]) {
    if (typeof window !== "undefined") window.location.href = "/"; return null;
  }

  const data = comparisonData[competitorId];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      
      <Navbar />

      <main id="main-content" aria-label="Main content" className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              <Sparkles className="w-4 h-4" />
              Comparison Guide
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              StarX Flow vs {data.competitor}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              {data.heroText}
            </p>
          </div>

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-8 mb-24 max-w-5xl mx-auto">
            {/* StarX Flow */}
            <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  Why Choose StarX Flow
                </h2>
                <ul className="space-y-4">
                  {data.starxPros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-300">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Competitor */}
            <div className="glass-panel p-8 rounded-3xl border border-red-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <X className="w-5 h-5" />
                  </span>
                  The Problem with {data.competitor}
                </h2>
                <ul className="space-y-4">
                  {data.competitorCons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-400">
                      <X className="w-5 h-5 text-red-400/70 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-10">Feature Comparison</h2>
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
              <div className="grid grid-cols-3 bg-white/5 p-6 border-b border-white/10">
                <div className="font-semibold text-zinc-400">Feature</div>
                <div className="font-bold text-emerald-400 text-center">StarX Flow</div>
                <div className="font-bold text-zinc-400 text-center">{data.competitor}</div>
              </div>
              <div className="divide-y divide-white/5">
                {data.featureTable.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-6 items-center hover:bg-white/[0.02] transition-colors">
                    <div className="text-zinc-300 font-medium">{row.feature}</div>
                    <div className="text-center flex justify-center">
                      {typeof row.starx === 'boolean' ? (
                        row.starx ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-zinc-600" />
                      ) : (
                        <span className="text-sm font-semibold text-emerald-400">{row.starx}</span>
                      )}
                    </div>
                    <div className="text-center flex justify-center">
                      {typeof row.competitor === 'boolean' ? (
                        row.competitor ? <Check className="w-5 h-5 text-zinc-400" /> : <X className="w-5 h-5 text-zinc-600" />
                      ) : (
                        <span className="text-sm font-medium text-zinc-500">{row.competitor}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verdict & CTA */}
          <div className="max-w-3xl mx-auto text-center glass-panel p-10 rounded-[2rem] border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">The Verdict</h2>
              <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                {data.verdict}
              </p>
              <button
                onClick={openSignup}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 mx-auto"
              >
                Switch to StarX Flow
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
