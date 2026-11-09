"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  PhoneMissed,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { industryData, IndustryPainPoint, IndustrySolution } from './industryData';
import { useUIStore } from '@/store/uiStore';
import { GlassPanel } from '@/components/ui/GlassPanel';

export function IndustryPageClient() {
  const { industryId } = useParams<{ industryId: string }>();
  const openSignup = useUIStore((state) => state.openSignup);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-zinc-400">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></li>
              <li>
                <span className="text-zinc-500">Industries</span>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></li>
              <li className="text-emerald-400 font-medium" aria-current="page">
                {data.name}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              <Sparkles className="w-4 h-4" />
              Autonomous Front Desk for {data.name}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {data.heroTitle}
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed font-normal mb-8">
              {data.heroSubtitle}
            </p>

            {/* Direct Answer Box for AI Answer Engines & Human Readers */}
            <div className="text-left bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 text-zinc-300 text-base leading-relaxed">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span>Executive Summary & Direct Answer:</span>
              </div>
              <p>{data.keyTakeaway}</p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={openSignup}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full border border-white/10 transition-all text-center"
              >
                View Transparent Pricing
              </Link>
            </div>
          </div>

          {/* Problems & Solutions Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
            {/* The Operational Problems */}
            <GlassPanel tier="panel" className="p-8 md:p-10 rounded-3xl border-red-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-red-400">
                    <PhoneMissed className="w-5 h-5" />
                  </span>
                  The Operational Bottleneck
                </h2>
                <div className="space-y-6">
                  {data.painPoints.map((point, idx) => {
                    const isObj = typeof point === 'object' && point !== null;
                    const title = isObj ? (point as IndustryPainPoint).title : `Problem ${idx + 1}`;
                    const desc = isObj ? (point as IndustryPainPoint).description : (point as string);
                    const impact = isObj ? (point as IndustryPainPoint).impact : null;

                    return (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-2">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <h3>{title}</h3>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                          {desc}
                        </p>
                        {impact && (
                          <div className="inline-block px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
                            Operational Impact: {impact}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassPanel>

            {/* The AI Solutions */}
            <GlassPanel tier="hero" className="p-8 md:p-10 rounded-3xl border-emerald-500/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  The StarX-Flow AI Solution
                </h2>
                <div className="space-y-6">
                  {data.aiSolutions.map((sol, idx) => {
                    const isObj = typeof sol === 'object' && sol !== null;
                    const title = isObj ? (sol as IndustrySolution).title : `Autonomous Capability ${idx + 1}`;
                    const desc = isObj ? (sol as IndustrySolution).description : (sol as string);

                    return (
                      <div key={idx} className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <h3>{title}</h3>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Workflow Sequence (If available) */}
          {data.workflowSteps && data.workflowSteps.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  How Autonomous Booking Works in {data.name}
                </h2>
                <p className="text-zinc-400 text-lg">
                  Real step-by-step interaction between your customer and your StarX-Flow AI receptionist.
                </p>
              </div>

              <div className="space-y-6">
                {data.workflowSteps.map((step) => (
                  <div key={step.step} className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 relative">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <h3 className="text-xl font-bold text-white">{step.title}</h3>
                          <span className="text-xs text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full">
                            Trigger: {step.trigger}
                          </span>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-3 font-mono text-xs md:text-sm text-emerald-300 leading-relaxed">
                          {step.dialogue}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span><strong>System Outcome:</strong> {step.outcome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Limitations & Better Alternatives */}
          {data.limitations && data.limitations.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  Honest Scope: When StarX-Flow Fits & When Another Tool Fits Better
                </h2>
                <p className="text-zinc-400 text-base">
                  We believe in complete transparency. We don't try to be an enterprise ERP or physical hardware controller.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {data.limitations.map((lim, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-amber-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h3 className="text-lg">{lim.title}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                      {lim.description}
                    </p>
                    <div className="text-xs text-zinc-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <strong>Recommended Solution:</strong> {lim.betterAlternative}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Grid */}
          {data.integrations && data.integrations.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  Compatible Infrastructure & Integrations
                </h2>
                <p className="text-zinc-400 text-base">
                  StarX-Flow integrates directly with the tools you already rely on daily.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {data.integrations.map((integ, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                      {integ.category}
                    </div>
                    <div className="text-base font-bold text-white mb-2">{integ.name}</div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {integ.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial */}
          <div className="max-w-4xl mx-auto mb-24">
            <GlassPanel tier="mist" className="p-10 md:p-12 rounded-[2rem] text-center border border-emerald-500/20 relative">
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-6 h-6 text-emerald-400 fill-emerald-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
                "{data.testimonial.quote}"
              </blockquote>
              <div>
                <div className="font-bold text-lg text-white">{data.testimonial.author}</div>
                <div className="text-emerald-400 text-sm">{data.testimonial.role}</div>
                {data.testimonial.metric && (
                  <div className="inline-block mt-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-xs font-semibold">
                    Verified Outcome: {data.testimonial.metric}
                  </div>
                )}
              </div>
            </GlassPanel>
          </div>

          {/* Industry FAQs Accordion */}
          {data.faqs && data.faqs.length > 0 && (
            <div className="mb-24 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold tracking-wide mb-4">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Frequently Asked Questions
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Questions About AI Automation for {data.name}
                </h2>
              </div>

              <div className="space-y-4">
                {data.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left p-6 font-semibold text-lg flex items-center justify-between gap-4 hover:text-emerald-400 transition-colors"
                      aria-expanded={openFaq === idx}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                          openFaq === idx ? 'rotate-180 text-emerald-400' : ''
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="px-6 pb-6 text-zinc-300 text-base leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Internal Links & Competitor Comparisons */}
          <div className="mb-24 max-w-5xl mx-auto p-8 rounded-3xl bg-white/[0.02] border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Related Solutions & Comparisons for {data.name}
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.relatedFeatureLinks?.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="p-4 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400">
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
              {data.relatedCompetitorIds?.map((compKey, idx) => (
                <Link
                  key={`comp-${idx}`}
                  href={`/compare/${compKey}`}
                  className="p-4 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400">
                    Compare vs {compKey.replace(/^starx-flow-vs-/i, '').charAt(0).toUpperCase() + compKey.replace(/^starx-flow-vs-/i, '').slice(1)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Final Conversion CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <GlassPanel tier="mist" className="p-12 rounded-[2rem] border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to put your {data.name.toLowerCase()} front desk on autopilot?
                </h2>
                <p className="text-zinc-300 text-lg mb-8 max-w-2xl mx-auto">
                  Join hundreds of service businesses that never miss a booking. Set up in under 5 minutes with our 14-day free trial.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={openSignup}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href="/pricing"
                    className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full border border-white/10 transition-all text-center"
                  >
                    Explore Flat-Rate Plans ($29/mo)
                  </Link>
                </div>
              </div>
            </GlassPanel>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
