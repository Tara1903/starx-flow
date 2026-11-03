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
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  serviceName: z.string().min(1, 'Service name is required'),
  startTime: z.string().min(1, 'Start time in ISO-8601 format is required'),
  endTime: z.string().min(1, 'End time in ISO-8601 format is required'),
  notes: z.string().optional(),
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

export type CheckCalendarAvailabilityInput = z.infer<typeof checkCalendarAvailabilitySchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type ModifyAppointmentInput = z.infer<typeof modifyAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type LookupCustomerInput = z.infer<typeof lookupCustomerSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type GetOrderStatusInput = z.infer<typeof getOrderStatusSchema>;

export type ToolName =
  | 'checkCalendarAvailability'
  | 'bookAppointment'
  | 'modifyAppointment'
  | 'cancelAppointment'
  | 'lookupCustomer'
  | 'updateCustomerProfile'
  | 'getOrderStatus';

export const TOOL_SCHEMAS: Record<ToolName, z.ZodTypeAny> = {
  checkCalendarAvailability: checkCalendarAvailabilitySchema,
  bookAppointment: bookAppointmentSchema,
  modifyAppointment: modifyAppointmentSchema,
  cancelAppointment: cancelAppointmentSchema,
  lookupCustomer: lookupCustomerSchema,
  updateCustomerProfile: updateCustomerProfileSchema,
  getOrderStatus: getOrderStatusSchema,
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
        date: { type: 'STRING', description: 'Date in YYYY-MM-DD format (e.g. 2026-11-05)' },
        serviceId: { type: 'STRING', description: 'Optional service ID to check duration requirements' },
      },
      required: ['date'],
    },
  },
  {
    name: 'bookAppointment',
    description: 'Book an appointment slot for a customer with conflict verification.',
    parameters: {
      type: 'OBJECT',
      properties: {
        customerName: { type: 'STRING', description: 'Full name of the customer' },
        customerPhone: { type: 'STRING', description: 'Customer phone number in E.164 format' },
        customerEmail: { type: 'STRING', description: 'Customer email address' },
        serviceName: { type: 'STRING', description: 'Name of the service to book (e.g. Haircut, Consultation)' },
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
    description: 'Search for customer CRM profile and linked identities by name, phone, or email.',
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
    description: 'Update customer CRM details such as contact info, tags, or notes.',
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
];
