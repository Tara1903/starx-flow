"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

import { useOnboardingStore } from '../../../store/onboardingStore';
import { StepCard } from '../../../components/setup/StepCard';
import { Sparkles, MessageSquare, ArrowRight, Bot, Shield, Zap } from 'lucide-react';

export default function WelcomeStep() {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const { skipOnboarding, setCurrentStep } = useOnboardingStore();

  const handleStart = async () => {
    // Set current active step to account and navigate
    await setCurrentStep('account');
    router.push('/setup/account');
  };

  const handleSkip = async () => {
    if (confirm('Are you sure you want to skip the guided setup? You can always complete your connection tasks later from the dashboard.')) {
      if (saving) return;
      setSaving(true);
      setError("");
      try {
        await skipOnboarding();
        router.replace('/dashboard');
      } catch {
        setError('Could not save setup. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const benefits = [
    {
      icon: <Bot className="w-5 h-5 text-emerald-400" />,
      title: "Train Your Custom AI",
      desc: "Upload FAQs and set response tones to let our AI handle customer queries instantly."
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-emerald-300" />,
      title: "Unified Messaging",
      desc: "Connect WhatsApp, Instagram, and SMS into one centralized operations hub."
    },
    {
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      title: "Automate Workflows",
      desc: "Instantly trigger notifications, follow-ups, and actions when messages arrive."
    }
  ];

  return (
    <StepCard>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-4 md:py-8">
        
        {/* Glow behind icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl glass-panel border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(40,223,160,0.18)]">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

        <h1 className="font-editorial text-3xl md:text-5xl font-bold tracking-tight text-white mb-3 leading-[1.1]">
          Welcome to <span className="text-gradient-emerald">StarX Flow</span>
        </h1>
        
        <p className="text-[#b8c9bd] text-sm md:text-base leading-relaxed mb-8 max-w-lg font-normal">
          Let&apos;s get your business connected. In about 10 minutes, we&apos;ll set up your channels, train your AI assistant, and send a test message to ensure everything works flawlessly.
        </p>

        {/* Benefits Grid */}
        <div className="grid gap-4 w-full text-left mb-8">
          {benefits.map((benefit, i) => (
            <div 
              key={i}
              className="glass-panel glass-panel-hover flex items-start gap-4 p-4 rounded-xl border border-emerald-500/15"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 text-emerald-400">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{benefit.title}</h3>
                <p className="text-xs text-[#b8c9bd] mt-0.5 leading-relaxed font-normal">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-center items-center">
          <button
            onClick={handleStart}
            className="spatial-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Begin Guided Setup</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            disabled={saving} onClick={handleSkip}
            className="spatial-btn-secondary w-full sm:w-auto cursor-pointer"
          >
            Skip to Dashboard
          </button>
        </div>

        {/* Secure badge */}
        <div className="flex items-center gap-1.5 mt-8 text-[10px] font-mono font-bold text-[#b8c9bd]/60 uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Enterprise-Grade End-to-End Encryption</span>
        </div>

      </div>
    </StepCard>
  );
}
