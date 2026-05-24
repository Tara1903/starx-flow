# Webhook Flow Architecture

## Objective
Establish a reliable, serverless, and asynchronous pipeline for processing incoming WhatsApp messages via Meta Webhooks.

## Architecture Pipeline

### 1. Ingestion (Vercel Serverless API)
- **Endpoint:** `POST /api/whatsapp-webhook`
- **Action:** Receives payload from Meta. Parses the structure (`entry.changes.value.messages`).
- **Constraint:** Meta requires a `200 OK` response within 3 seconds. The Vercel function immediately inserts the raw payload into a Supabase `inbound_messages` table and returns `200 OK`.

### 2. Queueing (Supabase Tables)
- **Table:** `inbound_messages`
- **Columns:** `id`, `user_id`, `from_phone`, `message_text`, `status` (pending/processing/completed/failed), `created_at`.
- **Purpose:** Decouples ingestion from execution, preventing timeouts and ensuring no messages are lost if the AI provider is slow.

### 3. Execution (AI Processor)
- **Trigger:** A Supabase Database Webhook (`pg_net`) or a scheduled Vercel Cron fires when a new row is pending.
- **Action:** Triggers `/api/ai-processor`.
- **Logic:** 
  1. Fetches the active workflow rules for the `user_id`.
  2. Queries the Gemini/Nvidia LLM.
  3. Formulates the response.
  4. Marks the row as `completed`.

### 4. Reply (Meta Graph API)
- **Action:** The `ai-processor` calls the Meta Provider `send()` function, delivering the AI response back to the customer's WhatsApp instance.
