"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface Props {
  primaryText?: string;
  secondaryText?: string;
  secondaryHref?: string;
  align?: 'center' | 'left';
}

export function LandingCTAButtons({
  primaryText = 'Start 14-Day Free Trial',
  secondaryText = 'Test Live AI Demo',
  secondaryHref = '/chat',
  align = 'center',
}: Props) {
  const openSignup = useUIStore((state) => state.openSignup);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-4 ${
        align === 'center' ? 'justify-center' : 'justify-start'
      }`}
    >
      <button
        onClick={openSignup}
        className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Sparkles className="w-5 h-5" />
        {primaryText}
        <ArrowRight className="w-4 h-4" />
      </button>

      <Link
        href={secondaryHref}
        className="w-full sm:w-auto px-8 py-4 rounded-full border border-zinc-700 hover:border-zinc-500 text-white font-medium transition-all flex items-center justify-center gap-2 hover:bg-white/[0.04]"
      >
        <MessageSquare className="w-4 h-4 text-emerald-400" />
        {secondaryText}
      </Link>
    </div>
  );
}
