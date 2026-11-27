import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface EmailPayload {
  to: string;
  template: string;
  data: Record<string, any>;
}

const TEMPLATES: Record<string, (data: any) => { subject: string; html: string }> = {
  verification: (data) => ({
    subject: 'Verify your StarX OS Account',
    html: `<p>Please verify your account by using this token: <strong>${escapeHtml(data?.token)}</strong></p>`,
  }),
  password_reset: (data) => ({
    subject: 'Reset your StarX OS Password',
    html: `<p>Use this token to reset your password: <strong>${escapeHtml(data?.token)}</strong></p>`,
  }),
  booking_confirmation: (data) => ({
    subject: 'Booking Confirmation',
    html: `<p>Your booking is confirmed: ${escapeHtml(JSON.stringify(data?.bookingDetails ?? {}))}</p>`,
  }),
  billing_receipt: (data) => ({
    subject: 'StarX OS Receipt',
    html: `<p>Thank you for your payment. Invoice details: ${escapeHtml(JSON.stringify(data?.invoiceDetails ?? {}))}</p>`,
  }),
  system_alert: (data) => ({
    subject: 'StarX OS System Alert',
    html: `<p>Alert: ${escapeHtml(JSON.stringify(data?.alertDetails ?? {}))}</p>`,
  }),
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error('Missing server credentials');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = bearerMatch ? bearerMatch[1].trim() : '';
  if (!token || !timingSafeEqualStr(token, SERVICE_ROLE_KEY)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.template || !TEMPLATES[payload.template]) {
      return new Response(JSON.stringify({ error: 'Invalid email payload or unknown template' }), { status: 400 });
    }

    const { subject, html } = TEMPLATES[payload.template](payload.data || {});

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StarX OS <system@starxos.com>',
        to: [payload.to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API Error: ${res.status} ${errText}`);
    }

    const resData = await res.json();
    return new Response(JSON.stringify({ success: true, id: resData.id }), { status: 200 });
  } catch (err: any) {
    console.error('[SendEmail] Failed to send email:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
});
