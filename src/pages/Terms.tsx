import React from "react";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";

export function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Service | StarX Flow" 
        description="Terms of Service for StarX Flow, the AI operating system for local businesses." 
      />
      
      <section className="min-h-screen pt-32 pb-20 px-6 relative z-10 bg-black overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="atmo-glow atmo-glow-soft w-[800px] h-[800px] top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-20" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-primary text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-6">
              Legal Document
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">
              Terms of <span className="text-gradient-silver">Service</span>
            </h1>
            <p className="text-zinc-400 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-mist p-8 md:p-16 rounded-[2.5rem] max-w-none"
          >
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
                  StarX Flow provides businesses with an AI-powered conversational platform integrated with WhatsApp for automating customer interactions, bookings, and lead capture. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">3. Registration and Account Security</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  In consideration of your use of the Service, you agree to: (a) provide true, accurate, current, and complete information about yourself as prompted by the Service's registration form, and (b) maintain and promptly update the Registration Data to keep it true, accurate, current, and complete. You are responsible for maintaining the confidentiality of your password and account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">4. Acceptable Use</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  You agree to use our services only for lawful purposes and in accordance with these Terms. You are prohibited from using our services to send spam, unsolicited messages, or malicious content through our WhatsApp integrations. Violation of this may result in immediate termination of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">5. Limitation of Liability</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  StarX Flow shall not be liable for any indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses resulting from the use or the inability to use the service.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
