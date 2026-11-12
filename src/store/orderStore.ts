import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabase';
import { Order } from '../types/database';
import { createIdempotencyKey } from '../lib/idempotency';
import { sanitizeClientError } from '../lib/security/sanitizeClientError';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: {
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    status?: Order['status'];
    paymentStatus?: Order['payment_status'];
    idempotencyKey?: string;
  }) => Promise<{ success: boolean; error?: string; deduplicated?: boolean }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['payment_status']) => Promise<boolean>;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Offline fallback handled by fetch try/catch
  }
  return {};
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  hasFetched: false,
  error: null,

  fetchOrders: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ orders: [], hasFetched: true, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders', {
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to load orders (${res.status})`);
      }

      // Always reflect real backend state including empty array []
      set({
        orders: Array.isArray(data.orders) ? data.orders : [],
        hasFetched: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      set({
        error: sanitizeClientError(err, 'Unable to load workspace orders. Check connection and retry.'),
        hasFetched: true,
        isLoading: false,
      });
    }
  },

  createOrder: async (orderData) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };

    const idempotencyKey = orderData.idempotencyKey || createIdempotencyKey('ord');
    set({ isLoading: true, error: null });
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
          ...authHeaders,
        },
        body: JSON.stringify({
          userId: user.id,
          idempotencyKey,
          ...orderData,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const safeErr = sanitizeClientError(data.error, 'Could not create order.');
        set({ error: safeErr, isLoading: false });
        return { success: false, error: safeErr };
      }

      set((state) => {
        const exists = state.orders.some((o) => o.id === data.order?.id);
        return {
          orders: exists ? state.orders : [data.order, ...state.orders],
          isLoading: false,
          error: null,
        };
      });

      return { success: true, deduplicated: Boolean(data.deduplicated) };
    } catch (err: unknown) {
      const safeErr = sanitizeClientError(err, 'Network error while creating order.');
      set({ error: safeErr, isLoading: false });
      return { success: false, error: safeErr };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const prevOrders = get().orders;
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      return true;
    } catch {
      set({ orders: prevOrders });
      return false;
    }
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    const prevOrders = get().orders;
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, payment_status: paymentStatus } : o
      ),
    }));

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ orderId, paymentStatus }),
      });
      if (!res.ok) throw new Error('Payment update failed');
      return true;
    } catch {
      set({ orders: prevOrders });
      return false;
    }
  },
}));
