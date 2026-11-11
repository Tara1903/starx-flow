/**
 * StarX-Flow Email Template Engine
 * 
 * Provides responsive, dark-mode-first, high-conversion HTML and text email templates
 * with StarX-Flow signature emerald branding for all system email types:
 * 1. OTP Verification (8-character secure code)
 * 2. Welcome & Onboarding Guide
 * 3. Booking / Appointment Confirmation
 * 4. Booking Reminder (2-hour / 24-hour)
 * 5. Inbound Lead & Demo Request Alert
 * 6. Payment & Subscription Receipt
 * 7. Security Verification / Password Reset
 */

export interface BaseTemplateOptions {
  brandName?: string;
  supportEmail?: string;
  websiteUrl?: string;
}

export interface OtpEmailOptions extends BaseTemplateOptions {
  otpCode: string;
  recipientEmail: string;
  expiresMinutes?: number;
  userName?: string;
  businessName?: string;
  purpose?: 'signup' | 'login' | 'verification';
}

export interface WelcomeEmailOptions extends BaseTemplateOptions {
  ownerName: string;
  businessName: string;
  businessType?: string;
  setupUrl?: string;
  dashboardUrl?: string;
}

export interface BookingConfirmationOptions extends BaseTemplateOptions {
  customerName: string;
  businessName: string;
  serviceName: string;
  dateTime: string;
  staffName?: string;
  location?: string;
  bookingReference: string;
  price?: string;
  calendarLinks?: {
    google?: string;
    outlook?: string;
    ical?: string;
  };
  rescheduleUrl?: string;
  cancelUrl?: string;
  notes?: string;
}

export interface BookingReminderOptions extends BaseTemplateOptions {
  customerName: string;
  businessName: string;
  serviceName: string;
  dateTime: string;
  timeUntil?: string; // e.g. "2 hours" or "24 hours"
  staffName?: string;
  location?: string;
  bookingReference: string;
  rescheduleUrl?: string;
  notes?: string;
}

export interface LeadAlertOptions extends BaseTemplateOptions {
  businessName: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  companyName?: string;
  businessType?: string;
  primaryNeed?: string;
  preferredContact?: string;
  notes?: string;
  leadScore?: number;
  crmUrl?: string;
  referenceId?: string;
}

export interface PaymentReceiptOptions extends BaseTemplateOptions {
  customerName: string;
  planName: string;
  amount: string;
  currency?: string;
  billingPeriod?: 'monthly' | 'annual' | string;
  transactionId: string;
  invoiceUrl?: string;
  billingPortalUrl?: string;
  nextBillingDate?: string;
  last4?: string;
}

export interface PasswordResetOptions extends BaseTemplateOptions {
  recipientName?: string;
  resetCode?: string; // 8-character code
  resetUrl?: string;
  expiresMinutes?: number;
  ipAddress?: string;
  device?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const DEFAULT_BRAND = 'StarX-Flow';
const DEFAULT_URL = 'https://starx-flow.runs-on.dev';
const DEFAULT_SUPPORT = 'support@starx-flow.runs-on.dev';

/**
 * Wraps content in the unified StarX-Flow email shell.
 * Inline CSS ensures bulletproof rendering across Gmail, Outlook, Apple Mail, and mobile clients.
 */
function wrapEmailLayout({
  title,
  preheader,
  contentHtml,
  brandName = DEFAULT_BRAND,
  websiteUrl = DEFAULT_URL,
  supportEmail = DEFAULT_SUPPORT,
}: {
  title: string;
  preheader: string;
  contentHtml: string;
  brandName?: string;
  websiteUrl?: string;
  supportEmail?: string;
}): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style>
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    a {
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .card-content {
        padding: 24px 18px !important;
      }
      .otp-code {
        font-size: 28px !important;
        letter-spacing: 6px !important;
        padding: 16px 12px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5;">
  <!-- Hidden Preheader Preview Text -->
  <div style="display: none; font-size: 1px; color: #09090b; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(preheader)}
    ${'&zwnj;&nbsp;'.repeat(30)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; width: 100%;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Container -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${websiteUrl}" target="_blank" style="display: inline-block; text-decoration: none;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <!-- Glowing Emerald Logo Mark -->
                            <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: inline-block; text-align: center; line-height: 40px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); border: 1px solid rgba(52, 211, 153, 0.4);">
                              <span style="font-size: 20px; font-weight: 800; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">⚡</span>
                            </div>
                          </td>
                          <td style="padding-left: 12px; vertical-align: middle;">
                            <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                              STAR<span style="color: #10b981;">X</span>-FLOW
                            </span>
                            <br>
                            <span style="font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #71717a;">
                              Autonomous Operations
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #121217; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
                <!-- Top Emerald Gradient Accent Bar -->
                <tr>
                  <td height="4" style="background: linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%); font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
                
                <!-- Inner Card Content -->
                <tr>
                  <td class="card-content" style="padding: 36px 32px; background-color: #121217;">
                    ${contentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top: 32px; padding-bottom: 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; line-height: 18px; color: #71717a; text-align: center;">
                    <p style="margin: 0 0 12px 0;">
                      <a href="${websiteUrl}" style="color: #a1a1aa; text-decoration: none; margin: 0 8px;">Dashboard</a> &bull;
                      <a href="${websiteUrl}/setup/account" style="color: #a1a1aa; text-decoration: none; margin: 0 8px;">Account</a> &bull;
                      <a href="mailto:${supportEmail}" style="color: #a1a1aa; text-decoration: none; margin: 0 8px;">Support</a>
                    </p>
                    <p style="margin: 0 0 8px 0; color: #52525b; font-size: 11px;">
                      Secured and delivered via StarX-Flow High-Reliability Operations Engine.<br>
                      Verified domain: <span style="color: #71717a;">starx-flow.runs-on.dev</span>
                    </p>
                    <p style="margin: 0; color: #3f3f46; font-size: 11px;">
                      &copy; ${currentYear} ${escapeHtml(brandName)}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. OTP Verification Email (Strictly 8 Characters)
 */
export function renderOtpVerificationEmail(options: OtpEmailOptions): RenderedEmail {
  const {
    otpCode,
    recipientEmail,
    expiresMinutes = 10,
    userName,
    purpose = 'login',
  } = options;

  // Format with hyphen in middle for readability e.g. "ABCD-EFGH"
  const cleanCode = otpCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const formattedCode = cleanCode.length === 8 
    ? `${cleanCode.slice(0, 4)} - ${cleanCode.slice(4)}` 
    : cleanCode;

  const title = `Your StarX-Flow Verification Code: ${cleanCode}`;
  const preheader = `Your 8-character verification code is ${cleanCode}. Valid for ${expiresMinutes} minutes.`;

  const purposeText = purpose === 'signup' 
    ? 'create your new StarX-Flow account' 
    : 'sign in to your StarX-Flow account';

  const greeting = userName ? `Hello ${escapeHtml(userName)},` : 'Hello,';

  const contentHtml = `
    <!-- Icon Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td>
          <div style="width: 52px; height: 52px; border-radius: 12px; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); text-align: center; line-height: 52px;">
            <span style="font-size: 26px;">🛡️</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Headline -->
    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      Verify Your Identity
    </h1>
    
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #a1a1aa;">
      ${greeting} We received a request to ${purposeText} associated with <span style="color: #f4f4f5; font-weight: 600;">${escapeHtml(recipientEmail)}</span>.
    </p>

    <!-- OTP Display Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
      <tr>
        <td align="center">
          <div style="background-color: #09090b; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 22px 16px; text-align: center; box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #34d399; margin-bottom: 10px;">
              8-CHARACTER VERIFICATION CODE
            </div>
            <div class="otp-code" style="font-family: 'SF Mono', Monaco, Menlo, Consolas, 'Liberation Mono', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 16px rgba(16, 185, 129, 0.5);">
              ${formattedCode}
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #71717a;">
              ⏱️ Expires in <strong style="color: #fbbf24;">${expiresMinutes} minutes</strong> &bull; Single-use only
            </div>
          </div>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #a1a1aa;">
      Enter this 8-character code in your browser to complete authentication. Do not reply to this email with your code.
    </p>

    <!-- Security Advisory Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(24, 24, 27, 0.8); border: 1px solid #27272a; border-radius: 10px; margin-top: 24px;">
      <tr>
        <td style="padding: 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px; font-size: 18px;">🔒</td>
              <td style="font-size: 12px; line-height: 18px; color: #71717a;">
                <strong style="color: #e4e4e7;">Security Notice:</strong> StarX-Flow staff will never contact you asking for your verification code. If you did not request this code, no action is required; your account remains secure.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = wrapEmailLayout({
    title,
    preheader,
    contentHtml,
    brandName: options.brandName,
    websiteUrl: options.websiteUrl,
    supportEmail: options.supportEmail,
  });

  const text = `STARX-FLOW VERIFICATION CODE: ${cleanCode}

${greeting}
We received a request to ${purposeText} (${recipientEmail}).

Your 8-character verification code is:
=======================================
${cleanCode} (Formatted: ${formattedCode})
=======================================

This code is valid for ${expiresMinutes} minutes.

Security Notice: Never share this code with anyone. StarX-Flow staff will never ask for your verification code. If you did not make this request, you can safely ignore this email.

--
StarX-Flow Autonomous Operations
https://starx-flow.runs-on.dev`;

  return { subject: title, html, text };
}

/**
 * 2. Welcome & Onboarding Email
 */
export function renderWelcomeEmail(options: WelcomeEmailOptions): RenderedEmail {
  const {
    ownerName,
    businessName,
    businessType = 'Business',
    setupUrl = `${DEFAULT_URL}/setup/account`,
    dashboardUrl = `${DEFAULT_URL}/dashboard`,
  } = options;

  const title = `Welcome to StarX-Flow, ${ownerName}! 🚀`;
  const preheader = `Your 24/7 AI Receptionist is ready to automate bookings and capture leads for ${businessName}.`;

  const contentHtml = `
    <!-- Celebration Icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td>
          <div style="width: 52px; height: 52px; border-radius: 12px; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); text-align: center; line-height: 52px;">
            <span style="font-size: 26px;">🚀</span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      Welcome to StarX-Flow, ${escapeHtml(ownerName)}!
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #a1a1aa;">
      You have successfully set up your workspace for <strong style="color: #f4f4f5;">${escapeHtml(businessName)}</strong> (${escapeHtml(businessType)}). StarX-Flow will now serve as your autonomous AI receptionist—answering customer inquiries, booking appointments, and following up on every lead 24/7.
    </p>

    <!-- 3-Step Launch Roadmap -->
    <div style="margin: 28px 0; background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px;">
      <div style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #10b981; margin-bottom: 16px;">
        3-STEP QUICK LAUNCH ROADMAP
      </div>

      <!-- Step 1 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; width: 100%;">
        <tr>
          <td width="36" style="vertical-align: top;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #27272a; color: #34d399; font-weight: 700; font-size: 13px; text-align: center; line-height: 28px;">1</div>
          </td>
          <td style="vertical-align: top; padding-left: 8px;">
            <div style="font-size: 14px; font-weight: 600; color: #ffffff;">Connect Your Messaging Channels</div>
            <div style="font-size: 13px; color: #71717a; margin-top: 2px;">Link WhatsApp Business and Instagram DM to respond to customer inquiries instantly.</div>
          </td>
        </tr>
      </table>

      <!-- Step 2 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; width: 100%;">
        <tr>
          <td width="36" style="vertical-align: top;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #27272a; color: #34d399; font-weight: 700; font-size: 13px; text-align: center; line-height: 28px;">2</div>
          </td>
          <td style="vertical-align: top; padding-left: 8px;">
            <div style="font-size: 14px; font-weight: 600; color: #ffffff;">Sync Your Appointment Calendar</div>
            <div style="font-size: 13px; color: #71717a; margin-top: 2px;">Connect Google Calendar or Microsoft Outlook for automatic double-booking prevention.</div>
          </td>
        </tr>
      </table>

      <!-- Step 3 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td width="36" style="vertical-align: top;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #27272a; color: #34d399; font-weight: 700; font-size: 13px; text-align: center; line-height: 28px;">3</div>
          </td>
          <td style="vertical-align: top; padding-left: 8px;">
            <div style="font-size: 14px; font-weight: 600; color: #ffffff;">Train Your Custom AI Knowledge Base</div>
            <div style="font-size: 13px; color: #71717a; margin-top: 2px;">Upload your menu of services, prices, and FAQs in 60 seconds.</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 16px 0;">
      <tr>
        <td align="center">
          <a href="${setupUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
            Complete Your Setup &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 16px 0 0 0; text-align: center; font-size: 13px; color: #71717a;">
      Already completed setup? <a href="${dashboardUrl}" style="color: #34d399; text-decoration: underline;">Go straight to Dashboard</a>
    </p>
  `;

  const html = wrapEmailLayout({
    title,
    preheader,
    contentHtml,
    brandName: options.brandName,
    websiteUrl: options.websiteUrl,
    supportEmail: options.supportEmail,
  });

  const text = `WELCOME TO STARX-FLOW, ${ownerName}!

Your 24/7 AI Receptionist is ready for ${businessName}.

3-Step Quick Launch:
1. Connect WhatsApp and Instagram DM
2. Sync Google or Outlook Calendar
3. Train your custom AI Knowledge Base

Complete your setup now:
${setupUrl}

Dashboard: ${dashboardUrl}

--
StarX-Flow Autonomous Operations
https://starx-flow.runs-on.dev`;

  return { subject: title, html, text };
}

/**
 * 3. Booking / Appointment Confirmation Email
 */
export function renderBookingConfirmationEmail(options: BookingConfirmationOptions): RenderedEmail {
  const {
    customerName,
    businessName,
    serviceName,
    dateTime,
    staffName,
    location,
    bookingReference,
    price,
    calendarLinks,
    rescheduleUrl,
    cancelUrl,
    notes,
  } = options;

  const title = `Appointment Confirmed: ${serviceName} with ${businessName}`;
  const preheader = `Confirmed for ${dateTime} (Ref: ${bookingReference}). View details and add to calendar.`;

  const contentHtml = `
    <!-- Status Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      <tr>
        <td>
          <div style="background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 20px; padding: 6px 14px; display: inline-block;">
            <span style="font-size: 12px; font-weight: 700; color: #34d399; letter-spacing: 1px; text-transform: uppercase;">
              ✓ APPOINTMENT CONFIRMED
            </span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      You're All Booked, ${escapeHtml(customerName)}!
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #a1a1aa;">
      Your appointment with <strong style="color: #f4f4f5;">${escapeHtml(businessName)}</strong> has been scheduled successfully. Here are your booking details:
    </p>

    <!-- Appointment Summary Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;" width="35%">Service</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 14px; font-weight: 600;" align="right">${escapeHtml(serviceName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Date & Time</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #34d399; font-size: 14px; font-weight: 700;" align="right">${escapeHtml(dateTime)}</td>
            </tr>
            ${staffName ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Practitioner / Specialist</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 14px; font-weight: 500;" align="right">${escapeHtml(staffName)}</td>
            </tr>` : ''}
            ${location ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Location</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 13px;" align="right">${escapeHtml(location)}</td>
            </tr>` : ''}
            ${price ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Price</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 14px; font-weight: 600;" align="right">${escapeHtml(price)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 13px;">Reference ID</td>
              <td style="padding: 8px 0; color: #a1a1aa; font-family: monospace; font-size: 13px; font-weight: 600;" align="right">${escapeHtml(bookingReference)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${notes ? `
    <div style="background-color: rgba(39, 39, 42, 0.4); border-left: 3px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13px; color: #d4d4d8;">
      <strong style="color: #ffffff;">Special Instructions:</strong> ${escapeHtml(notes)}
    </div>` : ''}

    <!-- Add to Calendar Buttons -->
    <div style="margin: 28px 0; text-align: center;">
      <div style="font-size: 12px; font-weight: 600; color: #71717a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
        Add to Your Calendar
      </div>
      <div>
        <a href="${calendarLinks?.google || '#'}" target="_blank" style="display: inline-block; background-color: #27272a; color: #ffffff; font-size: 12px; font-weight: 600; padding: 10px 16px; border-radius: 8px; text-decoration: none; margin: 4px 6px;">
          📅 Google Calendar
        </a>
        <a href="${calendarLinks?.outlook || '#'}" target="_blank" style="display: inline-block; background-color: #27272a; color: #ffffff; font-size: 12px; font-weight: 600; padding: 10px 16px; border-radius: 8px; text-decoration: none; margin: 4px 6px;">
          📬 Outlook / iCal
        </a>
      </div>
    </div>

    <!-- Reschedule / Cancel Notice -->
    ${rescheduleUrl || cancelUrl ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #27272a; padding-top: 16px; margin-top: 24px;">
      <tr>
        <td align="center" style="font-size: 12px; color: #71717a;">
          Need to make changes? 
          ${rescheduleUrl ? `<a href="${rescheduleUrl}" style="color: #34d399; text-decoration: underline; margin: 0 6px;">Reschedule Appointment</a>` : ''}
          ${cancelUrl ? `&bull; <a href="${cancelUrl}" style="color: #f87171; text-decoration: underline; margin: 0 6px;">Cancel</a>` : ''}
        </td>
      </tr>
    </table>` : ''}
  `;

  const html = wrapEmailLayout({
    title,
    preheader,
    contentHtml,
    brandName: options.brandName,
    websiteUrl: options.websiteUrl,
    supportEmail: options.supportEmail,
  });

  const text = `APPOINTMENT CONFIRMED: ${serviceName} with ${businessName}

Hello ${customerName},
Your appointment has been successfully scheduled.

Details:
- Service: ${serviceName}
- Date & Time: ${dateTime}
${staffName ? `- Specialist: ${staffName}\n` : ''}${location ? `- Location: ${location}\n` : ''}- Reference ID: ${bookingReference}
${notes ? `\nInstructions: ${notes}\n` : ''}
${rescheduleUrl ? `Reschedule: ${rescheduleUrl}\n` : ''}${cancelUrl ? `Cancel: ${cancelUrl}\n` : ''}

--
${businessName} (via StarX-Flow)
https://starx-flow.runs-on.dev`;

  return { subject: title, html, text };
}

/**
 * 4. Booking Reminder Email (2-Hour / 24-Hour)
 */
export function renderBookingReminderEmail(options: BookingReminderOptions): RenderedEmail {
  const {
    customerName,
    businessName,
    serviceName,
    dateTime,
    timeUntil = '2 hours',
    staffName,
    location,
    bookingReference,
    rescheduleUrl,
    notes,
  } = options;

  const title = `Reminder: Your appointment with ${businessName} is in ${timeUntil}`;
  const preheader = `Upcoming appointment: ${serviceName} at ${dateTime}. We look forward to seeing you!`;

  const contentHtml = `
    <!-- Reminder Pill -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      <tr>
        <td>
          <div style="background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 20px; padding: 6px 14px; display: inline-block;">
            <span style="font-size: 12px; font-weight: 700; color: #fbbf24; letter-spacing: 1px; text-transform: uppercase;">
              ⏰ APPOINTMENT IN ${timeUntil.toUpperCase()}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      See You Soon, ${escapeHtml(customerName)}!
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #a1a1aa;">
      This is a friendly reminder that your upcoming appointment with <strong style="color: #f4f4f5;">${escapeHtml(businessName)}</strong> starts in <strong style="color: #fbbf24;">${escapeHtml(timeUntil)}</strong>.
    </p>

    <!-- Quick Details -->
    <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
        ${escapeHtml(serviceName)}
      </div>
      <div style="font-size: 14px; color: #34d399; font-weight: 600; margin-bottom: 8px;">
        📅 ${escapeHtml(dateTime)}
      </div>
      ${staffName ? `<div style="font-size: 13px; color: #d4d4d8; margin-bottom: 6px;">👤 With ${escapeHtml(staffName)}</div>` : ''}
      ${location ? `<div style="font-size: 13px; color: #d4d4d8; margin-bottom: 6px;">📍 ${escapeHtml(location)}</div>` : ''}
      <div style="font-size: 12px; color: #71717a; font-family: monospace;">Ref: ${escapeHtml(bookingReference)}</div>
    </div>

    ${notes ? `
    <div style="background-color: rgba(39, 39, 42, 0.4); border-left: 3px solid #fbbf24; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13px; color: #d4d4d8;">
      <strong style="color: #ffffff;">Arrival Guide:</strong> ${escapeHtml(notes)}
    </div>` : ''}

    ${rescheduleUrl ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="${rescheduleUrl}" target="_blank" style="font-size: 13px; color: #a1a1aa; text-decoration: underline;">
            Need to reschedule? Click here
          </a>
        </td>
      </tr>
    </table>` : ''}
  `;

  const html = wrapEmailLayout({
    title,
    preheader,
    contentHtml,
    brandName: options.brandName,
    websiteUrl: options.websiteUrl,
    supportEmail: options.supportEmail,
  });

  const text = `APPOINTMENT REMINDER: In ${timeUntil}

Hello ${customerName},
Your appointment with ${businessName} starts soon.

Service: ${serviceName}
Time: ${dateTime}
${staffName ? `With: ${staffName}\n` : ''}${location ? `Location: ${location}\n` : ''}Booking Ref: ${bookingReference}

${rescheduleUrl ? `Need to reschedule? ${rescheduleUrl}\n` : ''}
--
${businessName} (via StarX-Flow)`;

  return { subject: title, html, text };
}

/**
 * 5. Inbound Lead & Demo Request Alert Email
 */
export function renderLeadAlertEmail(options: LeadAlertOptions): RenderedEmail {
  const {
    businessName,
    leadName,
    leadEmail,
    leadPhone,
    companyName,
    businessType,
    primaryNeed,
    preferredContact = 'email',
    notes,
    leadScore,
    crmUrl = `${DEFAULT_URL}/dashboard`,
    referenceId,
  } = options;

  const title = `🔥 New Lead Alert: ${leadName} (${companyName || businessType || 'Demo Request'})`;
  const preheader = `New inbound prospect: ${leadName} (${leadEmail}). Preferred contact: ${preferredContact}.`;

  const contentHtml = `
    <!-- Lead Priority Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      <tr>
        <td>
          <div style="background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 20px; padding: 6px 14px; display: inline-block;">
            <span style="font-size: 12px; font-weight: 700; color: #f87171; letter-spacing: 1px; text-transform: uppercase;">
              🔥 HIGH-PRIORITY INBOUND LEAD
            </span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      New Lead for ${escapeHtml(businessName)}
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #a1a1aa;">
      A new prospective customer just submitted a demo inquiry or contact form.
    </p>

    <!-- Lead Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; margin: 24px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;" width="35%">Contact Name</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 14px; font-weight: 600;" align="right">${escapeHtml(leadName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Email</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #34d399; font-size: 14px;" align="right">
                <a href="mailto:${escapeHtml(leadEmail)}" style="color: #34d399; text-decoration: underline;">${escapeHtml(leadEmail)}</a>
              </td>
            </tr>
            ${leadPhone ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Phone</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 14px;" align="right">
                <a href="tel:${escapeHtml(leadPhone)}" style="color: #ffffff; text-decoration: none;">${escapeHtml(leadPhone)}</a>
              </td>
            </tr>` : ''}
            ${companyName ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Company / Clinic</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 14px;" align="right">${escapeHtml(companyName)}</td>
            </tr>` : ''}
            ${primaryNeed ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Primary Need</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #fbbf24; font-size: 14px; font-weight: 600;" align="right">${escapeHtml(primaryNeed)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 13px;">Preferred Contact</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 13px; text-transform: capitalize;" align="right">${escapeHtml(preferredContact)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${notes ? `
    <div style="background-color: rgba(39, 39, 42, 0.4); border-left: 3px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13px; color: #d4d4d8;">
      <strong style="color: #ffffff;">Prospect Notes:</strong><br>${escapeHtml(notes)}
    </div>` : ''}

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 16px 0;">
      <tr>
        <td align="center">
          <a href="${crmUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
            Open CRM Record & Contact Lead &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = wrapEmailLayout({
    title,
    preheader,
    contentHtml,
    brandName: options.brandName,
    websiteUrl: options.websiteUrl,
    supportEmail: options.supportEmail,
  });

  const text = `NEW INBOUND LEAD ALERT

Business: ${businessName}
Lead Name: ${leadName}
Email: ${leadEmail}
${leadPhone ? `Phone: ${leadPhone}\n` : ''}${companyName ? `Company: ${companyName}\n` : ''}${primaryNeed ? `Primary Need: ${primaryNeed}\n` : ''}Preferred Contact: ${preferredContact}
${notes ? `Notes: ${notes}\n` : ''}
CRM Link: ${crmUrl}

--
StarX-Flow Autonomous Operations`;

  return { subject: title, html, text };
}

/**
 * 6. Payment & Subscription Receipt Email (Polar Billing)
 */
export function renderPaymentReceiptEmail(options: PaymentReceiptOptions): RenderedEmail {
  const {
    customerName,
    planName,
    amount,
    currency = 'USD',
    billingPeriod = 'monthly',
    transactionId,
    invoiceUrl,
    billingPortalUrl = `${DEFAULT_URL}/dashboard`,
    nextBillingDate,
    last4,
  } = options;

  const title = `Payment Receipt: ${planName} (${amount} ${currency})`;
  const preheader = `Thank you for your payment of ${amount} ${currency} for your ${planName} subscription.`;

  const contentHtml = `
    <!-- Receipt Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      <tr>
        <td>
          <div style="background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 20px; padding: 6px 14px; display: inline-block;">
            <span style="font-size: 12px; font-weight: 700; color: #34d399; letter-spacing: 1px; text-transform: uppercase;">
              💳 PAYMENT SUCCESSFUL
            </span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      Payment Receipt
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #a1a1aa;">
      Hello ${escapeHtml(customerName)}, thank you for subscribing to StarX-Flow. Your payment has been received and processed via Polar.
    </p>

    <!-- Invoice Details Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; margin: 24px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;" width="40%">Plan</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 14px; font-weight: 600;" align="right">${escapeHtml(planName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Billing Cycle</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #ffffff; font-size: 13px; text-transform: capitalize;" align="right">${escapeHtml(billingPeriod)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Amount Paid</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #34d399; font-size: 18px; font-weight: 800;" align="right">${escapeHtml(amount)} <span style="font-size: 12px; color: #71717a;">${escapeHtml(currency)}</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #71717a; font-size: 13px;">Transaction ID</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #18181b; color: #a1a1aa; font-family: monospace; font-size: 12px;" align="right">${escapeHtml(transactionId)}</td>
            </tr>
            ${nextBillingDate ? `
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 13px;">Next Renewal</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 13px;" align="right">${escapeHtml(nextBillingDate)}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <!-- Action Buttons -->
    <div style="margin: 28px 0; text-align: center;">
      ${invoiceUrl ? `
      <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin: 4px 6px;">
        Download PDF Invoice
      </a>` : ''}
      <a href="${billingPortalUrl}" target="_blank" style="display: inline-block; background-color: #27272a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin: 4px 6px;">
        Manage Subscription
      </a>
    </div>
  `;

  const html = wrapEmailLayout({
    title,
    preheader,
    contentHtml,
    brandName: options.brandName,
    websiteUrl: options.websiteUrl,
    supportEmail: options.supportEmail,
  });

  const text = `PAYMENT RECEIPT: ${planName}

Hello ${customerName},
Thank you for your payment to StarX-Flow.

Plan: ${planName}
Billing Cycle: ${billingPeriod}
Amount: ${amount} ${currency}
Transaction ID: ${transactionId}
${nextBillingDate ? `Next Renewal: ${nextBillingDate}\n` : ''}
Manage Subscription: ${billingPortalUrl}
${invoiceUrl ? `PDF Invoice: ${invoiceUrl}\n` : ''}
--
StarX-Flow Billing Operations
https://starx-flow.runs-on.dev`;

  return { subject: title, html, text };
}

/**
 * 7. Security Alert & Password Reset Email (8-character code or link)
 */
export function renderPasswordResetEmail(options: PasswordResetOptions): RenderedEmail {
  const {
    recipientName,
    resetCode,
    resetUrl,
    expiresMinutes = 15,
    ipAddress,
    device,
  } = options;

  const cleanCode = resetCode ? resetCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : '';
  const formattedCode = cleanCode.length === 8 ? `${cleanCode.slice(0, 4)} - ${cleanCode.slice(4)}` : cleanCode;

  const title = 'StarX-Flow Password Reset Request';
  const preheader = resetCode 
    ? `Your 8-character password reset code is ${cleanCode}. Valid for ${expiresMinutes} minutes.` 
    : `Password reset request for your StarX-Flow account. Valid for ${expiresMinutes} minutes.`;

  const contentHtml = `
    <!-- Security Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
      <tr>
        <td>
          <div style="background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 20px; padding: 6px 14px; display: inline-block;">
            <span style="font-size: 12px; font-weight: 700; color: #f87171; letter-spacing: 1px; text-transform: uppercase;">
              🔒 SECURITY VERIFICATION
            </span>
          </div>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
      Reset Your Password
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #a1a1aa;">
      ${recipientName ? `Hello ${escapeHtml(recipientName)}, ` : ''}We received a request to reset your StarX-Flow password.
    </p>

    ${resetCode ? `
    <!-- 8-Character Reset Code -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <div style="background-color: #09090b; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 14px; padding: 20px 16px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #f87171; margin-bottom: 10px;">
              8-CHARACTER SECURITY RESET CODE
            </div>
            <div class="otp-code" style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff;">
              ${formattedCode}
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #71717a;">
              ⏱️ Expires in <strong style="color: #fbbf24;">${expiresMinutes} minutes</strong>
            </div>
          </div>
        </td>
      </tr>
    </table>` : ''}

    ${resetUrl ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
            Reset Password Now &rarr;
          </a>
        </td>
      </tr>
    </table>` : ''}

    <!-- Security Audit Info -->
    ${ipAddress || device ? `
    <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 10px; padding: 14px 16px; margin: 20px 0; font-size: 12px; color: #71717a;">
      <strong style="color: #a1a1aa;">Request Details:</strong><br>
      ${device ? `Device: ${escapeHtml(device)}<br>` : ''}
      ${ipAddress ? `IP Address: ${escapeHtml(ipAddress)}<br>` : ''}
      Timestamp: ${new Date().toUTCString()}
    </div>` : ''}

    <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 20px; color: #71717a;">
      If you did not request this password reset, someone may have entered your email by mistake. Your password will not change unless you enter the code or click the link above.
    </p>
  `;

  const html = wrapEmailLayout({
    title,
    preheader,
    contentHtml,
    brandName: options.brandName,
    websiteUrl: options.websiteUrl,
    supportEmail: options.supportEmail,
  });

  const text = `STARX-FLOW PASSWORD RESET

We received a request to reset your StarX-Flow account password.

${resetCode ? `Your 8-character reset code: ${cleanCode} (${formattedCode})\n` : ''}${resetUrl ? `Reset link: ${resetUrl}\n` : ''}
This request is valid for ${expiresMinutes} minutes.

If you did not request this, you can safely ignore this email.

--
StarX-Flow Security Operations
https://starx-flow.runs-on.dev`;

  return { subject: title, html, text };
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
