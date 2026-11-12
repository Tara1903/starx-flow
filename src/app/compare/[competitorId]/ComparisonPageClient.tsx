"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Check,
  X,
  ArrowRight,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  AlertCircle
} from 'lucide-react';
import { comparisonData } from './comparisonData';
import { useUIStore } from '@/store/uiStore';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { GlassButton } from '@/components/ui/GlassButton';
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motionVariants';

export function ComparisonPageClient() {
  const { competitorId } = useParams<{ competitorId: string }>();
  const openSignup = useUIStore((state) => state.openSignup);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  if (!competitorId || !comparisonData[competitorId]) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  const data = comparisonData[competitorId];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      <div className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-zinc-400">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></li>
              <li>
                <span className="text-zinc-500">Comparisons</span>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></li>
              <li className="text-emerald-400 font-medium" aria-current="page">
                StarX-Flow vs {data.competitor}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <ScrollReveal direction="up" className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs md:text-sm font-semibold tracking-wide mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Verified Competitor Analysis</span>
              {data.verifiedSource && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400 font-normal">Last Verified: {data.verifiedSource.lastVerified}</span>
                </>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              StarX-Flow vs {data.competitor}
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed font-normal mb-8">
              {data.heroText}
            </p>

            {/* Direct Answer Box for AI Answer Engines & Readers */}
            <div className="text-left bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 text-zinc-300 text-base leading-relaxed mb-6">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span>Key Architectural Takeaway:</span>
              </div>
              <p>
                When evaluating StarX-Flow against {data.competitor}, StarX-Flow delivers a turnkey conversational AI receptionist engineered specifically for local appointment-driven businesses. Clients converse naturally inside WhatsApp and Instagram to check availability, book slots, and complete digital intake forms without forced app downloads, multi-tool middleware, or booking commission cuts.
              </p>
            </div>

            {/* Official Source Link Citation */}
            {data.verifiedSource && (
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 mb-8">
                <span>Data verified from official sources:</span>
                <a
                  href={data.verifiedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  {data.verifiedSource.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GlassButton
                size="lg"
                variant="primary"
                magnetic
                onClick={openSignup}
                className="w-full sm:w-auto"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-zinc-700 hover:border-zinc-500 text-white font-medium transition-all text-center bg-white/5 hover:bg-white/10"
              >
                Explore Flat-Rate Plans ($29/mo)
              </Link>
            </div>
          </ScrollReveal>

          {/* Product Overview & Audience Profiles */}
          {data.productOverview && (
            <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-5xl mx-auto">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">Product Overview & Positioning</h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                  {data.productOverview}
                </p>
                {data.automationType && (
                  <div className="text-xs text-zinc-400 bg-white/5 rounded-lg p-3">
                    <strong className="text-zinc-200">Automation Architecture:</strong> {data.automationType}
                  </div>
                )}
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">Target Audience & Market Fit</h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                  {data.intendedAudience}
                </p>
                {data.pricingModel && (
                  <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <strong className="text-emerald-200">Pricing Comparison:</strong> {data.pricingModel}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Best-Fit Use Cases: Balanced Comparison */}
          {data.bestFitUseCases && (
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="text-2xl font-bold text-center mb-8">When to Choose Each Platform</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-3">
                    <Check className="w-5 h-5" />
                    <span>Choose StarX-Flow If:</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {data.bestFitUseCases.starx}
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-zinc-300 font-bold text-lg mb-3">
                    <AlertCircle className="w-5 h-5 text-zinc-400" />
                    <span>Choose {data.competitor} If:</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {data.bestFitUseCases.competitor}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pros & Cons Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
            {/* StarX-Flow */}
            <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    StarX-Flow
                  </h3>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Modern AI Front Desk
                  </span>
                </div>
                <ul className="space-y-4">
                  {data.starxPros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-200 text-sm md:text-base leading-relaxed">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Competitor */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-zinc-400">
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                  {data.competitor}
                </h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                  Alternative Model
                </span>
              </div>
              <ul className="space-y-4">
                {data.competitorCons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-zinc-400 text-sm md:text-base leading-relaxed">
                    <X className="w-5 h-5 text-red-400/80 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Matrix Table */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-center mb-8">Detailed Capability Comparison</h2>
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-3 p-6 bg-white/[0.03] border-b border-white/10 font-bold text-sm md:text-base text-zinc-300">
                <div>Capability</div>
                <div className="text-center text-emerald-400">StarX-Flow</div>
                <div className="text-center text-zinc-400">{data.competitor}</div>
              </div>

              <div className="divide-y divide-white/5">
                {data.featureTable.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-6 items-center hover:bg-white/[0.02] transition-colors text-sm md:text-base">
                    <div className="text-zinc-300 font-medium">{row.feature}</div>
                    <div className="text-center flex justify-center">
                      {typeof row.starx === 'boolean' ? (
                        row.starx ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-zinc-600" />
                      ) : (
                        <span className="text-xs md:text-sm font-semibold text-emerald-400">{row.starx}</span>
                      )}
                    </div>
                    <div className="text-center flex justify-center">
                      {typeof row.competitor === 'boolean' ? (
                        row.competitor ? <Check className="w-5 h-5 text-zinc-400" /> : <X className="w-5 h-5 text-zinc-600" />
                      ) : (
                        <span className="text-xs md:text-sm font-medium text-zinc-400">{row.competitor}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          {data.faqs && data.faqs.length > 0 && (
            <div className="max-w-3xl mx-auto mb-20">
              <h2 className="text-2xl font-bold text-center mb-8">
                Frequently Asked Questions: StarX-Flow vs {data.competitor}
              </h2>
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
                    <AnimatePresence initial={false}>
                      {openFaq === idx && (
                        <motion.div
                          initial={prefersReduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: MOTION_DURATION.card, ease: MOTION_EASE.premium }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-zinc-300 text-base leading-relaxed border-t border-white/5 pt-4">
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

          {/* Contextual Industry Cross-Links */}
          {data.relatedIndustryIds && data.relatedIndustryIds.length > 0 && (
            <div className="max-w-4xl mx-auto mb-20 p-8 rounded-3xl bg-white/[0.02] border border-white/10">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Relevant Industry Automations
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                Explore how StarX-Flow replaces {data.competitor} across specific service industries:
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.relatedIndustryIds.map((indKey) => {
                  const label = indKey
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                  return (
                    <Link
                      key={indKey}
                      href={`/industries/${indKey}`}
                      className="p-4 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
                    >
                      <span className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400">
                        {label} Automation
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verdict & CTA */}
          <div className="max-w-3xl mx-auto text-center glass-panel p-10 rounded-[2rem] border border-emerald-500/20 relative overflow-hidden mb-20">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">The Final Assessment</h2>
              <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                {data.verdict}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <GlassButton
                  size="lg"
                  variant="primary"
                  magnetic
                  onClick={openSignup}
                  className="w-full sm:w-auto"
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-zinc-700 hover:border-zinc-500 text-white font-medium transition-all text-center bg-white/5 hover:bg-white/10"
                >
                  View Transparent Pricing
                </Link>
              </div>
            </div>
          </div>

          {/* Related Competitor Comparisons */}
          <div className="max-w-4xl mx-auto border-t border-white/10 pt-12 text-center">
            <h3 className="text-xl font-bold mb-6 text-zinc-300">Compare Other Alternatives</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {Object.keys(comparisonData)
                .filter((id) => id !== competitorId)
                .map((otherId) => (
                  <Link
                    key={otherId}
                    href={`/compare/${otherId}`}
                    className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-zinc-400 hover:text-white transition-all"
                  >
                    StarX-Flow vs {comparisonData[otherId].competitor}
                  </Link>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
