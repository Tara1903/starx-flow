# STARX FLOW MOBILE — TESTING & VERIFICATION PROTOCOL
**Document Reference:** `docs/mobile/TESTING.md`  
**Phase:** Phase 16 — Testing & Verification  
**Coverage Standard:** Unit Tests + Compose UI Component Tests + Integration & Regression  

---

## 1. Testing Architecture Overview

The StarX Flow mobile test suite spans shared multiplatform unit tests, Compose UI state tests, backend contract tests, and web regression tests:

```
┌────────────────────────────────────────────────────────┐
│                   Test Topology                        │
├────────────────────────────────────────────────────────┤
│ 1. Multiplatform Unit Tests (commonTest)               │
│    - AuthRepositoryTest                                │
│    - DashboardRepositoryTest                           │
│    - CalendarConflictDetectionTest                     │
│    - InboxRepositoryTest                               │
│    - SecureStorageTest                                 │
├────────────────────────────────────────────────────────┤
│ 2. Compose UI Component Tests (composeApp)             │
│    - Design System Token & GlassSurface Tests          │
│    - 8-Digit Numeric OTP Auto-Advance Test             │
│    - Command Center KPI Formatting Test                │
├────────────────────────────────────────────────────────┤
│ 3. API Contract & Security Tests                       │
│    - Next.js 8-Digit OTP Send & Verify Test            │
│    - Multi-Tenant RBAC & Cross-Org Isolation Test      │
│    - Mobile Dashboard Summary Aggregator Test          │
├────────────────────────────────────────────────────────┤
│ 4. Monorepo Regression Verification                    │
│    - Web Application TypeScript Typecheck              │
│    - Web Production Build Integrity                    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Shared Unit Tests (`mobile/shared/src/commonTest`)

### 2.1 Calendar Slot Conflict Detection Test
Validates the appointment overlap formula: `(StartA < EndB) && (EndA > StartB)`.
- **Test Case 1:** Slot inside existing appointment window $\rightarrow$ Conflict detected (BLOCKED).
- **Test Case 2:** Slot overlapping start boundary $\rightarrow$ Conflict detected (BLOCKED).
- **Test Case 3:** Slot adjacent but outside boundary $\rightarrow$ Permitted (PASSED).
- **Test Case 4:** Slot overlapping cancelled appointment $\rightarrow$ Permitted (PASSED).

### 2.2 8-Digit OTP Normalization & Verification Test
- **Test Case 1:** Numeric input with spaces `8492 0183` $\rightarrow$ normalized to `84920183` (PASSED).
- **Test Case 2:** Leading zero preservation `00123456` $\rightarrow$ exact 8-character string preserved (PASSED).
- **Test Case 3:** Incomplete code `1234` $\rightarrow$ validation rejected with `Must be 8 digits` (PASSED).
- **Test Case 4:** Max attempts exceeded (>5) $\rightarrow$ OTP invalidated, new code required (PASSED).

### 2.3 Multi-Tenant Isolation & Logout Cleanup Test
- **Test Case 1:** User logs into Workspace A $\rightarrow$ cached leads and messages tagged with `userId = A`.
- **Test Case 2:** User logs out $\rightarrow$ `database.clearAllTenantData("A")` and `secureStorage.clearAll()` executed.
- **Test Case 3:** Subsequent query for `userId = A` returns empty list (0 records leaked).

---

## 3. Web Monorepo Integrity Verification

To guarantee that mobile scaffold and backend additions do not damage the live Next.js web application:

```bash
# 1. Typecheck the entire Next.js codebase
npm run typecheck

# 2. Verify security and secret scanning
npm run scan:secrets

# 3. Verify real data integrity and RBAC
npm run test:security
npm run test:integrity
```

---

## 4. Mobile Build Verification Commands

### Android Builds:
```bash
cd mobile

# Compile Shared Multiplatform Library (Debug & Release)
./gradlew :shared:assemble

# Compile Android Application Debug APK
./gradlew :composeApp:assembleDebug

# Compile Android Application Production Release APK
./gradlew :composeApp:assembleRelease
```

### iOS Builds:
In accordance with Rule 19, iOS builds must be executed on a macOS environment with Xcode installed:
```bash
cd mobile

# Generate iOS Framework (macOS only)
./gradlew :composeApp:embedAndSignAppleFrameworkForXcode

# Open native iOS shell in Xcode
open iosApp/iosApp.xcodeproj
```
*(On Windows 11 development machines, Kotlin/Native automatically disables native iOS linker targets cleanly without failing the build).*
