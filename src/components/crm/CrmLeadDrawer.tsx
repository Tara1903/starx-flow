'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  GitMerge,
  Globe,
  Instagram,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import type { CrmSequence, LeadWorkspace360 } from '@/types/crm';
import type { Lead } from '@/types/database';
import {
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_WARN,
  CONSOLE_BTN_DANGER,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_INPUT,
  CONSOLE_SUBCARD,
} from '@/lib/consoleSurface';
import { crmFetch } from '@/lib/crm/crmApi';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

type DrawerTab = 'timeline' | 'messages' | 'bookings' | 'tasks' | 'sequences' | 'profile';

interface CrmLeadDrawerProps {
  open: boolean;
  loading: boolean;
  workspace: LeadWorkspace360 | null;
  sequences: CrmSequence[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onUpdateLead: (
    id: string,
    updates: Partial<Lead> & { stageId?: string; ownerId?: string | null; dealValue?: number }
  ) => Promise<{ error: string | null }>;
  onDeleteLead: (id: string) => Promise<{ error: string | null }>;
  onRunAction: (
    leadId: string,
    payload: any
  ) => Promise<{ ok: boolean; error: string | null }>;
  onEnrollSequence: (
    sequenceId: string,
    leadIds: string[]
  ) => Promise<{ enrolled: number; skipped: number; error: string | null }>;
  onUpdateEnrollmentStatus: (
    enrollmentId: string,
    sequenceId: string,
    status: 'active' | 'paused' | 'stopped'
  ) => Promise<{ ok: boolean; error: string | null }>;
}

export function CrmLeadDrawer({
  open,
  loading,
  workspace,
  sequences,
  onClose,
  onRefresh,
  onUpdateLead,
  onDeleteLead,
  onRunAction,
  onEnrollSequence,
  onUpdateEnrollmentStatus,
}: CrmLeadDrawerProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<DrawerTab>('timeline');
  const [actionBusy, setActionBusy] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Timeline / Note
  const [noteBody, setNoteBody] = useState('');

  // Inline Omni-Channel Compose
  const [msgChannel, setMsgChannel] = useState<'WhatsApp' | 'Email' | 'Instagram'>('Email');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgText, setMsgText] = useState('');

  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDue, setTaskDue] = useState('');

  // Booking Form
  const [serviceType, setServiceType] = useState('Discovery Call');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingNotes, setBookingNotes] = useState('');

  // Sequences Enroll
  const [selectedSeqId, setSelectedSeqId] = useState('');

  // Editable Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    companyName: '',
    jobTitle: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    country: '',
    industry: '',
    dealValue: '0',
    notes: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    const l = workspace?.lead;
    if (!l) return;
    setProfileForm({
      name: l.name || '',
      companyName: l.company_name || '',
      jobTitle: l.job_title || '',
      phone: l.phone || '',
      email: l.email || '',
      website: l.website || '',
      city: l.city || '',
      country: l.country || '',
      industry: l.industry || '',
      dealValue: String(l.deal_value ?? 0),
      notes: l.notes || '',
    });
    if (l.phone && !l.email) setMsgChannel('WhatsApp');
    else setMsgChannel('Email');
  }, [workspace?.lead]);

  if (!mounted || typeof document === 'undefined' || !open) return null;

  const lead = workspace?.lead;
  const activePipeline =
    workspace?.pipelines?.find((p) => p.id === lead?.pipeline_id) ||
    workspace?.pipelines?.find((p) => p.is_default) ||
    workspace?.pipelines?.[0];
  const stages = [...(activePipeline?.stages || [])].sort((a, b) => a.position - b.position);

  const handleAction = async (payload: any, okText: string, clearFn?: () => void) => {
    if (!lead) return;
    setActionBusy(true);
    setBanner(null);
    try {
      const res = await onRunAction(lead.id, payload);
      if (res.ok) {
        setBanner({ kind: 'ok', text: okText });
        clearFn?.();
      } else {
        setBanner({ kind: 'err', text: res.error || 'Action failed' });
      }
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setActionBusy(true);
    setBanner(null);
    try {
      const res = await onUpdateLead(lead.id, {
        name: profileForm.name,
        company_name: profileForm.companyName || null,
        job_title: profileForm.jobTitle || null,
        phone: profileForm.phone || null,
        email: profileForm.email || null,
        website: profileForm.website || null,
        city: profileForm.city || null,
        country: profileForm.country || null,
        industry: profileForm.industry || null,
        dealValue: Number(profileForm.dealValue) || 0,
        notes: profileForm.notes || null,
      });
      setBanner(
        res.error
          ? { kind: 'err', text: res.error }
          : { kind: 'ok', text: 'Customer profile saved.' }
      );
    } finally {
      setActionBusy(false);
    }
  };

  const handleMergeDuplicate = async (duplicateLeadId: string) => {
    if (!lead || !currentUser?.id) return;
    setActionBusy(true);
    setBanner(null);
    try {
      const res = await crmFetch('/api/crm/customers/merge', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          targetLeadId: lead.id,
          sourceLeadId: duplicateLeadId,
          actorId: currentUser.id,
        }),
      });
      if (res.ok) {
        setBanner({ kind: 'ok', text: 'Duplicate profile merged into this dossier.' });
        await onRefresh();
      } else {
        setBanner({ kind: 'err', text: res.error || 'Merge failed' });
      }
    } finally {
      setActionBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/65"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Customer 360 Dossier"
        className="w-full max-w-2xl h-full bg-[#0c100e] border-l border-[#edf0ee]/[0.08] flex flex-col shadow-2xl tabular-nums"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#edf0ee]/[0.08] flex items-start justify-between gap-3">
          {lead ? (
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center text-[#34d399]">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-[#edf0ee] truncate">{lead.name}</h2>
                  <p className="text-xs text-[#a1aaa4] truncate">
                    {[lead.job_title, lead.company_name, lead.city].filter(Boolean).join(' · ') ||
                      `Source: ${lead.source}`}
                  </p>
                </div>
                <span className={lead.score >= 70 ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_WARN}>
                  <Sparkles className="w-3 h-3" /> Fit {lead.score}/100
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {stages.length > 0 && (
                  <select
                    aria-label="Stage selector"
                    value={lead.stage_id || stages[0]?.id || ''}
                    onChange={(e) => onUpdateLead(lead.id, { stageId: e.target.value })}
                    className={cn(CONSOLE_INPUT, 'text-xs px-2.5 py-1.5 cursor-pointer')}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0c100e]">
                        Stage: {s.name} ({s.probability}%)
                      </option>
                    ))}
                  </select>
                )}

                <select
                  aria-label="Deal owner selector"
                  value={lead.owner_id || ''}
                  onChange={(e) => onUpdateLead(lead.id, { ownerId: e.target.value || null })}
                  className={cn(CONSOLE_INPUT, 'text-xs px-2.5 py-1.5 cursor-pointer')}
                >
                  <option value="">Unassigned owner</option>
                  {workspace?.teamMembers.map((m) => (
                    <option key={m.userId} value={m.userId} className="bg-[#0c100e]">
                      Owner: {m.name}
                    </option>
                  ))}
                </select>

                <span className={CONSOLE_BADGE_MUTED}>
                  €{Math.round(Number(lead.deal_value || 0)).toLocaleString()} value
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#a1aaa4]">
              <Loader2 className="w-4 h-4 animate-spin text-[#34d399]" />
              <span>Loading 360° Customer Dossier...</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dossier"
            className="p-1.5 rounded-lg text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-5 py-2 border-b border-[#edf0ee]/[0.08] flex items-center gap-1 overflow-x-auto console-scroll bg-[#080a09]">
          {(
            [
              ['timeline', 'Timeline'],
              ['messages', `Messages (${workspace?.conversations.length || 0})`],
              ['bookings', `Bookings & Orders (${(workspace?.appointments.length || 0) + (workspace?.orders.length || 0)})`],
              ['tasks', `Tasks (${workspace?.tasks.length || 0})`],
              ['sequences', `Sequences (${workspace?.enrollments.length || 0})`],
              ['profile', 'Profile & Merge'],
            ] as Array<[DrawerTab, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                tab === key
                  ? 'bg-[#19201d] text-[#34d399] border border-[#edf0ee]/10'
                  : 'text-[#a1aaa4] hover:text-[#edf0ee]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto console-scroll p-5 space-y-4">
          {banner && (
            <div
              className={cn(
                'rounded-xl px-3.5 py-2.5 text-xs border',
                banner.kind === 'ok'
                  ? 'bg-[#4cc38a]/12 border-[#4cc38a]/25 text-[#4cc38a]'
                  : 'bg-[#e5484d]/10 border-[#e5484d]/25 text-[#f28b8e]'
              )}
            >
              {banner.text}
            </div>
          )}

          {loading && !workspace ? (
            <div className="py-16 flex items-center justify-center gap-2 text-xs text-[#727c75]">
              <Loader2 className="w-4 h-4 animate-spin text-[#34d399]" />
              <span>Aggregating conversations, calendar bookings, tasks, and deals...</span>
            </div>
          ) : !lead ? (
            <div className="py-16 text-center text-xs text-[#727c75]">Customer record unavailable.</div>
          ) : (
            <>
              {tab === 'timeline' && (
                <div className="space-y-4">
                  {/* AI Intelligence & Website Enrich */}
                  <div className={cn(CONSOLE_SUBCARD, 'p-3.5 space-y-2')}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#edf0ee] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
                        Customer intelligence
                      </span>
                      {lead.website && (
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() =>
                            handleAction(
                              { action: 'enrich_website', website: lead.website || undefined },
                              'Website crawled and contact insights refreshed.'
                            )
                          }
                          className={CONSOLE_BTN_SECONDARY}
                        >
                          <Globe className="w-3 h-3" /> Enrich from website
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#a1aaa4]">
                      {lead.ai_summary ||
                        lead.notes ||
                        'Add notes, send an outbound message, or crawl the prospect website to build full context.'}
                    </p>
                  </div>

                  {/* Quick Add Note */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!noteBody.trim()) return;
                      handleAction(
                        {
                          action: 'add_note',
                          dealId: workspace?.deals?.[0]?.id || null,
                          body: noteBody.trim(),
                          saveToLeadNotes: true,
                        },
                        'Note added to timeline.',
                        () => setNoteBody('')
                      );
                    }}
                    className={cn(CONSOLE_SUBCARD, 'p-3.5 space-y-2.5')}
                  >
                    <label className="block text-xs font-medium text-[#edf0ee]">Log note / call summary</label>
                    <textarea
                      rows={2}
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Write a call outcome, qualification note, or next step..."
                      className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs resize-none')}
                    />
                    <div className="flex justify-end">
                      <button type="submit" disabled={actionBusy || !noteBody.trim()} className={CONSOLE_BTN_PRIMARY}>
                        <Plus className="w-3.5 h-3.5" /> Add Note
                      </button>
                    </div>
                  </form>

                  {/* Immutable Timeline Feed */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-[#727c75]">Activity timeline</h4>
                    {workspace.activities.length === 0 ? (
                      <p className="text-xs text-[#727c75] py-4">No activities logged yet.</p>
                    ) : (
                      workspace.activities.map((act) => (
                        <div key={act.id} className={cn(CONSOLE_SUBCARD, 'p-3 flex items-start gap-2.5 text-xs')}>
                          <Activity className="w-3.5 h-3.5 text-[#34d399] mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-[#edf0ee]">{act.title}</span>
                              <span className="text-[11px] text-[#727c75]">
                                {new Date(act.created_at).toLocaleString()}
                              </span>
                            </div>
                            {act.body && <p className="text-[#a1aaa4] mt-1">{act.body}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === 'messages' && (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!msgText.trim()) return;
                      handleAction(
                        {
                          action: 'send_message',
                          channel: msgChannel,
                          subject: msgChannel === 'Email' ? msgSubject.trim() || undefined : undefined,
                          text: msgText.trim(),
                        },
                        `Dispatched via ${msgChannel}.`,
                        () => {
                          setMsgText('');
                          setMsgSubject('');
                        }
                      );
                    }}
                    className={cn(CONSOLE_SUBCARD, 'p-3.5 space-y-2.5')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#edf0ee]">Send direct message</span>
                      <select
                        value={msgChannel}
                        onChange={(e) => setMsgChannel(e.target.value as any)}
                        className={cn(CONSOLE_INPUT, 'text-xs px-2.5 py-1 cursor-pointer')}
                      >
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Instagram">Instagram DM</option>
                      </select>
                    </div>
                    {msgChannel === 'Email' && (
                      <input
                        type="text"
                        value={msgSubject}
                        onChange={(e) => setMsgSubject(e.target.value)}
                        placeholder="Subject line"
                        className={cn(CONSOLE_INPUT, 'w-full px-3 py-1.5 text-xs')}
                      />
                    )}
                    <textarea
                      rows={3}
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder={`Write your ${msgChannel} message to ${lead.name}...`}
                      className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs resize-none')}
                    />
                    <div className="flex justify-end">
                      <button type="submit" disabled={actionBusy || !msgText.trim()} className={CONSOLE_BTN_PRIMARY}>
                        <Send className="w-3.5 h-3.5" /> Send {msgChannel}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-[#727c75]">Linked Inbox Threads</h4>
                    {workspace.conversations.length === 0 ? (
                      <p className="text-xs text-[#727c75] py-4">No conversations started with this lead yet.</p>
                    ) : (
                      workspace.conversations.map((c) => (
                        <div key={c.id} className={cn(CONSOLE_SUBCARD, 'p-3 flex items-center justify-between text-xs')}>
                          <div>
                            <p className="font-medium text-[#edf0ee]">{c.channel} Thread</p>
                            <p className="text-[#a1aaa4] mt-0.5 line-clamp-1">{c.last_message || 'Active thread'}</p>
                          </div>
                          <span className={CONSOLE_BADGE_INFO}>{c.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === 'bookings' && (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const startIso = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
                      const endIso = new Date(new Date(startIso).getTime() + 45 * 60000).toISOString();
                      handleAction(
                        {
                          action: 'create_booking',
                          serviceType: serviceType.trim() || 'Consultation',
                          startTime: startIso,
                          endTime: endIso,
                          notes: bookingNotes.trim() || undefined,
                        },
                        'Appointment booked and synced with Calendar.',
                        () => setBookingNotes('')
                      );
                    }}
                    className={cn(CONSOLE_SUBCARD, 'p-3.5 space-y-2.5')}
                  >
                    <h4 className="text-xs font-medium text-[#edf0ee] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#34d399]" /> Quick book appointment
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        placeholder="Service or Meeting"
                        className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs')}
                      />
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs')}
                      />
                      <input
                        type="time"
                        required
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs')}
                      />
                    </div>
                    <input
                      type="text"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Optional booking notes"
                      className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                    />
                    <div className="flex justify-end">
                      <button type="submit" disabled={actionBusy} className={CONSOLE_BTN_PRIMARY}>
                        <Calendar className="w-3.5 h-3.5" /> Schedule Booking
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-[#727c75]">Appointments ({workspace.appointments.length})</h4>
                    {workspace.appointments.map((apt) => (
                      <div key={apt.id} className={cn(CONSOLE_SUBCARD, 'p-3 flex items-center justify-between text-xs')}>
                        <div>
                          <p className="font-medium text-[#edf0ee]">{apt.service_name}</p>
                          <p className="text-[#a1aaa4] mt-0.5">{new Date(apt.start_time).toLocaleString()}</p>
                        </div>
                        <span className={CONSOLE_BADGE_LIVE}>{apt.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-medium text-[#727c75]">Orders ({workspace.orders.length})</h4>
                    {workspace.orders.map((ord) => (
                      <div key={ord.id} className={cn(CONSOLE_SUBCARD, 'p-3 flex items-center justify-between text-xs')}>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#34d399]" />
                          <div>
                            <p className="font-medium text-[#edf0ee]">Order #{ord.id.slice(0, 8)}</p>
                            <p className="text-[#a1aaa4]">{new Date(ord.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={CONSOLE_BADGE_LIVE}>€{Number(ord.total_amount || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'tasks' && (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!taskTitle.trim()) return;
                      handleAction(
                        {
                          action: 'create_task',
                          dealId: workspace?.deals?.[0]?.id || null,
                          title: taskTitle.trim(),
                          priority: taskPriority,
                          dueDate: taskDue ? new Date(taskDue).toISOString() : null,
                        },
                        'Follow-up task added.',
                        () => {
                          setTaskTitle('');
                          setTaskDue('');
                        }
                      );
                    }}
                    className={cn(CONSOLE_SUBCARD, 'p-3.5 space-y-2.5')}
                  >
                    <h4 className="text-xs font-medium text-[#edf0ee]">Assign follow-up task</h4>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Send custom pricing proposal"
                      className={cn(CONSOLE_INPUT, 'w-full px-3 py-1.5 text-xs')}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs cursor-pointer')}
                      >
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                      </select>
                      <input
                        type="datetime-local"
                        value={taskDue}
                        onChange={(e) => setTaskDue(e.target.value)}
                        className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs')}
                      />
                      <button type="submit" disabled={actionBusy || !taskTitle.trim()} className={CONSOLE_BTN_PRIMARY}>
                        <Plus className="w-3.5 h-3.5" /> Add Task
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {workspace.tasks.length === 0 ? (
                      <p className="text-xs text-[#727c75] py-4">No tasks linked to this lead yet.</p>
                    ) : (
                      workspace.tasks.map((t) => (
                        <div key={t.id} className={cn(CONSOLE_SUBCARD, 'p-3 flex items-center justify-between text-xs')}>
                          <div>
                            <p className="font-medium text-[#edf0ee]">{t.title}</p>
                            <p className="text-[#a1aaa4] mt-0.5 capitalize">
                              Priority: {t.priority} {t.due_date ? `· Due ${new Date(t.due_date).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                          <span className={t.status === 'completed' ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_WARN}>
                            {t.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === 'sequences' && (
                <div className="space-y-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!selectedSeqId) return;
                      setActionBusy(true);
                      try {
                        const res = await onEnrollSequence(selectedSeqId, [lead.id]);
                        setBanner(
                          res.error
                            ? { kind: 'err', text: res.error }
                            : { kind: 'ok', text: `Enrolled (${res.enrolled} scheduled, ${res.skipped} skipped).` }
                        );
                        setSelectedSeqId('');
                        await onRefresh();
                      } finally {
                        setActionBusy(false);
                      }
                    }}
                    className={cn(CONSOLE_SUBCARD, 'p-3.5 flex flex-wrap items-center gap-2')}
                  >
                    <select
                      value={selectedSeqId}
                      onChange={(e) => setSelectedSeqId(e.target.value)}
                      className={cn(CONSOLE_INPUT, 'flex-1 min-w-[180px] px-3 py-1.5 text-xs cursor-pointer')}
                    >
                      <option value="">Choose outreach sequence...</option>
                      {sequences
                        .filter((s) => s.is_active)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.steps.length} steps)
                          </option>
                        ))}
                    </select>
                    <button type="submit" disabled={actionBusy || !selectedSeqId} className={CONSOLE_BTN_PRIMARY}>
                      <Send className="w-3.5 h-3.5" /> Enroll
                    </button>
                  </form>

                  <div className="space-y-2">
                    {workspace.enrollments.length === 0 ? (
                      <p className="text-xs text-[#727c75] py-4">This lead is not enrolled in any sequence.</p>
                    ) : (
                      workspace.enrollments.map((enr) => (
                        <div key={enr.id} className={cn(CONSOLE_SUBCARD, 'p-3 flex items-center justify-between text-xs')}>
                          <div>
                            <p className="font-medium text-[#edf0ee]">{enr.sequence?.name || 'Sequence'}</p>
                            <p className="text-[#a1aaa4] mt-0.5">
                              Step {enr.current_step + 1} · Status: {enr.status}
                            </p>
                          </div>
                          {enr.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => onUpdateEnrollmentStatus(enr.id, enr.sequence_id, 'stopped')}
                              className={CONSOLE_BTN_SECONDARY}
                            >
                              Stop
                            </button>
                          ) : (
                            <span className={CONSOLE_BADGE_MUTED}>{enr.status}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === 'profile' && (
                <div className="space-y-4">
                  <form onSubmit={handleSaveProfile} className={cn(CONSOLE_SUBCARD, 'p-3.5 space-y-3')}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">Full name *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">Company</label>
                        <input
                          type="text"
                          value={profileForm.companyName}
                          onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">Phone</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">Website</label>
                        <input
                          type="text"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">City</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">Industry</label>
                        <input
                          type="text"
                          value={profileForm.industry}
                          onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a1aaa4] mb-1">Deal value (€)</label>
                        <input
                          type="number"
                          min={0}
                          value={profileForm.dealValue}
                          onChange={(e) => setProfileForm({ ...profileForm, dealValue: e.target.value })}
                          className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#a1aaa4] mb-1">Notes</label>
                      <textarea
                        rows={3}
                        value={profileForm.notes}
                        onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                        className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs resize-none')}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeleteLead(lead.id);
                          onClose();
                        }}
                        className={CONSOLE_BTN_DANGER}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Lead
                      </button>
                      <button type="submit" disabled={actionBusy} className={CONSOLE_BTN_PRIMARY}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </form>

                  {/* Linked Identities */}
                  <div className={cn(CONSOLE_SUBCARD, 'p-3.5 space-y-2')}>
                    <h4 className="text-xs font-medium text-[#edf0ee] flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#34d399]" /> Cross-channel identities ({workspace.identities.length})
                    </h4>
                    {workspace.identities.length === 0 ? (
                      <p className="text-xs text-[#727c75]">No linked channel identities yet.</p>
                    ) : (
                      workspace.identities.map((id) => (
                        <div key={id.id} className="flex items-center justify-between text-xs py-1">
                          <span className="capitalize text-[#edf0ee] flex items-center gap-1.5">
                            {id.channel === 'whatsapp' ? (
                              <MessageCircle className="w-3.5 h-3.5 text-[#34d399]" />
                            ) : id.channel === 'instagram' ? (
                              <Instagram className="w-3.5 h-3.5 text-amber-300" />
                            ) : id.channel === 'email' ? (
                              <Mail className="w-3.5 h-3.5 text-sky-300" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 text-[#a1aaa4]" />
                            )}
                            {id.channel}
                          </span>
                          <span className="font-mono text-[11px] text-[#727c75]">{id.external_user_id}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Duplicate Merge */}
                  {workspace.duplicates.length > 0 && (
                    <div className="rounded-xl bg-amber-400/10 border border-amber-400/25 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-200">
                        <AlertCircle className="w-4 h-4" />
                        <span>Potential duplicate customers detected</span>
                      </div>
                      {workspace.duplicates.map((dup) => (
                        <div key={dup.leadId} className="flex items-center justify-between gap-2 text-xs pt-1">
                          <div>
                            <p className="text-[#edf0ee] font-medium">{dup.name}</p>
                            <p className="text-[11px] text-amber-200/80 font-mono">
                              {dup.matchReason}: {dup.email || dup.phone}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => handleMergeDuplicate(dup.leadId)}
                            className={CONSOLE_BTN_SECONDARY}
                          >
                            <GitMerge className="w-3.5 h-3.5" /> Merge
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
