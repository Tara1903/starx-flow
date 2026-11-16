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

export const DEFAULT_ORDERS: Order[] = [
  {
    id: "ord-101",
    user_id: "demo-sarah-jenkins",
    order_number: "ORD-2026-001",
    customer_name: "Charlotte Laurent",
    customer_email: "charlotte.l@luxuryretreats.fr",
    customer_phone: "+33 6 42 18 90 12",
    currency: "EUR",
    items: [
      { name: "Executive Physical Assessment", quantity: 1, price: 180 },
      { name: "Ergonomic Mobility Kit", quantity: 1, price: 45 },
    ],
    total_amount: 225,
    status: "processing",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ord-102",
    user_id: "demo-sarah-jenkins",
    order_number: "ORD-2026-002",
    customer_name: "Maximilian Weber",
    customer_email: "m.weber@berlinfintech.de",
    customer_phone: "+49 171 8901234",
    currency: "EUR",
    items: [
      { name: "Post-Rehab Spine Consultation", quantity: 1, price: 120 },
    ],
    total_amount: 120,
    status: "completed",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "ord-103",
    user_id: "demo-sarah-jenkins",
    order_number: "ORD-2026-003",
    customer_name: "Elena Vasquez",
    customer_email: "elena@madridwellness.es",
    customer_phone: "+34 612 345 678",
    currency: "EUR",
    items: [
      { name: "Sports Performance Bio-Screening", quantity: 1, price: 210 },
      { name: "Therapeutic Resistance Bands (Set of 3)", quantity: 2, price: 30 },
    ],
    total_amount: 270,
    status: "pending",
    payment_status: "unpaid",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

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

    // If demo session or non-UUID, keep default orders without API call
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isUuid) {
      set({ orders: get().orders.length > 0 ? get().orders : DEFAULT_ORDERS, hasFetched: true, isLoading: false, error: null });
      return;
    }

    if (get().orders.length === 0) {
      set({ isLoading: true, error: null });
    }
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders', {
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to load orders (${res.status})`);
      }

      if (Array.isArray(data.orders) && data.orders.length > 0) {
        set({
          orders: data.orders,
          hasFetched: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          orders: isUuid ? [] : DEFAULT_ORDERS,
          hasFetched: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: unknown) {
      set({
        orders: isUuid ? [] : DEFAULT_ORDERS,
        hasFetched: true,
        isLoading: false,
        error: null,
      });
    }
  },

  createOrder: async (orderData) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };

    const idempotencyKey = orderData.idempotencyKey || createIdempotencyKey('ord');
    if (get().orders.length === 0) {
      set({ isLoading: true, error: null });
    }
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
