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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>24/7 AI Receptionist Concierge</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Experience StarX Live Chat
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Communicate with our 24/7 AI Receptionist configured for European local businesses. Click the floating chat bubble to inquire about services, opening hours, pricing, or to book an appointment.
        </p>

        <div className="grid grid-cols-2 gap-4 text-left pt-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Instant Response
            </h4>
            <p className="text-zinc-400 text-xs">Replies in under 1 second with grounded business knowledge.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              GDPR Compliant
            </h4>
            <p className="text-zinc-400 text-xs">Full privacy, zero prompt injection leakage, and tenant isolation.</p>
          </div>
        </div>

        <div className="pt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
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
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading AI Receptionist...</div>}>
      <ChatContent />
    </Suspense>
  );
}
