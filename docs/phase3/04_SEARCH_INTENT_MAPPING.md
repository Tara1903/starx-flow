# STARX-FLOW — PHASE 3: SEARCH INTENT MAPPING & ANTI-CANNIBALIZATION
**Evaluation Date:** November 2026  
**System:** StarX-Flow Search Visibility & AI Discoverability Engine  
**Canonical Production Domain:** `https://starx-flow.runs-on.dev`  

---

## 1. INTENT GOVERNANCE & ANTI-CANNIBALIZATION RULES

To maintain clear topical authority and prevent Google and AI answer engines from experiencing keyword confusion or split equity:
1. **One Canonical URL Per Intent:** Every primary search keyword cluster is mapped to exactly one production URL.
2. **Pillar vs. Sub-Niche Hierarchy:** High-volume category terms (e.g., "fitness studio booking") resolve to broad industry pillars (`/industries/gyms-fitness`), while micro-niche queries (e.g., "personal trainer booking") route to specialized sub-pages (`/industries/personal-trainer`) with explicit contextual breadcrumbs and cross-links.
3. **Product Capability vs. Industry Application:** Feature queries (e.g., "WhatsApp AI chatbot") are exclusively owned by feature pillar routes (`/whatsapp-ai-chatbot`), while industry-specific implementations (e.g., "WhatsApp booking for dental clinics") are owned by the industry route (`/industries/dental-clinics`).
4. **Competitor Comparison vs. Alternative Clusters:** All comparison and alternative queries for a given competitor resolve to a single dedicated comparison URL (e.g., both "Mindbody alternatives" and "StarX-Flow vs Mindbody" resolve to `/compare/starx-flow-vs-mindbody`).

---

## 2. INTENT TO CANONICAL URL MAPPING TABLE

| Search Query / Intent Group | Primary Keyword | Canonical Route | Intent Owner | Conflict Risk Mitigations |
| :--- | :--- | :--- | :---: | :--- |
| **Dental Clinic Automation** | AI receptionist for dental clinics | `/industries/dental-clinics` | Industry Pillar | Distinct from general `/industries/dentist` micro-page; dentist page links up to dental-clinics as parent |
| **Fitness & Gym Automation** | WhatsApp automation for gyms | `/industries/gyms-fitness` | Industry Pillar | Distinct from `/industries/personal-trainer`; personal-trainer focuses on solo 1-on-1 coaching |
| **Salon & Beauty Automation** | WhatsApp booking for hair salons | `/industries/beauty-salons` | Industry Pillar | Distinct from `/industries/barber` and `/industries/med-spa`; acts as broad umbrella for multi-service salons |
| **Wellness & Therapy** | AI booking for wellness clinics | `/industries/wellness-therapy` | Industry Pillar | Focuses on therapeutic clinics (massage, physio, chiropractic, acupuncture) |
| **Real Estate Brokerages** | AI lead qualification WhatsApp real estate | `/industries/real-estate` | Industry Pillar | Captures speed-to-lead qualification and viewing appointment scheduling |
| **Hotels & Hospitality** | WhatsApp digital concierge software | `/industries/hospitality` | Industry Pillar | Captures direct booking recovery and 24/7 guest communication |
| **Restaurants & Dining** | WhatsApp table booking automation | `/industries/restaurants` | Industry Pillar | Captures reservation automation and menu/dietary FAQ triage |
| **Educational Institutions** | WhatsApp trial lesson booking | `/industries/education` | Industry Pillar | Captures trial lesson scheduling and student intake automation |
| **ManyChat Comparison** | ManyChat alternatives WhatsApp | `/compare/starx-flow-vs-manychat` | Competitor Hub | Dedicated comparison hub with verified pricing & flow limitations |
| **WATI Comparison** | WATI alternatives small business | `/compare/starx-flow-vs-wati` | Competitor Hub | Focuses on agent-centric inbox vs. autonomous AI receptionist |
| **Respond.io Comparison** | Respond.io alternatives | `/compare/starx-flow-vs-respond-io`| Competitor Hub | Contrasts enterprise complexity with SMB plug-and-play setup |
| **Mindbody Comparison** | Mindbody alternatives for gyms | `/compare/starx-flow-vs-mindbody` | Competitor Hub | Cross-linked directly from `/industries/gyms-fitness` |
| **Vagaro Comparison** | Vagaro alternatives for salons | `/compare/starx-flow-vs-vagaro` | Competitor Hub | Cross-linked directly from `/industries/beauty-salons` |
| **Calendly Comparison** | Conversational alternative to Calendly | `/compare/starx-flow-vs-calendly` | Competitor Hub | Contrasts passive booking links with interactive conversational scheduling |
| **Intercom Comparison** | Intercom alternatives local business | `/compare/starx-flow-vs-intercom` | Competitor Hub | Focuses on helpdesk cost vs. local front desk operating system |
| **n8n Comparison** | n8n alternatives for client booking | `/compare/starx-flow-vs-n8n` | Competitor Hub | Focuses on self-hosted developer tool vs. turnkey local business OS |
| **Zapier Comparison** | Zapier alternatives WhatsApp booking | `/compare/starx-flow-vs-zapier` | Competitor Hub | Focuses on multi-app fragile middleware vs. all-in-one receptionist |
| **Make Comparison** | Make alternatives for appointment booking | `/compare/starx-flow-vs-make` | Competitor Hub | Focuses on complex visual scenarios vs. instant setup |
| **Acuity Scheduling Comparison** | Acuity Scheduling alternatives | `/compare/starx-flow-vs-acuity-scheduling` | Competitor Hub | Cross-linked from `/industries/wellness-therapy` and `/industries/beauty-salons` |
| **Phorest Comparison** | Phorest alternatives for hair salons | `/compare/starx-flow-vs-phorest` | Competitor Hub | Cross-linked directly from `/industries/beauty-salons` |

---

## 3. TOPICAL INTERNAL LINKING & CROSS-POLLINATION ARCHITECTURE

```
                  ┌───────────────────────────────┐
                  │    Core Product & Features   │
                  │  (/product, /features, etc.)  │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│     Industry Pillar Pages       │             │    Competitor Comparison Hubs   │
│  • /industries/gyms-fitness     │◄───────────►│  • /compare/starx-flow-vs-mindbody│
│  • /industries/beauty-salons    │◄───────────►│  • /compare/starx-flow-vs-vagaro  │
│  • /industries/dental-clinics   │◄───────────►│  • /compare/starx-flow-vs-phorest │
│  • /industries/wellness-therapy │◄───────────►│  • /compare/starx-flow-vs-acuity  │
│  • /industries/real-estate      │             │  • /compare/starx-flow-vs-manychat│
│  • /industries/hospitality      │             │  • /compare/starx-flow-vs-calendly│
│  • /industries/restaurants      │             │  • /compare/starx-flow-vs-wati    │
│  • /industries/education        │             │  • /compare/starx-flow-vs-intercom│
└────────────────┬────────────────┘             └─────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     Specialized Sub-Niches      │
│  • /industries/personal-trainer │
│  • /industries/barber           │
│  • /industries/dentist          │
│  • /industries/med-spa          │
│  • /industries/plumber          │
└─────────────────────────────────┘
```

### Contextual Linking Rules:
1. Every industry page links to:
   - The relevant category feature: `/whatsapp-ai-chatbot`, `/instagram-ai-automation`, or `/ai-agents`.
   - The direct competitor comparison hub: e.g., `/industries/gyms-fitness` links to `/compare/starx-flow-vs-mindbody`.
   - The pricing page: `/pricing`.
2. Every competitor comparison page links to:
   - The primary industry it impacts: e.g., `/compare/starx-flow-vs-mindbody` links to `/industries/gyms-fitness`.
   - The relevant feature capabilities: e.g., `/whatsapp-ai-chatbot`.
3. Breadcrumb navigation on all industry pages provides search bots and users a direct hierarchy:
   - `Home > Industries > [Industry Name]`
