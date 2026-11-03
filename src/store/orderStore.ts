import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { Order } from '../types/database';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
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
  }) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['payment_status']) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [
    {
      id: 'ord-101',
      user_id: 'default',
      order_number: 'SX-892104',
      customer_name: 'Elena Rostova',
      customer_phone: '+49 152 4432190',
      customer_email: 'elena.rostova@berlin-mail.de',
      status: 'completed',
      payment_status: 'paid',
      total_amount: 145.0,
      currency: 'EUR',
      items: [
        { name: 'Balayage Treatment & Color Lock', quantity: 1, price: 110.0 },
        { name: 'Organic Argan Hair Mask (250ml)', quantity: 1, price: 35.0 }
      ],
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'ord-102',
      user_id: 'default',
      order_number: 'SX-892105',
      customer_name: 'Marc Dubois',
      customer_phone: '+33 6 12 34 56 78',
      customer_email: 'marc.dubois@paris-tech.fr',
      status: 'processing',
      payment_status: 'paid',
      total_amount: 65.0,
      currency: 'EUR',
      items: [
        { name: 'Classic Beard Sculpt & Hot Towel Shave', quantity: 1, price: 45.0 },
        { name: 'Matte Styling Clay', quantity: 1, price: 20.0 }
      ],
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: 'ord-103',
      user_id: 'default',
      order_number: 'SX-892106',
      customer_name: 'Sophia Van Dijk',
      customer_phone: '+31 6 98765432',
      customer_email: 'sophia.vandijk@amsterdam.nl',
      status: 'pending',
      payment_status: 'unpaid',
      total_amount: 85.0,
      currency: 'EUR',
      items: [
        { name: 'Deep Hydration Facial Treatment', quantity: 1, price: 85.0 }
      ],
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          set({ orders: data.orders });
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch orders:', err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (orderData) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };

    set({ isLoading: true });
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...orderData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        set({ error: data.error, isLoading: false });
        return { success: false, error: data.error };
      }

      set((state) => ({
        orders: [data.order, ...state.orders],
        isLoading: false
      }));

      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    // Optimistic update
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o))
    }));

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
    } catch (err) {
      console.warn('Failed to persist order status:', err);
    }
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    // Optimistic update
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, payment_status: paymentStatus } : o))
    }));

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentStatus })
      });
    } catch (err) {
      console.warn('Failed to persist payment status:', err);
    }
  }
}));
