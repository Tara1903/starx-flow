import React from "react";
import Link from 'next/link';

import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";

export function Footer() {
  return (
    <footer className="relative pt-24 pb-12 mt-20 z-10 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <GlassPanel tier="mist" className="p-8 md:p-12 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            {/* Brand block (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-3 w-fit">
                <img
                  src="/logo.svg"
                  alt="StarX Flow Logo"
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
                The premier AI Operating System and WhatsApp Automation Platform for Local Service & Appointment-Driven Businesses. Put your front desk on autopilot with zero booking commissions.
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-zinc-500 block mb-1">Official Support:</span>
                <a href="mailto:support@starxflow.com" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  support@starxflow.com
                </a>
              </div>
            </div>

            {/* Service Verticals */}
            <div>
              <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                Industries
              </h4>
              <ul className="space-y-4 text-sm text-zinc-400 font-semibold">
                <li><Link href="/industries/gyms-fitness" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Gyms & Fitness</Link></li>
                <li><Link href="/industries/dental-clinics" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Dental & Clinics</Link></li>
                <li><Link href="/industries/beauty-salons" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Salons & Beauty</Link></li>
                <li><Link href="/industries/wellness-therapy" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Spas & Wellness</Link></li>
                <li><Link href="/industries/education" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Education & Tutors</Link></li>
              </ul>
            </div>

            {/* Platform & Trust */}
            <div>
              <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                Architecture
              </h4>
              <ul className="space-y-4 text-sm text-zinc-400 font-semibold">
                <li><Link href="/how-it-works" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>How It Works</Link></li>
                <li><Link href="/security" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Security & Privacy</Link></li>
                <li><Link href="/integrations" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Verified Integrations</Link></li>
                <li><Link href="/product" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Product Overview</Link></li>
                <li><Link href="/features" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Features Directory</Link></li>
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                Company
              </h4>
              <ul className="space-y-4 text-sm text-zinc-400 font-semibold">
                <li><Link href="/about" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>About Us</Link></li>
                <li><Link href="/pricing" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Pricing & Plans</Link></li>
                <li><Link href="/resources" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Resources</Link></li>
                <li><Link href="/privacy" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Privacy Policy</Link></li>
                <li><Link href="/terms" className="group flex items-center gap-2 hover:text-emerald-400 transition-colors"><span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden"><ArrowRight className="w-3 h-3"/></span>Terms of Service</Link></li>
              </ul>
            </div>

          </div>

          {/* Footer bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs font-semibold text-zinc-500">
            <span>&copy; {new Date().getFullYear()} StarX Flow. All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-center">
              <Link href="/admin" className="hover:text-white transition-colors">Admin Login</Link>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/10" />
              <span>Canonical Host: starx-flow.runs-on.dev</span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/10" />
              <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                <ShieldCheck size={14} className="text-emerald-400" />
                TLS 1.3 Transport & At-Rest Encryption
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </footer>
  );
}
