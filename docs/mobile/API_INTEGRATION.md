# STARX FLOW MOBILE — API INTEGRATION SPECIFICATION
**Document Reference:** `docs/mobile/API_INTEGRATION.md`  
**Phase:** Phase 13 — Backend Integration & Mobile Aggregator  
**Protocol:** HTTPS / JSON REST API + Supabase PostgREST  
**Security Standard:** Bearer JWT + Tenant Isolation + HMAC-SHA256 Idempotency  

---

## 1. Network Topography & Base URLs

- **Production API Gateway:** `https://starx-flow.runs-on.dev`
- **Development/Local API Gateway:** `http://10.0.2.2:3000` (Android Emulator) / `http://localhost:3000` (iOS Simulator)
- **Supabase Cloud Endpoint:** `https://iotuxpcqewdzvqzncpad.supabase.co`

### Standard Headers
All authenticated requests from the mobile application must supply:
```http
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
Accept: application/json
X-Client-Platform: Android | iOS
X-Client-Version: 1.0.0
```

For Supabase PostgREST requests:
```http
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <supabase_access_token>
```

---

## 2. Authentication & Session Contracts

### 2.1 Request 8-Digit Verification OTP
- **Endpoint:** `POST /api/auth/otp/send`
- **Authentication:** Public
- **Request Body:**
```json
{
  "email": "owner@acme-business.com",
  "purpose": "login",
  "metadata": {
    "device_platform": "Android"
  }
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "An 8-digit verification code has been sent to your email.",
  "expiresAt": "2026-11-14T11:45:00.000Z"
}
```

### 2.2 Verify 8-Digit OTP & Provision Session
- **Endpoint:** `POST /api/auth/otp/verify`
- **Authentication:** Public
- **Request Body:**
```json
{
  "email": "owner@acme-business.com",
  "code": "84920183"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "usr_9918237192",
    "email": "owner@acme-business.com",
    "name": "Alex Vance",
    "businessName": "Acme Innovations",
    "businessType": "Technology",
    "role": "owner",
    "onboardingComplete": true
  },
  "tokenHash": "pkce_hash_9a8f27b...",
  "emailOtp": "84920183",
  "isNewUser": false
}
```

### 2.3 Supabase Session Exchange
- **Endpoint:** `POST https://iotuxpcqewdzvqzncpad.supabase.co/auth/v1/verify`
- **Headers:** `apikey: <anon_key>`
- **Request Body:**
```json
{
  "token_hash": "pkce_hash_9a8f27b...",
  "type": "email"
}
```
- **Response (200 OK):** Returns `{ "access_token": "...", "refresh_token": "...", "expires_in": 3600 }`.

---

## 3. High-Performance Mobile Aggregator

### 3.1 Mobile Dashboard Summary
- **Endpoint:** `GET /api/mobile/v1/dashboard/summary`
- **Authentication:** Required (`Bearer <token>`)
- **Purpose:** Compresses 5 database round-trips into a single ~40ms network response for mobile devices.
- **Response (200 OK):**
```json
{
  "success": true,
  "summary": {
    "totalRevenue": 2450.0,
    "activeLeadsCount": 18,
    "upcomingBookingsCount": 6,
    "activeAgentsCount": 4,
    "revenueTrend": [
      { "label": "Mon", "value": 320.0 },
      { "label": "Tue", "value": 450.0 },
      { "label": "Wed", "value": 580.0 },
      { "label": "Thu", "value": 310.0 },
      { "label": "Fri", "value": 790.0 },
      { "label": "Sat", "value": 240.0 },
      { "label": "Sun", "value": 180.0 }
    ],
    "leadTrend": [
      { "label": "Mon", "value": 3.0 },
      { "label": "Tue", "value": 5.0 },
      { "label": "Wed", "value": 4.0 },
      { "label": "Thu", "value": 2.0 },
      { "label": "Fri", "value": 4.0 },
      { "label": "Sat", "value": 1.0 },
      { "label": "Sun", "value": 1.0 }
    ],
    "recentConversations": [
      {
        "id": "conv_84927",
        "userId": "usr_9918237192",
        "customerName": "Elena Rostova",
        "channel": "WhatsApp",
        "status": "active",
        "controlMode": "ai",
        "unreadCount": 1,
        "lastMessage": "Can I confirm pricing for the enterprise tier?",
        "lastMessageAt": "2026-11-14T10:55:00.000Z"
      }
    ]
  }
}
```

---

## 4. Unified Communications (Omnichannel Inbox)

### 4.1 List Conversations
- **Endpoint:** `GET /api/conversations?channel=WhatsApp&status=active`
- **Authentication:** Required (`Bearer <token>`)
- **Query Params:** `channel`, `status`, `search`, `assignedTo`
- **Response (200 OK):**
```json
{
  "conversations": [
    {
      "id": "conv_84927",
      "user_id": "usr_9918237192",
      "customer_name": "Elena Rostova",
      "customer_phone": "+491701234567",
      "customer_email": "elena@example.com",
      "channel": "WhatsApp",
      "status": "active",
      "control_mode": "ai",
      "handoff_reason": null,
      "unread_count": 1,
      "last_message": "Can I confirm pricing for the enterprise tier?",
      "last_message_at": "2026-11-14T10:55:00.000Z"
    }
  ],
  "total": 1
}
```

### 4.2 Send Message / Outbound Dispatch
- **Endpoint:** `POST /api/conversations/{id}/messages`
- **Authentication:** Required (`Bearer <token>`)
- **Headers:** `Idempotency-Key: <unique_uuid>`
- **Request Body:**
```json
{
  "content": "Hello Elena, our enterprise tier includes dedicated 24/7 AI agents and custom RAG training.",
  "role": "human",
  "isInternal": false
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": { "id": "msg_00192", "content": "..." },
  "deliveredToCustomer": true,
  "deduplicated": false
}
```

### 4.3 Update Conversation Controls (AI / Human Mode)
- **Endpoint:** `PATCH /api/conversations/{id}`
- **Authentication:** Required (`Bearer <token>`)
- **Request Body:**
```json
{
  "control_mode": "human",
  "handoff_reason": "Staff taking over customer inquiry from mobile command center"
}
```
- **Response (200 OK):** Returns `{ "success": true, "conversation": { ... } }`.

---

## 5. Mobile Push Notifications

### 5.1 Register Device Token
- **Endpoint:** `POST /api/mobile/v1/notifications/register`
- **Authentication:** Required (`Bearer <token>`)
- **Request Body:**
```json
{
  "token": "fcm_or_apns_device_token_string",
  "platform": "android"
}
```
- **Response (200 OK):** Returns `{ "success": true, "message": "Device push notification token registered successfully" }`.

---

## 6. Orders & Operations

### 6.1 List Orders
- **Endpoint:** `GET /api/orders`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):** Returns `{ "orders": [ ... ] }`.

### 6.2 Create Order
- **Endpoint:** `POST /api/orders`
- **Authentication:** Required (`Bearer <token>`)
- **Headers:** `Idempotency-Key: <unique_uuid>`
- **Request Body:**
```json
{
  "customerName": "Elena Rostova",
  "customerPhone": "+491701234567",
  "items": [
    { "name": "StarX Flow Business OS Setup", "quantity": 1, "price": 499.0 }
  ],
  "status": "pending",
  "paymentStatus": "paid"
}
```
- **Response (200 OK):** Returns `{ "order": { "id": "ord_812", ... }, "deduplicated": false }`.
