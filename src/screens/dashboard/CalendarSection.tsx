"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  Clock, User, Phone, CheckCircle2, XCircle, AlertTriangle, X, Loader2
} from "lucide-react";
import { useCalendarStore } from "../../store/calendarStore";
import { Appointment } from "../../types/database";

const STATUS_BADGES: Record<Appointment["status"], { bg: string; text: string }> = {
  scheduled: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
  confirmed: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
  completed: { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400" },
  cancelled: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
  no_show: { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-400" },
};

export function CalendarSection() {
  const { 
    appointments, isLoading, fetchAppointments, createAppointment, 
    updateAppointmentStatus, deleteAppointment 
  } = useCalendarStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [serviceName, setServiceName] = useState("AI Consultation & Strategy");
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

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (viewFilter === "all") return true;
      return apt.status === viewFilter;
    });
  }, [appointments, viewFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (result.conflictError) {
      setConflictError(result.conflictError);
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
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            <span>Calendar & Appointment Bookings</span>
            <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">
              Google & Outlook Sync
            </span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time schedule with automated multi-channel confirmation and zero-double-booking protection.
          </p>
        </div>
        <button
          onClick={() => {
            setConflictError("");
            setIsModalOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {(["all", "scheduled", "confirmed", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setViewFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              viewFilter === tab
                ? "bg-white/10 text-white border border-white/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-500">
          Timezone: <strong className="text-zinc-400">Europe/Berlin (CET)</strong>
        </span>
      </div>

      {/* Appointments List / Grid */}
      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-3.5 font-semibold text-zinc-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3.5 font-semibold text-zinc-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 font-semibold text-zinc-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3.5 font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAppointments.map((apt) => {
                const startDate = new Date(apt.start_time);
                const endDate = new Date(apt.end_time);
                const badge = STATUS_BADGES[apt.status] || STATUS_BADGES.scheduled;

                return (
                  <tr key={apt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {startDate.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mt-0.5">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>
                          {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        {apt.customer_name}
                      </div>
                      {apt.customer_phone && (
                        <div className="flex items-center gap-1 text-zinc-400 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{apt.customer_phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-200">{apt.service_name}</span>
                      {apt.notes && (
                        <p className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5">{apt.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={apt.status}
                        onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-transparent capitalize ${badge.bg} ${badge.text}`}
                      >
                        <option value="scheduled" className="bg-[#111] text-blue-400">Scheduled</option>
                        <option value="confirmed" className="bg-[#111] text-emerald-400">Confirmed</option>
                        <option value="completed" className="bg-[#111] text-purple-400">Completed</option>
                        <option value="cancelled" className="bg-[#111] text-red-400">Cancelled</option>
                        <option value="no_show" className="bg-[#111] text-zinc-400">No Show</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === "scheduled" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/20 text-[11px]"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Remove appointment for ${apt.customer_name}?`)) {
                              deleteAppointment(apt.id);
                            }
                          }}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-3 text-emerald-400">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">No appointments found</h3>
                    <p className="text-zinc-500 text-xs">
                      Schedule a booking or connect your WhatsApp AI Receptionist to accept automated bookings.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101214] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
                Schedule New Appointment
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Maria Rossi"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+39 340 1234567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="maria@rossi.it"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Service Requested</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Hair Styling & Treatment"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-zinc-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white outline-none text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Booking Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="First-time client, requested quiet consultation."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
