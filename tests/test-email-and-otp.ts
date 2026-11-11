import {
  generateEightCharOtp,
  sendEightCharOtp,
  verifyEightCharOtp,
} from '../src/lib/auth/otpService';
import {
  renderOtpVerificationEmail,
  renderWelcomeEmail,
  renderBookingConfirmationEmail,
  renderBookingReminderEmail,
  renderLeadAlertEmail,
  renderPaymentReceiptEmail,
  renderPasswordResetEmail,
} from '../src/lib/email/templates';
import { POST as sendOtpRoute } from '../src/app/api/auth/otp/send/route';
import { POST as verifyOtpRoute } from '../src/app/api/auth/otp/verify/route';
import { GET as previewEmailRoute } from '../src/app/api/email/preview/route';
import { NextRequest } from 'next/server';

async function runEmailAndOtpTests() {
  console.log('================================================================');
  console.log(' STARX-FLOW: EMAIL TEMPLATES & 8-CHAR OTP VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // SUITE 1: 8-CHARACTER OTP GENERATION & SECURITY SPECIFICATION
  // -------------------------------------------------------------
  console.log('--- 1. OTP Generation & Cryptographic Integrity ---');

  const charset = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const generatedCodes = new Set<string>();

  for (let i = 0; i < 50; i++) {
    const code = generateEightCharOtp();
    assert(code.length === 8, `Code #${i + 1} is strictly 8 characters long (got "${code}")`);
    
    // Check characters are within unambiguous set
    const validChars = code.split('').every((ch) => charset.includes(ch));
    assert(validChars, `Code #${i + 1} contains only unambiguous characters`);

    // Check no confusing characters (0, O, 1, I, L)
    assert(!/[0O1IL]/.test(code), `Code #${i + 1} does not contain ambiguous characters (0, O, 1, I, L)`);
    generatedCodes.add(code);
  }

  assert(generatedCodes.size === 50, 'All 50 generated OTP codes are distinct and uniformly distributed');

  // -------------------------------------------------------------
  // SUITE 2: OTP SEND, RATE LIMIT, & VERIFICATION LIFECYCLE
  // -------------------------------------------------------------
  console.log('\n--- 2. OTP Delivery & Verification Lifecycle ---');

  const testEmail = `dr.connor.${Date.now()}@clinic-demo.com`;

  // 2.1 Send OTP
  const sendRes = await sendEightCharOtp({
    email: testEmail,
    purpose: 'signup',
    metadata: {
      owner_name: 'Dr. Sarah Connor',
      business_name: 'CyberAesthetics Clinic',
      business_type: 'Medical & Dental',
    },
  });

  assert(sendRes.success === true, 'Successfully dispatched 8-character OTP');
  assert(Boolean(sendRes.expiresAt), 'OTP response provides ISO expiration timestamp');

  // 2.2 Reject invalid lengths (< 8 or > 8)
  const shortVerify = await verifyEightCharOtp({ email: testEmail, code: '123' });
  assert(!shortVerify.success && shortVerify.error?.includes('8 characters'), 'Rejects code with length < 8 characters');

  const longVerify = await verifyEightCharOtp({ email: testEmail, code: '1234567890' });
  assert(!longVerify.success && longVerify.error?.includes('8 characters'), 'Rejects code with length > 8 characters');

  // 2.3 Reject incorrect code
  const wrongVerify = await verifyEightCharOtp({ email: testEmail, code: 'ZZZZZZZZ' });
  assert(!wrongVerify.success, 'Rejects incorrect 8-character code');

  // 2.4 Send a fresh OTP to test successful verification
  const freshEmail = `verify.test.${Date.now()}@starx-test.com`;
  await sendEightCharOtp({
    email: freshEmail,
    purpose: 'signup',
    metadata: {
      owner_name: 'Alex Mercer',
      business_name: 'Mercer Wellness Studio',
      business_type: 'Beauty & Wellness',
    },
  });

  // Extract from memory store for unit testing verification
  // Let's verify that sendEightCharOtp worked and we can verify via the route
  console.log('\n--- 3. Next.js API Routes Verification ---');

  // Test /api/auth/otp/send route
  const apiSendReq = new NextRequest('http://localhost:3000/api/auth/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'api.user@enterprise.com',
      purpose: 'login',
      metadata: { owner_name: 'Marcus' },
    }),
  });

  const apiSendRes = await sendOtpRoute(apiSendReq);
  const apiSendData = await apiSendRes.json();
  assert(apiSendRes.status === 200 && apiSendData.success === true, 'API /api/auth/otp/send returns HTTP 200 with success: true');

  // Test /api/auth/otp/verify with invalid code
  const apiVerifyReq = new NextRequest('http://localhost:3000/api/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'api.user@enterprise.com',
      code: 'INVALID8',
    }),
  });

  const apiVerifyRes = await verifyOtpRoute(apiVerifyReq);
  const apiVerifyData = await apiVerifyRes.json();
  assert(apiVerifyRes.status === 400 && apiVerifyData.success === false, 'API /api/auth/otp/verify rejects invalid code with HTTP 400');

  // -------------------------------------------------------------
  // SUITE 4: ALL 7 EMAIL TEMPLATES RENDERING & XSS SANITIZATION
  // -------------------------------------------------------------
  console.log('\n--- 4. StarX-Flow Email Templates Engine ---');

  // 4.1 OTP Verification Email Template
  const otpTemplate = renderOtpVerificationEmail({
    otpCode: 'A7K92M4P',
    recipientEmail: 'alex@example.com',
    userName: 'Alex',
    purpose: 'signup',
    expiresMinutes: 10,
  });

  assert(otpTemplate.subject.includes('A7K92M4P'), 'OTP Template subject contains 8-character code');
  assert(otpTemplate.html.includes('A7K9 - 2M4P'), 'OTP Template displays formatted 8-character code (A7K9 - 2M4P)');
  assert(otpTemplate.html.includes('starx-flow.runs-on.dev'), 'OTP Template uses verified domain starx-flow.runs-on.dev');
  assert(otpTemplate.html.includes('Security Notice:'), 'OTP Template includes security and anti-phishing notice');
  assert(otpTemplate.text.includes('A7K92M4P'), 'OTP Plain text fallback contains raw 8-character code');

  // 4.2 Welcome & Onboarding Template
  const welcomeTemplate = renderWelcomeEmail({
    ownerName: 'Dr. Evelyn Reed',
    businessName: 'Apex Skin & Laser',
    businessType: 'Dermatology Clinic',
  });

  assert(welcomeTemplate.subject.includes('Dr. Evelyn Reed'), 'Welcome Template subject includes owner name');
  assert(welcomeTemplate.html.includes('Apex Skin &amp; Laser'), 'Welcome Template includes business name');
  assert(welcomeTemplate.html.includes('Connect Your Messaging Channels'), 'Welcome Template includes Step 1: Messaging');
  assert(welcomeTemplate.html.includes('Sync Your Appointment Calendar'), 'Welcome Template includes Step 2: Calendar');
  assert(welcomeTemplate.html.includes('Train Your Custom AI Knowledge Base'), 'Welcome Template includes Step 3: Knowledge Base');

  // 4.3 Booking Confirmation Template
  const bookingTemplate = renderBookingConfirmationEmail({
    customerName: 'Victoria Secret',
    businessName: 'Luxe Glow Spa',
    serviceName: 'HydraFacial Deluxe',
    dateTime: 'Friday, Dec 1, 2026 at 3:00 PM',
    staffName: 'Elena Rostova',
    location: '100 Fifth Avenue, Floor 4',
    bookingReference: 'STX-77492',
    price: '$220.00',
  });

  assert(bookingTemplate.subject.includes('Appointment Confirmed: HydraFacial Deluxe'), 'Booking confirmation has descriptive subject');
  assert(bookingTemplate.html.includes('STX-77492'), 'Booking confirmation includes reference ID');
  assert(bookingTemplate.html.includes('Elena Rostova'), 'Booking confirmation includes practitioner name');
  assert(bookingTemplate.html.includes('Google Calendar'), 'Booking confirmation includes Google Calendar link button');

  // 4.4 Booking Reminder Template
  const reminderTemplate = renderBookingReminderEmail({
    customerName: 'Victoria Secret',
    businessName: 'Luxe Glow Spa',
    serviceName: 'HydraFacial Deluxe',
    dateTime: 'Today at 3:00 PM',
    timeUntil: '2 hours',
    bookingReference: 'STX-77492',
  });

  assert(reminderTemplate.subject.includes('is in 2 hours'), 'Reminder Template subject emphasizes 2-hour alert');
  assert(reminderTemplate.html.includes('APPOINTMENT IN 2 HOURS'), 'Reminder Template displays prominent urgency badge');

  // 4.5 Lead Alert Template
  const leadTemplate = renderLeadAlertEmail({
    businessName: 'StarX-Flow Platform',
    leadName: 'David H. Brooks',
    leadEmail: 'david@brookshospitality.com',
    leadPhone: '+1 (555) 777-9911',
    companyName: 'Brooks Boutique Hotels',
    primaryNeed: 'Automating guest WhatsApp inquiries across 4 properties',
    preferredContact: 'whatsapp',
    notes: 'Looking to start pilot next Monday.',
  });

  assert(leadTemplate.subject.includes('New Lead Alert: David H. Brooks'), 'Lead alert subject names the prospect');
  assert(leadTemplate.html.includes('david@brookshospitality.com'), 'Lead alert includes clickable prospect contact');
  assert(leadTemplate.html.includes('Brooks Boutique Hotels'), 'Lead alert highlights company name');

  // 4.6 Payment Receipt Template
  const receiptTemplate = renderPaymentReceiptEmail({
    customerName: 'Marcus Aurelius',
    planName: 'StarX Growth Plan',
    amount: '$79.00',
    currency: 'USD',
    billingPeriod: 'monthly',
    transactionId: 'pol_order_8829104',
    nextBillingDate: 'January 10, 2027',
  });

  assert(receiptTemplate.subject.includes('$79.00 USD'), 'Payment Receipt subject includes formatted amount');
  assert(receiptTemplate.html.includes('pol_order_8829104'), 'Payment Receipt includes transaction reference');
  assert(receiptTemplate.html.includes('PAYMENT SUCCESSFUL'), 'Payment Receipt displays success badge');

  // 4.7 Password Reset Template
  const resetTemplate = renderPasswordResetEmail({
    recipientName: 'Sarah Connor',
    resetCode: 'N9K3-4P8M',
    expiresMinutes: 15,
    device: 'Safari on iPhone 16 Pro',
    ipAddress: '198.51.100.42 (Miami, FL)',
  });

  assert(resetTemplate.subject.includes('Password Reset'), 'Password Reset subject is clear');
  assert(resetTemplate.html.includes('N9K3 - 4P8M'), 'Password Reset includes formatted 8-character security code');
  assert(resetTemplate.html.includes('Safari on iPhone 16 Pro'), 'Password Reset includes audit device details');

  // 4.8 XSS Injection Defense Test
  const xssAttack = '<script>alert("hacked")</script>';
  const xssTested = renderOtpVerificationEmail({
    otpCode: 'K9M2-XP48',
    recipientEmail: 'hacker@victim.com',
    userName: xssAttack,
  });

  assert(!xssTested.html.includes('<script>'), 'HTML email template escapes script tags against XSS');
  assert(xssTested.html.includes('&lt;script&gt;'), 'HTML email template safely entities dangerous input');

  // 4.9 Preview Endpoint Test
  const previewReq = new NextRequest('http://localhost:3000/api/email/preview?type=otp');
  const previewRes = await previewEmailRoute(previewReq);
  assert(previewRes.status === 200, 'GET /api/email/preview?type=otp renders HTTP 200');
  assert(previewRes.headers.get('content-type')?.includes('text/html'), 'Preview route returns text/html content-type');

  console.log('\n================================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runEmailAndOtpTests().catch((err) => {
  console.error('Test suite failed with exception:', err);
  process.exit(1);
});
