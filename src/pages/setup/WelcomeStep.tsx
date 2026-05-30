import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { Sparkles, MessageSquare, ArrowRight, Bot, Shield, Zap } from 'lucide-react';

export function WelcomeStep() {
  const navigate = useNavigate();
  const { skipOnboarding, setCurrentStep } = useOnboardingStore();

  const handleStart = async () => {
    // Set current active step to account and navigate
    await setCurrentStep('account');
    navigate('/setup/account');
  };

  const handleSkip = async () => {
    if (confirm('Are you sure you want to skip the guided setup? You can always complete your connection tasks later from the dashboard.')) {
      await skipOnboarding();
      navigate('/dashboard');
    }
  };

  const benefits = [
    {
      icon: <Bot className="w-5 h-5 text-emerald-400" />,
      title: "Train Your Custom AI",
      desc: "Upload FAQs and set response tones to let our AI handle customer queries instantly."
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      title: "Unified Messaging",
      desc: "Connect WhatsApp, Instagram, and SMS into one centralized operations hub."
    },
    {
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      title: "Automate Workflows",
      desc: "Instantly trigger notifications, follow-ups, and actions when messages arrive."
    }
  ];

  return (
    <StepCard>
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-4 md:py-8">
        
        {/* Glow behind icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl glass-panel border border-white/[0.08] text-emerald-400">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
          Welcome to <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">StarX Flow</span>
        </h1>
        
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
          Let's get your business connected. In about 10 minutes, we'll set up your channels, train your AI assistant, and send a test message to ensure everything works flawlessly.
        </p>

        {/* Benefits Grid */}
        <div className="grid gap-4 w-full text-left mb-8">
          {benefits.map((benefit, i) => (
            <div 
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.06] transition-all duration-300"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{benefit.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center items-center">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]"
          >
            <span>Begin Guided Setup</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-400 font-semibold text-sm hover:bg-white/[0.04] hover:text-white transition-all duration-300"
          >
            Skip to Dashboard
          </button>
        </div>

        {/* Secure badge */}
        <div className="flex items-center gap-1.5 mt-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
          <span>Enterprise-Grade End-to-End Encryption</span>
        </div>

      </div>
    </StepCard>
  );
}
