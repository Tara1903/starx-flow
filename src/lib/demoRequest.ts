import { z } from 'zod';

export const demoRequestSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or fewer'),
  workEmail: z.string().trim().email('Please enter a valid work email').max(120),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(100),
  businessType: z.string().trim().min(2).max(50),
  businessSize: z.string().trim().min(1).max(50),
  primaryNeed: z.string().trim().min(2).max(100),
  preferredContact: z.enum(['email', 'whatsapp', 'phone']),
  website: z.string().trim().max(150).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  honeypot: z.string().max(100).optional().or(z.literal('')),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to be contacted regarding your demo request.',
  }),
}).superRefine((data, ctx) => {
  const phone = data.phone || '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (!phone && data.preferredContact !== 'email') {
    ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Enter a phone number for this contact method.' });
  } else if (phone && (!/^\+?[0-9 ().-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) {
    ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Enter a phone number with 7 to 15 digits.' });
  }
});

export type DemoFormValues = z.infer<typeof demoRequestSchema>;

export async function submitDemoRequest(
  data: DemoFormValues
): Promise<{ referenceId: string; message: string }> {
  const response = await fetch('/api/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success || !result.referenceId) {
    throw new Error(result.error || 'Failed to submit request.');
  }

  return {
    referenceId: result.referenceId,
    message: result.message || 'Your demonstration request has been received.',
  };
}
