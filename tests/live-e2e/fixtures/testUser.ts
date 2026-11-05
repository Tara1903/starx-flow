export function generateQATestUser(tag = 'primary') {
  const ts = Date.now();
  return {
    email: `qa.starx.${tag}.${ts}@example-test.org`,
    password: `QaPass_${ts}!Secure`,
    businessName: `StarX QA Business ${tag.toUpperCase()}`,
    businessType: 'Salon & Spa',
    ownerName: `Tester ${tag}`,
    phone: '+4915123456789',
    country: 'Germany',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    service: {
      name: 'Haircut & Styling',
      price: '25',
      durationMinutes: 30,
    },
    openingHours: 'Monday - Friday, 09:00 - 18:00',
  };
}
