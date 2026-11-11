import { NextRequest, NextResponse } from 'next/server';
import {
  renderOtpVerificationEmail,
  renderWelcomeEmail,
  renderBookingConfirmationEmail,
  renderBookingReminderEmail,
  renderLeadAlertEmail,
  renderPaymentReceiptEmail,
  renderPasswordResetEmail,
} from '@/lib/email/templates';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'otp';
  const format = searchParams.get('format') || 'html';

  let rendered;

  switch (type.toLowerCase()) {
    case 'otp':
      rendered = renderOtpVerificationEmail({
        otpCode: 'K8M2-9XP4',
        recipientEmail: 'sarah.connor@apexhealth.com',
        userName: 'Sarah',
        purpose: 'signup',
        expiresMinutes: 10,
      });
      break;

    case 'welcome':
      rendered = renderWelcomeEmail({
        ownerName: 'Dr. Michael Chen',
        businessName: 'Chen Dental & Aesthetics',
        businessType: 'Medical & Dental Clinic',
      });
      break;

    case 'booking':
    case 'confirmation':
      rendered = renderBookingConfirmationEmail({
        customerName: 'Emily Watson',
        businessName: 'Luxe Aesthetics Studio',
        serviceName: 'Comprehensive Skin Analysis & Facial',
        dateTime: 'Thursday, Nov 19, 2026 at 2:30 PM EST',
        staffName: 'Dr. Rachel Vance',
        location: 'Suite 400, 150 Greenwich St, New York, NY',
        bookingReference: 'STX-89421',
        price: '$180.00',
        calendarLinks: {
          google: 'https://calendar.google.com',
          outlook: 'https://outlook.live.com',
        },
        rescheduleUrl: 'https://starx-flow.runs-on.dev/booking/reschedule/STX-89421',
        notes: 'Please arrive 10 minutes prior to complete your skin consultation intake.',
      });
      break;

    case 'reminder':
      rendered = renderBookingReminderEmail({
        customerName: 'Emily Watson',
        businessName: 'Luxe Aesthetics Studio',
        serviceName: 'Comprehensive Skin Analysis & Facial',
        dateTime: 'Today at 2:30 PM EST',
        timeUntil: '2 hours',
        staffName: 'Dr. Rachel Vance',
        location: 'Suite 400, 150 Greenwich St, New York, NY',
        bookingReference: 'STX-89421',
        rescheduleUrl: 'https://starx-flow.runs-on.dev/booking/reschedule/STX-89421',
        notes: 'Free validation is available in the building parking structure.',
      });
      break;

    case 'lead':
      rendered = renderLeadAlertEmail({
        businessName: 'StarX-Flow Enterprise',
        leadName: 'Marcus Aurelius',
        leadEmail: 'marcus@solarinnovations.co',
        leadPhone: '+1 (555) 392-8819',
        companyName: 'Solar Innovations Group',
        businessType: 'Commercial Solar & Energy',
        primaryNeed: 'Automating 400+ monthly inbound consultation calls & WhatsApp inquiries',
        preferredContact: 'whatsapp',
        notes: 'Current reception staff overwhelmed on weekends. Needs multi-language support.',
        leadScore: 94,
        crmUrl: 'https://starx-flow.runs-on.dev/dashboard',
        referenceId: 'DEMO-829104',
      });
      break;

    case 'receipt':
    case 'payment':
      rendered = renderPaymentReceiptEmail({
        customerName: 'Sarah Jenkins',
        planName: 'StarX Growth Plan',
        amount: '$79.00',
        currency: 'USD',
        billingPeriod: 'monthly',
        transactionId: 'pol_tx_8a92fb4701e9d',
        nextBillingDate: 'December 11, 2026',
        invoiceUrl: 'https://polar.sh/invoices/inv_demo_8a92',
      });
      break;

    case 'reset':
    case 'security':
      rendered = renderPasswordResetEmail({
        recipientName: 'Sarah Jenkins',
        resetCode: 'P9W3-7N8B',
        resetUrl: 'https://starx-flow.runs-on.dev/auth/reset?code=P9W37N8B',
        expiresMinutes: 15,
        ipAddress: '192.0.2.45 (New York, US)',
        device: 'Chrome on macOS (Sonoma)',
      });
      break;

    default:
      return NextResponse.json(
        {
          error: `Unknown type "${type}". Available types: otp, welcome, booking, reminder, lead, receipt, reset`,
        },
        { status: 400 }
      );
  }

  if (format === 'text') {
    return new NextResponse(rendered.text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new NextResponse(rendered.html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
