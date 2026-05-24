# Serverless Architecture Migration V2 (Worker-less)

This document outlines the revised architecture to completely eliminate the laptop/worker runtime dependency and move to a pure serverless infrastructure.

## 1. Architectural Objective
**Target:** Frontend (Vercel) → Vercel API → Supabase
- **Eliminate `whatsapp-server`:** The Node.js Baileys WebSocket worker is permanently deprecated as a production requirement.
- **Transition to Official Cloud API:** All WhatsApp communication will migrate to the Official Meta WhatsApp Cloud API. The application already contains the webhook and send logic (`whatsapp-webhook` and `ai-processor`) required for this.
- **No Localhost References:** The React frontend will stop polling `http://localhost:10000`. Setup will be done entirely through Vercel API calls to Supabase.

---

## 2. WhatsApp Orchestration Strategy

To replace the persistent worker with a serverless architecture, we will decouple the system into three layers:

1. **Vercel API (Ingestion):** 
   Meta sends incoming messages via HTTP POST to `https://<vercel-domain>.vercel.app/api/whatsapp-webhook`. Vercel parses the payload and immediately acknowledges Meta with a `200 OK` (required within 3 seconds).
2. **Supabase Tables (State & Queue):** 
   Instead of processing the AI response synchronously (which risks Vercel timeouts), the webhook inserts the raw message into an `inbound_messages` queue table in Supabase.
3. **Scheduled Execution / Trigger (Processing):** 
   Supabase Database Webhooks (`pg_net`) or a Vercel Cron Job automatically triggers `api/ai-processor` the moment a new row is inserted, processing the AI logic asynchronously and sending the reply back via Meta's Graph API.

*Note: Supabase Edge Functions will be kept ONLY if Vercel's Serverless timeout limits (e.g., 10-15s on standard tiers) become too restrictive or expensive for long AI generation tasks.*

---

## 3. Migration Phasing & Classification

### A. Immediate Migration (API Unification)
- **Action:** Move the code in `supabase/functions/` (specifically `whatsapp-webhook`, `stripe-webhook`, and `ai-processor`) directly into Vercel Serverless Functions (`api/` directory).
- **UI Update:** Remove the QR-code scanning UI from `WhatsAppStep.tsx` and `IntegrationModal.tsx`. Replace it with input fields for `Phone Number ID` and `Meta Access Token` (mirroring the current Instagram setup).
- **Outcome:** The app becomes 100% cloud-native immediately. No background workers are required.

### B. Temporary Local Fallback (Development & Legacy)
- **Action:** The `whatsapp-server` code is retained but strictly isolated as a local development tool or a legacy fallback for users unable to secure Meta Business Verification.
- **Implementation:** It is removed from all production deployment instructions and CI/CD pipelines. It will only run locally via explicit opt-in scripts, bypassing Vercel completely.

### C. Future Extraction (Asynchronous Decoupling)
- **Action:** Implement the `inbound_messages` Supabase table and Database Webhook triggers.
- **Implementation:** 
  1. Webhooks write to Supabase.
  2. Postgres Trigger calls `api/process-queue` (or Supabase Edge Function if cheaper/faster).
  3. AI completes execution and calls Meta Graph API to send the response to the user.
- **Outcome:** Bulletproof reliability. Webhooks never timeout, and AI failures can be automatically retried by the queue processor.
