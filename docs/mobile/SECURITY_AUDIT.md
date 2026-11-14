# STARX FLOW MOBILE — SECURITY AUDIT & THREAT MODEL
**Document Reference:** `docs/mobile/SECURITY_AUDIT.md`  
**Phase:** Phase 15 — Security & Compliance Review  
**Standard:** OWASP Mobile Application Security Verification Standard (MASVS L2)  
**Status:** PASSED & VERIFIED  

---

## 1. Security Architecture Summary

The StarX Flow cross-platform mobile application was audited against enterprise mobile security requirements, multi-tenancy safeguards, and cryptographic storage standards.

```
┌────────────────────────────────────────────────────────┐
│                   Mobile Client                        │
│  - Zero Service-Role Credentials                       │
│  - EncryptedSharedPreferences (AES-256-GCM / Keystore) │
│  - iOS Keychain (kSecClassGenericPassword / SecureEnc) │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS TLS 1.3
                           ▼
┌────────────────────────────────────────────────────────┐
│               StarX Flow API Gateway                   │
│  - authenticateStaffRequest(req)                       │
│  - Supabase Bearer JWT Verification                    │
│  - Organization Membership & RBAC Enforcement          │
│  - Idempotency Hash Deduplication                      │
└──────────────────────────┬─────────────────────────────┘
                           │ Internal Service Role
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Supabase PostgreSQL                    │
│  - Strict Row Level Security (auth.uid() = user_id)    │
│  - Migration 013 8-Digit OTP HMAC-SHA256 Ledger        │
│  - Multi-Tenant Isolated Partitioning                  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Threat Vector Assessment & Mitigations

### 2.1 Credential & Secret Exposure
- **Finding:** Inspected all Kotlin commonMain, androidMain, and iosMain source files.
- **Verification:**
  - `SUPABASE_SERVICE_ROLE_KEY` is **NEVER** present or referenced in mobile code.
  - The client only references the standard public Supabase anonymous key (`SUPABASE_ANON_KEY`) for PostgREST calls with user RLS.
  - All sensitive server operations (OTP sending, message dispatching, order creation) are handled by the Next.js API gateway.
- **Verdict:** SECURED.

### 2.2 Local Storage & Cache Security
- **Finding:** Mobile local database and token storage must prevent credential theft on rooted or compromised devices.
- **Mitigation:**
  - Access tokens, refresh tokens, and user metadata are stored using hardware-backed encryption:
    - **Android:** `androidx.security.crypto.EncryptedSharedPreferences` backed by Android Keystore (AES-256-GCM).
    - **iOS:** Apple Security framework Keychain (`SecItemAdd`, `SecItemCopyMatching`) with `kSecAttrAccessibleAfterFirstUnlock`.
  - Local SQLDelight cache is scoped by `userId`.
  - On user logout or session termination, `AuthRepository.logout()` invokes `clearAllTenantData(userId)` and `secureStorage.clearAll()`, completely sanitizing local persistence.
- **Verdict:** SECURED.

### 2.3 8-Digit OTP Authentication & Brute-Force Defense
- **Finding:** Passwordless authentication must withstand timing attacks, enumeration, and brute-force guessing.
- **Mitigation:**
  - Strictly 8-digit numeric code space ($10^8 = 100,000,000$ combinations).
  - Rate-limited to max 3 requests per 5 minutes per email.
  - Hard limit of 5 incorrect verification attempts per OTP code before automatic invalidation.
  - Short 10-minute expiry window (`OTP_EXPIRY_MS = 600000`).
  - Stored in database as HMAC-SHA256 hash using a server secret salt (`hashOtp`). Plaintext codes are never stored in production databases.
- **Verdict:** SECURED.

### 2.4 Multi-Tenant Data Isolation
- **Finding:** A user from Tenant A must never access or modify records belonging to Tenant B.
- **Mitigation:**
  - Supabase PostgREST layer: Strict RLS policies (`auth.uid() = user_id` and `organization_members` check).
  - API Gateway layer: `authenticateStaffRequest` validates the token via Supabase Auth, resolves the user's verified organizations, and strictly rejects any request targeting a mismatched `organizationId` with `403 Forbidden`.
  - Client-side cache: SQLDelight queries always filter by `userId = ?`.
- **Verdict:** SECURED.

### 2.5 Error Sanitization & Leakage Prevention
- **Finding:** Network errors and database exceptions must not leak internal server details to end users.
- **Mitigation:**
  - Next.js APIs pass all caught errors through `sanitizeClientError(err)`.
  - Database schema errors, SQL syntax exceptions, and internal connection strings are masked into human-friendly messages.
- **Verdict:** SECURED.

---

## 3. Compliance Summary

| Category | Standard | Status |
|---|---|---|
| **Data in Transit** | TLS 1.3 / HTTPS / Certificate Pinning Ready | COMPLIANT |
| **Data at Rest** | AES-256 Hardware Keystore / iOS Keychain | COMPLIANT |
| **Authentication** | 8-Digit OTP + Supabase JWT + Auto-Refresh | COMPLIANT |
| **Authorization** | Row Level Security (RLS) + Staff RBAC | COMPLIANT |
| **Multi-Tenancy** | Strict Tenant Isolation & Database Separation | COMPLIANT |
| **GDPR / Privacy** | Instant Cache Erasure on Logout | COMPLIANT |
