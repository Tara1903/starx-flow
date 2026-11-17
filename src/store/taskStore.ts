import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task } from '../types/database';
import { useAuthStore } from './authStore';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;

  fetchTasks: () => Promise<void>;
  createTask: (data: {
    title: string;
    description?: string;
    priority?: Task['priority'];
    dueDate?: string;
  }) => Promise<{ task: Task | null; error: string | null }>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<{ error: string | null }>;
  deleteTask: (id: string) => Promise<{ error: string | null }>;
}

export const DEFAULT_TASKS: Task[] = [];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ tasks: [], isLoading: false });
      return;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isUuid || !isSupabaseConfigured) {
      set({ tasks: [], isLoading: false });
      return;
    }

    if (get().tasks.length === 0) {
      set({ isLoading: true });
    }
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tasks: (data as Task[]) || [] });
    } catch (err: any) {
      console.warn('[TaskStore] fetchTasks failed:', err.message);
      set({ tasks: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async ({ title, description, priority, dueDate }) => {
    const user = useAuthStore.getState().user;
    if (!user) return { task: null, error: 'User not logged in' };

    const fallbackTask: Task = {
      id: `task-${Date.now()}`,
      user_id: user.id,
      title,
      description: description || null,
      priority: priority || 'medium',
      due_date: dueDate || null,
      status: 'todo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({ tasks: [fallbackTask, ...state.tasks] }));

    if (!isSupabaseConfigured) {
      return { task: fallbackTask, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          priority: priority || 'medium',
          due_date: dueDate || null,
          status: 'todo',
        })
        .select()
        .single();

      if (error) throw error;
      const created = data as Task;
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === fallbackTask.id ? created : t)),
      }));
      return { task: created, error: null };
    } catch (err: any) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== fallbackTask.id),
      }));
      return { task: null, error: err.message };
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  deleteTask: async (id) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },
}));
