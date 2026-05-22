import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Building2, User, Phone, Briefcase, ArrowRight, Loader2, Check } from 'lucide-react';

export function AccountStep() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { completeStep, updateAIConfig } = useOnboardingStore();

  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    businessType: 'Beauty & Wellness',
    businessPhone: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prepopulate form data if user profile already has some data
  useEffect(() => {
    if (user) {
      setFormData({
        ownerName: user.name || '',
        businessName: user.businessName || '',
        businessType: user.businessType || 'Beauty & Wellness',
        businessPhone: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName.trim() || !formData.businessName.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured && user) {
        // Save to Supabase profiles table
        const { error } = await supabase
          .from('profiles')
          .update({
            owner_name: formData.ownerName,
            business_name: formData.businessName,
            business_type: formData.businessType
          })
          .eq('id', user.id);

        if (error) throw error;
      }

      // Sync state to authStore
      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            name: formData.ownerName,
            businessName: formData.businessName,
            businessType: formData.businessType
          }
        });
      }

      // Also set the business name in AI config since it's the same!
      updateAIConfig({ businessName: formData.businessName });

      // Save step progress
      await completeStep('account');
      
      setIsSaved(true);
      setTimeout(() => {
        navigate('/setup/whatsapp');
      }, 800);

    } catch (e: any) {
      console.error('[StarX Onboarding] Error saving profile:', e);
      setErrorMsg(e.message || 'Failed to save business profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    'Beauty & Wellness',
    'Medical & Dental',
    'Consulting & Agency',
    'Real Estate',
    'E-commerce',
    'Hospitality',
    'Professional Services',
    'Other'
  ];

  return (
    <StepCard>
      <StepHeader 
        stepNumber={1} 
        totalSteps={6}
        title="Business Profile" 
        description="Tell us a bit about your business so we can tailor the automated workflows and AI persona for you."
        timeEstimate="~2 min"
      />

      <form onSubmit={handleSubmit} className="space-y-5 mt-6 max-w-xl">
        {errorMsg && (
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-medium animate-shake">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Owner/Contact Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Your Name <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Alex Johnson"
                required
                disabled={isLoading || isSaved}
                className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Business Name <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Glow Aesthetics"
                required
                disabled={isLoading || isSaved}
                className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Industry/Business Type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Industry <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                disabled={isLoading || isSaved}
                className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-all focus:ring-1 focus:ring-emerald-500/20 appearance-none"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind} className="bg-black text-white">
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Phone (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Business Phone <span className="text-zinc-600">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="tel"
                value={formData.businessPhone}
                onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                placeholder="e.g. +1 (555) 019-2834"
                disabled={isLoading || isSaved}
                className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

        </div>

        {/* Form Actions */}
        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || isSaved}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isSaved 
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3px] animate-scale" />
                <span>Saved & Perfect!</span>
              </>
            ) : (
              <>
                <span>Save and Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </StepCard>
  );
}
