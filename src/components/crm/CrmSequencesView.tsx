'use client';

import React, { useState } from 'react';
import {
  Mail,
  MessageCircle,
  Instagram,
  Pause,
  Play,
  Plus,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CrmSequence,
  CrmSequenceChannel,
  CrmSequenceEnrollment,
  CrmSequenceStep,
  CrmSequenceTriggerType,
} from '@/types/crm';
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
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
} from '@/lib/consoleSurface';
import { GlassModal } from '@/components/ui/GlassModal';
import { cn } from '@/lib/utils';

interface CrmSequencesViewProps {
  sequences: CrmSequence[];
  enrollments: CrmSequenceEnrollment[];
  leads: Lead[];
  loading: boolean;
  onCreateSequence: (input: {
    name: string;
    description?: string;
    triggerType: CrmSequenceTriggerType;
    channel: CrmSequenceChannel;
    steps: CrmSequenceStep[];
  }) => Promise<{ ok: boolean; error: string | null }>;
  onToggleSequence: (id: string, isActive: boolean) => Promise<{ ok: boolean; error: string | null }>;
  onUpdateEnrollmentStatus: (
    enrollmentId: string,
    sequenceId: string,
    status: 'active' | 'paused' | 'stopped'
  ) => Promise<{ ok: boolean; error: string | null }>;
  onDeleteSequence: (id: string) => Promise<{ ok: boolean; error: string | null }>;
  onEnrollLeads: (
    sequenceId: string,
    leadIds: string[]
  ) => Promise<{ enrolled: number; skipped: number; error: string | null }>;
}

const DEFAULT_STEPS: CrmSequenceStep[] = [
  {
    dayOffset: 0,
    channel: 'email',
    subject: 'Quick idea for {{company}}',
    messageTemplate:
      'Hi {{first_name}}, we noticed {{company}} in {{city}} and help similar {{industry}} teams automate WhatsApp, Instagram, and email bookings 24/7. Open to a 10-minute look?',
  },
  {
    dayOffset: 2,
    channel: 'whatsapp',
    messageTemplate:
      'Hi {{first_name}}, just checking in briefly on my note for {{company}}. Would Thursday work for a quick walkthrough?',
  },
];

export function CrmSequencesView({
  sequences,
  enrollments,
  leads,
  loading,
  onCreateSequence,
  onToggleSequence,
  onUpdateEnrollmentStatus,
  onDeleteSequence,
  onEnrollLeads,
}: CrmSequencesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<CrmSequenceTriggerType>('manual');
  const [channel, setChannel] = useState<CrmSequenceChannel>('multi');
  const [steps, setSteps] = useState<CrmSequenceStep[]>(DEFAULT_STEPS);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [enrollTargetSeq, setEnrollTargetSeq] = useState<CrmSequence | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAddStep = () => {
    const lastDay = steps[steps.length - 1]?.dayOffset ?? 0;
    setSteps((prev) => [
      ...prev,
      {
        dayOffset: lastDay + 2,
        channel: 'email',
        subject: 'Following up with {{company}}',
        messageTemplate: 'Hi {{first_name}}, quick follow up — happy to share a custom setup for {{company}}.',
      },
    ]);
  };

  const handleSaveSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || steps.length === 0) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await onCreateSequence({
        name: name.trim(),
        description: description.trim() || undefined,
        triggerType,
        channel,
        steps,
      });

      if (!res.ok) {
        setFormError(res.error || 'Could not create sequence');
        return;
      }

      setShowCreateModal(false);
      setName('');
      setDescription('');
      setSteps(DEFAULT_STEPS);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollTargetSeq || !selectedLeadId) return;
    setSubmitting(true);
    try {
      const res = await onEnrollLeads(enrollTargetSeq.id, [selectedLeadId]);
      if (res.error) {
        setActionNotice(`Enrollment failed: ${res.error}`);
      } else {
        setActionNotice(
          `Enrolled ${res.enrolled} lead into "${enrollTargetSeq.name}"` +
            (res.skipped > 0 ? ` (${res.skipped} skipped or already active).` : '.')
        );
        setEnrollTargetSeq(null);
        setSelectedLeadId('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderChannelBadge = (ch: string) => {
    if (ch === 'whatsapp') {
      return (
        <span className={CONSOLE_BADGE_LIVE}>
          <MessageCircle className="w-3 h-3" /> WhatsApp
        </span>
      );
    }
    if (ch === 'instagram') {
      return (
        <span className={CONSOLE_BADGE_WARN}>
          <Instagram className="w-3 h-3" /> Instagram
        </span>
      );
    }
    if (ch === 'email') {
      return (
        <span className={CONSOLE_BADGE_INFO}>
          <Mail className="w-3 h-3" /> Email
        </span>
      );
    }
    return <span className={CONSOLE_BADGE_MUTED}>Multi-channel</span>;
  };

  return (
    <div className="space-y-4">
      <div className={cn(CONSOLE_PANEL, 'flex flex-col sm:flex-row sm:items-center justify-between gap-3')}>
        <div>
          <h2 className="text-sm font-medium text-[#edf0ee]">Automated Follow-Up Sequences</h2>
          <p className="text-xs text-[#727c75] mt-0.5">
            Multi-step email, WhatsApp, and Instagram cadences powered by StarX Job Scheduler — auto-pauses when prospects reply or convert.
          </p>
        </div>
        <button type="button" onClick={() => setShowCreateModal(true)} className={CONSOLE_BTN_PRIMARY}>
          <Plus className="w-3.5 h-3.5" />
          <span>New Sequence</span>
        </button>
      </div>

      {actionNotice && (
        <div className="rounded-xl bg-[#4cc38a]/12 border border-[#4cc38a]/25 px-4 py-3 text-xs text-[#4cc38a]">
          {actionNotice}
        </div>
      )}

      {/* Sequences Grid */}
      {sequences.length === 0 ? (
        <div className={cn(CONSOLE_PANEL, 'py-12 text-center')}>
          <p className="text-sm font-medium text-[#edf0ee]">
            {loading ? 'Loading sequences...' : 'No outreach sequences configured yet'}
          </p>
          <p className="text-xs text-[#727c75] mt-1">
            Create your first multi-channel cadence with dynamic variables like {'{{first_name}}'} and {'{{company}}'}.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className={cn(CONSOLE_BTN_SECONDARY, 'mt-4')}
          >
            <Plus className="w-3.5 h-3.5" /> Create first sequence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sequences.map((seq) => (
            <div key={seq.id} className={cn(CONSOLE_PANEL, 'flex flex-col justify-between gap-4')}>
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[#edf0ee] truncate">{seq.name}</h3>
                      <span className={seq.is_active ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                        {seq.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    {seq.description && (
                      <p className="text-xs text-[#727c75] mt-0.5 line-clamp-2">{seq.description}</p>
                    )}
                  </div>
                  {renderChannelBadge(seq.channel)}
                </div>

                <div className="space-y-1.5 pt-1">
                  {seq.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={cn(CONSOLE_SUBCARD, 'px-3 py-2 flex items-start justify-between gap-3 text-xs')}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#edf0ee] tabular-nums">
                            Day {step.dayOffset}
                          </span>
                          <span className="text-[#727c75]">·</span>
                          <span className="capitalize text-[#a1aaa4]">{step.channel}</span>
                        </div>
                        <p className="text-[11px] text-[#727c75] truncate mt-0.5">
                          {step.subject ? `${step.subject} — ` : ''}
                          {step.messageTemplate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#edf0ee]/[0.08]">
                <span className="text-xs text-[#a1aaa4] tabular-nums">
                  {seq.activeEnrollmentsCount || 0} active enrollments
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEnrollTargetSeq(seq)}
                    className={CONSOLE_BTN_SECONDARY}
                  >
                    <Send className="w-3 h-3" /> Enroll lead
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSequence(seq.id, !seq.is_active)}
                    className={CONSOLE_BTN_SECONDARY}
                  >
                    {seq.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{seq.is_active ? 'Pause' : 'Resume'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSequence(seq.id)}
                    className={CONSOLE_BTN_DANGER}
                    title="Delete sequence"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Enrollments Monitor */}
      {enrollments.length > 0 && (
        <div className={cn(CONSOLE_PANEL, 'p-0 overflow-hidden')}>
          <div className="px-4 py-3 border-b border-[#edf0ee]/[0.08] flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#edf0ee]">Active & Recent Enrollments</h3>
            <span className="text-xs text-[#727c75] tabular-nums">{enrollments.length} records</span>
          </div>
          <div className="divide-y divide-[#edf0ee]/[0.06]">
            {enrollments.slice(0, 20).map((enr) => (
              <div key={enr.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-[#edf0ee]">
                    {enr.lead?.name || 'Lead'}{' '}
                    <span className="text-[#727c75] font-normal">in</span>{' '}
                    {enr.sequence?.name || 'Sequence'}
                  </p>
                  <p className="text-[11px] text-[#727c75] tabular-nums mt-0.5">
                    Step {enr.current_step + 1} · Status: {enr.status}
                    {enr.last_error ? ` · Note: ${enr.last_error}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={
                      enr.status === 'active'
                        ? CONSOLE_BADGE_LIVE
                        : enr.status === 'replied' || enr.status === 'completed'
                          ? CONSOLE_BADGE_INFO
                          : CONSOLE_BADGE_MUTED
                    }
                  >
                    {enr.status}
                  </span>
                  {enr.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => onUpdateEnrollmentStatus(enr.id, enr.sequence_id, 'stopped')}
                      className={CONSOLE_BTN_SECONDARY}
                    >
                      <Square className="w-3 h-3" /> Stop
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Sequence Modal */}
      <GlassModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Outreach Sequence"
        subtitle="Use {{first_name}}, {{company}}, {{city}}, and {{industry}} tokens."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSequence} className="space-y-4">
          {formError && (
            <div role="alert" className="rounded-lg bg-[#e5484d]/10 border border-[#e5484d]/25 px-3 py-2 text-xs text-[#f28b8e]">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Sequence name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DACH Salon Outbound Drip"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Primary channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as CrmSequenceChannel)}
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs cursor-pointer')}
              >
                <option value="multi">Multi-channel</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Trigger mode</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as CrmSequenceTriggerType)}
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs cursor-pointer')}
              >
                <option value="manual">Manual or Finder batch enroll</option>
                <option value="finder_import">On Lead Finder import</option>
                <option value="new_lead">On new CRM lead</option>
                <option value="stage_qualified">When qualified</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional goal or target persona"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto console-scroll pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#edf0ee]">Sequence steps</span>
              <button type="button" onClick={handleAddStep} className={CONSOLE_BTN_SECONDARY}>
                <Plus className="w-3 h-3" /> Add step
              </button>
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className={cn(CONSOLE_SUBCARD, 'p-3 space-y-2')}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#edf0ee]">Step {idx + 1}</span>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={step.dayOffset}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, dayOffset: val } : s)));
                      }}
                      className={cn(CONSOLE_INPUT, 'w-16 px-2 py-1 text-xs tabular-nums')}
                    />
                    <span className="text-[11px] text-[#727c75]">day offset</span>
                    <select
                      value={step.channel}
                      onChange={(e) => {
                        const ch = e.target.value as CrmSequenceStep['channel'];
                        setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, channel: ch } : s)));
                      }}
                      className={cn(CONSOLE_INPUT, 'px-2 py-1 text-xs cursor-pointer')}
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-[#727c75] hover:text-[#f28b8e] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {step.channel === 'email' && (
                  <input
                    type="text"
                    value={step.subject || ''}
                    onChange={(e) =>
                      setSteps((prev) =>
                        prev.map((s, i) => (i === idx ? { ...s, subject: e.target.value } : s))
                      )
                    }
                    placeholder="Email subject line"
                    className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs')}
                  />
                )}

                <textarea
                  rows={2}
                  required
                  value={step.messageTemplate}
                  onChange={(e) =>
                    setSteps((prev) =>
                      prev.map((s, i) => (i === idx ? { ...s, messageTemplate: e.target.value } : s))
                    )
                  }
                  className={cn(CONSOLE_INPUT, 'w-full px-2.5 py-1.5 text-xs resize-none')}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className={CONSOLE_BTN_SECONDARY}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={CONSOLE_BTN_PRIMARY}>
              {submitting ? 'Saving...' : 'Save Sequence'}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Enroll Single Lead Modal */}
      <GlassModal
        open={Boolean(enrollTargetSeq)}
        onClose={() => setEnrollTargetSeq(null)}
        title={`Enroll Lead into "${enrollTargetSeq?.name || ''}"`}
        subtitle="Step 1 will be queued on the outbound job scheduler."
        maxWidth="sm"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#a1aaa4] mb-1">Choose customer / lead</label>
            <select
              required
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs cursor-pointer')}
            >
              <option value="">Select lead...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.email ? `(${l.email})` : l.phone ? `(${l.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEnrollTargetSeq(null)} className={CONSOLE_BTN_SECONDARY}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !selectedLeadId} className={CONSOLE_BTN_PRIMARY}>
              {submitting ? 'Enrolling...' : 'Start Sequence'}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
