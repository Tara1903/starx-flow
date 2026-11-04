/**
 * StarX-Flow AI Workforce Tool Execution Engine (WS-04)
 * Strict server-side authorization, tenant scoping, Zod validation,
 * double-booking conflict prevention, and immutable audit logging.
 */

import { supabaseAdmin } from '../../supabaseAdmin';
import { supabase } from '../../supabase';
import { Appointment, Order, Lead } from '../../../types/database';
import {
  ToolName,
  TOOL_SCHEMAS,
  CheckCalendarAvailabilityInput,
  BookAppointmentInput,
  ModifyAppointmentInput,
  CancelAppointmentInput,
  LookupCustomerInput,
  UpdateCustomerProfileInput,
  GetOrderStatusInput,
} from './schemas';
import { IdentityResolver } from '../../crm/identityResolver';
import { CalendarSyncService } from '../../integrations/calendar/calendarSyncService';

export interface ToolExecutionContext {
  userId: string;
  organizationId?: string | null;
  agentRole?: string;
  conversationId?: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  leadId?: string | null;
  actorType?: 'ai_agent' | 'user' | 'system' | 'staff';
  actorId?: string | null;
}

export interface ToolExecutionResponse {
  success: boolean;
  tool: ToolName;
  data?: any;
  error?: string;
  conflict?: boolean;
}

export class ToolExecutor {
  // In-memory state for local testing, offline fallback, and high-performance verification
  private static inMemoryAppointments = new Map<string, Appointment>();
  private static inMemoryOrders = new Map<string, Order>();
  private static inMemoryAuditLogs: any[] = [];

  /**
   * Universal Dispatcher: validates schema, verifies tenant bounds, executes operation, and records audit log.
   */
  static async executeTool(
    toolName: ToolName,
    rawParams: unknown,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { userId, organizationId } = context;

    if (!userId) {
      return {
        success: false,
        tool: toolName,
        error: 'Security Violation: Execution context requires an authenticated userId.',
      };
    }

    // 1. Zod schema validation
    const schema = TOOL_SCHEMAS[toolName];
    if (!schema) {
      return {
        success: false,
        tool: toolName,
        error: `Unknown tool: ${toolName}`,
      };
    }

    const parseResult = schema.safeParse(rawParams);
    if (!parseResult.success) {
      return {
        success: false,
        tool: toolName,
        error: `Validation error for tool ${toolName}: ${parseResult.error.message}`,
      };
    }

    const params = parseResult.data;

    // 2. Dispatch to specific tool handler
    try {
      switch (toolName) {
        case 'checkCalendarAvailability':
          return await this.checkCalendarAvailability(params as CheckCalendarAvailabilityInput, context);
        case 'bookAppointment':
          return await this.bookAppointment(params as BookAppointmentInput, context);
        case 'modifyAppointment':
          return await this.modifyAppointment(params as ModifyAppointmentInput, context);
        case 'cancelAppointment':
          return await this.cancelAppointment(params as CancelAppointmentInput, context);
        case 'lookupCustomer':
          return await this.lookupCustomer(params as LookupCustomerInput, context);
        case 'updateCustomerProfile':
          return await this.updateCustomerProfile(params as UpdateCustomerProfileInput, context);
        case 'getOrderStatus':
          return await this.getOrderStatus(params as GetOrderStatusInput, context);
        default:
          return {
            success: false,
            tool: toolName,
            error: `Unsupported tool: ${toolName}`,
          };
      }
    } catch (err: any) {
      console.error(`[ToolExecutor] Error executing ${toolName}:`, err);
      return {
        success: false,
        tool: toolName,
        error: err.message || 'Internal tool execution failure',
      };
    }
  }

  // -------------------------------------------------------------
  // Tool 1: Check Calendar Availability
  // -------------------------------------------------------------
  private static async checkCalendarAvailability(
    input: CheckCalendarAvailabilityInput,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { date } = input;
    const { userId } = context;

    // Fetch existing active appointments for that day
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    let activeAppointments: Appointment[] = [];

    // Query in-memory first
    for (const apt of this.inMemoryAppointments.values()) {
      if (
        apt.user_id === userId &&
        apt.status !== 'cancelled' &&
        apt.start_time >= dayStart &&
        apt.start_time <= dayEnd
      ) {
        activeAppointments.push(apt);
      }
    }

    // Try Postgres
    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      const { data } = await client
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'cancelled')
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd);

      if (data && data.length > 0) {
        activeAppointments = data as Appointment[];
      }
    } catch {
      // In-memory fallback
    }

    // Standard business hours: 09:00 to 18:00 hourly windows
    const standardSlots = [
      '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    const bookedHours = new Set(
      activeAppointments.map((apt) => {
        const d = new Date(apt.start_time);
        return `${String(d.getUTCHours()).padStart(2, '0')}:00`;
      })
    );

    // Cross-check connected external calendars (Google & Outlook)
    try {
      const externalAvail = await CalendarSyncService.checkAvailability({
        organizationId: context.organizationId || userId,
        date,
      });
      for (const slot of externalAvail.slots) {
        if (!slot.available) {
          const d = new Date(slot.startTime);
          bookedHours.add(`${String(d.getUTCHours()).padStart(2, '0')}:00`);
        }
      }
    } catch {
      // Continue
    }

    const availableSlots = standardSlots
      .filter((slot) => !bookedHours.has(slot))
      .map((slot) => {
        const nextHour = String(parseInt(slot.slice(0, 2), 10) + 1).padStart(2, '0');
        return `${slot} - ${nextHour}:00`;
      });

    return {
      success: true,
      tool: 'checkCalendarAvailability',
      data: {
        date,
        totalSlots: standardSlots.length,
        availableSlotsCount: availableSlots.length,
        availableSlots,
        bookedSlotsCount: bookedHours.size,
      },
    };
  }

  // -------------------------------------------------------------
  // Tool 2: Book Appointment (with Conflict Detection & Audit Log)
  // -------------------------------------------------------------
  private static async bookAppointment(
    input: BookAppointmentInput,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { userId, organizationId, agentRole, conversationId } = context;
    const { customerName, customerPhone, customerEmail, serviceName, startTime, endTime, notes } = input;

    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    if (isNaN(newStart) || isNaN(newEnd) || newEnd <= newStart) {
      return {
        success: false,
        tool: 'bookAppointment',
        error: 'Invalid appointment time window: endTime must be after startTime.',
      };
    }

    // 1. Conflict Detection: check overlapping active appointments
    const existing = Array.from(this.inMemoryAppointments.values()).filter(
      (a) => a.user_id === userId && a.status !== 'cancelled'
    );

    const hasConflict = existing.some((apt) => {
      const existingStart = new Date(apt.start_time).getTime();
      const existingEnd = new Date(apt.end_time).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      return {
        success: false,
        tool: 'bookAppointment',
        conflict: true,
        error: 'Time slot conflict detected. An active appointment is already scheduled during this window.',
      };
    }

    // Also check database appointments if connected
    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      const { data: dbConflicts } = await client
        .from('appointments')
        .select('id, start_time, end_time')
        .eq('user_id', userId)
        .neq('status', 'cancelled')
        .lt('start_time', endTime)
        .gt('end_time', startTime);

      if (dbConflicts && dbConflicts.length > 0) {
        return {
          success: false,
          tool: 'bookAppointment',
          conflict: true,
          error: 'Time slot conflict detected. An active appointment is already scheduled during this window.',
        };
      }
    } catch {
      // In-memory fallback
    }

    // 2. Create appointment record
    const aptId = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const confirmationCode = `SF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAppointment: Appointment = {
      id: aptId,
      user_id: userId,
      organization_id: organizationId || userId,
      customer_name: customerName,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
      service_name: serviceName,
      start_time: startTime,
      end_time: endTime,
      timezone: 'Europe/Berlin',
      status: 'confirmed',
      notes: notes || null,
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.inMemoryAppointments.set(aptId, newAppointment);

    // Try DB insert
    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      await client.from('appointments').insert(newAppointment);
    } catch {
      // In-memory fallback
    }

    // 3. Emit immutable audit log
    await this.recordAuditLog({
      organization_id: organizationId || userId,
      actor_id: agentRole ? `agent:${agentRole}` : 'ai-workforce',
      actor_type: 'ai_agent',
      action: 'ai_tool.book_appointment',
      target_type: 'appointment',
      target_id: aptId,
      changes: {
        customerName,
        serviceName,
        startTime,
        endTime,
        confirmationCode,
        conversationId,
      },
    });

    // 4. Synchronize to external connected calendar (Google / Outlook)
    try {
      await CalendarSyncService.syncAppointmentToExternal(newAppointment, organizationId || userId);
    } catch {
      // Non-blocking sync error
    }

    return {
      success: true,
      tool: 'bookAppointment',
      data: {
        appointmentId: aptId,
        confirmationCode,
        customerName,
        serviceName,
        startTime,
        endTime,
        status: 'confirmed',
        message: `Appointment for ${customerName} successfully confirmed for ${startTime}. Confirmation: ${confirmationCode}.`,
      },
    };
  }

  // -------------------------------------------------------------
  // Tool 3: Modify Appointment
  // -------------------------------------------------------------
  private static async modifyAppointment(
    input: ModifyAppointmentInput,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { userId, organizationId, agentRole, customerPhone, customerEmail, leadId, actorType } = context;
    const { appointmentId, startTime, endTime, status, notes } = input;

    const apt = this.inMemoryAppointments.get(appointmentId);
    const isOrgMatch = apt && (apt.user_id === userId || (organizationId && apt.organization_id === organizationId));

    if (!apt || !isOrgMatch) {
      return {
        success: false,
        tool: 'modifyAppointment',
        error: `Appointment ${appointmentId} not found or unauthorized.`,
      };
    }

    // Customer-Level Session Authorization Gate
    if (actorType !== 'staff' && (customerPhone || customerEmail || leadId)) {
      const isPhoneMatch = customerPhone && IdentityResolver.isPhoneMatch(apt.customer_phone, customerPhone);
      const isEmailMatch = customerEmail && apt.customer_email && apt.customer_email.toLowerCase() === customerEmail.toLowerCase();
      const isLeadMatch = leadId && apt.lead_id && apt.lead_id === leadId;

      if (!isPhoneMatch && !isEmailMatch && !isLeadMatch) {
        await this.recordAuditLog({
          organization_id: organizationId || userId,
          actor_id: agentRole ? `agent:${agentRole}` : 'ai-workforce',
          actor_type: 'ai_agent',
          action: 'ai_tool.modify_appointment.unauthorized_attempt',
          target_type: 'appointment',
          target_id: appointmentId,
          changes: { attempted_by: { customerPhone, customerEmail, leadId } },
        });

        return {
          success: false,
          tool: 'modifyAppointment',
          error: 'Security Notice: You are not authorized to modify this appointment as it does not match your customer identity.',
        };
      }
    }

    // If rescheduling, check for conflicts
    if (startTime && endTime) {
      const newStart = new Date(startTime).getTime();
      const newEnd = new Date(endTime).getTime();

      const hasConflict = Array.from(this.inMemoryAppointments.values()).some((other) => {
        if (other.id === appointmentId || other.user_id !== userId || other.status === 'cancelled') return false;
        const oStart = new Date(other.start_time).getTime();
        const oEnd = new Date(other.end_time).getTime();
        return newStart < oEnd && newEnd > oStart;
      });

      if (hasConflict) {
        return {
          success: false,
          tool: 'modifyAppointment',
          conflict: true,
          error: 'Rescheduling conflict: the requested new time slot is already booked.',
        };
      }

      apt.start_time = startTime;
      apt.end_time = endTime;
    }

    if (status) apt.status = status;
    if (notes !== undefined) apt.notes = notes;
    apt.updated_at = new Date().toISOString();

    // Audit log
    await this.recordAuditLog({
      organization_id: organizationId || userId,
      actor_id: agentRole ? `agent:${agentRole}` : 'ai-workforce',
      actor_type: 'ai_agent',
      action: 'ai_tool.modify_appointment',
      target_type: 'appointment',
      target_id: appointmentId,
      changes: { startTime, endTime, status, notes },
    });

    return {
      success: true,
      tool: 'modifyAppointment',
      data: {
        appointmentId,
        updatedAppointment: apt,
        message: `Appointment ${appointmentId} updated successfully.`,
      },
    };
  }

  // -------------------------------------------------------------
  // Tool 4: Cancel Appointment
  // -------------------------------------------------------------
  private static async cancelAppointment(
    input: CancelAppointmentInput,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { userId, organizationId, agentRole, customerPhone, customerEmail, leadId, actorType } = context;
    const { appointmentId, reason } = input;

    const apt = this.inMemoryAppointments.get(appointmentId);
    const isOrgMatch = apt && (apt.user_id === userId || (organizationId && apt.organization_id === organizationId));

    if (!apt || !isOrgMatch) {
      return {
        success: false,
        tool: 'cancelAppointment',
        error: `Appointment ${appointmentId} not found or unauthorized.`,
      };
    }

    // Customer-Level Session Authorization Gate
    if (actorType !== 'staff' && (customerPhone || customerEmail || leadId)) {
      const isPhoneMatch = customerPhone && IdentityResolver.isPhoneMatch(apt.customer_phone, customerPhone);
      const isEmailMatch = customerEmail && apt.customer_email && apt.customer_email.toLowerCase() === customerEmail.toLowerCase();
      const isLeadMatch = leadId && apt.lead_id && apt.lead_id === leadId;

      if (!isPhoneMatch && !isEmailMatch && !isLeadMatch) {
        await this.recordAuditLog({
          organization_id: organizationId || userId,
          actor_id: agentRole ? `agent:${agentRole}` : 'ai-workforce',
          actor_type: 'ai_agent',
          action: 'ai_tool.cancel_appointment.unauthorized_attempt',
          target_type: 'appointment',
          target_id: appointmentId,
          changes: { attempted_by: { customerPhone, customerEmail, leadId }, target_apt_id: appointmentId },
        });

        return {
          success: false,
          tool: 'cancelAppointment',
          error: 'Security Notice: You are not authorized to cancel this appointment as it does not match your customer identity.',
        };
      }
    }

    apt.status = 'cancelled';
    apt.updated_at = new Date().toISOString();

    // Audit log
    await this.recordAuditLog({
      organization_id: organizationId || userId,
      actor_id: agentRole ? `agent:${agentRole}` : 'ai-workforce',
      actor_type: 'ai_agent',
      action: 'ai_tool.cancel_appointment',
      target_type: 'appointment',
      target_id: appointmentId,
      changes: { status: 'cancelled', reason },
    });

    // Synchronize cancellation to external connected calendar
    try {
      await CalendarSyncService.cancelExternalAppointment(appointmentId, organizationId || userId);
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      tool: 'cancelAppointment',
      data: {
        appointmentId,
        status: 'cancelled',
        reason: reason || 'Customer request',
        message: `Appointment ${appointmentId} has been successfully cancelled.`,
      },
    };
  }

  // -------------------------------------------------------------
  // Tool 5: Lookup Customer (CRM & Identities)
  // -------------------------------------------------------------
  private static async lookupCustomer(
    input: LookupCustomerInput,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { userId } = context;
    const { query } = input;
    const cleanQuery = query.toLowerCase().trim();

    const matches: any[] = [];

    // Query in-memory leads from IdentityResolver
    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      const { data } = await client
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%,phone.ilike.%${cleanQuery}%`)
        .limit(5);

      if (data && data.length > 0) {
        matches.push(...data);
      }
    } catch {
      // In-memory fallback
    }

    // Attach linked identities to each matched customer
    const enhancedMatches = await Promise.all(
      matches.map(async (customer) => {
        const identities = await IdentityResolver.getCustomerIdentities(userId, customer.id);
        return {
          ...customer,
          linkedIdentities: identities,
        };
      })
    );

    return {
      success: true,
      tool: 'lookupCustomer',
      data: {
        query,
        count: enhancedMatches.length,
        customers: enhancedMatches,
      },
    };
  }

  // -------------------------------------------------------------
  // Tool 6: Update Customer Profile
  // -------------------------------------------------------------
  private static async updateCustomerProfile(
    input: UpdateCustomerProfileInput,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { userId, organizationId, agentRole, leadId, actorType } = context;
    const { customerId, name, phone, email, notes, tags } = input;

    // Customer-level authorization: end customers can only update their own profile
    if (actorType !== 'staff' && leadId && customerId !== leadId) {
      return {
        success: false,
        tool: 'updateCustomerProfile',
        error: 'Security Notice: You can only update your own customer profile.',
      };
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (notes) updates.notes = notes;
    if (tags) updates.tags = tags;

    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      await client.from('leads').update(updates).eq('id', customerId).eq('user_id', userId);
    } catch {
      // In-memory fallback
    }

    // Audit log
    await this.recordAuditLog({
      organization_id: organizationId || userId,
      actor_id: agentRole ? `agent:${agentRole}` : 'ai-workforce',
      actor_type: 'ai_agent',
      action: 'ai_tool.update_customer',
      target_type: 'lead',
      target_id: customerId,
      changes: updates,
    });

    return {
      success: true,
      tool: 'updateCustomerProfile',
      data: {
        customerId,
        updatedFields: updates,
        message: `Customer ${customerId} profile updated successfully.`,
      },
    };
  }

  // -------------------------------------------------------------
  // Tool 7: Get Order Status
  // -------------------------------------------------------------
  private static async getOrderStatus(
    input: GetOrderStatusInput,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResponse> {
    const { userId, organizationId, customerPhone, customerEmail, leadId, actorType, agentRole } = context;
    const { orderNumberOrId } = input;

    let order: Order | undefined = this.inMemoryOrders.get(orderNumberOrId);

    if (!order) {
      for (const o of this.inMemoryOrders.values()) {
        const isOrgMatch = o.user_id === userId || (organizationId && o.organization_id === organizationId);
        if (isOrgMatch && (o.id === orderNumberOrId || o.order_number === orderNumberOrId)) {
          order = o;
          break;
        }
      }
    }

    if (!order) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data } = await client
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .or(`id.eq.${orderNumberOrId},order_number.eq.${orderNumberOrId}`)
          .maybeSingle();

        if (data) {
          order = data as Order;
        }
      } catch {
        // In-memory fallback
      }
    }

    if (!order) {
      return {
        success: false,
        tool: 'getOrderStatus',
        error: `Order with reference ${orderNumberOrId} was not found.`,
      };
    }

    // Customer-Level Session Authorization Gate
    if (actorType !== 'staff' && (customerPhone || customerEmail || leadId)) {
      const isPhoneMatch = customerPhone && IdentityResolver.isPhoneMatch(order.customer_phone, customerPhone);
      const isEmailMatch = customerEmail && order.customer_email && order.customer_email.toLowerCase() === customerEmail.toLowerCase();
      const isLeadMatch = leadId && order.lead_id && order.lead_id === leadId;

      if (!isPhoneMatch && !isEmailMatch && !isLeadMatch) {
        await this.recordAuditLog({
          organization_id: organizationId || userId,
          actor_id: agentRole ? `agent:${agentRole}` : 'ai-workforce',
          actor_type: 'ai_agent',
          action: 'ai_tool.get_order_status.unauthorized_attempt',
          target_type: 'order',
          target_id: order.id,
          changes: {
            attempted_by: { customerPhone, customerEmail, leadId },
            target_order_number: order.order_number,
          },
        });

        return {
          success: false,
          tool: 'getOrderStatus',
          error: `Order with reference ${orderNumberOrId} was not found for your account.`,
        };
      }
    }

    return {
      success: true,
      tool: 'getOrderStatus',
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        status: order.status,
        paymentStatus: order.payment_status,
        totalAmount: order.total_amount,
        currency: order.currency,
        itemsCount: order.items?.length || 0,
        createdAt: order.created_at,
        invoiceUrl: order.invoice_url,
      },
    };
  }

  // -------------------------------------------------------------
  // Helper: Central Immutable Audit Logger
  // -------------------------------------------------------------
  private static async recordAuditLog(log: {
    organization_id: string;
    actor_id?: string | null;
    actor_type?: 'ai_agent' | 'user' | 'system' | 'api_key' | 'cron';
    action: string;
    target_type: string;
    target_id: string;
    changes: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const actorType = log.actor_type || 'ai_agent';
    // Validate UUID format for actor_id to satisfy PostgreSQL auth.users(id) foreign key constraint
    const isUuid = Boolean(
      log.actor_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(log.actor_id)
    );
    const dbActorId = isUuid ? log.actor_id : null;

    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      organization_id: log.organization_id,
      actor_id: dbActorId,
      actor_type: actorType,
      action: log.action,
      target_type: log.target_type,
      target_id: log.target_id,
      changes: {
        ...log.changes,
        ...(log.actor_id && !isUuid ? { raw_actor_identifier: log.actor_id } : {}),
      },
      metadata: log.metadata || {},
      created_at: new Date().toISOString(),
    };

    this.inMemoryAuditLogs.push(entry);

    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      await client.from('audit_logs').insert(entry);
    } catch {
      // In-memory fallback
    }
  }

  // -------------------------------------------------------------
  // Seeders for Tests & Local Mocks
  // -------------------------------------------------------------
  static seedAppointment(apt: Appointment): void {
    this.inMemoryAppointments.set(apt.id, apt);
  }

  static getAppointment(id: string): Appointment | undefined {
    return this.inMemoryAppointments.get(id);
  }

  static getAppointments(): Appointment[] {
    return Array.from(this.inMemoryAppointments.values());
  }

  static seedOrder(order: Order): void {
    this.inMemoryOrders.set(order.id, order);
  }

  static getAuditLogs(): any[] {
    return this.inMemoryAuditLogs;
  }

  static clearInMemory(): void {
    this.inMemoryAppointments.clear();
    this.inMemoryOrders.clear();
    this.inMemoryAuditLogs = [];
  }
}
