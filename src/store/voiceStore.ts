import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type Call } from './authStore';

interface VoiceState {
  calls: Call[];
  fetchCalls: () => Promise<void>;
  addCall: (call: Omit<Call, 'id' | 'createdAt'>) => Promise<void>;
  updateCall: (id: string, updates: Partial<Call>) => Promise<void>;
  resetVoiceStore: () => void;
}

function dbRowToCall(row: Record<string, unknown>): Call {
  return {
    id: row.id as string,
    leadId: (row.lead_id as string) || null,
    customerName: (row.customer_name as string) || '',
    customerPhone: (row.customer_phone as string) || '',
    direction: (row.direction as Call['direction']) || 'inbound',
    status: (row.status as Call['status']) || 'completed',
    durationSeconds: (row.duration_seconds as number) || 0,
    recordingUrl: (row.recording_url as string) || '',
    transcription: (row.transcription as Call['transcription']) || [],
    summary: (row.summary as string) || '',
    sentiment: (row.sentiment as Call['sentiment']) || 'neutral',
    callMemory: (row.call_memory as Call['callMemory']) || [],
    createdAt: row.created_at as string,
  };
}

export const DEFAULT_VOICE_CALLS: Call[] = [
  {
    id: "call-1",
    leadId: "lead-1",
    customerName: "Dr. Sarah Jenkins",
    customerPhone: "+44 7911 123456",
    direction: "inbound",
    status: "completed",
    durationSeconds: 94,
    recordingUrl: "",
    transcription: [
      { role: "agent", text: "Good morning! You've reached Apex Physiotherapy AI receptionist. How may I assist you today?", timestamp: "0:02" },
      { role: "customer", text: "Hi, I have an appointment scheduled for tomorrow at 2 PM, but I need to push it to Thursday afternoon if possible.", timestamp: "0:12" },
      { role: "agent", text: "I can certainly arrange that for you, Dr. Jenkins. We have an opening with our principal therapist on Thursday at 2:00 PM or 3:30 PM. Which suits you better?", timestamp: "0:25" },
      { role: "customer", text: "2:00 PM on Thursday is perfect.", timestamp: "0:36" },
      { role: "agent", text: "Splendid! I have updated your booking to Thursday at 2:00 PM and dispatched a calendar confirmation to your WhatsApp.", timestamp: "0:48" },
      { role: "customer", text: "Thank you so much, very efficient!", timestamp: "0:56" },
      { role: "agent", text: "It's my absolute pleasure. Have a wonderful day!", timestamp: "1:02" },
    ],
    summary: "Customer called to reschedule tomorrow's physiotherapy session. Moved booking to Thursday 14:00. Sent instant WhatsApp calendar confirmation.",
    sentiment: "positive",
    callMemory: [
      { key: "rescheduled_slot", value: "Thursday 14:00" },
      { key: "satisfaction_rating", value: "5/5" },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "call-2",
    leadId: "lead-2",
    customerName: "Marcus Vance",
    customerPhone: "+44 7700 900123",
    direction: "inbound",
    status: "completed",
    durationSeconds: 142,
    recordingUrl: "",
    transcription: [
      { role: "agent", text: "Hello, welcome to Apex Wellness. How can I help you?", timestamp: "0:02" },
      { role: "customer", text: "Hi, our firm Vanguard Legal is looking to provide ergonomics and physical therapy packages for our 35 associates.", timestamp: "0:16" },
      { role: "agent", text: "We specialize in corporate preventative wellness packages for professional service firms. I can have our corporate director send over our Enterprise tier overview.", timestamp: "0:34" },
      { role: "customer", text: "That sounds great. Please send it over to marcus@vanguardlegal.com.", timestamp: "0:50" },
      { role: "agent", text: "Noted with thanks, Marcus. The corporate pack and a calendar invite for a consultation have been dispatched.", timestamp: "1:08" },
    ],
    summary: "Corporate retainer inquiry for 35 legal associates. Sent bespoke Enterprise wellness overview.",
    sentiment: "positive",
    callMemory: [
      { key: "company_size", value: "35 employees" },
      { key: "intent", value: "Corporate Retainer" },
    ],
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: "call-3",
    leadId: "lead-3",
    customerName: "Elena Rostova",
    customerPhone: "+44 7450 112233",
    direction: "outbound",
    status: "completed",
    durationSeconds: 48,
    recordingUrl: "",
    transcription: [
      { role: "agent", text: "Hello Elena, this is your StarX automated courtesy check from Apex Clinic regarding your appointment on Monday at 10:30 AM.", timestamp: "0:04" },
      { role: "customer", text: "Yes, I am confirming I will be there on time.", timestamp: "0:16" },
      { role: "agent", text: "Thank you for confirming, Elena! Our therapist is looking forward to seeing you. Reply to our text if you need directions.", timestamp: "0:28" },
    ],
    summary: "Automated outbound reminder call. Customer confirmed 100% attendance.",
    sentiment: "positive",
    callMemory: [
      { key: "attendance_confirmed", value: "Yes" },
    ],
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

export const useVoiceStore = create<VoiceState>((set, get) => ({
  calls: DEFAULT_VOICE_CALLS,

  fetchCalls: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ calls: get().calls.length > 0 ? get().calls : DEFAULT_VOICE_CALLS });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[StarX] Fetch calls error:', error);
        set({ calls: get().calls.length > 0 ? get().calls : DEFAULT_VOICE_CALLS });
        return;
      }

      if (data && data.length > 0) {
        set({ calls: data.map(dbRowToCall) });
      } else {
        set({ calls: get().calls.length > 0 ? get().calls : DEFAULT_VOICE_CALLS });
      }
    } catch (e) {
      console.error('[StarX] Fetch calls exception:', e);
      set({ calls: get().calls.length > 0 ? get().calls : DEFAULT_VOICE_CALLS });
    }
  },

  addCall: async (call) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    const tempId = `call-${Date.now()}`;

    const fresh: Call = {
      ...call,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      calls: [fresh, ...state.calls],
    }));

    if (isSupabaseConfigured && userId) {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          user_id: userId,
          lead_id: call.leadId,
          customer_name: call.customerName,
          customer_phone: call.customerPhone,
          direction: call.direction,
          status: call.status,
          duration_seconds: call.durationSeconds,
          recording_url: call.recordingUrl,
          transcription: call.transcription,
          summary: call.summary,
          sentiment: call.sentiment,
          call_memory: call.callMemory
        })
        .select()
        .single();

      if (data) {
        set((state) => ({
          calls: state.calls.map((c) =>
            c.id === tempId ? dbRowToCall(data) : c
          ),
        }));
      }
      if (error) console.error('[StarX] Add call error:', error);
    }
  },

  updateCall: async (id, updates) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.leadId !== undefined) dbUpdates.lead_id = updates.leadId;
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
    if (updates.customerPhone !== undefined) dbUpdates.customer_phone = updates.customerPhone;
    if (updates.direction !== undefined) dbUpdates.direction = updates.direction;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds;
    if (updates.recordingUrl !== undefined) dbUpdates.recording_url = updates.recordingUrl;
    if (updates.transcription !== undefined) dbUpdates.transcription = updates.transcription;
    if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
    if (updates.sentiment !== undefined) dbUpdates.sentiment = updates.sentiment;
    if (updates.callMemory !== undefined) dbUpdates.call_memory = updates.callMemory;

    set((state) => ({
      calls: state.calls.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('calls')
        .update(dbUpdates)
        .eq('id', id);

      if (error) console.error('[StarX] Update call error:', error);
    }
  },

  resetVoiceStore: () => {
    set({
      calls: [],
    });
  }
}));
