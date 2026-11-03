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

export const useCalendarStore = create<CalendarState>((set, get) => ({
  appointments: [],
  workingHours: [],
  isLoading: false,
  selectedDate: new Date(),

  fetchAppointments: async () => {
    const user = useAuthStore.getState().user;
    if (!user || !isSupabaseConfigured) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      set({ appointments: (data as Appointment[]) || [] });
    } catch (err: any) {
      console.warn('[CalendarStore] fetchAppointments failed:', err.message);
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

      const created: Appointment = (data as Appointment) || {
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
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({ appointments: [...state.appointments, created] }));
      return { appointment: created, error: null };
    } catch (err: any) {
      const created: Appointment = {
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
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({ appointments: [...state.appointments, created] }));
      return { appointment: created, error: null };
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
