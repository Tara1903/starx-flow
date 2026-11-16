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
                <span className="text-[#b8c9bd]">Comparisons</span>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-emerald-500/40" /></li>
              <li className="text-emerald-300 font-semibold" aria-current="page">
                StarX Flow vs {data.competitor}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
            <div className="spatial-pill-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Verified Competitor Analysis</span>
              {data.verifiedSource && (
                <>
                  <span className="text-emerald-500/50">•</span>
                  <span className="text-[#b8c9bd]/80 font-normal">Last Verified: {data.verifiedSource.lastVerified}</span>
                </>
              )}
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              StarX Flow vs <span className="text-gradient-emerald">{data.competitor}</span>
            </h1>
            <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              {data.heroText}
            </p>

            {/* Direct Answer Box */}
            <div className="text-left glass-panel p-6 sm:p-8 text-[#b8c9bd] text-sm md:text-base leading-relaxed border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.12)] mb-8">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2 font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Key Architectural Takeaway</span>
              </div>
              <p className="font-normal text-white/90">
                When evaluating StarX Flow against {data.competitor}, StarX Flow delivers a turnkey conversational AI receptionist engineered specifically for local appointment-driven businesses. Clients converse naturally inside WhatsApp and Instagram to check availability, book slots, and complete digital intake forms without forced app downloads, multi-tool middleware, or booking commission cuts.
              </p>
            </div>

            {/* Official Source Link Citation */}
            {data.verifiedSource && (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#b8c9bd]/70 mb-8">
                <span>Data verified from official sources:</span>
                <a
                  href={data.verifiedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  {data.verifiedSource.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Action CTAs */}
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

          {/* Product Overview & Audience Profiles */}
          {data.productOverview && (
            <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-5xl mx-auto">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-500/20">
                <h3 className="font-editorial text-xl font-bold text-white mb-3">Product Overview &amp; Architecture</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
                  {data.productOverview}
                </p>
                {data.automationType && (
                  <div className="text-xs font-mono text-emerald-300 bg-[#010804] border border-emerald-500/20 rounded-lg p-3">
                    <strong className="text-white">Automation Architecture:</strong> {data.automationType}
                  </div>
                )}
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-500/20">
                <h3 className="font-editorial text-xl font-bold text-white mb-3">Target Audience &amp; Commercial Model</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
                  {data.intendedAudience}
                </p>
                {data.pricingModel && (
                  <div className="text-xs font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 rounded-lg p-3">
                    <strong className="text-emerald-200">Pricing Comparison:</strong> {data.pricingModel}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Best-Fit Use Cases: Balanced Comparison */}
          {data.bestFitUseCases && (
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-center text-white mb-8">
                When to Choose Each Platform
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-400/40 shadow-[0_0_25px_rgba(40,223,160,0.12)]">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-lg mb-3 font-editorial">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Choose StarX Flow If:</span>
                  </div>
                  <p className="text-[#b8c9bd] text-sm leading-relaxed font-normal">
                    {data.bestFitUseCases.starx}
                  </p>
                </div>

                <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-500/15 bg-[#030a06]">
                  <div className="flex items-center gap-2 text-zinc-300 font-bold text-lg mb-3 font-editorial">
                    <AlertCircle className="w-5 h-5 text-[#b8c9bd]" />
                    <span>Choose {data.competitor} If:</span>
                  </div>
                  <p className="text-[#b8c9bd] text-sm leading-relaxed font-normal">
                    {data.bestFitUseCases.competitor}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pros & Cons Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
            {/* StarX Flow */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl border-emerald-400/40 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(40,223,160,0.15)]">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-editorial text-2xl font-bold flex items-center gap-3 text-white">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    StarX Flow
                  </h3>
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Modern AI Front Desk
                  </span>
                </div>
                <ul className="space-y-4">
                  {data.starxPros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Competitor */}
            <div className="glass-panel p-8 rounded-3xl border-emerald-500/15 relative overflow-hidden bg-[#030906]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-editorial text-2xl font-bold flex items-center gap-3 text-[#b8c9bd]">
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                  {data.competitor}
                </h3>
                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-white/5 text-[#b8c9bd] border border-white/10">
                  Legacy / Alternative Model
                </span>
              </div>
              <ul className="space-y-4">
                {data.competitorCons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[#b8c9bd] text-sm md:text-base leading-relaxed font-normal">
                    <X className="w-5 h-5 text-red-400/80 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Matrix Table */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="font-editorial text-2xl md:text-4xl font-bold text-center text-white mb-8">Detailed Capability Comparison</h2>
            <div className="glass-panel rounded-2xl border-emerald-500/25 overflow-hidden shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)]">
              <div className="grid grid-cols-3 p-6 bg-[#010704] border-b border-emerald-500/20 font-bold text-sm md:text-base text-white">
                <div className="font-editorial">Capability</div>
                <div className="text-center text-emerald-300 font-mono">StarX Flow</div>
                <div className="text-center text-[#b8c9bd] font-mono">{data.competitor}</div>
              </div>

              <div className="divide-y divide-emerald-500/15">
                {data.featureTable.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-6 items-center hover:bg-emerald-500/5 transition-colors text-sm md:text-base">
                    <div className="text-white/90 font-medium">{row.feature}</div>
                    <div className="text-center flex justify-center">
                      {typeof row.starx === 'boolean' ? (
                        row.starx ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-zinc-600" />
                      ) : (
                        <span className="text-xs md:text-sm font-mono font-semibold text-emerald-300">{row.starx}</span>
                      )}
                    </div>
                    <div className="text-center flex justify-center">
                      {typeof row.competitor === 'boolean' ? (
                        row.competitor ? <Check className="w-5 h-5 text-[#b8c9bd]" /> : <X className="w-5 h-5 text-zinc-600" />
                      ) : (
                        <span className="text-xs md:text-sm font-mono font-normal text-[#b8c9bd]">{row.competitor}</span>
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
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-center text-white mb-8">
                Frequently Asked Questions: StarX Flow vs {data.competitor}
              </h2>
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

          {/* Contextual Industry Cross-Links */}
          {data.relatedIndustryIds && data.relatedIndustryIds.length > 0 && (
            <div className="max-w-4xl mx-auto mb-20 p-8 rounded-3xl glass-panel border-emerald-500/20">
              <h3 className="font-editorial text-xl font-bold mb-4 text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Relevant Industry Automations
              </h3>
              <p className="text-[#b8c9bd] text-sm mb-6">
                Explore how StarX Flow replaces {data.competitor} across specific service industries:
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
                      className="p-4 rounded-xl bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40 transition-all flex items-center justify-between group"
                    >
                      <span className="text-sm font-medium text-[#b8c9bd] group-hover:text-emerald-300">
                        {label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verdict & CTA */}
          <div className="max-w-3xl mx-auto text-center glass-panel p-10 rounded-[2.5rem] border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)] relative overflow-hidden mb-20">
            <div className="relative z-10">
              <h2 className="font-editorial text-3xl font-bold mb-4 text-white">The Final Assessment</h2>
              <p className="text-lg text-[#b8c9bd] leading-relaxed mb-8 font-normal">
                {data.verdict}
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
                  View Transparent Pricing
                </Link>
              </div>
            </div>
          </div>

          {/* Related Competitor Comparisons */}
          <div className="max-w-4xl mx-auto border-t border-emerald-500/20 pt-12 text-center">
            <h3 className="font-editorial text-xl font-bold mb-6 text-white">Compare Other Alternatives</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {Object.keys(comparisonData)
                .filter((id) => id !== competitorId)
                .map((otherId) => (
                  <Link
                    key={otherId}
                    href={`/compare/${otherId}`}
                    className="text-xs font-mono px-4 py-2 rounded-full bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 text-[#b8c9bd] hover:text-white transition-all"
                  >
                    StarX Flow vs {comparisonData[otherId].competitor}
                  </Link>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
