import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative pt-16 pb-10 mt-12 z-10 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[780px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="glass-card-obsidian p-8 md:p-12 rounded-3xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-12">
            {/* Brand block */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="flex items-center gap-3 w-fit">
                <img
                  src="/logo.svg"
                  alt="StarX Flow Logo"
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
                The premier AI Operating System and WhatsApp Automation Platform
                for Local Service &amp; Appointment-Driven Businesses. Put your
                front desk on autopilot with zero booking commissions.
              </p>
              <div className="pt-1">
                <span className="text-xs font-semibold text-zinc-500 block mb-1">
                  Official Support:
                </span>
                <a
                  href="mailto:support@starx-flow.runs-on.dev"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  support@starx-flow.runs-on.dev
                </a>
              </div>
            </div>

            {/* Industries */}
            <div>
              <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Industries
              </h4>
              <ul className="space-y-3.5 text-sm text-zinc-400 font-medium">
                {[
                  { label: "Gyms & Fitness", href: "/industries/gyms-fitness" },
                  { label: "Dental & Clinics", href: "/industries/dental-clinics" },
                  { label: "Salons & Beauty", href: "/industries/beauty-salons" },
                  { label: "Spas & Wellness", href: "/industries/wellness-therapy" },
                  { label: "Education & Tutors", href: "/industries/education" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Architecture */}
            <div>
              <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Architecture
              </h4>
              <ul className="space-y-3.5 text-sm text-zinc-400 font-medium">
                {[
                  { label: "How It Works", href: "/how-it-works" },
                  { label: "Security & Privacy", href: "/security" },
                  { label: "Verified Integrations", href: "/integrations" },
                  { label: "Product Overview", href: "/product" },
                  { label: "Features Directory", href: "/features" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Company
              </h4>
              <ul className="space-y-3.5 text-sm text-zinc-400 font-medium">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Pricing & Plans", href: "/pricing" },
                  { label: "Resources", href: "/resources" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
            <span>
              &copy; {new Date().getFullYear()} StarX Flow. All rights reserved.
            </span>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-center">
              <Link href="/admin" className="hover:text-white transition-colors">
                Admin Login
              </Link>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/15" />
              <span>Canonical Host: starx-flow.runs-on.dev</span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/15" />
              <span className="flex items-center gap-1.5 text-emerald-400/90">
                <ShieldCheck size={14} className="text-emerald-400" />
                TLS 1.3 Transport &amp; At-Rest Encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
