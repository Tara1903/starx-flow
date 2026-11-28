import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmService } from '@/lib/crm/crmService';
import { LeadFinderService } from '@/lib/crm/leadFinder';
import { OutboundDispatcher } from '@/lib/inbox/outboundDispatcher';
import { CalendarSyncService } from '@/lib/integrations/calendar/calendarSyncService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const LeadActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('add_note'),
    dealId: z.string().uuid().nullable().optional(),
    body: z.string().trim().min(1).max(3000),
    saveToLeadNotes: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('create_task'),
    dealId: z.string().uuid().nullable().optional(),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    dueDate: z.string().datetime().nullable().optional(),
  }),
  z.object({
    action: z.literal('create_booking'),
    serviceType: z.string().trim().min(1).max(120),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    notes: z.string().trim().max(1000).optional(),
    dealValue: z.number().min(0).optional(),
  }),
  z.object({
    action: z.literal('send_message'),
    channel: z.enum(['WhatsApp', 'Email', 'Instagram']),
    text: z.string().trim().min(1).max(3000),
    subject: z.string().trim().max(200).optional(),
  }),
  z.object({
    action: z.literal('enrich_website'),
    website: z.string().trim().url().optional(),
  }),
]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { id: leadId } = await params;
    const { organizationId, user } = auth.session;

    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .or(`organization_id.eq.${organizationId},user_id.eq.${user.id}`)
      .maybeSingle();

    if (!lead) {
      return apiErrorResponse(404, 'NOT_FOUND', 'Lead not found');
    }

    const body = await req.json().catch(() => null);
    const parsed = LeadActionSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid CRM action payload');
    }

    const payload = parsed.data;

    if (payload.action === 'add_note') {
      const activity = await CrmService.recordActivity({
        organizationId,
        leadId,
        dealId: payload.dealId || null,
        actorId: user.id,
        activityType: 'note',
        title: 'Added internal note',
        body: payload.body,
      });

      if (payload.saveToLeadNotes) {
        await supabaseAdmin
          .from('leads')
          .update({ notes: payload.body, updated_at: new Date().toISOString() })
          .eq('id', leadId);
      }

      return NextResponse.json({ success: true, activity });
    }

    if (payload.action === 'create_task') {
      const { data: task, error: taskErr } = await supabaseAdmin
        .from('tasks')
        .insert({
          user_id: user.id,
          lead_id: leadId,
          deal_id: payload.dealId || null,
          title: payload.title,
          description: payload.description || null,
          priority: payload.priority,
          due_date: payload.dueDate || null,
          status: 'todo',
        })
        .select('*')
        .single();

      if (taskErr || !task) throw taskErr || new Error('Failed to create task');

      await CrmService.recordActivity({
        organizationId,
        leadId,
        dealId: payload.dealId || null,
        actorId: user.id,
        activityType: 'task',
        title: `Task scheduled: ${payload.title}`,
        body: payload.description || null,
        metadata: { taskId: task.id, priority: payload.priority },
      });

      return NextResponse.json({ success: true, task }, { status: 201 });
    }

    if (payload.action === 'create_booking') {
      if (new Date(payload.endTime).getTime() <= new Date(payload.startTime).getTime()) {
        return apiErrorResponse(422, 'VALIDATION_ERROR', 'Booking endTime must be after startTime');
      }

      const { data: apt, error: aptErr } = await supabaseAdmin
        .from('appointments')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          lead_id: leadId,
          customer_name: lead.name,
          customer_phone: lead.phone,
          customer_email: lead.email,
          service_name: payload.serviceType,
          start_time: payload.startTime,
          end_time: payload.endTime,
          timezone: 'Europe/Berlin',
          status: 'confirmed',
          notes: payload.notes || null,
          reminder_sent: false,
        })
        .select('*')
        .single();

      if (aptErr || !apt) throw aptErr || new Error('Failed to create booking');

      let syncedProviders: string[] = [];
      try {
        const syncRes = await CalendarSyncService.syncAppointmentToExternal(apt, organizationId);
        syncedProviders = syncRes.syncedProviders || [];
      } catch {
        // External calendar sync optional
      }

      await CrmService.advanceLeadOnEvent({
        organizationId,
        leadId,
        event: 'booking_created',
        title: `Booked ${payload.serviceType}`,
        body: syncedProviders.length > 0 ? `Synced to ${syncedProviders.join(', ')}` : undefined,
        valueDelta: payload.dealValue,
        actorId: user.id,
      });

      return NextResponse.json({ success: true, appointment: apt, syncedProviders }, { status: 201 });
    }

    if (payload.action === 'send_message') {
      const recipient =
        payload.channel === 'Email'
          ? lead.email
          : payload.channel === 'WhatsApp'
            ? (lead.enrichment_data?.whatsappNumber as string | undefined) || lead.phone
            : (lead.enrichment_data?.instagramIgsid as string | undefined) || null;

      if (!recipient) {
        return apiErrorResponse(
          422,
          'MISSING_RECIPIENT',
          `Lead does not have a valid ${payload.channel} recipient identifier`
        );
      }

      const { data: convo } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('lead_id', leadId)
        .eq('channel', payload.channel)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const result = await OutboundDispatcher.dispatch({
        organizationId,
        conversationId: convo?.id || `crm-${leadId}`,
        channel: payload.channel,
        recipient,
        text: payload.text,
        subject: payload.subject || `Following up — ${lead.company_name || lead.name}`,
      });

      if (!result.success) {
        return apiErrorResponse(502, 'DELIVERY_FAILED', result.error || `Failed to send ${payload.channel} message`);
      }

      await CrmService.advanceLeadOnEvent({
        organizationId,
        leadId,
        event: 'outbound_message',
        channel: payload.channel,
        title: `Sent ${payload.channel} outreach`,
        body: payload.text.slice(0, 240),
        actorId: user.id,
      });

      return NextResponse.json({ success: true, result });
    }

    if (payload.action === 'enrich_website') {
      const targetWebsite = payload.website || lead.website;
      if (!targetWebsite) {
        return apiErrorResponse(422, 'MISSING_WEBSITE', 'Website URL is required for enrichment');
      }

      const enriched = await LeadFinderService.enrichCandidate(
        {
          externalId: `lead:${lead.id}`,
          name: lead.company_name || lead.name,
          industry: lead.industry || 'Service Business',
          city: lead.city || '',
          country: lead.country || '',
          address: null,
          phone: lead.phone,
          website: targetWebsite,
          email: lead.email,
          instagramHandle: (lead.enrichment_data?.instagramHandle as string | undefined) || null,
          whatsappNumber: (lead.enrichment_data?.whatsappNumber as string | undefined) || null,
          aiSummary: lead.ai_summary || null,
          fitScore: lead.score || 50,
          enrichmentStatus: 'raw',
          lat: null,
          lon: null,
          alreadyInCrm: true,
        },
        lead.industry || 'Service Business'
      );

      if (enriched.enrichmentStatus === 'failed') {
        return apiErrorResponse(422, 'ENRICHMENT_FAILED', 'Unable to safely crawl or extract details from that website URL');
      }

      const { data: updatedLead } = await supabaseAdmin
        .from('leads')
        .update({
          website: enriched.website || targetWebsite,
          email: lead.email || enriched.email,
          ai_summary: enriched.aiSummary,
          score: Math.max(lead.score || 0, enriched.fitScore),
          enrichment_data: {
            ...(lead.enrichment_data || {}),
            instagramHandle: enriched.instagramHandle,
            whatsappNumber: enriched.whatsappNumber,
          },
          enriched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select('*')
        .single();

      await CrmService.recordActivity({
        organizationId,
        leadId,
        actorId: user.id,
        activityType: 'enrichment',
        title: 'Enriched contact & website brief via AI',
        body: enriched.aiSummary || undefined,
      });

      return NextResponse.json({ success: true, lead: updatedLead });
    }

    return apiErrorResponse(400, 'BAD_REQUEST', 'Unsupported action');
  } catch (err) {
    return internalErrorResponse(err, 'Failed to execute CRM action');
  }
}
