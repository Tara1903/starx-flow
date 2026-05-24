import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type Call } from './authStore';

const MOCK_CALLS: Call[] = [
  {
    id: 'call-1',
    leadId: 'lead-1',
    customerName: 'John Doe',
    customerPhone: '+1 (555) 123-4567',
    direction: 'inbound',
    status: 'completed',
    durationSeconds: 145,
    recordingUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop_ambience.ogg',
    transcription: [
      { role: 'customer', text: 'Hi, I would like to book a hair coloring and cut for tomorrow afternoon if possible.', timestamp: '0:02' },
      { role: 'agent', text: 'Hello John! I can certainly check that for you. We have an opening with Sarah at 2:30 PM tomorrow, or with Michael at 4:00 PM. Would either of those work?', timestamp: '0:14' },
      { role: 'customer', text: '2:30 PM with Sarah works perfectly. How long will it take?', timestamp: '0:25' },
      { role: 'agent', text: 'Excellent! That session will take about 2 hours. I have confirmed your appointment for tomorrow, May 24th at 2:30 PM with Sarah. You will receive a confirmation text shortly.', timestamp: '0:32' },
      { role: 'customer', text: 'Awesome, thank you so much! See you then.', timestamp: '0:41' },
      { role: 'agent', text: 'You are very welcome! Have a great day!', timestamp: '0:45' }
    ],
    summary: 'Customer booked a hair coloring and cut appointment with Sarah for tomorrow at 2:30 PM.',
    sentiment: 'positive',
    callMemory: [
      { key: 'appointment_booked', value: 'true' },
      { key: 'stylist_preference', value: 'Sarah' },
      { key: 'booking_date', value: 'May 24th at 2:30 PM' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'call-2',
    leadId: null,
    customerName: 'Alice Smith',
    customerPhone: '+1 (555) 987-6543',
    direction: 'inbound',
    status: 'missed',
    durationSeconds: 0,
    recordingUrl: '',
    transcription: [],
    summary: 'Missed call from Alice Smith. SMS recovery workflow was triggered automatically.',
    sentiment: 'neutral',
    callMemory: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'call-3',
    leadId: 'lead-2',
    customerName: 'Robert Johnson',
    customerPhone: '+1 (555) 555-0199',
    direction: 'outbound',
    status: 'completed',
    durationSeconds: 210,
    recordingUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    transcription: [
      { role: 'agent', text: 'Hi Robert, this is StarX receptionist calling regarding your feedback on your recent service.', timestamp: '0:03' },
      { role: 'customer', text: 'Oh hello. Yes, I was a bit unhappy because the waiting time was almost 30 minutes past my scheduled slot.', timestamp: '0:12' },
      { role: 'agent', text: 'I completely understand and apologize for the delay. We had an unexpected double-booking. To make up for this, I would like to offer you a 20% discount on your next visit.', timestamp: '0:24' },
      { role: 'customer', text: 'Well, that is very nice of you. I appreciate you calling to resolve it. I will give you another try.', timestamp: '0:36' },
      { role: 'agent', text: 'Thank you for your understanding, Robert. We look forward to providing a much better experience next time.', timestamp: '0:42' }
    ],
    summary: 'Outbound resolution call regarding a service delay. Customer accepted a 20% discount coupon and agreed to visit again.',
    sentiment: 'positive',
    callMemory: [
      { key: 'customer_issue', value: 'Long wait time (30 mins)' },
      { key: 'compensation_offered', value: '20% discount' },
      { key: 'resolution_status', value: 'Resolved' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

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

export const useVoiceStore = create<VoiceState>((set, get) => ({
  calls: [],

  fetchCalls: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ calls: MOCK_CALLS });
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
        return;
      }

      if (data && data.length > 0) {
        set({ calls: data.map(dbRowToCall) });
      } else {
        set({ calls: MOCK_CALLS });
      }
    } catch (e) {
      console.error('[StarX] Fetch calls exception:', e);
      set({ calls: MOCK_CALLS });
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
