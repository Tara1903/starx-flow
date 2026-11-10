# STARX-FLOW — PHASE 7: PROSPECT PIPELINE & QUALIFICATION ENGINE

**Document Date:** 2026-11-10  
**Milestone:** Phase 7 — Stage D  
**Author:** SaaS Growth Architect & Launch Operations Director  
**Target Markets:** UK, Ireland, Australia, Canada  

---

## 1. Ideal Customer Profiles (ICPs)

### 1.1 ICP 1: Independent Hair & Beauty Salons / Aesthetic Spas
- **Geography:** Urban and suburban UK (London, Manchester, Birmingham, Edinburgh) and Ireland (Dublin, Cork, Galway).
- **Team Size:** 2 to 8 stylists/technicians + 1 working owner.
- **Typical Revenue:** £120,000 to £500,000 / year.
- **Inquiry Volume:** 15 to 40 inbound customer messages per day (Instagram DMs, WhatsApp, SMS).
- **Key Indicators:**
  - Active Instagram profile (>1,000 followers) with frequent photo posts of hair styling/color.
  - WhatsApp Business or phone number listed in bio with note: *"DM or WhatsApp for appointments"*.
  - No dedicated full-time receptionist on duty on weekdays.
  - High proportion of high-value services (balayage, extensions, aesthetic injectables, facials).
- **Core Buying Trigger:** Owner is exhausted from answering Instagram messages at 10 PM after working on clients on their feet for 9 hours.

### 1.2 ICP 2: Private Dental, Physiotherapy & Aesthetic Medical Practices
- **Geography:** UK (NHS/Private hybrid and fully private practices) and Ireland.
- **Team Size:** 2 to 6 practitioners, 1 to 2 front-desk staff.
- **Typical Revenue:** £300,000 to £1,200,000 / year.
- **Inquiry Volume:** 25 to 60 calls/inquiries per day.
- **Key Indicators:**
  - Modern clinic website with clear list of private treatments (Invisalign, teeth whitening, cosmetic dentistry, physio assessments).
  - Web contact form or email address with 24-48 hour response disclaimer.
  - Front-desk phones frequently busy or going to voicemail during peak morning triage.
- **Core Buying Trigger:** Practice manager sees prospective private patients bouncing to competing local clinics due to slow appointment scheduling.

---

## 2. The 14-Stage Prospect Qualification Pipeline

All prospective businesses move through an explicit, auditable 14-stage pipeline:

```
[1. Discovered] --------> [2. Researched] --------> [3. Qualified] --------> [4. Outreach Approved]
                                                                                     |
                                                                                     v
[8. Demo Requested] <---- [7. Discovery Complete] <- [6. Response Received] <- [5. Contacted]
       |
       v
[9. Demo Completed] ----> [10. Trial / Onboarding] -> [11. Activated] -----> [12. Paying Customer]
                                                                                     |
                                                                                     v
[14. Disqualified / Lost] <--------------------------------------------- [13. Retained Customer]
```

### Stage Definitions & Transition Criteria:
1. **`Discovered`**: Public business profile identified via ethical directory or public web search.
2. **`Researched`**: Operating hours, booking method, public website, and channels verified.
3. **`Qualified`**: Meets ICP criteria (target market, appointment-driven, active chat channel).
4. **`Outreach Approved`**: Reviewed and authorized by the platform owner/founder for personalized communication.
5. **`Contacted`**: Personalized, non-automated message or invitation sent via public business channel.
6. **`Response Received`**: Prospect replies to inquiry.
7. **`Discovery Completed`**: 15-minute operational problem interview completed.
8. **`Demo Requested`**: Prospect requests to see StarX-Flow in action for their specific practice.
9. **`Demo Completed`**: Interactive demo conducted (using their actual services/FAQs in sandbox).
10. **`Trial / Onboarding`**: Account registered, AI configured, test conversation verified.
11. **`Activated`**: First real customer inquiry answered or first real booking scheduled.
12. **`Paying Customer`**: Active paid subscription initiated via Polar Merchant of Record.
13. **`Retained Customer`**: Subscription renewed past first billing period (Day 30+).
14. **`Disqualified / Lost`**: Disqualified due to lack of fit, unresponsive, or explicitly requested no contact.

---

## 3. Data Governance & Privacy Architecture

In strict compliance with GDPR, UK Data Protection Act 2018, and PECR (Privacy and Electronic Communications Regulations):
- **Only Public Business Data:** Only public business contact details (clinic phone, business email, official website) are recorded. Never scrape or harvest personal private mobile numbers or private personal social profiles.
- **Explicit Consent for Inbound Leads:** All website demo submissions require explicit affirmative checkbox consent before record creation.
- **Zero Third-Party Data Brokers:** No purchased prospect lists, bulk databases, or unverified leads.
- **Retention & Erasure Controls:** Any prospect who requests removal or indicates no interest is immediately marked `Disqualified` and permanently purged upon request via existing `/api/gdpr/delete` infrastructure.
- **Role-Based Admin Protection:** All prospect records in Supabase (`demo_requests`) are secured with Row Level Security and inaccessible to unauthenticated users or standard clients.

---

## 4. Prospect Pipeline Architecture (Supabase & Admin View)

The existing Supabase `demo_requests` table forms the core data store for inbound prospects. To give the platform owner operational visibility without requiring external third-party CRM subscriptions (like HubSpot or Salesforce), an administrative prospect review component inside `src/app/admin/page.tsx` will surface:
- Inbound demo requests by date, status, and industry.
- Direct contact details and operational notes.
- Quick status updater (`new` → `contacted` → `scheduled` → `completed` → `converted`).
