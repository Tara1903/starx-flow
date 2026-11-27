"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Phone,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { useCalendarStore } from "../../store/calendarStore";
import { Appointment } from "../../types/database";
import {
  CONSOLE_PANEL_FLUSH,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_DANGER,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

const STATUS_BADGES: Record<Appointment["status"], string> = {
  scheduled: CONSOLE_BADGE_INFO,
  confirmed: CONSOLE_BADGE_LIVE,
  completed: CONSOLE_BADGE_MUTED,
  cancelled: CONSOLE_BADGE_DANGER,
  no_show: CONSOLE_BADGE_MUTED,
};

export function CalendarSection() {
  const {
    appointments,
    isLoading,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  } = useCalendarStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [serviceName, setServiceName] = useState("Consultation");
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [startTimeStr, setStartTimeStr] = useState("10:00");
  const [endTimeStr, setEndTimeStr] = useState("11:00");
  const [notes, setNotes] = useState("");
  const [conflictError, setConflictError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewFilter, setViewFilter] = useState<"all" | "scheduled" | "confirmed" | "completed">("all");

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (!isModalOpen || isSubmitting) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [isModalOpen, isSubmitting]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (viewFilter === "all") return true;
      return apt.status === viewFilter;
    });
  }, [appointments, viewFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!customerName.trim() || !serviceName.trim()) {
      setConflictError("Enter a customer name and service.");
      return;
    }
    if (endTimeStr <= startTimeStr) {
      setConflictError("End time must be after start time.");
      return;
    }
    setConflictError("");
    setIsSubmitting(true);

    const startDateTime = new Date(`${dateStr}T${startTimeStr}:00`).toISOString();
    const endDateTime = new Date(`${dateStr}T${endTimeStr}:00`).toISOString();

    const result = await createAppointment({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim() || null,
      customer_email: customerEmail.trim() || null,
      service_name: serviceName.trim(),
      start_time: startDateTime,
      end_time: endDateTime,
      timezone: "Europe/Berlin",
      status: "scheduled",
      notes: notes.trim() || null,
      reminder_sent: false,
    });

    setIsSubmitting(false);

    if (result.error || result.conflictError) {
      setConflictError(
        result.conflictError || "Could not save this appointment. Check details and try again."
      );
      return;
    }

    if (result.appointment) {
      setIsModalOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6 select-none tabular-nums">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={CONSOLE_HEADING}>Bookings & schedule</h1>
            <span className={CONSOLE_BADGE_MUTED}>Google & Outlook sync</span>
          </div>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Appointment queue with double-booking checks
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setConflictError("");
            setIsModalOpen(true);
          }}
          className={CONSOLE_BTN_PRIMARY}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#edf0ee]/[0.08] pb-3 overflow-x-auto">
        {(["all", "scheduled", "confirmed", "completed"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setViewFilter(tab)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer",
              viewFilter === tab
                ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/10"
                : "text-[#727c75] hover:text-[#edf0ee]"
            )}
          >
            {tab}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#727c75]">Timezone: Europe/Berlin</span>
      </div>

      {/* Appointments Table */}
      <div className={cn(CONSOLE_PANEL_FLUSH, "flex-1 flex flex-col")}>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#edf0ee]/[0.08] bg-[#0d1210]">
                <th className="px-5 py-3 font-medium text-[#727c75]">Date & time</th>
                <th className="px-5 py-3 font-medium text-[#727c75]">Customer</th>
                <th className="px-5 py-3 font-medium text-[#727c75]">Service</th>
                <th className="px-5 py-3 font-medium text-[#727c75]">Status</th>
                <th className="px-5 py-3 font-medium text-[#727c75] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ee]/[0.06]">
              {filteredAppointments.map((apt) => {
                const startDate = new Date(apt.start_time);
                const endDate = new Date(apt.end_time);
                const badge = STATUS_BADGES[apt.status] || CONSOLE_BADGE_INFO;

                return (
                  <tr key={apt.id} className="hover:bg-[#19201d]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#edf0ee]">
                        {startDate.toLocaleDateString("de-DE", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#727c75] text-[11px] mt-0.5 font-mono">
                        <Clock className="w-3 h-3" strokeWidth={1.65} />
                        <span>
                          {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                          {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#edf0ee] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#727c75]" strokeWidth={1.65} />
                        {apt.customer_name}
                      </div>
                      {apt.customer_phone && (
                        <div className="flex items-center gap-1 text-[#727c75] text-[11px] mt-0.5 font-mono">
                          <Phone className="w-3 h-3" strokeWidth={1.65} />
                          <span>{apt.customer_phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[#a1aaa4]">{apt.service_name}</span>
                      {apt.notes && (
                        <p className="text-[11px] text-[#727c75] truncate max-w-xs mt-0.5">
                          {apt.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={apt.status}
                        onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                        className={cn(CONSOLE_INPUT, badge, "px-2.5 py-1 cursor-pointer")}
                      >
                        <option value="scheduled" className="bg-[#0c100e] text-[#edf0ee]">Scheduled</option>
                        <option value="confirmed" className="bg-[#0c100e] text-[#edf0ee]">Confirmed</option>
                        <option value="completed" className="bg-[#0c100e] text-[#edf0ee]">Completed</option>
                        <option value="cancelled" className="bg-[#0c100e] text-[#edf0ee]">Cancelled</option>
                        <option value="no_show" className="bg-[#0c100e] text-[#edf0ee]">No show</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === "scheduled" && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                            className="px-2.5 py-1 rounded-md bg-[#4cc38a]/12 hover:bg-[#4cc38a]/20 text-[#4cc38a] font-medium border border-[#4cc38a]/25 text-[11px] cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove appointment for ${apt.customer_name}?`)) {
                              deleteAppointment(apt.id);
                            }
                          }}
                          aria-label={`Remove ${apt.customer_name}`}
                          className="p-1.5 rounded-md text-[#727c75] hover:text-[#f28b8e] hover:bg-[#e5484d]/10 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAppointments.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <CalendarIcon className="w-7 h-7 text-[#727c75] mx-auto mb-2.5" strokeWidth={1.5} />
                    <h3 className="text-[#edf0ee] font-medium text-sm mb-1">No appointments</h3>
                    <p className="text-[#727c75] text-xs">
                      Schedule a booking manually or enable WhatsApp scheduling
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-label="Schedule new appointment"
            className="rounded-2xl bg-[#0c100e] border border-[#edf0ee]/12 max-w-md max-h-[90dvh] overflow-y-auto w-full p-6 shadow-[0_24px_64px_rgba(0,0,0,0.75)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
              <h3 className="text-[#edf0ee] font-semibold text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#a1aaa4]" strokeWidth={1.65} />
                Schedule appointment
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="text-[#727c75] hover:text-[#edf0ee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {conflictError && (
              <div
                role="alert"
                className={cn(CONSOLE_BADGE_DANGER, "p-3 rounded-lg w-full justify-start")}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#a1aaa4] mb-1">Customer name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Maria Rossi"
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1aaa4] mb-1">Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+39 340 1234567"
                    className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                  />
                </div>
                <div>
                  <label className="block text-[#a1aaa4] mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="maria@rossi.it"
                    className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a1aaa4] mb-1">Service *</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Hair styling"
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#a1aaa4] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className={cn(CONSOLE_INPUT, "w-full px-2.5 py-2 text-xs")}
                  />
                </div>
                <div>
                  <label className="block text-[#a1aaa4] mb-1">Start</label>
                  <input
                    type="time"
                    required
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className={cn(CONSOLE_INPUT, "w-full px-2.5 py-2 text-xs")}
                  />
                </div>
                <div>
                  <label className="block text-[#a1aaa4] mb-1">End</label>
                  <input
                    type="time"
                    required
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className={cn(CONSOLE_INPUT, "w-full px-2.5 py-2 text-xs")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a1aaa4] mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional booking context"
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={CONSOLE_BTN_PRIMARY}>
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
