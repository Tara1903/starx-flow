# STARX-FLOW — PHASE 7: DEMO & SALES PLAYBOOK

**Document Date:** 2026-11-10  
**Milestone:** Phase 7 — Stage E  
**Author:** SaaS Growth Architect & Customer Success Lead  
**Target Audience:** Prospective Business Owners (Salons, Spas, Private Clinics)  

---

## 1. Demo Principles & Ethical Standards

1. **Zero Fake Features:** Never show a simulated integration or mock screen and claim it is connected to a live production database. If demonstrating via the Web Sandbox simulator, explicitly state: *"This is our live interactive sandbox where you can simulate customer chat before connecting your real WhatsApp or website."*
2. **Prospect-Centric Demonstration:** Before showing any screen, ask about their top 2 most common customer questions. Type their actual business name and real pricing into the setup screen during the demo.
3. **Evidence Over Buzzwords:** Avoid vague hype ("Autonomous artificial general intelligence"). Use concrete operational outcomes: *"When a client asks for your Friday 3 PM slot, here is how StarX-Flow checks your calendar and confirms the booking."*

---

## 2. Demo Structures

### 2.1 The 10-Minute Rapid Demo (For Busy Salon & Clinic Owners)
- **Minute 0–2: Problem & Baseline:** Confirm the pain point. *"You mentioned you get 15-20 Instagram and WhatsApp inquiries a day, and evenings are a mad rush to answer them."*
- **Minute 2–4: Live Interactive Conversation:** Send a message into StarX-Flow from a mobile phone: *"Hi, do you have any openings for a balayage this Thursday afternoon, and what's the starting price?"*
- **Minute 4–6: Real-Time AI Response & Triage:** Show the instant response answering with their exact policy and guiding the prospect to an open calendar slot.
- **Minute 6–8: Command Center Dashboard:** Show the incoming message appearing live in the StarX-Flow Inbox with full customer contact profile and booking status.
- **Minute 8–10: Commercials & Next Steps:** Explain the $29/mo Starter plan, 14-day zero-risk trial, and offer to set up their account together right now.

### 2.2 The 20-Minute Deep-Dive Demo (For Practice Managers & Multi-Staff Clinics)
- **Minute 0–4: Operational Assessment:** Review existing booking software (Cliniko, Google Calendar, Phorest) and staff scheduling bottlenecks.
- **Minute 4–8: Live Workflow & Calendar Sync:** Demonstrate how appointment requests check real-time availability on Google Calendar without double-booking collisions.
- **Minute 8–12: Knowledge Base & Guardrails:** Show how easy it is to add clinic FAQs (parking, deposit terms, pre-treatment instructions) and configure the human-handoff trigger when a patient reports severe symptoms.
- **Minute 12–16: Tenant Isolation & Multi-Seat Roles:** Demonstrate the staff permissions, CRM customer thread merge, and GDPR compliance controls.
- **Minute 16–20: Polar Billing & Pilot Terms:** Review plan limits, Polar Merchant of Record invoicing, and the 14-day pilot onboarding plan.

---

## 3. Industry-Specific Demo Scripts

### 3.1 Script A: Hair & Beauty Salon Demo
- **Opening:** *"Most salons lose 3 to 5 bookings a week simply because prospective clients message on Sunday evening when the salon is closed. By Monday morning, they've booked somewhere else. Let's see what happens when a client messages your StarX-Flow assistant on Sunday night."*
- **Live Test Query:** *"Hi! Do you have any appointments left with Sarah for a cut and blow dry this Saturday?"*
- **Showcase:** Assistant checks availability, states price range, explains deposit policy, and provides a direct slot booking.

### 3.2 Script B: Private Dental & Aesthetic Practice Demo
- **Opening:** *"When patients look for cosmetic treatments like Invisalign or emergency appointments, they often compare 2 or 3 local clinics. The first clinic that provides clear answers and offers a confirmed consultation slot wins the patient. Here is how StarX-Flow acts as your out-of-hours triage receptionist."*
- **Live Test Query:** *"Hi, I chipped a front tooth playing sports and need someone to look at it tomorrow. Do you have an emergency consultation slot available?"*
- **Showcase:** Assistant prioritizes urgent triage, presents available emergency slots, collects patient contact details, and notifies the clinic team instantly.

---

## 4. Objection Handling Matrix

| Common Objection | Root Concern | Evidence-Based Response |
|---|---|---|
| *"Will the AI give wrong medical or pricing advice?"* | Fear of hallucination / liability | *"StarX-Flow only responds using the exact FAQs, service guidelines, and policies you provide. If a client asks an unapproved or complex question, the AI politely explains it will connect them with staff and alerts you instantly."* |
| *"Clients want to speak to a real person, not a bot."* | Fear of cold/robotic user experience | *"We agree completely. That's why StarX-Flow is trained with warm, empathetic language. In reality, clients prefer an instant, helpful answer at 9 PM over waiting 14 hours for an email reply. Plus, your staff can jump into any conversation at any time."* |
| *"I don't have time to learn complicated software."* | Fear of setup friction | *"Our setup takes 15 minutes. In fact, if you join our 14-day pilot today, we will configure your assistant with your services and FAQs together on a 20-minute call."* |
| *"What happens if we already use a booking system?"* | Integration anxiety | *"StarX-Flow works alongside your existing calendar (Google Calendar, Outlook) or our built-in calendar. It handles the messaging conversation and inserts confirmed appointments directly into your schedule."* |

---

## 5. Technical Limitations Disclosure

During every sales conversation, the following limitations must be transparently disclosed:
1. **Google Calendar Verification:** Google Calendar OAuth is currently configured in Google Developer mode; for production multi-tenant accounts, Google verification is underway.
2. **Meta WhatsApp Verification:** Official WhatsApp phone numbers require Meta Business Verification. During the pilot, clients can test immediately via our Web Sandbox simulator and web chat while Meta credentials are registered.
3. **Medical Emergency Guardrail:** StarX-Flow is an operational appointment and inquiry triage assistant, NOT a clinical diagnosis engine. It explicitly instructs patients with acute medical emergencies to contact 999/112/emergency services immediately.

---

## 6. Post-Demo Follow-Up Template

```text
Subject: StarX-Flow demo summary for [Business Name] + Next steps

Hi [Name],

Thank you for your time today! It was great learning more about [Business Name] and how you manage customer inquiries.

As we saw during the live demo:
- StarX-Flow can handle routine questions about your services ([Top Service 1], [Top Service 2]) 24/7.
- Evening and weekend inquiries can be booked directly into your calendar without manual phone tag.
- Your staff receives immediate alerts whenever a client needs personal attention.

Next Steps:
1. You can test your customized assistant anytime in our web sandbox here: [Link]
2. If you'd like to proceed with our 14-day zero-risk pilot, simply register your account here: https://starx-flow.runs-on.dev/signup
3. I am happy to spend 15 minutes helping you connect your calendar and upload your service menu.

Looking forward to helping you capture every booking!

Best regards,
[Founder Name]
StarX-Flow | support@starx-flow.runs-on.dev
```
