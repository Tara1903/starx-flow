"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
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
  Layers,
  ChevronRight
} from 'lucide-react';
import { industryData } from './industryData';
import { useUIStore } from '@/store/uiStore';

export function IndustryPageClient() {
  const { industryId } = useParams<{ industryId: string }>();
  const openSignup = useUIStore((state) => state.openSignup);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  if (!industryId || !industryData[industryId]) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  const data = industryData[industryId];

  return (
    <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col font-sans selection:bg-emerald-500/30 pt-32 lg:pt-40 pb-24 relative overflow-hidden">
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

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-mono text-[#b8c9bd]/70 uppercase tracking-widest">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-emerald-500/40" /></li>
              <li>
                <span className="text-[#b8c9bd]">Industries</span>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-emerald-500/40" /></li>
              <li className="text-emerald-300 font-semibold" aria-current="page">
                {data.name}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
            <div className="spatial-pill-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Autonomous Front Desk for {data.name}
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              {data.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              {data.heroSubtitle}
            </p>

            {/* Direct Answer Box */}
            <div className="text-left glass-panel p-6 sm:p-8 text-[#b8c9bd] text-sm md:text-base leading-relaxed border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.12)]">
              <div className="flex items-center gap-2.5 text-emerald-300 font-semibold mb-2 font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Executive Summary &amp; Direct Answer</span>
              </div>
              <p className="font-normal text-white/90">{data.keyTakeaway}</p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={openSignup}
                className="spatial-btn-primary w-full sm:w-auto"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/pricing"
                className="spatial-btn-secondary w-full sm:w-auto"
              >
                View Transparent Pricing
              </Link>
            </div>
          </div>

          {/* Problems & Solutions Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
            {/* The Operational Problems */}
            <div className="glass-panel p-8 md:p-10 rounded-3xl border-red-500/20 relative overflow-hidden bg-[#070c0a]">
              <div className="relative z-10">
                <h2 className="font-editorial text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                  <span className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                    <PhoneMissed className="w-5 h-5" />
                  </span>
                  The Operational Bottleneck
                </h2>
                <div className="space-y-6">
                  {data.painPoints.map((point, idx) => (
                    <div key={idx} className="bg-[#020704] border border-red-500/15 rounded-2xl p-5">
                      <div className="flex items-center gap-2 text-white font-semibold text-lg mb-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]" />
                        <h3 className="font-editorial">{point.title}</h3>
                      </div>
                      <p className="text-[#b8c9bd] text-sm leading-relaxed mb-3 font-normal">
                        {point.description}
                      </p>
                      {point.impact && (
                        <div className="inline-block px-3 py-1 rounded-md bg-red-950/40 border border-red-500/25 text-red-300 text-xs font-mono font-medium">
                          Consequence: {point.impact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The AI Solutions */}
            <div className="glass-panel p-8 md:p-10 rounded-3xl border-emerald-400/30 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(40,223,160,0.12)]">
              <div className="relative z-10">
                <h2 className="font-editorial text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  The StarX Flow Solution
                </h2>
                <div className="space-y-6">
                  {data.aiSolutions.map((sol, idx) => (
                    <div key={idx} className="bg-[#010804] border border-emerald-500/20 rounded-2xl p-5">
                      <div className="flex items-center gap-2 text-white font-semibold text-lg mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <h3 className="font-editorial">{sol.title}</h3>
                      </div>
                      <p className="text-[#b8c9bd] text-sm leading-relaxed font-normal">
                        {sol.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Sequence */}
          {data.workflowSteps && data.workflowSteps.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-editorial text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                  How Autonomous Booking Operates in {data.name}
                </h2>
                <p className="text-[#b8c9bd] text-base sm:text-lg font-normal">
                  Step-by-step workflow between your prospective client and your StarX Flow AI receptionist.
                </p>
              </div>

              <div className="space-y-6">
                {data.workflowSteps.map((step) => (
                  <div key={step.step} className="glass-panel glass-panel-hover p-6 md:p-8 rounded-2xl border-emerald-500/20 relative">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono font-bold flex items-center justify-center shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <h3 className="font-editorial text-xl font-bold text-white">{step.title}</h3>
                          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 px-3 py-1 rounded-full uppercase">
                            Trigger: {step.trigger}
                          </span>
                        </div>
                        <div className="bg-[#010704] border border-emerald-500/20 rounded-xl p-4 mb-3 font-mono text-xs md:text-sm text-emerald-300 leading-relaxed">
                          {step.dialogue}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#b8c9bd]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span><strong className="text-white">System Outcome:</strong> {step.outcome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Platform Commitments */}
          {data.platformGuarantees && data.platformGuarantees.length > 0 && (
            <div className="max-w-5xl mx-auto mb-24">
              <div className="text-center mb-10">
                <div className="spatial-pill-badge mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  Verified Architecture Standards
                </div>
                <h2 className="font-editorial text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">
                  Platform Commitments for {data.name}
                </h2>
                <p className="text-[#b8c9bd] text-base max-w-2xl mx-auto font-normal">
                  Architectural guarantees designed to protect your appointments, calendar integrity, and client relationships.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {data.platformGuarantees.map((item, idx) => (
                  <div key={idx} className="glass-panel p-6 rounded-2xl border-emerald-500/20 relative">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-4 shadow-[0_0_12px_rgba(40,223,160,0.12)]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-editorial text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">{item.description}</p>
                    <div className="text-xs text-[#b8c9bd] bg-[#010704] rounded-lg p-2.5 border border-emerald-500/15 font-mono">
                      <strong className="text-emerald-300">Enforcement:</strong> {item.verificationMethod}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Limitations */}
          {data.limitations && data.limitations.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-editorial text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">
                  Scope Transparency: When StarX Flow Fits &amp; When Another Tool Fits Better
                </h2>
                <p className="text-[#b8c9bd] text-sm sm:text-base font-normal">
                  We maintain complete transparency regarding our product boundaries. StarX Flow is focused on front-desk conversational booking, not enterprise ERP or hardware systems.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {data.limitations.map((lim, idx) => (
                  <div key={idx} className="glass-panel border-amber-500/25 rounded-2xl p-6 bg-[#080c09]">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold mb-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <h3 className="font-editorial text-lg">{lim.title}</h3>
                    </div>
                    <p className="text-[#b8c9bd] text-sm mb-4 leading-relaxed font-normal">
                      {lim.description}
                    </p>
                    <div className="text-xs text-[#b8c9bd] bg-amber-950/30 border border-amber-500/20 rounded-lg p-3">
                      <strong className="text-amber-200">Recommended Alternative:</strong> {lim.betterAlternative}
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
                <h2 className="font-editorial text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">
                  Supported Infrastructure &amp; Integrations
                </h2>
                <p className="text-[#b8c9bd] text-base font-normal">
                  StarX Flow integrates with standard calendars, messaging channels, and payment gateways.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {data.integrations.map((integ, idx) => (
                  <div key={idx} className="glass-panel p-5 rounded-2xl border-emerald-500/20 hover:border-emerald-400/40 transition-colors">
                    <div className="text-xs font-mono font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                      {integ.category}
                    </div>
                    <div className="font-editorial text-base font-bold text-white mb-2">{integ.name}</div>
                    <p className="text-[#b8c9bd] text-xs leading-relaxed font-normal">
                      {integ.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industry FAQs Accordion */}
          {data.faqs && data.faqs.length > 0 && (
            <div className="mb-24 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="spatial-pill-badge mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  Frequently Asked Questions
                </div>
                <h2 className="font-editorial text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Questions About AI Automation for {data.name}
                </h2>
              </div>

              <div className="space-y-4">
                {data.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="glass-panel rounded-2xl border-emerald-500/20 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left p-6 font-semibold text-lg flex items-center justify-between gap-4 text-white hover:text-emerald-300 transition-colors"
                      aria-expanded={openFaq === idx}
                    >
                      <span className="font-editorial">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform duration-200 ${
                          openFaq === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === idx && (
                        <motion.div
                          initial={prefersReduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-[#b8c9bd] text-base leading-relaxed border-t border-emerald-500/15 pt-4 font-normal">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Internal Links & Competitor Comparisons */}
          <div className="mb-24 max-w-5xl mx-auto p-8 rounded-3xl glass-panel border-emerald-500/20">
            <h3 className="font-editorial text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Related Solutions &amp; Comparisons for {data.name}
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.relatedFeatureLinks?.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="p-4 rounded-xl bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-[#b8c9bd] group-hover:text-emerald-300">
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
              {data.relatedCompetitorIds?.map((compKey, idx) => (
                <Link
                  key={`comp-${idx}`}
                  href={`/compare/${compKey}`}
                  className="p-4 rounded-xl bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-[#b8c9bd] group-hover:text-emerald-300">
                    Compare vs {compKey.replace(/^starx-flow-vs-/i, '').charAt(0).toUpperCase() + compKey.replace(/^starx-flow-vs-/i, '').slice(1)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Final Conversion CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-panel p-10 sm:p-14 rounded-[2.5rem] border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)] relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-editorial text-3xl md:text-5xl font-bold mb-6 text-white">
                  Ready to automate your {data.name.toLowerCase()} front desk?
                </h2>
                <p className="text-[#b8c9bd] text-lg mb-8 max-w-2xl mx-auto font-normal">
                  Experience autonomous appointment scheduling with real-time Google and Outlook calendar synchronization. Start your 14-day free trial.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={openSignup}
                    className="spatial-btn-primary w-full sm:w-auto"
                  >
                    Start 14-Day Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href="/pricing"
                    className="spatial-btn-secondary w-full sm:w-auto"
                  >
                    Explore Flat-Rate Plans ($29/mo)
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
