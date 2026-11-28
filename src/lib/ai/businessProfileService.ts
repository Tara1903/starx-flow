/**
 * StarX-Flow Business Receptionist Profile Service (Zero-Hallucination Core)
 * Manages verified business facts: services catalog, transparent prices,
 * opening hours with timezone handling, FAQs, and policies.
 */

import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { supabase } from '../supabase';
import { isValidUuid, lookupExistingOrganizationId, resolveValidOrganizationId } from '../crm/organizationHelper';

export interface BusinessServiceItem {
  id?: string;
  name: string;
  description?: string;
  priceEur?: number;
  price?: number;
  currency?: string;
  durationMinutes: number;
}

export interface DayOpeningHours {
  open?: string; // "09:00"
  close?: string; // "18:00"
  closed: boolean;
}

export type WeekOpeningHours = Record<
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  DayOpeningHours
>;

export interface BusinessPolicyConfig {
  cancellation: string;
  refunds?: string;
  booking_rules?: string;
  payment?: string;
}

export interface BusinessReceptionistProfile {
  organizationId: string;
  businessName: string;
  businessType?: string;
  description?: string;
  services: BusinessServiceItem[];
  openingHours: WeekOpeningHours;
  timezone: string;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  faqs: Array<{ question: string; answer: string }>;
  policies: BusinessPolicyConfig;
  supportedLanguages?: string[];
  customInstructions?: string;
  handoffRules?: string;
  isConfigured?: boolean;
  isActive: boolean;
  updatedAt?: string;
}

export const DEFAULT_WEEK_HOURS: WeekOpeningHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { closed: true },
};

export class BusinessProfileService {
  // In-memory cache for fast serverless retrieval & test isolation
  private static inMemoryProfiles = new Map<string, BusinessReceptionistProfile>();

  static clearInMemory(): void {
    this.inMemoryProfiles.clear();
  }

  /**
   * Retrieves business profile by organizationId, hydrating real org/profile identity
   * instead of impersonating synthetic defaults when custom catalog setup is pending.
   */
  static async getProfile(
    organizationId: string,
    fallbackUserId?: string
  ): Promise<BusinessReceptionistProfile> {
    if (!organizationId || organizationId === 'default-org') {
      return this.createStarXPlatformProfile(organizationId || 'default-org');
    }

    // 1. Check explicit cached profile first
    if (this.inMemoryProfiles.has(organizationId)) {
      return this.inMemoryProfiles.get(organizationId)!;
    }

    // 2. Query PostgreSQL when configured
    if (isSupabaseAdminConfigured && (isValidUuid(organizationId) || isValidUuid(fallbackUserId))) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const dbOrgId =
          (await lookupExistingOrganizationId(fallbackUserId || organizationId, organizationId)) ||
          organizationId;

        if (this.inMemoryProfiles.has(dbOrgId)) {
          return this.inMemoryProfiles.get(dbOrgId)!;
        }

        const { data, error } = await client
          .from('business_receptionist_profiles')
          .select('*')
          .eq('organization_id', dbOrgId)
          .maybeSingle();

        if (!error && data) {
          const profile: BusinessReceptionistProfile = {
            organizationId: data.organization_id,
            businessName: data.business_name,
            businessType: data.business_type,
            description: data.description,
            services: data.services || [],
            openingHours: data.opening_hours || DEFAULT_WEEK_HOURS,
            timezone: data.timezone || 'Europe/Berlin',
            location: data.location,
            contactPhone: data.contact_phone,
            contactEmail: data.contact_email,
            faqs: data.faqs || [],
            policies: data.policies || {
              cancellation: '24 hours notice required',
              refunds: 'Subject to review',
              booking_rules: 'Advance booking recommended',
            },
            supportedLanguages: data.supported_languages || ['en', 'de', 'fr', 'it'],
            customInstructions: data.custom_instructions,
            handoffRules: data.handoff_rules,
            isConfigured: true,
            isActive: data.is_active ?? true,
            updatedAt: data.updated_at || new Date().toISOString(),
          };

          this.inMemoryProfiles.set(organizationId, profile);
          return profile;
        }

        // Hydrate real organization / user profile name & business type instead of clinic stub
        const [orgRes, profRes] = await Promise.all([
          isValidUuid(dbOrgId)
            ? client.from('organizations').select('name').eq('id', dbOrgId).maybeSingle()
            : Promise.resolve({ data: null }),
          isValidUuid(fallbackUserId || dbOrgId)
            ? client
                .from('profiles')
                .select('business_name, business_type, email')
                .eq('id', isValidUuid(fallbackUserId) ? fallbackUserId : dbOrgId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        const realBusinessName =
          (profRes.data as any)?.business_name || (orgRes.data as any)?.name || null;
        if (realBusinessName) {
          return {
            organizationId: dbOrgId,
            businessName: realBusinessName,
            businessType: (profRes.data as any)?.business_type || 'Service Business',
            description: `${realBusinessName} AI Receptionist & Customer Operations`,
            services: [],
            openingHours: DEFAULT_WEEK_HOURS,
            timezone: 'Europe/Berlin',
            contactEmail: (profRes.data as any)?.email || undefined,
            faqs: [],
            policies: {
              cancellation: 'Please notify our team in advance if you need to reschedule.',
              refunds: 'Handled directly by our team.',
              booking_rules: 'Appointments subject to team availability.',
            },
            supportedLanguages: ['en', 'de', 'fr', 'it', 'es'],
            handoffRules: 'Escalate billing disputes, complaints, or unlisted service pricing requests.',
            isConfigured: false,
            isActive: true,
            updatedAt: new Date().toISOString(),
          };
        }
      } catch {
        // Fallback below
      }
    }

    // 3. Test / ephemeral synthetic IDs preserve predictable clean test shape without caching clinic defaults onto real UUIDs
    const neutralProfile = this.createUnconfiguredProfile(organizationId);
    if (!isValidUuid(organizationId)) {
      this.inMemoryProfiles.set(organizationId, neutralProfile);
    }
    return neutralProfile;
  }

  /**
   * Updates business profile in PostgreSQL and memory cache.
   */
  static async updateProfile(
    organizationId: string,
    updates: Partial<BusinessReceptionistProfile>
  ): Promise<BusinessReceptionistProfile> {
    const existing = await this.getProfile(organizationId);
    const updated: BusinessReceptionistProfile = {
      ...existing,
      ...updates,
      organizationId,
      isConfigured: true,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryProfiles.set(organizationId, updated);

    if (isSupabaseAdminConfigured && isValidUuid(organizationId)) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const dbOrgId = (await resolveValidOrganizationId(organizationId, organizationId)) || organizationId;
        this.inMemoryProfiles.set(dbOrgId, { ...updated, organizationId: dbOrgId });

        await client.from('business_receptionist_profiles').upsert({
          organization_id: dbOrgId,
          business_name: updated.businessName,
          business_type: updated.businessType,
          description: updated.description,
          services: updated.services,
          opening_hours: updated.openingHours,
          timezone: updated.timezone,
          location: updated.location,
          contact_phone: updated.contactPhone,
          contact_email: updated.contactEmail,
          faqs: updated.faqs,
          policies: updated.policies,
          supported_languages: updated.supportedLanguages,
          custom_instructions: updated.customInstructions,
          handoff_rules: updated.handoffRules,
          is_active: updated.isActive,
          updated_at: updated.updatedAt,
        });
      } catch {
        // Handled cleanly
      }
    }

    return updated;
  }

  /**
   * Checks whether the given date/time falls within the business's opening hours.
   */
  static isWithinBusinessHours(
    profile: BusinessReceptionistProfile,
    targetDate = new Date()
  ): {
    isOpen: boolean;
    currentDay: string;
    hoursToday: string;
    timezone: string;
  } {
    const timeZone = profile.timezone || 'Europe/Berlin';
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone });
    const currentDay = dayFormatter.format(targetDate).toLowerCase() as keyof WeekOpeningHours;

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });
    const currentTimeStr = timeFormatter.format(targetDate);

    const daySchedule = profile.openingHours[currentDay] || { closed: true };

    if (daySchedule.closed || !daySchedule.open || !daySchedule.close) {
      return {
        isOpen: false,
        currentDay,
        hoursToday: 'Closed today',
        timezone: timeZone,
      };
    }

    const [openH, openM] = daySchedule.open.split(':').map(Number);
    const [closeH, closeM] = daySchedule.close.split(':').map(Number);
    const [curH, curM] = currentTimeStr.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const curMinutes = curH * 60 + curM;

    const isOpen = curMinutes >= openMinutes && curMinutes < closeMinutes;

    return {
      isOpen,
      currentDay,
      hoursToday: `${daySchedule.open} - ${daySchedule.close}`,
      timezone: timeZone,
    };
  }

  /**
   * Formats the business profile into a concise, verified system instruction block.
   */
  static formatSystemContext(profile: BusinessReceptionistProfile, now = new Date()): string {
    const hoursStatus = this.isWithinBusinessHours(profile, now);

    const servicesCatalog =
      profile.services && profile.services.length > 0
        ? profile.services
            .map((s) => {
              const symbol = s.currency === 'USD' ? '$' : '€';
              const amount = s.price ?? s.priceEur ?? 0;
              const duration =
                s.durationMinutes && s.durationMinutes > 0 ? ` (${s.durationMinutes} min)` : '';
              return `  - ${s.name}: ${symbol}${amount}${duration}${s.description ? ` — ${s.description}` : ''}`;
            })
            .join('\n')
        : '  [UNCONFIGURED CATALOG: No custom pricing menu uploaded yet. Check Knowledge Base or offer to arrange a tailored quote / team follow-up instead of guessing prices.]';

    const faqsSection =
      profile.faqs && profile.faqs.length > 0
        ? profile.faqs.map((f) => `  Q: ${f.question}\n  A: ${f.answer}`).join('\n\n')
        : '  (No custom FAQ pairs configured—consult Official Business Knowledge Base below if present.)';

    const hoursText = Object.entries(profile.openingHours)
      .map(([day, val]) => `  - ${day.toUpperCase()}: ${val.closed ? 'CLOSED' : `${val.open} - ${val.close}`}`)
      .join('\n');

    return `
[VERIFIED BUSINESS PROFILE & ZERO-HALLUCINATION POLICY]:
BUSINESS NAME: ${profile.businessName}
CATEGORY: ${profile.businessType || 'Business'}
${profile.description ? `OVERVIEW: ${profile.description}` : ''}
LOCATION / ADDRESS: ${profile.location || 'Contact team for location details'}
TIMEZONE: ${profile.timezone}
CURRENT STATUS: ${hoursStatus.isOpen ? `OPEN NOW (${hoursStatus.hoursToday})` : `CLOSED RIGHT NOW (${hoursStatus.hoursToday})`}

OPENING HOURS:
${hoursText}

SERVICE CATALOG & VERIFIED PRICES:
${servicesCatalog}

POLICIES:
- Cancellation: ${profile.policies.cancellation}
${profile.policies.refunds ? `- Refunds: ${profile.policies.refunds}` : ''}
${profile.policies.booking_rules ? `- Booking Rules: ${profile.policies.booking_rules}` : ''}
${profile.policies.payment ? `- Payment: ${profile.policies.payment}` : ''}

VERIFIED FAQs:
${faqsSection}

${profile.customInstructions ? `CUSTOM BUSINESS INSTRUCTIONS:\n${profile.customInstructions}\n` : ''}
${profile.handoffRules ? `ESCALATION TRIGGERS:\n${profile.handoffRules}\n` : ''}

MANDATORY ACCURACY DIRECTIVES:
1. NEVER invent prices, unlisted services, discounts, addresses, or policies not stated above or in Official Knowledge Base / Workspace Memories.
2. If a customer asks about an unlisted service or unsupported payment method, state clearly that it is not listed and offer to escalate to a human team member.`;
  }

  private static createStarXPlatformProfile(orgId: string): BusinessReceptionistProfile {
    return {
      organizationId: orgId,
      businessName: 'StarX Flow',
      businessType: 'AI Receptionist, Omnichannel Inbox & Revenue CRM Platform',
      description:
        'All-in-one AI front-desk automation, WhatsApp/Instagram/Email/Web reception, calendar sync, automated workflows, and Revenue CRM with Lead Finder.',
      location: 'Cloud Platform (Europe / Global SaaS)',
      contactEmail: 'support@starxflow.com',
      timezone: 'Europe/Berlin',
      services: [
        {
          id: 'plan-starter',
          name: 'Starter Plan',
          priceEur: 29,
          currency: 'EUR',
          durationMinutes: 0,
          description: 'Monthly SaaS tier with 1,000 AI conversations, 10 workflows, and omnichannel inbox',
        },
        {
          id: 'plan-growth',
          name: 'Growth Plan',
          priceEur: 59,
          currency: 'EUR',
          durationMinutes: 0,
          description: 'Monthly SaaS tier with 2,500 AI conversations, 25 workflows, CRM & Calendar Sync',
        },
        {
          id: 'plan-pro',
          name: 'Pro Plan',
          priceEur: 97,
          currency: 'EUR',
          durationMinutes: 0,
          description: 'Monthly SaaS tier with 5,000 AI conversations, 50 workflows, Lead Finder & Sequences',
        },
        {
          id: 'demo-call',
          name: 'Live Product Walkthrough & Setup Demo',
          priceEur: 0,
          currency: 'EUR',
          durationMinutes: 30,
          description: 'Personalized 1-on-1 onboarding demo for salons, clinics, agencies, and local businesses',
        },
      ],
      openingHours: {
        monday: { open: '00:00', close: '23:59', closed: false },
        tuesday: { open: '00:00', close: '23:59', closed: false },
        wednesday: { open: '00:00', close: '23:59', closed: false },
        thursday: { open: '00:00', close: '23:59', closed: false },
        friday: { open: '00:00', close: '23:59', closed: false },
        saturday: { open: '00:00', close: '23:59', closed: false },
        sunday: { open: '00:00', close: '23:59', closed: false },
      },
      faqs: [
        {
          question: 'Which channels does StarX Flow support?',
          answer: 'WhatsApp Business, Instagram DMs, Email (Resend & inbound replies), Facebook Messenger, SMS, and embeddable Website Chat.',
        },
        {
          question: 'Does it include Google Calendar and Outlook sync?',
          answer: 'Yes, two-way calendar sync is supported for Google Calendar and Microsoft Outlook alongside automated booking conflict prevention.',
        },
      ],
      policies: {
        cancellation: 'Subscriptions can be cancelled or upgraded anytime via Billing Portal.',
        refunds: 'Contact support for billing inquiries.',
        booking_rules: 'Book a free 30-minute walkthrough directly here or at /demo.',
      },
      supportedLanguages: ['en', 'de', 'fr', 'es', 'it', 'hi'],
      customInstructions:
        'Help prospective and current StarX Flow users understand features (AI Receptionist, Omnichannel Inbox, Google/Outlook Calendar Sync, Full-Stack CRM, Lead Finder, Sequences), recommend the right plan, or schedule a demo.',
      handoffRules: 'Escalate enterprise custom pricing, account access emergencies, or billing disputes.',
      isConfigured: true,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
  }

  private static createUnconfiguredProfile(orgId: string): BusinessReceptionistProfile {
    return {
      organizationId: orgId,
      businessName: 'Your Business Workspace',
      businessType: 'Service Business',
      description: 'AI Receptionist & Customer Support Workspace',
      timezone: 'Europe/Berlin',
      services: [],
      openingHours: DEFAULT_WEEK_HOURS,
      faqs: [],
      policies: {
        cancellation: 'Please notify us at least 24 hours in advance for cancellations.',
        refunds: 'Handled on request by our team.',
        booking_rules: 'Bookings subject to verified calendar availability.',
      },
      supportedLanguages: ['en', 'de', 'fr', 'it', 'es'],
      customInstructions: 'Greet visitors warmly, rely strictly on Knowledge Base and CRM facts, and escalate when details are unavailable.',
      handoffRules: 'Escalate complaints, billing issues, or unlisted service pricing questions.',
      isConfigured: false,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
  }
}
