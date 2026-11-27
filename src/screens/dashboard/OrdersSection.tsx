"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Search, Plus, Clock, RefreshCw, Euro, X } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useToastStore } from "../../store/toastStore";
import { formatEuro, formatEuropeanDate } from "../../lib/locale";
import {
  CONSOLE_PANEL,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_WARN,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_DANGER,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import { Order } from "../../types/database";
import { createIdempotencyKey } from "../../lib/idempotency";
import {
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
          <span className="font-mono font-medium text-[#edf0ee]">{o.order_number}</span>
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
          <div className="font-medium text-[#edf0ee]">{o.customer_name}</div>
          <div className="text-[11px] text-[#727c75]">
            {o.customer_phone || o.customer_email || "No contact"}
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (o) => (
        <div className="max-w-xs truncate text-[#a1aaa4]">
          {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "—"}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (o) => (
        <span className="font-medium text-[#4cc38a] tabular-nums">
          {formatEuro(o.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Order status",
      render: (o) => (
        <select
          aria-label={`Order status for ${o.order_number}`}
          value={o.status}
          onChange={async (e) => {
            const ok = await updateOrderStatus(o.id, e.target.value as Order["status"]);
            if (!ok) pushToast({ title: "Status update failed", tone: "error" });
          }}
          className={cn(
            CONSOLE_INPUT,
            "px-2.5 py-1 text-xs cursor-pointer",
            o.status === "completed" && CONSOLE_BADGE_LIVE,
            o.status === "processing" && CONSOLE_BADGE_INFO,
            o.status === "pending" && CONSOLE_BADGE_WARN,
            o.status === "cancelled" && CONSOLE_BADGE_DANGER
          )}
        >
          <option value="pending" className="bg-[#0c100e]">Pending</option>
          <option value="processing" className="bg-[#0c100e]">Processing</option>
          <option value="completed" className="bg-[#0c100e]">Completed</option>
          <option value="cancelled" className="bg-[#0c100e]">Cancelled</option>
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
            CONSOLE_INPUT,
            "px-2.5 py-1 text-xs cursor-pointer",
            o.payment_status === "paid" && CONSOLE_BADGE_LIVE,
            o.payment_status === "unpaid" && CONSOLE_BADGE_WARN,
            o.payment_status === "refunded" && CONSOLE_BADGE_MUTED
          )}
        >
          <option value="paid" className="bg-[#0c100e]">Paid</option>
          <option value="unpaid" className="bg-[#0c100e]">Unpaid</option>
          <option value="refunded" className="bg-[#0c100e]">Refunded</option>
        </select>
      ),
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      render: (o) => (
        <span className="text-[#727c75] text-xs tabular-nums">
          {formatEuropeanDate(o.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none tabular-nums">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={CONSOLE_HEADING}>Orders & payments</h1>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Track customer purchases, invoices, and fulfillment
          </p>
        </div>

        <button type="button" onClick={handleOpenNewModal} className={CONSOLE_BTN_PRIMARY}>
          <Plus className="w-3.5 h-3.5" />
          <span>Create Order</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1aaa4]">Settled revenue</span>
            <Euro className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <div className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {formatEuro(totalRevenue)}
          </div>
          <p className="text-xs text-[#727c75] mt-2">From paid workspace orders</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1aaa4]">Pending fulfillment</span>
            <Clock className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <div className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {pendingOrders}
          </div>
          <p className="text-xs text-[#727c75] mt-2">Pending or processing</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1aaa4]">Total orders</span>
            <ShoppingBag className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <div className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {orders.length}
          </div>
          <p className="text-xs text-[#727c75] mt-2">AI agent and manual checkout</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#727c75]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search orders"
            placeholder="Search order #, customer, or phone"
            className={cn(CONSOLE_INPUT, "w-full pl-9 pr-4 py-2 text-xs sm:text-sm")}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter order statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(CONSOLE_INPUT, "text-xs px-3 py-2 cursor-pointer")}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={() => fetchOrders()}
            aria-label="Refresh orders"
            className={CONSOLE_BTN_SECONDARY}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

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
              icon={<ShoppingBag className="w-5 h-5 text-[#727c75]" />}
              title={search || statusFilter !== "all" ? "No matching orders" : "No orders recorded"}
              description={
                search || statusFilter !== "all"
                  ? "Adjust your search or status filter"
                  : "Create an order manually or accept bookings via connected channels"
              }
              actionLabel={search || statusFilter !== "all" ? "Clear filters" : "Create Order"}
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
                  <span className="font-mono font-medium text-[#edf0ee] text-sm">
                    {o.order_number}
                  </span>
                  <div className="text-[#a1aaa4] text-xs mt-0.5">{o.customer_name}</div>
                </div>
                <span className="font-medium text-[#4cc38a] text-sm">
                  {formatEuro(o.total_amount)}
                </span>
              </div>
              <p className="text-xs text-[#727c75] line-clamp-2">
                {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "—"}
              </p>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#edf0ee]/[0.06]">
                <select
                  aria-label={`Order status for ${o.order_number}`}
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value as Order["status"])}
                  className={cn(CONSOLE_INPUT, "px-2.5 py-1.5 text-xs")}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="text-xs text-[#727c75]">{formatEuropeanDate(o.created_at)}</span>
              </div>
            </div>
          )}
        />
      )}

      <GlassModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag className="w-4 h-4 text-[#a1aaa4]" />
            <span>Create customer order</span>
          </span>
        }
        subtitle="Idempotency protected against accidental duplicate submissions"
      >
        <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[#a1aaa4] font-medium mb-1.5">Customer name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="E.g. Charlotte Müller"
              required
              className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs sm:text-sm")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#a1aaa4] font-medium mb-1.5">Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+49 152 0000000"
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs sm:text-sm")}
              />
            </div>
            <div>
              <label className="block text-[#a1aaa4] font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@domain.de"
                className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs sm:text-sm")}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#a1aaa4] font-medium">Items</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs text-[#4cc38a] font-medium hover:underline cursor-pointer"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto console-scroll pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                    placeholder="Service or item"
                    required
                    className={cn(CONSOLE_INPUT, "flex-1 px-2.5 py-2 text-xs min-w-0")}
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                    className={cn(CONSOLE_INPUT, "w-14 px-2 py-2 text-xs text-center tabular-nums")}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                    placeholder="€"
                    className={cn(CONSOLE_INPUT, "w-20 px-2 py-2 text-xs text-right tabular-nums")}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      aria-label="Remove item row"
                      className="text-[#727c75] hover:text-[#f28b8e] p-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#edf0ee]/[0.08] pt-4 flex items-center justify-between gap-3">
            <div className="tabular-nums">
              <span className="text-xs text-[#727c75]">Total:</span>{" "}
              <span className="text-base font-semibold text-[#4cc38a]">
                {formatEuro(calculatedTotal)}
              </span>
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
                Confirm order
              </GlassButton>
            </div>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
