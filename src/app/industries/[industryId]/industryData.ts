export interface IndustryData {
  id: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  painPoints: string[];
  aiSolutions: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
}

export const industryData: Record<string, IndustryData> = {
  plumber: {
    id: 'plumber',
    name: 'Plumbers',
    heroTitle: 'AI Receptionist for Plumbers',
    heroSubtitle: 'Stop missing emergency calls. Let your AI receptionist answer WhatsApps, diagnose issues, and book jobs 24/7.',
    painPoints: [
      'Missing calls while your hands are under a sink',
      'Wasting time on unqualified leads asking for quotes',
      'Customers booking with the first plumber who answers',
      'No time to manage calendar and schedule dispatch'
    ],
    aiSolutions: [
      'Answers emergency queries instantly via WhatsApp',
      'Collects address, photos of the issue, and urgency level',
      'Books appointments directly onto your Google Calendar',
      'Sends automated ETA texts before you arrive'
    ],
    testimonial: {
      quote: 'I used to lose $500+ a week from missed emergency calls while I was driving or on a job. StarX-Flow captures every single one.',
      author: 'Mike T.',
      role: 'Owner, Flow-Rite Plumbing'
    }
  },
  barber: {
    id: 'barber',
    name: 'Barbers & Hair Salons',
    heroTitle: 'AI Receptionist for Barbershops & Salons',
    heroSubtitle: 'Fill your chair without stopping your cuts. Your AI receptionist handles WhatsApp bookings instantly.',
    painPoints: [
      'Clients DMing on Instagram at 2 AM for a cut',
      'Constantly checking your phone while with a client',
      'No-shows killing your daily revenue',
      'Paying a front-desk receptionist $15/hr just to book appointments'
    ],
    aiSolutions: [
      'Books haircuts natively inside WhatsApp and Instagram DMs',
      'Syncs perfectly with Square and Google Calendar',
      'Sends smart AI reminders to eliminate no-shows',
      'Answers FAQs like "Do you do fades?" instantly'
    ],
    testimonial: {
      quote: 'My clients love that they can just text my number and book a fade in seconds. No apps to download. It\'s brilliant.',
      author: 'Marcus J.',
      role: 'Master Barber'
    }
  },
  dentist: {
    id: 'dentist',
    name: 'Dentists & Orthodontists',
    heroTitle: 'AI Receptionist for Dental Clinics',
    heroSubtitle: 'Automate patient intake, answer insurance FAQs, and book cleanings securely with AI.',
    painPoints: [
      'Overwhelmed front desk dealing with routine insurance questions',
      'Patients abandoning booking because they hate calling',
      'Cancellations leaving empty slots in your schedule',
      'Lengthy manual patient intake processes'
    ],
    aiSolutions: [
      'HIPAA-compliant AI answers routine clinic questions',
      'Books cleanings and consultations directly via SMS/WhatsApp',
      'Automatically messages waitlisted patients when a slot opens',
      'Qualifies new leads before they take up staff time'
    ],
    testimonial: {
      quote: 'StarX-Flow handles 80% of our routine calls. Our front desk staff can finally focus on the patients in the waiting room.',
      author: 'Dr. Sarah C.',
      role: 'Clinic Director'
    }
  },
  'med-spa': {
    id: 'med-spa',
    name: 'Med Spas & Aesthetics',
    heroTitle: 'AI Receptionist for Med Spas',
    heroSubtitle: 'Capture high-ticket leads instantly and turn Instagram DMs into booked consultations.',
    painPoints: [
      'Losing high-value leads because you replied 2 hours late',
      'Clients asking the same questions about Botox recovery',
      'Complex multi-service booking requirements',
      'Difficulty tracking which Instagram ads drove bookings'
    ],
    aiSolutions: [
      'Instantly replies to Instagram DMs and converts them to consults',
      'Trained on your specific treatment FAQs and pricing',
      'Handles deposits and calendar syncing automatically',
      'Follows up with clients post-treatment for reviews'
    ],
    testimonial: {
      quote: 'We get dozens of DMs asking about our lip filler pricing. The AI answers them and books the consult immediately. Revenue is up 30%.',
      author: 'Elena R.',
      role: 'Aesthetics Director'
    }
  },
  'personal-trainer': {
    id: 'personal-trainer',
    name: 'Personal Trainers & Gyms',
    heroTitle: 'AI Receptionist for Fitness Pros',
    heroSubtitle: 'Focus on your clients. Let AI handle scheduling, trial class bookings, and lead follow-ups.',
    painPoints: [
      'Constantly texting back and forth to find a time slot',
      'Prospects ghosting after asking for rates',
      'No-shows for free trial classes',
      'Managing multiple calendars for different trainers'
    ],
    aiSolutions: [
      'Shares your availability and books sessions via WhatsApp',
      'Follows up with prospects who ask for rates but don\'t book',
      'Sends aggressive reminders to ensure trial class attendance',
      'Manages class capacity and waitlists automatically'
    ],
    testimonial: {
      quote: 'I used to spend 2 hours every evening just scheduling my clients for the week. Now they text my AI and it\'s done.',
      author: 'David L.',
      role: 'Private Coach'
    }
  }
};
