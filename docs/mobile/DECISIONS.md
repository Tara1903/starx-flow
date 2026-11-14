# STARX FLOW MOBILE — ARCHITECTURAL DECISIONS RECORD (ADR)
**Document Reference:** `docs/mobile/DECISIONS.md`  
**Status:** APPROVED & BINDING  

---

## ADR-001: Mobile Directory Structure Isolation
- **Context:** StarX Flow is an existing, active Next.js web application monorepo with Vercel and Supabase deployments. Modifying root packaging or directory structures could break existing CI/CD or Next.js build systems.
- **Decision:** Place all mobile application code inside a dedicated root directory: `mobile/`. The `mobile/` directory contains its own standalone Gradle build environment (`settings.gradle.kts`, `build.gradle.kts`, `gradlew`, `gradlew.bat`, `gradle/libs.versions.toml`), completely isolating mobile builds from `package.json` and Node.js toolchains.
- **Consequences:** Web builds and mobile builds operate completely independently without cross-toolchain interference.

---

## ADR-002: Kotlin Multiplatform & Compose Multiplatform
- **Context:** The product requires a production-grade application on both Android and iOS with shared business logic, identical brand identity, and synchronized release cycles.
- **Decision:** Use Kotlin Multiplatform (KMP 2.0.21) and Compose Multiplatform (CMP 1.7.0). Business logic, networking, database access, state management, and UI components are authored in `commonMain` while platform targets (`androidMain` and `iosMain`) provide native shell integration, push notifications, and hardware-specific bindings.
- **Consequences:** Maximizes code reuse (>85%), eliminates UI divergence between platforms, and ensures high-performance 60/120fps native rendering via Skia (iOS) and Jetpack Compose (Android).

---

## ADR-003: 8-Digit Numeric OTP & Supabase Auth Integration
- **Context:** StarX Flow web uses an 8-character numeric OTP authentication flow (Migration 013 and `src/lib/auth/otpService.ts`). The system validates codes, creates user profiles, and generates Supabase token hashes.
- **Decision:** The mobile app will consume `/api/auth/otp/send` and `/api/auth/otp/verify`. On verification, the mobile client receives the user profile and Supabase session token hash, completing login with Supabase GoTrue to obtain standard `access_token` and `refresh_token` JWTs. The mobile client securely stores tokens using native platform keychains.
- **Consequences:** Unified user directory between web and mobile; zero credential fragmentation; no password vulnerabilities.

---

## ADR-004: Hybrid Networking Architecture (Next.js API + Supabase PostgREST)
- **Context:** StarX Flow uses both Supabase PostgREST (for standard RLS-governed data reads) and Next.js serverless routes (for complex orchestrations like message dispatch, AI completions, and payments).
- **Decision:**
  - Read queries for CRM leads, calendar appointments, and tasks can query Supabase PostgREST directly using the user's JWT.
  - Outbound messaging (`/api/conversations/[id]/messages`), order creation (`/api/orders`), 8-digit OTP auth (`/api/auth/otp/...`), and AI receptionist queries (`/api/chat`) MUST call the Next.js API endpoints.
- **Consequences:** Preserves server-side validation, idempotency guards, and third-party webhook dispatch while avoiding duplicate logic.

---

## ADR-005: Clean Architecture with MVVM & StateFlow
- **Context:** Mobile application requires clear separation of concerns, testability, and deterministic UI state.
- **Decision:** Implement Clean Architecture:
  - **Domain Layer:** Entities, Repository Interfaces, Use Cases (pure Kotlin, zero platform or UI dependencies).
  - **Data Layer:** Repository Implementations, Network Data Sources (Ktor), Local Data Sources (SQLDelight), DTO mappers.
  - **UI / Presentation Layer:** ViewModels exposing immutable `StateFlow<UiState>`, handling user intents and UI events.
- **Consequences:** ViewModels and use cases are 100% unit-testable on JVM/Native without launching Android or iOS emulators.

---

## ADR-006: Local Persistence via SQLDelight with Multi-Tenant Isolation
- **Context:** Business users require instant screen loads, offline viewing of CRM leads and conversation history, and resilience to cellular dropouts.
- **Decision:** Use SQLDelight with platform drivers: `AndroidSqliteDriver` on Android and `NativeSqliteDriver` on iOS. All cached records include `user_id` / `organization_id` foreign keys. On user logout or tenant switch, tenant caches are wiped cleanly to prevent data leakage.
- **Consequences:** Type-safe SQL, zero runtime reflection, cross-platform persistence, and strict security isolation.

---

## ADR-007: StarX Liquid Glass Design System in Compose Multiplatform
- **Context:** The StarX Flow brand requires a dark, futuristic "Liquid Glass" obsidian-emerald aesthetic with 3 tiers of depth: Tier 1 Subtle, Tier 2 Premium, and Tier 3 Focal.
- **Decision:** Implement a custom Compose Multiplatform design system (`StarXTheme`) providing:
  - Obsidian palette (`#060B08` background, `#101714` surface, `#10B981` primary emerald, `#34D399` fresh green).
  - Custom glass modifier simulating multi-stop specular highlights, soft inner glow, and elevation shadows.
  - Unified components: `StarXButton`, `StarXCard`, `GlassSurface`, `StarXTopBar`, `StarXBottomNavigation`, `StarXTextField`, `MetricCard`.
- **Consequences:** High-fidelity, consistent brand aesthetic running smoothly on both platforms.

---

## ADR-008: Dependency Injection via Koin
- **Context:** Multiplatform dependency injection is required across Android and iOS.
- **Decision:** Standardize on Koin Multiplatform (`io.insert-koin:koin-core`, `koin-compose`). Koin provides lightweight, reflection-free DI that works seamlessly across Kotlin/JVM, Kotlin/Android, and Kotlin/Native (iOS).
- **Consequences:** Simple module declarations, straightforward testing with mock overrides, and zero annotation processor overhead.

---

## ADR-009: Platform-Specific Security Abstraction (SecureStorage)
- **Context:** Access tokens, refresh tokens, and sensitive tenant IDs must never be stored in plaintext.
- **Decision:** Implement an `expect class SecureStorage` in `commonMain` with:
  - `actual` on Android using AndroidX `EncryptedSharedPreferences` (backed by Android Keystore).
  - `actual` on iOS using Apple Security Framework `SecItem` Keychain API.
- **Consequences:** Military-grade hardware-backed credential storage on both operating systems.
