"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WebChatWidget } from "@/components/chat/WebChatWidget";
import { Bot, Sparkles, CheckCircle2, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

function ChatContent() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("orgId") || searchParams.get("businessId") || undefined;

  return (
    <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col items-center justify-center p-6 pt-32 pb-20 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Background Emerald Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(40, 223, 160, 0.15) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 75%)",
        }}
      />

      <div className="max-w-xl w-full text-center space-y-6 relative z-10">
        <div className="spatial-pill-badge mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          24/7 AI Receptionist Concierge
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
          Experience StarX <br />
          <span className="text-gradient-emerald">Live AI Chat</span>
        </h1>

        <p className="text-[#b8c9bd] text-sm sm:text-base leading-relaxed font-normal">
          Communicate with our 24/7 AI Receptionist configured for European local businesses. Click the floating chat bubble to inquire about services, opening hours, pricing, or to book an appointment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
          <div className="glass-panel p-5 border-emerald-500/20">
            <h4 className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Instant Response
            </h4>
            <p className="text-[#b8c9bd] text-xs leading-relaxed font-normal">Replies in under 1 second with grounded business knowledge.</p>
          </div>
          <div className="glass-panel p-5 border-emerald-500/20">
            <h4 className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              GDPR Compliant
            </h4>
            <p className="text-[#b8c9bd] text-xs leading-relaxed font-normal">Full privacy, zero prompt injection leakage, and tenant isolation.</p>
          </div>
        </div>

        <div className="pt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#b8c9bd] hover:text-emerald-300 transition-colors font-medium"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Floating Web Chat Widget */}
      <WebChatWidget organizationId={orgId} />
    </div>
  );
}

export default function ChatTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020a07] text-[#b8c9bd] flex items-center justify-center">Loading AI Receptionist...</div>}>
      <ChatContent />
    </Suspense>
  );
}
