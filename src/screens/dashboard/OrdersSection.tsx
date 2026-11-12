"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  Plus,
  Clock,
  RefreshCw,
  Euro,
  X,
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useToastStore } from "../../store/toastStore";
import { formatEuro, formatEuropeanDate } from "../../lib/locale";
import { cn } from "../../lib/utils";
import { Order } from "../../types/database";
import { createIdempotencyKey } from "../../lib/idempotency";
import {
  GlassPanel,
  GlassButton,
  GlassModal,
  GlassSkeleton,
  EmptyState,
  ErrorState,
  CopyButton,
  ResponsiveDataTable,
  type DataColumn,
} from "../../components/ui";

export function OrdersSection() {
  const {
    orders,
    isLoading,
    hasFetched,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
  } = useOrderStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<Array<{ name: string; quantity: number; price: number }>>([
    { name: "", quantity: 1, price: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingKey, setPendingKey] = useState<string>(() => createIdempotencyKey("ord"));

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

  const handleItemChange = (index: number, field: "name" | "quantity" | "price", val: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const calculatedTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
  }, [items]);

  const handleOpenNewModal = () => {
    setPendingKey(createIdempotencyKey("ord"));
    setIsModalOpen(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || items.some((it) => !it.name.trim()) || isSubmitting) return;

    setIsSubmitting(true);
    const res = await createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      items,
      totalAmount: calculatedTotal,
      status: "pending",
      paymentStatus: "unpaid",
      idempotencyKey: pendingKey,
    });

    setIsSubmitting(false);
    if (!res.success) {
      pushToast({
        title: "Order creation failed",
        description: res.error || "Please retry — duplicate protection active.",
        tone: "error",
      });
      return;
    }

    pushToast({
      title: res.deduplicated ? "Order already synced" : "Order created",
      description: `${customerName.trim()} (${formatEuro(calculatedTotal)})`,
      tone: "success",
    });

    setIsModalOpen(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setItems([{ name: "", quantity: 1, price: 0 }]);
    setPendingKey(createIdempotencyKey("ord"));
  };

  const columns: DataColumn<Order>[] = [
    {
      key: "order_number",
      header: "Order #",
      render: (o) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-white">{o.order_number}</span>
          <CopyButton
            value={o.order_number}
            label=""
            copiedLabel=""
            toastTitle={`Copied ${o.order_number}`}
            className="min-h-[26px] px-2 py-1"
          />
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div>
          <div className="font-semibold text-white">{o.customer_name}</div>
          <div className="text-[10px] text-zinc-400">
            {o.customer_phone || o.customer_email || "No contact"}
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (o) => (
        <div className="max-w-xs truncate text-zinc-300">
          {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "—"}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total (€)",
      render: (o) => (
        <span className="font-bold text-emerald-400 tabular-nums">
          {formatEuro(o.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Order Status",
      render: (o) => (
        <select
          aria-label={`Order status for ${o.order_number}`}
          value={o.status}
          onChange={async (e) => {
            const ok = await updateOrderStatus(o.id, e.target.value as Order["status"]);
            if (!ok) pushToast({ title: "Status update failed", tone: "error" });
          }}
          className={cn(
            "text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-[#07120e]",
            o.status === "completed" && "text-emerald-300 border-emerald-500/35 bg-emerald-500/12",
            o.status === "processing" && "text-sky-300 border-sky-500/35 bg-sky-500/12",
            o.status === "pending" && "text-amber-300 border-amber-500/35 bg-amber-500/12",
            o.status === "cancelled" && "text-red-300 border-red-500/35 bg-red-500/12"
          )}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (o) => (
        <select
          aria-label={`Payment status for ${o.order_number}`}
          value={o.payment_status}
          onChange={async (e) => {
            const ok = await updatePaymentStatus(o.id, e.target.value as Order["payment_status"]);
            if (!ok) pushToast({ title: "Payment update failed", tone: "error" });
          }}
          className={cn(
            "text-[11px] font-bold px-2.5 py-1 rounded border outline-none cursor-pointer bg-[#07120e]",
            o.payment_status === "paid" && "text-emerald-300 border-emerald-500/35 bg-emerald-500/12",
            o.payment_status === "unpaid" && "text-amber-300 border-amber-500/35 bg-amber-500/12",
            o.payment_status === "refunded" && "text-zinc-300 border-zinc-500/35 bg-zinc-500/12"
          )}
        >
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="refunded">Refunded</option>
        </select>
      ),
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      render: (o) => (
        <span className="text-zinc-400 text-[11px] tabular-nums">
          {formatEuropeanDate(o.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Orders & Operations
            </h2>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              AI Order Agent Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time tracking of customer purchases, bookings, invoices, and fulfillment.
          </p>
        </div>

        <GlassButton variant="primary" size="sm" onClick={handleOpenNewModal}>
          <Plus className="w-4 h-4" />
          <span>Create Order</span>
        </GlassButton>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
        <GlassPanel tier="panel" className="p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Settled Revenue</span>
            <Euro className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{formatEuro(totalRevenue)}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Calculated from paid workspace orders</p>
        </GlassPanel>

        <GlassPanel tier="panel" className="p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Active Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{pendingOrders}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Orders pending fulfillment or confirmation</p>
        </GlassPanel>

        <GlassPanel tier="panel" className="p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Volume</span>
            <ShoppingBag className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{orders.length}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Processed via AI Agents and staff checkout</p>
        </GlassPanel>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search orders"
            placeholder="Search order #, customer, or phone..."
            className="glass-input w-full rounded-full pl-9 pr-4 py-2 text-sm sm:text-xs text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter order statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input bg-[#07120e] text-xs text-zinc-200 rounded-xl px-3 py-2 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => fetchOrders()}
            aria-label="Refresh orders"
            className="px-3"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </GlassButton>
        </div>
      </div>

      {/* Error -> Loading -> Adaptive Table / Empty */}
      {error ? (
        <ErrorState
          title="Unable to load workspace orders"
          message={error}
          onRetry={() => fetchOrders()}
        />
      ) : isLoading && !hasFetched ? (
        <GlassSkeleton variant="table-rows" count={4} />
      ) : (
        <ResponsiveDataTable
          data={filteredOrders}
          columns={columns}
          getRowKey={(o) => o.id}
          tableLabel="Workspace orders"
          emptyState={
            <EmptyState
              icon={<ShoppingBag className="w-6 h-6 text-emerald-400" />}
              title={search || statusFilter !== "all" ? "No matching orders" : "No orders recorded yet"}
              description={
                search || statusFilter !== "all"
                  ? "Adjust your search or status filter to view matching orders."
                  : "Create your first order manually or connect an AI channel to capture customer bookings."
              }
              actionLabel={search || statusFilter !== "all" ? "Clear Filters" : "Create Order"}
              onAction={() => {
                if (search || statusFilter !== "all") {
                  setSearch("");
                  setStatusFilter("all");
                } else {
                  handleOpenNewModal();
                }
              }}
            />
          }
          renderMobileCard={(o) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-white text-sm">{o.order_number}</span>
                  <div className="font-semibold text-zinc-200 text-xs mt-0.5">{o.customer_name}</div>
                </div>
                <span className="font-bold text-emerald-400 text-sm">{formatEuro(o.total_amount)}</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "—"}
              </p>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                <select
                  aria-label={`Order status for ${o.order_number}`}
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value as Order["status"])}
                  className="glass-input bg-[#07120e] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="text-[11px] text-zinc-400">{formatEuropeanDate(o.created_at)}</span>
              </div>
            </div>
          )}
        />
      )}

      {/* New Order Modal */}
      <GlassModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={
          <span className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Create New Customer Order</span>
          </span>
        }
        subtitle="Protected by idempotency keys — safe against accidental retries."
      >
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1.5">
              Customer Full Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="E.g. Charlotte Müller"
              required
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+49 152 0000000"
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@domain.de"
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-zinc-300 uppercase">Items / Services</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
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
                    placeholder="Service or product"
                    required
                    className="glass-input flex-1 rounded-lg px-2.5 py-2 text-white text-xs min-w-0"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                    className="glass-input w-14 rounded-lg px-2 py-2 text-white text-xs text-center tabular-nums"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                    placeholder="€"
                    className="glass-input w-20 rounded-lg px-2 py-2 text-white text-xs text-right tabular-nums"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      aria-label="Remove item row"
                      className="text-zinc-400 hover:text-red-400 p-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
            <div className="tabular-nums">
              <span className="text-[11px] text-zinc-400 uppercase font-bold">Total:</span>{" "}
              <span className="text-base font-bold text-emerald-400">{formatEuro(calculatedTotal)}</span>
            </div>
            <div className="flex gap-2">
              <GlassButton type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Confirm Order
              </GlassButton>
            </div>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
