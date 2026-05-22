import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore, FAQItem } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { Loader2, Check, ArrowRight, Bot, Plus, Trash2, HelpCircle } from 'lucide-react';

export function AIConfigStep() {
  const navigate = useNavigate();
  const { aiConfig, updateAIConfig, saveAIConfig, completeStep } = useOnboardingStore();

  const [businessName, setBusinessName] = useState(aiConfig.businessName || '');
  const [tone, setTone] = useState(aiConfig.tone || 'Friendly');
  const [responseStyle, setResponseStyle] = useState(aiConfig.responseStyle || 'conversational');
  const [handoffRules, setHandoffRules] = useState(aiConfig.handoffRules || '');
  
  // Interactive FAQs
  const [faqs, setFaqs] = useState<FAQItem[]>(aiConfig.faqs || [
    { question: 'What are your business hours?', answer: 'We are open Monday to Friday from 9 AM to 5 PM.' },
    { question: 'Where are you located?', answer: 'We are located at 123 Automation Way in downtown.' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddFAQ = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFaqs([...faqs, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sync local component state back to OnboardingStore
      updateAIConfig({
        businessName,
        tone: tone as any,
        responseStyle,
        faqs,
        handoffRules
      });

      // Save config to DB/LocalStorage
      await saveAIConfig();

      // Complete step
      await completeStep('ai');

      setIsSaved(true);
      setTimeout(() => {
        navigate('/setup/test');
      }, 800);
    } catch (err) {
      console.error('[StarX Onboarding] AI Config save failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tones: { label: string; desc: string; color: string }[] = [
    { label: 'Friendly', desc: 'Warm, welcoming & empathetic.', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
    { label: 'Professional', desc: 'Sleek, polite & business-focused.', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5' },
    { label: 'Casual', desc: 'Relaxed, friendly & conversational.', color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' },
    { label: 'Urgent', desc: 'Direct, speed-oriented & concise.', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5' }
  ];

  return (
    <StepCard>
      <StepHeader 
        stepNumber={5} 
        totalSteps={6}
        title="Train Your Assistant" 
        description="Give your AI assistant its business persona and upload standard answers (FAQs) so it can respond to customers automatically."
        timeEstimate="~3 min"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6 max-w-xl">
        
        {/* Assistant Personality Section */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Assistant Personality & Tone</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {tones.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setTone(t.label as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  tone === t.label 
                    ? `${t.color} ring-1 ring-offset-1 ring-offset-black ring-emerald-500/30` 
                    : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02]'
                }`}
              >
                <div className="text-xs font-bold text-white mb-0.5">{t.label}</div>
                <div className="text-[10px] text-zinc-400 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Business FAQs (Core Training Data) */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Knowledge Base (FAQs)</span>
            <span className="text-[10px] text-zinc-600 lowercase">{faqs.length} loaded</span>
          </h4>

          {/* Active FAQs list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {faqs.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-white/[0.06] rounded-xl">
                No FAQs uploaded yet. Add FAQs below to train the bot.
              </div>
            ) : (
              faqs.map((faq, i) => (
                <div 
                  key={i}
                  className="flex gap-2 justify-between items-start p-3 rounded-xl border border-white/[0.04] bg-white/[0.01]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{faq.question}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed break-words">{faq.answer}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFAQ(i)}
                    className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Form to add FAQ */}
          <div className="p-3 rounded-xl border border-white/[0.06] bg-[#090909] space-y-2.5">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Add Training Question</div>
            
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. Do you accept walk-ins?"
              className="w-full bg-black border border-white/[0.08] focus:border-emerald-500/50 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-700 outline-none transition-all"
            />
            
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="e.g. Yes, we accept walk-ins based on designer availability, but bookings are recommended!"
              rows={2}
              className="w-full bg-black border border-white/[0.08] focus:border-emerald-500/50 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-700 outline-none transition-all resize-none"
            />

            <button
              type="button"
              onClick={handleAddFAQ}
              className="py-1.5 px-3 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-[10px] flex items-center gap-1 ml-auto transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ to Training</span>
            </button>
          </div>
        </div>

        {/* Human Handoff Rules */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
            <span>Handoff to Human Agent Rules</span>
            <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
          </label>
          <textarea
            value={handoffRules}
            onChange={(e) => setHandoffRules(e.target.value)}
            placeholder="e.g. Transfer to human when customer is upset, requests a manager, or asks about pricing refunds."
            rows={2}
            className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-2">
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
                <span>Training AI Assistant...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3px]" />
                <span>AI Assistant Trained!</span>
              </>
            ) : (
              <>
                <span>Save and Train AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </StepCard>
  );
}
