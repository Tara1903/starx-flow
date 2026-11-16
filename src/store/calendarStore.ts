import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Appointment, WorkingHours } from '../types/database';
import { useAuthStore } from './authStore';

interface CalendarState {
  appointments: Appointment[];
  workingHours: WorkingHours[];
  isLoading: boolean;
  selectedDate: Date;

  fetchAppointments: () => Promise<void>;
  createAppointment: (
    apt: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<{ appointment: Appointment | null; conflictError?: string; error: string | null }>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<{ error: string | null }>;
  deleteAppointment: (id: string) => Promise<{ error: string | null }>;
  setSelectedDate: (date: Date) => void;
}

const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    user_id: 'demo-sarah-jenkins',
    lead_id: 'lead-1',
    customer_name: 'Sarah Jenkins',
    customer_phone: '+44 7700 900123',
    service_name: 'Deep Tissue Massage',
    notes: 'First-time client appointment via WhatsApp',
    timezone: 'Europe/London',
    start_time: new Date(Date.now() + 3600000 * 2).toISOString(),
    end_time: new Date(Date.now() + 3600000 * 3).toISOString(),
    status: 'confirmed',
    reminder_sent: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-2',
    user_id: 'demo-sarah-jenkins',
    lead_id: 'lead-2',
    customer_name: 'Marcus Vance',
    customer_phone: '+44 7700 900456',
    service_name: 'Initial Consultation',
    notes: 'Instagram DM booking inquiry',
    timezone: 'Europe/London',
    start_time: new Date(Date.now() + 3600000 * 5).toISOString(),
    end_time: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: 'scheduled',
    reminder_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-3',
    user_id: 'demo-sarah-jenkins',
    lead_id: 'lead-3',
    customer_name: 'Elena Rostova',
    customer_phone: '+44 7700 900789',
    service_name: 'Sports Injury Follow-up',
    notes: 'Automated 24h reminder sent',
    timezone: 'Europe/London',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    status: 'confirmed',
    reminder_sent: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-4',
    user_id: 'demo-sarah-jenkins',
    lead_id: 'lead-4',
    customer_name: 'David Chen',
    customer_phone: '+44 7700 900321',
    service_name: 'Acupuncture & Mobility',
    notes: 'Synced to Google Calendar',
    timezone: 'Europe/London',
    start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
    status: 'confirmed',
    reminder_sent: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useCalendarStore = create<CalendarState>((set, get) => ({
  appointments: SAMPLE_APPOINTMENTS,
  workingHours: [],
  isLoading: false,
  selectedDate: new Date(),

  fetchAppointments: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // If demo session or non-UUID, keep sample data without querying DB
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isUuid || !isSupabaseConfigured) {
      set({ appointments: get().appointments.length > 0 ? get().appointments : SAMPLE_APPOINTMENTS, isLoading: false });
      return;
    }

    if (get().appointments.length === 0) {
      set({ isLoading: true });
    }
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        set({ appointments: (data as Appointment[]) });
      } else {
        set({ appointments: isUuid ? [] : SAMPLE_APPOINTMENTS });
      }
    } catch (err: any) {
      console.warn('[CalendarStore] fetchAppointments failed:', err.message);
      set({ appointments: isUuid ? [] : SAMPLE_APPOINTMENTS });
    } finally {
      set({ isLoading: false });
    }
  },

  createAppointment: async (aptData) => {
    const user = useAuthStore.getState().user;
    if (!user) return { appointment: null, error: 'User not logged in' };

    const newStart = new Date(aptData.start_time).getTime();
    const newEnd = new Date(aptData.end_time).getTime();

    if (newEnd <= newStart) {
      return { appointment: null, error: 'End time must be after start time' };
    }

    // 1. Conflict detection against active appointments
    const existing = get().appointments;
    const hasConflict = existing.some((apt) => {
      if (apt.status === 'cancelled') return false;
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      // Overlap formula: (StartA < EndB) and (EndA > StartB)
      return newStart < aptEnd && newEnd > aptStart;
    });

    if (hasConflict) {
      return {
        appointment: null,
        conflictError: 'Time slot conflict detected. An appointment is already scheduled during this window.',
        error: 'Conflict detected',
      };
    }

    const fallbackApt: Appointment = {
      id: `apt-${Date.now()}`,
      user_id: user.id,
      customer_name: aptData.customer_name,
      customer_phone: aptData.customer_phone || null,
      customer_email: aptData.customer_email || null,
      service_name: aptData.service_name,
      start_time: aptData.start_time,
      end_time: aptData.end_time,
      timezone: aptData.timezone || 'Europe/Berlin',
      status: aptData.status || 'scheduled',
      notes: aptData.notes || null,
      reminder_sent: aptData.reminder_sent || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({ appointments: [...state.appointments, fallbackApt] }));

    if (!isSupabaseConfigured) {
      return { appointment: fallbackApt, error: null };
    }

    // 2. Persist to DB
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          customer_name: aptData.customer_name,
          customer_phone: aptData.customer_phone || null,
          customer_email: aptData.customer_email || null,
          service_name: aptData.service_name,
          start_time: aptData.start_time,
          end_time: aptData.end_time,
          timezone: aptData.timezone || 'Europe/Berlin',
          status: aptData.status || 'scheduled',
          notes: aptData.notes || null,
          reminder_sent: false,
        })
        .select()
        .single();

      if (error) throw error;
      const created: Appointment = (data as Appointment) || fallbackApt;
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === fallbackApt.id ? created : a)),
      }));
      return { appointment: created, error: null };
    } catch (err: any) {
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== fallbackApt.id),
      }));
      return { appointment: null, error: err.message };
    }
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  deleteAppointment: async (id) => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id),
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
}));
