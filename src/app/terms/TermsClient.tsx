"use client";

import React from "react";
import { motion } from "motion/react";

export function TermsClient() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 relative z-10 bg-black overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="atmo-glow atmo-glow-soft w-[800px] h-[800px] top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-primary text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-6">
            Legal Document
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">
            Terms of <span className="text-gradient-silver">Service</span>
          </h1>
          <p className="text-zinc-400 font-medium">Last updated: November 4, 2026</p>
        </div>

        <div className="glass-mist p-8 md:p-16 rounded-[2.5rem] max-w-none">
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">1. Acceptance of Terms</h2>
              <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                By accessing and using StarX Flow, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">2. Description of Service</h2>
              <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                StarX Flow provides an AI-powered conversational workflow automation platform that connects with WhatsApp and other business channels to automate appointments, customer care, and operations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">3. User Responsibilities</h2>
              <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the service in compliance with all applicable local, state, and international laws, including Meta/WhatsApp business policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">4. Intellectual Property</h2>
              <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                The service and its original content, features, and functionality are and will remain the exclusive property of StarX Flow and its licensors. You retain full ownership of your customer data and customer communications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">5. Termination</h2>
              <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. You may cancel your subscription at any time via your account dashboard.
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
