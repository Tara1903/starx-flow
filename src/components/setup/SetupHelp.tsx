import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, MessageSquare, BookOpen, ExternalLink, ChevronDown, Sparkles } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "How does the WhatsApp QR connection work?",
    a: "We initiate a secure, containerized session on our servers. When you scan the QR code with your phone, WhatsApp links it as a companion device, exactly like WhatsApp Web. No personal data is stored."
  },
  {
    q: "Can I connect my personal Instagram account?",
    a: "No, automated DMs require an Instagram Professional or Business account connected to a Facebook page. You can easily switch your account type for free in the Instagram settings."
  },
  {
    q: "What is the Readiness Score?",
    a: "It's a visual calculation of how ready your organization is to launch. Connecting channels, completing your profile, and configuring custom AI responses boost your score to 100%."
  }
];

export function SetupHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-80 sm:w-96 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(16,185,129,0.05)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Setup Assistant</h4>
                  <p className="text-[10px] text-zinc-500">Need help with onboarding?</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto console-scroll">
              
              {/* Quick FAQs */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block px-0.5">Frequently Asked Questions</h5>
                <div className="space-y-1.5">
                  {FAQS.map((faq, idx) => {
                    const isActive = activeFaq === idx;
                    return (
                      <div 
                        key={idx} 
                        className="bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => setActiveFaq(isActive ? null : idx)}
                          className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-white/[0.02]"
                        >
                          <span className="text-xs text-zinc-300 font-semibold leading-relaxed pr-4">{faq.q}</span>
                          <ChevronDown 
                            className={`w-3.5 h-3.5 text-zinc-500 flex-shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180 text-emerald-400' : ''}`} 
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3.5 pb-3.5 text-[11px] text-zinc-400 leading-relaxed border-t border-white/5 pt-2">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resource Channels */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <a 
                  href="https://starxflow.gitbook.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all group"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform" />
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-0.5">
                      <span>Docs Portal</span>
                      <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                    </div>
                    <span className="text-[9px] text-zinc-500 leading-tight block mt-0.5">Browse setups</span>
                  </div>
                </a>

                <button 
                  onClick={() => alert("Connecting to a human representative... (Simulation)")}
                  className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] text-left transition-all group"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform" />
                  <div>
                    <div className="text-[11px] font-bold text-white">Live Support</div>
                    <span className="text-[9px] text-zinc-500 leading-tight block mt-0.5">Get live human chat</span>
                  </div>
                </button>
              </div>

            </div>

            {/* Footer banner */}
            <div className="bg-emerald-500/5 p-3 border-t border-white/5 flex gap-2 items-center text-[10px] text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Tip: WhatsApp is our most active messaging channel.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-colors focus:outline-none"
      >
        <HelpCircle className="w-6 h-6 stroke-[2px]" />
      </motion.button>
    </div>
  );
}
