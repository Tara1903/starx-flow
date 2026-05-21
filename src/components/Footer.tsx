import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="pt-20 pb-10 px-6 border-t border-white/5 bg-zinc-950/80 relative z-10 mt-12 lg:mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand block */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="StarX Flow Logo"
                className="h-6 w-auto object-contain"
              />
            </Link>
            <p className="text-zinc-500 text-xs font-semibold leading-relaxed max-w-xs">
              The premier AI Operating System and WhatsApp Automation Platform for Local Service & Appointment-Driven Businesses. Put your front desk on autopilot.
            </p>
          </div>

          {/* Service Verticals */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Industries
            </h4>
            <ul className="space-y-3.5 text-xs text-zinc-500 font-semibold">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Gyms & Fitness</Link></li>
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Medical & Clinics</Link></li>
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Salons & Beauty</Link></li>
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Spas & Wellness</Link></li>
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Coaching & Tutors</Link></li>
            </ul>
          </div>

          {/* Platform Capabilities */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Capabilities
            </h4>
            <ul className="space-y-3.5 text-xs text-zinc-500 font-semibold">
              <li><Link to="/product" className="hover:text-emerald-400 transition-colors">WhatsApp AI Chatbots</Link></li>
              <li><Link to="/features" className="hover:text-emerald-400 transition-colors">Booking Automation</Link></li>
              <li><Link to="/features" className="hover:text-emerald-400 transition-colors">Calendar Sync</Link></li>
              <li><Link to="/features" className="hover:text-emerald-400 transition-colors">Google Review Booster</Link></li>
              <li><Link to="/product" className="hover:text-emerald-400 transition-colors">Intake Automation</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Company
            </h4>
            <ul className="space-y-3.5 text-xs text-zinc-500 font-semibold">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link to="/pricing" className="hover:text-emerald-400 transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/resources" className="hover:text-emerald-400 transition-colors">Resources & Guides</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Footer bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500">
          <span>&copy; {new Date().getFullYear()} StarX Flow. All rights reserved.</span>
          <div className="flex gap-6 items-center">
            <Link to="/admin" className="hover:text-zinc-300 transition-colors">Admin</Link>
            <span>Powered by StarX AI Architecture</span>
            <span className="flex items-center gap-1">
              <Sparkles size={10} className="text-emerald-400" />
              Secure 256-bit Encryption
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
