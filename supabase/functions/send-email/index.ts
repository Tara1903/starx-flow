import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

interface EmailPayload {
  to: string;
  template: string;
  data: Record<string, any>;
}

const TEMPLATES: Record<string, (data: any) => { subject: string, html: string }> = {
  'verification': (data) => ({
    subject: 'Verify your StarX OS Account',
    html: `<p>Please verify your account by using this token: <strong>${data.token}</strong></p>`
  }),
  'password_reset': (data) => ({
    subject: 'Reset your StarX OS Password',
    html: `<p>Use this token to reset your password: <strong>${data.token}</strong></p>`
  }),
  'booking_confirmation': (data) => ({
    subject: 'Booking Confirmation',
    html: `<p>Your booking is confirmed: ${JSON.stringify(data.bookingDetails)}</p>`
  }),
  'billing_receipt': (data) => ({
    subject: 'StarX OS Receipt',
    html: `<p>Thank you for your payment. Invoice details: ${JSON.stringify(data.invoiceDetails)}</p>`
  }),
  'system_alert': (data) => ({
    subject: 'StarX OS System Alert',
    html: `<p>Alert: ${JSON.stringify(data.alertDetails)}</p>`
  })
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  try {
    const payload: EmailPayload = await req.json();
    
    if (!payload.to || !payload.template || !TEMPLATES[payload.template]) {
      throw new Error('Invalid email payload or unknown template');
    }

    const { subject, html } = TEMPLATES[payload.template](payload.data);

    // Send via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'StarX OS <system@starxos.com>',
        to: [payload.to],
        subject,
        html,
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API Error: ${res.status} ${errText}`);
    }

    const resData = await res.json();
    return new Response(JSON.stringify({ success: true, id: resData.id }), { status: 200 });

  } catch (err: any) {
    console.error('[SendEmail] Failed to send email:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
