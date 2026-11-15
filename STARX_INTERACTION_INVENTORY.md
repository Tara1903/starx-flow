# STARX FLOW — INTERACTIVE COMPONENT INVENTORY & EVENT SPECIFICATION
**Project:** StarX Flow  
**Component:** `src/components/StarXFlowLanding.tsx`  
**State Engines:** React Local State, Zustand (`useUIStore`, `useAuthStore`), Next.js Navigation  
**Status:** **100% PRODUCTION VERIFIED**  

---

## 1. Overview of Interactive Architecture

The redesigned StarX Flow landing page combines container-query proportional coordinates (`--u: calc(100cqw / 1440)`) with rich, responsive user interactions. Every interactive element has been mapped, event-bound, and verified across both desktop and mobile viewports.

---

## 2. Global Header & Navigation Interactivity

| Element ID | Tag / Class | Event Trigger | Handler / State | Expected Behavioral Outcome | Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `btn-nav-login` | `<button className="pos btn-glass-pill">` | `onClick` | `isLoggedIn ? router.push('/dashboard') : openLogin()` | Opens 8-digit OTP login modal or navigates to user dashboard. | **PASSED** |
| `btn-nav-get-started` | `<button className="pos btn-mint-pill">` | `onClick` | `isLoggedIn ? router.push('/dashboard') : openSignup()` | Opens 14-day free trial onboarding modal or navigates to user dashboard. | **PASSED** |
| `nav-link-product` | `<a href="#hero-section">` | `onClick` | Native in-page smooth anchor scroll | Scrolls to Hero Architecture & Tablet Showcase. | **PASSED** |
| `nav-link-solutions` | `<a href="#challenge-section">` | `onClick` | Native in-page smooth anchor scroll | Scrolls to Scene 02 Challenge Hub & Scene 02b ROI calculator. | **PASSED** |
| `nav-link-pricing` | `<a href="#pricing-section">` | `onClick` | Native in-page smooth anchor scroll | Scrolls to Scene 09 Architectural Pricing Tiers. | **PASSED** |
| `nav-link-resources` | `<a href="#capabilities-section">` | `onClick` | Native in-page smooth anchor scroll | Scrolls to Scene 06 Core Capabilities & Architectural Pedestals. | **PASSED** |

---

## 3. Scene-by-Scene Interactive Inventory

### Scene 01a: Hero Spatial Stage
- **`btn-hero-get-started`**: Triggers `openSignup('Full Suite')` to open trial onboarding.
- **`btn-hero-see-action`**: Executes smooth scroll to `#challenge-section`.
- **`hero-calendar-grid` Days**: Clickable day nodes (`day.day`) updating `selectedDate` and triggering active emerald highlight ring.
- **`hero-whatsapp-card` & `hero-ai-card`**: Hover-responsive glass refraction and depth lighting.

### Scene 01b: Sarah K. Autonomous Receptionist Simulation
- **`#sarah-demo-input`**: Controlled text input for custom user inquiries.
- **`#sarah-demo-form`**: Form submit handler (`handleSarahDemoReply`). Sanitizes input, appends user bubble, generates simulated receptionist response with appointment confirmation, updates `#sarah-confirmed-text`, and dispatches feedback toast.
- **`#sarah-demo-thread`**: Reactive message list rendering both user queries and receptionist responses with timestamps.

### Scene 02a: Operational Friction & Challenge Hub
- **`#challenge-card-0` through `#challenge-card-3`**: Interactive challenge cards for Missed Enquiries, Manual Bookings, Scheduling Conflicts, and No-Shows. Hovering or clicking triggers `highlightChallenge(idx)` displaying resolution toasts.

### Scene 02b: Revenue Leakage & ROI Calculator
- **`#slider-session-val`**: Range input ($20 - $300, default: $80) controlling average client value per session.
- **`#slider-missed-calls`**: Range input (5 - 100, default: 20) controlling estimated missed inquiries per month.
- **`#roi-monthly-recovery`**: Real-time calculated display (`roiSessionVal * roiMissedCalls * 0.75`), formatting with locale thousands separator.
- **`#roi-hours-saved`**: Real-time calculated display (`roiMissedCalls * 1.5 hrs`), quantifying administrative workload reduction.

### Scene 04: Three-Stage Architectural Onboarding
- **Stage 1 (Connect Calendar)**: Informs users of 2-way Google & Outlook sync.
- **Stage 2 (Configure AI Tone)**: Showcases custom business profile and receptionist persona.
- **Stage 3 (Go Live on WhatsApp)**: Connects WhatsApp Business number in under 10 minutes.

### Scene 05: 3D Perspective Smartphone & Live Workflows
- **`#tab-btn-whatsapp`**: Activates WhatsApp Bookings tab; updates phone header to "Your Business", incoming text to "Hi! Can I book a consultation?", bot prompt to "Sure! Here are the available slots:", confirmed title to "Booking Confirmed".
- **`#tab-btn-ai`**: Activates Contextual AI Understanding tab; updates phone header to "StarX AI Concierge", incoming text to "Can I reschedule my appointment to Wednesday?", bot prompt to "Checking live staff calendar availability...", confirmed title to "Slot Updated".
- **`#tab-btn-scheduling`**: Activates Smart Calendar Synchronization tab; updates phone header to "Calendar Engine", incoming text to "Is the 2:00 PM slot reserved for Sarah?", bot prompt to "Locked atomically across Google & Outlook calendars:", confirmed title to "Synchronized".
- **`#tab-btn-crm`**: Activates Customer Intelligence & History tab; updates phone header to "Client CRM Profile", incoming text to "View consultation history for Elena Rostova", bot prompt to "3 previous visits • Preferred: Wed 11:00 AM:", confirmed title to "Profile Verified".
- **`button[data-slot]` (Phone Slot Buttons)**: Interactive slot selectors (`Tue, 10:00 AM`, `Tue, 2:00 PM`, `Wed, 11:00 AM`). Clicking updates `selectedSlot`, toggles `.active` state, updates `#confirmed-card-slot`, and triggers toast.
- **`#btn-reset-workflow-demo` (`↺`)**: One-tap demo reset button restoring default tab (`whatsapp`) and initial slot (`Tue, 10:00 AM`).
- **`#btn-explore-workflow`**: Cycles through workflow tabs sequentially (`cycleWorkflowTab()`).

### Scene 06a & 06b: Core Capabilities & Operational Excellence
- **6 Capability Cards**: `openCapabilityDetail(idx)` opens modal with deep architectural specifications for:
  1. 24/7 WhatsApp Bookings
  2. No-Show Prevention
  3. Google Review Booster
  4. Staff Calendar Sync
  5. WhatsApp Intake Forms
  6. Unified Service CRM & Audit Trail
- **GIST Exclusion Constraint Deep Dive**: Modal trigger exploring PostgreSQL concurrency locking.
- **RLS Tenant Isolation Deep Dive**: Modal trigger exploring Row-Level Security and GDPR compliance.

### Scene 09a & 09b: Architectural Pricing & Feature Comparison
- **`#pricing-card-solo` ($29/mo Starter)**: Triggers `openModal('signup', 'Starter Plan — $29/mo')`.
- **`#pricing-card-growth` ($59/mo Growth)**: Triggers `openModal('signup', 'Growth Plan — $59/mo')`.
- **`#pricing-card-group` ($99/mo Pro)**: Triggers `openModal('signup', 'Pro Plan — $99/mo')`.
- **Direct Checkout Links**: Connects seamlessly with Polar hosted checkout (`/checkout?products=...`) or free 14-day trial signup.

### Scene 11: Interactive FAQ Accordion
- **6 Expandable FAQ Nodes**: Native `<details>` / `<summary>` accordion allowing smooth expanding and collapsing of answers without JavaScript bundle weight.

---

## 4. Modal & Toast Subsystem

1. **`useUIStore.isSignupOpen` Modal**: Full-screen glassmorphic overlay for Login and Signup with 8-digit strictly numeric OTP verification, magic links, and direct dashboard routing.
2. **`modalState.isOpen` Capability Drawer**: In-page slide-up glass drawer detailing enterprise specifications for any clicked capability card.
3. **`toastMessage` Feedback System**: Ephemeral emerald notification pill anchored to bottom-center with 3,800ms auto-dismiss timeout and manual dismiss.
