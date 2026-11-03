"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingBag, Search, Plus, Filter, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Euro, ArrowUpRight, 
  ExternalLink, FileText, ChevronDown, X
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { formatEuro, formatEuropeanDate } from "../../lib/locale";
import { cn } from "../../lib/utils";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { Order } from "../../types/database";

export function OrdersSection() {
  const { orders, isLoading, fetchOrders, createOrder, updateOrderStatus, updatePaymentStatus } = useOrderStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Order Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<Array<{ name: string; quantity: number; price: number }>>([
    { name: "", quantity: 1, price: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (o.customer_phone && o.customer_phone.includes(search));
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.payment_status === "paid")
      .reduce((acc, curr) => acc + Number(curr.total_amount), 0);
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  }, [orders]);

  const handleAddItemRow = () => {
    setItems((prev) => [...prev, { name: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (index: number, field: "name" | "quantity" | "price", val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const calculatedTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
  }, [items]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || items.some((it) => !it.name.trim())) return;

    setIsSubmitting(true);
    const res = await createOrder({
      customerName,
      customerPhone,
      customerEmail,
      items,
      totalAmount: calculatedTotal,
      status: "pending",
      paymentStatus: "unpaid"
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setItems([{ name: "", quantity: 1, price: 0 }]);
    }
  };

  return (
    <div className="space-y-6 select-none animate-[fade-in_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Orders & Operations
            </h2>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              AI Order Agent Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time tracking of European customer purchases, bookings, invoices, and fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-4 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassPanel tier="panel" className="p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Settled Revenue</span>
            <Euro className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatEuro(totalRevenue)}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">100% Verified</span> through European Stripe SEPA/Cards
          </p>
        </GlassPanel>

        <GlassPanel tier="panel" className="p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Active Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {pendingOrders}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Orders pending fulfillment or staff confirmation
          </p>
        </GlassPanel>

        <GlassPanel tier="panel" className="p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Volume</span>
            <ShoppingBag className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {orders.length}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Processed via AI Agents and direct staff checkout
          </p>
        </GlassPanel>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, or phone..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0a0a0a] border border-white/10 text-xs text-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500/30"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => fetchOrders()}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto console-scroll">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Order #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total (€)</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 pr-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-white">
                      {o.order_number}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{o.customer_name}</div>
                      <div className="text-[10px] text-zinc-500">{o.customer_phone || o.customer_email || "No contact"}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="max-w-xs truncate text-zinc-300">
                        {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "—"}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400">
                      {formatEuro(o.total_amount)}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                        className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-black/60",
                          o.status === "completed" && "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
                          o.status === "processing" && "text-sky-400 border-sky-500/30 bg-sky-500/10",
                          o.status === "pending" && "text-amber-400 border-amber-500/30 bg-amber-500/10",
                          o.status === "cancelled" && "text-red-400 border-red-500/30 bg-red-500/10"
                        )}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.payment_status}
                        onChange={(e) => updatePaymentStatus(o.id, e.target.value as any)}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded border outline-none cursor-pointer bg-black/60",
                          o.payment_status === "paid" && "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
                          o.payment_status === "unpaid" && "text-amber-400 border-amber-500/30 bg-amber-500/10",
                          o.payment_status === "refunded" && "text-zinc-400 border-zinc-500/30 bg-zinc-500/10"
                        )}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="p-3.5 pr-5 text-right text-zinc-500 text-[10px]">
                      {formatEuropeanDate(o.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Create New Customer Order</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="E.g. Charlotte Müller"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+49 152 0000000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@domain.de"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500/30"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Items / Services</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[10px] text-emerald-400 font-bold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto console-scroll pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                        placeholder="Service or product description"
                        required
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                        className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white outline-none text-xs text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                        placeholder="€"
                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white outline-none text-xs text-right"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Submit */}
              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Total:</span>{" "}
                  <span className="text-sm font-bold text-emerald-400">{formatEuro(calculatedTotal)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5"
                  >
                    {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Order</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
