/**
 * StarX-Flow AI Workforce Tool Declarations & Zod Validation Schemas (WS-04)
 * Strict schema validation for all agent-callable operational tools.
 */

import { z } from 'zod';

export const checkCalendarAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  serviceId: z.string().optional(),
});

export const bookAppointmentSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.union([z.string().email(), z.literal(''), z.null()]).optional(),
  serviceName: z.string().min(1, 'Service name is required'),
  startTime: z.string().min(1, 'Start time in ISO-8601 format is required'),
  endTime: z.string().min(1, 'End time in ISO-8601 format is required'),
  notes: z.string().nullable().optional(),
});

export const modifyAppointmentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional(),
});

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  reason: z.string().optional(),
});

export const lookupCustomerSchema = z.object({
  query: z.string().min(1, 'Customer query (name, phone, or email) is required'),
});

export const updateCustomerProfileSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const getOrderStatusSchema = z.object({
  orderNumberOrId: z.string().min(1, 'Order number or ID is required'),
});

export const escalateToHumanSchema = z.object({
  reason: z.string().min(3, 'Escalation reason is required').max(400),
  urgency: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  summary: z.string().max(600).optional(),
});

export const saveCustomerPreferenceSchema = z.object({
  key: z.string().trim().min(2).max(60),
  value: z.string().trim().min(1).max(300),
});

export type CheckCalendarAvailabilityInput = z.infer<typeof checkCalendarAvailabilitySchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type ModifyAppointmentInput = z.infer<typeof modifyAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type LookupCustomerInput = z.infer<typeof lookupCustomerSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type GetOrderStatusInput = z.infer<typeof getOrderStatusSchema>;
export type EscalateToHumanInput = z.infer<typeof escalateToHumanSchema>;
export type SaveCustomerPreferenceInput = z.infer<typeof saveCustomerPreferenceSchema>;

export type ToolName =
  | 'checkCalendarAvailability'
  | 'bookAppointment'
  | 'modifyAppointment'
  | 'cancelAppointment'
  | 'lookupCustomer'
  | 'updateCustomerProfile'
  | 'getOrderStatus'
  | 'escalateToHuman'
  | 'saveCustomerPreference';

export const TOOL_SCHEMAS: Record<ToolName, z.ZodTypeAny> = {
  checkCalendarAvailability: checkCalendarAvailabilitySchema,
  bookAppointment: bookAppointmentSchema,
  modifyAppointment: modifyAppointmentSchema,
  cancelAppointment: cancelAppointmentSchema,
  lookupCustomer: lookupCustomerSchema,
  updateCustomerProfile: updateCustomerProfileSchema,
  getOrderStatus: getOrderStatusSchema,
  escalateToHuman: escalateToHumanSchema,
  saveCustomerPreference: saveCustomerPreferenceSchema,
};

/**
 * Gemini Function Declarations for Tool Calling
 */
export const GEMINI_TOOL_DECLARATIONS = [
  {
    name: 'checkCalendarAvailability',
    description: 'Check available appointment time slots for a business on a specific date (YYYY-MM-DD).',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'Date in YYYY-MM-DD format (e.g. 2026-11-29)' },
        serviceId: { type: 'STRING', description: 'Optional service ID to check duration requirements' },
      },
      required: ['date'],
    },
  },
  {
    name: 'bookAppointment',
    description: 'Book an appointment slot for the customer with double-booking conflict verification.',
    parameters: {
      type: 'OBJECT',
      properties: {
        customerName: { type: 'STRING', description: 'Full name of the customer' },
        customerPhone: { type: 'STRING', description: 'Customer phone number in E.164 format' },
        customerEmail: { type: 'STRING', description: 'Customer email address' },
        serviceName: { type: 'STRING', description: 'Name of the service to book' },
        startTime: { type: 'STRING', description: 'Start timestamp in ISO-8601 format' },
        endTime: { type: 'STRING', description: 'End timestamp in ISO-8601 format' },
        notes: { type: 'STRING', description: 'Optional customer notes or preferences' },
      },
      required: ['customerName', 'serviceName', 'startTime', 'endTime'],
    },
  },
  {
    name: 'modifyAppointment',
    description: 'Reschedule or change the status of an existing appointment.',
    parameters: {
      type: 'OBJECT',
      properties: {
        appointmentId: { type: 'STRING', description: 'Unique ID of the appointment to modify' },
        startTime: { type: 'STRING', description: 'New start timestamp in ISO-8601 format' },
        endTime: { type: 'STRING', description: 'New end timestamp in ISO-8601 format' },
        status: { type: 'STRING', enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] },
        notes: { type: 'STRING', description: 'Updated notes' },
      },
      required: ['appointmentId'],
    },
  },
  {
    name: 'cancelAppointment',
    description: 'Cancel an existing customer appointment.',
    parameters: {
      type: 'OBJECT',
      properties: {
        appointmentId: { type: 'STRING', description: 'ID of the appointment to cancel' },
        reason: { type: 'STRING', description: 'Reason for cancellation' },
      },
      required: ['appointmentId'],
    },
  },
  {
    name: 'lookupCustomer',
    description: 'Staff-only lookup of customer CRM profile by name, phone, or email.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Customer name, phone number, or email address' },
      },
      required: ['query'],
    },
  },
  {
    name: 'updateCustomerProfile',
    description: 'Update the verified customer CRM details such as contact info, tags, or notes.',
    parameters: {
      type: 'OBJECT',
      properties: {
        customerId: { type: 'STRING', description: 'Customer ID in the CRM' },
        name: { type: 'STRING', description: 'Updated customer name' },
        phone: { type: 'STRING', description: 'Updated phone number' },
        email: { type: 'STRING', description: 'Updated email address' },
        notes: { type: 'STRING', description: 'Internal CRM notes' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Customer tags' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'getOrderStatus',
    description: 'Look up an existing customer order by order number or ID to check fulfillment and payment status.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderNumberOrId: { type: 'STRING', description: 'Order ID or Order Number (e.g. ORD-1001)' },
      },
      required: ['orderNumberOrId'],
    },
  },
  {
    name: 'escalateToHuman',
    description: 'Hand off the conversation to a human staff member when the customer demands human support, reports a complaint/urgent issue, or requests unlisted pricing/services.',
    parameters: {
      type: 'OBJECT',
      properties: {
        reason: { type: 'STRING', description: 'Short explanation of why human intervention is needed' },
        urgency: { type: 'STRING', enum: ['low', 'medium', 'high'] },
        summary: { type: 'STRING', description: 'Brief context summary for the human staff member' },
      },
      required: ['reason'],
    },
  },
  {
    name: 'saveCustomerPreference',
    description: 'Persist a helpful long-term preference or requirement for the current customer (e.g. preferred_language, preferred_time, service_interest, budget).',
    parameters: {
      type: 'OBJECT',
      properties: {
        key: { type: 'STRING', description: 'Short snake_case key (e.g. preferred_stylist, preferred_day)' },
        value: { type: 'STRING', description: 'Concise preference value shared by the customer' },
      },
      required: ['key', 'value'],
    },
  },
];

function toLowerSchemaTypes(node: any): any {
  if (Array.isArray(node)) return node.map(toLowerSchemaTypes);
  if (node && typeof node === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = k === 'type' && typeof v === 'string' ? v.toLowerCase() : toLowerSchemaTypes(v);
    }
    return out;
  }
  return node;
}

/**
 * OpenAI / NVIDIA NIM Function Calling Declarations derived from GEMINI_TOOL_DECLARATIONS
 */
export const OPENAI_TOOL_DECLARATIONS = GEMINI_TOOL_DECLARATIONS.map((fn) => ({
  type: 'function' as const,
  function: {
    name: fn.name,
    description: fn.description,
    parameters: toLowerSchemaTypes(fn.parameters),
  },
}));
