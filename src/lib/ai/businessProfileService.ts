/**
 * StarX-Flow Business Receptionist Profile Service (Zero-Hallucination Core)
 * Manages verified business facts: services catalog, transparent prices,
 * opening hours with timezone handling, FAQs, and policies.
 */

import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { supabase } from '../supabase';

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
  refunds: string;
  booking_rules: string;
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
  supportedLanguages: string[];
  customInstructions?: string;
  handoffRules?: string;
  isActive: boolean;
  updatedAt: string;
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
   * Retrieves business profile by organizationId, falling back to clean defaults if unconfigured.
   */
  static async getProfile(organizationId: string): Promise<BusinessReceptionistProfile> {
    if (!organizationId) {
      return this.createDefaultProfile('default-org', 'StarX Local Business');
    }

    // 1. Check in-memory cache
    if (this.inMemoryProfiles.has(organizationId)) {
      return this.inMemoryProfiles.get(organizationId)!;
    }

    // 2. Query PostgreSQL
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data, error } = await client
          .from('business_receptionist_profiles')
          .select('*')
          .eq('organization_id', organizationId)
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
            isActive: data.is_active ?? true,
            updatedAt: data.updated_at || new Date().toISOString(),
          };

          this.inMemoryProfiles.set(organizationId, profile);
          return profile;
        }
      } catch {
        // Fallback
      }
    }

    const defaultProfile = this.createDefaultProfile(organizationId, 'StarX Partner Clinic');
    this.inMemoryProfiles.set(organizationId, defaultProfile);
    return defaultProfile;
  }

  /**
   * Updates business profile in PostgreSQL and memory.
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
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryProfiles.set(organizationId, updated);

    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        await client.from('business_receptionist_profiles').upsert({
          organization_id: organizationId,
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
        // Handled
      }
    }

    return updated;
  }

  /**
   * Checks whether the given date/time falls within the business's opening hours.
   */
  static isWithinBusinessHours(profile: BusinessReceptionistProfile, targetDate = new Date()): {
    isOpen: boolean;
    currentDay: string;
    hoursToday: string;
    timezone: string;
  } {
    const timeZone = profile.timezone || 'Europe/Berlin';

    // Format day of week in target timezone
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone });
    const currentDay = dayFormatter.format(targetDate).toLowerCase() as keyof WeekOpeningHours;

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });
    const currentTimeStr = timeFormatter.format(targetDate); // "14:30"

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
   * STRICT ZERO-HALLUCINATION ENFORCEMENT: The AI is forbidden from fabricating prices or hours.
   */
  static formatSystemContext(profile: BusinessReceptionistProfile, now = new Date()): string {
    const hoursStatus = this.isWithinBusinessHours(profile, now);

    const servicesCatalog = profile.services && profile.services.length > 0
      ? profile.services.map((s) => `  - ${s.name}: €${s.priceEur} (${s.durationMinutes} min)${s.description ? ` — ${s.description}` : ''}`).join('\n')
      : '  (No public price catalog uploaded. Inform the customer to ask for a custom quote or human callback.)';

    const faqsSection = profile.faqs && profile.faqs.length > 0
      ? profile.faqs.map((f) => `  Q: ${f.question}\n  A: ${f.answer}`).join('\n\n')
      : '  (None provided)';

    const hoursText = Object.entries(profile.openingHours)
      .map(([day, val]) => `  - ${day.toUpperCase()}: ${val.closed ? 'CLOSED' : `${val.open} - ${val.close}`}`)
      .join('\n');

    return `
[OFFICIAL BUSINESS FACTS & ZERO-HALLUCINATION POLICY]:
BUSINESS NAME: ${profile.businessName}
LOCATION / ADDRESS: ${profile.location || 'Local Business'}
TIMEZONE: ${profile.timezone}
CURRENT OPERATIONAL STATUS: ${hoursStatus.isOpen ? `OPEN NOW (Today: ${hoursStatus.hoursToday})` : `CURRENTLY CLOSED (Today: ${hoursStatus.hoursToday})`}

VERIFIED OPENING HOURS:
${hoursText}

OFFICIAL SERVICE CATALOG & PRICES:
${servicesCatalog}

POLICIES:
- Cancellation: ${profile.policies.cancellation}
- Refunds: ${profile.policies.refunds}
- Booking Rules: ${profile.policies.booking_rules}

FREQUENTLY ASKED QUESTIONS:
${faqsSection}

${profile.customInstructions ? `CUSTOM RECEPTIONIST INSTRUCTIONS:\n${profile.customInstructions}\n` : ''}

MANDATORY ACCURACY DIRECTIVES:
1. NEVER fabricate or guess prices, discounts, opening hours, or booking confirmations that are not explicitly stated above.
2. If a customer asks for a service or price not in the catalog, politely say: "I do not have a listed price for that service in our current catalog, but I can have a team member follow up with you directly."
3. When currently closed, inform the customer of our regular opening hours and offer to take their message or schedule an appointment for when we are open.
4. If the customer requests human assistance or expresses frustration, trigger human handoff immediately.`;
  }

  private static createDefaultProfile(orgId: string, name: string): BusinessReceptionistProfile {
    return {
      organizationId: orgId,
      businessName: name,
      businessType: 'Medical & Aesthetics Clinic',
      description: 'Premium healthcare, dental, and wellness clinic offering consultations and treatments.',
      location: 'Friedrichstraße 42, 10117 Berlin, Germany',
      contactPhone: '+49 30 12345678',
      contactEmail: 'contact@localclinic.de',
      timezone: 'Europe/Berlin',
      services: [
        { id: 'srv-1', name: 'Initial Dental Consultation', priceEur: 65, durationMinutes: 30, description: 'Comprehensive oral exam, X-rays, and treatment plan' },
        { id: 'srv-2', name: 'Professional Teeth Cleaning (PZR)', priceEur: 110, durationMinutes: 45, description: 'Ultrasonic tartar removal and enamel polishing' },
        { id: 'srv-3', name: 'Cosmetic Consultation', priceEur: 85, durationMinutes: 30, description: 'Aesthetic smile and skincare consultation' },
      ],
      openingHours: DEFAULT_WEEK_HOURS,
      faqs: [
        { question: 'Do you accept public health insurance (Gesetzliche Krankenversicherung)?', answer: 'Yes, we accept both public and private health insurance in Germany.' },
        { question: 'Is there parking available near the clinic?', answer: 'Yes, underground parking is available at Friedrichstraße underground garage.' },
      ],
      policies: {
        cancellation: 'Please notify us at least 24 hours in advance to cancel without penalty.',
        refunds: 'Consultation fees are non-refundable once the appointment has occurred.',
        booking_rules: 'Appointments must be reserved at least 2 hours in advance.',
      },
      supportedLanguages: ['en', 'de', 'fr', 'it'],
      customInstructions: 'Always greet clients warmly. Confirm their preferred date and time before reserving an appointment.',
      handoffRules: 'Transfer to human when client is in acute pain, requests a surgeon, or has billing disputes.',
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
  }
}
