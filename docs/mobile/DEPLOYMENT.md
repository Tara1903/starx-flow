# STARX FLOW MOBILE — PRODUCTION DEPLOYMENT MANUAL
**Document Reference:** `docs/mobile/DEPLOYMENT.md`  
**Phase:** Phase 17 — Production Preparation  
**Target Release:** Android (Google Play) & iOS (App Store)  

---

## 1. Release Architecture & Versioning

The StarX Flow mobile application adheres to Semantic Versioning (`MAJOR.MINOR.PATCH`):

- **Application ID:** `com.starxflow.mobile`
- **Bundle Identifier:** `com.starxflow.mobile`
- **Initial Release:** `1.0.0` (Build `1`)
- **Compatibility Guarantee:** Backward compatible with existing StarX Flow web platform and Supabase schema migrations 001 through 013.

---

## 2. Environment Matrix

| Environment | API Gateway URL | Supabase URL | Log Level |
|---|---|---|---|
| **Development** | `http://10.0.2.2:3000` / `http://localhost:3000` | Dev / Local Instance | `ALL` / Debug |
| **Staging** | `https://staging-api.starxflow.com` | Staging Instance | `INFO` |
| **Production** | `https://starx-flow.runs-on.dev` | Production Instance | `WARN` / `ERROR` |

---

## 3. Google Play Store Release Pipeline

### 3.1 Pre-Release Checklist
1. Verify `versionCode` and `versionName` in `mobile/composeApp/build.gradle.kts`.
2. Generate signing Keystore:
   ```bash
   keytool -genkey -v -keystore starx-release.keystore -alias starx-key -keyalg RSA -keysize 2048 -validity 10000
   ```
3. Set environment variables in CI/CD pipeline:
   - `KEYSTORE_PASSWORD`
   - `KEY_ALIAS`
   - `KEY_PASSWORD`
4. Assemble release bundle:
   ```bash
   cd mobile
   ./gradlew :composeApp:bundleRelease
   ```
5. Upload `.aab` file to **Google Play Console > Production (or Internal Testing)**.

### 3.2 Required Store Metadata
- **App Name:** StarX Flow — AI Business Operating System
- **Short Description:** Automate your business communications, bookings, and customer workflows with AI.
- **Category:** Business / Productivity
- **Content Rating:** Everyone (PEGI 3)

---

## 4. Apple App Store & TestFlight Release Pipeline

### 4.1 Pre-Release Checklist
1. Generate Apple Distribution Certificate and Provisioning Profile in Apple Developer Portal.
2. Configure App ID: `com.starxflow.mobile` with Push Notifications and Associated Domains entitlements.
3. Open `iosApp` in Xcode on macOS:
   - Set Code Signing to Apple Distribution.
   - Run **Product > Archive**.
   - Validate and upload archive to **App Store Connect**.
4. Distribute build to internal TestFlight group.
5. Submit for Apple App Review after QA sign-off.

---

## 5. Push Notification Infrastructure Setup

### 5.1 Android (Firebase Cloud Messaging)
1. In Firebase Console, create project `starx-flow-mobile` and register Android package `com.starxflow.mobile`.
2. Download `google-services.json` and place in `mobile/composeApp/`.
3. Mobile app registers FCM device token via `POST /api/mobile/v1/notifications/register`.

### 5.2 iOS (Apple Push Notification Service - APNs)
1. In Apple Developer Console, create an APNs Authentication Key (.p8).
2. Configure Key ID and Team ID in StarX Flow notification server.
3. iOS app receives APNs device token in `AppDelegate` and sends to `/api/mobile/v1/notifications/register`.

---

## 6. Zero Downtime Backend Compatibility

To ensure existing web clients and mobile clients operate simultaneously without disruption:
1. All database migrations must remain additive. Destructive column removals are prohibited.
2. New mobile aggregator endpoints reside in dedicated versioned namespaces (`/api/mobile/v1/...`).
3. 8-digit OTP endpoints maintain strict backward compatibility with existing web signup modals.
