import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

export type StepState = 'locked' | 'available' | 'active' | 'complete' | 'skipped' | 'error';

export interface OnboardingStep {
  id: string;
  label: string;
  timeEstimate: string;
  state: StepState;
  dependencies: string[];
  route: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface AIConfig {
  businessName: string;
  tone: 'Friendly' | 'Professional' | 'Casual' | 'Urgent';
  faqs: FAQItem[];
  responseStyle: string;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
    days: string[];
  };
  handoffRules: string;
}

export interface TestResults {
  whatsapp: boolean;
  instagram: boolean;
  sms: boolean;
}

const DEFAULT_STEPS: OnboardingStep[] = [
  { id: 'account',   label: 'Account Setup',      timeEstimate: '~2 min',  state: 'available', dependencies: [],          route: '/setup/account' },
  { id: 'whatsapp',  label: 'Connect WhatsApp',   timeEstimate: '~3 min',  state: 'locked',    dependencies: ['account'], route: '/setup/whatsapp' },
  { id: 'instagram', label: 'Connect Instagram',  timeEstimate: '~2 min',  state: 'locked',    dependencies: ['account'], route: '/setup/instagram' },
  { id: 'sms',       label: 'Connect SMS',        timeEstimate: '~2 min',  state: 'locked',    dependencies: ['account'], route: '/setup/sms' },
  { id: 'ai',        label: 'Train Your Assistant', timeEstimate: '~3 min', state: 'locked',   dependencies: ['account'], route: '/setup/ai' },
  { id: 'test',      label: 'Test Setup',         timeEstimate: '~2 min',  state: 'locked',    dependencies: ['account'], route: '/setup/test' },
  { id: 'launch',    label: 'Go Live',            timeEstimate: '~1 min',  state: 'locked',    dependencies: ['test'],    route: '/setup/launch' },
];

const DEFAULT_AI_CONFIG: AIConfig = {
  businessName: '',
  tone: 'Friendly',
  faqs: [],
  responseStyle: 'conversational',
  businessHours: { start: '09:00', end: '17:00', timezone: 'UTC', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  handoffRules: 'Transfer to human when customer is upset or requests a manager',
};

/* ──────────────────────────────────────────────
   STORE INTERFACE
   ────────────────────────────────────────────── */

interface OnboardingState {
  isComplete: boolean;
  isFetching: boolean;
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  steps: OnboardingStep[];
  aiConfig: AIConfig;
  testResults: TestResults;
  readinessScore: number;
  lastActiveStep: string;

  // Computed
  progressPercent: number;
  remainingMinutes: number;

  // Actions
  fetchOnboarding: () => Promise<void>;
  completeStep: (stepId: string) => Promise<void>;
  skipStep: (stepId: string) => Promise<void>;
  setCurrentStep: (stepId: string) => Promise<void>;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  saveAIConfig: () => Promise<void>;
  markTestSent: (channel: 'whatsapp' | 'instagram' | 'sms') => Promise<void>;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  reset: () => void;
}

function computeProgress(completedSteps: string[], skippedSteps: string[]) {
  const totalSteps = DEFAULT_STEPS.length;
  const doneCount = completedSteps.length + skippedSteps.length;
  const progressPercent = Math.round((doneCount / totalSteps) * 100);

  // Remaining time estimate (minutes)
  const timeMap: Record<string, number> = {
    account: 2, whatsapp: 3, instagram: 2, sms: 2, ai: 3, test: 2, launch: 1,
  };
  const remainingMinutes = DEFAULT_STEPS
    .filter(s => !completedSteps.includes(s.id) && !skippedSteps.includes(s.id))
    .reduce((sum, s) => sum + (timeMap[s.id] || 2), 0);

  return { progressPercent, remainingMinutes };
}

function computeStepStates(
  steps: OnboardingStep[],
  completedSteps: string[],
  skippedSteps: string[],
  currentStep: string
): OnboardingStep[] {
  return steps.map(step => {
    if (completedSteps.includes(step.id)) return { ...step, state: 'complete' as StepState };
    if (skippedSteps.includes(step.id)) return { ...step, state: 'skipped' as StepState };
    if (step.id === currentStep) return { ...step, state: 'active' as StepState };
    const depsmet = step.dependencies.every(
      d => completedSteps.includes(d) || skippedSteps.includes(d)
    );
    return { ...step, state: depsmet ? 'available' : 'locked' as StepState };
  });
}

// LocalStorage helpers for robust offline/fallback mode
const LOCAL_STORAGE_KEY = 'starx_onboarding_state';

function saveToLocalStorage(state: Partial<OnboardingState>, userId?: string) {
  try {
    const dataToSave = {
      isComplete: state.isComplete,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      skippedSteps: state.skippedSteps,
      aiConfig: state.aiConfig,
      testResults: state.testResults,
      readinessScore: state.readinessScore,
      lastActiveStep: state.lastActiveStep,
      userId: userId || undefined
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('[StarX Onboarding] Error saving to localStorage:', e);
  }
}

function loadFromLocalStorage(): Partial<OnboardingState> | null {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('[StarX Onboarding] Error loading from localStorage:', e);
    return null;
  }
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isComplete: false,
  isFetching: false,
  currentStep: 'account',
  completedSteps: [],
  skippedSteps: [],
  steps: DEFAULT_STEPS,
  aiConfig: DEFAULT_AI_CONFIG,
  testResults: { whatsapp: false, instagram: false, sms: false },
  readinessScore: 0,
  lastActiveStep: 'account',
  progressPercent: 0,
  remainingMinutes: 15,

  fetchOnboarding: async () => {
    if (get().isFetching) return;
    set({ isFetching: true });
    
    try {
      // 1. Get current user
      let user: any = null;
      if (isSupabaseConfigured) {
        user = (await supabase.auth.getUser()).data.user;
      }
      
      // 2. Try loading from LocalStorage first (for instant offline response)
      const localData = loadFromLocalStorage() as any;
      // Only use local data if it belongs to the current user (or if there's no user check enabled)
      if (localData && (!user || localData.userId === user.id)) {
        const completedSteps = localData.completedSteps || [];
        const skippedSteps = localData.skippedSteps || [];
        const currentStep = localData.currentStep || 'account';
        const { progressPercent, remainingMinutes } = computeProgress(completedSteps, skippedSteps);
        const steps = computeStepStates(DEFAULT_STEPS, completedSteps, skippedSteps, currentStep);

        set({
          ...localData,
          steps,
          progressPercent,
          remainingMinutes
        });
      }

      // 3. Query Supabase to sync/override if configured
      if (!isSupabaseConfigured || !user) {
        return;
      }

      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('[StarX Onboarding] DB Table onboarding_progress not ready yet. Using offline/local storage.');
      } else if (data) {
        const completedSteps: string[] = data.completed_steps || [];
        const skippedSteps: string[] = data.skipped_steps || [];
        const currentStep: string = data.current_step || 'account';
        const { progressPercent, remainingMinutes } = computeProgress(completedSteps, skippedSteps);
        const steps = computeStepStates(DEFAULT_STEPS, completedSteps, skippedSteps, currentStep);
        
        const newState = {
          isComplete: data.is_complete || false,
          currentStep,
          completedSteps,
          skippedSteps,
          steps,
          progressPercent,
          remainingMinutes,
          readinessScore: data.readiness_score || 0,
          lastActiveStep: data.last_active_step || 'account',
          aiConfig: {
            businessName: data.ai_business_name || '',
            tone: (data.ai_tone as AIConfig['tone']) || 'Friendly',
            faqs: data.ai_faqs || [],
            responseStyle: data.ai_response_style || 'conversational',
            businessHours: data.ai_business_hours || DEFAULT_AI_CONFIG.businessHours,
            handoffRules: data.ai_handoff_rules || DEFAULT_AI_CONFIG.handoffRules,
          },
          testResults: {
            whatsapp: data.test_whatsapp_sent || false,
            instagram: data.test_instagram_sent || false,
            sms: data.test_sms_sent || false,
          },
        };

        set(newState);
        saveToLocalStorage(newState as any, user.id);
      }
    } catch (e) {
      console.error('[StarX Onboarding] fetchOnboarding error:', e);
    } finally {
      set({ isFetching: false });
    }
  },

  completeStep: async (stepId: string) => {
    const { completedSteps, skippedSteps, steps } = get();
    if (completedSteps.includes(stepId)) return;
    const newCompleted = [...completedSteps, stepId];
    const { progressPercent, remainingMinutes } = computeProgress(newCompleted, skippedSteps);
    const newSteps = computeStepStates(steps, newCompleted, skippedSteps, stepId);
    
    const newState = { completedSteps: newCompleted, progressPercent, remainingMinutes, steps: newSteps };
    set(newState);

    if (!isSupabaseConfigured) {
      saveToLocalStorage({ ...get(), ...newState } as any);
      return;
    }
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      saveToLocalStorage({ ...get(), ...newState } as any, user.id);
      await supabase.from('onboarding_progress').update({
        completed_steps: newCompleted,
        current_step: stepId,
        last_active_step: stepId,
        last_active_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    } catch (e) {
      console.warn('[StarX Onboarding] completeStep DB sync failed:', e);
    }
  },

  skipStep: async (stepId: string) => {
    const { completedSteps, skippedSteps, steps } = get();
    if (skippedSteps.includes(stepId)) return;
    const newSkipped = [...skippedSteps, stepId];
    const { progressPercent, remainingMinutes } = computeProgress(completedSteps, newSkipped);
    const newSteps = computeStepStates(steps, completedSteps, newSkipped, stepId);
    
    const newState = { skippedSteps: newSkipped, progressPercent, remainingMinutes, steps: newSteps };
    set(newState);

    if (!isSupabaseConfigured) {
      saveToLocalStorage({ ...get(), ...newState } as any);
      return;
    }
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      saveToLocalStorage({ ...get(), ...newState } as any, user.id);
      await supabase.from('onboarding_progress').update({
        skipped_steps: newSkipped,
        current_step: stepId,
        last_active_step: stepId,
        last_active_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    } catch (e) {
      console.warn('[StarX Onboarding] skipStep DB sync failed:', e);
    }
  },

  setCurrentStep: async (stepId: string) => {
    const { completedSteps, skippedSteps, steps } = get();
    const newSteps = computeStepStates(steps, completedSteps, skippedSteps, stepId);
    
    const newState = { currentStep: stepId, steps: newSteps };
    set(newState);

    if (!isSupabaseConfigured) {
      saveToLocalStorage({ ...get(), ...newState } as any);
      return;
    }
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      saveToLocalStorage({ ...get(), ...newState } as any, user.id);
      await supabase.from('onboarding_progress').update({
        current_step: stepId,
        last_active_step: stepId,
        last_active_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    } catch (e) {
      console.warn('[StarX Onboarding] setCurrentStep DB sync failed:', e);
    }
  },

  updateAIConfig: (config: Partial<AIConfig>) => {
    set(state => {
      const newConfig = { ...state.aiConfig, ...config };
      // Can't easily get user.id synchronously here without rewriting the store logic.
      // The DB save action (saveAIConfig) will persist it properly anyway.
      saveToLocalStorage({ ...state, aiConfig: newConfig } as any);
      return { aiConfig: newConfig };
    });
  },

  saveAIConfig: async () => {
    const { aiConfig } = get();
    if (!isSupabaseConfigured) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      await supabase.from('onboarding_progress').update({
        ai_business_name: aiConfig.businessName,
        ai_tone: aiConfig.tone,
        ai_faqs: aiConfig.faqs,
        ai_response_style: aiConfig.responseStyle,
        ai_business_hours: aiConfig.businessHours,
        ai_handoff_rules: aiConfig.handoffRules,
      }).eq('user_id', user.id);
    } catch (e) {
      console.warn('[StarX Onboarding] saveAIConfig DB sync failed:', e);
    }
  },

  markTestSent: async (channel: 'whatsapp' | 'instagram' | 'sms') => {
    const { testResults } = get();
    const newResults = { ...testResults, [channel]: true };
    set({ testResults: newResults });

    if (!isSupabaseConfigured) {
      saveToLocalStorage({ ...get(), testResults: newResults } as any);
      return;
    }
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      saveToLocalStorage({ ...get(), testResults: newResults } as any, user.id);

      const updateField = `test_${channel}_sent`;
      await supabase.from('onboarding_progress').update({
        [updateField]: true
      }).eq('user_id', user.id);
    } catch (e) {
      console.warn('[StarX Onboarding] markTestSent DB sync failed:', e);
    }
  },

  completeOnboarding: async () => {
    set({ isComplete: true });

    if (!isSupabaseConfigured) {
      saveToLocalStorage({ ...get(), isComplete: true } as any);
      return;
    }
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      saveToLocalStorage({ ...get(), isComplete: true } as any, user.id);

      // We use local storage primarily now as the DB table isn't created in all envs
      // await supabase.from('onboarding_progress').update({...
    } catch (e) {
      console.warn('[StarX Onboarding] completeOnboarding DB sync failed:', e);
    }
  },

  skipOnboarding: async () => {
    set({ isComplete: true });

    if (!isSupabaseConfigured) {
      saveToLocalStorage({ ...get(), isComplete: true } as any);
      return;
    }
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      saveToLocalStorage({ ...get(), isComplete: true } as any, user.id);

      // We use local storage primarily now as the DB table isn't created in all envs
      // await supabase.from('onboarding_progress').update({...
    } catch (e) {
      console.warn('[StarX Onboarding] skipOnboarding DB sync failed:', e);
    }
  },

  reset: () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    
    set({
      isComplete: false,
      isFetching: false,
      currentStep: 'account',
      completedSteps: [],
      skippedSteps: [],
      steps: DEFAULT_STEPS,
      aiConfig: DEFAULT_AI_CONFIG,
      testResults: { whatsapp: false, instagram: false, sms: false },
      readinessScore: 0,
      lastActiveStep: 'account',
      progressPercent: 0,
      remainingMinutes: 15,
    });
  }
}));
