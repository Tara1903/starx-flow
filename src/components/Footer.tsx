import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative pt-16 pb-12 mt-16 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="p-8 md:p-12 rounded-3xl border border-white/[0.08] bg-[#040e0a]/90 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-12">
            {/* Brand block */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 w-fit">
                <img src="/logo.svg" alt="" className="h-6 w-6 rounded-md object-contain" />
                <span className="text-base font-semibold text-white font-sans tracking-tight">StarX Flow</span>
              </Link>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                The premier operating system and WhatsApp automation engine
                for appointment-driven businesses. Front-desk intelligence, calendar synchronization, and automated client journeys.
              </p>
              <div className="pt-1">
                <span className="text-xs font-mono text-zinc-500 block mb-1">
                  Support &amp; Inquiries:
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
              <h4 className="text-zinc-200 font-medium text-sm mb-4">
                Industries
              </h4>
              <ul className="space-y-3 text-sm text-zinc-400 font-normal">
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
                      className="hover:text-zinc-100 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Architecture */}
            <div>
              <h4 className="text-zinc-200 font-medium text-sm mb-4">
                Platform
              </h4>
              <ul className="space-y-3 text-sm text-zinc-400 font-normal">
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
                      className="hover:text-zinc-100 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-zinc-200 font-medium text-sm mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-zinc-400 font-normal">
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
                      className="hover:text-zinc-100 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-normal text-zinc-400">
            <span>
              &copy; {new Date().getFullYear()} StarX Flow. All rights reserved.
            </span>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-center">
              <Link href="/dashboard" className="hover:text-emerald-300 transition-colors font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Dashboard
              </Link>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-zinc-700" />
              <Link href="/admin/login" className="hover:text-zinc-200 transition-colors">
                Admin Login
              </Link>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-zinc-700" />
              <span className="font-mono text-zinc-500">starx-flow.runs-on.dev</span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-zinc-700" />
              <span className="flex items-center gap-1.5 text-zinc-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                TLS 1.3 Transport &amp; At-Rest Encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
