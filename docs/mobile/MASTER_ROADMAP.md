# STARX FLOW MOBILE — MASTER IMPLEMENTATION ROADMAP
**Document Reference:** `docs/mobile/MASTER_ROADMAP.md`  
**Architecture:** Kotlin Multiplatform (KMP) + Compose Multiplatform (CMP)  
**Target Platforms:** Android (API 26+) & iOS (iOS 15+)  
**Status:** ACTIVE  

---

## Roadmap Overview

This roadmap defines the 18 sequential phases (Phase 0 through Phase 17) for delivering the commercial-grade StarX Flow mobile application integrated into the existing StarX Flow monorepo.

```
[Phase 0: Audit] ─────────► [Phase 1: Scaffold] ────────► [Phase 2: Architecture]
                                                                  │
┌─────────────────────────────────────────────────────────────────┘
▼
[Phase 3: Design System] ─► [Phase 4: Auth & Onboarding] ─► [Phase 5: Command Center]
                                                                  │
┌─────────────────────────────────────────────────────────────────┘
▼
[Phase 6: Unified Inbox] ─► [Phase 7: AI Workforce] ────► [Phase 8: CRM & Customers]
                                                                  │
┌─────────────────────────────────────────────────────────────────┘
▼
[Phase 9: Bookings] ─────► [Phase 10: Automations] ─────► [Phase 11: Analytics]
                                                                  │
┌─────────────────────────────────────────────────────────────────┘
▼
[Phase 12: Notifications] ─► [Phase 13: Backend APIs] ──► [Phase 14: Offline/Cache]
                                                                  │
┌─────────────────────────────────────────────────────────────────┘
▼
[Phase 15: Security] ─────► [Phase 16: Verification] ───► [Phase 17: Production Prep]
```

---

## Phase Breakdown & Deliverables

### Phase 0: Existing Repository Audit
- **Goal:** Audit Next.js web application, Supabase schema, RLS policies, 8-digit OTP auth, APIs.
- **Deliverables:** `docs/mobile/REPOSITORY_AUDIT.md`, `docs/mobile/MASTER_ROADMAP.md`, `docs/mobile/PROGRESS.md`, `docs/mobile/DECISIONS.md`.
- **Status:** COMPLETED.

### Phase 1: Monorepo Scaffold
- **Goal:** Set up non-destructive Gradle multi-project build for KMP/CMP under `mobile/`.
- **Deliverables:**
  - `mobile/settings.gradle.kts`, `mobile/build.gradle.kts`, `mobile/gradle/libs.versions.toml`.
  - Gradle wrapper configuration (`gradlew`, `gradlew.bat`).
  - Android application shell target (`:mobile:composeApp`).
  - iOS framework target (`StarXFlowShared.framework` / CocoaPods / SPM integration).
  - Verify existing web application (`npm run typecheck` / `npm run build`) is completely untouched.

### Phase 2: Technical Architecture
- **Goal:** Implement Clean Architecture + MVVM + Koin + Ktor + SQLDelight.
- **Deliverables:**
  - Shared domain models, repository interfaces, use cases.
  - Ktor HTTP client configured with logging, serialization, auth interceptors.
  - SQLDelight multiplatform driver setup (Android SQLite driver + iOS Native SQLite driver).
  - Koin dependency injection modules (`appModule`, `networkModule`, `databaseModule`, `repositoryModule`, `viewModelModule`).

### Phase 3: StarX Design System
- **Goal:** Implement the StarX Liquid Glass design system in Compose Multiplatform.
- **Deliverables:**
  - Color palette: Obsidian near-black (`#060B08`), Emerald green (`#10B981`), Fresh green (`#34D399`), Charcoal (`#101714`).
  - Typography, shapes, elevations, and specular highlights.
  - Reusable components: `StarXButton`, `StarXIconButton`, `StarXCard`, `GlassSurface` (Tier 1 Subtle, Tier 2 Premium, Tier 3 Focal), `StarXTopBar`, `StarXBottomNavigation`, `StarXTextField`, `StarXSearchBar`, `StarXAvatar`, `StatusIndicator`, `MetricCard`, `EmptyState`, `ErrorState`, `LoadingState`.

### Phase 4: Authentication & Onboarding
- **Goal:** Real authentication supporting 8-digit OTP verification, session persistence, and tenant resolution.
- **Deliverables:**
  - Splash screen with session check.
  - Welcome & onboarding walkthrough.
  - 8-digit OTP input screen with auto-advance and countdown resend.
  - Supabase Auth session synchronization.
  - Secure token storage (Android EncryptedSharedPreferences / iOS Keychain via expect/actual).
  - Business / workspace selector.

### Phase 5: Command Center (Dashboard)
- **Goal:** Primary executive command center with real business metrics.
- **Deliverables:**
  - Personalized greeting, workspace switcher.
  - KPI metric cards: Today's Revenue, New Leads, Active Appointments, AI Message Volume.
  - Interactive trend charts (Revenue trends, Lead acquisition).
  - Quick action buttons (New Lead, Book Appointment, Send Message, Trigger Automation).
  - Pull-to-refresh and real-time refresh states.

### Phase 6: Unified Inbox
- **Goal:** Real omnichannel inbox (WhatsApp, Instagram, Email, Web Chat).
- **Deliverables:**
  - Conversation thread list with channel badges, unread badges, last message previews.
  - Real-time conversation view.
  - Message bubble list with delivery receipts (`sent`, `delivered`, `read`).
  - Message composer with text input, attachment triggers, and staff response dispatch.
  - Human takeover toggle and AI receptionist control mode switch.

### Phase 7: AI Workforce
- **Goal:** Manage AI agents operating in the business.
- **Deliverables:**
  - Agent directory (Receptionist, Booking Agent, Review Manager, Sales Assistant).
  - Agent status toggles (`is_active`).
  - Agent prompt and configuration viewer.
  - Agent memory inspector and execution activity logs.

### Phase 8: CRM & Customers
- **Goal:** Complete customer and lead management.
- **Deliverables:**
  - Lead directory with search, status tabs (`new`, `contacted`, `qualified`, `converted`, `lost`), and tag filtering.
  - Customer detail view with contact info, lead score meter, activity timeline.
  - Create lead dialog & edit customer details.
  - Direct call, WhatsApp, and email intents.

### Phase 9: Bookings & Calendar
- **Goal:** Scheduling management with slot conflict prevention.
- **Deliverables:**
  - Calendar agenda view (daily and weekly).
  - Appointment list with status indicators (`scheduled`, `confirmed`, `completed`, `cancelled`).
  - New booking creation sheet with real-time conflict checking against existing slots.
  - Reschedule and cancel appointment actions.

### Phase 10: Automation Center
- **Goal:** Workflow automation monitoring and execution.
- **Deliverables:**
  - Active workflows directory with saved hours and success rate metrics.
  - Toggle workflow active/inactive state.
  - Real-time execution logs feed.
  - Manual run trigger / retry failed executions.

### Phase 11: Analytics
- **Goal:** Comprehensive business analytics and reporting.
- **Deliverables:**
  - Multi-period date filter (7D, 30D, 90D, 1Y).
  - Revenue analytics chart.
  - Lead conversion breakdown.
  - Channel traffic comparison (WhatsApp vs. Instagram vs. Web vs. Email).
  - AI token and cost efficiency metrics.

### Phase 12: Notifications
- **Goal:** Push notification client integration.
- **Deliverables:**
  - Android Firebase Cloud Messaging (FCM) service handler.
  - iOS APNs registration handler.
  - Device token registration API client.
  - Deep linking into Conversation threads and Appointments.

### Phase 13: Backend Integration & Mobile Aggregator
- **Goal:** High-performance mobile endpoints and full API documentation.
- **Deliverables:**
  - `src/app/api/mobile/v1/dashboard/summary/route.ts`: Aggregated dashboard payload.
  - `src/app/api/mobile/v1/notifications/register/route.ts`: Token registration.
  - `docs/mobile/API_INTEGRATION.md`: Complete API contracts.

### Phase 14: Offline Persistence & Sync
- **Goal:** SQLDelight offline caching, network connectivity monitoring, and sync.
- **Deliverables:**
  - SQLDelight tables for leads, conversations, messages, appointments, dashboard metrics.
  - Offline network connectivity monitor (`NetworkObserver`).
  - Offline banner and optimistic UI updates.
  - Tenant-isolated database cleanup on logout.

### Phase 15: Security & Compliance
- **Goal:** Security audit and penetration hardening.
- **Deliverables:**
  - Zero hardcoded secrets verification.
  - Secure credential storage implementation (Android Keystore / iOS Keychain).
  - Tenant isolation unit tests.
  - `docs/mobile/SECURITY_AUDIT.md`.

### Phase 16: Verification & Testing
- **Goal:** End-to-end automated and build verification.
- **Deliverables:**
  - Kotlin unit tests for ViewModels and Repositories.
  - Compose UI tests for design system components and 8-digit OTP.
  - Full Android release build verification.
  - Existing web application build verification (`npm run build` / `npm run typecheck`).
  - `docs/mobile/TESTING.md`.

### Phase 17: Production Preparation & Documentation
- **Goal:** App store packaging, icons, splash screens, deployment manuals.
- **Deliverables:**
  - Android application ID (`com.starxflow.mobile`), adaptive launcher icons, ProGuard rules.
  - iOS bundle identifier (`com.starxflow.mobile`), Assets catalog, Info.plist.
  - `docs/mobile/BUILD_GUIDE.md` and `docs/mobile/DEPLOYMENT.md`.

### Phase 18: Production Functionality & Integration Audit
- **Goal:** Comprehensive 12-dimension functionality and integration audit with prioritized remediation.
- **Deliverables:**
  - `docs/mobile/FUNCTIONALITY_AUDIT.md`: Zero-assumption audit classifying each area as `VERIFIED`, `PARTIALLY_IMPLEMENTED`, `MOCK_DATA`, `BROKEN`, or `BLOCKED`.
  - P0 Fix: Auth session token exchange hardening & token refresh lifecycle in `AuthRepositoryImpl` and `StarXApiClient`.
  - P1 Fix: Aggregated `/api/mobile/v1/dashboard/summary` with real 7-day timestamp grouping; snake_case/camelCase robustness in `PATCH /conversations/[id]`; remote agent toggling.
  - P2 Fix: Appointment persistence to Supabase in `CalendarRepositoryImpl`; remote workflow toggling in `WorkflowRepositoryImpl`; lead status mutation in `CrmRepositoryImpl`.
  - P3 Fix: Removal of hardcoded demonstration values in `AnalyticsScreen.kt`; push notification token registration call wired on login.
  - P4 Fix: Complete Xcode project scaffold (`iosApp.xcodeproj/project.pbxproj`) with framework embedding script.
  - Regression verification: Android Debug APK assembled cleanly in 1m 33s; web typecheck passed with 0 errors.
