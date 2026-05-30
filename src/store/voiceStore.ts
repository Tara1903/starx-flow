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

export const useVoiceStore = create<VoiceState>((set, get) => ({
  calls: [],

  fetchCalls: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !isSupabaseConfigured) {
      set({ calls: [] });
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
        set({ calls: [] });
      }
    } catch (e) {
      console.error('[StarX] Fetch calls exception:', e);
      set({ calls: [] });
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
