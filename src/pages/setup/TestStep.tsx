import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { Loader2, Check, ArrowRight, MessageSquare, Send, Bot, Phone, RefreshCw } from 'lucide-react';

export function TestStep() {
  const navigate = useNavigate();
  const { connectedChannels } = useAuthStore();
  const { testResults, markTestSent, completeStep, aiConfig } = useOnboardingStore();

  const [testingChannel, setTestingChannel] = useState<'whatsapp' | 'instagram' | 'sms'>('sms');
  const [testState, setTestState] = useState<'idle' | 'sending' | 'delivered' | 'typing' | 'replied'>('idle');
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([]);

  // Find which channels are actually connected to prioritize them in UI
  const whatsappConnected = connectedChannels.find(c => c.channelKey === 'WhatsApp')?.isConnected || false;
  const instagramConnected = connectedChannels.find(c => c.channelKey === 'Instagram')?.isConnected || false;
  const smsConnected = connectedChannels.find(c => c.channelKey === 'SMS')?.isConnected || false;

  useEffect(() => {
    // Pick the first connected channel to show, or fall back to web sandbox
    if (whatsappConnected) setTestingChannel('whatsapp');
    else if (instagramConnected) setTestingChannel('instagram');
    else if (smsConnected) setTestingChannel('sms');
    else setTestingChannel('sms'); // default to sms if none connected
  }, [whatsappConnected, instagramConnected, smsConnected]);

  const handleSendTest = async () => {
    setTestState('sending');
    setMessages([]);

    const toneEmoji = aiConfig.tone === 'Friendly' ? ' 😊' : aiConfig.tone === 'Casual' ? ' ✨' : '';
    const responseText = aiConfig.faqs[0]?.answer || "We are open Monday to Friday from 9 AM to 5 PM.";
    
    // 1. Customer sends message
    setTimeout(() => {
      setMessages([{ sender: 'user', text: "Hey! What are your business hours?", time: 'Just now' }]);
      setTestState('delivered');
      
      const channelLabel = testingChannel === 'whatsapp' ? 'WhatsApp' : testingChannel === 'instagram' ? 'Instagram' : 'SMS';

      // 2. AI Bot starts typing
      setTimeout(() => {
        setTestState('typing');

        // 3. AI Bot replies
        setTimeout(async () => {
          setMessages(prev => [
            ...prev,
            { 
              sender: 'bot', 
              text: `Hey! Thanks for reaching out. ${responseText}${toneEmoji}`, 
              time: 'Just now' 
            }
          ]);
          setTestState('replied');

          // Mark this channel test as complete in Zustand store
          await markTestSent(testingChannel);
        }, 1500);

      }, 1000);

    }, 800);
  };

  const handleNext = async () => {
    await completeStep('test');
    navigate('/setup/launch');
  };

  const channelOptions = [
    { id: 'whatsapp', label: 'WhatsApp', connected: whatsappConnected, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    { id: 'instagram', label: 'Instagram', connected: instagramConnected, color: 'bg-pink-500/10 border-pink-500/20 text-pink-400' },
    { id: 'sms', label: 'SMS / Twilio', connected: smsConnected, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' }
  ];

  return (
    <StepCard>
      <StepHeader 
        stepNumber={6} 
        totalSteps={6}
        title="Test Your Assistant" 
        description="Let's send a simulated live message to your trained assistant and watch how it handles responses instantly."
        timeEstimate="~2 min"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
        
        {/* Left Side Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Select Channel to Test
            </span>
            <div className="flex flex-col gap-2">
              {channelOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTestingChannel(opt.id as any);
                    setTestState('idle');
                    setMessages([]);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    testingChannel === opt.id 
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                      : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${opt.connected ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    {opt.label}
                  </span>
                  
                  {opt.connected ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Connected</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-zinc-600">Not connected</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-3">
            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Test Scenario</h5>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              We'll trigger a sample customer inquiry asking about your **business hours**. The AI assistant will fetch the answers from the knowledge FAQs you supplied and auto-respond in a **{aiConfig.tone}** tone.
            </p>

            <button
              onClick={handleSendTest}
              disabled={testState === 'sending' || testState === 'typing'}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              {testState === 'sending' || testState === 'typing' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Test Run...</span>
                </>
              ) : testState === 'replied' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Again</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Trigger Test Message</span>
                </>
              )}
            </button>
          </div>

          {testState === 'replied' && (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse"
            >
              <span>Test Successful! Go Live</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Right Side - Interactive Phone Simulation Frame */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-[280px] h-[480px] bg-[#050505] border-[6px] border-zinc-900 rounded-[36px] shadow-[0_0_50px_rgba(16,185,129,0.02),0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
            
            {/* Phone Speaker Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-zinc-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-8 h-1 bg-zinc-800 rounded-full" />
            </div>

            {/* Simulated App Header */}
            <div className="bg-[#0c0c0c] border-b border-white/5 pt-6 pb-2.5 px-4 flex items-center gap-2 flex-shrink-0 z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-bold text-white truncate max-w-[130px]">
                  {aiConfig.businessName || 'My Assistant'}
                </div>
                <div className="text-[8px] text-emerald-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span>AI Agent Online</span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#060606] flex flex-col justify-end">
              {messages.length === 0 && testState === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="w-6 h-6 text-zinc-700 mb-2 animate-bounce" />
                  <p className="text-[9px] text-zinc-500 max-w-[160px] leading-relaxed">
                    Click "Trigger Test Message" on the left to start simulator.
                  </p>
                </div>
              )}

              {testState === 'sending' && (
                <div className="flex justify-end pr-2 animate-pulse">
                  <div className="bg-zinc-800/40 text-[10px] text-zinc-400 px-3 py-1.5 rounded-xl rounded-tr-none">
                    Sending...
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-scale`}
                >
                  <div className={`max-w-[85%] text-[10px] px-3 py-2 rounded-2xl leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-tr-none' 
                      : 'bg-white/[0.03] border border-white/[0.04] text-zinc-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {testState === 'typing' && (
                <div className="flex justify-start pl-2 animate-pulse">
                  <div className="bg-white/[0.02] border border-white/[0.04] text-[9px] text-zinc-500 px-3 py-1.5 rounded-xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Footer Mock */}
            <div className="bg-[#0c0c0c] border-t border-white/5 p-2 px-3 flex-shrink-0 flex items-center justify-between">
              <div className="text-[9px] text-zinc-600">Replies automatically in real-time</div>
            </div>

          </div>
        </div>

      </div>
    </StepCard>
  );
}
