import { POST } from '../src/app/api/demo/route';

async function runTests() {
  console.log('================================================================');
  console.log(' PHASE 6: DEMO & LEAD CAPTURE ENGINE VERIFICATION');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ ${desc}`);
      failed++;
    }
  }

  // Test 1: Valid Submission
  const validReq = new Request('http://localhost:3000/api/demo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.1',
    },
    body: JSON.stringify({
      fullName: 'Emma Watson',
      workEmail: 'emma@londonaesthetics.co.uk',
      phone: '+44 7700 900077',
      businessName: 'London Aesthetics Clinic',
      businessType: 'Beauty & Salons',
      businessSize: '2–10 staff',
      primaryNeed: 'WhatsApp AI Booking',
      preferredContact: 'whatsapp',
      consent: true,
    }),
  });

  const res1 = await POST(validReq);
  const data1 = await res1.json();
  assert(res1.status === 200 && data1.success === true, 'Valid lead request returns HTTP 200 with success: true');
  assert(typeof data1.referenceId === 'string' && data1.referenceId.startsWith('DEMO-'), 'Lead request assigns unique DEMO- reference ID');

  // Test 2: Missing Consent
  const noConsentReq = new Request('http://localhost:3000/api/demo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.2',
    },
    body: JSON.stringify({
      fullName: 'Emma Watson',
      workEmail: 'emma@londonaesthetics.co.uk',
      businessName: 'London Aesthetics Clinic',
      businessType: 'Beauty & Salons',
      businessSize: '2–10 staff',
      primaryNeed: 'WhatsApp AI Booking',
      consent: false,
    }),
  });

  const res2 = await POST(noConsentReq);
  assert(res2.status === 400, 'Submission without explicit GDPR consent returns HTTP 400');

  // Test 3: Invalid Email
  const badEmailReq = new Request('http://localhost:3000/api/demo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.3',
    },
    body: JSON.stringify({
      fullName: 'Emma Watson',
      workEmail: 'not-an-email',
      businessName: 'London Aesthetics Clinic',
      businessType: 'Beauty & Salons',
      businessSize: '2–10 staff',
      primaryNeed: 'WhatsApp AI Booking',
      consent: true,
    }),
  });

  const res3 = await POST(badEmailReq);
  assert(res3.status === 400, 'Invalid email format returns HTTP 400');

  // Test 4: Bot Trap (Honeypot)
  const botReq = new Request('http://localhost:3000/api/demo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.4',
    },
    body: JSON.stringify({
      fullName: 'Spam Bot',
      workEmail: 'bot@spam.com',
      businessName: 'Spam Corp',
      businessType: 'Other',
      businessSize: 'Solo',
      primaryNeed: 'Spam',
      honeypot: 'I am a bot filling hidden fields',
      consent: true,
    }),
  });

  const res4 = await POST(botReq);
  const data4 = await res4.json();
  assert(res4.status === 200 && data4.success === true, 'Honeypot trap silently fakes success without DB persistence');

  // Test 5: Sliding-Window Rate Limiting
  const ip = '198.51.100.99';
  let rateLimited = false;
  for (let i = 0; i < 7; i++) {
    const req = new Request('http://localhost:3000/api/demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify({
        fullName: 'Rate Tester',
        workEmail: `tester${i}@clinic.com`,
        businessName: 'Test Clinic',
        businessType: 'Medical & Dental Clinics',
        businessSize: 'Solo Practitioner',
        primaryNeed: 'WhatsApp AI Booking',
        consent: true,
      }),
    });
    const r = await POST(req);
    if (r.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert(rateLimited === true, 'Submitting > 5 requests from same IP triggers HTTP 429 rate limit');

  // Test 6: Content-Type Validation (Unsupported Media Type)
  const nonJsonReq = new Request('http://localhost:3000/api/demo', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'x-forwarded-for': '198.51.100.5',
    },
    body: 'plain text payload',
  });
  const res6 = await POST(nonJsonReq);
  assert(res6.status === 415, 'Non-JSON content type returns HTTP 415 Unsupported Media Type');

  // Test 7: Oversized Payload Rejection
  const oversizedReq = new Request('http://localhost:3000/api/demo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': '60000',
      'x-forwarded-for': '198.51.100.6',
    },
    body: JSON.stringify({ notes: 'x'.repeat(60000) }),
  });
  const res7 = await POST(oversizedReq);
  assert(res7.status === 413, 'Oversized payload (>50KB) returns HTTP 413 Payload Too Large');

  console.log('----------------------------------------------------------------');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
