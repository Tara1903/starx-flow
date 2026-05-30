import React from "react";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";

export function Privacy() {
  return (
    <>
      <SEO 
        title="Privacy Policy | StarX Flow" 
        description="Privacy Policy for StarX Flow, the AI operating system for local businesses." 
      />
      
      <section className="min-h-screen pt-32 pb-20 px-6 relative z-10 bg-black overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="atmo-glow atmo-glow-emerald w-[800px] h-[800px] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
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
              Privacy <span className="text-gradient-silver">Policy</span>
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
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">1. Information We Collect</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  We collect information that you provide directly to us when you create an account, use our services, or communicate with us. This may include your name, email address, phone number, business details, and any other information you choose to provide.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">2. How We Use Information</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  We use the information we collect to provide, maintain, and improve our services, communicate with you, process transactions, and protect our users and platform. We also use information to train and optimize the AI models powering our WhatsApp receptionists to better serve your clients.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">3. Data Security & Encryption</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  We implement industry-standard 256-bit encryption and security measures designed to protect your data from unauthorized access, disclosure, alteration, and destruction. We do not sell your personal data or your clients' personal data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">4. WhatsApp Integration</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  Our services integrate with the WhatsApp Business API. By using our platform, you also agree to WhatsApp's terms and privacy policies. We are not responsible for how WhatsApp handles data transmitted over their network.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">5. Contact Us</h2>
                <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                  If you have any questions about this Privacy Policy, please contact us at privacy@starxflow.com.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
